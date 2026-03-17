import { Injectable } from '@nestjs/common';
import { In } from 'typeorm';
import { Occupation } from '../../../../modules/onboard/entities/occupation.entity';
import { Occupations } from '../../../constants';
import { ColoredLogger } from '../../../logger/logger.service';
import dataSource from '../../dbConfig';

@Injectable()
export class OccupationSeed {
  constructor(private readonly logger: ColoredLogger) {}

  async seed() {
    try {
      const occupationRepository = dataSource.getRepository(Occupation);
      const occupationsTitles = Occupations.map(
        (occupation) => occupation.occupation,
      );
      const existingOccupations = await occupationRepository.find({
        where: {
          occupation: In(occupationsTitles),
        },
      });
      const newOccupations = Occupations.filter(
        (occupation) =>
          !existingOccupations.some(
            (existingOccupation) =>
              existingOccupation.occupation === occupation.occupation,
          ),
      );
      const oldOccupations = Occupations.filter((occupation) =>
        existingOccupations.some(
          (existingOccupation) =>
            existingOccupation.occupation === occupation.occupation,
        ),
      );
      if (newOccupations.length > 0) {
        const occupations = Occupations.map((val) => {
          return occupationRepository.create(val);
        });
        await occupationRepository.save(occupations);
      }
      const updates = oldOccupations.map((occupation) => {
        return occupationRepository.update(
          { occupation: occupation.occupation },

          occupation,
        );
      });
      await Promise.all(updates);
      this.logger.log('Occupations seeded successfully');
    } catch (error) {
      this.logger.error(error);
      throw error;
    }
  }
}
