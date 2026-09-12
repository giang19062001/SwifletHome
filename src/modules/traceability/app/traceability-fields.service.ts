import { Injectable } from '@nestjs/common';
import { generateTraceabilityLotCodeByHarvest } from './traceability.func';
import { TRACE_FORM_DEFAULT_CURRENT_VALUE_GENERATE } from './traceability.query';

@Injectable()
export class TraceabilityFieldsService {
  /**
   * Danh sách các trường đặc biệt đại diện cho Mã Lô (LotCode)
   */
  public readonly LOT_CODE_FIELDS = ['diLotCode', 'rmInputLot', 'lfpLotProcessings', 'dLotFinished', 'rLotRecall'];

  /**
   * Kiểm tra một fieldKey có phải là trường đặc biệt Mã Lô (LotCode) hay không
   */
  isLotCodeField(fieldKey: string): boolean {
    return this.LOT_CODE_FIELDS.includes(fieldKey);
  }

  private parsePhases(val: any): number[] {
    if (val === undefined || val === null || val === '') return [];
    if (typeof val === 'number') return isNaN(val) ? [] : [val];
    if (typeof val === 'string') {
      return val
        .split(',')
        .map((s) => Number(s.trim()))
        .filter((n) => !isNaN(n) && n > 0);
    }
    if (Array.isArray(val)) {
      const res: number[] = [];
      val.forEach((item) => {
        res.push(...this.parsePhases(item));
      });
      return res;
    }
    if (typeof val === 'object') {
      if (val.value !== undefined) {
        return this.parsePhases(val.value);
      }
      if (val.hiNumberHarvest !== undefined) {
        return this.parsePhases(val.hiNumberHarvest);
      }
    }
    return [];
  }

  /**
   * Bóc tách giá trị đợt thu hoạch (hiNumberHarvest) từ formData
   */
  extractHiNumberHarvest(formData: any): number[] {
    if (!formData || typeof formData !== 'object') return [];
    const phases: number[] = [];

    if (formData.hiNumberHarvest !== undefined) {
      phases.push(...this.parsePhases(formData.hiNumberHarvest));
    }

    for (const key of Object.keys(formData)) {
      if (formData[key] && typeof formData[key] === 'object') {
        if (formData[key].hiNumberHarvest !== undefined) {
          phases.push(...this.parsePhases(formData[key].hiNumberHarvest));
        }
      }
    }

    return Array.from(new Set(phases));
  }

  /**
   * Thu thập tất cả các đợt thu hoạch (active harvest phases) từ savedData hiện tại và danh sách formData các đơn đã nộp
   */
  collectHarvestPhases(savedData: any, submissionsFormData: any[]): number[] {
    const harvestPhasesSet = new Set<number>();
    const currentPhases = this.extractHiNumberHarvest(savedData);
    currentPhases.forEach((p) => harvestPhasesSet.add(p));

    if (submissionsFormData && Array.isArray(submissionsFormData)) {
      submissionsFormData.forEach((fData) => {
        const phases = this.extractHiNumberHarvest(fData);
        phases.forEach((p) => harvestPhasesSet.add(p));
      });
    }

    return Array.from(harvestPhasesSet);
  }

  /**
   * Áp dụng giá trị Mã Lô (LOTCODE) cho 1 field đặc biệt dạng text
   */
  applyLotCodeValueToField(field: any, userHomeCode: string, activeHarvestPhases: (string | number)[]): void {
    if (!activeHarvestPhases || activeHarvestPhases.length === 0) return;

    if (field.config) {
      if (typeof field.config === 'string') {
        try {
          field.config = JSON.parse(field.config);
        } catch (e) {
          field.config = {};
        }
      }
      if (field.config.options !== undefined) {
        delete field.config.options;
      }
    }

    const generatedLotCode = generateTraceabilityLotCodeByHarvest(userHomeCode, activeHarvestPhases);

    if (field.currentValue === null || field.currentValue === undefined || field.currentValue === '') {
      field.currentValue = generatedLotCode;
    }
  }

  /**
   * Sinh giá trị mặc định cho các trường đặc biệt (psSeri, exportTime, entireExportFile, ...)
   */
  getDefaultCurrentValue(fieldKey: string, traceabilityId: string): any {
    const generator = (TRACE_FORM_DEFAULT_CURRENT_VALUE_GENERATE as any)[fieldKey];
    if (generator) {
      return typeof generator === 'function' ? generator(traceabilityId) : generator;
    }
    return null;
  }
}
