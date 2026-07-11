import { BadRequestException } from '@nestjs/common';
import { existsSync, mkdirSync } from 'fs';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { AUDIO_TYPES, IMG_TYPES, VIDEO_TYPES } from 'src/helpers/const.helper';
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

export const getFileLocation = (mimetype: string, fieldname: string) => {
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
    } else if (fieldname.includes('requestQrcodeFiles')) {
      result = 'images/requestQrcodes';
    } else if (fieldname.includes('adsBanner')) {
      result = 'images/ads';
    } else if (fieldname.includes('teamImage') || fieldname.includes('teamFiles') || fieldname.includes('teamServiceFiles')) {
      result = 'images/teams';
    } else if (fieldname.includes('reviewImg')) {
      result = 'images/reviews';
    } else if (fieldname.includes('qrcode')) {
      result = 'images/qrcodes';
    }
  } else if (mimetype.startsWith('video/')) {
    if (fieldname.includes('doctorFiles')) {
      result = 'videos/doctors';
    } else if (fieldname.includes('saleHomeFiles')) {
      result = 'videos/saleHomes';
    } else if (fieldname.includes('requestQrcodeFiles')) {
      result = 'videos/requestQrcodes';
    } else if (fieldname.includes('teamFiles') || fieldname.includes('teamServiceFiles')) {
      result = 'videos/teams';
    }
  } else if (mimetype.startsWith('audio/')) {
    if (fieldname.includes('editorAudio')) {
      result = 'audios/editors';
    } else if (fieldname.includes('mediaAudio')) {
      result = 'audios/medias';
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

  return {
    storage: diskStorage({
      destination: (req, file, cb) => {
        const location = getFileLocation(file.mimetype, file.fieldname);
        const folderPath = join(process.cwd(), 'public', location);
        ensureDir(folderPath);
        cb(null, folderPath);
      },
      filename: (req, file, cb) => {
        const ext = extname(file.originalname);
        const uniqueName = `${file.fieldname}-${uuidv4()}${ext}`;
        cb(null, uniqueName);
      },
    }),
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
