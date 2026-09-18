import { Injectable } from '@nestjs/common';

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
  }
}
