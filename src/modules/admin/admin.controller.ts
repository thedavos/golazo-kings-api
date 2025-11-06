import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Logger,
  Param,
  Patch,
  Post,
  // UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
// import { AdminGuard } from './guards/admin.guard';
import { ScrapingService } from './services/scraping.service';
import { TeamsService } from '@modules/teams/teams.service';
import { ImageService } from '@modules/image/services/image.service';
import {
  SUPPORTED_LEAGUES,
  SupportedLeagueKey,
} from './domain/value-objects/supported-leagues.enum';
import { ImageEntities } from '@modules/image/domain/value-objects/image-entities.enum';
import { SlugValidationPipe } from '@common/pipes/slug-validation.pipe';
import { LeagueKeyPipe } from './pipes/league-key.pipe';
import { ScrapedLeagueDto } from '@modules/admin/dtos/scraped-league.dto';
import { CreateTeamDto } from '@modules/teams/dto/create-team.dto';
import { UploadFromUrlDto } from '@modules/image/dtos/upload-image.dto';
import { UpdateTeamDto } from '@modules/teams/dto/update-team.dto';
import { Team } from '@modules/teams/domain/entities/team.entity';
import { Player } from '@modules/players/domain/entities/player.entity';
import { normalizeFilename } from '@common/utils/filename-normalizer.util';
// import { Permission } from '@modules/auth/domain/enums/permission.enum';
// import { RequirePermissions } from '@modules/auth/decorators/permissions.decorator';
import { ScrapedPlayerBodyDto } from '@modules/admin/dtos/scraped-player-body.dto';
import { CreatePlayerDto } from '@modules/players/dto/create-player.dto';
import { PlayersService } from '@modules/players/players.service';

@ApiTags('admin')
@Controller('admin')
// @UseGuards(AdminGuard)
export class AdminController {
  private readonly logger = new Logger(AdminController.name);

  constructor(
    private readonly scrapingService: ScrapingService,
    private readonly teamsService: TeamsService,
    private readonly imageService: ImageService,
    private readonly playersService: PlayersService,
  ) {}

