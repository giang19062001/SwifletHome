import { IPackage } from 'src/modules/package/package.interface';

export const NOTIFICATIONS = {
  UPDATE_PACKAGE_FRIST_TIME: (packageData?: IPackage | null, startDate?: string, endDate?: string) => ({
    TITLE: 'Thông báo kích hoạt gói',
    BODY: !packageData ? 'Gói Miễn phí được kích hoạt thành công' : `${packageData.packageName} đã được kích hoạt thành công, có hiệu lực từ ${startDate} đến ${endDate}`,
  }),
  UPDATE_PACKAGE_TIMES: (packageData?: IPackage | null, startDate?: string, endDate?: string) => ({
    TITLE: 'Thông báo gia hạn gói',
    BODY: !packageData ? 'Gói Miễn phí được gia hạn thành công' : `${packageData.packageName} đã được gia hạn thành công, có hiệu lực từ ${startDate} đến ${endDate}`,
  }),
  TODO_TASK_DAILY: (userHomeName: string, taskName: string, daysLeft: number) => ({
    TITLE: `${userHomeName} - ${taskName}`,
    BODY: daysLeft > 0 ? `Còn ${daysLeft} ngày nữa` : `Đã đến ngày thực hiện tác vụ`,
  }),
  QR_CODE_APPROVED: (requestCode: string) => ({
    TITLE: `Thông báo trạng thái yêu cầu Qr code`,
    BODY: `Mã yêu cầu Qr code (${requestCode}) của bạn đã được duyệt`,
  }),
};

export const TEXTS = {
  PACKAGE_FREE: 'Gói dùng thử',
  NOTIFICATION_TYPE_TODO: 'Việc cần làm',
};
