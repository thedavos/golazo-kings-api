import { firstValueFrom } from 'rxjs';
import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { AdminUrlService } from '@modules/admin/services/adminUrl.service';
import { PlayerScraperRepository } from '@modules/admin/repositories/player-scraper.repository';
import { TeamScraperRepository } from '@modules/admin/repositories/team-scraper.repository';
import { SupportedLeagueKey } from '@/modules/admin/domain/value-objects/supported-leagues.enum';
import { ScrapedLeagueDto } from '@modules/admin/dtos/scraped-league.dto';
import { ScrapedPlayerBodyDto } from '@modules/admin/dtos/scraped-player-body.dto';
import { fail, success, Result } from '@/common/result.common';

@Injectable()
export class ScrapingService {
  private readonly logger = new Logger(ScrapingService.name);

  constructor(
    private readonly httpService: HttpService,
    private readonly adminUrlService: AdminUrlService,
    private readonly teamScraperRepository: TeamScraperRepository,
    private readonly playerScraperRepository: PlayerScraperRepository,
  ) {}
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
    const kingsTeamsUrl = this.adminUrlService.getTeamsUrl(leagueSlug);
    const fetchResult = await this.fetchHtml(kingsTeamsUrl.value);

    if (fetchResult.isFail) {
      this.logger.error(
        `Failed to fetch HTML for ${leagueSlug}. Aborting processing.`,
      );

      return fetchResult;
    }

    const html = fetchResult.value;

    const teamDataResult = this.teamScraperRepository.scrapeTeams(
      html,
      leagueDto,
    );

    this.logger.log(
      `Scraping process completed for league: ${leagueSlug}. Result: ${teamDataResult.isSuccess ? 'Success' : 'Failure'}`,
    );

    return teamDataResult;
  }

  async scrapePlayers(scrapedPlayerBody: ScrapedPlayerBodyDto) {
    const kingsPlayersUrl = this.adminUrlService.getPlayersUrl(
      scrapedPlayerBody.referenceTeamUrl,
      scrapedPlayerBody.isQueensLeague,
      scrapedPlayerBody.region,
      scrapedPlayerBody.season,
      scrapedPlayerBody.split,
    );
    const fetchResult = await this.fetchHtml(kingsPlayersUrl);

    if (fetchResult.isFail) {
      this.logger.error(
        `Failed to fetch HTML for ${scrapedPlayerBody.referenceTeamUrl} url. Aborting processing.`,
      );

      return fetchResult;
    }

    const html = fetchResult.value;
    const playersDataResult = this.playerScraperRepository.scrapePlayers(html);

    this.logger.log(
      `Scraping process completed for players url: ${scrapedPlayerBody.referenceTeamUrl}. Result: ${playersDataResult.isSuccess ? 'Success' : 'Failure'}`,
    );

    return playersDataResult;
  }
}
