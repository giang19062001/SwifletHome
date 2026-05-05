export const NOTIFICATION_CONST = {
  TOPIC: {
    COMMON: 'COMMON',
  },
  NOTIFICATION_TYPE: {
    ADMIN: {
      value: 'ADMIN',
      text: 'Admin',
    },
    TODO: {
      value: 'TODO',
      // text: 'Việc cần làm',
      text: 'Admin',
    },
    ADMIN_QR: {
      value: 'ADMIN_QR',
      // text: 'Thông tin QRcode',
      text: 'Admin',
    },
    ADMIN_CONSIGNMENT: {
      value: 'ADMIN_CONSIGNMENT',
      // text: 'Thông tin ký gửi',
      text: 'Admin',
    },
  },
};

export enum NotificationStatusEnum {
  SENT = 'SENT',
  READ = 'READ',
}

export enum NotificationTypeEnum {
  ADMIN = 'ADMIN',
  TODO = 'TODO',
  ADMIN_QR = 'ADMIN_QR',
  ADMIN_CONSIGNMENT = 'ADMIN_CONSIGNMENT',
}
