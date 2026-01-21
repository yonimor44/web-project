import { IsString, IsNotEmpty, IsNumber, Min, IsUrl, IsBoolean, IsOptional } from 'class-validator';

export class CreateProductDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsNumber()
  @Min(0) // מחיר לא יכול להיות שלילי
  price: number;

  @IsNumber()
  @Min(0) // מלאי לא יכול להיות שלילי
  stock: number;

  @IsString()
  @IsNotEmpty()
  category: string;

  @IsUrl({}, { message: 'Image must be a valid URL link' }) // ולידציה שזה באמת לינק
  imageUrl: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}