import { PartialType } from '@nestjs/swagger';
import { CreatePresidentDto } from './create-president.dto';

export class UpdatePresidentDto extends PartialType(CreatePresidentDto) {}
