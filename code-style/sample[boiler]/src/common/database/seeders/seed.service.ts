import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { BankType } from '../../../modules/bank-account/entities/bank-type.entity';
import { HelpArticle } from '../../../modules/help/entities/help-article.entity';
import { Help } from '../../../modules/help/entities/help.entity';
import { Country } from '../../../modules/locale/entities/country.entity';
import { Currency } from '../../../modules/locale/entities/currency.entity';
import { Goal } from '../../../modules/onboard/entities/goals.entity';
import { Occupation } from '../../../modules/onboard/entities/occupation.entity';
import { OnBoardingQuestionary } from '../../../modules/onboard/entities/onboard-questions.entity';
import { OnBoardingStep } from '../../../modules/onboard/entities/onboarding-steps.entity';
import { PotCategoryWithPotLevelA } from '../../../modules/pot-category/entities/pot-category-with-pot-level-a.entity';
import { PotCategory } from '../../../modules/pot-category/entities/pot-category.entity';
import { PotLevelA } from '../../../modules/pot/entities/pot-level-a.entity';
import { PotMcc } from '../../../modules/pot/entities/pot-mcc.entity';
import { PersonalityQuizOption } from '../../../modules/questionies/entities/personality-quiz-option.entity';
import { PersonalityQuizQuestion } from '../../../modules/questionies/entities/personality-quiz-question.entity';
import { RESPONSE_MESSAGES } from '../../constants';
import { TOGGLE_ON_OFF } from '../../constants/enums';
import { ColoredLogger } from '../../logger/logger.service';
import dataSource from '../dbConfig';
import { CreateSeedDto } from './dto/create-seed.dto';
import { RunSeedDto } from './dto/run-seed.dto';
import { SeedToggle } from './dto/seed-toggle.dto';
import { Seed } from './entities/seed.entity';
import { seedProviders } from './providers';
import { Language } from '../../../modules/locale/entities/language.entity';
import { Message } from '../../../modules/message/entities/message.entity';

@Injectable()
export class SeedService {
  constructor(
    @InjectRepository(Seed) private readonly seedRepository: Repository<Seed>,
  ) {}

  async verifySeedData(seedDto: RunSeedDto) {
    const { seeds } = seedDto;
    const seed = seeds[0];
    switch (seed) {
      case 'OnBoardingStepSeed': {
        const onboardingStepRepository =
          dataSource.getRepository(OnBoardingStep);
        return onboardingStepRepository.find({});
      }
      case 'GoalSeed': {
        const goalRepository = dataSource.getRepository(Goal);
        return goalRepository.find({});
      }
      case 'LocaleSeed': {
        const languageRepository = dataSource.getRepository(Language);
        const currencyRepository = dataSource.getRepository(Currency);
        const countryRepository = dataSource.getRepository(Country);
        return Promise.all([
          languageRepository.find({}),
          currencyRepository.find({}),
          countryRepository.find({}),
        ]);
      }
      case 'BankTypeSeed': {
        const bankTypeRepository = dataSource.getRepository(BankType);
        return bankTypeRepository.find({});
      }
      case 'PotSeed': {
        const potLevelARepository = dataSource.getRepository(PotLevelA);
        const potMccRepository = dataSource.getRepository(PotMcc);
        const potCategoryRepository = dataSource.getRepository(PotCategory);
        const potCategoryWithPotLevelARepository = dataSource.getRepository(
          PotCategoryWithPotLevelA,
        );
        return Promise.all([
          potLevelARepository.find({}),
          potMccRepository.find({}),
          potCategoryRepository.find({}),
          potCategoryWithPotLevelARepository.find({}),
        ]);
      }
      case 'PersonalityQuestionSeed': {
        const questionRepository = dataSource.getRepository(
          PersonalityQuizQuestion,
        );
        const optionRepository = dataSource.getRepository(
          PersonalityQuizOption,
        );
        return Promise.all([
          questionRepository.find({}),
          optionRepository.find({}),
        ]);
      }
      case 'OccupationSeed': {
        const occupationRepository = dataSource.getRepository(Occupation);
        return occupationRepository.find({});
      }
      case 'OnBoardingQuestionarySeed': {
        const questionaryRepository = dataSource.getRepository(
          OnBoardingQuestionary,
        );
        return questionaryRepository.find({});
      }
      case 'MessageSeed': {
        const messagesRepository = dataSource.getRepository(Message);
        return messagesRepository.find({});
      }
      case 'HelpSeed': {
        const helpRepo = dataSource.getRepository(Help);
        const articleRepo = dataSource.getRepository(HelpArticle);
        return Promise.all([helpRepo.find({}), articleRepo.find({})]);
      }
    }
  }

  async findAllSeeds(): Promise<Seed[]> {
    return await this.seedRepository.find();
  }

  async addSeed(seedDto: CreateSeedDto): Promise<string> {
    const { seeds } = seedDto;
    await this.seedRepository.save(seeds);
    return RESPONSE_MESSAGES.CREATED;
  }

  async runSeedFromApi(seedDto: RunSeedDto): Promise<string> {
    const { seeds } = seedDto;
    return this.runSeeds(seeds);
  }

  async deleteSeed(id: number): Promise<string> {
    await this.seedRepository.delete(id);
    return RESPONSE_MESSAGES.DELETED;
  }

  async runSeeds(seeds: string[]): Promise<string> {
    const seedsSet = new Set<string>(seeds);
    const uniqueSeeds = Array.from(seedsSet);
    const toSeed = seedProviders
      .map((provider) =>
        uniqueSeeds.includes(provider.name) ? provider : null,
      )
      .filter(Boolean);
    for await (const Seed of toSeed) {
      const newSeed = new Seed(new ColoredLogger());
      await newSeed.seed();
    }
    return RESPONSE_MESSAGES.SUCCESSFUL_OPERATION;
  }

  async toggleSeed(toggleDto: SeedToggle): Promise<string> {
    const { ids, toggle } = toggleDto;
    await this.seedRepository.update(
      { id: In(ids) },
      { seed: toggle !== TOGGLE_ON_OFF.OFF },
    );
    return RESPONSE_MESSAGES.CREATED;
  }
}
