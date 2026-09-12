import { PackageAppResDto } from '../modules/package/app/package.response';

export const NOTIFICATIONS = {
  UPDATE_STATUS_CONSIGNMENT: (consignmentCode: string, noticeContent: string) => ({
    TITLE: 'Thông báo gửi yến đi nước ngoài',
    BODY: `Đơn hàng #${consignmentCode} - ${noticeContent}`,
  }),
  UPDATE_PACKAGE_FRIST_TIME: (packageData?: PackageAppResDto | null, startDate?: string, endDate?: string) => ({
    TITLE: 'Thông báo kích hoạt gói',
    BODY: !packageData
      ? 'Gói Miễn phí được kích hoạt thành công'
      : `Cảm ơn bạn đã sử dụng dịch vụ 3FAM của chúng tôi. Tài khoản của bạn (${packageData.packageName} đã được kích hoạt thành công, có hiệu lực từ ${startDate} đến ${endDate})`,
  }),
  UPDATE_PACKAGE_TIMES: (packageData?: PackageAppResDto | null, startDate?: string, endDate?: string) => ({
    TITLE: 'Thông báo gia hạn gói',
    BODY: !packageData
      ? 'Gói Miễn phí được gia hạn thành công'
      : `Cảm ơn bạn đã sử dụng dịch vụ 3FAM của chúng tôi. Tài khoản của bạn (${packageData.packageName} đã được kích hoạt thành công, có hiệu lực từ ${startDate} đến ${endDate})`,
  }),
  TODO_TASK_DAILY: (userHomeName: string, taskName: string, daysLeft: number) => ({
    TITLE: `${userHomeName} - ${taskName}`,
    BODY: daysLeft > 0 ? `Còn ${daysLeft} ngày nữa` : `Đã đến ngày thực hiện tác vụ`,
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
  PHASE: 'Đợt',
  NEST_TITLE: 'Tổ',
  HARVEST_DATE: 'Ngày thu hoạch',
};

export const EMAIL = {
  SUBJECT_SEND_CONSULTATION: 'Yêu cầu tư vấn nhà yến từ 3fam.vn',
  SUBJECT_SEND_TEAM: 'Yêu cầu duyệt đơn đăng ký đội kỹ thuật/xưởng gia công từ 3fam.vn',
  SUBJECT_SEND_DOCTOR: 'Yêu cầu tư vấn tăng đàn nhà yến từ 3fam.vn',
  SUBJECT_SEND_CONSIGNMENT: 'Yêu cầu ký gửi từ 3fam.vn',
  SUBJECT_SEND_SIGHTSEEING: 'Yêu cầu duyệt đơn đăng ký tham quan nhà yến từ 3fam.vn',
  SUBJECT_SEND_SALE_HOME: 'Yêu cầu tạo nhà yến siêu cạnh tranh từ 3fam.vn',
};
