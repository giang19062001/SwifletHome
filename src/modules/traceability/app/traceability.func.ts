import { TRACE_CONST } from './traceability.const';

export function generateTraceabilityId(userCode: string, userHomeCode: string) {
  return `3FAM-NY-${userCode}-${userHomeCode}`;
}

export function generateTraceabilityQr(userCode: string, userHomeCode: string) {
  return `${TRACE_CONST.QR_CODE_PATH}/${generateTraceabilityId(userCode, userHomeCode)}.png`;
}

export function generateTraceabilityQrLink(userCode: string, userHomeCode: string) {
  return `${process.env.CURRENT_URL!}/${TRACE_CONST.QR_CODE_BASE_URL}/${generateTraceabilityId(userCode, userHomeCode)}.png`;
}
