import * as cheerio from 'cheerio';
import { Injectable } from '@nestjs/common';
import { Result, success, fail } from '@/common/result.common';
import { ScrapedTeamDto } from '@/modules/admin/dtos/scraped-team.dto';
import { ScrapedLeagueDto } from '@modules/admin/dtos/scraped-league.dto';
import { SELECTORS } from '../config/scraper-selectors.config';
import { BaseScraperRepository } from './base-scraper.repository';

@Injectable()
export class TeamScraperRepository extends BaseScraperRepository {
  scrapeTeams(
    html: string,
    leagueDto: ScrapedLeagueDto,
  ): Result<ScrapedTeamDto[], Error> {
    this.logger.log('Processing HTML to extract team data.');
    const teams = [] as ScrapedTeamDto[];

    try {
      const $ = cheerio.load(html);
      const teamElements = $(SELECTORS.TEAMS.CONTAINER as cheerio.SelectorType);

      if (teamElements.length === 0) {
        this.logger.warn(
          `No team elements found with the selector "${SELECTORS.TEAMS.CONTAINER}".`,
        );

        return success([]);
      }

      teamElements.each((index, element) => {
        try {
          const $element = $(element);

          const teamName = this.extractContent(
            $element,
            SELECTORS.TEAMS.NAME,
          ).getOrThrow(
            () =>
              new Error(`Unable to extract team element at index ${index}.`),
          );

          const teamReferenceId = this.extractAttribute(
            $element,
            SELECTORS.TEAMS.LINK,
            'href',
          )
            .map((value) => value.split('/').pop()?.split('-').shift())
            .map((value) => (value ? parseInt(value) : value))
            .toNullable();

          const teamReferenceUrl = this.extractAttribute(
            $element,
            SELECTORS.TEAMS.LINK,
            'href',
          )
            .map((value) => value.split('/').pop())
            .toNullable();

          const teamLogo = this.extractAttribute(
            $element,
            SELECTORS.TEAMS.LOGO,
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
}
