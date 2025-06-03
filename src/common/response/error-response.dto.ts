import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ErrorResponseDto {
  @ApiPropertyOptional()
  readonly type?: string;

  @ApiProperty()
  readonly title: string;

  @ApiProperty()
  readonly status: number;

  @ApiPropertyOptional()
  readonly detail?: string;

  @ApiPropertyOptional()
  readonly instance?: string;

  @ApiPropertyOptional()
  readonly timestamp?: string;

  @ApiPropertyOptional()
  readonly path?: string;

  @ApiPropertyOptional()
  readonly method?: string;

  @ApiPropertyOptional()
  readonly errors?: any[];

  constructor({
    type,
    title,
    status,
    detail,
    instance,
    timestamp,
    path,
    method,
    errors,
  }: ErrorResponseDto) {
    this.type = type || `https://httpstatuses.com/${status}`;
    this.title = title;
    this.status = status;
    this.detail = detail;
    this.instance = instance;
    this.timestamp = timestamp;
    this.path = path;
    this.method = method;
    this.errors = errors;
  }
}
