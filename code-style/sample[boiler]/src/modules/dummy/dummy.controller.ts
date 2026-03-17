import { Controller, Get, Inject, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { DOMAIN_ENTITY, JWT, X_API_KEY } from '../../common/constants';
import { PaginationDto } from '../../common/dtos/request/pagination.dto';
import { AuthGuard } from '../../common/guards/auth.guard';
import { IDummyService } from './interfaces/dummy.interface';

@ApiTags(DOMAIN_ENTITY.DUMMY)
@ApiBearerAuth(X_API_KEY)
@ApiBearerAuth(JWT)
@UseGuards(AuthGuard)
@Controller('dummy')
export class DummyController {
  constructor(
    @Inject(IDummyService) private readonly dummyService: IDummyService,
  ) {}

  @Get()
  findAll(@Query() paginationDto: PaginationDto) {
    return this.dummyService.findAll(paginationDto);
  }
}
