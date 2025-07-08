import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  getSupportedLeague,
  SupportedLeagueKey,
} from '@modules/admin/domain/value-objects/supported-leagues.enum';
import { fail, success } from '@common/result.common';

@Injectable()
export class AdminUrlService {
  private readonly kingsLeagueBaseUrl: string;
  private readonly queensLeagueBaseUrl: string;

  constructor(private configService: ConfigService) {
    this.kingsLeagueBaseUrl = this.configService.getOrThrow<string>(
      'admin.kingsLeagueBaseUrl',
    );

    this.queensLeagueBaseUrl = this.configService.getOrThrow<string>(
      'admin.queensLeagueBaseUrl',
    );
  }

  getUrlByLeague(league: SupportedLeagueKey): string {
    return league.includes('QUEENS')
      ? this.queensLeagueBaseUrl
      : this.kingsLeagueBaseUrl;
  }

  getBaseUrl(isQueens: boolean = false): string {
    return isQueens ? this.queensLeagueBaseUrl : this.kingsLeagueBaseUrl;
  }

  getTeamsUrl(leagueSlug: SupportedLeagueKey) {
    try {
      const kingsTeamsUrl = getSupportedLeague(leagueSlug)
        .map((league) => `${this.getUrlByLeague(leagueSlug)}/${league}/equipos`)
        .getOrThrow(() => new BadRequestException(leagueSlug));

      return success(kingsTeamsUrl);
    } catch (e) {
      const error = e as Error;
      return fail<string, Error>(error);
    }
  }

  getPlayersUrl(
    referenceTeamUrl: string,
    isQueensLeague: boolean,
    region?: number,
    season?: number,
    split?: number,
  ) {
    const url = this.getBaseUrl(isQueensLeague);

    const searchParams = new URLSearchParams();
    const teamUrl = `${url}/equipos/${referenceTeamUrl}`;

    if (region && region > 0) {
      searchParams.append('region', region.toString());
    }

    if (season && season > 0) {
      searchParams.append('season', season.toString());
    }

    if (split && split > 0) {
      searchParams.append('split', split.toString());
    }

    return searchParams.toString()
      ? `${teamUrl}?${searchParams.toString()}`
      : teamUrl;
  }
}
