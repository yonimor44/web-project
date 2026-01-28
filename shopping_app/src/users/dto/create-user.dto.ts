import { IsEmail, IsString, MinLength, IsNotEmpty, Matches, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger'; // <---

export class CreateUserDto {
  @ApiProperty({ example: 'yoni@example.com', description: 'The email of the user' })
  @IsEmail({}, { message: 'Email must be valid' })
  @MaxLength(255)
  email: string;

  @ApiProperty({ example: 'Pass1234!', description: 'Strong password with letters and numbers' })
  @IsString()
  @Matches(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&^()._-]{8,}$/)
  @MinLength(8)
  @MaxLength(32)
  password: string;

  @ApiProperty({ example: 'Yoni', description: 'First name' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  firstName: string;

  @ApiProperty({ example: 'Cohen', description: 'Last name' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  lastName: string;
}