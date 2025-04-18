import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { League } from '@modules/leagues/domain/entities/league.entity';

@Injectable()
export class LeagueRepository {
  constructor(
    @InjectRepository(League)
    private readonly repository: Repository<League>,
  ) {}

  async create(league: Partial<League>): Promise<League> {
    const newLeague = this.repository.create(league);
    return await this.repository.save(newLeague);
  }

  async findAll(): Promise<League[]> {
    return await this.repository.find({
      relations: ['seasons'],
    });
  }

  async findById(id: string): Promise<League | null> {
    return await this.repository.findOne({
      where: { id },
      relations: ['seasons'],
    });
  }

  async findBySlug(slug: string): Promise<League | null> {
    return await this.repository.findOne({
      where: { slug },
      relations: ['seasons'],
    });
  }

  async update(id: string, data: Partial<League>): Promise<League> {
    await this.repository.update(id, data);
    return (await this.findById(id)) as League;
  }

  async delete(id: string): Promise<void> {
    await this.repository.delete(id);
  }
}
