import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpStatus,
  HttpException,
} from '@nestjs/common';
import { Response } from 'express';
import { ApiResponseDto } from './response.dto';

@Catch()
export class ApiExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    if (!exception) return;
    const apiResponse = ApiExceptionFilter.handleException(exception);
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    response.status(apiResponse.statusCode).json(apiResponse);
  }

  static handleException(exception: unknown): ApiResponseDto {
    const statusCode =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;
    const message =
      exception instanceof HttpException
        ? exception.message
        : 'Internal Server Error';
    const errors: Record<string, string[]> | null = null;

    let responseDto: ApiResponseDto = {
      success: false,
      statusCode,
      message,
      errors,
      data: null,
    };

    const exceptionResponse =
      exception instanceof HttpException ? exception.getResponse() : null;

    if (typeof exceptionResponse === 'object') {
      responseDto = {
        ...responseDto,
        ...exceptionResponse,
        success: false,
      };
    }

    return new ApiResponseDto({ ...responseDto });
  }
}
