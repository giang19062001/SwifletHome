import { BadRequestException } from '@nestjs/common';
import { existsSync, mkdirSync } from 'fs';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { v4 as uuidv4 } from 'uuid';

const getLocation = (mimetype: string, fieldname: string) => {
  if (mimetype.startsWith('image/')) {
    if (fieldname === 'answerImage') {
      return 'images/answers';
    }
    if (fieldname === 'homeImage' || fieldname === 'homeImages') {
      return 'images/homes';
    }
  } else if (mimetype.startsWith('audio/')) {
    if (fieldname.includes('answerAudio')) {
      return 'audios/answers';
    }
  }
  return 'documents'; // other
};

// Common configuration generator
export const createMulterConfig = (allowedExts: string[]) => ({
  storage: diskStorage({
    destination: (req, file, callback) => {
      const location = getLocation(file.mimetype, file.fieldname);
      const folderPath = `./public/uploads/${location}`;

      if (!existsSync(folderPath)) {
        mkdirSync(folderPath, { recursive: true });
      }

      callback(null, folderPath);
    },
    filename: (req, file, callback) => {
      const filename = file.originalname;
      const location = getLocation(file.mimetype, file.fieldname);
      const filePath = join(`./public/uploads/${location}`, filename);

      if (existsSync(filePath)) {
        return callback(null, filename);
      } else {
        const ext = extname(file.originalname);
        const uniquename = `${file.fieldname}-${uuidv4()}${ext}`;
        callback(null, uniquename);
      }
    },
  }),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, callback) => {
    const fileExt = extname(file.originalname).toLowerCase(); // vd: ".png"
    const isAllowed = allowedExts.includes(fileExt);

    if (isAllowed) {
      callback(null, true);
    } else {
      callback(
        new BadRequestException(`File không được hỗ trợ (${fileExt}). Chỉ cho phép: ${allowedExts.join(', ')}`),
        false
      );
    }
  },
});

export const multerImgConfig = createMulterConfig(['.png', '.jpg', '.jpeg', '.heic']);
export const multerAudioConfig = createMulterConfig(['.mp3']);
