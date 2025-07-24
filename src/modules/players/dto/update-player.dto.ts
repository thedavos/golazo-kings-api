import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CreatePlayerDto } from './create-player.dto';
import { IsNotEmpty, IsString } from 'class-validator';

export class UpdatePlayerDto extends PartialType(CreatePlayerDto) {
  @ApiProperty({ example: '32e73122-6496-4730-8979-81aef240fe35' })
  @IsString()
  @IsNotEmpty()
  uuid: string;
}
