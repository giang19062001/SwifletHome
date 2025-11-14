import { IList, IPaging } from 'src/interfaces/common';

// chỉ dùng cho những module nào CRUD full ở admin site
export abstract class AbAdminService {
  constructor() {}
  abstract getAll(dto: IPaging | any): Promise<IList<any> | any[]>;
  abstract getDetail(dto: string | number): Promise<any | null>;
  abstract create(dto: any): Promise<number>;
  abstract update(dto: any, id: string | number): Promise<number>;
  abstract delete(dto: string | number): Promise<number>;
}

// chỉ dùng cho những module nào CRUD full ở admin site
export abstract class AbAdminRepo {
  constructor() {}
  abstract getTotal(dto?: any): Promise<number>;
  abstract getAll(dto: IPaging | any): Promise<IList<any> | any[]>;
  abstract getDetail(dto: string | number): Promise<any | null>;
  abstract create(dto: any): Promise<number>;
  abstract update(dto: any, id: string | number): Promise<number>;
  abstract delete(dto: string | number): Promise<number>;
}
