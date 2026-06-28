export class TeamFileTypeResDto {
  seq?: number;
  fileTypeCode: string;
  fileTypeText: string;
  isActive?: string;
}

export class TeamServiceTypeResDto {
  seq: number;
  userTypeCode: string;
  serviceTypeCode: string;
  serviceTypeName: string;
}

export class TeamImgBaseResDto {
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

export class TeamServiceBaseResDto {
  seq: number;
  seqTeam: number;
  uniqueId: string;
  userTypeCode: string;
  serviceTypeCode: string;
  serviceTextInput: string;
}

export class TeamServiceFileBaseResDto {
  seq: number;
  seqService: number;
  filename: string;
  originalname: string;
  size: number;
  mimetype: string;
  isActive: string;
  uniqueId?: string;
}

export class TeamFileNotUseResDto {
  seq: number;
  filename: string;
}
