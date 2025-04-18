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
} from '@nestjs/common';
import { PresidentsService } from './presidents.service';
import { CreatePresidentDto } from './dto/create-president.dto';
import { UpdatePresidentDto } from './dto/update-president.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import { President } from './domain/entities/president.entity';

@ApiTags('Presidents')
@Controller('presidents')
export class PresidentsController {
  constructor(private readonly presidentsService: PresidentsService) {}

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

  @Get(':uuid')
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
  @HttpCode(HttpStatus.NO_CONTENT) // Retorna 204 No Content en éxito
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
}
