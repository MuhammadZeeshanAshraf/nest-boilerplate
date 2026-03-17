import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { Country } from '../../../../modules/locale/entities/country.entity';
import { Currency } from '../../../../modules/locale/entities/currency.entity';
import { Language } from '../../../../modules/locale/entities/language.entity';
import { AnyRecord } from '../../../types/common-types';
import dataSource from '../../dbConfig';

@Injectable()
export class LocaleSeed {
  async seed() {
    const localeFromJson = JSON.parse(
      fs.readFileSync(path.join(__dirname, '../store/locale.json'), 'utf-8'),
    );
    const languagesFromJson = localeFromJson.map((locale) => ({
      countryCode: locale.code,
      ...locale.language,
    }));
    const languagesFromJsonNoDuplicates = this.removeDuplicates(
      languagesFromJson,
      'code',
    );
    const languageRepository = dataSource.getRepository(Language);
    const languagesFromDB = await languageRepository.find({});
    const languageCodes = languagesFromDB.map((lang) => lang.code);
    const newLanguages: any[] = languagesFromJsonNoDuplicates.filter(
      (lang) => !languageCodes.includes(lang.code),
    );
    const existingLanguages: any[] = languagesFromJsonNoDuplicates.filter(
      (lang) => languageCodes.includes(lang.code),
    );
    if (newLanguages.length > 0) {
      const languages = newLanguages.map((val: Record<any, any>) => {
        return languageRepository.create(val);
      });
      await languageRepository.save(languages);
    }

    if (existingLanguages.length > 0) {
      const updates = existingLanguages.map((val: Record<any, any>) => {
        const language = languagesFromDB.find((lang) => lang.code === val.code);
        if (language) {
          delete val.countryCode;
          return languageRepository.update({ id: language.id }, val);
        }
        return Promise.resolve();
      });
      await Promise.all(updates);
    }

    const currenciesFromJson = localeFromJson.map((locale) => ({
      countryCode: locale.code,
      ...locale.currency,
    }));
    const currenciesFromJsonNoDuplicates = this.removeDuplicates(
      currenciesFromJson,
      'code',
    );
    const currencyRepository = dataSource.getRepository(Currency);
    const currenciesFromDB = await currencyRepository.find({});
    const currencyCodes = currenciesFromDB.map((curr) => curr.code);
    const newCurrencies: any[] = currenciesFromJsonNoDuplicates.filter(
      (curr) => !currencyCodes.includes(curr.code),
    );
    const existingCurrencies: any[] = currenciesFromJsonNoDuplicates.filter(
      (curr) => currencyCodes.includes(curr.code),
    );
    if (newCurrencies.length > 0) {
      const currencies = newCurrencies.map((val: Record<any, any>) => {
        return currencyRepository.create(val);
      });

      await currencyRepository.save(currencies);
    }

    if (existingCurrencies.length > 0) {
      const updates = existingCurrencies.map((val: Record<any, any>) => {
        const currency = currenciesFromDB.find(
          (curr) => curr.code === val.code,
        );
        if (currency) {
          delete val.countryCode;
          return currencyRepository.update({ id: currency.id }, val);
        }
        return Promise.resolve();
      });
      await Promise.all(updates);
    }
    const languages = await languageRepository.find({});
    const currencies = await currencyRepository.find({});

    const countriesFromJson = JSON.parse(
      fs.readFileSync(path.join(__dirname, '../store/countries.json'), 'utf-8'),
    );
    if (!countriesFromJson || !Array.isArray(countriesFromJson)) {
      return;
    }
    const countryRepository = dataSource.getRepository(Country);
    const countriesFromDB = await countryRepository.find({});

    const alpha3Codes = countriesFromDB.map((country) => country.alpha3Code);
    const newCountries: any[] = countriesFromJson.filter(
      (country) => !alpha3Codes.includes(country.alpha3Code),
    );
    const existingCountries: any[] = countriesFromJson.filter((country) =>
      alpha3Codes.includes(country.alpha3Code),
    );
    if (newCountries.length > 0) {
      const countries = newCountries.map((val: Record<any, any>) => {
        const language = languagesFromJson.find(
          (lang) => lang.countryCode === val.alpha2Code,
        );
        if (language) {
          const languageFromDB = languages.find(
            (lang) => lang.code === language?.code,
          );
          if (languageFromDB) {
            val.languageId = languageFromDB.id;
          }
        }
        const currency = currenciesFromJson.find(
          (curr) => curr.countryCode === val.alpha2Code,
        );
        if (currency) {
          const currencyFromDB = currencies.find(
            (curr) => curr.code === currency.code,
          );
          if (currencyFromDB) {
            val.currencyId = currencyFromDB.id;
          }
        }
        return countryRepository.create(val);
      });
      await countryRepository.save(countries);
    }

    if (existingCountries.length > 0) {
      const updates = existingCountries.map((val: Record<any, any>) => {
        const country = countriesFromDB.find(
          (c) =>
            c.alpha3Code === val.alpha3Code || c.alpha2Code === val.alpha2Code,
        );
        if (country) {
          const language = languagesFromJson.find(
            (lang) => lang.countryCode === val.alpha2Code,
          );
          if (language) {
            const languageFromDB = languages.find(
              (lang) => lang.code === language?.code,
            );
            if (languageFromDB) {
              val.languageId = languageFromDB.id;
            }
          }
          const currency = currenciesFromJson.find(
            (curr) => curr.countryCode === val.alpha2Code,
          );
          if (currency) {
            const currencyFromDB = currencies.find(
              (curr) => curr.code === currency.code,
            );
            if (currencyFromDB) {
              val.currencyId = currencyFromDB.id;
            }
          }

          return countryRepository.update({ id: country.id }, val);
        }
        return Promise.resolve();
      });
      await Promise.all(updates);
    }
    const allCountriesAfterSeed = await countryRepository.find({});

    const dialingCodes = localeFromJson.map((locale) => ({
      countryCode: locale.code,
      diallingCode: locale.diallingCode,
    }));
    const dialingCodeUpdates = dialingCodes.map((val) => {
      const country = allCountriesAfterSeed.find(
        (c) =>
          c.alpha3Code === val.countryCode || c.alpha2Code === val.countryCode,
      );
      if (country) {
        return countryRepository.update(
          { id: country.id },
          { diallingCode: val.diallingCode },
        );
      }
      return Promise.resolve();
    });
    await Promise.all(dialingCodeUpdates);
  }

  removeDuplicates(data: Array<AnyRecord>, key: string) {
    const uniqueEntries = new Map();
    data.forEach((item: any) => {
      const keyValue = item[key];
      if (!uniqueEntries.has(keyValue)) {
        uniqueEntries.set(keyValue, item);
      }
    });
    return Array.from(uniqueEntries.values());
  }
}
