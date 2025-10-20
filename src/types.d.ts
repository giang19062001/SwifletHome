import 'express-session';
import { UserAuth } from './auth/auth.interface';

declare module 'express-session' {
  interface SessionData {
    user?: Omit<UserAuth, 'userPassword', 'accessToken'>;
  }
}
