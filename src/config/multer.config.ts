import { BadRequestException } from '@nestjs/common';
import { existsSync, mkdirSync, promises as fs } from 'fs';
import { diskStorage, StorageEngine } from 'multer';
import { extname, join } from 'path';
import { MinioService } from 'src/common/minio/minio.service';
import { AUDIO_TYPES, DOCS_TYPES, IMG_TYPES, VIDEO_TYPES } from 'src/helpers/const.helper';
import { Msg } from 'src/helpers/message.helper';
import { v4 as uuidv4 } from 'uuid';

const FILE_SIZE_LIMITS = {
  image: 50 * 1024 * 1024, // 50MB
  audio: 50 * 1024 * 1024, // 50MB
  video: 100 * 1024 * 1024, // 100MB
  mix: 100 * 1024 * 1024, // 100MB
};

interface MulterLimits {
  fileSize?: number;
  files?: number;
  fields?: number;
  parts?: number;
  fieldNameSize?: number;
  fieldSize?: number;
  headerPairs?: number;
}

export const validateImgExt = (originalname) => {
  const ext = extname(originalname).toLowerCase();
  if (IMG_TYPES.includes(ext)) {
    return true;
  } else {
    return false;
  }
};

export const getFileLocation = (mimetype: string, fieldname: string, infoExtra?: { isExternal?: boolean }) => {
  let result = '';

  if (mimetype.startsWith('image/')) {
    if (fieldname.includes('userHomeImage')) {
      result = 'images/userHomes';
    } else if (fieldname.includes('editorImg')) {
      result = 'images/editors';
    } else if (fieldname.includes('doctorFiles')) {
      result = 'images/doctors';
    } else if (fieldname.includes('saleHomeFiles')) {
      result = 'images/saleHomes';
    } else if (fieldname.includes('configfiles')) {
      result = 'images/configs';
    } else if (fieldname.includes('screenImage')) {
      result = 'images/screens';
    } else if (fieldname.includes('adsBanner')) {
      result = 'images/ads';
    } else if (fieldname.includes('teamImage') || fieldname.includes('teamFiles') || fieldname.includes('teamServiceFiles')) {
      result = 'images/teams';
    } else if (fieldname.includes('reviewImg')) {
      result = 'images/reviews';
    } else if (fieldname.includes('traceabilityFiles')) {
      result = infoExtra?.isExternal ? 'images/tracesExternal' : 'images/traces';
    } else if (fieldname.includes('tradeNestFile')) {
      result = 'images/tradeNests';
    }
  } else if (mimetype.startsWith('video/')) {
    if (fieldname.includes('doctorFiles')) {
      result = 'videos/doctors';
    } else if (fieldname.includes('saleHomeFiles')) {
      result = 'videos/saleHomes';
    } else if (fieldname.includes('teamFiles') || fieldname.includes('teamServiceFiles')) {
      result = 'videos/teams';
    } else if (fieldname.includes('traceabilityFiles')) {
      result = infoExtra?.isExternal ? 'videos/tracesExternal' : 'videos/traces';
    }
  } else if (mimetype.startsWith('audio/')) {
    if (fieldname.includes('editorAudio')) {
      result = 'audios/editors';
    } else if (fieldname.includes('mediaAudio')) {
      result = 'audios/medias';
    }
  } else {
    if (fieldname.includes('traceabilityFiles')) {
      result = infoExtra?.isExternal ? 'docs/tracesExternal' : 'docs/traces';
    }
  }

  return 'uploads/' + result;
};

// Cache thư mục đã tạo — tránh gọi existsSync/mkdirSync lặp lại mỗi request
const createdDirs = new Set<string>();

function ensureDir(folderPath: string) {
  if (createdDirs.has(folderPath)) return;
  if (!existsSync(folderPath)) {
    mkdirSync(folderPath, { recursive: true });
  }
  createdDirs.add(folderPath);
}

