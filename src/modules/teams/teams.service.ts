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

  async findOneBySlug(slug: string): Promise<Team> {
    const team = await this.teamRepository.findOne({
      where: { slug },
      relations: ['league', 'players'],
    });

    if (!team) {
      throw new NotFoundException(`Team with Slug ${slug} not found`);
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

  async validateAndUpdate(
    slug: string,
    updateTeamDto: UpdateTeamDto,
  ): Promise<{
    hasChanges: boolean;
    changedFields?: { field: string; oldValue: any; newValue: any }[];
    team: Team;
  }> {
    const existingTeam = await this.findOneBySlug(slug);

    const changes = this.validateTeamChanges(existingTeam, updateTeamDto);

    if (!changes.hasChanges) {
      return {
        hasChanges: false,
        team: existingTeam,
      };
    }

    const updatedTeam = await this.update(existingTeam.id, updateTeamDto);

    return {
      hasChanges: true,
      changedFields: changes.changedFields,
      team: updatedTeam,
    };
  }

  private validateTeamChanges(
    existingTeam: Team,
    updateTeamDto: UpdateTeamDto,
  ): {
    hasChanges: boolean;
    changedFields: { field: string; oldValue: any; newValue: any }[];
  } {
    const changedFields: { field: string; oldValue: any; newValue: any }[] = [];

    const fieldsToCompare: (keyof UpdateTeamDto)[] = [
      'name',
      'slug',
      'leagueId',
      'city',
      'country',
      'abbr',
      'logoUrl',
      'foundationYear',
      'venue',
    ];

    for (const field of fieldsToCompare) {
      if (updateTeamDto[field] !== undefined) {
        const existingValue = existingTeam[field];
        const newValue = updateTeamDto[field];

        // Comparación especial para strings (ignorando mayúsculas/minúsculas y espacios extras)
        if (typeof existingValue === 'string' && typeof newValue === 'string') {
          if (
            existingValue.trim().toLowerCase() !== newValue.trim().toLowerCase()
          ) {
            changedFields.push({
              field,
              oldValue: existingValue,
              newValue: newValue,
            });
          }
        } else if (existingValue !== newValue) {
          changedFields.push({
            field,
            oldValue: existingValue,
            newValue: newValue,
          });
        }
      }
    }

    return {
      hasChanges: changedFields.length > 0,
      changedFields,
    };
  }
}
