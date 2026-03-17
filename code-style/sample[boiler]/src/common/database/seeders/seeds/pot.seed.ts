/* eslint-disable no-await-in-loop */
import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { IsNull } from 'typeorm';
import { PotCategoryWithPotLevelA } from '../../../../modules/pot-category/entities/pot-category-with-pot-level-a.entity';
import { PotCategory } from '../../../../modules/pot-category/entities/pot-category.entity';
import { PotLevelA } from '../../../../modules/pot/entities/pot-level-a.entity';
import { PotMcc } from '../../../../modules/pot/entities/pot-mcc.entity';
import { PotCategories } from '../../../constants';
import dataSource from '../../dbConfig';
import { PotTypeForSeeds } from '../types';

@Injectable()
export class PotSeed {
  async seed() {
    console.log('Start seeding');

    const potLevelARepository = dataSource.getRepository(PotLevelA);
    const potMccRepository = dataSource.getRepository(PotMcc);
    const potCategoryRepository = dataSource.getRepository(PotCategory);
    const potCategoryWithPotLevelARepository = dataSource.getRepository(
      PotCategoryWithPotLevelA,
    );
    const potFromJson: Array<PotTypeForSeeds> = JSON.parse(
      fs.readFileSync(
        path.join(__dirname, '../store/all-red-pot.json'),
        'utf-8',
      ),
    );
    const potLevelAsFromDB = await potLevelARepository
      .createQueryBuilder('pot')
      .where('pot.budgetId IS NULL')
      .leftJoinAndSelect('pot.potMccs', 'potMcc')
      .innerJoinAndSelect(
        'pot.potCategories',
        'potCategories',
        'potCategories.budgetId IS NULL',
      )
      .innerJoinAndSelect('potCategories.potCategory', 'potCategory')
      .getMany();

    console.log('DB pots', potLevelAsFromDB.length);

    const potCategories = await potCategoryRepository.find({
      where: { deletedAt: IsNull(), budgetId: IsNull() },
    });
    console.log('Existing categories', potCategories.length);

    const newCategoriesFiltered = PotCategories.filter(
      (p) => !potCategories.find((c) => c.name === p),
    );
    console.log('New categories to insert', newCategoriesFiltered);

    if (newCategoriesFiltered.length > 0) {
      const newCategories = await potCategoryRepository.save(
        newCategoriesFiltered.map((p) => ({ name: p, budgetId: null })),
      );
      console.log('Inserted categories', newCategories.length);
      potCategories.push(...newCategories);
    }

    const toCreatePotLevelAs = potFromJson.filter(
      (pot) => !potLevelAsFromDB.find((potDB) => potDB.name === pot.name),
    );
    console.log('Pots to create', toCreatePotLevelAs.length);

    const toUpdatePotLevelAs = potFromJson.filter((pot) =>
      potLevelAsFromDB.find((potDB) => potDB.name === pot.name),
    );
    console.log('Pots to update', toUpdatePotLevelAs.length);

    const newPots = await potLevelARepository.save(
      toCreatePotLevelAs.map((pot) => ({
        name: pot.name,
        priority: pot.priority,
        slug: pot.slug,
      })),
    );
    console.log('Inserted pots', newPots.length);

    const categoryMappings: { potLevelAId: number; potCategoryId: number }[] =
      [];
    const mccMappings: {
      code: number;
      description: string;
      priority: number;
    }[] = [];

    for (const pot of newPots) {
      const fromJSON = toCreatePotLevelAs.find((f) => f.name === pot.name);
      const { potCategory, mccp } = fromJSON;
      const categoryFromDB = potCategories.find(
        (cat) => cat.name === potCategory,
      );
      categoryMappings.push({
        potLevelAId: pot.id,
        potCategoryId: categoryFromDB.id,
      });
      mccMappings.push(
        ...mccp.map((mcc) => ({
          code: Number(mcc.code),
          description: mcc.description,
          potLevelAId: pot.id,
          priority: mcc.priority,
        })),
      );
    }
    console.log(
      'Mappings: categories',
      categoryMappings.length,
      'mccs',
      mccMappings.length,
    );

    await potCategoryWithPotLevelARepository.save(categoryMappings);
    await potMccRepository.save(mccMappings);

    // update section
    const newMccpsFromOldPots = [];
    const oldMccpsFromOldPots = [];
    const updates: Partial<PotLevelA>[] = [];
    const categoryMappingsUpdates = [];

    for (const pot of toUpdatePotLevelAs) {
      const potFromDB = potLevelAsFromDB.find((p) => p.name === pot.name);

      if (
        !potFromDB.potCategories.find(
          (catMap) =>
            catMap.potCategory?.name === pot.potCategory &&
            catMap.potCategory?.budgetId === null,
        )
      ) {
        const toChangeCategory = potFromDB.potCategories.find(
          (catMap) => catMap.potCategory?.budgetId === null,
        );
        const potCat = potCategories.find(
          (cat) => cat.name === pot.potCategory,
        );
        categoryMappingsUpdates.push({
          potCategoryId: potCat.id,
          potLevelAId: potFromDB.id,
          id: toChangeCategory.id,
        });
      }

      if (potFromDB) {
        updates.push({
          priority: pot.priority,
          id: potFromDB.id,
          slug: pot.slug,
        });
      }

      const previousMccps = potFromDB.potMccs;
      const nonExistingMccps = pot.mccp
        .filter(
          (mcc) => !previousMccps.find((mccDB) => +mccDB.code === +mcc.code),
        )
        .map((mcc) => ({ ...mcc, potLevelAId: potFromDB.id, code: +mcc.code }));
      const existingMccps = pot.mccp
        .filter((mcc) =>
          previousMccps.find((mccDB) => +mccDB.code === +mcc.code),
        )
        .map((mcc) => ({
          ...mcc,
          code: +mcc.code,
          potLevelAId: potFromDB.id,
          id: previousMccps.find((mccDB) => +mccDB.code === +mcc.code).id,
        }));
      newMccpsFromOldPots.push(...nonExistingMccps);
      oldMccpsFromOldPots.push(...existingMccps);
    }

    console.log('New MCCs from old pots', newMccpsFromOldPots.length);
    console.log('Update MCCs from old pots', oldMccpsFromOldPots.length);
    console.log('Category mapping updates', categoryMappingsUpdates.length);
    console.log('Pot updates', updates.length);

    await potMccRepository.save(newMccpsFromOldPots);
    const updatePromsies = [];
    for (const mccp of oldMccpsFromOldPots) {
      updatePromsies.push(potMccRepository.update({ id: mccp.id }, mccp));
    }
    for (const up of updates) {
      updatePromsies.push(potLevelARepository.update({ id: up.id }, up));
    }
    for (const cat of categoryMappingsUpdates) {
      updatePromsies.push(
        potCategoryWithPotLevelARepository.update({ id: cat.id }, cat),
      );
    }
    await Promise.all(updatePromsies);

    console.log('Seeding finished');
  }
}
