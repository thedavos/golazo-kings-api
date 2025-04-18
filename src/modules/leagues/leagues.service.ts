import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { LeagueRepository } from '@modules/leagues/league.repository';
import { CreateLeagueDto } from '@modules/leagues/dtos/create-league.dto';
import { UpdateLeagueDto } from '@modules/leagues/dtos/update-league.dto';
import { League } from '@modules/leagues/domain/entities/league.entity';
import slugify from '@common/utils/slugify.utils';

@Injectable()
export class LeaguesService {
  constructor(private readonly leagueRepository: LeagueRepository) {}

  async create(createLeagueDto: CreateLeagueDto): Promise<League> {
    if (!createLeagueDto.slug) {
      createLeagueDto.slug = slugify(createLeagueDto.name);
    }

    const existingLeague = await this.leagueRepository.findBySlug(
      createLeagueDto.slug,
    );

    if (existingLeague) {
      throw new ConflictException(
        `Ya existe una liga con el slug ${createLeagueDto.slug}`,
      );
    }

    return await this.leagueRepository.create(createLeagueDto);
  }

  async findAll(): Promise<League[]> {
    return await this.leagueRepository.findAll();
  }

  async findOne(id: string): Promise<League> {
    const league = await this.leagueRepository.findById(id);
    if (!league) {
      throw new NotFoundException(`Liga con ID ${id} no encontrada`);
    }

    return league;
  }

  async findBySlug(slug: string): Promise<League> {
    const league = await this.leagueRepository.findBySlug(slug);
    if (!league) {
      throw new NotFoundException(`Liga con slug ${slug} no encontrada`);
    }

    return league;
  }

  async update(id: string, updateLeagueDto: UpdateLeagueDto): Promise<League> {
    await this.findOne(id); // Verifica que existe
    return await this.leagueRepository.update(id, updateLeagueDto);
  }

  async remove(id: string): Promise<void> {
    await this.findOne(id); // Verifica que existe
    await this.leagueRepository.delete(id);
  }
}
