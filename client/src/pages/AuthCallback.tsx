import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { CircularProgress, Box, Typography } from '@mui/material';

export const AuthCallback = () => {
  const location = useLocation();
  // משתמשים ב-ref כדי למנוע מהקוד לרוץ פעמיים (קורה הרבה ב-React)
  const processed = useRef(false);

  useEffect(() => {
    if (processed.current) return; // אם כבר רצנו, תעצור

    console.log('📍 AuthCallback: מתחיל תהליך שמירת טוקן...');
    const params = new URLSearchParams(location.search);
    const token = params.get('token');

    if (token) {
      processed.current = true; // מסמנים שטיפלנו

      console.log('✅ טוקן נמצא! שומר ל-LocalStorage בשם "token"...');
      
      // 1. שמירה בדפדפן
      localStorage.setItem('token', token);

      // 2. בדיקה שהשמירה הצליחה
      const savedToken = localStorage.getItem('token');
      if (savedToken === token) {
          console.log('🔒 השמירה הצליחה. מבצע ריענון מלא...');
          
          // 3. הפתרון הגרעיני: במקום navigate, אנחנו מחליפים את הכתובת
          // זה גורם לטעינה מחדש של כל האתר, מה שמבטיח שה-Axios יקלוט את הטוקן
          setTimeout(() => {
            window.location.href = '/'; 
          }, 500);
      } else {
          console.error('❌ שגיאה: הטוקן לא נשמר בזיכרון!');
          alert('שגיאה בשמירת פרטי ההתחברות. נסה שוב.');
      }

    } else {
      console.error('❌ לא נמצא טוקן ב-URL');
      // חזרה ללוגין אם משהו נכשל
      setTimeout(() => {
        window.location.href = '/login';
      }, 2000);
    }
  }, [location]);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mt: 10, gap: 2 }}>
      <CircularProgress size={60} />
      <Typography variant="h6">מתחבר למערכת...</Typography>
      <Typography variant="body2" color="text.secondary">אנא המתן, מסנכרן נתונים</Typography>
    </Box>
  );
};