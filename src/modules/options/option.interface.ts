import { YnEnum } from 'src/interfaces/admin.interface';

export const OPTION_CONST = {
  SIGHTSEEING: {
    mainOption: 'SIGHTSEEING',
    subOption: 'NUMBER_ATTEND',
  },
  TODO_TASK: {
    mainOption: 'TODO_TASK',
    subOption: 'MEDICINE',
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
