import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { X_API_KEY } from '../../constants';
import { IdDto } from '../../dtos/request/id.dto';
import { CreateSeedDto } from './dto/create-seed.dto';
import { RunSeedDto } from './dto/run-seed.dto';
import { SeedToggle } from './dto/seed-toggle.dto';
import { SeedService } from './seed.service';

@ApiBearerAuth(X_API_KEY)
@Controller('seed')
export class SeedController {
  constructor(private readonly seedService: SeedService) {}

  @Get('')
  async findAllSeeds() {
    return this.seedService.findAllSeeds();
  }

  @Post()
  async addSeed(@Body() seed: CreateSeedDto) {
    return this.seedService.addSeed(seed);
  }

  @Post('run')
  async runSeed(@Body() seed: RunSeedDto) {
    return this.seedService.runSeedFromApi(seed);
  }

  @Delete(':id')
  async deleteSeed(@Param() idDto: IdDto) {
    const { id } = idDto;
    return this.seedService.deleteSeed(id);
  }

  @Patch('toggle')
  async toggleSeeds(@Body() toggleDto: SeedToggle) {
    return this.seedService.toggleSeed(toggleDto);
  }
}
