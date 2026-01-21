import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateProductDto } from './dto/create-product.dto';
import { Product } from './entities/product.entity';
import { UpdateProductDto } from './dto/update-product.dto'; // וודא שיש לך את הייבוא הזה

@Injectable()
export class ProductsService implements OnModuleInit {
  constructor(
    @InjectRepository(Product)
    private productsRepository: Repository<Product>,
  ) {}

  async onModuleInit() {
    console.log('--- 🔄 בודק עדכונים לקולקציית הרכבים... ---');

    // רשימת הרכבים שאנחנו רוצים בחנות
    // שמנו כאן תמונות חדשות ומדויקות
    const carsToSeed = [
      {
        name: 'F40 Competizione',
        description: 'האגדה משנות ה-80. דגם 1:18 בצבע אדום קלאסי עם הכנף המפורסמת.',
        price: 159.90,
        stock: 5,
        category: 'Classic',
        // תמונה חדשה ומדויקת של F40
        imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/cb/F40_Ferrari_20090509.jpg/800px-F40_Ferrari_20090509.jpg',
        brand: 'Burago',
        carMake: 'Ferrari',
        scale: '1:18',
        color: 'Red',
        isActive: true
      },
      {
        name: 'Mustang GT 1967',
        description: 'מוסטנג שחורה קלאסית, דגם אספנות נדיר מסדרת Eleanor.',
        price: 129.90,
        stock: 10,
        category: 'Muscle',
        // תמונה של מוסטנג (נשארה כי היא הייתה טובה)
        imageUrl: 'https://images.unsplash.com/photo-1584345604476-8ec5e12e42dd?auto=format&fit=crop&w=800&q=80',
        brand: 'Maisto',
        carMake: 'Ford',
        scale: '1:24',
        color: 'Black',
        isActive: true
      },
      {
        name: 'Huracán Evo',
        description: 'למבורגיני ירוקה, עיצוב ספורטיבי מודרני עם דגש על אווירודינמיקה.',
        price: 220.00,
        stock: 3,
        category: 'Sports',
        // תמונה חדשה של הורקאן ירוקה
        imageUrl: 'https://hips.hearstapps.com/hmg-prod/images/2020-lamborghini-huracan-evo-spyder-drive-111-1564544744.jpg?crop=0.614xw:1.00xh;0.187xw,0&resize=1200:*',
        brand: 'AutoArt',
        carMake: 'Lamborghini',
        scale: '1:18',
        color: 'Green',
        isActive: true
      }
    ];

    // הלוגיקה החדשה: עוברים רכב רכב ומעדכנים
    for (const car of carsToSeed) {
      const existingProduct = await this.productsRepository.findOne({ 
        where: { name: car.name } 
      });

      if (existingProduct) {
        // אם הרכב קיים - נעדכן אותו עם המידע החדש (תמונות, מחיר וכו')
        await this.productsRepository.update(existingProduct.id, car);
        console.log(`✅ עודכן: ${car.name}`);
      } else {
        // אם לא קיים - ניצור חדש
        await this.productsRepository.save(car);
        console.log(`✨ נוצר חדש: ${car.name}`);
      }
    }
    
    console.log('--- ✅ סינכרון החנות הסתיים בהצלחה! ---');
  }

  // --- הפונקציות הרגילות ---

  async create(createProductDto: CreateProductDto) {
    const product = this.productsRepository.create(createProductDto);
    return this.productsRepository.save(product);
  }

  async findAll() {
    return this.productsRepository.find();
  }
  
  // הוספתי לך גם את אלו שיהיה מסודר
  async findOne(id: number) {
    return this.productsRepository.findOne({ where: { id } });
  }

  async update(id: number, updateProductDto: UpdateProductDto) {
    return this.productsRepository.update(id, updateProductDto);
  }

  async remove(id: number) {
    return this.productsRepository.delete(id);
  }
}