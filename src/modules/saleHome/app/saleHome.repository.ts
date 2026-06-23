import { Inject, Injectable } from '@nestjs/common';
import type { Pool, ResultSetHeader, RowDataPacket } from 'mysql2/promise';
import { CODES } from 'src/helpers/const.helper';
import { generateCode, safeParseArray } from 'src/helpers/func.helper';
import { OPTION_CONST } from 'src/modules/options/option.interface';
import { SaleHomeFileTypeData, SaleHomeOptionData } from '../saleHome.interface';
import { CreateSaleHomeAppDto } from './saleHome.dto';
import { GetAllSaleHomeResDto, GetDetailSaleHomeResDto } from './saleHome.response';
import { PagingDto } from 'src/dto/admin.dto';

@Injectable()
export class SaleHomeAppRepository {
  private readonly table = 'tbl_sale_home';
  private readonly tableFile = 'tbl_sale_home_file';
  private readonly tableFileType = 'tbl_sale_home_file_type';
  private readonly tableOption = 'tbl_option_common';

  constructor(@Inject('MYSQL_CONNECTION') private readonly db: Pool) {}

  async getHomeSaleOptions(): Promise<SaleHomeOptionData[]> {
    const mainOption = Object.values(OPTION_CONST.SALE_HOME)[0]?.mainOption;
    const [rows] = await this.db.query<RowDataPacket[]>(
      ` SELECT code, subOption, keyOption, valueOption, sortOrder
        FROM ${this.tableOption}
        WHERE mainOption = '${mainOption}' AND isActive = 'Y' 
        ORDER BY subOption, sortOrder ASC`,
    );
    return rows as SaleHomeOptionData[];
  }

  async createSaleHome(dto: CreateSaleHomeAppDto, userCode: string, createdId: string, latitude: number, longitude: number): Promise<number> {
    const sqlLast = `SELECT homeCode FROM ${this.table} ORDER BY seq DESC LIMIT 1`;
    const [rows] = await this.db.execute<any[]>(sqlLast);
    let homeCode = CODES.saleHomeCode.FRIST_CODE;
    if (rows.length > 0) {
      homeCode = generateCode(rows[0].homeCode, CODES.saleHomeCode.PRE, CODES.saleHomeCode.LEN);
    }

    const sql = `
      INSERT INTO ${this.table} (
        homeCode, userCode, hostName, hostPhone, socialContact, hostRole,
        homeName, homelocation, homeAddress, latitude, longitude, homeAge, homeModel,
        currentNests, averageYieldKg, numberOfFloors, numberOfRooms,
        shortDescription, topicsShare, sightseeingAreas, includedServices, serviceNotes, tourFee, durationPerTourMinutes,
        availableDays, timeframes, timeNoticeRequired, commitments,
        uniqueId, status, createdId
      ) VALUES (
        ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?,
        ?, ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?,
        ?, 'WAITING', ?
      )
    `;
    const params = [
      homeCode,
      userCode,
      dto.hostInfo.hostName,
      dto.hostInfo.hostPhone,
      dto.hostInfo.socialContact || null,
      dto.hostInfo.hostRole,
      dto.homeInfo.homeName,
      dto.homeInfo.homelocation,
      dto.homeInfo.homeAddress,
      latitude,
      longitude,
      dto.homeInfo.homeAge,
      dto.homeInfo.homeModel,
      dto.nestInfo.currentNests,
      dto.nestInfo.averageYieldKg,
      dto.nestInfo.numberOfFloors,
      dto.nestInfo.numberOfRooms,
      dto.tourInfo.shortDescription,
      JSON.stringify(dto.tourInfo.topicsShare),
      JSON.stringify(dto.tourInfo.sightseeingAreas),
      JSON.stringify(dto.tourInfo.includedServices),
      dto.tourInfo.serviceNotes || null,
      dto.tourInfo.tourFee,
      dto.tourInfo.durationPerTourMinutes,
      JSON.stringify(dto.policyInfo.availableDays),
      dto.policyInfo.timeframes,
      dto.policyInfo.timeNoticeRequired,
      JSON.stringify(dto.policyInfo.commitments),
      dto.uniqueId,
      createdId,
    ];

    const [result] = await this.db.execute<ResultSetHeader>(sql, params);
    return result.insertId;
  }

