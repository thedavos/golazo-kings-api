import { Repository } from 'typeorm';
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { President } from './domain/entities/president.entity';
import { Team } from '@/modules/teams/domain/entities/team.entity';
import { League } from '@/modules/leagues/domain/entities/league.entity';
import { CreatePresidentDto } from './dto/create-president.dto';
import { UpdatePresidentDto } from './dto/update-president.dto';

@Injectable()
export class PresidentsService {
  constructor(
    @InjectRepository(President)
    private readonly presidentsRepository: Repository<President>,
    @InjectRepository(Team)
    private readonly teamsRepository: Repository<Team>,
    @InjectRepository(League)
    private readonly leaguesRepository: Repository<League>,
  ) {}

  async create(createPresidentDto: CreatePresidentDto): Promise<President> {
    const team = await this.teamsRepository.findOneBy({
      id: createPresidentDto.teamId,
    });

    if (!team) {
      throw new NotFoundException(
        `Team with ID ${createPresidentDto.teamId} not found`,
      );
    }

    const president = this.presidentsRepository.create(createPresidentDto);
    return this.presidentsRepository.save(president);
  }

  async findAll(): Promise<President[]> {
    return this.presidentsRepository.find();
  }

  async findOne(id: number): Promise<President> {
    const president = await this.presidentsRepository.findOne({
      where: { id },
      relations: ['team'],
    });

    if (!president) {
      throw new NotFoundException(`President with ID ${id} not found`);
    }

    return president;
  }

  async findOneByUuid(uuid: string): Promise<President> {
    const president = await this.presidentsRepository.findOne({
      where: { uuid },
      relations: ['team'],
    });

    if (!president) {
      throw new NotFoundException(`President with UUID ${uuid} not found`);
    }

    return president;
  }

  async update(
    id: number,
    updatePresidentDto: UpdatePresidentDto,
  ): Promise<President> {
    if (updatePresidentDto.teamId) {
      const team = await this.teamsRepository.findOneBy({
        id: updatePresidentDto.teamId,
      });

      if (!team) {
        throw new NotFoundException(
          `Team with ID ${updatePresidentDto.teamId} not found`,
        );
      }
    }

    const president = await this.presidentsRepository.preload({
      id: id,
      ...updatePresidentDto,
    });

    if (!president) {
      throw new NotFoundException(`President with ID ${id} not found`);
    }

    return this.presidentsRepository.save(president);
  }

  async remove(id: number): Promise<void> {
    await this.findOne(id); // Reutiliza findOne para verificar existencia
    const result = await this.presidentsRepository.delete(id);

    if (result.affected === 0) {
      throw new NotFoundException(`President with ID ${id} not found`);
    }
  }

  async findActivePresidentsByTeam(teamId: number): Promise<President[]> {
    const team = await this.teamsRepository.findOneBy({ id: teamId });

    if (!team) {
      throw new NotFoundException(`Team with ID ${teamId} not found`);
    }

    return this.presidentsRepository.find({
      where: { teamId: teamId, isActive: true },
    });
  }

  async findPresidentHistoryByTeam(teamId: number): Promise<President[]> {
    const team = await this.teamsRepository.findOneBy({ id: teamId });

    if (!team) {
      throw new NotFoundException(`Team with ID ${teamId} not found`);
    }

    return this.presidentsRepository.find({
      where: { teamId: teamId },
      order: { termStartDate: 'DESC' },
    });
  }

  async findActivePresidentsByLeague(leagueUuid: string): Promise<President[]> {
    const leagueExists = await this.leaguesRepository.findOneBy({
      uuid: leagueUuid,
    });

    if (!leagueExists) {
      throw new NotFoundException(`League with ID ${leagueUuid} not found`);
    }

    return this.presidentsRepository
      .createQueryBuilder('president')
      .innerJoin('president.team', 'team')
      .where('president.isActive = true')
      .where('team.leagueId = :leagueId', { leagueId: leagueExists.id })
      .orderBy('president.lastName', 'ASC')
      .addOrderBy('president.firstName', 'ASC')
      .getMany();
  }
}
