import { ConfigService } from '@nestjs/config';
import { config } from 'dotenv';
import * as path from 'path';
import { DataSource } from 'typeorm';
import { PotCategoryPriority } from 'src/modules/pot/entities/pot-category-priority.entity';
import { Agreement } from '../../modules/agreement/entities/agreement.entity';
import { AppLog } from '../../modules/app-log/entities/app-log.entity';
import { BankBalance } from '../../modules/bank-account/entities/bank-account-balance.entity';
import { BankAccount } from '../../modules/bank-account/entities/bank-account.entity';
import { BankBalanceHistory } from '../../modules/bank-account/entities/bank-balance-history.entity';
import { BankType } from '../../modules/bank-account/entities/bank-type.entity';
import { CategorizedAccounts } from '../../modules/bank-account/entities/categorized-accounts.entity';
import { BudgetPot } from '../../modules/budget/entities/budget-pots.entity';
import { Budget } from '../../modules/budget/entities/budget.entity';
import { MagicBudget } from '../../modules/budget/entities/magic-budget.entity';
import { ClassificationSession } from '../../modules/classification-session/entities/classification-session.entity';
import { ExchangeRate } from '../../modules/exchange-rate/entities/exchange-rate.entity';
import { ExpenseAlias } from '../../modules/expense/entities/expense-alias.entity';
import { ExpenseAmountLeft } from '../../modules/expense/entities/expense-amount-left.entity';
import { ExpenseTransaction } from '../../modules/expense/entities/expense-transactions.entity';
import { Expense } from '../../modules/expense/entities/expense.entity';
import { RefillReference } from '../../modules/expense/entities/refill-reference.entity';
import { File } from '../../modules/files/entities/files.entity';
import { SaltEdgeCustomer } from '../../modules/gocardless/entities/salt-edge-customers.entity';
import { YapilyCustomer } from '../../modules/gocardless/entities/yapily-customers.entity';
import { HelpArticle } from '../../modules/help/entities/help-article.entity';
import { Help } from '../../modules/help/entities/help.entity';
import { IncomeSource } from '../../modules/income/entities/source.entity';
import { Invite } from '../../modules/invite/entities/invite.entity';
import { Country } from '../../modules/locale/entities/country.entity';
import { Currency } from '../../modules/locale/entities/currency.entity';
import { Language } from '../../modules/locale/entities/language.entity';
// import { MerchantTypeMapping } from '../../modules/merchant/entities/merchant-type-mapping.entity';
// import { MerchantType } from '../../modules/merchant/entities/merchant-type.entity';
import { ExpenseInformation } from '../../modules/expense/entities/expense-information.entity';
import { Merchant } from '../../modules/merchant/entities/merchant.entity';
import { Message } from '../../modules/message/entities/message.entity';
import { Goal } from '../../modules/onboard/entities/goals.entity';
import { Occupation } from '../../modules/onboard/entities/occupation.entity';
import { OnBoardingQuestionary } from '../../modules/onboard/entities/onboard-questions.entity';
import { OnBoardingStep } from '../../modules/onboard/entities/onboarding-steps.entity';
import { Otp } from '../../modules/otp/entities/otp.entity';
import { Partner } from '../../modules/partner/entities/partner.entity';
import { Invoice } from '../../modules/payment/entities/invoices.entity';
import { Payment } from '../../modules/payment/entities/payment.entity';
import { WebhookEvents } from '../../modules/payment/entities/webhook-events.entity';
import { PotCategoryWithPotLevelA } from '../../modules/pot-category/entities/pot-category-with-pot-level-a.entity';
import { PotCategory } from '../../modules/pot-category/entities/pot-category.entity';
import { PotLevelA } from '../../modules/pot/entities/pot-level-a.entity';
import { PotMcc } from '../../modules/pot/entities/pot-mcc.entity';
import { PersonalityQuizOption } from '../../modules/questionies/entities/personality-quiz-option.entity';
import { PersonalityQuizQuestion } from '../../modules/questionies/entities/personality-quiz-question.entity';
import { SpendingPersonality } from '../../modules/spending-personalities/entities/spending-personality.entity';
import { Sync } from '../../modules/sync/entities/sync.entity';
import { Token } from '../../modules/token/entities/token.entity';
import { TransactionCount } from '../../modules/transaction/entities/transaction-counts.entity';
import { TransactionPot } from '../../modules/transaction/entities/transaction-pots.entity';
import { Transaction } from '../../modules/transaction/entities/transaction.entity';
import { UserClarificationTransaction } from '../../modules/transaction/entities/user-clarification-transaction.entity';
import { UserIncomeStream } from '../../modules/user/entities/income/income-stream.entity';
import { IncomeSummary } from '../../modules/user/entities/income/income-summary.entity';
import { IncomeTransaction } from '../../modules/user/entities/income/income-transaction.entity';
import { UserOnBoardingProgress } from '../../modules/user/entities/onboarding/user-onboarding-progress.entity';
import { UserOnBoardingQuestionaryResponse } from '../../modules/user/entities/onboarding/user-onboarding-questionary-responses.entity';
import { UserOnBoardingQuestionary } from '../../modules/user/entities/onboarding/user-onboarding-questionary.entity';
import { UserAuthMethod } from '../../modules/user/entities/user/user-auth-methods.entity';
import { UserGoal } from '../../modules/user/entities/user/user-goals.entity';
import { UserOccupation } from '../../modules/user/entities/user/user-occupation.entity';
import { UserSettings } from '../../modules/user/entities/user/user-settings.entity';
import { User } from '../../modules/user/entities/user/user.entity';
import { Seed } from './seeders/entities/seed.entity';
import { Asset } from '../../modules/assets/entities/asset.entity';
import { UserGoalTarget } from '../../modules/user/entities/user/user-goal-targets.entity';
import { UserFacebookCampaign } from '../../modules/user/entities/user/user-facebook-campaign.entity';
import { UuidToEvent } from '../../modules/gocardless/entities/uuid-to-event.entity';

