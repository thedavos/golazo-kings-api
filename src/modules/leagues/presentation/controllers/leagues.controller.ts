import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Version,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { LeaguesService } from '@modules/leagues/application/services/leagues.service';
import { CreateLeagueDto } from '@modules/leagues/application/dtos/create-league.dto';
import { UpdateLeagueDto } from '@modules/leagues/application/dtos/update-league.dto';

@ApiTags('leagues')
@Controller('leagues')
export class LeaguesController {
  constructor(private readonly leaguesService: LeaguesService) {}

  @Post()
  @Version('1')
  @ApiOperation({ summary: 'Crear una nueva liga' })
  create(@Body() createLeagueDto: CreateLeagueDto) {
    return this.leaguesService.create(createLeagueDto);
  }

  @Get()
  @Version('1')
  @ApiOperation({ summary: 'Obtener todas las ligas' })
  findAll() {
    return this.leaguesService.findAll();
  }

  @Get(':id')
  @Version('1')
  @ApiOperation({ summary: 'Obtener una liga por ID' })
  findOne(@Param('id') id: string) {
    return this.leaguesService.findOne(id);
  }

  @Get('slug/:slug')
  @Version('1')
  @ApiOperation({ summary: 'Obtener una liga por slug' })
  findBySlug(@Param('slug') slug: string) {
    return this.leaguesService.findBySlug(slug);
  }

  @Patch(':id')
  @Version('1')
  @ApiOperation({ summary: 'Actualizar una liga' })
  update(@Param('id') id: string, @Body() updateLeagueDto: UpdateLeagueDto) {
    return this.leaguesService.update(id, updateLeagueDto);
  }

  @Delete(':id')
  @Version('1')
  @ApiOperation({ summary: 'Eliminar una liga' })
  remove(@Param('id') id: string) {
    return this.leaguesService.remove(id);
  }
}
