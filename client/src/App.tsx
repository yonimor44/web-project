// רכיב השורש של האפליקציה. מגדיר את ה-Theme של Material UI,
// את ה-Layout הכללי (Navbar, Footer, Modals) ואת הניתובים (Routes).

import { Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme, Box, CssBaseline } from '@mui/material';

// --- רכיבים גלובליים (מוצגים בכל האתר) ---
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer'; 
import { AdminGuard } from './components/AdminGuard';
import { CartDrawer } from './components/CartDrawer'; 
import { CartSuccessModal } from './components/CartSuccessModal';

// --- דפים (Pages) ---
import { HomePage } from './pages/HomePage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { AdminPage } from './pages/AdminPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { MyOrdersPage } from './pages/MyOrdersPage';
import { ProductDetails } from './pages/ProductDetails';
import { AuthCallback } from './pages/AuthCallback';
import { CartPage } from './pages/CartPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { ProfilePage } from './pages/ProfilePage';

// הגדרת Theme מותאם אישית
const theme = createTheme({
  palette: {
    primary: {
      main: '#d32f2f', // אדום פרארי - הצבע הראשי
    },
    secondary: {
      main: '#1a1a1a', // שחור פחם - משני
    },
    background: {
      default: '#f5f5f5', 
      paper: '#ffffff',
    },
    text: {
        primary: '#2c3e50', // טקסט כהה וקריא
    }
  },
  typography: {
    fontFamily: 'Assistant, Rubik, sans-serif', // פונטים מודרניים בעברית
    button: { fontWeight: 700 }, 
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: { borderRadius: 50, textTransform: 'none' } // כפתורים עגולים
      }
    },
    MuiPaper: {
        styleOverrides: {
            rounded: { borderRadius: 16 } // כרטיסים מעוגלים
        }
    }
  }
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline /> {/* איפוס CSS דפדפן */}
      
      {/* מבנה Flexbox כדי שהפוטר תמיד יהיה למטה */}
      <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        
        {/* --- רכיבים קבועים --- */}
        <Navbar />
        <CartDrawer />        {/* מגירת עגלה (מוסתרת כברירת מחדל) */}
        <CartSuccessModal />  {/* מודל אישור הוספה לעגלה */}
        
        {/* --- אזור התוכן המשתנה --- */}
        <Box component="main" sx={{ flexGrow: 1 }}>
          <Routes>
            {/* נתיבים ציבוריים */}
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/product/:id" element={<ProductDetails />} />
            <Route path="/auth/callback" element={<AuthCallback />} />
            
            {/* נתיבים למשתמשים מחוברים (הגישה מוגבלת ע"י בדיקות בתוך הדפים או ב-Guard עתידי) */}
            <Route path="/cart" element={<CartPage />} />
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/my-orders" element={<MyOrdersPage />} />
            <Route path="/profile" element={<ProfilePage />} />

            {/* אזור מוגן לאדמין בלבד */}
            <Route path="/admin" element={
              <AdminGuard>
                <AdminPage />
              </AdminGuard>
            } />

            {/* דף שגיאה 404 */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Box>

        {/* פוטר קבוע בתחתית */}
        <Footer />

      </Box>
    </ThemeProvider>
  );
}

export default App;