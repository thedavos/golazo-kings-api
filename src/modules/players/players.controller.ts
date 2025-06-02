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
  ParseIntPipe,
  HttpStatus,
  HttpCode,
  NotFoundException,
} from '@nestjs/common';
import {
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { PlayersService } from './players.service';
import { ImageService } from '@modules/image/services/image.service';
import { CreatePlayerDto } from './dto/create-player.dto';
import { UpdatePlayerDto } from './dto/update-player.dto';
import { IMAGE_VALIDATION_PIPE } from '@/common/constants/file-validation.constants';
import { ImageEntities } from '@/modules/image/domain/value-objects/image-entities.enum';
import { Image } from '@/modules/image/domain/entities/image.entity';
import { Player } from './domain/entities/player.entity';

@ApiTags('Players')
@Controller('players') // Ruta base: /players
export class PlayersController {
  constructor(
    private readonly playersService: PlayersService,
    private readonly imageService: ImageService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Crear un nuevo jugador' })
  @ApiBody({ type: CreatePlayerDto })
  @ApiResponse({
    status: 201,
    description: 'El jugador ha sido creado exitosamente.',
    type: Player,
  })
  @ApiResponse({ status: 400, description: 'Datos de entrada inválidos.' })
  create(@Body() createPlayerDto: CreatePlayerDto) {
    return this.playersService.create(createPlayerDto);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener una lista de todos los jugadores' })
  @ApiResponse({
    status: 200,
    description: 'Lista de jugadores.',
    type: [Player],
  })
  findAll(@Query('teamId') teamId?: string) {
    const teamIdNum = teamId ? Number(teamId) : undefined;
    if (teamId && isNaN(<number>teamIdNum)) {
      throw new Error('Invalid teamId query parameter'); // O BadRequestException
    }
    return this.playersService.findAll(teamIdNum);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un jugador por su ID' })
  @ApiParam({ name: 'id', description: 'ID del jugador', type: Number })
  @ApiResponse({
    status: 200,
    description: 'Detalles del jugador.',
    type: Player,
  })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.playersService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar un jugador existente' })
  @ApiParam({
    name: 'id',
    description: 'ID del jugador a actualizar',
    type: Number,
  })
  @ApiBody({ type: UpdatePlayerDto })
  @ApiResponse({
    status: 200,
    description: 'El jugador ha sido actualizado exitosamente.',
    type: Player,
  })
  @ApiResponse({ status: 400, description: 'Datos de entrada inválidos.' })
  @ApiResponse({
    status: 404,
    description: 'Jugador no encontrado.',
  })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updatePlayerDto: UpdatePlayerDto,
  ) {
    return this.playersService.update(id, updatePlayerDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Eliminar un jugador por su ID' })
  @ApiParam({
    name: 'id',
    description: 'ID del jugador a eliminar',
    type: Number,
  })
  @ApiResponse({
    status: 204,
    description: 'El jugador ha sido eliminado exitosamente.',
  })
  @ApiResponse({ status: 404, description: 'Jugador no encontrado.' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.playersService.remove(id);
  }

  @Post(':playerId/images')
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload an image for a specific player' })
  @ApiParam({
    name: 'playerId',
    type: Number,
    description: 'ID of the player to associate the image with',
  })
  @ApiBody({
    description: 'Image file to upload (png, jpg, jpeg, webp, gif)',
    required: true,
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'The image file itself',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Image uploaded and associated successfully.',
    type: Image,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request (Invalid file type, size, or missing file)',
  })
  @ApiResponse({ status: 404, description: 'Player not found' })
  @ApiResponse({
    status: 500,
    description: 'Internal server error during upload process',
  })
  async addPlayerImage(
    @Param('playerId', ParseIntPipe) playerId: number,
    @UploadedFile(IMAGE_VALIDATION_PIPE)
    file: Express.Multer.File,
  ) {
    await this.playersService.findOne(playerId);

    return this.imageService.uploadImage({
      file,
      entityType: ImageEntities.PLAYER,
      entityId: playerId,
    });
  }

  @Get(':playerId/images')
  @ApiOperation({ summary: 'Get all images associated with a specific player' })
  @ApiParam({
    name: 'playerId',
    type: Number,
    description: 'ID of the player whose images to retrieve',
  })
  @ApiResponse({
    status: 200,
    description: 'List of images for the player.',
    type: [Image],
  })
  @ApiResponse({ status: 404, description: 'Player not found' })
  async getPlayerImages(@Param('playerId', ParseIntPipe) playerId: number) {
    await this.playersService.findOne(playerId);
    return this.imageService.getImagesByEntity(ImageEntities.PLAYER, playerId);
  }

  @Delete(':playerId/images/:imageId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a specific image associated with a player' })
  @ApiParam({ name: 'playerId', type: Number, description: 'ID of the player' })
  @ApiParam({
    name: 'imageId',
    type: Number,
    description: 'ID of the image to delete',
  })
  @ApiResponse({ status: 204, description: 'Image deleted successfully.' })
  @ApiResponse({
    status: 404,
    description:
      'Player not found or Image not found or does not belong to the player',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error during deletion',
  })
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