  // @RequirePermissions(Permission.SCRAPE_TEAMS)
  @Post('scraping/:league/teams')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Scrape Kings League teams for a specific league',
  })
  @ApiParam({
    name: 'league',
    required: true,
    description:
      'League slug (e.g., kings-league-spain, kings-league-americas)',
    enum: SUPPORTED_LEAGUES,
  })
  @ApiResponse({
    status: 200,
    description: 'Scraping and saving process finished.',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request (Invalid or unsupported league parameter).',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden. Admin privileges required.',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error during scraping or saving process.',
  })
  async scrapeKingsLeagueTeams(
    @Param('league', LeagueKeyPipe) league: SupportedLeagueKey,
    @Body() leagueDto: ScrapedLeagueDto,
  ) {
    this.logger.log(
      `Admin request received to scrape and save league: ${league}`,
    );

    const result = await this.scrapingService.scrapeTeams(league, leagueDto);

    if (result.isSuccess) {
      const summary = result.value;
      this.logger.log(
        `Scrape successful for league ${summary as string}: ${JSON.stringify(summary)}`,
      );

      return summary;
    } else {
      const error = result.error;
      this.logger.error(
        `Scrape failed for league ${league}: ${error?.message}`,
        error?.stack,
      );
    }
  }

  // @RequirePermissions(Permission.SCRAPE_PLAYERS)
  @Post('scraping/players')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Scrape Kings League players for a specific team',
  })
  @ApiResponse({
    status: 200,
    description: 'Scraping and saving process finished.',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request (Invalid or unsupported scraped player body).',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden. Admin privileges required.',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error during scraping or saving process.',
  })
  async scrapeKingsLeaguePlayers(
    @Body() scrapedPlayerBody: ScrapedPlayerBodyDto,
  ) {
    this.logger.log(
      `Admin request received to scrape players given a url: ${scrapedPlayerBody.referenceTeamUrl}`,
    );

    const result = await this.scrapingService.scrapePlayers(scrapedPlayerBody);

    if (result.isSuccess) {
      const summary = result.value;
      this.logger.log(
        `Scrape successful for players: ${JSON.stringify(summary)}`,
      );

      return summary;
    } else {
      const error = result.error;
      this.logger.error(
        `Scrape failed for players url ${scrapedPlayerBody.referenceTeamUrl}: ${error?.message}`,
        error?.stack,
      );
    }

    return result;
  }

  // @RequirePermissions(Permission.CREATE_TEAM)
  @Post('scraping/create-team')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create team from scraping data',
    description: `
    Creates a new team entity from scraped data and manages the associated logo image upload process.
    This endpoint performs a complete workflow that includes:
    1. Team creation from scraping data
    2. Logo image download from external URL
    3. Image upload to CDN/storage service
    4. Team entity update with new logo URL
    
    **Note:** This is an admin-only endpoint used for bulk team creation from web scraping operations.
  `,
    operationId: 'createTeamByScraping',
  })
  @ApiResponse({
    status: 201,
    description: 'Team created successfully with logo uploaded',
    type: Team,
    schema: {
      example: {
        id: 1,
        uuid: '550e8400-e29b-41d4-a716-446655440000',
        name: 'PIO FC',
        logoUrl:
          'https://f002.backblazeb2.com/file/golazo-kings-dev/Team/1/1749011447101-7ba486f1-pio-fc.png',
        city: 'Barcelona',
        country: 'España',
        slug: 'pio-fc',
        abbr: 'PIO',
        foundationYear: 2022,
        venue: 'Cupra Arena',
        leagueId: 1,
        createdAt: '2024-01-15T10:30:00.000Z',
        updatedAt: '2024-01-15T10:30:05.000Z',
      },
    },
  })
  async createTeamByScraping(@Body() createTeamDto: CreateTeamDto) {
    const teamCreated = await this.teamsService.create(createTeamDto);

    const uploadUrl: UploadFromUrlDto = {
      entityId: teamCreated.id,
      entityType: ImageEntities.TEAM,
      filename: normalizeFilename(`${teamCreated.name}-logo`),
      imageUrl: createTeamDto.logoUrl as string,
    };

    const imageUploaded = await this.imageService.uploadImageFromUrl(uploadUrl);

    const teamUpdated = await this.teamsService.update(teamCreated.id, {
      logoUrl: imageUploaded.url,
      uuid: teamCreated.uuid,
    });

    this.logger.log('Url uploaded successfully and attached to Team.');

    return teamUpdated;
  }

  // @RequirePermissions(Permission.CREATE_PLAYER)
  @Post('scraping/create-player')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create player from scraping data',
    description: `
    Creates a new player entity from scraped data and manages the associated logo image upload process.
    This endpoint performs a complete workflow that includes:
    1. Player creation from scraping data
    2. Profile image download from external URL
    3. Image upload to CDN/storage service
    4. Player entity update with new logo URL
    
    **Note:** This is an admin-only endpoint used for bulk player creation from web scraping operations.
  `,
    operationId: 'createPlayerByScraping',
  })
  @ApiResponse({
    status: 201,
    description: 'Player created successfully with profile image uploaded',
    type: Player,
  })
  async createPlayerByScraping(@Body() createPlayerDto: CreatePlayerDto) {
    const playerCreated = await this.playersService.create(createPlayerDto);
    this.logger.log('Player created successfully.');

    const uploadUrl: UploadFromUrlDto = {
      entityId: playerCreated.id,
      entityType: ImageEntities.PLAYER,
      filename: normalizeFilename(`${playerCreated.slug}-profile-image`),
      imageUrl: createPlayerDto.profileImageUrl as string,
    };

    const imageUploaded = await this.imageService.uploadImageFromUrl(uploadUrl);
    this.logger.log('Url uploaded successfully and attached to Player.');

    const playerUpdated = await this.playersService.update(playerCreated.id, {
      profileImageUrl: imageUploaded.url,
      uuid: playerCreated.uuid,
    });

    this.logger.log('Player updated successfully.');

    return playerUpdated;
  }

  @Patch('scraping/update-team/:slug')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Update team from scraping data',
    description:
      'Updates an existing team entity with scraped data if changes are detected',
  })
  async updateTeamByScraping(
    @Param('slug', SlugValidationPipe) slug: string,
    @Body() updateTeamDto: UpdateTeamDto,
  ) {
    this.logger.log(`Processing update for team ${slug}`);

    try {
      const result = await this.teamsService.validateAndUpdate(
        slug,
        updateTeamDto,
      );

      if (!result.hasChanges) {
        this.logger.log(`No changes detected for team ${slug}`);
        return result.team;
      }

      if (
        updateTeamDto.logoUrl &&
        updateTeamDto.logoUrl !== result.team.logoUrl
      ) {
        const uploadUrl: UploadFromUrlDto = {
          entityId: result.team.id,
          entityType: ImageEntities.TEAM,
          filename: `${result.team.name}-logo-updated`,
          imageUrl: updateTeamDto.logoUrl,
        };

        const imageUploaded =
          await this.imageService.uploadImageFromUrl(uploadUrl);

        return await this.teamsService.update(result.team.id, {
          uuid: result.team.uuid,
          logoUrl: imageUploaded.url,
        });
      }

      return result.team;
    } catch (e) {
      const error = e as Error;
      this.logger.error(`Error updating team ${slug}: ${error.message}`);
      throw error;
    }
  }
}
