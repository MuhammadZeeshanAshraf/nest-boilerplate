import { Injectable } from "@nestjs/common";
import { In, Repository } from "typeorm";
import { CreateSeedDto } from "./dto/create-seed.dto";
import { RunSeedDto } from "./dto/run-seed.dto";
import { SeedToggle } from "./dto/seed-toggle.dto";
import { Seed } from "./entities/seed.entity";
import { seedProviders } from "./providers";

@Injectable()
export class SeedService {
  constructor(
    @InjectRepository(Seed) private readonly seedRepository: Repository<Seed>,
  ) {}

  async findAll(): Promise<Seed[]> {
    return await this.seedRepository.find();
  }

  async add(seedDto: CreateSeedDto): Promise<string> {
    const { seeds } = seedDto;
    await this.seedRepository.save(seeds);
    return "Created";
  }

  async runFromApi(seedDto: RunSeedDto): Promise<string> {
    const { seeds } = seedDto;
    return this.run(seeds);
  }

  async delete(id: number): Promise<string> {
    await this.seedRepository.delete(id);
    return "Deleted";
  }

  async run(seeds: string[]): Promise<string> {
    const seedsSet = new Set<string>(seeds);
    const uniqueSeeds = Array.from(seedsSet);
    const toSeed = seedProviders
      .map((provider) =>
        uniqueSeeds.includes(provider.name) ? provider : null,
      )
      .filter(Boolean);
    for await (const Seed of toSeed) {
      const newSeed = new Seed();
      await newSeed.seed();
    }
    return "Successful operation";
  }

  async toggle(toggleDto: SeedToggle): Promise<string> {
    const { ids, toggle } = toggleDto;
    await this.seedRepository.update(
      { id: In(ids) },
      { seed: toggle !== "off" },
    );
    return "Created";
  }
}
