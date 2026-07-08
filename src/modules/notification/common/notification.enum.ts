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

export enum NotificationMethodEnum {
  SINGLE = 'SINGLE',
  MULTICAST = 'MULTICAST',
  TOPIC = 'TOPIC',
}

export enum NotificationMessageIdEnum {
  NO_PUSH = 'no_push',
  PUSH_FAILED = 'push_failed',
  MULTICAST = 'multicast',
}
