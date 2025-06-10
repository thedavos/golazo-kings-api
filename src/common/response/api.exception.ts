import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpStatus,
  HttpException,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { ErrorResponseDto } from './error-response.dto';

@Catch(HttpException)
export class ApiExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(ApiExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status: number;
    let title: string;
    let detail: string;
    const extensions: Record<string, any> = {};

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'string') {
        title = exceptionResponse;
        detail = exceptionResponse;
      } else if (
        typeof exceptionResponse === 'object' &&
        exceptionResponse !== null
      ) {
        const resp = exceptionResponse as Record<string, any>;
        title = (resp.error || resp.message || exception.message) as string;
        detail = (resp.detail || resp.error || exception.message) as string;

        // Agregar información de validación si existe
        if (resp.errors && Array.isArray(resp.errors)) {
          extensions.errors = resp.errors;
          detail = 'Validation failed';
        }
      } else {
        title = exception.message;
        detail = exception.message;
      }
    } else if (exception instanceof Error) {
      status = HttpStatus.INTERNAL_SERVER_ERROR;
      title = 'Internal Server Error';
      detail =
        process.env.NODE_ENV === 'development'
          ? exception.message
          : 'An unexpected error occurred';

      // En desarrollo, agregar stack trace
      if (process.env.NODE_ENV === 'development') {
        extensions.stack = exception.stack;
      }
    } else {
      status = HttpStatus.INTERNAL_SERVER_ERROR;
      title = 'Internal Server Error';
      detail = 'An unexpected error occurred';
    }

    const errorResponse: ErrorResponseDto = {
      title,
      status,
      detail,
      type: this.getProblemType(status),
      instance: request.url,
      timestamp: new Date().toISOString(),
      path: request.path,
      method: request.method,
      ...extensions,
    };

    this.logger.error(
      `Error: ${request.method} ${request.path} - ${status} - ${title}`,
      exception instanceof Error ? exception.stack : exception,
    );

    response.setHeader('Content-Type', 'application/problem+json');
    response.status(status).json(errorResponse);
  }

  private getProblemType(status: number): string {
    return `https://httpstatuses.com/${status}`;
  }
}
