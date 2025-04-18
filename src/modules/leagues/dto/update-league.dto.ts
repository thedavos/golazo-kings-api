import { PartialType } from '@nestjs/swagger';
import { CreateLeagueDto } from '@modules/leagues/dto/create-league.dto';

export class UpdateLeagueDto extends PartialType(CreateLeagueDto) {}
