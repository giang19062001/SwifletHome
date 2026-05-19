import { PackageResDto } from '../modules/package/package.response';

export const NOTIFICATIONS = {
  UPDATE_STATUS_CONSIGNMENT: (consignmentCode: string, noticeContent: string) => ({
    TITLE: 'Thông báo gửi yến đi nước ngoài',
    BODY: `Đơn hàng #${consignmentCode} - ${noticeContent}`,
  }),
  UPDATE_PACKAGE_FRIST_TIME: (packageData?: PackageResDto | null, startDate?: string, endDate?: string) => ({
    TITLE: 'Thông báo kích hoạt gói',
    BODY: !packageData
      ? 'Gói Miễn phí được kích hoạt thành công'
      : `Cảm ơn bạn đã sử dụng dịch vụ 3FAM của chúng tôi. Tài khoản của bạn (${packageData.packageName} đã được kích hoạt thành công, có hiệu lực từ ${startDate} đến ${endDate})`,
  }),
  UPDATE_PACKAGE_TIMES: (packageData?: PackageResDto | null, startDate?: string, endDate?: string) => ({
    TITLE: 'Thông báo gia hạn gói',
    BODY: !packageData
      ? 'Gói Miễn phí được gia hạn thành công'
      : `Cảm ơn bạn đã sử dụng dịch vụ 3FAM của chúng tôi. Tài khoản của bạn (${packageData.packageName} đã được kích hoạt thành công, có hiệu lực từ ${startDate} đến ${endDate})`,
  }),
  TODO_TASK_DAILY: (userHomeName: string, taskName: string, daysLeft: number) => ({
    TITLE: `${userHomeName} - ${taskName}`,
    BODY: daysLeft > 0 ? `Còn ${daysLeft} ngày nữa` : `Đã đến ngày thực hiện tác vụ`,
  }),
  QR_CODE_APPROVED: (requestCode: string) => ({
    TITLE: `Thông báo trạng thái yêu cầu Qr code`,
    BODY: `Yêu cầu tạo mã QR Code #${requestCode} của bạn đã được duyệt`,
  }),
  QR_CODE_REFUSE: (requestCode: string) => ({
    TITLE: `Thông báo trạng thái yêu cầu Qr code`,
    BODY: `Yêu cầu tạo mã QR Code #${requestCode} của bạn đã bị từ chối`,
  }),
  TEAM_REGISTER_APPROVED: (teamCode: string, typeName: string) => ({
    TITLE: `Thông báo trạng thái đăng ký ${typeName}`,
    BODY: `Yêu cầu đăng ký ${typeName} #${teamCode} của bạn đã được duyệt`,
  }),
  TEAM_REGISTER_REFUSE: (teamCode: string, typeName: string) => ({
    TITLE: `Thông báo trạng thái đăng ký ${typeName}`,
    BODY: `Yêu cầu đăng ký ${typeName} #${teamCode} của bạn đã bị từ chối`,
  }),
};

export const TEXTS = {
  PACKAGE_FREE: 'Gói dùng thử',
};

export const EMAIL = {
  SUBJECT_SEND_CONSULTATION: 'Yêu cầu tư vấn nhà yến từ 3fam.vn',
  SUBJECT_SEND_TEAM: 'Yêu cầu duyệt đơn đăng ký đội kỹ thuật/xưởng gia công từ 3fam.vn',
  SUBJECT_SEND_DOCTOR: 'Yêu cầu tư vấn khám bệnh nhà yến từ 3fam.vn',
  SUBJECT_SEND_CONSIGNMENT: 'Yêu cầu ký gửi từ 3fam.vn',
  SUBJECT_SEND_SIGHTSEEING: 'Yêu cầu duyệt đơn đăng ký tham quan nhà yến từ 3fam.vn',
  SUBJECT_SEND_REQUEST_QR: 'Yêu cầu duyệt cấp mã QR Code từ 3fam.vn',
};
