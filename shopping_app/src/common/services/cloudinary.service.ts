import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary } from 'cloudinary';
import * as streamifier from 'streamifier';

// שירות לניהול העלאת תמונות לענן
@Injectable()
export class CloudinaryService {
  constructor(private configService: ConfigService) {
    // אתחול הקונפיגורציה של Cloudinary בעת עליית הסרוויס
    cloudinary.config({
      cloud_name: this.configService.get<string>('CLOUDINARY_CLOUD_NAME'),
      api_key: this.configService.get<string>('CLOUDINARY_API_KEY'),
      api_secret: this.configService.get<string>('CLOUDINARY_API_SECRET'),
    });
  }

  /**
   * מעלה תמונה ל-Cloudinary באמצעות Stream.
   * משתמש ב-streamifier כדי להפוך את הבאפר (Buffer) של הקובץ לזרם נתונים.
   * * @param file - קובץ שהתקבל מ-Multer (כולל Buffer)
   * @returns Promise<string> - מחזיר את ה-URL המאובטח של התמונה
   */
  uploadImage(file: Express.Multer.File): Promise<string> {
    return new Promise((resolve, reject) => {
      
      const uploadStream = cloudinary.uploader.upload_stream(
        { 
          folder: 'shopping_app_products' // שם התיקייה בה יישמרו התמונות
        }, 
        (error, result) => {
          if (error) return reject(error);
          
          if (!result) {
            return reject(new Error('Cloudinary upload failed - no result'));
          }

          // החזרת הלינק המאובטח (HTTPS)
          resolve(result.secure_url); 
        },
      );

      // המרת הבאפר ל-Stream וצינור לתוך Cloudinary
      streamifier.createReadStream(file.buffer).pipe(uploadStream);
    });
  }
}