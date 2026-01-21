import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Typography, Button, Box, Chip, Divider, CircularProgress, useTheme, useMediaQuery } from '@mui/material';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import FlashOnIcon from '@mui/icons-material/FlashOn';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { productsService } from '../services/products.service';
import type { Product } from '../types/product.types';
import { useCart } from '../context/CartContext'; 
import { useAuth } from '../context/AuthContext';

export const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  
  const { addToCart } = useCart(); 
  const { user } = useAuth();
  
  // בדיקה אם אנחנו במסך ממש קטן (טלפון) כדי לא לשבור את התצוגה שם
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) return;
      try {
        const data = await productsService.getOne(parseInt(id));
        setProduct(data);
      } catch (error) {
        console.error('Failed to load product', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const handleAddToCart = async (redirect: boolean) => {
    if (!user) {
        alert('כדי לקנות רכבים, יש להתחבר למערכת 🏎️');
        navigate('/login');
        return;
    }

    if (product) {
        await addToCart(product.id, 1);
        if (redirect) {
            navigate('/cart');
        }
    }
  };

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}><CircularProgress size={80} /></Box>;
  if (!product) return <Typography variant="h4" align="center" mt={10}>הרכב לא נמצא 😔</Typography>;

  const stockAmount = Number(product.stock || 0);
  const isInStock = stockAmount > 0;

  return (
    <Box sx={{ 
      width: '100%', 
      minHeight: '90vh', // תופס את כל הגובה
      display: 'flex', 
      // בטלפון זה יהיה טור, במחשב זה יהיה שורה בכוח
      flexDirection: isMobile ? 'column' : 'row', 
      bgcolor: '#fff' 
    }}>
      
      {/* --- צד ימין: תמונה (50% מהמסך) --- */}
      <Box sx={{ 
        flex: 1, // לוקח 50% מהרוחב
        position: 'relative',
        bgcolor: '#f8f9fa', // רקע אפור עדין מאוד לתמונה
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        p: 4
      }}>
        {/* כפתור חזרה צף מעל התמונה */}
        <Button 
          startIcon={<ArrowBackIcon />} 
          onClick={() => navigate('/')} 
          sx={{ position: 'absolute', top: 20, right: 20, zIndex: 10 }}
        >
          חזרה לקטלוג
        </Button>

        <Box 
          component="img"
          src={product.imageUrl}
          alt={product.name}
          sx={{
            maxWidth: '100%',
            maxHeight: '70vh',
            objectFit: 'contain', 
            filter: 'drop-shadow(0px 10px 20px rgba(0,0,0,0.15))'
          }}
        />
      </Box>

      {/* --- צד שמאל: פרטים (50% מהמסך) --- */}
      <Box sx={{ 
        flex: 1, // לוקח 50% מהרוחב
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center', // ממקם את הטקסט באמצע הגובה
        p: { xs: 4, md: 8, lg: 10 } // ריפוד נדיב
      }}>
        
        <Typography variant="overline" color="text.secondary" sx={{ fontSize: '1.1rem', letterSpacing: 3, mb: 1 }}>
          {product.brand} COLLECTION
        </Typography>
        
        <Typography variant="h2" component="h1" sx={{ fontWeight: 900, mb: 2, lineHeight: 1 }}>
          {product.carMake} {product.name}
        </Typography>

        <Typography variant="h3" color="primary" sx={{ mb: 4, fontWeight: 'bold' }}>
          ₪{product.price}
        </Typography>

        <Box sx={{ display: 'flex', gap: 1, mb: 4, flexWrap: 'wrap' }}>
          {product.scale && <Chip label={`Scale: ${product.scale}`} variant="outlined" />}
          {product.color && <Chip label={`Color: ${product.color}`} variant="outlined" />}
          <Chip label={product.category} color="secondary" variant="outlined" />
          {isInStock ? 
            <Chip label="במלאי" color="success" variant="filled" /> : 
            <Chip label="אזל המלאי" color="error" variant="filled" />
          }
        </Box>

        <Typography variant="body1" paragraph sx={{ mb: 5, lineHeight: 1.8, fontSize: '1.1rem', color: 'text.secondary', maxWidth: '600px' }}>
          {product.description || "אין תיאור זמין עבור דגם זה."}
        </Typography>

        <Divider sx={{ mb: 5 }} />

        {/* כפתורים בגודל רגיל ונוח */}
        <Box sx={{ display: 'flex', gap: 2, maxWidth: '500px' }}>
          <Button 
            variant="contained" 
            size="large"
            startIcon={<ShoppingCartIcon />}
            disabled={!isInStock}
            onClick={() => handleAddToCart(false)}
            sx={{ flex: 1, py: 1.5, fontSize: '1rem', boxShadow: 'none' }}
          >
            {isInStock ? 'הוסף לעגלה' : 'חסר במלאי'}
          </Button>

          <Button 
            variant="outlined" 
            size="large"
            startIcon={<FlashOnIcon />}
            disabled={!isInStock}
            onClick={() => handleAddToCart(true)}
            sx={{ flex: 1, py: 1.5, fontSize: '1rem', borderWidth: 1 }}
          >
            קנה עכשיו
          </Button>
        </Box>
        
        {isInStock && stockAmount < 5 && (
            <Typography variant="caption" color="error" sx={{ mt: 2, fontWeight: 'bold' }}>
               רק {stockAmount} יחידות נותרו!
            </Typography>
        )}
      </Box>
    </Box>
  );
};