config();

const configService = new ConfigService();
const dataSource = new DataSource({
  type: 'postgres',
  host: configService.get<string>('DB_HOST'),
  port: configService.get<number>('DB_PORT'),
  username: configService.get<string>('DB_USERNAME'),
  password: configService.get<string>('DB_PASSWORD'),
  database: configService.get<string>('DB_NAME'),
  entities: [
    User,
    Seed,
    UserAuthMethod,
    OnBoardingStep,
    UserOnBoardingProgress,
    Otp,
    Goal,
    UserGoal,
    Agreement,
    BankAccount,
    Transaction,
    Token,
    Country,
    Language,
    Currency,
    PotLevelA,
    PotMcc,
    Sync,
    BankType,
    BankBalance,
    TransactionPot,
    PersonalityQuizQuestion,
    PersonalityQuizOption,
    Occupation,
    UserOccupation,
    SpendingPersonality,
    OnBoardingQuestionary,
    UserOnBoardingQuestionary,
    UserOnBoardingQuestionaryResponse,
    Budget,
    BudgetPot,
    IncomeSource,
    UserIncomeStream,
    Merchant,
    // MerchantType,
    // MerchantTypeMapping,
    File,
    IncomeSummary,
    Expense,
    ExpenseAlias,
    Message,
    ExpenseTransaction,
    IncomeTransaction,
    UserSettings,
    PotCategory,
    ExchangeRate,
    BankBalanceHistory,
    Invite,
    PotCategoryWithPotLevelA,
    CategorizedAccounts,
    Partner,
    SaltEdgeCustomer,
    MagicBudget,
    AppLog,
    ExpenseAmountLeft,
    YapilyCustomer,
    Help,
    HelpArticle,
    Payment,
    Invoice,
    WebhookEvents,
    TransactionCount,
    RefillReference,
    ClassificationSession,
    ExpenseInformation,
    UserClarificationTransaction,
    Asset,
    UserGoalTarget,
    PotCategoryPriority,
    UserFacebookCampaign,
    UuidToEvent,
  ],
  synchronize: false,
  logging: false,
  migrations: [path.join(__dirname, './migrations/*{.ts,.js}')],
  migrationsTableName: 'migrations',
});

export default dataSource;
