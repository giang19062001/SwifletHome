
export interface IListApp<T> {
  total: number;
  limit: number;
  page: number;
  list: T[];
}
export interface ApiAppResponse<T> {
  success: boolean;
  message: string;
  data: T;
  statusCode: number;
}
