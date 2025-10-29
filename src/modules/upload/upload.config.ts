import { BadRequestException } from '@nestjs/common';
import { existsSync, mkdirSync } from 'fs';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { v4 as uuidv4 } from 'uuid';

export const multerConfig = {
  storage: diskStorage({
    destination: (req, file, callback) => {
      console.log("req.body.source", req.body.source)
      const source = req.body.source;
      const folderPath = `./public/uploads/${source}`;

      // create path folder
      if (!existsSync(folderPath)) {
        mkdirSync(folderPath, { recursive: true });
      }

      callback(null, folderPath);
    },
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
