import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { existsSync, mkdirSync } from 'fs';
import { v4 as uuidv4 } from 'uuid';
import { BadRequestException, Logger } from '@nestjs/common';
import { AUDIO_TYPES, IMG_TYPES, VIDEO_TYPES } from 'src/helpers/const.helper';
import { Msg } from 'src/helpers/message.helper';

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
  console.log('getFileLocation ---> ', mimetype, fieldname);
  let result = '';
  if (mimetype.startsWith('image/')) {
    // image
    if (fieldname === 'editorImg' || fieldname.includes('editorImg')) {
      result = 'images/editors';
    }
    if (fieldname === 'homeImage' || fieldname.includes('homeImage') || fieldname === 'homeImages' || fieldname.includes('homeImages')) {
      result = 'images/homes';
    }
    if (fieldname === 'userHomeImage' || fieldname.includes('userHomeImage')) {
      result = 'images/userHomes';
    }
    if (fieldname === 'doctorFiles' || fieldname.includes('doctorFiles')) {
      result = 'images/doctors';
    }
    if (fieldname === 'configfiles' || fieldname.includes('configfiles')) {
      result = 'images/configs';
    }

    if (fieldname === 'teamImg' || fieldname.includes('teamImg')) {
      result = 'images/teams';
    }

    if (fieldname === 'reviewImg' || fieldname.includes('reviewImg')) {
      result = 'images/reviews';
    }

    // quan trọng
    if (fieldname === 'qrcode' || fieldname.includes('qrcode')) {
      result = 'images/qrcodes';
    }
  }
  if (mimetype.startsWith('video/')) {
    //video
    if (fieldname === 'doctorFiles' || fieldname.includes('doctorFiles')) {
      result = 'videos/doctors';
    }
    if (fieldname === 'requestQrcodeVideo' || fieldname.includes('requestQrcodeVideo')) {
      result = 'videos/requestQrcodes';
    }
  }
  if (mimetype.startsWith('audio/')) {
    //audio
    if (fieldname === 'editorAudio' || fieldname.includes('editorAudio')) {
      result = 'audios/editors';
    }
  }
  if (mimetype.startsWith('audio/')) {
    if (fieldname === 'mediaAudio' || fieldname.includes('mediaAudio')) {
      result = 'audios/medias';
    }
  }

  return 'uploads/' + result;
};

export const createMulterConfig = (allowedExts: string[], customLimits?: MulterLimits) => {
  const defaultLimits: MulterLimits = {
    fileSize: 50 * 1024 * 1024, // 50MB mặc định
    files: undefined, // không giới hạn nếu không truyền
  };

  const limits = { ...defaultLimits, ...customLimits }; // ghi dè limits nếu có

  return {
    storage: diskStorage({
      destination: (req, file, cb) => {
        const location = getFileLocation(file.mimetype, file.fieldname);
        const folderPath = join(process.cwd(), 'public', location);
        if (!existsSync(folderPath)) {
          mkdirSync(folderPath, { recursive: true });
        }
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
  fileSize: 50 * 1024 * 1024, // 50MB cho ảnh
});

export const multerAudioConfig = createMulterConfig(AUDIO_TYPES, {
  fileSize: 50 * 1024 * 1024, // 50MB cho audio
});

export const multerVideoConfig = createMulterConfig(VIDEO_TYPES, {
  fileSize: 50 * 1024 * 1024, // 50MB cho media
});

export const getImgVideoMulterConfig = (files: number) => createMulterConfig([...IMG_TYPES, ...VIDEO_TYPES], { fileSize: 50 * 1024 * 1024, files: files });
