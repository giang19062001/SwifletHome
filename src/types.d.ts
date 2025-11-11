import 'express-session';
import { IUserAdmin } from './modules/auth/auth.interface';

declare module 'express-session' {
  interface SessionData {
    user?: Omit<IUserAdmin, 'userPassword', 'accessToken'>;
  }
}
