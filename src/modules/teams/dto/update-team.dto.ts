import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CreateTeamDto } from './create-team.dto';
import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateTeamDto extends PartialType(CreateTeamDto) {
  @ApiProperty({ example: '32e73122-6496-4730-8979-81aef240fe35' })
  @IsString()
  @IsNotEmpty()
  uuid: string;
}
