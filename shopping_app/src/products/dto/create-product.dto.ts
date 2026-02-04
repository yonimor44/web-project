import { IsString, IsNotEmpty, IsNumber, Min, IsBoolean, IsOptional, MaxLength } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

// DTO ליצירת מוצר חדש
// הערה חשובה: בגלל שאנחנו שולחים FormData (בשביל תמונה), כל המספרים מגיעים כ-Strings.
// לכן השימוש ב-@Type(() => Number) הוא קריטי כאן.
export class CreateProductDto {
  @ApiProperty({ 
    description: 'The full name of the model car',
    example: 'Lamborghini Aventador SVJ'
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name: string;

  @ApiPropertyOptional({ 
    description: 'Detailed description regarding the model details and condition',
    example: 'A high-quality 1:18 die-cast model with opening doors...'
  })
  @IsString()
  @IsOptional()
  @MaxLength(5000)
  description?: string;

  @ApiProperty({ 
    description: 'Price in NIS/USD',
    example: 299.90 
  })
  @IsNumber()
  @Min(0)
  // המרה קריטית: הופך את "299.90" (String) ל-299.90 (Number)
  @Type(() => Number) 
  price: number;

  @ApiProperty({ 
    description: 'Quantity in stock',
    example: 50
  })
  @IsNumber()
  @Min(0)
  // המרה קריטית: הופך את "50" (String) ל-50 (Number)
  @Type(() => Number)
  stock: number;

  @ApiPropertyOptional({ 
    description: 'General category',
    example: 'Sports Cars' 
  })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  category?: string;

  @ApiPropertyOptional({ 
    description: 'Toy Manufacturer Brand',
    example: 'Burago' 
  })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  brand?: string;

  @ApiPropertyOptional({ 
    description: 'Real Car Manufacturer',
    example: 'Lamborghini' 
  })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  carMake?: string;

  @ApiPropertyOptional({ 
    description: 'Model Scale',
    example: '1:18' 
  })
  @IsString()
  @IsOptional()
  @MaxLength(50)
  scale?: string;

  @ApiPropertyOptional({ 
    description: 'Dominant Color',
    example: 'Yellow' 
  })
  @IsString()
  @IsOptional()
  @MaxLength(50)
  color?: string;

// שדה אופציונלי לקבלת URL לתמונה במקום העלאת קובץ
  @ApiProperty({ 
    required: false, 
    description: 'Direct Image URL (if not uploading a file)' 
  })
  @IsString()
  @IsOptional()
  @MaxLength(1000)
  imageUrl?: string;

 // שדה וירטואלי לקבלת הקובץ מה-Swagger/Postman
  @ApiProperty({ 
    type: 'string', 
    format: 'binary', 
    required: false, 
    description: 'Upload image file (binary)' 
  })
  @IsOptional()
  file?: any; 

  @ApiPropertyOptional({ 
    description: 'Is the product available for purchase?',
    example: true 
  })
  @IsBoolean()
  @IsOptional()
  // ממיר את המחרוזת "true" לבוליאני אמיתי true
  @Type(() => Boolean) 
  isActive?: boolean;
}