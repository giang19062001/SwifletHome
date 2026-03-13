const TOKEN_NAME = 'swf-token';
const CURRENT_PATH = window.location.pathname;
const CURRENT_URL = window.location.origin;
const CURRENT_PARAMS = window.location.search;

console.log('CURRENT_PATH', CURRENT_PATH);
console.log('CURRENT_URL', CURRENT_URL);
console.log('CURRENT_PARAMS', CURRENT_PARAMS);

const VARIABLE_ENUM = {
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
    APPROVED: 'Đã chấp thuận QrCode',
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
  CONSIGNMENT_STATUS: {
    WAITING: 'Chờ xác nhận',
    DELIVERING: 'Đang giao',
    CANCEL: 'Giao thất bại - hủy bỏ',
    DELIVERED: 'Giao thành công',
    RETURN: 'Đã hoàn trả',
  },
};
