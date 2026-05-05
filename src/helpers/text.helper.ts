import { PackageResDto } from "../modules/package/package.response";

export const NOTIFICATIONS = {
  UPDATE_STATUS_CONSIGNMENT: (consignmentCode: string, noticeContent: string) => ({
    TITLE: 'Thông báo gửi yến đi nước ngoài',
    BODY:   `Đơn hàng #${consignmentCode} - ${noticeContent}`
  }),
  UPDATE_PACKAGE_FRIST_TIME: (packageData?: PackageResDto | null, startDate?: string, endDate?: string) => ({
    TITLE: 'Thông báo kích hoạt gói',
    BODY: !packageData ? 'Gói Miễn phí được kích hoạt thành công' : `Cảm ơn bạn đã sử dụng dịch vụ 3FAM của chúng tôi. Tài khoản của bạn (${packageData.packageName} đã được kích hoạt thành công, có hiệu lực từ ${startDate} đến ${endDate})`,
  }),
  UPDATE_PACKAGE_TIMES: (packageData?: PackageResDto | null, startDate?: string, endDate?: string) => ({
    TITLE: 'Thông báo gia hạn gói',
    BODY: !packageData ? 'Gói Miễn phí được gia hạn thành công' : `Cảm ơn bạn đã sử dụng dịch vụ 3FAM của chúng tôi. Tài khoản của bạn (${packageData.packageName} đã được kích hoạt thành công, có hiệu lực từ ${startDate} đến ${endDate})`,
  }),
  TODO_TASK_DAILY: (userHomeName: string, taskName: string, daysLeft: number) => ({
    TITLE: `${userHomeName} - ${taskName}`,
    BODY: daysLeft > 0 ? `Còn ${daysLeft} ngày nữa` : `Đã đến ngày thực hiện tác vụ`,
  }),
  QR_CODE_APPROVED: (requestCode: string) => ({
    TITLE: `Thông báo trạng thái yêu cầu Qr code`,
    BODY: `Yêu cầu tạo mã QR Code - ${requestCode} của bạn đã được duyệt`,
  }),
    QR_CODE_REFUSE: (requestCode: string) => ({
    TITLE: `Thông báo trạng thái yêu cầu Qr code`,
    BODY: `Yêu cầu tạo mã QR Code - ${requestCode} của bạn đã bị từ chối`,
  }),
};

export const TEXTS = {
  PACKAGE_FREE: 'Gói dùng thử',
};


export const EMAIL = {
  SUBJECT_SEND_CONSULTATION: 'Yêu cầu tư vấn nhà yến từ 3fam.vn',
};


