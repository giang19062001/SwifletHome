import { CookieOptions } from 'express';
import { IPackage } from 'src/modules/package/package.interface';

export const AUTH_CONFIG = {
  TOKEN_NAME: 'swf-token',
  EXPIRED_ADMIN: '1d' as const,
  EXPIRED_APP: '365d' as const,
  COOKIE_CONFIG: {
    httpOnly: false, //  có thể truy cập bằng JavaScript
    sameSite: 'strict', //  chỉ gửi khi request cùng site # login redirect từ domain khác → lỗi
    secure: true, // HTTPS
    maxAge: 24 * 60 * 60 * 1000, // 1day
  } satisfies CookieOptions,
};
export const IMG_TYPES = ['.png', '.jpg', '.jpeg', '.heic'];
export const AUDIO_TYPES = ['.mp3'];
export const VIDEO_TYPES = ['.mp4', '.mov', '.hevc'];
export const APP_SCREENS = {
  PROFILE_SCREEN: 'PROFILE_SCREEN',
  SIGNUP_SERVICE: 'SIGNUP_SERVICE',
};
export const NOTIFICATIONS = {
  updatePackage: (packageData?: IPackage | null) => ({
    TITLE: 'Thông báo cập nhập gói',
    BODY: `Gói ${!packageData ? 'Miễn phí' : packageData.packageName} đã được cập nhập thành công`,
  }),
};

export const KEYWORDS = {
  NOTIFICATION_TOPIC: {
    COMMON: 'COMMON',
  },
};

export const CODES = {
  answerCode: {
    PRE: 'ANS',
    LEN: 6,
    FRIST_CODE: 'ANS000001',
  },
  blogCode: {
    PRE: 'BLG',
    LEN: 6,
    FRIST_CODE: 'BLG000001',
  },
  homeCode: {
    PRE: 'HOM',
    LEN: 6,
    FRIST_CODE: 'HOM000001',
  },
  userHomeCode: {
    PRE: 'HOM',
    LEN: 6,
    FRIST_CODE: 'HOM000001',
  },
  questionCode: {
    PRE: 'QUS',
    LEN: 6,
    FRIST_CODE: 'QUS000001',
  },
  taskAlarmCode: {
    PRE: 'TAA',
    LEN: 6,
    FRIST_CODE: 'TAA000001',
  },
  taskPeriodCode: {
    PRE: 'TAP',
    LEN: 6,
    FRIST_CODE: 'TAP000001',
  },
  userCode: {
    PRE: 'USR',
    LEN: 6,
    FRIST_CODE: 'USR000001',
  },
};
