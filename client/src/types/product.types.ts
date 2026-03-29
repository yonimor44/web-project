// הגדרת המבנה של מוצר במערכת.
// כולל את כל השדות המיוחדים של חנות דגמי המכוניות.

export interface Product {
    id: number;
    name: string;        // שם הדגם (למשל: "Lamborghini Aventador SVJ")
    price: number;       // מחיר בש"ח
    description: string; // תיאור קצר
    imageUrl: string;    // לינק לתמונה (Cloudinary)
    stock: number;       // כמות במלאי (קריטי לוולידציה)
    
    // שדות ייחודיים לדגמי רכב
    category: 'Sports' | 'Classic' | 'Muscle' | 'Trucks';
    scale: '1:64' | '1:43' | '1:36' | '1:24' | '1:18';
    brand: string;       // יצרן הצעצוע (Burago)
    carMake: string;     // יצרן הרכב האמיתי (Ferrari)
    color: string;       // צבע הדגם
}