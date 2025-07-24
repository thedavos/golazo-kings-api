import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Player } from '@/modules/players/domain/entities/player.entity';
import { CreatePlayerDto } from './dto/create-player.dto';
import { UpdatePlayerDto } from './dto/update-player.dto';

@Injectable()
export class PlayersService {
  constructor(
    @InjectRepository(Player)
    private readonly playerRepository: Repository<Player>,
  ) {}

  async create(createPlayerDto: CreatePlayerDto): Promise<Player> {
    const newPlayer = this.playerRepository.create(createPlayerDto);
    return this.playerRepository.save(newPlayer);
  }

  async findAll(teamId?: number): Promise<Player[]> {
    const queryOptions = teamId ? { where: { teamId } } : {};
    return this.playerRepository.find({
      ...queryOptions,
    });
  }

  async findOne(id: number): Promise<Player> {
    const player = await this.playerRepository.findOne({
      where: { id },
      relations: ['team'],
    });

    if (!player) {
      throw new NotFoundException(`Player with ID ${id} not found`);
    }

    return player;
  }

  async findBySlug(slug: string): Promise<Player> {
    const player = await this.playerRepository.findOne({
      where: { slug },
      relations: ['team'],
    });

    if (!player) {
      throw new NotFoundException(`Player with Slug ${slug} not found`);
    }

    return player;
  }

  async update(id: number, updatePlayerDto: UpdatePlayerDto): Promise<Player> {
    const player = await this.playerRepository.preload({
      id: id,
      ...updatePlayerDto,
    });

    if (!player) {
      throw new NotFoundException(`Player with ID ${id} not found`);
    }

    return this.playerRepository.save(player);
  }

  async remove(id: number): Promise<void> {
    const result = await this.playerRepository.delete(id);

    if (result.affected === 0) {
      throw new NotFoundException(`Player with ID ${id} not found`);
    }
  }
}
