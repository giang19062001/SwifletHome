// limit = 0, page = 0 => ALL
export interface IPaging {
  limit: number;
  page: number;
}

export enum YnEnum {
  Y = 'Y',
  N = 'N',
}

export interface ApiMutationResponse {
  success: boolean;
  message: string;
  data?: any;
}
