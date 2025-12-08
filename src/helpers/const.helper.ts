import { IPackage } from "src/modules/package/package.interface";

export const IMG_TYPES = ['.png', '.jpg', '.jpeg', '.heic'];
export const AUDIO_TYPES = ['.mp3'];
export const VIDEO_TYPES = ['.mp4', '.mov', '.hevc'];
export const APP_SCREENS = {
  PROFILE_SCREEN: 'PROFILE_SCREEN',
};
export const NOTIFICATIONS = {
  updatePackage: (packageData?: IPackage | null) => ({
    TITLE: "Thông báo cập nhập gói",
    BODY: `Gói ${!packageData ? "Miễn phí" : packageData.packageName} đã được cập nhập thành công`
  })
};

export const KEYWORDS = {
  OTP_PURPOSE: {
    REGISTER: 'REGISTER',
    FORGOT_PASSWORD: 'FORGOT_PASSWORD',
  },
  SCREEN: {
    SIGNUP_SERVICE: 'SIGNUP_SERVICE',
  },
  HOME_SALE_SIGHTSEEING_STATUS: { WAITING: 'WAITING', APPROVED: 'APPROVED', CANCEL: 'CANCEL' },
  DOCTOR_STATUS: {
    WAITING: 'WAITING',
    ANSWERED: 'ANSWERED',
    CANCEL: 'CANCEL',
  },
  TODO_HOME_TASK_ALARAM_STATUS: {
    WAITING: 'WAITING',
    COMPLETE: 'COMPLETE',
    CANCEL: 'CANCEL',
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
