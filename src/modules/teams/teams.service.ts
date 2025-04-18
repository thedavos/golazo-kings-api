import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Team } from '@/modules/teams/domain/entities/team.entity';
import { CreateTeamDto } from './dto/create-team.dto';
import { UpdateTeamDto } from './dto/update-team.dto';

@Injectable()
export class TeamsService {
  constructor(
    @InjectRepository(Team)
    private readonly teamRepository: Repository<Team>,
  ) {}

  async create(createTeamDto: CreateTeamDto): Promise<Team> {
    const newTeam = this.teamRepository.create(createTeamDto);
    return this.teamRepository.save(newTeam);
  }

  async findAll(leagueId?: number): Promise<Team[]> {
    const queryOptions = leagueId ? { where: { leagueId } } : {};
    return this.teamRepository.find({
      ...queryOptions,
    });
  }

  async findOne(id: number): Promise<Team> {
    const team = await this.teamRepository.findOne({
      where: { id },
      relations: ['league', 'players'],
    });

    if (!team) {
      throw new NotFoundException(`Team with ID ${id} not found`);
    }

    return team;
  }

  async update(id: number, updateTeamDto: UpdateTeamDto): Promise<Team> {
    const team = await this.teamRepository.preload({
      id: id,
      ...updateTeamDto,
    });

    if (!team) {
      throw new NotFoundException(`Team with ID ${id} not found`);
    }

    return this.teamRepository.save(team);
  }

  async remove(id: number): Promise<void> {
    const result = await this.teamRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Team with ID ${id} not found`);
    }
  }
}
