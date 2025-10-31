import { Injectable } from '@nestjs/common';
import { UserAppRepository } from './user.repository';
import { IUser } from '../user.interface';

@Injectable()
export class UserAppService {
  constructor(private readonly userAppRepository: UserAppRepository) {}
  async getDetail(userCode: string): Promise<IUser | null> {
    const result = await this.userAppRepository.getDetail(userCode);
    return result;
  }
}