  // FILE
  async getHomeSaleFileTypes(): Promise<SaleHomeFileTypeData[]> {
    const [rows] = await this.db.query<RowDataPacket[]>(
      ` SELECT fileTypeCode, fileTypeText
        FROM ${this.tableFileType}
        ORDER BY seq ASC`,
    );
    return rows as SaleHomeFileTypeData[];
  }

  async uploadFileSaleHome(uniqueId: string, createdId: string, filenamePath: string, file: Express.Multer.File, fileTypeCode?: string): Promise<number> {
    const sql = `
      INSERT INTO ${this.tableFile} (filename, originalname, size, mimetype, uniqueId, homeSeq, createdId, fileTypeCode)
      VALUES (?, ?, ?, ?, ?, 0, ?, ?)
    `;
    const [result] = await this.db.execute<ResultSetHeader>(sql, [filenamePath, file.originalname, file.size, file.mimetype, uniqueId, createdId, fileTypeCode || null]);
    return result.insertId;
  }

  async checkExistUniqueIdSaleHome(uniqueId: string): Promise<boolean> {
    const sql = `SELECT seq FROM ${this.table} WHERE uniqueId = ? LIMIT 1`;
    const [rows] = await this.db.execute<RowDataPacket[]>(sql, [uniqueId]);
    return rows.length > 0;
  }

  async updateSeqFilesSaleHome(homeSeq: number, uniqueId: string, updatedId: string): Promise<number> {
    const sql = `
      UPDATE ${this.tableFile} SET homeSeq = ?, updatedId = ?, updatedAt = NOW()
      WHERE uniqueId = ? AND homeSeq = 0
    `;
    const [result] = await this.db.execute<ResultSetHeader>(sql, [homeSeq, updatedId, uniqueId]);
    return result.affectedRows;
  }

  async getFileSaleHomeBySeq(seq: number): Promise<any> {
    const sql = `SELECT filename, createdId FROM ${this.tableFile} WHERE seq = ?`;
    const [rows] = await this.db.execute<RowDataPacket[]>(sql, [seq]);
    return rows[0] || null;
  }

  async deleteFileSaleHome(seq: number, createdId: string): Promise<number> {
    const sql = `DELETE FROM ${this.tableFile} WHERE seq = ? AND createdId = ?`;
    const [result] = await this.db.execute<ResultSetHeader>(sql, [seq, createdId]);
    return result.affectedRows;
  }

  async getFilesNotUse(): Promise<any[]> {
    const sql = `
      SELECT seq, filename 
      FROM ${this.tableFile} 
      WHERE homeSeq = 0 OR uniqueId NOT IN (SELECT uniqueId FROM ${this.table})
    `;
    const [rows] = await this.db.query<RowDataPacket[]>(sql);
    return rows;
  }

  async deleteFileCron(seq: number): Promise<number> {
    const sql = `DELETE FROM ${this.tableFile} WHERE seq = ?`;
    const [result] = await this.db.execute<ResultSetHeader>(sql, [seq]);
    return result.affectedRows;
  }

  async getTotalSaleHomes(dto: PagingDto, userCode: string): Promise<number> {
    const sql = `SELECT COUNT(seq) as total FROM ${this.table} WHERE userCode = ? AND status = 'APPROVED'`;
    const [rows] = await this.db.execute<RowDataPacket[]>(sql, [userCode]);
    return rows[0].total;
  }

