export class BaseError extends Error {
  public readonly context?: Record<string, unknown>;

  constructor(
    message: string,
    cause?: Error,
    context?: Record<string, unknown>,
  ) {
    super(message, { cause });
    this.name = this.constructor.name;
    this.context = context;
    // Mantiene el stack trace correcto
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}