export const createMulterConfig = (allowedExts: string[], customLimits?: MulterLimits) => {
  const defaultLimits: MulterLimits = {
    fileSize: FILE_SIZE_LIMITS.mix,
    files: undefined, // không giới hạn nếu không truyền
  };

  const limits = { ...defaultLimits, ...customLimits }; // ghi dè limits nếu có

  const baseDiskStorage = diskStorage({
    destination: (req: any, file, cb) => {
      const isExternal = req.body?.isExternal === 'Y';
      const location = getFileLocation(file.mimetype, file.fieldname, { isExternal });
      const folderPath = join(process.cwd(), 'public', location);
      ensureDir(folderPath);
      cb(null, folderPath);
    },
    filename: (req, file, cb) => {
      const ext = extname(file.originalname);
      const uniqueName = `${file.fieldname}-${uuidv4()}${ext}`;
      cb(null, uniqueName);
    },
  });

  const hybridStorage: StorageEngine = {
    _handleFile(req, file, cb) {
      baseDiskStorage._handleFile(req, file, (err, info) => {
        if (err) return cb(err);
        if (!info) return cb(null, info);

        const ext = extname(file.originalname).toLowerCase();
        const isVideo = file.mimetype.startsWith('video/') || ext === '.mov' || ext === '.webm' || ext === '.mp4';

        // Nếu là video: giữ file trên disk để VideoConverterInterceptor + FFmpeg nén
        if (isVideo) {
          return cb(null, info);
        }

        // Nếu là file ảnh, audio, doc: upload ngay lên MinIO
        const minio = MinioService.getInstance();
        if (!minio) {
          return cb(null, info);
        }

        const isExternal = (req as any).body?.isExternal === 'Y';
        const location = getFileLocation(file.mimetype, file.fieldname, { isExternal });
        const objectKey = `${location}/${info.filename}`;

        if (!info.path) {
          return cb(null, info);
        }

        minio
          .uploadFromPath(info.path, objectKey, file.mimetype)
          .then(async () => {
            // Xóa ngay file tạm trên local disk sau khi upload thành công lên MinIO
            // (Đảm bảo lưu 1 nơi duy nhất là MinIO và không tốn ổ cứng server)
            try {
              if (info.path && existsSync(info.path)) {
                await fs.unlink(info.path);
              }
            } catch (unlinkErr) {
              console.error(`[MulterStorage] Không thể xóa file tạm ${info.path}:`, unlinkErr);
            }
            cb(null, info);
          })
          .catch((uploadErr) => {
            console.error(`[MulterStorage] Lỗi upload ${objectKey} lên MinIO:`, uploadErr);
            cb(null, info);
          });
      });
    },
    _removeFile(req, file, cb) {
      baseDiskStorage._removeFile(req, file, cb);
    },
  };

  return {
    storage: hybridStorage,
    limits,
    fileFilter: (req: any, file: { originalname: string }, cb: (arg0: BadRequestException | null, arg1: boolean) => void) => {
      const ext = extname(file.originalname).toLowerCase();
      if (allowedExts.includes(ext)) {
        cb(null, true);
      } else {
        cb(new BadRequestException(Msg.FileWrongType(ext, allowedExts)), false);
      }
    },
  };
};

export const multerImgConfig = createMulterConfig(IMG_TYPES, {
  fileSize: FILE_SIZE_LIMITS.image, // 50MB cho ảnh
});

export const multerAudioConfig = createMulterConfig(AUDIO_TYPES, {
  fileSize: FILE_SIZE_LIMITS.audio, // 50MB cho audio
});

export const multerVideoConfig = createMulterConfig(VIDEO_TYPES, {
  fileSize: FILE_SIZE_LIMITS.video, // 100MB cho media
});

export const getImgVideoMulterConfig = (files: number) => createMulterConfig([...IMG_TYPES, ...VIDEO_TYPES], { fileSize: FILE_SIZE_LIMITS.mix, files: files });

export const getTraceabilityMulterConfig = (files: number) => createMulterConfig([...IMG_TYPES, ...VIDEO_TYPES, ...DOCS_TYPES], { fileSize: FILE_SIZE_LIMITS.mix, files: files });
