import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Logger,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AdminGuard } from './guards/admin.guard';
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
import { ScrapedLeagueDto } from './domain/dtos/scraped-league.dto';
import { CreateTeamDto } from '@modules/teams/dto/create-team.dto';
import { UploadFromUrlDto } from '@modules/image/dtos/upload-image.dto';
import { UpdateTeamDto } from '@modules/teams/dto/update-team.dto';
import { Team } from '@modules/teams/domain/entities/team.entity';

@ApiTags('admin')
@Controller('admin')
@UseGuards(AdminGuard)
export class AdminController {
  private readonly logger = new Logger(AdminController.name);

  constructor(
    private readonly scrapingService: ScrapingService,
    private readonly teamsService: TeamsService,
    private readonly imageService: ImageService,
  ) {}

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
  @HttpCode(HttpStatus.CREATED)
  @Post('scraping/create-team')
  async createTeamByScraping(@Body() createTeamDto: CreateTeamDto) {
    const teamCreated = await this.teamsService.create(createTeamDto);

    const uploadUrl: UploadFromUrlDto = {
      entityId: teamCreated.id,
      entityType: ImageEntities.TEAM,
      filename: `${teamCreated.name}-logo`,
      imageUrl: createTeamDto.logoUrl as string,
    };

    const imageUploaded = await this.imageService.uploadImageFromUrl(uploadUrl);

    const team = await this.teamsService.update(teamCreated.id, {
      logoUrl: imageUploaded.url,
    });

    this.logger.log('Url uploaded successfully and attached to Team.');

    return team;
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
