import { BadRequestException, Injectable } from '@nestjs/common';
import { FileLocalService } from 'src/common/fileLocal/fileLocal.service';
import { getFileLocation } from 'src/config/multer.config';
import { Msg } from 'src/helpers/message.helper';
import { CreateTradeDto, GetTradeListDto, UploadTradeImageDto } from './trade.dto';
import { TradeAppRepository } from './trade.repository';
import { TradeItemResDto, TradeListResDto, UploadTradeImageResDto } from './trade.response';
import { TradeInteractTypeEnum } from '../trade.enum';

@Injectable()
export class TradeAppService {
  constructor(
    private readonly repository: TradeAppRepository,
    private readonly fileLocalService: FileLocalService,
  ) {}

  async sell(dto: CreateTradeDto, userCode: string): Promise<number> {
    // 1. Kiểm tra ảnh tổ yến đã upload với uniqueId chưa
    const file = await this.repository.findActiveFileByUniqueId(dto.uniqueId);
    if (!file) {
      throw new BadRequestException({
        message: Msg.TradeImageNotFound,
        data: 0,
      });
    }

    // 2. Tạo đơn đăng bán mới (status mặc định SELLING)
    const tradeSeq = await this.repository.createTrade(dto, userCode);
    if (!tradeSeq) {
      throw new BadRequestException({
        message: Msg.CreateErr,
        data: 0,
      });
    }

    // 3. Liên kết file ảnh upload với tradeSeq vừa tạo
    await this.repository.bindFileToTrade(tradeSeq, dto.uniqueId, userCode);

    return 1;
  }

  async uploadImage(dto: UploadTradeImageDto, file: Express.Multer.File, userCode: string): Promise<UploadTradeImageResDto[]> {
    if (!file) {
      throw new BadRequestException({ message: Msg.FileEmpty, data: null });
    }

    // Đảm bảo chỉ có 1 ảnh duy nhất cho mỗi uniqueId: xóa các ảnh cũ chưa bind nếu người dùng chọn lại
    const unlinkedFiles = await this.repository.findUnlinkedFilesByUniqueId(dto.uniqueId);
    for (const oldFile of unlinkedFiles) {
      if (oldFile.filename) {
        await this.fileLocalService.deleteLocalFile(oldFile.filename);
      }
      await this.repository.deleteFileBySeq(oldFile.seq);
    }

    const relativePath = `${getFileLocation(file.mimetype, file.fieldname)}/${file.filename}`;
    const seq = await this.repository.insertFile(0, userCode, dto.uniqueId, relativePath, file.originalname, file.size, file.mimetype, userCode);

    return [
      {
        seq,
        filename: relativePath,
      },
    ];
  }

  async deleteImage(seq: number, userCode: string): Promise<number> {
    const fileInfo = await this.repository.getFileBySeq(seq);
    if (!fileInfo || fileInfo.createdId !== userCode) {
      return 0;
    }

    if (fileInfo.filename) {
      await this.fileLocalService.deleteLocalFile(fileInfo.filename);
    }

    return await this.repository.deleteFileBySeq(seq);
  }

  async getList(dto: GetTradeListDto, userCode: string): Promise<TradeListResDto> {
    const page = Math.max(1, Number(dto.page) || 1);
    const limit = Math.max(1, Number(dto.limit) || 10);

    const { list, total } = await this.repository.getTradeList(dto, userCode);

    const mappedList: TradeItemResDto[] = list.map((item) => ({
      seq: item.seq,
      sellerName: item.sellerName,
      sellerPhone: item.sellerPhone,
      price: item.price,
      mass: Number(item.mass),
      nestQuantity: Number(item.nestQuantity),
      status: item.status,
      tradeNestImage: item.tradeNestImage || '',
      isMine: Boolean(item.isMine),
      isSaved: Boolean(item.isSaved),
      createdAt: item.createdAt,
      updatedAt: item.updatedAt || null,
    }));

    const totalPage = Math.ceil(total / limit);

    return {
      list: mappedList,
      total,
      page,
      limit,
      totalPage,
    };
  }

  async getDetail(seq: number, userCode: string): Promise<TradeItemResDto | null> {
    const item = await this.repository.getTradeDetail(seq, userCode);
    if (!item) {
      return null;
    }

    // Mặc định đánh dấu là 'SEEN' khi gọi API detail
    await this.recordSeen(seq, userCode);

    return {
      seq: item.seq,
      sellerName: item.sellerName,
      sellerPhone: item.sellerPhone,
      price: item.price,
      mass: Number(item.mass),
      nestQuantity: Number(item.nestQuantity),
      status: item.status,
      tradeNestImage: item.tradeNestImage || '',
      isMine: Boolean(item.isMine),
      isSaved: Boolean(item.isSaved),
      createdAt: item.createdAt,
      updatedAt: item.updatedAt || null,
    };
  }

  async recordSeen(tradeSeq: number, userCode: string): Promise<void> {
    const existing = await this.repository.findInteract(tradeSeq, userCode, TradeInteractTypeEnum.SEEN);
    if (existing) {
      await this.repository.updateInteractUpdatedAt(tradeSeq, userCode, TradeInteractTypeEnum.SEEN);
    } else {
      await this.repository.insertInteract(tradeSeq, userCode, TradeInteractTypeEnum.SEEN);
    }
  }

  async interact(tradeSeq: number, userCode: string, type: TradeInteractTypeEnum = TradeInteractTypeEnum.SAVED): Promise<number> {
    const trade = await this.repository.getTradeDetail(tradeSeq, userCode);
    if (!trade) {
      throw new BadRequestException({ message: Msg.TradeNotFound, data: 0 });
    }

    // API interact chỉ xử lý type = 'SAVED' (toggle lưu / bỏ lưu)
    const existing = await this.repository.findInteract(tradeSeq, userCode, TradeInteractTypeEnum.SAVED);
    if (existing) {
      await this.repository.deleteInteract(tradeSeq, userCode, TradeInteractTypeEnum.SAVED);
      return 1;
    } else {
      await this.repository.insertInteract(tradeSeq, userCode, TradeInteractTypeEnum.SAVED);
      return 1;
    }
  }

  async getFilesNotUse(): Promise<{ seq: number; filename: string }[]> {
    return await this.repository.getFilesNotUse();
  }

  async deleteFileCron(seq: number): Promise<number> {
    return await this.repository.deleteFileCron(seq);
  }
}
