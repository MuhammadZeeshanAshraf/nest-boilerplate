import { Controller, Delete, Get, Patch, Post } from "@nestjs/common";
import { CreateSeedDto } from "./dto/create-seed.dto";
import { RunSeedDto } from "./dto/run-seed.dto";
import { SeedToggle } from "./dto/seed-toggle.dto";
import { SeedService } from "./seed.service";

@Controller("seed")
export class SeedController {
  constructor(private readonly seedService: SeedService) {}

  @Get("")
  async findAllSeeds() {
    return this.seedService.findAll();
  }

  @Post()
  async addSeed(@Body() seed: CreateSeedDto) {
    return this.seedService.add(seed);
  }

  @Post("run")
  async runSeed(@Body() seed: RunSeedDto) {
    return this.seedService.runFromApi(seed);
  }

  @Delete(":id")
  async deleteSeed(@Param("id") id: string) {
    return this.seedService.delete(+id);
  }

  @Patch("toggle")
  async toggleSeeds(@Body() toggleDto: SeedToggle) {
    return this.seedService.toggle(toggleDto);
  }
}
