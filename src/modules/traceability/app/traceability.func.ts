import { TRACE_CONST } from './traceability.const';

export function generateTraceabilityId(provinceCode: string, userHomeCode: string) {
  return `3FAM-NY-${provinceCode}-${userHomeCode}`;
}

export function generateTraceabilityQr(provinceCode: string, userHomeCode: string) {
  return `${TRACE_CONST.QR_CODE_PATH}/${generateTraceabilityId(provinceCode, userHomeCode)}.png`;
}

export function generateTraceabilityQrLink(provinceCode: string, userHomeCode: string) {
  return `${process.env.CURRENT_URL!}/${TRACE_CONST.QR_CODE_BASE_URL}/${generateTraceabilityId(provinceCode, userHomeCode)}.png`;
}
