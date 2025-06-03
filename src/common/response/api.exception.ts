import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpStatus,
  HttpException,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { ApiResponseDto } from './response.dto';

@Catch(HttpException)
export class ApiExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    if (!exception) return;
    const ctx = host.switchToHttp();
    const request = ctx.getRequest<Request>();

    const apiResponse = ApiExceptionFilter.handleException(
      request.url,
      exception,
    );
    const response = ctx.getResponse<Response>();
    response
      .header('Content-Type', 'application/problem+json')
      .status(apiResponse.statusCode)
      .json(apiResponse);
  }

  static handleException(
    instance: string,
    exception?: HttpException,
  ): ApiResponseDto {
    let statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal Server Error';
    let type = 'about:blank';

    if (exception instanceof HttpException) {
      type = `problem-type:${exception.name}`;
      statusCode = exception.getStatus();
    }

    if (exception instanceof HttpException) {
      message = exception.message;
    }

    const errors: Record<string, string[]> | null = null;

    let responseDto: ApiResponseDto = {
      type,
      success: false,
      statusCode,
      message,
      errors,
      instance,
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
