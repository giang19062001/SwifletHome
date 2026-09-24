import { Injectable, Optional } from '@nestjs/common';
import { YnEnum } from 'src/interfaces/admin.interface';
import { EXTRA_LINKED_FIELDS } from '../common/traceability.const';
import { TraceabilityExternalRepository } from './traceability-external.repository';
import { generateTraceabilityLotCodeByHarvest } from './traceability.func';
import { TRACE_FORM_CONFIG_OPTIONS_SQL, TRACE_FORM_DEFAULT_CURRENT_VALUE_GENERATE, TRACE_FORM_DEFAULT_CURRENT_VALUE_SQL, TRACE_FORM_LIST_FIELD_SQL } from './traceability.query';
import { TraceabilityAppRepository } from './traceability.repository';
import { TraceabilityExtraLinkedDataDto, TraceabilityFieldResDto, TraceabilityGroupResDto } from './traceability.response';

@Injectable()
export class TraceabilityFieldsService {
  constructor(
    private readonly repository: TraceabilityAppRepository,
    @Optional() private readonly externalRepository?: TraceabilityExternalRepository,
  ) {}

  /**
   * Danh sách các trường đặc biệt đại diện cho Mã Lô (LotCode)
   */
  public readonly LOT_CODE_FIELD_FOLLOW_HARVEST = 'hiNumberHarvest';
  public readonly LOT_CODE_FIELDS = ['diLotCode', 'rmInputLot', 'lfpLotProcessings', 'dLotFinished', 'rLotRecall', 'eiLotCode'];

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
      if (val[this.LOT_CODE_FIELD_FOLLOW_HARVEST] !== undefined) {
        return this.parsePhases(val[this.LOT_CODE_FIELD_FOLLOW_HARVEST]);
      }
    }
    return [];
  }

  /**
   * Bóc tách giá trị đợt thu hoạch (LOT_CODE_FIELD_FOLLOW_HARVEST) từ formData
   */
  extractHiNumberHarvest(formData: any): number[] {
    if (!formData || typeof formData !== 'object') return [];
    const phases: number[] = [];

    if (formData[this.LOT_CODE_FIELD_FOLLOW_HARVEST] !== undefined) {
      phases.push(...this.parsePhases(formData[this.LOT_CODE_FIELD_FOLLOW_HARVEST]));
    }

    for (const key of Object.keys(formData)) {
      if (formData[key] && typeof formData[key] === 'object') {
        if (formData[key][this.LOT_CODE_FIELD_FOLLOW_HARVEST] !== undefined) {
          phases.push(...this.parsePhases(formData[key][this.LOT_CODE_FIELD_FOLLOW_HARVEST]));
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
    userCode: string,
    userHomeCode?: string,
    batchLotcode?: string | null,
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
          if (traceabilityCode && g.isLoop !== 'Y') {
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
              if (f.fieldType === 'list_readonly' && typeof currentValue === 'string') {
                try {
                  currentValue = JSON.parse(currentValue);
                } catch (e) {}
              }
            }
          }

          if (g.isLoop !== 'Y' && (currentValue === null || currentValue === undefined || currentValue === '')) {
            const defaultValue = this.getDefaultCurrentValue(f.fieldKey, traceabilityId || '');
            if (defaultValue !== null && defaultValue !== undefined) {
              currentValue = defaultValue;
            }
          }

          // Toàn bộ LOT_CODE_FIELDS đều bị disabled = true (chỉ hiển thị mã lô từ batch)
          if (this.isLotCodeField(f.fieldKey)) {
            if (!config || typeof config !== 'object') {
              config = {};
            }
            config.disabled = true;
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

      // Xử lý các nhóm dạng lặp (isLoop = 'Y') để lấy giá trị hiện tại từ savedData
      let loopValues: any[] | undefined = undefined;
      if (g.isLoop === 'Y') {
        loopValues = [];
        if (traceabilityCode && savedData?.[g.groupKey]) {
          const rawArray = Array.isArray(savedData[g.groupKey]) ? savedData[g.groupKey] : [savedData[g.groupKey]];

          rawArray.forEach((item: any, idx: number) => {
            const itemObj: any = {};
            groupFields.forEach((gf) => {
              let val = item?.[gf.fieldKey] ?? null;
              if (gf.fieldType === 'file_single') {
                const matchedFile = files.find((fileItem) => fileItem.fieldKey === `${gf.fieldKey}_${idx}` || (idx === 0 && fileItem.fieldKey === gf.fieldKey));
                val = matchedFile ? { seq: matchedFile.seq, url: matchedFile.filename } : val && typeof val === 'object' && val.url ? val : null;
              } else if (gf.fieldType === 'file_multiple') {
                const matchedFiles = files.filter((fileItem) => fileItem.fieldKey === `${gf.fieldKey}_${idx}` || (idx === 0 && fileItem.fieldKey === gf.fieldKey));
                val = matchedFiles.length > 0 ? matchedFiles.map((mf) => ({ seq: mf.seq, url: mf.filename })) : Array.isArray(val) ? val : [];
              }
              itemObj[gf.fieldKey] = val;
            });
            loopValues!.push(itemObj);
          });
        }
      }

      return {
        groupKey: g.groupKey,
        groupName: g.groupName,
        isLoop: g.isLoop || 'N',
        loopValues,
        fields: groupFields,
      };
    });

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
                const rows = await this.repository.getDynamicOptions(defaultSql, userCode, '');
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
    if (isExternal == YnEnum.N && userCode && userHomeCode) {
      const submissionsFormData = await this.repository.getSubmissionsFormDataByUserHome(userCode, userHomeCode);
      const activeHarvestPhases = this.collectHarvestPhases(savedData, submissionsFormData);
      let generatedLotCode: string | null = null;
      if (activeHarvestPhases && activeHarvestPhases.length > 0) {
        generatedLotCode = generateTraceabilityLotCodeByHarvest(userHomeCode, activeHarvestPhases);
      }
      const finalLotCode = batchLotcode || generatedLotCode || '';

      for (const group of mappedGroups) {
        for (const field of group.fields) {
          if (this.isLotCodeField(field.fieldKey)) {
            field.currentValue = finalLotCode;
            if (group.isLoop === 'Y' && Array.isArray(group.loopValues)) {
              group.loopValues.forEach((row) => {
                row[field.fieldKey] = finalLotCode;
              });
            }
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
                        ...rest,
                      };
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

            // Xử lý giá trị danh sách cho các trường dạng list_readonly (vd: shsTodoList)
            const listSql = TRACE_FORM_LIST_FIELD_SQL[field.fieldKey as keyof typeof TRACE_FORM_LIST_FIELD_SQL];
            if (listSql && (field.currentValue === null || field.currentValue === undefined || (Array.isArray(field.currentValue) && field.currentValue.length === 0))) {
              promises.push(
                (async () => {
                  try {
                    const rows = await this.repository.getDynamicOptions(listSql, userCode, userHomeCode);
                    field.currentValue = rows || [];
                  } catch (error) {
                    console.error(`Error fetching list field value for "${field.fieldKey}":`, error);
                    field.currentValue = [];
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

    if (isExternal == YnEnum.Y || (isExternal as any) === 'Y') {
      let lotcodeValue = batchLotcode || '';

      if (!lotcodeValue && traceabilityId) {
        if (this.externalRepository) {
          const batch = await this.externalRepository.getBatchByTraceabilityId(traceabilityId, userCode);
          if (batch && batch.lotcode) {
            lotcodeValue = batch.lotcode;
          }
        }
      }

      for (const group of mappedGroups) {
        for (const field of group.fields) {
          if (this.isLotCodeField(field.fieldKey)) {
            field.currentValue = lotcodeValue;

            if (group.isLoop === 'Y' && Array.isArray(group.loopValues)) {
              group.loopValues.forEach((row) => {
                row[field.fieldKey] = lotcodeValue;
              });
            }
          }
        }
      }
    }

    return mappedGroups;
  }

  // Trích xuất dữ liệu liên kết từ các đợt truy xuất nội bộ để trả về cho truy xuất ngoại
  extractExtraFieldsFromInternalSubmissions(submissions: any[]): TraceabilityExtraLinkedDataDto {
    const data = Object.values(EXTRA_LINKED_FIELDS)
      .flatMap(({ fields }) => fields)
      .reduce((acc, field) => {
        acc[field] = '';
        return acc;
      }, {} as TraceabilityExtraLinkedDataDto);

    submissions.forEach((sub) => {
      const config = EXTRA_LINKED_FIELDS[sub.formSeq as keyof typeof EXTRA_LINKED_FIELDS];

      if (!config) return;

      let parsed: any;

      try {
        parsed = typeof sub.formData === 'string' ? JSON.parse(sub.formData) : sub.formData;
      } catch {
        return;
      }

      if (!parsed) return;

      const section = parsed[config.key] || (config.key === 'HARVEST_MEASUREMENT' ? parsed['HARVEST_ MEASUREMENT'] : undefined);

      if (!section) return;

      config.fields.forEach((field) => {
        if (section[field] !== undefined && section[field] !== null) {
          data[field] = section[field];
        }
      });
    });

    return data;
  }
}
