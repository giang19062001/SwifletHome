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

export const INTERNAL_WHITELIST: Record<string, Record<string, string[] | 'ALL'>> = {
  BRIEF_SWIFT_HOUSE: {
    FACILITY_INFO: ['personInCharge', 'fiIdentificationCode', 'facilityAddress'],
  },
  BATCH_HARVEST: {
    HARVEST_INFORMATION: ['hiHarvestDate'],
    HARVEST_MEASUREMENT: ['hmWeightingPhoto'],
  },
  LOGBOOK_HOUSE: {
    SWIFT_HOUSE_TD: 'ALL',
  },
};

export const EXTERNAL_WHITELIST: Record<string, Record<string, string[] | 'ALL'>> = {
  PRODUCTION_ORIGIN: {
    MANUFACTURER: ['mFacilityName', 'mFacilityAddress', 'mCertificationFile'], //  Thông tin nhà sản xuất
    ORIGIN_NEST: 'ALL', // nguồn gốc sản phẩm
  },
  PRE_PROCESSING: {
    DIARY_PROCESS: 'ALL',
  },
  PACKING_QR: {
    INGREDIENT_INSTRUCTION: ['iiIngredients', 'iiInstructionUse', 'iiApplicableStandard'],
  },
};

export const LOT_CODE_FIELD_FOLLOW_HARVEST = 'hiNumberHarvest';
export const LOT_CODE_FIELDS = ['diLotCode', 'rmInputLot', 'lfpLotProcessings', 'dLotFinished', 'rLotRecall', 'eiLotCode'];

export const LOOP_GROUP_INFO = {
  // DIARY_PROCESS, ORIGIN_NEST là groupKey
  DIARY_PROCESS: {
    title: 'Công đoạn',
  },
  ORIGIN_NEST: {
    title: 'Lô nguyên liệu',
  },
};
export const FINAL_FORM_SEQ = 8;
