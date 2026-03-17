/* eslint-disable no-await-in-loop */
import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import slugify from 'slugify';
import { PersonalityQuizOption } from '../../../../modules/questionies/entities/personality-quiz-option.entity';
import { PersonalityQuizQuestion } from '../../../../modules/questionies/entities/personality-quiz-question.entity';
import { SpendingPersonality } from '../../../../modules/spending-personalities/entities/spending-personality.entity';
import { spendingPersonalities } from '../../../constants';
import dataSource from '../../dbConfig';

@Injectable()
export class PersonalityQuestionSeed {
  async seed() {
    const questionRepository = dataSource.getRepository(
      PersonalityQuizQuestion,
    );
    const optionRepository = dataSource.getRepository(PersonalityQuizOption);
    const questionsDataFromJson = JSON.parse(
      fs.readFileSync(
        path.join(__dirname, '../store/questionies.json'),
        'utf-8',
      ),
    );
    const questionsData = questionsDataFromJson.map((item) => ({
      ...item,
    }));

    const existingQuestions = await questionRepository.find({
      relations: {
        options: true,
      },
    });

    const newQuestions = questionsData.filter(
      (q) => !existingQuestions.some((eq) => eq.question === q.question),
    );

    const newQuestionsPromises = newQuestions.map(async (questionData) => {
      const question = questionRepository.create({
        question: questionData.question,
        uiOrder: questionData.uiOrder,
        isActive: questionData.isActive,
      });

      const savedQuestion = await questionRepository.save(question);

      const options = questionData.options.map((optionData) =>
        optionRepository.create({
          ...optionData,
          question: savedQuestion,
        }),
      );

      return optionRepository.save(options);
    });

    await Promise.all(newQuestionsPromises);

    const updatePromises = existingQuestions.map(async (existingQuestion) => {
      const questionData = questionsData.find(
        (q) => q.question === existingQuestion.question,
      );

      if (questionData) {
        await questionRepository.update(
          { id: existingQuestion.id },
          {
            uiOrder: questionData.uiOrder,
            isActive: questionData.isActive,
          },
        );

        const optionPromises = questionData.options.map(async (optionData) => {
          const existingOption = existingQuestion.options.find(
            (o) => o.optionLabel === optionData.optionLabel,
          );

          if (existingOption) {
            return optionRepository.update(
              { id: existingOption.id },
              {
                optionText: optionData.optionText,
                uiOrder: optionData.uiOrder,
                isActive: optionData.isActive,
              },
            );
          }

          return optionRepository.save(
            optionRepository.create({
              ...optionData,
              question: existingQuestion,
            }),
          );
        });

        return Promise.all(optionPromises);
      }

      return Promise.resolve();
    });

    await Promise.all(updatePromises);

    const personalityRepository = dataSource.getRepository(SpendingPersonality);
    const personalities = await personalityRepository.find({});
    const newPersonalities = spendingPersonalities.filter(
      (p) => !personalities.find((c) => c.name === p.name),
    );
    const oldPersonalities = spendingPersonalities.filter((p) =>
      personalities.find((c) => c.name === p.name),
    );

    for (const old of oldPersonalities) {
      const newSpendingPersonality = personalities.find(
        (p) => p.name === old.name,
      );
      await personalityRepository.update(newSpendingPersonality.id, {
        ...old,
        slug: slugify(old.name, { lower: true, strict: true }),
      });
    }

    for (const newSpendingPersonality of newPersonalities) {
      await personalityRepository.save({
        ...newSpendingPersonality,
        slug: slugify(newSpendingPersonality.name, {
          lower: true,
          strict: true,
        }),
      });
    }
  }
}
