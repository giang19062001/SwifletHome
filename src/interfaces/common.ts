// limit = 0, page = 0 => ALL
export interface IPaging {
  limit: number;
  page: number;
}

export interface IList<T> {
  total: number;
  list: T[];
}

export interface IListApp<T> {
  total: number;
  limit: number;
  page: number;
  list: T[];
}



export enum IsFreeEnum {
  Y = 'Y',
  N = 'N',
}