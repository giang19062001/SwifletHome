import { IsArray, IsBoolean, IsNumber, IsOptional, IsString } from 'class-validator';

export class CheckoutPayDto {
  @IsString()
  @IsOptional()
  app_id: string; 
  // ID ứng dụng trên RevenueCat

  @IsString()
  @IsOptional()
  app_user_id: string; 
  // ID user trong hệ thống của bạn (quan trọng nhất để map user)

  @IsString()
  @IsOptional()
  country_code: string; 
  // Mã quốc gia của user (VD: VN, US)

  @IsString()
  @IsOptional()
  currency: string; 
  // Đơn vị tiền tệ (VD: VND, USD)

  @IsNumber()
  @IsOptional()
  discount_amount: number; 
  // Số tiền giảm giá (nếu có)

  @IsString()
  @IsOptional()
  discount_identifier: string; 
  // ID của mã giảm giá

  @IsNumber()
  @IsOptional()
  discount_percentage: number; 
  // % giảm giá

  @IsArray()
  @IsOptional()
  entitlement_ids: string[]; 
  // Danh sách quyền (entitlement) user nhận được (VD: yenhome_pro)

  @IsString()
  @IsOptional()
  environment: string; 
  // Môi trường: SANDBOX (test) | PRODUCTION (thật)

  @IsNumber()
  @IsOptional()
  event_timestamp_ms: number; 
  // Thời điểm event xảy ra (millisecond)

  @IsNumber()
  @IsOptional()
  expiration_at_ms: number; 
  // Thời điểm hết hạn gói (quan trọng - nên dùng để set expire)

  @IsBoolean()
  @IsOptional()
  is_family_share: boolean; 
  // Có phải subscription share qua Family Sharing không

  @IsBoolean()
  @IsOptional()
  is_trial_conversion: boolean; 
  // Có phải chuyển từ trial sang trả phí không

  @IsString()
  @IsOptional()
  offer_code: string; 
  // Mã offer (Apple offer code)

  @IsString()
  @IsOptional()
  period_type: string; 
  // Loại giai đoạn:
  // NORMAL (mua bình thường)
  // TRIAL (dùng thử)
  // INTRO (giá ưu đãi ban đầu)

  @IsString()
  @IsOptional()
  presented_offering_context: string; 
  // Context của offering (hiếm khi dùng)

  @IsString()
  @IsOptional()
  presented_offering_id: string; 
  // ID của offering đã hiển thị cho user

  @IsNumber()
  @IsOptional()
  price: number; 
  // Giá quy đổi sang USD

  @IsNumber()
  @IsOptional()
  price_in_purchased_currency: number; 
  // Giá user thực trả (VD: 1,999,000 VND)

  @IsString()
  @IsOptional()
  product_display_name: string; 
  // Tên hiển thị của sản phẩm

  @IsString()
  @IsOptional()
  product_id: string; 
  // ID sản phẩm (VD: yenhome_yearly_pro)

  @IsNumber()
  @IsOptional()
  purchased_at_ms: number; 
  // Thời điểm user mua gói

  @IsNumber()
  @IsOptional()
  renewal_number: number; 
  // Số lần gia hạn (1 = mới mua, 2+ = đã renew)

  @IsString()
  @IsOptional()
  store: string; 
  // Nền tảng mua:
  // APP_STORE | PLAY_STORE | STRIPE...

  @IsNumber()
  @IsOptional()
  takehome_percentage: number; 
  // % doanh thu bạn nhận (sau khi trừ Apple/Google, ví dụ 0.7 = 70%)

  @IsString()
  @IsOptional()
  transaction_id: string; 
  // ID giao dịch (unique, dùng để tránh xử lý trùng webhook)
}