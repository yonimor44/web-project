import { IsInt, IsPositive } from 'class-validator';
import { Type } from 'class-transformer';

export class AddToCartDto {
  @IsInt()
  @IsPositive()
  @Type(() => Number) // <--- הוספנו את זה ליתר ביטחון
  productId: number;

  @IsInt()
  @IsPositive()
  @Type(() => Number) // <--- וגם כאן
  quantity: number;
}