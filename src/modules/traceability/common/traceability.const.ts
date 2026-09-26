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

export interface IExtraLinkedFieldDef {
  fieldKey: string;
  fieldName: string;
  fieldType: string;
  isRequired: 'Y' | 'N';
  config?: {
    placeholder?: string;
    unit?: string;
    colSpan?: number;
    halfWidth?: boolean;
    [key: string]: any;
  };
}

export const EXTRA_LINKED_FIELDS: Record<
  number,
  {
    key: string;
    fields: IExtraLinkedFieldDef[];
  }
> = {
  1: {
    key: 'FACILITY_INFO',
    fields: [
      {
        fieldKey: 'fiIdentificationCode',
        fieldName: 'Mã định danh cơ sở do bộ nông nghiệp cấp',
        fieldType: 'text',
        isRequired: 'N',
        config: {
          placeholder: 'Nhập mã định danh...',
          colSpan: 12,
        },
      },
      {
        fieldKey: 'facilityName',
        fieldName: 'Tên cơ sở (nhà yến)',
        fieldType: 'text',
        isRequired: 'Y',
        config: {
          placeholder: 'Nhập tên cơ sở...',
          colSpan: 12,
        },
      },
      {
        fieldKey: 'facilityAddress',
        fieldName: 'Địa chỉ cơ sở',
        fieldType: 'text',
        isRequired: 'N',
        config: {
          placeholder: 'Nhập địa chỉ cơ sở...',
          colSpan: 12,
        },
      },
      {
        fieldKey: 'facilityActiveTime',
        fieldName: 'Thời gian hoạt động',
        fieldType: 'date',
        isRequired: 'N',
        config: {
          placeholder: 'DD-MM-YYYY',
          colSpan: 6,
        },
      },
      {
        fieldKey: 'facilityArea',
        fieldName: 'Diện tích',
        fieldType: 'number',
        isRequired: 'N',
        config: {
          placeholder: 'VD: 150',
          unit: 'm²',
          colSpan: 6,
        },
      },
      {
        fieldKey: 'facilityFloor',
        fieldName: 'Số tầng',
        fieldType: 'number',
        isRequired: 'N',
        config: {
          placeholder: 'VD: 3',
          colSpan: 6,
        },
      },
    ],
  },
  3: {
    key: 'HARVEST_MEASUREMENT',
    fields: [
      {
        fieldKey: 'hmNumberNests',
        fieldName: 'Số lượng tổ',
        fieldType: 'number',
        isRequired: 'N',
        config: {
          placeholder: 'VD: 120',
          unit: 'tổ',
          colSpan: 6,
        },
      },
    ],
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
