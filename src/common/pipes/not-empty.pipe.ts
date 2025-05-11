import {
  PipeTransform,
  Injectable,
  ArgumentMetadata,
  BadRequestException,
  HttpStatus,
} from '@nestjs/common';

export interface NotEmptyPipeOptions {
  paramName?: string;
  message?: string;
  errorHttpStatusCode?: HttpStatus;
  trim?: boolean;
  allowEmptyString?: boolean;
}

@Injectable()
export class NotEmptyPipe implements PipeTransform {
  private readonly options: Required<NotEmptyPipeOptions>;

  constructor(options?: NotEmptyPipeOptions) {
    this.options = {
      paramName: 'id',
      message: '',
      errorHttpStatusCode: HttpStatus.BAD_REQUEST,
      trim: true,
      allowEmptyString: false,
      ...options,
    };

    this.options.message = `El ${this.options.paramName} no puede estar vacío`;
  }

  transform(value: unknown, metadata: ArgumentMetadata) {
    const paramName = this.options.paramName || metadata.data || 'parámetro';
    const errorMessage =
      this.options.message || `El ${paramName} no puede estar vacío`;

    // Cuando es null o undefined
    if (value === undefined || value === null) {
      throw new BadRequestException({
        statusCode: this.options.errorHttpStatusCode,
        message: errorMessage,
        error: 'Bad Request',
        param: metadata.data,
      });
    }

    if (typeof value === 'string') {
      const stringValue = this.options.trim ? value.trim() : value;
      if (!this.options.allowEmptyString && stringValue === '') {
        throw new BadRequestException({
          statusCode: this.options.errorHttpStatusCode,
          message: errorMessage,
          error: 'Bad Request',
          param: metadata.data,
        });
      }

      return this.options.trim ? stringValue : value;
    }

    return value;
  }
}
