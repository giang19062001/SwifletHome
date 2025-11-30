const CURRENT_PATH = window.location.pathname;
const CURRENT_URL = window.location.origin;
const CURRENT_PARAMS = window.location.search;
const OPTIONS = {
  HOME_SUMIT: [
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
