import {
  CallHandler,
  ExecutionContext,
  HttpException,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Response } from 'express';
import { catchError, map, Observable, throwError } from 'rxjs';
import { RESPONSE_TYPE, STANDARD_RESPONSE_TYPE_KEY } from './constants';
import { ApiResponseDto } from './response.dto';
import { ApiExceptionFilter } from './api.exception';

@Injectable()
export class ApiResponseInterceptor implements NestInterceptor {
  constructor(private reflector: Reflector) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const responseType = this.reflector?.getAllAndOverride<string, string>(
      STANDARD_RESPONSE_TYPE_KEY,
      [context.getHandler(), context.getClass()],
    ) as RESPONSE_TYPE;

    if (responseType === RESPONSE_TYPE.RAW) {
      return next.handle();
    }

    return next.handle().pipe(
      map((res) => this.responseHandler(res, context)),
      catchError((err: HttpException) =>
        throwError(() => this.errorHandler(err, context)),
      ),
    );
  }

  responseHandler(res: any, context: ExecutionContext) {
    const ctx = context.switchToHttp();
    const response = ctx.getResponse<Response>();
    const statusCode = response.statusCode;

    return new ApiResponseDto<unknown>({
      success: true,
      statusCode,
      data: res,
      errors: null,
    });
  }

  errorHandler(exception: HttpException, context: ExecutionContext) {
    const apiResponse = ApiExceptionFilter.handleException(exception);
    const ctx = context.switchToHttp();
    const response = ctx.getResponse<Response>();

    response.status(apiResponse.statusCode).json(apiResponse);
  }
}
