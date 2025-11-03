import { BadRequestException } from '@nestjs/common';
import { existsSync, mkdirSync } from 'fs';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { v4 as uuidv4 } from 'uuid';

const getLocation = (mimetype: string, fieldname: string) => {
  if (mimetype.startsWith('image/')) {
    if(fieldname === "answerImage"){
      return 'images/answers'
    }
    if(fieldname === "homeImage" || fieldname === "homeImages"){
      return 'images/homes'
    }
  } else if (mimetype.startsWith('audio/')) {
     if(fieldname.includes("answerAudio")){
      return 'audios/answers'
    }
  }
  return 'documents'; // orther
};

// Common configuration generator
export const createMulterConfig = (allowedMimeTypes: string[]) => ({
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
    const isAllowed = allowedMimeTypes.some((type) => 
      file.mimetype.startsWith(type)
    );

    if (isAllowed) {
      callback(null, true);
    } else {
      callback(new BadRequestException('File type not supported'), false);
    }
  },
});

// Specific configurations
export const multerImgConfig = createMulterConfig(['image/']);
export const multerAudioConfig = createMulterConfig(['audio/']);