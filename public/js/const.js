const TOKEN_NAME = 'swf-token'
const CURRENT_PATH = window.location.pathname;
const CURRENT_URL = window.location.origin;
const CURRENT_PARAMS = window.location.search;
const VARIABLE_ENUM = {
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
