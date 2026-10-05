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
    DELETED: {
      value: 'DELETED',
      text: 'Đã xóa',
    },
  },
  QR_CODE_PATH: 'uploads/images/traceQrcodes',
  QR_CODE_PATH_EXTERNAL: 'uploads/images/traceQrcodesExternal',
  QR_CODE_BASE_URL: 'traceability-qrcode-global',
  FULL_INFO_LINK_URL: 'traceability-link-global',
  TRACE_EXTERNAL_PREFIX: '3FAM-VCĐP',
  TRACE_INTERNAL_PREFIX: '3FAM-NY',
};

// GIÁ TRỊ HIỂN THỊ Ở FRONTEND
export const GROUP_COMPACT_ALIASES: Record<string, string> = {
  SWIFT_HOUSE_TD: 'todoListGroup',
  DIARY_PROCESS: 'diaryProcessGroup',
  ORIGIN_NEST: 'originNestGroup',
};

export const INTERNAL_COMPACT_WHITELIST: Record<string, Record<string, string[] | 'ALL'>> = {
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

export const EXTERNAL_COMPACT_WHITELIST: Record<string, Record<string, string[] | 'ALL'>> = {
  PRODUCTION_ORIGIN: {
    MANUFACTURER: ['mFacilityName', 'mFacilityAddress', 'mCertificationFile'], //  Thông tin nhà sản xuất
    ORIGIN_NEST: 'ALL',
  },
  PRE_PROCESSING: {
    DIARY_PROCESS: 'ALL',
  },
  PACKING_QR: {
    INGREDIENT_INSTRUCTION: ['iiIngredients', 'iiInstructionUse', 'iiApplicableStandard', 'iiNutritionalValue', 'iiStorageInstruction', 'iiWarning'],
  },
};

export const LOTCODE__EXTERNAL_FIELD_FOLLOW_HARVEST = 'hiNumberHarvest';

export const LOOP_GROUP_INFO = {
  // DIARY_PROCESS, ORIGIN_NEST là groupKey
  DIARY_PROCESS: {
    title: 'Công đoạn',
  },
  ORIGIN_NEST: {
    title: 'Lô nguyên liệu',
  },
  DELIVERING_INFO: {
    title: 'Giao nhận lô nguyên liệu',
  },
  RECEIVING_MATERIAL: {
    title: 'Lô nguyên liệu',
  },
};
export const FINAL_FORM_SEQ = 8;
