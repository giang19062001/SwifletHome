import 'express-session';
import { IUserAuth } from './modules/auth/auth.interface';

declare module 'express-session' {
  interface SessionData {
    user?: Omit<IUserAuth, 'userPassword', 'accessToken'>;
  }
}
