import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PagedList } from '../common/types/paged-list';
import { CreateExampleDto } from './dto/create-example.dto';
import { QueryExamplesDto } from './dto/query-examples.dto';
import { UpdateExampleDto } from './dto/update-example.dto';
import { Example } from './entities/example.entity';

@Injectable()
export class ExamplesService {
  constructor(
    @InjectRepository(Example)
    private readonly repo: Repository<Example>,
  ) {}

  create(dto: CreateExampleDto): Promise<Example> {
    const entity = this.repo.create(dto);
    return this.repo.save(entity);
  }

  async list(query: QueryExamplesDto): Promise<PagedList<Example>> {
    const qb = this.repo.createQueryBuilder('e');

    if (query.search) {
      qb.where('e.name ILIKE :search', { search: `%${query.search}%` });
    }

    const [data, totalCount] = await qb
      .orderBy('e.createdAt', 'DESC')
      .skip((query.page - 1) * query.take)
      .take(query.take)
      .getManyAndCount();

    return new PagedList(data, totalCount, query.take, query.page);
  }

  async findOne(id: string): Promise<Example> {
    const entity = await this.repo.findOne({ where: { id } });
    if (!entity) {
      throw new NotFoundException(`Example ${id} not found`);
    }
    return entity;
  }

  async update(id: string, dto: UpdateExampleDto): Promise<Example> {
    const entity = await this.findOne(id);
    Object.assign(entity, dto);
    return this.repo.save(entity);
  }

  async remove(id: string): Promise<void> {
    const result = await this.repo.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Example ${id} not found`);
    }
  }
}
