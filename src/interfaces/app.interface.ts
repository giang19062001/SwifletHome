
export interface ApiAppResponse<T> {
  success: boolean;
  message: string;
  data: T;
  statusCode: number;
}
