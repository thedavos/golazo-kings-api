import { Module } from '@nestjs/common';
import { APP_FILTER, APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core';
import { ApiResponseInterceptor } from './response.interceptor';
import { ApiValidationPipe } from './api-validation.pipe';
import { ApiExceptionFilter } from './api.exception';

@Module({
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: ApiResponseInterceptor,
    },
    {
      provide: APP_PIPE,
      useClass: ApiValidationPipe,
    },
    {
      provide: APP_FILTER,
      useClass: ApiExceptionFilter,
    },
  ],
})
export class ApiResponseModule {}
