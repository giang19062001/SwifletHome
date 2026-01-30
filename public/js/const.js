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
};
const LIST_ENUM = {
  QR_REQUEST_STATUS: [
    {
      value: 'WAITING',
      text: 'Đang chờ duyệt',
    },
    {
      value: 'APPROVED',
      text: 'Đã chấp thuận QrCode',
    },
    {
      value: 'REFUSE',
      text: 'Từ chối duyệt',
    },
     {
      value: 'CANCEL',
      text: 'Đã hủy',
    },
  ],
  HOME_SALE_SIGHTSEEING_STATUS: [
    {
      value: 'WAITING',
      text: 'Đang chờ duyệt',
    },
    {
      value: 'APPROVED',
      text: 'Đã duyệt',
    },
    {
      value: 'CANCEL',
      text: 'Hủy',
    },
  ],
  DOCTOR_STATUS: [
    {
      value: 'WAITING',
      text: 'Đang chờ phản hồi',
    },
    {
      value: 'ANSWERED',
      text: 'Đã xác nhận phản hồi',
    },
    // {
    //   value: 'CANCEL',
    //   text: 'Hủy',
    // },
  ],
};
