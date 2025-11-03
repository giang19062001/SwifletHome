export interface IFileUpload {
  seq: number;
  filename: string;
  originalname: string;
  size: number;
  mimetype: string;
  isActive: string;
  urlLink: string;
  createdAt: string;
  updatedAt: string;
  createdId?: string;
  updatedId?: string;
}

export interface IAudioFreePay {
  filenameFree: string;
  mimetypeFree: string;
  filenamePay: string;
  mimetypePay: string;
}
