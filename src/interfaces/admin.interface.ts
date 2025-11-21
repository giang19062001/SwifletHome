// limit = 0, page = 0 => ALL
export interface IPaging {
  limit: number;
  page: number;
}

export interface IList<T> {
  total: number;
  list: T[];
}

export enum YnEnum {
  Y = 'Y',
  N = 'N',
}
