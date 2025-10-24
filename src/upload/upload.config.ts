
import { BadRequestException } from '@nestjs/common';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { v4 as uuidv4 } from 'uuid';

export const multerConfig = {
  storage: diskStorage({
    destination: './public/uploads',
    filename: (req, file, callback) => {
      const ext = extname(file.originalname);
      const filename = `${file.fieldname}-${uuidv4()}${ext}`;
      callback(null, filename);
    },
  }),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, callback) => {
    if (
      file.mimetype.startsWith('image/') ||
      file.mimetype.startsWith('video/') ||
      file.mimetype.startsWith('audio/')
    ) {
      callback(null, true);
    } else {
      callback(new BadRequestException('File type not supported'), false);
    }
  },
};