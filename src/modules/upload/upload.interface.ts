export interface IFileUpload {
  seq: number;
  filename: string;
  filenamePay: string;
  originalname: string;
  size: number;
  mimetype: string;
  urlLink: string;
  createdAt: Date;
  updatedAt: Date;
  createdId: string;
  updatedId: string;
}


export interface IAudioFreePay {
  filenameFree: string;
  mimetypeFree: string;
  filenamePay: string;
  mimetypePay: string;
}
