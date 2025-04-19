import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseInterceptors,
  UploadedFile,
  ParseFilePipe,
  ParseIntPipe,
  MaxFileSizeValidator,
  FileTypeValidator,
  HttpStatus,
  HttpCode,
  NotFoundException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { PlayersService } from './players.service';
import { ImageService } from '@/modules/image/image.service';
import { CreatePlayerDto } from './dto/create-player.dto';
import { UpdatePlayerDto } from './dto/update-player.dto';
import { ImageEntities } from '@/modules/image/domain/value-objects/image-entities.enum';

@Controller('players') // Ruta base: /players
export class PlayersController {
  constructor(
    private readonly playersService: PlayersService,
    private readonly imageService: ImageService,
  ) {}

  @Post()
  create(@Body() createPlayerDto: CreatePlayerDto) {
    return this.playersService.create(createPlayerDto);
  }

  @Get()
  findAll(@Query('teamId') teamId?: string) {
    const teamIdNum = teamId ? Number(teamId) : undefined;
    if (teamId && isNaN(<number>teamIdNum)) {
      throw new Error('Invalid teamId query parameter'); // O BadRequestException
    }
    return this.playersService.findAll(teamIdNum);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.playersService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updatePlayerDto: UpdatePlayerDto,
  ) {
    return this.playersService.update(id, updatePlayerDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.playersService.remove(id);
  }

  @Post(':playerId/images')
  @UseInterceptors(FileInterceptor('file'))
  async addPlayerImage(
    @Param('playerId', ParseIntPipe) playerId: number,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 10 * 1024 * 1024 }), // 10 MB
          new FileTypeValidator({ fileType: '.(png|jpeg|jpg|webp|gif)' }),
        ],
      }),
    )
    file: Express.Multer.File,
  ) {
    await this.playersService.findOne(playerId);

    return this.imageService.uploadImage(file, ImageEntities.PLAYER, playerId);
  }

  @Get(':playerId/images')
  async getPlayerImages(@Param('playerId', ParseIntPipe) playerId: number) {
    await this.playersService.findOne(playerId);

    return this.imageService.findImagesForEntity(
      ImageEntities.PLAYER,
      playerId,
    );
  }

  @Delete(':playerId/images/:imageId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deletePlayerImage(
    @Param('playerId', ParseIntPipe) playerId: number,
    @Param('imageId', ParseIntPipe) imageId: number,
  ) {
    await this.playersService.findOne(playerId);

    const image = await this.imageService.findImageById(imageId); // Necesitarías añadir findImageById al ImageService

    if (
      !image ||
      image.entityType !== ImageEntities.PLAYER ||
      image.entityId !== playerId
    ) {
      throw new NotFoundException(
        `Image with ID ${imageId} not found or does not belong to player ${playerId}.`,
      );
    }

    await this.imageService.deleteImage(imageId);
  }
}
