import { IsString, IsNotEmpty, IsNumber, Min, IsUrl, IsBoolean, IsOptional } from 'class-validator';
import { Type } from 'class-transformer'; // <--- חובה לייבא את זה

export class CreateProductDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional() // עדיף שיהיה אופציונלי
  description?: string;

  @IsNumber()
  @Min(0)
  @Type(() => Number) // <--- קריטי! מונע שגיאות המרה
  price: number;

  @IsNumber()
  @Min(0)
  @Type(() => Number) // <--- קריטי!
  stock: number;

  @IsString()
  @IsOptional() // שינינו לאופציונלי למקרה שזה ריק
  category?: string;

  @IsString()
  @IsOptional()
  brand?: string; // חדש

  @IsString()
  @IsOptional()
  carMake?: string; // חדש

  @IsString()
  @IsOptional()
  scale?: string; // חדש

  @IsString()
  @IsOptional()
  color?: string; // חדש

  @IsString()
  @IsNotEmpty()
  // @IsUrl({}, { message: 'Image must be a valid URL link' }) 
  // הערה: לפעמים IsUrl קשוח מדי עם לינקים ארוכים, אם זה עושה בעיות נשאיר רק IsString
  imageUrl: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}