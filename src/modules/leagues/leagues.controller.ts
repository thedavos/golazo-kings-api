import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam } from '@nestjs/swagger';
import { LeaguesService } from '@modules/leagues/leagues.service';
import { CreateLeagueDto } from '@modules/leagues/dto/create-league.dto';
import { UpdateLeagueDto } from '@modules/leagues/dto/update-league.dto';
import { NotEmptyPipe } from '@common/pipes/not-empty.pipe';

@ApiTags('leagues')
@Controller('leagues')
export class LeaguesController {
  constructor(private readonly leaguesService: LeaguesService) {}

  @Post()
  @ApiOperation({ summary: 'Crear una nueva liga' })
  create(@Body() createLeagueDto: CreateLeagueDto) {
    return this.leaguesService.create(createLeagueDto);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener todas las ligas' })
  findAll() {
    return this.leaguesService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener una liga por ID' })
  @ApiParam({
    name: 'id',
    required: true,
    description: 'ID de la liga (debe ser un número positivo)',
  })
  findOne(
    @Param('id', new NotEmptyPipe({ paramName: 'id' }), ParseIntPipe)
    id: number,
  ) {
    return this.leaguesService.findOne(id);
  }

  @Get('slug/:slug')
  @ApiOperation({ summary: 'Obtener una liga por slug' })
  findBySlug(@Param('slug') slug: string) {
    return this.leaguesService.findBySlug(slug);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar una liga' })
  update(@Param('id') id: number, @Body() updateLeagueDto: UpdateLeagueDto) {
    return this.leaguesService.update(id, updateLeagueDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar una liga' })
  remove(@Param('id') id: number) {
    return this.leaguesService.remove(id);
  }
}
