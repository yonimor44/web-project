import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike, LessThanOrEqual } from 'typeorm'; 
import { CreateProductDto } from './dto/create-product.dto';
import { Product } from './entities/product.entity';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private productsRepository: Repository<Product>,
  ) {}

  // --- יצירת מוצר חדש (מקבל את הנתונים מהאדמין פייג') ---
  async create(createProductDto: CreateProductDto) {
    const product = this.productsRepository.create(createProductDto);
    return this.productsRepository.save(product);
  }

  // --- שליפת כל המוצרים עם סינונים וחיפוש ---
  async findAll(
    search?: string, 
    category?: string, 
    brand?: string, 
    carMake?: string, 
    scale?: string,
    sort?: string,
    maxPrice?: number
  ) {
    // 1. תנאים בסיסיים (פילטרים רגילים)
    const baseConditions: any = {};

    if (category && category !== 'All') baseConditions.category = category;
    if (brand && brand !== 'All') baseConditions.brand = brand;
    if (carMake && carMake !== 'All') baseConditions.carMake = carMake;
    if (scale && scale !== 'All') baseConditions.scale = scale;
    if (maxPrice && maxPrice > 0) baseConditions.price = LessThanOrEqual(maxPrice);

    // 2. לוגיקת חיפוש (Search)
    // אם יש חיפוש, אנחנו בודקים אם הוא מופיע בשם, ביצרן או במותג
    let where: any = baseConditions;

    if (search) {
      where = [
        { ...baseConditions, name: ILike(`%${search}%`) },      // חפש בשם הדגם
        { ...baseConditions, carMake: ILike(`%${search}%`) },   // חפש ביצרן הרכב
        { ...baseConditions, brand: ILike(`%${search}%`) }      // חפש במותג הצעצוע
      ];
    }

    // 3. לוגיקת מיון (Sorting)
    const order: any = {};

    if (sort === 'price_asc') {
        order.price = 'ASC';      // מהזול ליקר
    } else if (sort === 'price_desc') {
        order.price = 'DESC';     // מהיקר לזול
    } else if (sort === 'name_asc') {
        order.name = 'ASC';       // לפי שם א-ת
    } else if (sort === 'name_desc') {
        order.name = 'DESC';      // לפי שם ת-א
    } else {
        order.id = 'DESC';        // ברירת מחדל: החדשים ביותר קודם
    }

    return this.productsRepository.find({ where, order });
  }

  // --- שליפת מוצר בודד ---
  async findOne(id: number) {
    return this.productsRepository.findOne({ where: { id } });
  }

  // --- עדכון מוצר ---
  async update(id: number, updateProductDto: UpdateProductDto) {
    return this.productsRepository.update(id, updateProductDto);
  }

  // --- מחיקת מוצר ---
  async remove(id: number) {
    return this.productsRepository.delete(id);
  }
}