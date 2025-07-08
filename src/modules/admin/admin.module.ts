import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ScrapingService } from './services/scraping.service';
import { AdminUrlService } from '@modules/admin/services/adminUrl.service';
import { PlayerScraperRepository } from '@modules/admin/repositories/player-scraper.repository';
import { TeamScraperRepository } from '@modules/admin/repositories/team-scraper.repository';
import { TeamsModule } from '@/modules/teams/teams.module';
import { ImageModule } from '@modules/image/image.module';
import { AdminController } from './admin.controller';

@Module({
  imports: [TeamsModule, ImageModule, HttpModule],
  controllers: [AdminController],
  providers: [
    ScrapingService,
    AdminUrlService,
    PlayerScraperRepository,
    TeamScraperRepository,
  ],
  exports: [ScrapingService, AdminUrlService],
})
export class AdminModule {}
