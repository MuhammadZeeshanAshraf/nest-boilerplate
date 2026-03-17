import { Injectable } from '@nestjs/common';
import { OnBoardingSteps } from 'src/common/constants';
import { IsNull, Not } from 'typeorm';
import { OnBoardingStep } from '../../../../modules/onboard/entities/onboarding-steps.entity';
import dataSource from '../../dbConfig';

@Injectable()
export class OnBoardingStepSeed {
  async seed() {
    const onboardingStepRepository = dataSource.getRepository(OnBoardingStep);
    const existingSteps = await onboardingStepRepository.find({});
    await onboardingStepRepository.update(
      { order: Not(IsNull()) },
      {
        order: 0,
      },
    );
    const newSteps = OnBoardingSteps.filter(
      (step) =>
        !existingSteps.some(
          (existingStep) => existingStep.title === step.title,
        ),
    );
    const oldSteps = OnBoardingSteps.filter((step) =>
      existingSteps.some((existingStep) => existingStep.title === step.title),
    );
    const updates = oldSteps.map((step) => {
      return onboardingStepRepository.update({ title: step.title }, step);
    });
    await Promise.all(updates);
    if (newSteps.length > 0) {
      const steps = newSteps.map((val) => {
        return onboardingStepRepository.create(val);
      });

      await onboardingStepRepository.save(steps);
    }
  }
}
