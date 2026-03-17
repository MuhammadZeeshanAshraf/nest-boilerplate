import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Dummy } from './entities/dummy.entity';
import { DummyController } from './dummy.controller';
import { IDummyService } from './interfaces/dummy.interface';
import { DummyRepository } from './repositories/dummy.repository';
import { IDummyRepository } from './repositories/interface/dummy.repository.interface';
import { DummyService } from './dummy.service';

const dummyEntities = [Dummy];
const dummyRepositoryProvider = [
  {
    provide: IDummyRepository,
    useClass: DummyRepository,
  },
];
const dummyServiceProvider = [
  {
    provide: IDummyService,
    useClass: DummyService,
  },
];
@Module({
  imports: [TypeOrmModule.forFeature(dummyEntities)],
  controllers: [DummyController],
  providers: [...dummyServiceProvider, ...dummyRepositoryProvider],
  exports: [...dummyServiceProvider],
})
export class DummyModule {}
