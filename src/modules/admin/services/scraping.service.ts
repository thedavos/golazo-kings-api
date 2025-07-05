import * as cheerio from 'cheerio';
import { Element } from 'domhandler';
import { firstValueFrom } from 'rxjs';
import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { fail, success, Result } from '@/common/result.common';
import { some, none, Option } from '@common/maybe';
import { TeamsService } from '@/modules/teams/teams.service';
import {
  SupportedLeagueKey,
  getSupportedLeague,
} from '@/modules/admin/domain/value-objects/supported-leagues.enum';
import { ScrapedTeamDto } from '@/modules/admin/dtos/scraped-team.dto';
import { ScrapedLeagueDto } from '@modules/admin/dtos/scraped-league.dto';
import { ScrapedPlayerBodyDto } from '@modules/admin/dtos/scraped-player-body.dto';
import { ScrapedPlayerDto } from '@modules/admin/dtos/scraped-player.dto';
import { parsePlayerName } from '@modules/players/utils/parsePlayerName.util';

@Injectable()
export class ScrapingService {
  private readonly logger = new Logger(ScrapingService.name);
  private readonly kingsLeagueBaseUrl: string;
  private readonly queensLeagueBaseUrl: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly teamService: TeamsService,
    private readonly configService: ConfigService,
  ) {
    this.kingsLeagueBaseUrl = this.configService.getOrThrow<string>(
      'admin.kingsLeagueBaseUrl',
    );

    this.queensLeagueBaseUrl = this.configService.getOrThrow<string>(
      'admin.queensLeagueBaseUrl',
    );
  }

  private getKingsBaseUrl(league: SupportedLeagueKey): string {
    return league.includes('QUEENS')
      ? this.queensLeagueBaseUrl
      : this.kingsLeagueBaseUrl;
  }

  private getKingsPlayersUrl(
    referenceTeamUrl: string,
    isQueensLeague: boolean,
    region?: string,
    season?: string,
    split?: number,
  ) {
    const url = isQueensLeague
      ? this.queensLeagueBaseUrl
      : this.kingsLeagueBaseUrl;

    const urlSearchParams = new URLSearchParams(
      `${url}/es/equipos/${referenceTeamUrl}`,
    );

    if (region) {
      urlSearchParams.append('region', region);
    }

    if (season) {
      urlSearchParams.append('season', season);
    }

    if (split) {
      urlSearchParams.append('split', split.toString());
    }

    return urlSearchParams.toString();
  }

  private getKingsTeamsUrl(leagueSlug: SupportedLeagueKey) {
    try {
      const kingsTeamsUrl = getSupportedLeague(leagueSlug)
        .map(
          (league) => `${this.getKingsBaseUrl(leagueSlug)}/${league}/equipos`,
        )
        .getOrThrow(() => new BadRequestException(leagueSlug));

      return success(kingsTeamsUrl);
    } catch (e) {
      const error = e as Error;
      return fail<string, Error>(error);
    }
  }

  /**
   * Método privado para obtener el contenido HTML de una URL.
   * Encapsula la lógica de la petición HTTP y manejo básico de errores.
   * @param url La URL completa a la que hacer la petición.
   * @returns Promesa que resuelve a Result<string, Error> (HTML en éxito, Error en fallo).
   */
  private async fetchHtml(url: string): Promise<Result<string, Error>> {
    this.logger.log(`Workspaceing URL: ${url}`);
    try {
      const response = await firstValueFrom(
        this.httpService.get(url /*, options */),
      );

      // Verificar código de estado HTTP
      if (response.status < 200 || response.status >= 300) {
        const error = new Error(
          `HTTP Error ${response.status} fetching ${url}`,
        );
        this.logger.error(error.message);
        return fail(error); // Retorna fallo con el error HTTP
      }

      const html = response.data as string; // Asumimos que response.data es string
      this.logger.verbose(
        `Successfully fetched HTML (${html.length} bytes) from ${url}`,
      );
      return success(html); // Retorna éxito con el HTML
    } catch (e) {
      // Manejar errores de red, timeout, etc.
      const error =
        e instanceof Error
          ? e
          : new Error(`Unknown error fetching ${url}: ${e}`);
      this.logger.error(`Failed to fetch HTML from ${url}`, error.stack);
      return fail(error); // Retorna fallo con el error de la petición
    }
  }

  async scrapeTeams(
    leagueSlug: SupportedLeagueKey,
    leagueDto: ScrapedLeagueDto,
  ) {
    const kingsTeamsUrl = this.getKingsTeamsUrl(leagueSlug);
    const fetchResult = await this.fetchHtml(kingsTeamsUrl.value);

    if (fetchResult.isFail) {
      this.logger.error(
        `Failed to fetch HTML for ${leagueSlug}. Aborting processing.`,
      );

      return fetchResult;
    }

    const html = fetchResult.value;

    const teamDataResult = this.extractTeamData(html, leagueDto);

    this.logger.log(
      `Scraping process completed for league: ${leagueSlug}. Result: ${teamDataResult.isSuccess ? 'Success' : 'Failure'}`,
    );

    return teamDataResult;
  }

  async scrapePlayers(scrapedPlayerBody: ScrapedPlayerBodyDto) {
    const kingsPlayersUrl = this.getKingsPlayersUrl(
      scrapedPlayerBody.referenceTeamUrl,
      scrapedPlayerBody.isQueensLeague,
    );
    const fetchResult = await this.fetchHtml(kingsPlayersUrl);

    if (fetchResult.isFail) {
      this.logger.error(
        `Failed to fetch HTML for ${scrapedPlayerBody.referenceTeamUrl} url. Aborting processing.`,
      );

      return fetchResult;
    }

    const html = fetchResult.value;
    const playersDataResult = this.extractPlayersData(html);

    this.logger.log(
      `Scraping process completed for players url: ${scrapedPlayerBody.referenceTeamUrl}. Result: ${playersDataResult.isSuccess ? 'Success' : 'Failure'}`,
    );

    return playersDataResult;
  }

  private extractPlayersData(html: string) {
    this.logger.log('Processing HTML to extract players data.');
    const players = [] as ScrapedPlayerDto[];

    try {
      const $ = cheerio.load(html);
      const playersElements = $('.player-card-content');

      if (playersElements.length === 0) {
        this.logger.warn(
          'No player elements found with the selector ".player-card-content".',
        );

        return success([]);
      }

      playersElements.each((index, element) => {
        try {
          const $element = $(element);

          const playerName = this.extractContent(
            $element,
            '.player-name',
          ).getOrThrow(() => {
            this.logger.warn(
              `Missing required data for team element at index ${index}. Skipping.`,
            );

            return new Error(
              `Unable to extract team element at index ${index}.`,
            );
          });

          const { firstName, lastName, nickname } = parsePlayerName(playerName);

          const playerPosition = this.extractContent(
            $element,
            '.player-role',
          ).getOrThrow(
            () =>
              new Error(`Unable to extract player position at index ${index}.`),
          );

          const isPlayerWildCard = this.extractAttribute(
            $element,
            '.player-category-only-icon',
            'data-pd-tooltip',
          )
            .map((value) => !!value)
            .getOrElse(false);

          const scrapedPlayerDto = new ScrapedPlayerDto();
          scrapedPlayerDto.name = playerName;
          scrapedPlayerDto.firstName = firstName;
          scrapedPlayerDto.lastName = lastName;
          scrapedPlayerDto.position = playerPosition;
          scrapedPlayerDto.isWildCard = isPlayerWildCard;

          if (nickname) {
            scrapedPlayerDto.nickname = nickname;
          }

          players.push(scrapedPlayerDto);
        } catch (innerError) {
          const err =
            innerError instanceof Error
              ? innerError
              : new Error(
                  `Unknown error processing player element at index ${index}: ${innerError}`,
                );

          this.logger.error(
            `Error processing player element at index ${index}`,
            err.stack,
          );
        }
      });

      this.logger.verbose(`Successfully extracted ${players.length} players.`);

      return success(players);
    } catch (e) {
      const error =
        e instanceof Error ? e : new Error(`Failed to process HTML: ${e}`);
      this.logger.error(`Error during HTML processing`, error.stack);

      return fail<null, Error>(error);
    }
  }

  private extractTeamData(html: string, leagueDto: ScrapedLeagueDto) {
    this.logger.log('Processing HTML to extract team data.');
    const teams = [] as ScrapedTeamDto[];

    try {
      const $ = cheerio.load(html);
      const teamElements = $('section.kql-w-container .team-card-container');

      if (teamElements.length === 0) {
        this.logger.warn(
          'No team elements found with the selector ".team-card".',
        );

        return success([]);
      }

      teamElements.each((index, element) => {
        try {
          const $element = $(element);

          const teamName = this.extractContent(
            $element,
            '.team-name',
          ).getOrThrow(() => {
            this.logger.warn(
              `Missing required data for team element at index ${index}. Skipping.`,
            );

            return new Error(
              `Unable to extract team element at index ${index}.`,
            );
          });

          const teamReferenceId = this.extractAttribute(
            $element,
            'a.h-full',
            'href',
          )
            .map((value) => value.split('/').pop()?.split('-').shift())
            .map((value) => (value ? parseInt(value) : value))
            .toNullable();

          const teamReferenceUrl = this.extractAttribute(
            $element,
            'a.h-full',
            'href',
          )
            .map((value) => value.split('/').pop())
            .toNullable();

          const teamLogo = this.extractAttribute(
            $element,
            '.container-logo-img img',
            'src',
          )
            .map<string>((value) => `https://kingsleague.pro${value}`)
            .toNullable();

          teams.push(
            new ScrapedTeamDto(
              teamName,
              leagueDto.leagueId,
              teamLogo,
              teamReferenceId as number,
              teamReferenceUrl,
            ),
          );
        } catch (innerError) {
          // Manejar errores durante la extracción de un solo equipo
          const err =
            innerError instanceof Error
              ? innerError
              : new Error(
                  `Unknown error processing team element at index ${index}: ${innerError}`,
                );
          this.logger.error(
            `Error processing team element at index ${index}`,
            err.stack,
          );
          // Podrías decidir fallar todo el proceso si un solo error es crítico,
          // o simplemente loguear y omitir este equipo (como en este ejemplo).
        }
      });

      this.logger.verbose(`Successfully extracted ${teams.length} teams.`);

      return success(teams);
    } catch (e) {
      const error =
        e instanceof Error ? e : new Error(`Failed to process HTML: ${e}`);
      this.logger.error(`Error during HTML processing`, error.stack);

      return fail(error);
    }
  }

  private extractContent(
    element: cheerio.Cheerio<Element>,
    selector: string,
  ): Option<string> {
    const selectedElement = element.find(selector);

    if (selectedElement.length > 0) {
      const text = selectedElement.first().text().trim();
      if (text.length > 0) {
        return some(text);
      }
    }

    return none<string>();
  }

  private extractAttribute(
    element: cheerio.Cheerio<Element>,
    selector: string,
    attributeName: string,
  ): Option<string> {
    const selectedElement = element.find(selector);

    if (selectedElement.length === 0) {
      return none<string>();
    }

    const attributeValue = selectedElement.first().attr(attributeName);

    if (attributeValue && attributeValue.trim().length > 0) {
      return some(attributeValue.trim());
    }

    return none<string>();
  }
}
