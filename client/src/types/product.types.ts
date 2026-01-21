export interface Product {
  id: number;
  name: string;        // למשל: "Lamborghini Aventador SVJ"
  price: number;       // מחיר הדגם (למשל 150 ש"ח)
  description: string; // תיאור קצר
  imageUrl: string;    // תמונה של הקופסה או הדגם
  stock: number;       // כמה יחידות יש במלאי (חשוב!)
  
  // שדות מיוחדים לדגמים:
  category: 'Sports' | 'Classic' | 'Muscle' | 'Trucks';
  scale: '1:64' | '1:43'  | '1:36'| '1:24' | '1:18' ; // קנה מידה
  brand: string;       // יצרן הדגם 
  carMake: string;     // יצרן הרכב האמיתי
  color: string;       // צבע הדגם
}