import { Injectable } from '@nestjs/common';
import { BankTypes } from 'src/common/constants';
import { BankType } from '../../../../modules/bank-account/entities/bank-type.entity';
import dataSource from '../../dbConfig';

@Injectable()
export class BankTypeSeed {
  async seed() {
    const bankTypeRepository = dataSource.getRepository(BankType);
    const existingBankTypes = await bankTypeRepository.find({});
    const newBankTypes = BankTypes.filter(
      (bankType) =>
        !existingBankTypes.some(
          (existingBankType) => existingBankType.slug === bankType.slug,
        ),
    );
    const oldBankTypes = BankTypes.filter((bankType) =>
      existingBankTypes.some(
        (existingBankType) => existingBankType.slug === bankType.slug,
      ),
    );
    const updates = oldBankTypes.map((bankType) => {
      return bankTypeRepository.update({ slug: bankType.slug }, bankType);
    });
    await Promise.all(updates);
    if (newBankTypes.length > 0) {
      const bankTypes = newBankTypes.map((val) => {
        return bankTypeRepository.create(val);
      });

      await bankTypeRepository.save(bankTypes);
    }
  }
}
