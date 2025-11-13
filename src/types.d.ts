import 'express-session';
import { IUserAuthAdmin } from './modules/auth/auth.interface';

declare module 'express-session' {
  interface SessionData {
    user?: Omit<IUserAuthAdmin, 'userPassword', 'accessToken'>;
  }
}
