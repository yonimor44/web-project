// דף ביניים לטיפול בחזרה מ-Google OAuth.
// מקבל את הטוקן מה-URL, שומר אותו ב-LocalStorage ומבצע ריענון מלא.

import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { CircularProgress, Box, Typography } from '@mui/material';

export const AuthCallback = () => {
  const location = useLocation();
  // Ref למניעת ריצה כפולה של ה-useEffect (קורה ב-React Strict Mode)
  const processed = useRef(false);

  useEffect(() => {
    if (processed.current) return; 

    console.log('📍 AuthCallback: מתחיל תהליך שמירת טוקן...');
    const params = new URLSearchParams(location.search);
    const token = params.get('token');

    if (token) {
      processed.current = true; 

      console.log('✅ טוקן נמצא! שומר ל-LocalStorage...');
      
      // 1. שמירה
      localStorage.setItem('token', token);

      // 2. אימות שמירה
      const savedToken = localStorage.getItem('token');
      if (savedToken === token) {
          console.log('🔒 השמירה הצליחה. מבצע ריענון מלא...');
          
          // 3. ריענון מלא (Hard Reload) כדי לאפס את כל ה-State באפליקציה
          setTimeout(() => {
            window.location.href = '/'; 
          }, 500);
      } else {
          console.error('❌ שגיאה: הטוקן לא נשמר!');
          alert('שגיאה בשמירת פרטי ההתחברות.');
      }

    } else {
      console.error('❌ לא נמצא טוקן ב-URL');
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