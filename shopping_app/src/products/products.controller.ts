import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query } from '@nestjs/common'; // <--- הוספתי Query
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { AuthGuard } from '@nestjs/passport';
import { Roles } from 'src/auth/roles.decorator';
import { RolesGuard } from 'src/auth/roles.guard';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  @Roles('admin')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  create(@Body() createProductDto: CreateProductDto) {
    return this.productsService.create(createProductDto);
  }

  // --- השינוי כאן: קבלת פרמטרים לחיפוש וסינון ---
  @Get()
  findAll(
    @Query('search') search?: string,
    @Query('category') category?: string,
    @Query('brand') brand?: string,     // יצרן (Burago וכו')
    @Query('carMake') carMake?: string, // חברת רכב (Ferrari וכו')
    @Query('scale') scale?: string,     // קנה מידה
    @Query('sort') sort?: string, // מיון
    @Query('maxPrice') maxPrice?: number // מחיר מקסימלי  
  ) {
   return this.productsService.findAll(search, category, brand, carMake, scale, sort, maxPrice ? +maxPrice : undefined);
  }
  // ----------------------------------------------

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.productsService.findOne(+id);
  }

  @Patch(':id')
  @Roles('admin')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  update(@Param('id') id: string, @Body() updateProductDto: UpdateProductDto) {
    return this.productsService.update(+id, updateProductDto);
  }

  @Delete(':id')
  @Roles('admin')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  remove(@Param('id') id: string) {
    return this.productsService.remove(+id);
  }
}