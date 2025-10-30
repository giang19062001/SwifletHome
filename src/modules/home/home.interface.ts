export interface IHome {
  seq: number;
  homeCode: string;
  homeName: string;
  homeAddress: string;
  homeDescription: string;
  latitude: number;
  longitude: number;
  isActive: string;
  createdAt: string;
  updatedAt: string;
  createdId: string;
  updatedId: string;
  homeImage: string | IHomeImg;
  homeImages: IHomeImg[]
}

export interface IHomeImg {
  seq: number;
  homeSeq: number;
  homeName: string;
  filename: string;
  originalname: string;
  source: string;
  size: number;
  mimetype: string;
  isActive: string;
}
