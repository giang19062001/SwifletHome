export const MsgErr = {
  AccountWrong: 'Tài khoản hoặc mật khẩu không hợp lệ',
  AccountBlock: 'Tài khoản đã bị vô hiệu hóa',
  DataEmpty: 'Hiện tại hệ thống chưa cung cấp dữ liệu về câu hỏi/trả lời',
  CannotReply: 'Xin lỗi, tôi chưa có thông tin về câu hỏi này',
  FileEmpty: 'Không có file nào được upload',
  FileAudioRequire: 'Bắt buộc nhập 2 file audio',
  fileWrongType: (ext: string, allowedExts: string[]) => `File không hỗ trợ: ${ext}. Cho phép: ${allowedExts.join(', ')}`,
  FileOvertake: 'Số file upload đã vượt quá số lượng tối đa'
};
