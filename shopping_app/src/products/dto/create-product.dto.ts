import { IsString, IsNotEmpty, IsNumber, Min, IsBoolean, IsOptional, MaxLength } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateProductDto {
  @ApiProperty({ description: 'Product Name' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name: string;

  @ApiPropertyOptional({ description: 'Product Description' })
  @IsString()
  @IsOptional()
  @MaxLength(5000)
  description?: string;

  @ApiProperty({ description: 'Price in USD' })
  @IsNumber()
  @Min(0)
  @Type(() => Number) // קריטי ל-Form Data
  price: number;

  @ApiProperty({ description: 'Stock quantity' })
  @IsNumber()
  @Min(0)
  @Type(() => Number) // קריטי ל-Form Data
  stock: number;

  @ApiPropertyOptional({ description: 'Category name' })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  category?: string;

  @ApiPropertyOptional({ description: 'Brand name' })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  brand?: string;

  @ApiPropertyOptional({ description: 'Car manufacturer' })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  carMake?: string;

  @ApiPropertyOptional({ description: 'Scale (e.g. 1:18)' })
  @IsString()
  @IsOptional()
  @MaxLength(50)
  scale?: string;

  @ApiPropertyOptional({ description: 'Color' })
  @IsString()
  @IsOptional()
  @MaxLength(50)
  color?: string;

  // --- שינוי מס' 1: imageUrl הוא אופציונלי בהתחלה ---
  @ApiProperty({ required: false, description: 'URL or empty if uploading file' })
  @IsString()
  @IsOptional() // חייב להיות אופציונלי כדי לאפשר העלאת קובץ
  @MaxLength(1000)
  imageUrl?: string;

  // --- שינוי מס' 2: הוספת שדה לקובץ ---
  @ApiProperty({ type: 'string', format: 'binary', required: false, description: 'Upload image file' })
  @IsOptional()
  file?: any; 
  // ------------------------------------

  @ApiPropertyOptional({ example: true })
  @IsBoolean()
  @IsOptional()
  // המרה למקרה שזה נשלח כטקסט "true"/"false" ב-FormData
  @Type(() => Boolean) 
  isActive?: boolean;
}