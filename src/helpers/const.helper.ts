import { NotificationTypeEnum } from 'src/modules/notification/notification.interface';

export const ROUTER = {
  APP: '/api/app',
  ADMIN: '/api/admin',
  FRONT: '/api/front',
  EATER_APP: '/api/eater-app',
};

export const IMG_TYPES = ['.png', '.jpg', '.jpeg'];
export const AUDIO_TYPES = ['.mp3'];
export const VIDEO_TYPES = ['.mp4', '.mov', '.webm'];

export const APP_SCREENS = {
  QR_SCREEN: 'QR_SCREEN',
  REMINDER_SCREEN: 'REMINDER_SCREEN',
  NOTIFICATION_SCREEN: 'NOTIFICATION_SCREEN',
  CONSIGNMENT_SCREEN: 'CONSIGNMENT_SCREEN',

  SIGNUP_SERVICE: 'SIGNUP_SERVICE',
  REQUEST_DOCTOR: 'REQUEST_DOCTOR',
  REQUEST_QR_GUIDE: 'REQUEST_QR_GUIDE',
  CONSIGNMENT_GUIDE: 'CONSIGNMENT_GUIDE',
  USER_TYPE_NOT_REGISTER: 'USER_TYPE_NOT_REGISTER',
};

export const GetAppScreen = (notificationType: NotificationTypeEnum): string => {
  if (notificationType === 'TODO') {
    return APP_SCREENS.REMINDER_SCREEN;
  } else if (notificationType === 'ADMIN') {
    return APP_SCREENS.NOTIFICATION_SCREEN;
  } else if (notificationType === 'ADMIN_QR') {
    return APP_SCREENS.QR_SCREEN;
  } else if (notificationType === 'ADMIN_CONSIGNMENT') {
    return APP_SCREENS.CONSIGNMENT_SCREEN;
  }
  return APP_SCREENS.NOTIFICATION_SCREEN;
};

export const QUERY_HELPER = {
  // MAX_DAY_GET_LIST_ALARM: 5,
  MAX_DAY_GET_LIST_ALARM: 90,
  MAX_DAY_SEND_NOTIFY: 3,
  OTP_EXPIRY_MINUTES: 1,
  OTP_MAX_ATTEMPTS: 5,
  DAY_CREATE_ALARM_NEXT_TIME: 90,
  BATCH_SIZE_FIREBASE_MULTICAST: 500,
  MAXIMUM_TO_SEND_SINGLE_NOTIFICATION: 50,
  JOB_CONCURRENCY: 5,
};

export const UPDATOR = 'SYSTEM';

export const CODES = {
  eaterCode: {
    PRE: 'EAT',
    LEN: 6,
    FRIST_CODE: 'EAT000001',
  },
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
  teamCode: {
    PRE: 'TEM',
    LEN: 6,
    FRIST_CODE: 'TEM000001',
  },
  consignmentCode: {
    PRE: 'CSM',
    LEN: 6,
    FRIST_CODE: 'CSM000001',
  },
  medicineCode: {
    PRE: 'MED',
    LEN: 6,
    FRIST_CODE: 'MED000001',
  },
  saleHomeCode: {
    PRE: 'SLH',
    LEN: 6,
    FRIST_CODE: 'SLH000001',
  },
};
