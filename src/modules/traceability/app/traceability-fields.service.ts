import { Injectable } from '@nestjs/common';
import { YnEnum } from 'src/interfaces/admin.interface';
import { generateTraceabilityLotCodeByHarvest } from './traceability.func';
import { TRACE_FORM_CONFIG_OPTIONS_SQL, TRACE_FORM_DEFAULT_CURRENT_VALUE_GENERATE, TRACE_FORM_DEFAULT_CURRENT_VALUE_SQL } from './traceability.query';
import { TraceabilityAppRepository } from './traceability.repository';
import { TraceabilityFieldResDto, TraceabilityGroupResDto } from './traceability.response';

@Injectable()
export class TraceabilityFieldsService {
  constructor(private readonly repository: TraceabilityAppRepository) {}

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

  /**
   * Map danh sách nhóm và trường dữ liệu thành cấu trúc nhóm phản hồi (TraceabilityGroupResDto[])
   */
  async mapGroupsAndFields(
    groups: any[],
    fields: any[],
    savedData: any,
    files: any[],
    traceabilityCode: string | null,
    traceabilityId: string | null,
    isExternal: YnEnum = YnEnum.N,
    userCode?: string,
    userHomeCode?: string,
  ): Promise<TraceabilityGroupResDto[]> {
    const mappedGroups: TraceabilityGroupResDto[] = groups.map((g) => {
      const groupFields: TraceabilityFieldResDto[] = fields
        .filter((f) => f.groupSeq === g.seq)
        .map((f) => {
          let config: any = null;
          try {
            config = typeof f.config === 'string' ? JSON.parse(f.config) : f.config;
          } catch (e) {
            config = f.config;
          }

          let currentValue: any = null;
          if (traceabilityCode) {
            if (f.fieldType === 'file_single') {
              const file = files.find((fileItem) => fileItem.fieldKey === f.fieldKey);
              currentValue = file
                ? {
                    seq: file.seq,
                    url: file.filename,
                  }
                : null;
            } else if (f.fieldType === 'file_multiple') {
              currentValue = files
                .filter((fileItem) => fileItem.fieldKey === f.fieldKey)
                .map((fileItem) => ({
                  seq: fileItem.seq,
                  url: fileItem.filename,
                }));
            } else {
              currentValue = savedData?.[g.groupKey]?.[f.fieldKey] ?? savedData?.[f.fieldKey] ?? null;
            }
          }

          if (currentValue === null || currentValue === undefined || currentValue === '') {
            const defaultValue = this.getDefaultCurrentValue(f.fieldKey, traceabilityId || '');
            if (defaultValue !== null && defaultValue !== undefined) {
              currentValue = defaultValue;
            }
          }

          if (isExternal === YnEnum.Y && this.isLotCodeField(f.fieldKey)) {
            if (!config || typeof config !== 'object') {
              config = {};
            }
            config.disabled = false;
          }

          return {
            fieldKey: f.fieldKey,
            fieldName: f.fieldName,
            fieldType: f.fieldType,
            isRequired: f.isRequired,
            config,
            currentValue,
          };
        });

      return {
        groupKey: g.groupKey,
        groupName: g.groupName,
        fields: groupFields,
      };
    });

    if (isExternal == YnEnum.N && userCode && userHomeCode) {
      const promises: Promise<void>[] = [];
      for (const group of mappedGroups) {
        // Xử lý currentValue mặc định
        const defaultSql = TRACE_FORM_DEFAULT_CURRENT_VALUE_SQL[group.groupKey as keyof typeof TRACE_FORM_DEFAULT_CURRENT_VALUE_SQL];
        if (defaultSql) {
          const needsDefaultValue = group.fields.some((f) => f.currentValue === null || f.currentValue === undefined || f.currentValue === '');
          if (needsDefaultValue) {
            promises.push(
              (async () => {
                try {
                  const rows = await this.repository.getDynamicOptions(defaultSql, userCode, userHomeCode);
                  if (rows && rows.length > 0) {
                    const defaultData = rows[0]; // { fieldKey1: value1, fieldKey2: value2 }
                    for (const field of group.fields) {
                      if (field.currentValue === null || field.currentValue === undefined || field.currentValue === '') {
                        if (defaultData[field.fieldKey] !== undefined) {
                          field.currentValue = defaultData[field.fieldKey];
                        }
                      }
                    }
                  }
                } catch (error) {
                  console.error(`Error fetching default current value for group "${group.groupKey}":`, error);
                }
              })(),
            );
          }
        }
      }

      const submissionsFormData = await this.repository.getSubmissionsFormDataByUserHome(userCode, userHomeCode);
      const activeHarvestPhases = this.collectHarvestPhases(savedData, submissionsFormData);

      // dùng linkValues để fill trường khác tự động từ 1 trường select/radio
      for (const group of mappedGroups) {
        for (const field of group.fields) {
          if (this.isLotCodeField(field.fieldKey)) {
            this.applyLotCodeValueToField(field, userHomeCode, activeHarvestPhases);
          } else {
            // Xử lý options động
            const sqlQuery = TRACE_FORM_CONFIG_OPTIONS_SQL[field.fieldKey as keyof typeof TRACE_FORM_CONFIG_OPTIONS_SQL];
            if (sqlQuery) {
              promises.push(
                (async () => {
                  try {
                    const rows = await this.repository.getDynamicOptions(sqlQuery, userCode, userHomeCode);
                    const options = rows.map((row, idx) => {
                      const { value, label, ...rest } = row;
                      const option: any = {
                        value: value,
                        label: label,
                        sortOrder: idx + 1,
                      };
                      if (Object.keys(rest).length > 0) {
                        option.linkedValues = rest;
                      }
                      return option;
                    });

                    if (!field.config) {
                      field.config = {};
                    } else if (typeof field.config === 'string') {
                      try {
                        field.config = JSON.parse(field.config);
                      } catch (e) {
                        field.config = {};
                      }
                    }

                    field.config.options = options;
                  } catch (error) {
                    console.error(`Error fetching dynamic options for field "${field.fieldKey}":`, error);
                    if (!field.config) {
                      field.config = { options: [] };
                    } else {
                      field.config.options = [];
                    }
                  }
                })(),
              );
            }
          }
        }
      }

      if (promises.length > 0) {
        await Promise.all(promises);
      }
    }

    return mappedGroups;
  }
}