  async getAllSaleHomes(dto: PagingDto, userCode: string): Promise<GetAllSaleHomeResDto[]> {
    const page = dto.page || 1;
    const limit = dto.limit || 10;
    const offset = (page - 1) * limit;

    const sql = `
      SELECT h.homeCode, h.homeName, h.homelocation as homeLocation,
             (SELECT filename FROM ${this.tableFile} 
              WHERE uniqueId = h.uniqueId AND fileTypeCode = 'FILE_OUTSIDE' 
              ORDER BY seq ASC LIMIT 1) as homeImage
      FROM ${this.table} h
      WHERE h.userCode = ? AND h.status = 'APPROVED'
      ORDER BY h.seq DESC
      LIMIT ? OFFSET ?
    `;
    const [rows] = await this.db.query<RowDataPacket[]>(sql, [userCode, limit, offset]);

    return rows as GetAllSaleHomeResDto[];
  }

  async getDetailSaleHome(homeCode: string): Promise<GetDetailSaleHomeResDto | null> {
    const sql = `
      SELECT homeCode, status, uniqueId, hostName, hostPhone, socialContact, hostRole,
             homeName, homelocation, homeAddress, homeAge, homeModel,
             latitude, longitude,
             currentNests, averageYieldKg, numberOfFloors, numberOfRooms,
             shortDescription, topicsShare, sightseeingAreas, includedServices, serviceNotes, tourFee, durationPerTourMinutes,
             availableDays, timeframes, timeNoticeRequired, commitments
      FROM ${this.table}
      WHERE homeCode = ? AND status = 'APPROVED' LIMIT 1
    `;
    const [rows] = await this.db.execute<RowDataPacket[]>(sql, [homeCode]);
    if (rows.length === 0) return null;

    const h = rows[0];

    const fileSql = `SELECT seq, filename, mimetype, fileTypeCode FROM ${this.tableFile} WHERE uniqueId = ?`;
    const [fileRows] = await this.db.execute<RowDataPacket[]>(fileSql, [h.uniqueId]);

    const options = await this.getHomeSaleOptions();
    const getOpt = (code: string) => {
      if (!code) return null;
      const opt = options.find((o) => o.code === code);
      return opt ? { code, valueOption: opt.valueOption } : { code, valueOption: code };
    };
    const getOpts = (codes: any[]) => {
      if (!Array.isArray(codes)) return [];
      return codes.map((c) => getOpt(c)).filter((c) => c !== null);
    };

    return {
      homeCode: h.homeCode,
      status: h.status,
      uniqueId: h.uniqueId,
      hostInfo: {
        hostName: h.hostName,
        hostPhone: h.hostPhone,
        socialContact: h.socialContact,
        hostRole: getOpt(h.hostRole) || { code: h.hostRole, valueOption: h.hostRole },
      },
      homeInfo: {
        homeName: h.homeName,
        homelocation: h.homelocation,
        homeAddress: h.homeAddress,
        latitude: h.latitude,
        longitude: h.longitude,
        homeAge: h.homeAge,
        homeModel: getOpt(h.homeModel) || { code: h.homeModel, valueOption: h.homeModel },
      },
      nestInfo: {
        currentNests: h.currentNests,
        averageYieldKg: h.averageYieldKg,
        numberOfFloors: h.numberOfFloors,
        numberOfRooms: h.numberOfRooms,
      },
      tourInfo: {
        shortDescription: h.shortDescription,
        topicsShare: getOpts(safeParseArray(h.topicsShare)),
        sightseeingAreas: getOpts(safeParseArray(h.sightseeingAreas)),
        includedServices: getOpts(safeParseArray(h.includedServices)),
        serviceNotes: h.serviceNotes,
        tourFee: h.tourFee,
        durationPerTourMinutes: h.durationPerTourMinutes,
      },
      policyInfo: {
        availableDays: getOpts(safeParseArray(h.availableDays)),
        timeframes: h.timeframes,
        timeNoticeRequired: h.timeNoticeRequired,
        commitments: getOpts(safeParseArray(h.commitments)),
      },
      files: fileRows,
    };
  }
}
