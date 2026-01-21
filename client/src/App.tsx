import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { HomePage } from './pages/HomePage';
import { LoginPage } from './pages/LoginPage';
import { AuthCallback } from './pages/AuthCallback';
import { Navbar } from './components/Navbar';
import { ProductDetails } from './pages/ProductDetails';
import { CartPage } from './pages/CartPage';
import { CartProvider } from './context/CartContext';
import { RegisterPage } from './pages/RegisterPage';

function App() {
  return (
    <CartProvider>
    <BrowserRouter>
      {/* ה-Navbar נמצא כאן כדי שהוא יופיע בכל הדפים */}
      <Navbar /> 
      
      <div style={{ padding: '20px' }}> {/* קצת רווח כדי שהתוכן לא יידבק למעלה */}
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/auth/callback" element={<AuthCallback />} />
          <Route path="/product/:id" element={<ProductDetails />} />
          <Route path="/cart" element={<CartPage />} />
        </Routes>
      </div>
    </BrowserRouter>
    </CartProvider>
  );
}

export default App;