// ─── Factory functions chung ───────────────────────────────────────────────────
const ok = (action: string) => `${action} thành công`;
const err = (action: string) => `${action} thất bại`;
const notFound = (subject: string) => `${subject} không tồn tại`;
const alreadyExist = (subject: string) => `${subject} đã tồn tại`;
const alreadyDone = (subject: string) => `${subject} đã được thực hiện rồi`;
const cannotDo = (reason: string) => `Không thể thực hiện: ${reason}`;
const onlyCan = (who: string, action: string) => `Chỉ có ${who} mới có thể ${action}`;
const invalid = (subject: string) => `${subject} không hợp lệ`;

// ─── Msg ───────────────────────────────────────────────────────────────────────
export const Msg = {
  // Upload
  UploadOk: ok('Tải file lên'),
  UploadErr: err('Tải file lên'),

  // CRUD chung
  GetOk: ok('Lấy thông tin'),
  GetErr: err('Lấy thông tin'),
  RegisterOk: ok('Đăng ký thông tin'),
  RegisterErr: err('Đăng ký thông tin'),
  CreateOk: ok('Thêm thông tin'),
  CreateErr: err('Thêm thông tin'),
  UpdateOk: ok('Cập nhập thông tin'),
  UpdateErr: err('Cập nhập thông tin'),
  DeleteOk: ok('Xóa thông tin'),
  DeleteErr: err('Xóa thông tin'),
  SetTaskOk: ok('Thiết lập lịch nhắc'),
  SetTaskErr: err('Thiết lập lịch nhắc'),

  // Token / Code
  CodeInvalid: invalid('Mã code'),
  TokenMissing: 'Vui lòng xác thực token',
  TokenInvalid: invalid('Token'),

  // Số điện thoại
  PhoneExist: alreadyExist('Số điện thoại'),
  PhoneExistCountry: (countryCode: string) => alreadyExist(`Số điện thoại với mã vùng ${countryCode}`),
  PhoneOk: 'Số điện thoại hợp lệ có thể thêm mới',
  PhoneExistForNew: 'Số điện thoại đã tồn tại cho việc đăng ký mới',
  PhoneNotExist: notFound('Số điện thoại'),
  PhoneLoginWrong: invalid('Số điện thoại hoặc mật khẩu'),

  // Đăng nhập / Tài khoản
  LoginOk: ok('Đăng nhập'),
  LoginErr: err('Đăng nhập'),
  RegisterAccountOk: ok('Đăng ký tài khoản'),
  RegisterAccountErr: err('Đăng ký tài khoản'),
  InvalidUserType: invalid('Loại tài khoản người dùng'),
  InvalidPhoneCode: invalid('Mã vùng điện thoại người dùng'),
  PasswordChangeOk: ok('Đổi mật khẩu'),
  PasswordChangeErr: err('Đổi mật khẩu'),
  AccountLoginWrong: invalid('Tài khoản hoặc mật khẩu'),
  AccountLoginBlock: 'Tài khoản đã bị vô hiệu hóa',

  // Người dùng / Nhà yến
  UserNotFound: notFound('Người dùng'),
  HomeNotFound: notFound('Thông tin nhà yến'),
  HomeIsMainCannotDelete: cannotDo('nhà yến đang được chọn là chính'),

  // Hỗ trợ
  CannotReply:
    'Những vấn đề kỹ thuật chuyên sâu cần độ chính xác cao. Vui lòng liên hệ qua Zalo hoặc Số điện thoại : 0966222612',

  // File
  // UuidNotFound: 'Chưa từng có file nào được upload cùng với uuid này',
  UuidNotFound: 'Vui lòng tải ảnh hoặc video đính kèm',
  FileEmpty: 'Không có file nào được upload',
  FileAudioRequire: 'Bắt buộc nhập 2 file audio',
  FileOvertake: 'Số file upload đã vượt quá số lượng tối đa',
  FileWrongType: (ext: string, allowedExts: string[]) =>
    `File không hỗ trợ: ${ext}. Cho phép: ${allowedExts.join(', ')}`,
  FileDeleteFail: 'Lỗi khi xóa file',
  FileUploadFail: err('Tải file lên'),

  // OTP
  OtpNotVerify: 'Vui lòng xác thực OTP',
  OtpSent: 'OTP đã được gửi',
  OtpValid: ok('Xác thực OTP'),
  OtpInvalid: err('Xác thực OTP'),
  OtpExpire: 'OTP không tồn tại hoặc đã hết hạn',
  OtpOvertake: 'Đã vượt quá số lần nhập OTP cho phép',
  OtpRemainAttempt: (num: number) => `Mã OTP không đúng. Còn ${num} lần thử.`,

  // Gói / Lịch nhắc
  InvalidPackageToAddHome: 'Vui lòng nâng cấp gói để có thể thêm nhà yến mới',
  DuplicateTaskAlram: alreadyExist('Lịch nhắc này'),
  DuplicateTaskPeriod: alreadyExist('Chu kỳ lịch nhắc này'),
  AlreadyCompleteCannotDo: cannotDo('lịch nhắc này đã hoàn thành'),
  OnlyMedicineTaskCanDo: onlyCan(`lịch nhắc 'Lăn thuốc'`, 'thực hiện tác vụ này'),
  OnlyHarvestTaskCanDo: onlyCan(`lịch nhắc 'Thu hoạch'`, 'thực hiện tác vụ này'),
  HomeOfAlarmNotExist: notFound('Nhà yến của lịch nhắc này'),
  FloorOfHomeIsZero:
    'Số tầng của nhà yến hiện tại là 0 - không thể khởi tạo dữ liệu thu hoạch',

  // Lăn thuốc
  MedicineTaskAlreadyAdded: `Lịch nhắc 'Lăn thuốc' này đã được ghi chú rồi`,
  MedicineInvalidDateExecute: 'Chưa đến ngày lăn thuốc',

  // Thu hoạch
  HarvestTaskAlreadyAdded: `Lịch nhắc 'Thu hoạch' này đã được ghi chú rồi`,
  ThisHarvestRequestQrcodeAlreadyCannotAdjust: cannotDo(
    'đợt thu hoạch của nhà yến này đã yêu cầu QrCode rồi',
  ),
  ThisHarvestRequestQrcodeAlready: alreadyDone('Đợt thu hoạch của nhà yến này đã yêu cầu QrCode'),
  ThisQrNotApproved: 'Qr không tồn tại hoặc chưa được duyệt',
  RequestQrcodeNotFound: notFound('Thông tin Qrcode của yêu cầu bán hiện tại'),
  RequestInfoAlreadySold: alreadyDone('Thông tin của Qr code này đã được rao bán'),
  RequestNotAllowHarvestEmpty:
    'Nhà yến chưa có dữ liệu của đợt thu hoạch này, không thể yêu cầu mã Qrcode',
  RequestCannotCancelNotWaiting: cannotDo('chỉ có thể hủy các yêu cầu đang ở chế độ chờ'),

  // QR
  createQrRequestOk: ok('Gửi yêu cầu tạo mã QR Code'),
  createQrRequestErr: err('Gửi yêu cầu tạo mã QR Code'),

  // Phân quyền / Mua bán yến
  OnlyPurcharseCanFetch: onlyCan('tài khoản người mua', 'lấy danh sách yến được bán'),
  OnlyOwnerCanFetch: onlyCan('tài khoản chủ nhà yến', 'lấy danh sách yến được bán'),

  // Đội gia công
  TeamNotFound: notFound('Đội gia công - kỹ thuật'),
  YouAlreadyReview: alreadyDone('Đội gia công - kỹ thuật này đã được bạn đánh giá'),

  // Captcha
  CapchaInvalid: err('Xác thực reCAPTCHA'),
  
  // Checkout
  CheckoutTransactionExist: alreadyDone('Giao dịch thanh toán này'),
  CheckoutPackageNotFound: notFound('Gói cước mặc định'),
};

