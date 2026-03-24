import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Dummy } from './entities/dummy.entity';
import { DummyController } from './dummy.controller';
import { IDummyService } from './interfaces/dummy.interface';
import { DummyRepository } from './repositories/dummy.repository';
import { IDummyRepository } from './repositories/interface/dummy.repository.interface';
import { DummyService } from './dummy.service';
import { DummyMappingProfile } from './mapping/dummy.mapping';

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
const mappings=[
  DummyMappingProfile
]
@Module({
  imports: [TypeOrmModule.forFeature(dummyEntities)],
  controllers: [DummyController],
  providers: [...dummyServiceProvider, ...dummyRepositoryProvider,...mappings],
  exports: [...dummyServiceProvider],
})
export class DummyModule {}
