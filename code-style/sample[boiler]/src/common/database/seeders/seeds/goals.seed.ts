import { Injectable } from '@nestjs/common';
import slugify from 'slugify';
import { Goals } from 'src/common/constants';
import { In } from 'typeorm';
import { Goal } from '../../../../modules/onboard/entities/goals.entity';
import dataSource from '../../dbConfig';

@Injectable()
export class GoalSeed {
  async seed() {
    const goalRepository = dataSource.getRepository(Goal);
    const goalsTitles = Goals.map((goal) => goal.goal);
    const existingGoals = await goalRepository.find({
      where: {
        goal: In(goalsTitles),
      },
    });
    const newGoals = Goals.filter(
      (goal) =>
        !existingGoals.some((existingGoal) => existingGoal.goal === goal.goal),
    );
    const oldGoals = Goals.filter((goal) =>
      existingGoals.some((existingGoal) => existingGoal.goal === goal.goal),
    );
    if (newGoals.length > 0) {
      const goals = newGoals.map((val) => {
        return goalRepository.create({
          ...val,
          slug: slugify(val.goal, { lower: true, strict: true }),
        });
      });
      await goalRepository.save(goals);
    }
    const updates = oldGoals.map((goal) => {
      return goalRepository.update(
        { goal: goal.goal },
        { ...goal, slug: slugify(goal.goal, { lower: true, strict: true }) },
      );
    });
    await Promise.all(updates);
  }
}
