import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ApiResponseDto<TData = any> {
  @ApiProperty()
  readonly success: boolean = true;

  @ApiProperty()
  readonly statusCode: number;

  @ApiPropertyOptional()
  readonly message?: string;

  @ApiPropertyOptional({
    description:
      'Objeto donde las claves son los nombres de los campos con error',
    example: {
      name: [
        'be shorter than or equal to 100 characters',
        'be longer than or equal to 3 characters',
      ],
      numberOfTeams: ['must not be greater than 12', 'must not be less than 2'],
    },
    type: 'object',
    additionalProperties: {
      type: 'array',
      items: {
        type: 'string',
      },
    },
  })
  readonly errors?: Record<string, string[]> | null;

  @ApiPropertyOptional()
  readonly data?: TData | TData[];

  @ApiPropertyOptional()
  readonly meta?: Record<string, any>;

  constructor({
    success,
    statusCode,
    message,
    errors,
    data,
    meta,
  }: ApiResponseDto<TData>) {
    this.success = success;
    this.statusCode = statusCode;
    this.message = message;
    this.errors = errors;
    this.data = data;
    this.meta = meta;
  }
}
