import { BadRequestException } from '@nestjs/common';
import { existsSync, mkdirSync } from 'fs';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { v4 as uuidv4 } from 'uuid';

export const multerConfig = {
  storage: diskStorage({
    destination: (req, file, callback) => {
      let source = req.body.source;
      if (!source) {
        if (file.fieldname === 'homeImage' || file.fieldname === 'homeImages') {
          source = 'home';
        }
      }

      const folderPath = `./public/uploads/${source}`;

      // create path folder
      if (!existsSync(folderPath)) {
        mkdirSync(folderPath, { recursive: true });
      }

      callback(null, folderPath);
    },
    filename: (req, file, callback) => {
      const filename = file.originalname;
      let source = req.body.source;
      if (!source) {
        if (file.fieldname === 'homeImage' || file.fieldname === 'homeImages') {
          source = 'home';
        }
      }

      const filePath = join(`./public/uploads/${source}`, filename);

      if (existsSync(filePath)) {
        return callback(null, filename); // keep old file
      } else {
        const ext = extname(file.originalname);
        const uniquename = `${file.fieldname}-${uuidv4()}${ext}`;
        callback(null, uniquename); // store new file
        // callback(null, "_"); // store new file

      }
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
