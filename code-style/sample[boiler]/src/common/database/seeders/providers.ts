import { BankTypeSeed } from './seeds/bank-types.seed';

import { GoalSeed } from './seeds/goals.seed';
import { HelpSeed } from './seeds/help.seed';
import { LocaleSeed } from './seeds/locale.seed';
import { MessageSeed } from './seeds/messages.seed';
import { OccupationSeed } from './seeds/occupations.seed';
import { OnBoardingQuestionarySeed } from './seeds/onboarding-questionnaires.seed';
import { OnBoardingStepSeed } from './seeds/onboarding-steps.seed';
import { PotSeed } from './seeds/pot.seed';
import { PersonalityQuestionSeed } from './seeds/questionies.seed';

export const seedProviders = [
  OnBoardingStepSeed,
  GoalSeed,
  LocaleSeed,
  BankTypeSeed,
  PotSeed,
  PersonalityQuestionSeed,
  OccupationSeed,
  OnBoardingQuestionarySeed,
  MessageSeed,
  HelpSeed,
];
