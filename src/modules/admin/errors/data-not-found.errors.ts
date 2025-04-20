import { BaseError } from '@/common/error.common';

export class DataNotFoundError extends BaseError {
  public readonly url: string;
  public readonly description: string; // e.g., "Lista de presidentes"

  constructor(
    message: string,
    url: string,
    description: string,
    cause?: Error,
  ) {
    super(message, cause, { url, description });
    this.name = 'DataNotFoundError';
    this.url = url;
    this.description = description;
  }
}
