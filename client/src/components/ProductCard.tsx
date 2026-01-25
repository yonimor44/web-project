import React from 'react';
import { Card, CardMedia, CardContent, CardActions, Typography, Button, Chip, Box, Stack } from '@mui/material';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined'; 
import { useNavigate } from 'react-router-dom';
import type { Product } from '../types/product.types';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

interface Props {
  product: Product;
  // פונקציה אופציונלית לסינון מהיר (חדש!)
  onQuickFilter?: (type: string, value: string) => void;
}

export const ProductCard: React.FC<Props> = ({ product, onQuickFilter }) => {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { user } = useAuth();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation(); 

    if (!user) {
        alert('כדי להוסיף רכבים לעגלה, יש להתחבר למערכת 🏎️');
        navigate('/login');
        return;
    }

    addToCart(product.id, 1);
  };

  // פונקציה לטיפול בלחיצה על תגית (חדש!)
  const handleChipClick = (e: React.MouseEvent, type: string, value: string) => {
      e.stopPropagation(); // שלא יכנס לדף המוצר
      if (onQuickFilter) {
          onQuickFilter(type, value);
      }
  };

  return (
    <Card 
      sx={{ 
        maxWidth: 345, 
        height: '100%', 
        display: 'flex', 
        flexDirection: 'column', 
        boxShadow: 3, 
        cursor: 'pointer', 
        transition: '0.2s', 
        '&:hover': { transform: 'scale(1.02)' } 
      }}
      onClick={() => navigate(`/product/${product.id}`)}
    >
      <Box sx={{ position: 'relative' }}>
          <CardMedia
            component="img"
            height="200"
            image={product.imageUrl}
            alt={product.name}
            sx={{ objectFit: 'cover' }}
          />
          {/* במידה והמלאי אזל, אפשר להוסיף חיווי כאן */}
          {product.stock === 0 && (
             <Chip label="אזל המלאי" color="error" size="small" sx={{ position: 'absolute', top: 10, right: 10 }} />
          )}
      </Box>
      
      <CardContent sx={{ flexGrow: 1 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
            <Typography gutterBottom variant="h6" component="div" sx={{ fontWeight: 'bold' }}>
            {product.carMake || product.brand} {product.name}
            </Typography>
            <Typography variant="h6" color="primary">
            ₪{product.price}
            </Typography>
        </Box>

        {/* --- אזור התגיות הלחיצות --- */}
        <Stack direction="row" flexWrap="wrap" gap={1} sx={{ mb: 2 }}>
            {/* קטגוריה */}
            <Chip 
                label={product.category} 
                size="small" 
                color="primary" 
                variant="outlined"
                onClick={(e) => handleChipClick(e, 'category', product.category)}
                sx={{ cursor: 'pointer', '&:hover': { bgcolor: 'rgba(25, 118, 210, 0.04)' } }}
            />
            
            {/* קנה מידה */}
            {product.scale && (
                <Chip 
                    label={product.scale} 
                    size="small" 
                    variant="outlined" 
                    onClick={(e) => handleChipClick(e, 'scale', product.scale)}
                    sx={{ cursor: 'pointer', '&:hover': { bgcolor: 'rgba(0, 0, 0, 0.04)' } }}
                />
            )}

            {/* מותג (אם יש) */}
            {product.brand && (
                <Chip 
                    label={product.brand} 
                    size="small" 
                    color="secondary" 
                    variant="outlined" 
                    onClick={(e) => handleChipClick(e, 'brand', product.brand)}
                    sx={{ cursor: 'pointer', '&:hover': { bgcolor: 'rgba(156, 39, 176, 0.04)' } }}
                />
            )}
        </Stack>
        {/* --------------------------- */}

        <Typography variant="body2" color="text.secondary">
          {product.description ? product.description.substring(0, 80) : 'אין תיאור זמין'}...
        </Typography>
      </CardContent>

      <CardActions sx={{ flexDirection: 'column', gap: 1.5, px: 2, pb: 2 }}>
        
        {/* כפתור פרטים */}
        <Button 
            variant="outlined" 
            fullWidth
            size="medium"
            startIcon={<InfoOutlinedIcon />}
            onClick={(e) => {
                e.stopPropagation();
                navigate(`/product/${product.id}`);
            }}
            sx={{ py: 1, borderWidth: 1.5 }}
        >
          פרטים נוספים
        </Button>

        {/* כפתור הוספה לעגלה */}
        <Button 
            variant="contained" 
            fullWidth
            size="medium"
            startIcon={<ShoppingCartIcon />}
            onClick={handleAddToCart}
            disabled={product.stock === 0} // משביתים אם אין מלאי
            sx={{ py: 1 }}
        >
          {product.stock === 0 ? 'אזל המלאי' : 'הוסף לעגלה'}
        </Button>

      </CardActions>
    </Card>
  );
};