export interface IFileUpload {
  seq: number;
  filename: string;
  originalname: string;
  size: number;
  mimetype: string;
  isActive: string;
  source: string;
  urlLink?: string;
  createdAt?: string;
  updatedAt: string;
  createdId?: string;
  updatedId?: string;
}
