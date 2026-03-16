import { GetContentScreenResDto } from "./screen.response";

export interface IScreenStrategy {
  canHandle(keyword: string): boolean;
  execute(userCode: string, screen: any): Promise<GetContentScreenResDto | null>;
}
