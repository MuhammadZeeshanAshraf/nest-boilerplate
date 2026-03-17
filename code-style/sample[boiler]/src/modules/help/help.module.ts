import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HelpArticle } from './entities/help-article.entity';
import { Help } from './entities/help.entity';
import { HelpController } from './help.controller';
import { HelpService } from './help.service';
import { IHelpService } from './interfaces/help.interface';
import { HelpRepository } from './repositories/help.repository';
import { IHelpRepository } from './repositories/interface/help.repository.interface';

const helpEntities = [Help, HelpArticle];
const helpRepositoryProvider = [
  {
    provide: IHelpRepository,
    useClass: HelpRepository,
  },
];
const helpServiceProvider = [
  {
    provide: IHelpService,
    useClass: HelpService,
  },
];
@Module({
  imports: [TypeOrmModule.forFeature(helpEntities)],
  controllers: [HelpController],
  providers: [...helpServiceProvider, ...helpRepositoryProvider],
  exports: [...helpServiceProvider],
})
export class HelpModule {}
