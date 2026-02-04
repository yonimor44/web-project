import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike, LessThanOrEqual } from 'typeorm'; 
import { CreateProductDto } from './dto/create-product.dto';
import { Product } from './entities/product.entity';
import { UpdateProductDto } from './dto/update-product.dto';

/**
 * @class ProductsService
 * @description
 * שכבת הלוגיקה העסקית (Business Logic Layer) לניהול מוצרים.
 * מחלקה זו אחראית על התקשורת מול בסיס הנתונים (Repository) וביצוע מניפולציות על המידע.
 */
@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private productsRepository: Repository<Product>,
  ) {}

 // יצירת מוצר חדש
  async create(createProductDto: CreateProductDto) {
    const product = this.productsRepository.create(createProductDto); // יצירת ישות חדשה
    return this.productsRepository.save(product); // שמירה בבסיס הנתונים
  }

 // שליפת כל המוצרים עם אפשרויות סינון ומיון
  async findAll(
    search?: string, 
    category?: string, 
    brand?: string, 
    carMake?: string, 
    scale?: string,
    sort?: string,
    maxPrice?: number
  ) {

    // שלב 1: בניית אובייקט תנאים בסיסי (Base Conditions)
    // תנאים אלו הם מסוג "AND" - כלומר המוצר חייב לעמוד בכולם.
    const baseConditions: any = {};

    if (category && category !== 'All') baseConditions.category = category; // סינון לפי קטגוריה
    if (brand && brand !== 'All') baseConditions.brand = brand; // סינון לפי מותג
    if (carMake && carMake !== 'All') baseConditions.carMake = carMake; // סינון לפי יצרן
    if (scale && scale !== 'All') baseConditions.scale = scale; // סינון לפי קנה מידה
    if (maxPrice && maxPrice > 0) baseConditions.price = LessThanOrEqual(maxPrice); // סינון לפי מחיר מקסימלי

    // 2. לוגיקת חיפוש (OR)
    // אם יש חיפוש, בודקים אותו בשם, ביצרן ובמותג במקביל
    let where: any = baseConditions;

    if (search) {
      where = [
        { ...baseConditions, name: ILike(`%${search}%`) },    // שם הדגם
        { ...baseConditions, carMake: ILike(`%${search}%`) }, // יצרן הרכב
        { ...baseConditions, brand: ILike(`%${search}%`) }    // מותג הצעצוע
      ];
    }


    // שלב 3: הגדרת סדר המיון (Sorting)
    const order: any = {};

    if (sort === 'price_asc') {
        order.price = 'ASC';      // מהזול ליקר
    } else if (sort === 'price_desc') {
        order.price = 'DESC';     // מהיקר לזול
    } else if (sort === 'name_asc') {
        order.name = 'ASC';       // אלפביתי א-ת
    } else if (sort === 'name_desc') {
        order.name = 'DESC';      // אלפביתי ת-א
    } else {
        order.id = 'DESC';        // ברירת מחדל: המוצרים החדשים ביותר (ID גבוה) ראשונים
    }

    // ביצוע השאילתה מול בסיס הנתונים
    return this.productsRepository.find({ where, order });
  }

  // שליפת מוצר לפי מזהה  
  async findOne(id: number) {
    return this.productsRepository.findOne({ where: { id } });
  }

  // עדכון מוצר קיים
  async update(id: number, updateProductDto: UpdateProductDto) {
    return this.productsRepository.update(id, updateProductDto);
  }

  // מחיקת מוצר
  async remove(id: number) {
    return this.productsRepository.delete(id);
  }
}