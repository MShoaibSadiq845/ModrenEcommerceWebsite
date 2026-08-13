import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class UpdateShippingDto {
  @IsNotEmpty() @IsString() fullName: string;
  @IsNotEmpty() @IsString() phone: string;
  @IsNotEmpty() @IsString() street: string;
  @IsNotEmpty() @IsString() city: string;
  @IsOptional() @IsString() state?: string;
  @IsNotEmpty() @IsString() postalCode: string;
  @IsNotEmpty() @IsString() country: string;
}
