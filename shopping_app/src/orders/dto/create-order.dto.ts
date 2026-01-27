import { IsString, IsNotEmpty, IsArray, IsOptional, IsNumber } from 'class-validator';

export class CreateOrderDto {
  @IsString()
  @IsNotEmpty()
  shippingAddress: string;

  @IsString()
  @IsNotEmpty()
  city: string;

  @IsString()
  @IsNotEmpty()
  phone: string;

  // --- הוספנו את זה כדי שהשרת יקבל את רשימת הפריטים ---
  @IsArray()
  @IsOptional()
  @IsNumber({}, { each: true })
  selectedItemIds?: number[];
}