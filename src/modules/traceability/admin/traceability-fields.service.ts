import { Injectable } from '@nestjs/common';
import { EXTERNAL_COMPACT_WHITELIST, GROUP_COMPACT_ALIASES, INTERNAL_COMPACT_WHITELIST, LOOP_GROUP_INFO } from '../common/traceability.const';

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
              if (f.fieldType === 'list_canwrite' && typeof currentValue === 'string') {
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
        let rawData = savedData?.[g.groupKey];
        if (!rawData && savedData) {
          const matchedKey = Object.keys(savedData).find((k) => this.cleanKey(k) === this.cleanKey(g.groupKey));
          if (matchedKey) {
            rawData = savedData[matchedKey];
          } else if (Array.isArray(savedData)) {
            rawData = savedData;
          }
        }
        if (typeof rawData === 'string') {
          try {
            rawData = JSON.parse(rawData);
          } catch (e) {}
        }
        if (rawData) {
          const rawArray = Array.isArray(rawData) ? rawData : [rawData];

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

      const loopMetadata = (LOOP_GROUP_INFO as Record<string, any>)[g.groupKey] || (g.isLoop === 'Y' ? { title: 'Công đoạn' } : undefined);

      return {
        groupKey: g.groupKey,
        groupName: g.groupName,
        isLoop: g.isLoop || 'N',
        loopValues,
        loopMetadata,
        fields: groupFields,
      };
    });
  }

  cleanKey(k: string): string {
    return (k || '').replace(/[\s_]/g, '').toUpperCase();
  }

  readonly internalWhitelist: Record<string, Record<string, string[] | 'ALL'>> = INTERNAL_COMPACT_WHITELIST;
  readonly externalWhitelist: Record<string, Record<string, string[] | 'ALL'>> = EXTERNAL_COMPACT_WHITELIST;

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

  private toCamelCase(str: string): string {
    return str.toLowerCase().replace(/[-_]([a-z])/g, (_, letter) => letter.toUpperCase());
  }

  buildCompactData(params: { isExternal: boolean; lotcode: string; homeInfo: any; forms: any[]; harvestPhaseLabels?: string[] }): any {
    const { isExternal, lotcode, forms } = params;
    const activeWhitelist = this.getActiveWhitelist(isExternal);

    const result: Record<string, any> = {
      isExternal: Boolean(isExternal),
      lotcode,
    };

    for (const [formKey, groups] of Object.entries(activeWhitelist)) {
      for (const [groupKey, fields] of Object.entries(groups)) {
        if (fields === 'ALL') {
          const groupData = this.getGroupData(forms, formKey, groupKey);
          const camelGroupKey = this.toCamelCase(groupKey) + 'Group';
          result[camelGroupKey] = groupData;
          result[groupKey] = groupData;

          // Aliases for backward compatibility
          const alias = GROUP_COMPACT_ALIASES[groupKey];

          if (alias) {
            result[alias] = groupData;
          }

          if (groupData) {
            if (Array.isArray(groupData.loopValues) && groupData.loopValues.length > 0) {
              const firstItem = groupData.loopValues[0];
              for (const [k, v] of Object.entries(firstItem)) {
                if (!(k in result)) {
                  result[k] = v;
                }
              }
            }
            if (Array.isArray(groupData.fields)) {
              for (const f of groupData.fields) {
                if (f.fieldKey && !(f.fieldKey in result)) {
                  result[f.fieldKey] = f.currentValue;
                }
              }
            }
          }

          continue;
        } else if (Array.isArray(fields)) {
          for (const fieldKey of fields) {
            const val = this.getFieldValue(forms, formKey, groupKey, fieldKey);
            result[fieldKey] = val;
          }
        }
      }
    }

    return result;
  }
}
