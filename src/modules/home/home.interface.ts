export interface IHome {
  seq: number;
  homeCode: string;
  homeName: string;
  homeAddress: string;
  homeDescription: string;
  latitude: number;
  longitude: number;
  isActive: 'Y' | 'N';
  createdAt: Date;
  updatedAt: Date;
  createdId: string;
  updatedId: string;
  homeImage: string | IHomeImg;
  homeImages: IHomeImg[]
}

export interface IHomeImg {
  seq: number;
  homeSeq: number;
  filename: string;
  originalname: string;
  size: number;
  mimetype: string;
  isActive: 'Y' | 'N';
}
