import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { PagedList } from '../common/types/paged-list';
import { CreateExampleDto } from './dto/create-example.dto';
import { QueryExamplesDto } from './dto/query-examples.dto';
import { UpdateExampleDto } from './dto/update-example.dto';
import { Example } from './entities/example.entity';
import { ExamplesService } from './examples.service';

/**
 * Reference resource demonstrating the boilerplate's CRUD pattern:
 * entity + DTOs (with class-validator + Swagger) + service +
 * controller + migration + e2e test. Delete or replace when you start
 * a real project.
 */
@ApiTags('Examples')
@Controller('examples')
export class ExamplesController {
  constructor(private readonly examples: ExamplesService) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  create(@Body() dto: CreateExampleDto): Promise<Example> {
    return this.examples.create(dto);
  }

  @Get()
  list(@Query() query: QueryExamplesDto): Promise<PagedList<Example>> {
    return this.examples.list(query);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string): Promise<Example> {
    return this.examples.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateExampleDto,
  ): Promise<Example> {
    return this.examples.update(id, dto);
  }

  @Delete(':id')
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<{ deleted: true }> {
    await this.examples.remove(id);
    return { deleted: true };
  }
}
