import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ScrapingService } from './services/scraping.service';
import { TeamsModule } from '@/modules/teams/teams.module';
import { AdminController } from './admin.controller';

@Module({
  imports: [TeamsModule, HttpModule],
  controllers: [AdminController],
  providers: [ScrapingService],
  exports: [ScrapingService],
})
export class AdminModule {}
