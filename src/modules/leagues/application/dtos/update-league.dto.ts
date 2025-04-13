import { PartialType } from '@nestjs/mapped-types';
import { CreateLeagueDto } from '@modules/leagues/application/dtos/create-league.dto';

export class UpdateLeagueDto extends PartialType(CreateLeagueDto) {}
