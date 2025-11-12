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

export interface ApiAppResponse<T> {
  success: boolean;
  message: string;
  data: T;
  statusCode: number;
}