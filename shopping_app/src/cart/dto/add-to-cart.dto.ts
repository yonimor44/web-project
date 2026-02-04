import { IsInt, IsPositive } from 'class-validator';
import { Type } from 'class-transformer';

// DTO להוספת פריט לעגלה
export class AddToCartDto {
  @IsInt()
  @IsPositive()
  @Type(() => Number) // ולידציה שזה מספר
  productId: number;

  @IsInt()
  @IsPositive()
  @Type(() => Number)
  quantity: number;
}