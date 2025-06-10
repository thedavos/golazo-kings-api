import {
  CallHandler,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { FastifyRequest, FastifyReply } from 'fastify';
import { catchError, map, Observable, throwError } from 'rxjs';
import { RESPONSE_TYPE, STANDARD_RESPONSE_TYPE_KEY } from './constants';
import { ApiResponseDto } from './response.dto';
import { getDefaultSuccessMessage } from './api-response.dto';

@Injectable()
export class ApiResponseInterceptor<T>
  implements NestInterceptor<T, ApiResponseDto<T>>
{
  private readonly logger = new Logger(ApiResponseInterceptor.name);

  constructor(private reflector: Reflector) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const responseType = this.reflector?.getAllAndOverride<string, string>(
      STANDARD_RESPONSE_TYPE_KEY,
      [context.getHandler(), context.getClass()],
    ) as RESPONSE_TYPE;

    if (responseType === RESPONSE_TYPE.RAW) {
      return next.handle();
    }

    const ctx = context.switchToHttp();
    const response = ctx.getResponse<FastifyReply>();
    const request = ctx.getRequest<FastifyRequest>();

    const statusCode = response.statusCode as HttpStatus;

    return next.handle().pipe(
      map((data) => {
        if (
          data &&
          typeof data === 'object' &&
          ('success' in data || 'type' in data)
        ) {
          return data as unknown;
        }

        const apiResponse: ApiResponseDto<T> = {
          success: true,
          statusCode,
          message: getDefaultSuccessMessage(statusCode),
          data: data as T,
          errors: null,
        };

        response.header('Content-Type', 'application/json');

        // Para respuestas 201, verificar si hay header Location
        if (
          data &&
          typeof data === 'object' &&
          statusCode === HttpStatus.CREATED
        ) {
          const location = this.extractLocation(
            request.url,
            data as Record<string, any>,
          );

          if (location) {
            response.header('Location', location);
          }
        }

        this.logger.log(
          `API Response: ${request.method} ${request.url} - ${statusCode}`,
        );

        return apiResponse;
      }),
      catchError((error: HttpException) => throwError(() => error)),
    );
  }

  private extractLocation(
    basePath: string,
    data: Record<string, any>,
  ): string | null {
    if (data && typeof data === 'object' && data.id) {
      return `${basePath}/${data.id}`;
    }
    return null;
  }
}
