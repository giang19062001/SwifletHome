import { GetContentScreenResDto } from './screen.response';

export interface IScreenStrategy {
  canHandle(keyword: string): boolean;
  execute(screen: any): Promise<GetContentScreenResDto | null>;
}
