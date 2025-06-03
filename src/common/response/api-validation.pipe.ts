import {
  BadRequestException,
  HttpStatus,
  Injectable,
  ValidationError,
  ValidationPipe,
  ValidationPipeOptions,
} from '@nestjs/common';
import { ErrorResponseDto } from './error-response.dto';

@Injectable()
export class ApiValidationPipe extends ValidationPipe {
  constructor(options?: ValidationPipeOptions) {
    options = options || {};
    options.whitelist = true;
    options.exceptionFactory = (errors: ValidationError[] = []) => {
      const formattedErrors = errors.map((error) => ({
        field: error.property,
        messages: Object.values(error.constraints ?? []),
      }));

      const errorResponse = new ErrorResponseDto({
        title: 'ValidationError',
        status: HttpStatus.BAD_REQUEST,
        errors: formattedErrors,
        timestamp: new Date().toISOString(),
        detail: 'One or more validation errors occurred.',
      });

      return new BadRequestException(errorResponse);
    };
    super(options);
  }
}
