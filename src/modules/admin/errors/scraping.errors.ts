import { BaseError } from '@/common/error.common';

export class ScrapingError extends BaseError {}

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

export class ParsingError extends BaseError {
  constructor(
    message: string,
    cause?: Error,
    context?: Record<string, unknown>,
  ) {
    super(message, cause, context);
    this.name = 'ParsingError';
  }
}
