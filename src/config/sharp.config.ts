import * as sharp from 'sharp';

export const SHARP_OPTIONS = {
  resize: {
    width: 1920,
    height: 1920,
    fit: sharp.fit.inside, // Giữ nguyên tỉ lệ, thu nhỏ sao cho nằm gọn trong 1920x1920
    withoutEnlargement: true, // Nếu ảnh nhỏ hơn 1920 thì không phóng to làm vỡ ảnh
  },
  jpeg: {
    quality: 80, // Chất lượng 80%
  },
};
