export class TeamFileTypeAdminResDto {
  seq?: number;
  fileTypeCode: string;
  fileTypeText: string;
  isActive?: string;
}
export class TeamServiceTypeAdminResDto {
  seq: number;
  userTypeCode: string;
  serviceTypeCode: string;
  serviceTypeName: string;
}
export class TeamImgBaseAdminResDto {
  seq: number;
  teamSeq?: number;
  filename: string;
  originalname: string;
  size: number;
  mimetype: string;
  isActive: string;
  fileTypeCode?: string;
  uniqueId?: string;
}
export class TeamServiceBaseAdminResDto {
  seq: number;
  seqTeam: number;
  uniqueId: string;
  userTypeCode: string;
  serviceTypeCode: string;
  serviceTextInput: string;
}
export class TeamServiceFileBaseAdminResDto {
  seq: number;
  seqService: number;
  filename: string;
  originalname: string;
  size: number;
  mimetype: string;
  isActive: string;
  uniqueId?: string;
}
export class TeamFileNotUseAdminResDto {
  seq: number;
  filename: string;
}
