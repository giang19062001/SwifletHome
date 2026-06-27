const TOKEN_NAME = 'swf-token';
const CURRENT_PATH = window.location.pathname;
const CURRENT_URL = window.location.origin;
const CURRENT_PARAMS = window.location.search;

console.log('CURRENT_PATH', CURRENT_PATH);
console.log('CURRENT_URL', CURRENT_URL);
console.log('CURRENT_PARAMS', CURRENT_PARAMS);

const VARIABLE_ENUM = {
  TODO_TASK:{
    MEDICINE: 'MEDICINE',
    HARVEST: 'HARVEST',
    LURING: 'LURING',
  },
  MEDIA_BADGE: {
    NEW: 'NEW',
    NORMAL: 'NORMAL',
  },
  PACKAGE_OPTIONS_TYPE: {
    MONEY: 'Tiền',
    ITEM: 'Vật phẩm',
    BOTH: 'Tiền/Vật phẩm',
  },
  USER_TEAM_TYPE: {
    FACTORY: 'FACTORY',
    TECHNICAL: 'TECHNICAL',
  },
  QR_REQUEST_STATUS: {
    WAITING: 'Đang chờ duyệt',
    APPROVED: 'Đã chấp thuận',
    REFUSE: 'Từ chối duyệt',
    CANCEL: 'Đã hủy',
  },
  HOME_SALE_SIGHTSEEING_STATUS: {
    WAITING: 'Đang chờ duyệt',
    APPROVED: 'Đã duyệt',
    CANCEL: 'Hủy',
  },
  DOCTOR_STATUS: {
    WAITING: 'Đang chờ phản hồi',
    ANSWERED: 'Đã xác nhận phản hồi',
    // CANCEL: 'Hủy',
  },
  CONSIGNMENT_STATUS : {
    WAITING: { TEXT: 'Chờ xác nhận', VALUE: 'WAITING' },
    CONFIRMED: { TEXT: 'Đã xác nhận', VALUE: 'CONFIRMED' },
    DELIVERING: { TEXT: 'Đang giao', VALUE: 'DELIVERING' },
    CANCEL: { TEXT: 'Giao thất bại - hủy bỏ', VALUE: 'CANCEL' },
    DELIVERED: { TEXT: 'Giao thành công', VALUE: 'DELIVERED' },
    RETURN: { TEXT: 'Đã hoàn trả', VALUE: 'RETURN' },
  },
  TEAM_STATUS: {
    APPROVE: { TEXT: 'Đã duyệt', VALUE: 'APPROVE' },
    REFUSE: { TEXT: 'Từ chối duyệt', VALUE: 'REFUSE' },
    WAITING: { TEXT: 'Đang chờ duyệt', VALUE: 'WAITING' },
  },
  SALE_HOME_STATUS: {
    APPROVED: { TEXT: 'Đã duyệt', VALUE: 'APPROVED' },
    REFUSE: { TEXT: 'Từ chối duyệt', VALUE: 'REFUSE' },
    WAITING: { TEXT: 'Đang chờ duyệt', VALUE: 'WAITING' },
  },
  ADS_TARGET_SCREEN: {
    REMINDER_SCREEN: 'Lịch nhắc việc',
    NOTIFICATION_SCREEN: 'Thông báo',
    ACCOUNT_SCREEN: 'Thông tin tài khoản',
    QR_SCREEN: 'Danh sách mã QR code',
    CONSIGNMENT_SCREEN: 'Gửi yến đi nước ngoài',
    REQUEST_DOCTOR: 'Tăng đàn nhà yến',
  },
  ADS_ACTION_TYPE: {
    LINK: 'Chuyển hướng',
    FUNCTION: 'Chức năng',
  }
};
