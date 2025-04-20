import { ScrapingError } from '@modules/admin/errors/scraping.errors';

export class UnsupportedLeagueError extends ScrapingError {
  constructor(message: string, leagueKey: string, cause?: Error) {
    super(
      leagueKey
        ? `League ${leagueKey} is not supported or configured`
        : message,
      cause,
      { leagueKey },
    );
    this.name = 'UnsupportedLeagueError';
  }
}
