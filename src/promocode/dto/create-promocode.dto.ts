import { IsString, IsOptional, IsNumber, IsBoolean, IsArray, IsDate, IsUUID } from 'class-validator';

export class CreatePromocodeDto {
  @IsString()
  code: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsString()
  discountType: 'percentage' | 'fixed';  // 'percentage' or 'fixed'

  @IsNumber()
  discountValue: number;

  @IsOptional()
  @IsNumber()
  maxDiscountValue?: number;

  @IsOptional()
  @IsNumber()
  minOrderAmount?: number;

  @IsOptional()
  @IsNumber()
  perUserLimit?: number;

  @IsOptional()
  @IsNumber()
  usageLimit?: number;

  @IsOptional()
  @IsNumber()
  usedCount?: number;

  @IsOptional()
  @IsDate()
  startAt?: Date;

  @IsOptional()
  @IsDate()
  expiresAt?: Date;

  @IsBoolean()
  isActive: boolean;

  @IsBoolean()
  isPublic: boolean;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  appliesToProductIds?: string[];

  

  @IsOptional()
  @IsString()
  customerId?: string;
}
