import 'express-session';
import { IUserAuth } from './auth/auth.interface';

declare module 'express-session' {
  interface SessionData {
    user?: Omit<IUserAuth, 'userPassword', 'accessToken'>;
  }
}
