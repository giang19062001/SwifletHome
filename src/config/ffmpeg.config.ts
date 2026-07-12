export const FFMPEG_OPTIONS = {
  // Bỏ qua các luồng dữ liệu rác/lỗi ngay khi bắt đầu đọc file (rất hữu ích cho file từ iOS)
  inputOptions: ['-ignore_unknown'],

  // Sử dụng bộ giải mã video chuẩn H.264 (tương thích rộng rãi nhất trên web)
  videoCodec: 'libx264',

  // Sử dụng bộ giải mã âm thanh AAC chuẩn cho MP4
  audioCodec: 'aac',

  // Bộ lọc chống lỗi 'Invalid argument' VÀ ép kích thước tối đa 720p để đồng nhất, giảm dung lượng
  videoFilter: "scale='min(1280,iw)':-2",

  outputOptions: [
    // Tốc độ mã hóa 'fast' - cân bằng tốt giữa thời gian convert và dung lượng file
    '-preset',
    'fast',
    // Giảm bitrate thông minh (CRF 28 - mắt thường khó phân biệt, giảm mạnh dung lượng)
    '-crf',
    '28',
    // Giới hạn tốc độ khung hình (FPS) tối đa 30 để tránh các video 60fps làm nặng file
    '-r',
    '30',
    // Cắt giảm luồng âm thanh về chuẩn 128k (đủ nghe rõ)
    '-b:a',
    '128k',
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
