import { Injectable } from '@nestjs/common';
import { In } from 'typeorm';
import { Goal } from '../../../../modules/onboard/entities/goals.entity';
import { OnBoardingQuestionary } from '../../../../modules/onboard/entities/onboard-questions.entity';
import { OnBoardingQuestionnaires } from '../../../constants';
import dataSource from '../../dbConfig';

@Injectable()
export class OnBoardingQuestionarySeed {
  async seed() {
    const questionaryRepository = dataSource.getRepository(
      OnBoardingQuestionary,
    );
    const goalRepository = dataSource.getRepository(Goal);
    const allGoals = await goalRepository.find();
    const questionaryIdentifiers = OnBoardingQuestionnaires.map(
      (question) => question.identifier,
    );
    const existingQuestionnaires = await questionaryRepository.find({
      where: {
        identifier: In(questionaryIdentifiers),
      },
    });
    const newQuestionnaires = OnBoardingQuestionnaires.filter(
      (question) =>
        !existingQuestionnaires.some(
          (existingQuestion) =>
            existingQuestion.identifier === question.identifier,
        ),
    );
    const oldQuestionnaires = OnBoardingQuestionnaires.filter((question) =>
      existingQuestionnaires.some(
        (existingQuestion) =>
          existingQuestion.identifier === question.identifier,
      ),
    );
    if (newQuestionnaires.length > 0) {
      const questionnaires = newQuestionnaires.map((val) => {
        if (val.goalIdentifier) {
          const goal = allGoals.find(
            (goal) => goal.goal === val.goalIdentifier,
          );
          if (!goal) return undefined;
          val.goalId = goal.id;
        }
        return questionaryRepository.create(val);
      });
      await questionaryRepository.save(questionnaires);
    }
    const updates = oldQuestionnaires.map((val) => {
      if (val.goalIdentifier) {
        const goal = allGoals.find((goal) => goal.goal === val.goalIdentifier);
        if (!goal) return undefined;
        val.goalId = goal.id;
      }
      delete val.goalIdentifier;
      return questionaryRepository.update({ identifier: val.identifier }, val);
    });
    await Promise.all(updates);
  }
}
