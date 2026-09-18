import { TRACE_CONST } from './traceability.const';
import * as crypto from 'crypto';

function generateRandom8Hex(): string {
  return crypto.randomBytes(4).toString('hex');
}

export function generateTraceabilityIdAndQrExternal(userCode: string) {
  const randomStr = generateRandom8Hex();
  const traceabilityId = `${TRACE_CONST.TRACE_EXTERNAL_PREFIX}-${userCode}-${randomStr}`;
  const qrUrl = `${TRACE_CONST.QR_CODE_PATH_EXTERNAL}/${traceabilityId}.png`;
  return { traceabilityId, qrUrl };
}

export function generateTraceabilityId(userCode: string, userHomeCode: string, batchIndex: number = 1) {
  return `3FAM-NY-${userCode}-${userHomeCode}-${batchIndex}`;
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

export function generateTraceabilityQr(userCode: string, userHomeCode: string, batchIndex: number = 1) {
  return `${TRACE_CONST.QR_CODE_PATH}/${generateTraceabilityId(userCode, userHomeCode, batchIndex)}.png`;
}

export function generateTraceabilityQrLink(userCode: string, userHomeCode: string, batchIndex: number = 1) {
  return `${process.env.CURRENT_URL!}/${TRACE_CONST.QR_CODE_BASE_URL}/${generateTraceabilityId(userCode, userHomeCode, batchIndex)}.png`;
}

export function generateSeriCode(prefix: string) {
  const timePart = Date.now().toString(36).toUpperCase();
  const randomPart = crypto.randomBytes(3).toString('hex').toUpperCase();
  return `${prefix}-${timePart}-${randomPart}`;
}
