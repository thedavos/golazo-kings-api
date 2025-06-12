import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  Query,
  HttpCode,
  BadRequestException,
} from '@nestjs/common';
import { SlugValidationPipe } from '@common/pipes/slug-validation.pipe';
import { TeamsService } from './teams.service';
import { CreateTeamDto } from './dto/create-team.dto';
import { UpdateTeamDto } from './dto/update-team.dto';

@Controller('teams')
export class TeamsController {
  constructor(private readonly teamsService: TeamsService) {}

  @Post()
  create(@Body() createTeamDto: CreateTeamDto) {
    return this.teamsService.create(createTeamDto);
  }

  @Get()
  findAll(@Query('leagueId') leagueId?: string) {
    const leagueIdNum = leagueId ? Number(leagueId) : undefined;
    if (leagueId && isNaN(<number>leagueIdNum)) {
      throw new BadRequestException('Invalid leagueId query parameter');
    }

    return this.teamsService.findAll(leagueIdNum);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.teamsService.findOne(id);
  }

  @Get('slug/:slug')
  findOneBySlug(@Param('slug', SlugValidationPipe) slug: string) {
    return this.teamsService.findOneBySlug(slug);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateTeamDto: UpdateTeamDto,
  ) {
    return this.teamsService.update(id, updateTeamDto);
  }

  @HttpCode(204)
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.teamsService.remove(id);
  }
}
