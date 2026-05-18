
export const QR_CODE_CONST = {
  PRICE_OPTION: {
    SELL_FOR_PURCHASER: {
      value: 'SELL_FOR_PURCHASER',
      text: 'Giá bán dành cho nhà thu mua',
    },
    SELL_FOR_EATER: {
      value: 'SELL_FOR_EATER',
      text: 'Giá bán dành cho người ăn yến',
    },
    BOTH: {
      value: 'BOTH',
      text: 'Cả hai',
    },
  },
  REQUEST_STATUS: {
    WAITING: {
      value: 'WAITING',
      text: 'Đang chờ',
    },
    APPROVED: {
      value: 'APPROVED',
      text: 'Đã duyệt',
    },
    CANCEL: {
      value: 'CANCEL',
      text: 'Đã huỷ',
    },
    REFUSE: {
      value: 'REFUSE',
      text: 'Bị từ chối',
    },
    SOLD: {
      value: 'SOLD',
      text: 'Đã đăng bán',
    },
  },
};

export enum RequestSellPriceOptionEnum {
  SELL_FOR_PURCHASER = 'SELL_FOR_PURCHASER',
  SELL_FOR_EATER = 'SELL_FOR_EATER',
  BOTH = 'BOTH',
}

export enum GetTypeEnum {
  ALL = 'ALL',
  VIEW = 'VIEW',
  SAVE = 'SAVE',
}
export enum MarkTypeEnum {
  VIEW = 'VIEW',
  SAVE = 'SAVE',
}

export enum RequestStatusEnum {
  WAITING = 'WAITING',
  APPROVED = 'APPROVED',
  REFUSE = 'REFUSE',
  CANCEL = 'CANCEL',
  SOLD = 'SOLD',
}

export enum RequestSellStatusEnum {
  WAITING = 'WAITING',
  APPROVED = 'APPROVED',
  REFUSE = 'REFUSE',
}
