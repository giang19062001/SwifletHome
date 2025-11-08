import { diskStorage } from 'multer';
import { extname } from 'path';
import { existsSync, mkdirSync } from 'fs';
import { v4 as uuidv4 } from 'uuid';
import { BadRequestException, Logger } from '@nestjs/common';
import { AUDIO_TYPES, IMG_TYPES, VIDEO_TYPES } from 'src/helpers/const';
import { MsgErr } from 'src/helpers/message';

interface MulterLimits {
  fileSize?: number;
  files?: number;
  fields?: number;
  parts?: number;
  fieldNameSize?: number;
  fieldSize?: number;
  headerPairs?: number;
}

export const getFileLocation = (mimetype: string, fieldname: string) => {
  if (mimetype.startsWith('image/')) {
    if (fieldname === 'editorImg') return 'images/editor';
    if (fieldname === 'homeImage' || fieldname === 'homeImages') return 'images/homes';
    if (fieldname === 'doctorFiles') return 'images/doctors';
    return 'images/others';
  }
  if (mimetype.startsWith('video/')) {
    if (fieldname === 'doctorFiles') return 'videos/doctors';
    return 'videos/others';
  }
  if (mimetype.startsWith('audio/')) {
    if (fieldname.includes('editorAudio')) return 'audios/editor';
    return 'audios/others';
  }
  return 'others';
};

export const createMulterConfig = (allowedExts: string[], customLimits?: MulterLimits) => {
  const defaultLimits: MulterLimits = {
    fileSize: 10 * 1024 * 1024, // 10MB mặc định
    files: undefined, // không giới hạn nếu không truyền
  };

  const limits = { ...defaultLimits, ...customLimits }; // ghi dè limits nếu có

  return {
    storage: diskStorage({
      destination: (req, file, cb) => {
        const location = getFileLocation(file.mimetype, file.fieldname);
        const folderPath = `./public/uploads/${location}`;
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
    fileFilter: (req, file, cb) => {
      const ext = extname(file.originalname).toLowerCase();
      if (allowedExts.includes(ext)) {
        cb(null, true);
      } else {
        cb(new BadRequestException(MsgErr.fileWrongType(ext, allowedExts)), false);
      }
    },
  };
};

export const multerImgConfig = createMulterConfig(IMG_TYPES, {
  fileSize: 5 * 1024 * 1024, // 5MB cho ảnh
});

export const multerAudioConfig = createMulterConfig(AUDIO_TYPES, {
  fileSize: 15 * 1024 * 1024, // 15MB cho audio
});

export const multerVideoConfig = createMulterConfig(VIDEO_TYPES, {
  fileSize: 50 * 1024 * 1024, // 50MB cho media
});

export const getDoctorMulterConfig = () => createMulterConfig([...IMG_TYPES, ...VIDEO_TYPES], { fileSize: 50 * 1024 * 1024, files: 5 });
