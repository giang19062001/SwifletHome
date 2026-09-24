import { Injectable } from '@nestjs/common';
import { INTERNAL_WHITELIST, EXTERNAL_WHITELIST } from '../common/traceability.const';

@Injectable()
export class TraceabilityFieldsAdminService {
  mapGroupsAndFields(groups: any[], fields: any[], savedData: any, files: any[]): any[] {
    return groups.map((g) => {
      const groupFields = fields
        .filter((f) => f.groupSeq === g.seq)
        .map((f) => {
          let config: any = null;
          try {
            config = typeof f.config === 'string' ? JSON.parse(f.config) : f.config;
          } catch (e) {
            config = f.config;
          }

          let currentValue: any = null;
          if (g.isLoop !== 'Y') {
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

          return {
            fieldKey: f.fieldKey,
            fieldName: f.fieldName,
            fieldType: f.fieldType,
            isRequired: f.isRequired,
            config,
            currentValue,
          };
        });

      let loopValues: any[] | undefined = undefined;
      if (g.isLoop === 'Y') {
        loopValues = [];
        if (savedData?.[g.groupKey]) {
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
  }

  cleanKey(k: string): string {
    return (k || '').replace(/[\s_]/g, '').toUpperCase();
  }

  readonly internalWhitelist: Record<string, Record<string, string[] | 'ALL'>> = INTERNAL_WHITELIST;
  readonly externalWhitelist: Record<string, Record<string, string[] | 'ALL'>> = EXTERNAL_WHITELIST;

  getActiveWhitelist(isExternal: boolean): Record<string, Record<string, string[] | 'ALL'>> {
    return isExternal ? this.externalWhitelist : this.internalWhitelist;
  }

  isFormAllowedInCompact(formKey: string, isExternal: boolean): boolean {
    const activeWhitelist = this.getActiveWhitelist(isExternal);
    return Object.keys(activeWhitelist).some((k) => this.cleanKey(k) === this.cleanKey(formKey));
  }

  filterGroupsForCompact(formKey: string, mappedGroups: any[], isExternal: boolean): any[] {
    const activeWhitelist = this.getActiveWhitelist(isExternal);
    const formKeyMatched = Object.keys(activeWhitelist).find((k) => this.cleanKey(k) === this.cleanKey(formKey));
    const formAllowedGroups = formKeyMatched ? activeWhitelist[formKeyMatched] : null;

    if (!formAllowedGroups) {
      return [];
    }

    return mappedGroups
      .filter((g) => {
        const cGroup = this.cleanKey(g.groupKey);
        return Object.keys(formAllowedGroups).some((k) => this.cleanKey(k) === cGroup);
      })
      .map((g) => {
        const matchedKey = Object.keys(formAllowedGroups).find((k) => this.cleanKey(k) === this.cleanKey(g.groupKey));
        const allowedFields = matchedKey ? formAllowedGroups[matchedKey] : null;
        if (!allowedFields || allowedFields === 'ALL') {
          return g;
        }
        const filteredFields = (g.fields || []).filter((f: any) => allowedFields.some((af: string) => this.cleanKey(af) === this.cleanKey(f.fieldKey)));
        return {
          ...g,
          fields: filteredFields,
        };
      });
  }

  getFieldValue(forms: any[], formKey: string, groupKey: string, fieldKey: string): any {
    const form = forms.find((f) => this.cleanKey(f.formKey) === this.cleanKey(formKey));
    const group = form?.submission?.groups?.find((g: any) => this.cleanKey(g.groupKey) === this.cleanKey(groupKey));
    const field = group?.fields?.find((f: any) => this.cleanKey(f.fieldKey) === this.cleanKey(fieldKey));
    return field?.currentValue ?? null;
  }

  getGroupData(forms: any[], formKey: string, groupKey: string): any {
    const form = forms.find((f) => this.cleanKey(f.formKey) === this.cleanKey(formKey));
    return form?.submission?.groups?.find((g: any) => this.cleanKey(g.groupKey) === this.cleanKey(groupKey)) ?? null;
  }

  buildCompactData(params: { isExternal: boolean; lotcode: string; formDataExtra: any; homeInfo: any; forms: any[] }): any {
    const { isExternal, lotcode, formDataExtra, homeInfo, forms } = params;

    if (isExternal) {
      return {
        lotcode,
        formDataExtra,
        rmTeamExecution: this.getFieldValue(forms, 'PRE_PROCESSING', 'RECEIVING_MATERIAL', 'rmTeamExecution'),
        rmAddress: this.getFieldValue(forms, 'PRE_PROCESSING', 'RECEIVING_MATERIAL', 'rmAddress'),
        diaryProcessGroup: this.getGroupData(forms, 'PRE_PROCESSING', 'DIARY_PROCESS'),
        pcProductName: this.getFieldValue(forms, 'PACKING_QR', 'PRODUCT_CATALOG', 'pcProductName'),
        pcBasicSpecification: this.getFieldValue(forms, 'PACKING_QR', 'PRODUCT_CATALOG', 'pcBasicSpecification'),
        iiApplicableStandard: this.getFieldValue(forms, 'PACKING_QR', 'INGREDIENT_INSTRUCTION', 'iiApplicableStandard'),
        iiInstructionUse: this.getFieldValue(forms, 'PACKING_QR', 'INGREDIENT_INSTRUCTION', 'iiInstructionUse'),
      };
    }

    return {
      lotcode,
      facilityName: this.getFieldValue(forms, 'BRIEF_SWIFT_HOUSE', 'FACILITY_INFO', 'facilityName') || homeInfo?.userHomeName || '',
      fiIdentificationCode: this.getFieldValue(forms, 'BRIEF_SWIFT_HOUSE', 'FACILITY_INFO', 'fiIdentificationCode') || '',
      facilityAddress: this.getFieldValue(forms, 'BRIEF_SWIFT_HOUSE', 'FACILITY_INFO', 'facilityAddress') || homeInfo?.userHomeAddress || '',
      hiNumberHarvest: this.getFieldValue(forms, 'BATCH_HARVEST', 'HARVEST_INFORMATION', 'hiNumberHarvest'),
      hmNumberNests: this.getFieldValue(forms, 'BATCH_HARVEST', 'HARVEST_MEASUREMENT', 'hmNumberNests'),
      hmWeight: this.getFieldValue(forms, 'BATCH_HARVEST', 'HARVEST_MEASUREMENT', 'hmWeight'),
      hmWeightingPhoto: this.getFieldValue(forms, 'BATCH_HARVEST', 'HARVEST_MEASUREMENT', 'hmWeightingPhoto'),
      todoListGroup: this.getGroupData(forms, 'LOGBOOK_HOUSE', 'SWIFT_HOUSE_TD'),
      medicineGroup: this.getGroupData(forms, 'LOGBOOK_HOUSE', 'SWIFT_HOUSE_MEDICINE'),
    };
  }
}
