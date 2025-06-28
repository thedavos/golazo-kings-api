import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpStatus,
  HttpException,
  Logger,
} from '@nestjs/common';
import { FastifyReply, FastifyRequest } from 'fastify';
import { ErrorResponseDto } from './error-response.dto';

@Catch(HttpException)
export class ApiExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(ApiExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<FastifyReply>();
    const request = ctx.getRequest<FastifyRequest>();

    let status: number;
    let title: string;
    let detail: string;
    const extensions: Record<string, any> = {};

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      title = this.getStandardTitle(status);
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'string') {
        detail = exceptionResponse;
      } else if (
        typeof exceptionResponse === 'object' &&
        exceptionResponse !== null
      ) {
        const resp = exceptionResponse as Record<string, any>;
        detail = (resp.detail || exception.message || resp.error) as string;

        // Agregar información de validación si existe
        if (resp.errors && Array.isArray(resp.errors)) {
          extensions.errors = resp.errors;
          detail = `Validation failed: ${resp.errors
            .map((err: Error) => err.message || JSON.stringify(err))
            .join(', ')}`;
        }
      } else {
        detail = exception.message;
      }
    } else if (exception instanceof Error) {
      status = HttpStatus.INTERNAL_SERVER_ERROR;
      title = 'Internal Server Error';
      detail =
        process.env.NODE_ENV === 'development'
          ? `Unexpected error: ${exception.message}`
          : 'An unexpected error occurred while processing your request';

      // En desarrollo, agregar stack trace
      if (process.env.NODE_ENV === 'development') {
        extensions.stack = exception.stack;
      }
    } else {
      status = HttpStatus.INTERNAL_SERVER_ERROR;
      title = 'Internal Server Error';
      detail = 'An unexpected error occurred while processing your request';
    }

    if (title === detail) {
      detail = `${detail}. Please check your request and try again.`;
    }

    const errorResponse: ErrorResponseDto = {
      title,
      status,
      detail,
      type: this.getProblemType(status, request),
      instance: request.url,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      ...extensions,
    };

    this.logger.error(
      `Error: ${request.method} ${request.url} - ${status} - ${title}`,
      exception instanceof Error ? exception.stack : exception,
    );

    response
      .code(status)
      .header('Content-Type', 'application/problem+json')
      .send(errorResponse);
  }

  private getStandardTitle(status: number): string {
    const statusTitles: Record<number, string> = {
      400: 'Bad Request',
      401: 'Unauthorized',
      403: 'Forbidden',
      404: 'Not Found',
      405: 'Method Not Allowed',
      409: 'Conflict',
      422: 'Unprocessable Entity',
      429: 'Too Many Requests',
      500: 'Internal Server Error',
      502: 'Bad Gateway',
      503: 'Service Unavailable',
      504: 'Gateway Timeout',
    };

    return statusTitles[status] || `HTTP ${status}`;
  }

  private getProblemType(status: number, request: FastifyRequest): string {
    const protocol =
      request.headers['x-forwarded-proto'] ||
      request.protocol.startsWith('https')
        ? 'https'
        : 'http';
    const host =
      (request.headers['x-forwarded-host'] as string) ||
      request.headers.host ||
      'localhost:3000';

    const baseNamespace = `${protocol}://${host}/problems`;

    const problemTypes: Record<number, string> = {
      400: `${baseNamespace}/bad-request`,
      401: `${baseNamespace}/authentication-required`,
      403: `${baseNamespace}/access-denied`,
      404: `${baseNamespace}/resource-not-found`,
      405: `${baseNamespace}/method-not-allowed`,
      409: `${baseNamespace}/resource-conflict`,
      422: `${baseNamespace}/validation-failed`,
      429: `${baseNamespace}/rate-limit-exceeded`,
      500: `${baseNamespace}/internal-server-error`,
      502: `${baseNamespace}/bad-gateway`,
      503: `${baseNamespace}/service-unavailable`,
      504: `${baseNamespace}/gateway-timeout`,
    };

    return problemTypes[status] || `${baseNamespace}/http-${status}`;
  }
}
