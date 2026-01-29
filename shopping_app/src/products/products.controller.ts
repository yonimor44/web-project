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

@ApiTags('Products')
@Controller('products')
export class ProductsController {
  constructor(
    private readonly productsService: ProductsService,
    private readonly cloudinaryService: CloudinaryService
  ) {}

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create new product (Admin only) - supports Image Upload' })
  @ApiResponse({ status: 201, description: 'The product has been successfully created.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiConsumes('multipart/form-data') 
  @Post()
  @Roles('admin')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @UseInterceptors(FileInterceptor('file'))
  async create(
    @Body() createProductDto: CreateProductDto,
    @UploadedFile() file: Express.Multer.File 
  ) {
    if (file) {
        const imageUrl = await this.cloudinaryService.uploadImage(file);
        createProductDto.imageUrl = imageUrl;
    } 
    
    if (!createProductDto.imageUrl) {
        throw new BadRequestException('Image is required (upload a file or provide imageUrl)');
    }

    return this.productsService.create(createProductDto);
  }

  @ApiOperation({ summary: 'Get all products with optional filters' })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'category', required: false })
  @ApiQuery({ name: 'brand', required: false })
  @ApiQuery({ name: 'carMake', required: false })
  @ApiQuery({ name: 'scale', required: false })
  @ApiQuery({ name: 'sort', required: false, description: 'price_asc / price_desc' })
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
   return this.productsService.findAll(search, category, brand, carMake, scale, sort, maxPrice ? +maxPrice : undefined);
  }

  @ApiOperation({ summary: 'Get product by ID' })
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.productsService.findOne(+id);
  }

  // --- השינוי הגדול: הוספת תמיכה בתמונות גם לעדכון ---
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update product (Admin only)' })
  @ApiConsumes('multipart/form-data') // 1. מודיעים לסוואגר שיש פה קובץ
  @Patch(':id')
  @Roles('admin')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @UseInterceptors(FileInterceptor('file')) // 2. תופסים את הקובץ
  async update(
      @Param('id') id: string, 
      @Body() updateProductDto: UpdateProductDto,
      @UploadedFile() file: Express.Multer.File // 3. מקבלים אותו
    ) {
    
    // 4. אם המשתמש העלה תמונה חדשה בעריכה - מעלים אותה ומעדכנים את הלינק
    if (file) {
        const imageUrl = await this.cloudinaryService.uploadImage(file);
        updateProductDto.imageUrl = imageUrl;
    }

    // אם לא נשלח קובץ, updateProductDto ישתמש ב-URL הישן (אם נשלח) או יתעלם מהשדה
    return this.productsService.update(+id, updateProductDto);
  }
  // ----------------------------------------------------

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete product (Admin only)' })
  @Delete(':id')
  @Roles('admin')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  remove(@Param('id') id: string) {
    return this.productsService.remove(+id);
  }
}