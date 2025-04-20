import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { fail, success } from '@/common/result.common';
import { TeamsService } from '@/modules/teams/teams.service';
import {
  SUPPORTED_LEAGUES,
  SupportedLeagueKey,
} from '@/modules/admin/domain/value-objects/supported-leagues.enum';

@Injectable()
export class ScrapingService {
  private readonly logger = new Logger(ScrapingService.name);
  private readonly kingsLeagueBaseUrl: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly teamService: TeamsService,
    private readonly configService: ConfigService,
  ) {
    this.kingsLeagueBaseUrl = this.configService.getOrThrow<string>(
      'admin.kingsLeagueBaseUrl',
    );
  }

  async scrape(leagueKey: SupportedLeagueKey) {
    const leaguePath = SUPPORTED_LEAGUES[leagueKey];

    if (!leaguePath) {
      this.logger.warn(
        `Unsupported league requested for scraping: ${leagueKey}`,
      );
      return fail(new Error(leagueKey));
    }

    const url = `${this.kingsLeagueBaseUrl}/${leaguePath}/equipos`;
    this.logger.log(
      `Starting scraping for league: ${leagueKey} from URL: ${url}`,
    );

    let html: string;
    try {
      const response = await firstValueFrom(
        this.httpService.get(url /*, options */),
      );
      if (response.status < 200 || response.status >= 300) {
        this.logger.error(`HTTP Error ${response.status} fetching ${url}`);
        return fail(new Error(`Received HTTP status ${response.status}`));
      }

      html = response.data as string;
      this.logger.verbose(
        `Successfully fetched HTML (${html.length} bytes) for ${leagueKey}`,
      );
      return success(html);
    } catch (e) {
      const error = e as Error;
      this.logger.error(`Failed to fetch HTML from ${url}`, error?.stack);
      return fail<boolean, Error>(error);
    }
  }
}
