import {
  Controller,
  Get,
  Inject,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { DOMAIN_ENTITY, JWT, X_API_KEY } from '../../common/constants';
import { IdDto } from '../../common/dtos/request/id.dto';
import { PaginationDto } from '../../common/dtos/request/pagination.dto';
import { AuthGuard } from '../../common/guards/auth.guard';
import { IHelpService } from './interfaces/help.interface';

@ApiTags(DOMAIN_ENTITY.HELP)
@ApiBearerAuth(X_API_KEY)
@ApiBearerAuth(JWT)
@UseGuards(AuthGuard)
@Controller('help')
export class HelpController {
  constructor(
    @Inject(IHelpService) private readonly helpService: IHelpService,
  ) {}

  @Get()
  findAll(@Query() paginationDto: PaginationDto) {
    return this.helpService.findAll(paginationDto);
  }

  @Get(':id')
  findWithArticles(@Param() idDto: IdDto) {
    const { id } = idDto;
    return this.helpService.findOne(id);
  }
}
