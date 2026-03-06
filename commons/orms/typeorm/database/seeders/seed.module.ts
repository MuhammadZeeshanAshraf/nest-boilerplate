import { Module, OnModuleInit } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import * as dotenv from "dotenv";
import dataSource from "../dbConfig";
import { Seed } from "./entities/seed.entity";
import { seedProviders } from "./providers";
import { SeedController } from "./seed.controller";
import { SeedService } from "./seed.service";

dotenv.config();
@Module({
  imports: [TypeOrmModule.forFeature([])],
  controllers: [SeedController],
  providers: [...seedProviders, SeedService],
  exports: [...seedProviders, SeedService],
})
export class SeederModule implements OnModuleInit {
  constructor(@Inject(SeedService) private readonly seedService: SeedService) {}

  async onModuleInit() {
    await dataSource.initialize();
    const seedRepository = dataSource.getRepository(Seed);
    const seedData = await seedRepository.find();
    const names = seedData
      .filter((toSeed) => toSeed.seed)
      .map((toSeed) => toSeed.name);
    await this.seedService.runSeeds(names);
  }
}