// ─── Helpers dùng nội bộ ───────────────────────────────────────────────────────
const convertFiledName = (filedName: string): string => {
  const map: Record<string, string> = {
    taskCustomName: 'Tên lịch nhắc tùy chỉnh',
    taskCode: 'Mã lịch nhắc',
    periodType: 'Loại chu kỳ',
    specificValue: 'Ngày nhắc lịch',
    periodValue: 'Giá trị tháng hoặc tuần',
    medicineOptionCode: 'Tên thuốc',
    medicineOther: 'Tên thuốc',
    medicineUsage: 'Dung lượng thuốc',
    senderName: 'Tên người gửi',
    senderPhone: 'SĐT người gửi',
    deliveryAddress: 'Địa chỉ cần giao thuốc',
    nestType: 'Loại yến',
    receiverName: 'Tên người nhận',
    receiverPhone: 'SĐT người nhận',
    review:'Nội dung đánh giá',
    app_user_id: 'ID người dùng',
  };
  return map[filedName] ?? filedName;
};

// ─── MsgAdmin ─────────────────────────────────────────────────────────────────
export const MsgAdmin = {
  pushAlarmOk: 'Tạo lịch nhắc và gửi thông báo thành công',
  pushAlarmErr: 'Tạo lịch nhắc thành công nhưng gửi thông báo thất bại',
  pushNotifyOk: ok('Gửi thông báo'),
  pushNotifyErr: err('Gửi thông báo'),
  pushProvinceEmpty: 'Không có người dùng nào có nhà yến thuộc những tỉnh thành này',
  userAlreadyCreateThisTeam: alreadyDone('Người dùng hiện tại đã đăng ký đội công xưởng này'),
};

// ─── MsgDto ───────────────────────────────────────────────────────────────────
export const MsgDto = {
  InvalidPhone: invalid('Số điện thoại'),
  CannotNull: (filedName: string) => `${convertFiledName(filedName)} không thể trống`,
  MustBeGreaterZero: (filedName: string) => `${convertFiledName(filedName)} phải lớn hơn 0`,
  InvalidValue: (filedName: string) => `Giá trị của ${convertFiledName(filedName)} không hợp lệ`,
  InvalidRange: (filedName: string, range: string) =>
    `${convertFiledName(filedName)} phải nằm trong giá trị cho phép (${range})`,
  MustBeGreaterThanAndEqualNow: (filedName: string) =>
    `${convertFiledName(filedName)} phải lớn hơn ngày hiện tại`,
};
