import { IsString, IsNotEmpty, IsNumber, Min, IsBoolean, IsOptional, MaxLength } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateProductDto {
  @ApiProperty({ example: 'Ferrari F40', description: 'Product Name' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name: string;

  @ApiPropertyOptional({ example: 'A classic 1:18 model', description: 'Product Description' })
  @IsString()
  @IsOptional()
  @MaxLength(5000)
  description?: string;

  @ApiProperty({ example: 299.90 })
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  price: number;

  @ApiProperty({ example: 10 })
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  stock: number;

  @ApiPropertyOptional({ example: 'Sports Cars' })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  category?: string;

  @ApiPropertyOptional({ example: 'Burago' })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  brand?: string;

  @ApiPropertyOptional({ example: 'Ferrari' })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  carMake?: string;

  @ApiPropertyOptional({ example: '1:18' })
  @IsString()
  @IsOptional()
  @MaxLength(50)
  scale?: string;

  @ApiPropertyOptional({ example: 'Red' })
  @IsString()
  @IsOptional()
  @MaxLength(50)
  color?: string;

  @ApiProperty({ example: 'http://img.com/car.jpg' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(1000)
  imageUrl: string;

  @ApiPropertyOptional({ example: true })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}