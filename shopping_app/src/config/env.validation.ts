import { plainToClass } from 'class-transformer';
import { IsNotEmpty, IsString, MinLength, validateSync, IsNumber } from 'class-validator';


 //מחלקה המגדירה את מבנה משתני הסביבה (.env)
 //ומבצעת ולידציה לכל משתנה כדי להבטיח שהשרת יעלה עם הגדרות תקינות.

class EnvironmentVariables {
  @IsString()
  @IsNotEmpty()
  @MinLength(32, { message: 'JWT_SECRET must be at least 32 characters long' })
  JWT_SECRET: string;

  @IsString()
  @IsNotEmpty()
  DB_HOST: string;

  @IsNumber()
  @IsNotEmpty()
  DB_PORT: number;

  @IsString()
  @IsNotEmpty()
  DB_USERNAME: string;

  @IsString()
  @IsNotEmpty()
  DB_PASSWORD: string;

  @IsString()
  @IsNotEmpty()
  DB_NAME: string;

  @IsString()
  @IsNotEmpty()
  FRONTEND_URL: string;

  @IsString()
  @IsNotEmpty()
  SESSION_SECRET: string;
}

/**
 * פונקציה המבצעת את בדיקת התקינות בפועל בעת עליית השרת.
 * @param config - אובייקט הקונפיגורציה הגולמי שנקרא מהקובץ
 * @returns validatedConfig - הקונפיגורציה התקינה לאחר המרה ואימות
 */
export function validate(config: Record<string, unknown>) {
  // המרת האובייקט הגולמי למחלקת EnvironmentVariables
  const validatedConfig = plainToClass(
    EnvironmentVariables,
    {
      ...config,
      DB_PORT: parseInt(config.DB_PORT as string, 10), // המרה מפורשת למספר
    },
    { enableImplicitConversion: true },
  );

  // ביצוע הולידציה
  const errors = validateSync(validatedConfig, { 
    skipMissingProperties: false 
  });

  // אם יש שגיאות - עוצרים את עליית השרת וזורקים שגיאה
  if (errors.length > 0) {
    throw new Error(errors.toString());
  }
  
  return validatedConfig;
}