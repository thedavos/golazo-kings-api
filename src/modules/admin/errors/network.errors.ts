import { BaseError } from '@/common/error.common';

export class NetworkError extends BaseError {
  public readonly statusCode?: number;
  public readonly url: string;

  constructor(
    message: string,
    url: string,
    statusCode?: number,
    cause?: Error,
  ) {
    super(message, cause, { statusCode, url });
    this.name = 'NetworkError';
    this.statusCode = statusCode;
    this.url = url;
  }
}
