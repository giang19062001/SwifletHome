export abstract class AbAuthService {
  constructor() {}
  abstract login(dto: any): Promise<any>;
  abstract register(dto: any): Promise<any>;
  abstract verifyToken(token: string): any;
}
