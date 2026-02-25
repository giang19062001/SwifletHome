export const IMG_TYPES = ['.png', '.jpg', '.jpeg', '.heic'];
export const AUDIO_TYPES = ['.mp3'];
export const VIDEO_TYPES = ['.mp4', '.mov', '.hevc'];

export const APP_SCREENS = {
  QR_SCREEN: 'QR_SCREEN',
  REMINDER_SCREEN: 'REMINDER_SCREEN',
  NOTIFICATION_SCREEN: 'NOTIFICATION_SCREEN',
  SIGNUP_SERVICE: 'SIGNUP_SERVICE',
  REQUEST_DOCTOR: 'REQUEST_DOCTOR',
};

export const QUERY_HELPER = {
  // MAX_DAY_GET_LIST_ALARM: 5,
  MAX_DAY_GET_LIST_ALARM: 90,
  MAX_DAY_SEND_NOTIFY: 3,
  OTP_EXPIRY_MINUTES: 1,
  OTP_MAX_ATTEMPTS: 5,
  DAY_CREATE_ALARM_NEXT_TIME: 90,

};

export const UPDATOR = 'SYSTEM';

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
  userCode: {
    PRE: 'USR',
    LEN: 6,
    FRIST_CODE: 'USR000001',
  },
  requestCode: {
    PRE: 'RQC',
    LEN: 6,
    FRIST_CODE: 'RQC000001',
  },
};
