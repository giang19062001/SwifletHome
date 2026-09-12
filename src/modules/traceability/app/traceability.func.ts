import { TRACE_CONST } from './traceability.const';
import * as crypto from 'crypto';

export function generateTraceabilityId(userCode: string, userHomeCode: string) {
  return `3FAM-NY-${userCode}-${userHomeCode}`;
}

export function generateTraceabilityLotCodeByHarvest(userHomeCode: string, harvestPhase: (string | number)[] | string | number) {
  const phases = Array.isArray(harvestPhase) ? harvestPhase : [harvestPhase];
  const phaseStr = phases
    .map((p) => String(p).trim())
    .filter(Boolean)
    .map((p) => (p.toUpperCase().startsWith('P') ? p.toUpperCase() : `P${p}`))
    .join('');
  return `LOTCODE-${userHomeCode}-${phaseStr}`;
}

export function generateTraceabilityQr(userCode: string, userHomeCode: string) {
  return `${TRACE_CONST.QR_CODE_PATH}/${generateTraceabilityId(userCode, userHomeCode)}.png`;
}

export function generateTraceabilityQrLink(userCode: string, userHomeCode: string) {
  return `${process.env.CURRENT_URL!}/${TRACE_CONST.QR_CODE_BASE_URL}/${generateTraceabilityId(userCode, userHomeCode)}.png`;
}

export function generateSeriCode(prefix: string) {
  const timePart = Date.now().toString(36).toUpperCase();
  const randomPart = crypto.randomBytes(3).toString('hex').toUpperCase();
  return `${prefix}-${timePart}-${randomPart}`;
}
