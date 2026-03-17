import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { ColoredLogger } from 'src/common/logger/logger.service';
import { RESPONSE_MESSAGES } from '../../constants';
import { TOGGLE_ON_OFF } from '../../constants/enums';
import { CreateSeedDto } from './dto/create-seed.dto';
import { RunSeedDto } from './dto/run-seed.dto';
import { SeedToggle } from './dto/seed-toggle.dto';
import { Seed } from './entities/seed.entity';
import { seedProviders } from './providers';

@Injectable()
export class SeedService {
  constructor(
    @InjectRepository(Seed) private readonly seedRepository: Repository<Seed>,
  ) {}

  async findAllSeeds(): Promise<Seed[]> {
    return await this.seedRepository.find();
  }

  async addSeed(seedDto: CreateSeedDto): Promise<string> {
    const { seeds } = seedDto;
    await this.seedRepository.save(seeds);
    return RESPONSE_MESSAGES.CREATED;
  }

  async runSeedFromApi(seedDto: RunSeedDto): Promise<string> {
    const { seeds } = seedDto;
    return this.runSeeds(seeds);
  }

  async deleteSeed(id: number): Promise<string> {
    await this.seedRepository.delete(id);
    return RESPONSE_MESSAGES.DELETED;
  }

  async runSeeds(seeds: string[]): Promise<string> {
    const seedsSet = new Set<string>(seeds);
    const uniqueSeeds = Array.from(seedsSet);
    const toSeed = seedProviders
      .map((provider) =>
        uniqueSeeds.includes(provider.name) ? provider : null,
      )
      .filter(Boolean);
    for await (const Seed of toSeed) {
      const newSeed = new Seed(new ColoredLogger());
      await newSeed.seed();
    }
    return RESPONSE_MESSAGES.SUCCESSFUL_OPERATION;
  }

  async toggleSeed(toggleDto: SeedToggle): Promise<string> {
    const { ids, toggle } = toggleDto;
    await this.seedRepository.update(
      { id: In(ids) },
      { seed: toggle !== TOGGLE_ON_OFF.OFF },
    );
    return RESPONSE_MESSAGES.CREATED;
  }
}
