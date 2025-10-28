// limit = 0, page = 0 => ALL
export interface IPaging {
  limit: number; 
  page: number;
}

export interface IList<T> {
  count: number;
  list: T[];
}

