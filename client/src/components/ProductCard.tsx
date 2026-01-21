import React from 'react';
import { Card, CardMedia, CardContent, CardActions, Typography, Button, Chip, Box } from '@mui/material';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined'; // אייקון לפרטים
import { useNavigate } from 'react-router-dom';
import type { Product } from '../types/product.types';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

interface Props {
  product: Product;
}

export const ProductCard: React.FC<Props> = ({ product }) => {
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

  return (
    <Card 
      sx={{ maxWidth: 345, height: '100%', display: 'flex', flexDirection: 'column', boxShadow: 3, cursor: 'pointer', transition: '0.2s', '&:hover': { transform: 'scale(1.02)' } }}
      onClick={() => navigate(`/product/${product.id}`)}
    >
      <CardMedia
        component="img"
        height="200"
        image={product.imageUrl}
        alt={product.name}
        sx={{ objectFit: 'cover' }}
      />
      
      <CardContent sx={{ flexGrow: 1 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
            <Typography gutterBottom variant="h6" component="div" sx={{ fontWeight: 'bold' }}>
            {product.carMake || product.brand} {product.name}
            </Typography>
            <Typography variant="h6" color="primary">
            ₪{product.price}
            </Typography>
        </Box>

        <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
            {product.scale && <Chip label={product.scale} size="small" variant="outlined" />}
            {product.brand && <Chip label={product.brand} size="small" color="secondary" variant="outlined" />}
        </Box>

        <Typography variant="body2" color="text.secondary">
          {product.description ? product.description.substring(0, 80) : 'אין תיאור זמין'}...
        </Typography>
      </CardContent>

      {/* --- אזור הכפתורים המעודכן (הסדר התהפך) --- */}
      <CardActions sx={{ flexDirection: 'column', gap: 1.5, px: 2, pb: 2 }}>
        
        {/* 1. כפתור פרטים - למעלה (עם מסגרת) */}
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

        {/* 2. כפתור הוספה לעגלה - למטה (מלא וצבעוני) */}
        <Button 
            variant="contained" 
            fullWidth
            size="medium"
            startIcon={<ShoppingCartIcon />}
            onClick={handleAddToCart}
            sx={{ py: 1 }}
        >
          הוסף לעגלה
        </Button>

      </CardActions>
    </Card>
  );
};