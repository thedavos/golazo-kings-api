import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
  UploadedFile,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
  ApiConsumes,
} from '@nestjs/swagger';
import { PresidentsService } from './presidents.service';
import { CreatePresidentDto } from './dto/create-president.dto';
import { UpdatePresidentDto } from './dto/update-president.dto';
import { IMAGE_VALIDATION_PIPE } from '@common/constants/file-validation.constants';
import { President } from './domain/entities/president.entity';
import { Image } from '@/modules/image/domain/entities/image.entity';
import { ImageService } from '@modules/image/services/image.service';
import { ImageEntities } from '@modules/image/domain/value-objects/image-entities.enum';
import { MultipartFile } from '@fastify/multipart';

@ApiTags('Presidents')
@Controller('presidents')
export class PresidentsController {
  constructor(
    private readonly presidentsService: PresidentsService,
    private readonly imageService: ImageService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Crear un nuevo presidente' })
  @ApiBody({ type: CreatePresidentDto })
  @ApiResponse({
    status: 201,
    description: 'El presidente ha sido creado exitosamente.',
    type: President,
  })
  @ApiResponse({ status: 400, description: 'Datos de entrada inválidos.' })
  @ApiResponse({ status: 404, description: 'Equipo no encontrado.' })
  create(@Body() createPresidentDto: CreatePresidentDto): Promise<President> {
    return this.presidentsService.create(createPresidentDto);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener una lista de todos los presidentes' })
  @ApiResponse({
    status: 200,
    description: 'Lista de presidentes.',
    type: [President],
  })
  findAll(): Promise<President[]> {
    return this.presidentsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un presidente por su ID' })
  @ApiParam({ name: 'id', description: 'ID del presidente', type: Number })
  @ApiResponse({
    status: 200,
    description: 'Detalles del presidente.',
    type: President,
  })
  @ApiResponse({ status: 404, description: 'Presidente no encontrado.' })
  findOne(@Param('id', ParseIntPipe) id: number): Promise<President> {
    return this.presidentsService.findOne(id);
  }

  @Get('uuid/:uuid')
  @ApiOperation({ summary: 'Obtener un presidente por su UUID' })
  @ApiParam({ name: 'uuid', description: 'UUID del presidente', type: String })
  @ApiResponse({
    status: 200,
    description: 'Detalles del presidente.',
    type: President,
  })
  @ApiResponse({ status: 404, description: 'Presidente no encontrado.' })
  findOneByUuid(
    @Param('uuid', ParseUUIDPipe) uuid: string,
  ): Promise<President> {
    return this.presidentsService.findOneByUuid(uuid);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar un presidente existente' })
  @ApiParam({
    name: 'id',
    description: 'ID del presidente a actualizar',
    type: Number,
  })
  @ApiBody({ type: UpdatePresidentDto })
  @ApiResponse({
    status: 200,
    description: 'El presidente ha sido actualizado exitosamente.',
    type: President,
  })
  @ApiResponse({ status: 400, description: 'Datos de entrada inválidos.' })
  @ApiResponse({
    status: 404,
    description: 'Presidente o Equipo no encontrado.',
  })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updatePresidentDto: UpdatePresidentDto,
  ): Promise<President> {
    return this.presidentsService.update(id, updatePresidentDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Eliminar un presidente por su ID' })
  @ApiParam({
    name: 'id',
    description: 'ID del presidente a eliminar',
    type: Number,
  })
  @ApiResponse({
    status: 204,
    description: 'El presidente ha sido eliminado exitosamente.',
  })
  @ApiResponse({ status: 404, description: 'Presidente no encontrado.' })
  remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.presidentsService.remove(id);
  }

  @Get('team/:teamId/active')
  @ApiOperation({
    summary: 'Obtener presidentes activos de un equipo específico',
  })
  @ApiParam({ name: 'teamId', description: 'ID del equipo', type: Number })
  @ApiResponse({
    status: 200,
    description: 'Lista de presidentes activos.',
    type: [President],
  })
  @ApiResponse({ status: 404, description: 'Equipo no encontrado.' })
  findActiveByTeam(
    @Param('teamId', ParseIntPipe) teamId: number,
  ): Promise<President[]> {
    return this.presidentsService.findActivePresidentsByTeam(teamId);
  }

  @Get('team/:teamId/history')
  @ApiOperation({
    summary: 'Obtener historial de presidentes de un equipo específico',
  })
  @ApiParam({ name: 'teamId', description: 'ID del equipo', type: Number })
  @ApiResponse({
    status: 200,
    description: 'Historial de presidentes.',
    type: [President],
  })
  @ApiResponse({ status: 404, description: 'Equipo no encontrado.' })
  findHistoryByTeam(
    @Param('teamId', ParseIntPipe) teamId: number,
  ): Promise<President[]> {
    return this.presidentsService.findPresidentHistoryByTeam(teamId);
  }

  @Get('league/:leagueUuid')
  @ApiOperation({ summary: 'Obtener presidentes por UUID de Liga' })
  @ApiParam({
    name: 'leagueUuid',
    description: 'UUID de la Liga',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de presidentes pertenecientes a la liga especificada.',
    type: [President],
  })
  @ApiResponse({
    status: 404,
    description: 'Liga no encontrada.',
  })
  findByLeague(
    @Param('leagueUuid', ParseUUIDPipe) leagueUuid: string,
  ): Promise<President[]> {
    return this.presidentsService.findActivePresidentsByLeague(leagueUuid);
  }

  @Post(':presidentId/images')
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload an image for a specific president' })
  @ApiParam({
    name: 'presidentId',
    type: Number,
    description: 'ID of the president to associate the image with',
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
  @ApiResponse({ status: 404, description: 'President not found' })
  @ApiResponse({
    status: 500,
    description: 'Internal server error during upload process',
  })
  async addPresidentImage(
    @Param('presidentId', ParseIntPipe) presidentId: number,
    @UploadedFile(IMAGE_VALIDATION_PIPE)
    file: MultipartFile,
  ) {
    await this.presidentsService.findOne(presidentId);

    await this.imageService.uploadImage({
      file,
      entityType: ImageEntities.PRESIDENT,
      entityId: presidentId,
    });
  }

  @Get(':presidentId/images')
  @ApiOperation({ summary: 'Get all images associated with a specific player' })
  @ApiParam({
    name: 'presidentId',
    type: Number,
    description: 'ID of the player whose images to retrieve',
  })
  @ApiResponse({
    status: 200,
    description: 'List of images for the president.',
    type: [Image],
  })
  @ApiResponse({ status: 404, description: 'President not found' })
  async getPresidentImages(
    @Param('presidentId', ParseIntPipe) presidentId: number,
  ) {
    await this.presidentsService.findOne(presidentId);

    return this.imageService.getImagesByEntity(
      ImageEntities.PRESIDENT,
      presidentId,
    );
  }
}
