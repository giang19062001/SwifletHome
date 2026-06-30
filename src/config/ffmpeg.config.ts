export const FFMPEG_OPTIONS = {
  // Bỏ qua các luồng dữ liệu rác/lỗi ngay khi bắt đầu đọc file (rất hữu ích cho file từ iOS)
  inputOptions: ['-ignore_unknown'],

  // Sử dụng bộ giải mã video chuẩn H.264 (tương thích rộng rãi nhất trên web)
  videoCodec: 'libx264',

  // Sử dụng bộ giải mã âm thanh AAC chuẩn cho MP4
  audioCodec: 'aac',

  // Bộ lọc chống lỗi 'Invalid argument': Ép kích thước chiều rộng/cao của video làm tròn thành số chẵn
  videoFilter: 'scale=trunc(iw/2)*2:trunc(ih/2)*2',

  outputOptions: [
    // Đẩy tốc độ mã hoá lên mức tối đa (hy sinh chút dung lượng để lấy thời gian xử lý cực nhanh)
    '-preset',
    'ultrafast',
    // Sử dụng tất cả các nhân CPU đang rảnh rỗi để xử lý đa luồng
    '-threads',
    '0',
    // Chỉ lấy duy nhất luồng video số 0 (ngăn lỗi FFmpeg cố mã hóa nhầm ảnh bìa / thumbnail thành video)
    '-map',
    '0:v:0',
    // Chỉ lấy duy nhất luồng audio số 0 (thêm ? để không văng lỗi nếu video bị tắt tiếng)
    '-map',
    '0:a:0?',
    // Vẫn chặn các luồng không xác định ở đầu ra cho chắc chắn
    '-ignore_unknown',
    // Tắt hoàn toàn luồng phụ đề (để tránh lỗi)
    '-sn',
    // Tắt hoàn toàn luồng dữ liệu metadata (để tránh lỗi codec none)
    '-dn',
  ],
};
