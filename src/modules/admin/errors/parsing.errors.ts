import { BaseError } from '@/common/error.common';

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
