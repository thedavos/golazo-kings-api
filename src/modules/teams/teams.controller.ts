import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { SlugValidationPipe } from '@common/pipes/slug-validation.pipe';
import { TeamsService } from './teams.service';
import { CreateTeamDto } from './dto/create-team.dto';
import { UpdateTeamDto } from './dto/update-team.dto';
import { Public } from '@modules/auth/decorators/public.decorator';
import { RequirePermissions } from '@modules/auth/decorators/permissions.decorator';
import { Permission } from '@modules/auth/domain/enums/permission.enum';

@Controller('teams')
export class TeamsController {
  constructor(private readonly teamsService: TeamsService) {}

  @RequirePermissions(Permission.CREATE_TEAM)
  @Post()
  create(@Body() createTeamDto: CreateTeamDto) {
    return this.teamsService.create(createTeamDto);
  }

  @Public()
  @Get()
  findAll(@Query('leagueId') leagueId?: string) {
    const leagueIdNum = leagueId ? Number(leagueId) : undefined;
    return this.teamsService.findAll(leagueIdNum);
  }

  @Public()
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.teamsService.findOne(id);
  }

  @Public()
  @Get('slug/:slug')
  findOneBySlug(@Param('slug', SlugValidationPipe) slug: string) {
    return this.teamsService.findOneBySlug(slug);
  }

  @RequirePermissions(Permission.UPDATE_TEAM)
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateTeamDto: UpdateTeamDto,
  ) {
    return this.teamsService.update(id, updateTeamDto);
  }

  @RequirePermissions(Permission.DELETE_TEAM)
  @HttpCode(204)
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.teamsService.remove(id);
  }
}
