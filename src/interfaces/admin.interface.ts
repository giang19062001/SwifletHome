// limit = 0, page = 0 => ALL
export interface IPaging {
  limit: number;
  page: number;
}

export interface ApiMutationResponse {
  success: boolean;
  message: string;
  data?: any;
}

export enum YnEnum {
  Y = 'Y',
  N = 'N',
}

export enum TeamStatusEnum {
  APPROVE = 'APPROVE',
  REFUSE = 'REFUSE',
  WAITING = 'WAITING',
}
