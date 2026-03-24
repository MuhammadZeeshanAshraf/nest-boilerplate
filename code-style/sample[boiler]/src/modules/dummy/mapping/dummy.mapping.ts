import { createMap, Mapper, MappingProfile } from '@automapper/core';
import { AutomapperProfile, InjectMapper } from '@automapper/nestjs';
import { Injectable } from '@nestjs/common';
import { Dummy } from '../entities/dummy.entity';
import { CreateDummyDto } from '../dto/request/create-dummy.dto';

@Injectable()
export class DummyMappingProfile extends AutomapperProfile {
  constructor(@InjectMapper() mapper: Mapper) {
    super(mapper);
  }

  get profile(): MappingProfile {
    return (mapper: Mapper) => {
      createMap(mapper, Dummy, CreateDummyDto);
      createMap(mapper, CreateDummyDto, Dummy);
    };
  }
}