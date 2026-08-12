import { IsString, IsNumber, IsBoolean, IsOptional, Min, Max } from 'class-validator';

export class CreateCouponDto {
  @IsString()
  code: string;

  @IsNumber()
  @Min(1)
  @Max(100)
  discountPercentage: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
