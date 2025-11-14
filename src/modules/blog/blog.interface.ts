export interface IBlog {
  seq: number;
  blogCode: string;
  blogObject: string;
  blogContent: string;
  blogCategory: string;
  blogScreenCode: string;
  isActive: 'Y' | 'N';
  isFree: 'Y' | 'N';
  createdAt: string;
  updatedAt: string;
  createdId: string;
  updatedId: string;
}
