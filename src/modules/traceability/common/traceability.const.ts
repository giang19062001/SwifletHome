export const TRACE_CONST = {
  STATUS: {
    PROCESSING: {
      value: 'PROCESSING',
      text: 'Đang xử lý',
    },
    APPROVED: {
      value: 'APPROVED',
      text: 'Đã duyệt',
    },
    REFUSED: {
      value: 'REFUSED',
      text: 'Đã từ chối',
    },
  },
  QR_CODE_PATH: 'uploads/images/traceQrcodes',
  QR_CODE_PATH_EXTERNAL: 'uploads/images/traceQrcodesExternal',
  QR_CODE_BASE_URL: 'traceability-qrcode-global',
  TRACE_EXTERNAL_PREFIX: '3FAM-VCĐP',
};

export const EXTRA_LINKED_FIELDS = {
  1: {
    key: 'FACILITY_INFO',
    fields: ['fiIdentificationCode', 'facilityName', 'facilityAddress', 'facilityActiveTime', 'facilityArea', 'facilityFloor'],
  },
  3: {
    key: 'HARVEST_MEASUREMENT',
    fields: ['hmNumberNests'],
  },
};

export const FINAL_FORM_SEQ = 8;
