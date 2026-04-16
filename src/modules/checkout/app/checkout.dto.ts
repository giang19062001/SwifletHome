import { IsArray, IsBoolean, IsNumber, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class CheckoutPayEventDto {
  @IsString()
  @IsOptional()
  app_id: string; 

  @IsString()
  @IsOptional()
  app_user_id: string; 

  @IsString()
  @IsOptional()
  country_code: string; 

  @IsString()
  @IsOptional()
  currency: string; 

  @IsNumber()
  @IsOptional()
  discount_amount: number; 

  @IsString()
  @IsOptional()
  discount_identifier: string; 

  @IsNumber()
  @IsOptional()
  discount_percentage: number; 

  @IsArray()
  @IsOptional()
  entitlement_ids: string[]; 

  @IsString()
  @IsOptional()
  environment: string; 

  @IsNumber()
  @IsOptional()
  event_timestamp_ms: number; 

  @IsNumber()
  @IsOptional()
  expiration_at_ms: number; 

  @IsBoolean()
  @IsOptional()
  is_family_share: boolean; 

  @IsBoolean()
  @IsOptional()
  is_trial_conversion: boolean; 

  @IsString()
  @IsOptional()
  offer_code: string; 

  @IsString()
  @IsOptional()
  period_type: string; 

  @IsString()
  @IsOptional()
  presented_offering_context: string; 

  @IsString()
  @IsOptional()
  presented_offering_id: string; 

  @IsNumber()
  @IsOptional()
  price: number; 

  @IsNumber()
  @IsOptional()
  price_in_purchased_currency: number; 

  @IsString()
  @IsOptional()
  product_display_name: string; 

  @IsString()
  @IsOptional()
  product_id: string; 

  @IsNumber()
  @IsOptional()
  purchased_at_ms: number; 

  @IsNumber()
  @IsOptional()
  renewal_number: number; 

  @IsString()
  @IsOptional()
  store: string; 

  @IsNumber()
  @IsOptional()
  takehome_percentage: number; 

  @IsString()
  @IsOptional()
  transaction_id: string; 
}

export class CheckoutPayDto {
  @IsString()
  @IsOptional()
  api_version: string;

  @ValidateNested()
  @Type(() => CheckoutPayEventDto)
  @IsOptional()
  event: CheckoutPayEventDto;
}