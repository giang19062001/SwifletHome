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

export const INTERNAL_WHITELIST: Record<string, Record<string, string[] | 'ALL'>> = {
  BRIEF_SWIFT_HOUSE: {
    FACILITY_INFO: ['facilityName', 'fiIdentificationCode', 'facilityAddress'],
  },
  BATCH_HARVEST: {
    HARVEST_INFORMATION: ['hiNumberHarvest'],
    HARVEST_MEASUREMENT: ['hmNumberNests', 'hmWeight', 'hmWeightingPhoto'],
    'HARVEST_ MEASUREMENT': ['hmNumberNests', 'hmWeight', 'hmWeightingPhoto'],
  },
  LOGBOOK_HOUSE: {
    SWIFT_HOUSE_TD: 'ALL',
    SWIFT_HOUSE_MEDICINE: 'ALL',
  },
};

export const EXTERNAL_WHITELIST: Record<string, Record<string, string[] | 'ALL'>> = {
  PRE_PROCESSING: {
    RECEIVING_MATERIAL: ['rmTeamExecution', 'rmAddress'],
    DIARY_PROCESS: 'ALL',
  },
  PACKING_QR: {
    PRODUCT_CATALOG: ['pcProductName', 'pcBasicSpecification'],
    INGREDIENT_INSTRUCTION: ['iiApplicableStandard', 'iiInstructionUse'],
  },
};

export const FINAL_FORM_SEQ = 8;
