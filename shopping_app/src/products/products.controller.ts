import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query, UseInterceptors, UploadedFile, BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { AuthGuard } from '@nestjs/passport';
import { Roles } from 'src/auth/roles.decorator';
import { RolesGuard } from 'src/auth/roles.guard';
import { CloudinaryService } from '../common/services/cloudinary.service';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery, ApiConsumes } from '@nestjs/swagger';

// בקר לניהול מוצרים 
// כולל יצירה, עדכון, מחיקה ושליפת מוצרים
@ApiTags('Products')
@Controller('products')
export class ProductsController {
  constructor(
    private readonly productsService: ProductsService,
    private readonly cloudinaryService: CloudinaryService
  ) {}

  // יצירת מוצר חדש עם תמונה
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create new product (Admin only) - supports Image Upload' })
  @ApiResponse({ status: 201, description: 'Product created successfully.' })
  @ApiResponse({ status: 403, description: 'Forbidden - User is not an admin.' })
  @ApiConsumes('multipart/form-data') // הגדרת Swagger לצריכת קבצים
  @Post()
  @Roles('admin') // רק אדמין יכול לגשת
  @UseGuards(AuthGuard('jwt'), RolesGuard) // הפעלת מנגנון האבטחה
  @UseInterceptors(FileInterceptor('file')) // "תופס" את הקובץ מהבקשה ומעבד אותו
  async create(
    @Body() createProductDto: CreateProductDto,
    @UploadedFile() file: Express.Multer.File 
  ) {
    // שלב 1: אם התקבל קובץ, מעלים אותו לענן (Cloudinary)
    if (file) {
        const imageUrl = await this.cloudinaryService.uploadImage(file);
        // עדכון ה-DTO עם הלינק שקיבלנו מהענן
        createProductDto.imageUrl = imageUrl;
    } 
    
    // שלב 2: בדיקת תקינות - חייבת להיות תמונה (או שהועלתה כרגע, או שנשלח לינק)
    if (!createProductDto.imageUrl) {
        throw new BadRequestException('Image is required. Please upload a file or provide an imageUrl.');
    }

    // שלב 3: שמירת המוצר ב-DB דרך הסרוויס
    return this.productsService.create(createProductDto);
  }

  // שליפת כל המוצרים עם אפשרויות סינון ומיון
  @ApiOperation({ summary: 'Get all products with optional filters' })
  @ApiQuery({ name: 'search', required: false, description: 'Search by name, brand or make' })
  @ApiQuery({ name: 'category', required: false })
  @ApiQuery({ name: 'brand', required: false })
  @ApiQuery({ name: 'carMake', required: false })
  @ApiQuery({ name: 'scale', required: false })
  @ApiQuery({ name: 'sort', required: false, description: 'Options: price_asc, price_desc, name_asc, name_desc' })
  @ApiQuery({ name: 'maxPrice', required: false })
  @Get()
  findAll(
    @Query('search') search?: string,
    @Query('category') category?: string,
    @Query('brand') brand?: string,     
    @Query('carMake') carMake?: string, 
    @Query('scale') scale?: string,     
    @Query('sort') sort?: string, 
    @Query('maxPrice') maxPrice?: number   
  ) {
    // המרת maxPrice למספר (אם נשלח), והעברת כל הפרמטרים ל-Service
    return this.productsService.findAll(
      search, 
      category, 
      brand, 
      carMake, 
      scale, 
      sort, 
      maxPrice ? +maxPrice : undefined
    );
  }

  // שליפת מוצר לפי מזהה
  @ApiOperation({ summary: 'Get single product by ID' })
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.productsService.findOne(+id);
  }

  // עדכון מוצר קיים עם אפשרות להעלות תמונה חדשה
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update product (Admin only)' })
  @ApiConsumes('multipart/form-data')
  @Patch(':id')
  @Roles('admin')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @UseInterceptors(FileInterceptor('file'))
  async update(
      @Param('id') id: string, 
      @Body() updateProductDto: UpdateProductDto,
      @UploadedFile() file: Express.Multer.File 
    ) {
    
    // אם המשתמש בחר להעלות תמונה חדשה בזמן העריכה
    if (file) {
        const imageUrl = await this.cloudinaryService.uploadImage(file);
        updateProductDto.imageUrl = imageUrl;
    }

    // אם לא הועלה קובץ, נשתמש בנתונים הקיימים ב-DTO (או שהתמונה לא השתנתה)
    return this.productsService.update(+id, updateProductDto);
  }

  // מחיקת מוצר
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete product (Admin only)' })
  @Delete(':id')
  @Roles('admin')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  remove(@Param('id') id: string) {
    return this.productsService.remove(+id);
  }
}