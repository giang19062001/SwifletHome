import { YnEnum } from 'src/interfaces/admin.interface';

export enum RequestSellPriceOptionEnum {
  SELLER = 'SELLER',
  NEGOTIATE = 'NEGOTIATE',
}

export const OPTION_CONST = {
  SIGHTSEEING: {
    mainOption: 'SIGHTSEEING',
    subOption: 'NUMBER_ATTEND',
  },
  TODO_TASK: {
    mainOption: 'TODO_TASK',
    subOption: 'MEDICINE',
  },
  REQUSET_SELL: {
    PRICE_OPTION: {
      mainOption: 'REQUSET_SELL',
      subOption: 'PRICE_OPTION',
    },
    INGREDIENT_NEST: {
      mainOption: 'REQUSET_SELL',
      subOption: 'INGREDIENT_NEST',
    },
  },
  USER_TEAM: {
    TECHNICAL_TYPE: {
      mainOption: 'USER_TEAM',
      subOption: 'TECHNICAL_TYPE',
    },
  },
};

export interface IOpition {
  seq: number;
  code: string;
  mainOption: string;
  subOption: string;
  keyOption: string;
  valueOption: string;
  sortOrder: number;
  isActive: YnEnum;
}
