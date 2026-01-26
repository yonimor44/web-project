import { Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme, Box, CssBaseline } from '@mui/material';

// --- Components ---
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer'; // הוספנו את הפוטר החדש
import { AdminGuard } from './components/AdminGuard';
import { CartDrawer } from './components/CartDrawer'; 
import { CartSuccessModal } from './components/CartSuccessModal';

// --- Pages ---
import { HomePage } from './pages/HomePage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { AdminPage } from './pages/AdminPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { MyOrdersPage } from './pages/MyOrdersPage';
import { ProductDetails } from './pages/ProductDetails';
import { AuthCallback } from './pages/AuthCallback';
import { CartPage } from './pages/CartPage';
import { NotFoundPage } from './pages/NotFoundPage'; // הוספנו את דף השגיאה

// --- הגדרת העיצוב הגלובלי (Ferrari Theme) ---
const theme = createTheme({
  palette: {
    primary: {
      main: '#d32f2f', // Ferrari Red - הצבע השולט
    },
    secondary: {
      main: '#1a1a1a', // שחור כהה
    },
    background: {
      default: '#f5f5f5', // רקע אפור בהיר לכל האתר
      paper: '#ffffff',
    },
    text: {
        primary: '#2c3e50',
    }
  },
  typography: {
    fontFamily: 'Assistant, Rubik, sans-serif',
    button: { fontWeight: 700 }, // כל הכפתורים מודגשים
  },
  components: {
    // כל הכפתורים באתר יהיו עגולים כברירת מחדל
    MuiButton: {
      styleOverrides: {
        root: { borderRadius: 50, textTransform: 'none' }
      }
    },
    // כרטיסים עם פינות מעוגלות
    MuiPaper: {
        styleOverrides: {
            rounded: { borderRadius: 16 } 
        }
    }
  }
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline /> {/* איפוס CSS בסיסי ורקע */}
      
      {/* מבנה Flex כדי שהפוטר יישאר תמיד למטה */}
      <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        
        <Navbar />
        
        {/* הרכיבים האלו זמינים תמיד מעל כל העמודים */}
        <CartDrawer /> 
        <CartSuccessModal /> 
        
        {/* אזור התוכן הראשי - גדל כדי לתפוס מקום */}
        <Box component="main" sx={{ flexGrow: 1 }}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/product/:id" element={<ProductDetails />} />
            <Route path="/auth/callback" element={<AuthCallback />} />
            
            {/* אזור מוגן למשתמשים מחוברים */}
            <Route path="/cart" element={<CartPage />} />
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/my-orders" element={<MyOrdersPage />} />

            {/* אזור מוגן לאדמין */}
            <Route path="/admin" element={
              <AdminGuard>
                <AdminPage />
              </AdminGuard>
            } />

            {/* דף 404 לכל נתיב שלא קיים */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Box>

        {/* הפוטר תמיד למטה */}
        <Footer />

      </Box>
    </ThemeProvider>
  );
}

export default App;