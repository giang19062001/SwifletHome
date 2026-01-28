export const Msg = {
  UploadOk: 'Tải ảnh lên thành công',
  UploadErr: 'Tải ảnh lên thất bại',
  GetOk: 'Lấy thông tin thành công',
  GetErr: 'Lấy thông tin thất bại',
  RegisterOk: 'Đăng ký thông tin thành công',
  RegisterErr: 'Đăng ký thông tin thất bại',
  CreateOk: 'Thêm thông tin thành công',
  CreateErr: 'Thêm thông tin thất bại',
  UpdateOk: 'Cập nhập thông tin thành công',
  UpdateErr: 'Cập nhập thông tin thất bại',
  DeleteOk: 'Xóa thông tin thành công',
  DeleteErr: 'Xóa thông tin thất bại',
  SetTaskOk: 'Thiết lập lịch nhắc thành công',
  SetTaskErr: 'Thiết lập lịch nhắc thất bại',
  CodeInvalid: 'Mã code không hợp lệ',
  TokenMissing: 'Vui lòng xác thực token',
  TokenInvalid: 'Token không hợp lệ',
  PhoneExist: 'Số điện thoại đã tồn tại',
  PhoneOk: 'Số điện thoại hợp lệ có thể thêm mới',
  PhoneExistForNew: 'Số điện thoại đã tồn tại cho việc đăng ký mới',
  PhoneNotExist: 'Số điện thoại không tồn tại',
  PhoneLoginWrong: 'Số điện thoại hoặc mật khẩu không hợp lệ',
  LoginOk: 'Đăng nhập thành công',
  LoginErr: 'Đăng nhập thất bại',
  RegisterAccountOk: 'Đăng ký tài khoản thành công',
  RegisterAccountErr: 'Đăng ký tài khoản thất bại',
  PasswordChangeOk: 'Đổi mật khẩu thành công',
  PasswordChangeErr: 'Đổi mật khẩu thất bại',
  AccountLoginWrong: 'Tài khoản hoặc mật khẩu không hợp lệ',
  AccountLoginBlock: 'Tài khoản đã bị vô hiệu hóa',
  UserNotFound: 'Người dùng không tồn tại',
  HomeNotFound: 'Thông tin nhà yến không tồn tại',
  HomeIsMainCannotDelete: 'Không thể xóa nhà yến đang được chọn là chính',
  CannotReply: 'Những vấn đề kỹ thuật chuyên sâu cần độ chính xác cao. Vui lòng liên hệ qua Zalo hoặc Số điện thoại : 0966222612',
  UuidNotFound: 'Chưa từng có file nào được upload cùng với uuid này',
  FileEmpty: 'Không có file nào được upload',
  FileAudioRequire: 'Bắt buộc nhập 2 file audio',
  FileOvertake: 'Số file upload đã vượt quá số lượng tối đa',
  FileWrongType: (ext: string, allowedExts: string[]) => `File không hỗ trợ: ${ext}. Cho phép: ${allowedExts.join(', ')}`,
  FileDeleteFail: 'Lỗi khi xóa file',
  FileUploadFail: 'Lỗi khi xóa file',
  OtpNotVerify: 'Vui lòng xác thực OTP',
  OtpSent: 'OTP đã được gửi',
  OtpValid: 'Xác thực OTP thành công',
  OtpInvalid: 'Xác thực OTP thất bại',
  OtpExpire: 'OTP không tồn tại hoặc đã hết hạn',
  OtpOvertake: 'Đã vượt quá số lần nhập OTP cho phép',
  OtpRemainAttempt: (num: number) => `Mã OTP không đúng. Còn ${num} lần thử.`,
  InvalidPackageToAddHome: 'Vui lòng nâng cấp gói để có thể thêm nhà yến mới',
  DuplicateTaskAlram: 'Lịch nhắc này đã tồn tại',
  DuplicateTaskPeriod: 'Chu kỳ lịch nhắc này đã tồn tại',
  AlreadyCompleteCannotDo:"Lịch nhắc này đã hoàn thành không thể thực hiện tác vụ này",
  OnlyMedicineTaskCanDo:`Chỉ có lịch nhắc 'Lăn thuốc' mới có thể thực hiện tác vụ này`,
  OnlyHarvestTaskCanDo:`Chỉ có lịch nhắc 'Thu hoạch' mới có thể thực hiện tác vụ này`,
  HomeOfAlarmNotExist:"Nhà yến của lịch nhắc này không tồn tại",
  FloorOfHomeIsZero:"Số tầng của nhà yến hiện tại là 0 - không thể khởi tạo dữ liệu thu hoạch",
  MedicineTaskAlreadyAdded:`Lịch nhắc 'Lăn thuốc' này đã được ghi chú rồi`,
  MedicineInvalidDateExecute:"Chưa đến ngày lăn thuốc",
  HarvestTaskAlreadyAdded:`Lịch nhắc 'Lăn thuốc' này đã được ghi chú rồi`,
  RequestQrcodeAlreadyExsist: `Yêu cầu Qr code của nhà yến  với đợt thu hoạch này đã có rồi`,
  RequestQrcodeNotFound: `Không tìm thấy thông tin Qrcode của yêu cầu bán hiện tại`,
  RequestInfoAlreadySold: `Thông tin của Qr code này đã được rao bán rồi`,
  CannotNull: (filedName: string) => `${convertFiledName(filedName)} không thể trống`,
  InvalidValue: (filedName: string) => `Gía trị của ${convertFiledName(filedName)} không hợp lệ`,
  InvalidRange: (filedName: string, range: string) => `${convertFiledName(filedName)} phải nằm trong giá trị cho phép giá trị cho phép (${range})`,
  MustBeGreaterThanAndEqualNow: (filedName: string) => `${convertFiledName(filedName)} phải lớn hơn ngày hiện tại`,
};

const convertFiledName = (filedName: string) => {
  let txt = filedName ;
  switch (filedName) {
    case "taskCustomName":
      txt = "Tên lịch nhắc tùy chỉnh"
      break;
    case "taskCode":
      txt = "Mã lịch nhắc"
      break;
    case "periodType":
      txt = "Loại chu kỳ"
      break;
    case "specificValue":
      txt = "Ngày nhắc lịch"
      break;
    case "periodValue":
      txt = "Gía trị tháng hoặc tuần"
      break;
    default:
      txt = filedName;
  }
  return txt;
};
export const MsgAdmin = {
  pushAlarmOk: 'Tạo lịch nhắc và gửi thông báo thành công',
  pushAlarmErr: 'Tạo lịch nhắc thành công nhưng gửi thông báo thất bại',
  pushNotifyOk: 'Gửi thông báo thành công',
  pushNotifyErr: 'Gửi thông báo thất bại',
  pushProvinceEmpty: 'Không có người dùng nào có nhà yến thuộc những tỉnh thành này',
};
