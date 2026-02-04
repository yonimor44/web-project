import { PartialType } from '@nestjs/mapped-types';
import { CreateProductDto } from './create-product.dto';

/**
 * DTO לעדכון מוצר קיים.
 * יורש מ-CreateProductDto אך הופך את כל השדות לאופציונליים.
 * מאפשר לעדכן רק מחיר, רק מלאי, או כל שילוב אחר.
 */
export class UpdateProductDto extends PartialType(CreateProductDto) {}