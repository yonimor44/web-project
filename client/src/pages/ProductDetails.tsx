// --- ProductDetails.tsx ---
// דף פרטי מוצר. מציג מידע מלא על רכב ספציפי.
// כולל גלריית תמונה גדולה, מפרט טכני, וכפתורי הוספה לסל.

import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Typography, Button, Box, Chip, Divider, CircularProgress, useTheme, useMediaQuery, Stack, IconButton, Paper } from '@mui/material';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import FlashOnIcon from '@mui/icons-material/FlashOn';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import VerifiedIcon from '@mui/icons-material/Verified';
import { productsService } from '../services/products.service';
import type { Product } from '../types/product.types';
import { useCart } from '../context/CartContext'; 
import { useAuth } from '../context/AuthContext';

const FERRARI_RED = '#d32f2f'; 

export const ProductDetails = () => {
  const { id } = useParams(); // קבלת ה-ID מה-URL
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  
  const { addToCart } = useCart(); 
  const { user } = useAuth();
  
  const theme = useTheme();
  // זיהוי אם המשתמש במובייל כדי להתאים את העיצוב
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  // טעינת המוצר לפי ה-ID
  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) return;
      try {
        const data = await productsService.getOne(id);
        setProduct(data);
      } catch (error) {
        console.error('Failed to load product', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  // לוגיקת הוספה לסל (עם אופציה למעבר מיידי לקופה)
  const handleAddToCart = async (redirect: boolean) => {
    if (!user) {
        alert('כדי לקנות רכבים, יש להתחבר למערכת 🏎️');
        navigate('/login');
        return;
    }

    if (product) {
        await addToCart(product);
        if (redirect) {
            navigate('/checkout');
        }
    }
  };
  // תצוגת טעינה בזמן שהמוצר נטען
  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}><CircularProgress sx={{ color: FERRARI_RED }} /></Box>;
  // טיפול במקרה שהמוצר לא נמצא
  if (!product) return <Typography variant="h5" align="center" mt={10}>הרכב לא נמצא 😔</Typography>;

  // בדיקת מלאי
  const stockAmount = Number(product.stock || 0);
  const isInStock = stockAmount > 0;

  return (
    <Box sx={{ 
      width: '100%', 
      // מסך מלא במחשב, גובה לפי תוכן במובייל
      minHeight: { xs: 'auto', md: 'calc(100vh - 64px)' }, 
      display: 'flex', 
      flexDirection: isMobile ? 'column' : 'row', 
      bgcolor: '#f5f5f5', 
      overflowX: 'hidden',
      position: 'relative'
    }}>
      
      {/* כפתור חזרה מהיר */}
      <IconButton 
          onClick={() => navigate('/')} 
          size="small"
          sx={{ 
              position: 'absolute', top: 20, right: 20, zIndex: 100, 
              bgcolor: 'white', boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              '&:hover': { bgcolor: '#f0f0f0' },
              width: 40, height: 40
          }}
      >
        <ArrowForwardIcon sx={{ color: '#333', fontSize: 20 }} />
      </IconButton>

      {/* --- אזור התמונה (צד ימין/למעלה) --- */}
      <Box sx={{ 
        flex: 1, 
        height: { xs: '40vh', md: 'auto' }, // תמונה קטנה יותר במובייל
        display: 'flex', justifyContent: 'center', alignItems: 'center',
        position: 'relative', bgcolor: '#eaeaea' 
      }}>
        {/* טקסט רקע ענק (רק בדסקטופ) */}
        {!isMobile && (
            <Typography sx={{ 
                position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', 
                fontSize: '10vw', fontWeight: '900', color: 'rgba(0,0,0,0.04)', 
                whiteSpace: 'nowrap', zIndex: 0, pointerEvents: 'none'
            }}>
                {product.carMake}
            </Typography>
        )}
        {/* תמונת המוצר */}
        <Box 
          component="img"
          src={product.imageUrl}
          alt={product.name}
          sx={{
            width: '85%', maxWidth: '600px', maxHeight: { xs: '80%', md: '60%' },
            objectFit: 'contain', 
            filter: 'drop-shadow(0px 15px 30px rgba(0,0,0,0.2))',
            zIndex: 1, transition: 'transform 0.3s',
            '&:hover': { transform: 'scale(1.05)' }
          }}
        />
      </Box>

      {/* --- אזור הפרטים (צד שמאל/למטה) --- */}
      <Paper elevation={0} sx={{ 
        flex: 1, 
        display: 'flex', flexDirection: 'column', justifyContent: 'center', 
        p: { xs: 3, md: 6, lg: 8 }, 
        bgcolor: 'white',
        // עיצוב "כרטיסיה" שעולה על התמונה
        borderRadius: { xs: '30px 30px 0 0', md: '30px 0 0 30px' },
        marginTop: { xs: '-30px', md: '0' }, 
        zIndex: 2,
        boxShadow: { xs: '0 -10px 30px rgba(0,0,0,0.05)', md: '-10px 0 30px rgba(0,0,0,0.05)' }
      }}>
        
        {/* כותרת מותג */}
        <Stack direction="row" alignItems="center" spacing={1} mb={1}>
            <VerifiedIcon sx={{ color: FERRARI_RED, fontSize: 18 }} />
            <Typography variant="caption" sx={{ letterSpacing: 1.5, fontWeight: 'bold', color: 'text.secondary' }}>
                {product.brand} COLLECTION
            </Typography>
        </Stack>
        
        {/* שם הרכב */}
        <Typography variant="h4" component="h1" sx={{ 
            fontWeight: 800, mb: 1, lineHeight: 1.1, textTransform: 'uppercase',
            fontSize: { xs: '1.8rem', md: '2.5rem' }
        }}>
          {product.carMake} <Box component="span" sx={{ color: FERRARI_RED }}>{product.name}</Box>
        </Typography>

        {/* מחיר וסטטוס */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
            <Typography variant="h4" sx={{ color: FERRARI_RED, fontWeight: '800', fontSize: { xs: '1.8rem', md: '2.2rem' } }}>
                ₪{product.price}
            </Typography>
            
            <Chip 
                label={isInStock ? "במלאי" : "אזל"} 
                size="small"
                sx={{ 
                    bgcolor: isInStock ? '#e8f5e9' : '#ffebee', 
                    color: isInStock ? '#2e7d32' : '#c62828', 
                    fontWeight: 'bold' 
                }} 
            />
        </Box>

        {/* תגיות מידע */}
        <Stack direction="row" flexWrap="wrap" gap={1} sx={{ mb: 3 }}>
            <Chip label={product.category} size="small" variant="outlined" sx={{ borderRadius: 2 }} />
            <Chip label={product.carMake} size="small" variant="outlined" sx={{ borderRadius: 2 }} />
            {product.scale && <Chip label={product.scale} size="small" variant="outlined" sx={{ borderRadius: 2 }} />}
            {product.color && (
                <Chip 
                    label={product.color} size="small" variant="outlined" 
                    avatar={<Box sx={{ width: 14, height: 14, borderRadius: '50%', bgcolor: product.color.toLowerCase(), border: '1px solid #ddd', ml: 1 }} />}
                    sx={{ borderRadius: 2 }} 
                />
            )}
        </Stack>
        
        <Typography variant="body2" paragraph sx={{ mb: 4, lineHeight: 1.6, fontSize: '1rem', color: 'text.secondary', maxWidth: '550px' }}>
          {product.description || "דגם אספנות איכותי ומדויק לפרטים, הכולל גימור ברמה גבוהה. מתנה מושלמת לכל חובב רכב."}
        </Typography>

        <Divider sx={{ mb: 4 }} />

        {/* כפתורי פעולה */}
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          <Button 
            variant="contained" size="large" startIcon={<ShoppingCartIcon />}
            disabled={!isInStock} onClick={() => handleAddToCart(false)}
            sx={{ 
                flex: 1, py: 1.5, fontSize: '1rem', fontWeight: 'bold', borderRadius: 50, 
                bgcolor: FERRARI_RED, boxShadow: '0 8px 20px rgba(211, 47, 47, 0.3)',
                '&:hover': { bgcolor: '#b71c1c', boxShadow: '0 12px 25px rgba(211, 47, 47, 0.4)' }, textTransform: 'none'
            }}
          >
            הוסף לעגלה
          </Button>
          
          <Button 
            variant="outlined" size="large" startIcon={<FlashOnIcon />}
            disabled={!isInStock} onClick={() => handleAddToCart(true)}
            sx={{ 
                flex: 1, py: 1.5, fontSize: '1rem', fontWeight: 'bold', borderRadius: 50, 
                borderColor: '#e0e0e0', color: 'text.primary', borderWidth: 1.5,
                '&:hover': { borderColor: FERRARI_RED, color: FERRARI_RED, bgcolor: 'white', borderWidth: 1.5 }, textTransform: 'none'
            }}
          >
            קנה עכשיו
          </Button>
        </Stack>
        
        {/* אייקונים תחתונים */}
        <Box sx={{ mt: 3, display: 'flex', gap: 3, color: 'text.secondary', opacity: 0.8 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <LocalShippingIcon sx={{ fontSize: 18 }} />
                <Typography variant="caption" fontWeight="bold">משלוח מהיר</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <VerifiedIcon sx={{ fontSize: 18 }} />
                <Typography variant="caption" fontWeight="bold">מקורי 100%</Typography>
            </Box>
        </Box>

        {isInStock && stockAmount < 5 && (
            <Typography variant="caption" color="error" sx={{ mt: 1, fontWeight: 'bold', display: 'block' }}>
               🔥 רק {stockAmount} יחידות נותרו!
            </Typography>
        )}
      </Paper>
    </Box>
  );
};