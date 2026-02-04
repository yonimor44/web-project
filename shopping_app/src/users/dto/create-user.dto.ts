import {IsEmail, IsString, MinLength, IsNotEmpty, Matches, MaxLength} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

// DTO להרשמת משתמש חדש
// משמש גם להרשמה (Register) וגם ליצירה ע"י אדמין.
export class CreateUserDto {
  @ApiProperty({ 
    example: 'yoni@example.com', 
    description: 'The email of the user (must be unique)' 
  })
  @IsEmail({}, { message: 'Email must be valid' })
  @MaxLength(255)
  email: string;

  @ApiProperty({ 
    example: 'Pass1234!', 
    description: 'Strong password: at least 8 chars, 1 letter, 1 number' 
  })
  @IsString()
  // רג'קס לסיסמה חזקה (אות, מספר, מינימום 8 תווים)
  @Matches(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&^()._-]{8,}$/, {
    message: 'Password too weak. Must contain letters and numbers.',
  })
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