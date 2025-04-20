import {
  Controller,
  HttpCode,
  HttpStatus,
  Logger,
  Post,
  Param,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AdminGuard } from './guards/admin.guard';
import { ScrapingService } from './services/scraping.service';
import {
  SupportedLeagueKey,
  SUPPORTED_LEAGUES,
} from './domain/value-objects/supported-leagues.enum';

@ApiTags('admin')
@Controller('admin')
@UseGuards(AdminGuard)
export class AdminController {
  private readonly logger = new Logger(AdminController.name);

  constructor(private readonly scrapingService: ScrapingService) {}

  @Post('scraping/kings-league/:league/sync-teams')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Scrape and save Kings League teams for a specific league',
  })
  @ApiParam({
    name: 'league',
    required: true,
    description: 'League identifier (e.g., spain, americas)',
    enum: SUPPORTED_LEAGUES,
  })
  @ApiResponse({
    status: 200,
    description:
      'Scraping and saving process finished.' /* type: SaveSummaryDTO if you create one */,
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
  async scrapeKingsLeagueTeams(@Param('league') league: SupportedLeagueKey) {
    this.logger.log(
      `Admin request received to scrape and save league: ${league}`,
    );

    const result = await this.scrapingService.scrape(league);

    if (result.isSuccess) {
      const summary = result.value;
      this.logger.log(
        `Scrape-and-save successful for league ${summary as string}: ${JSON.stringify(summary)}`,
      );

      return summary;
    } else {
      const error = result.error;
      this.logger.error(
        `Scrape-and-save failed for league ${league}: ${error?.message}`,
        error?.stack,
      );
    }
  }
}
