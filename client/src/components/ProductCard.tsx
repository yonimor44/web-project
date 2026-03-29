// כרטיס מוצר להצגה בקטלוג.
// מציג תמונה, פרטים ותגיות. מאפשר הוספה מהירה לעגלה ומעבר לדף המוצר.

import React from 'react';
import { Card, CardMedia, CardContent, Typography, Button, Chip, Box, Stack } from '@mui/material';
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart';
// import VisibilityIcon from '@mui/icons-material/Visibility';
import { useNavigate } from 'react-router-dom';
import type { Product } from '../types/product.types';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

const FERRARI_RED = '#d32f2f';

interface Props {
  product: Product;
  onQuickFilter?: (type: string, value: string) => void;
}

export const ProductCard: React.FC<Props> = ({ product, onQuickFilter }) => {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { user } = useAuth();

  const handleAddToCart = (e: React.MouseEvent) => {
    // מניעת הפעלת הלחיצה על הכרטיס כולו (Stop Propagation)
    e.stopPropagation(); 
    
    if (!user) {
        alert('כדי להוסיף רכבים לעגלה, יש להתחבר למערכת 🏎️');
        navigate('/login');
        return;
    }
    addToCart(product);
  };

  const handleChipClick = (e: React.MouseEvent, type: string, value: string) => {
      e.stopPropagation();
      if (onQuickFilter) onQuickFilter(type, value);
  };

  return (
    <Card 
      onClick={() => navigate(`/product/${product.id}`)}
      sx={{ 
        height: '100%', display: 'flex', flexDirection: 'column', position: 'relative',
        borderRadius: 5, border: '1px solid #f0f0f0', bgcolor: 'white',
        transition: 'all 0.3s ease', cursor: 'pointer', overflow: 'visible',
        '&:hover': { transform: 'translateY(-8px)', boxShadow: '0 12px 30px rgba(211, 47, 47, 0.15)' }
      }}
      elevation={0}
    >
      {/* תגיות סטטוס מלאי */}
      <Box sx={{ position: 'absolute', top: 12, left: 12, zIndex: 2 }}>
          {product.stock === 0 && <Chip label="אזל המלאי" sx={{ bgcolor: '#ffebee', color: '#c62828', fontWeight: 'bold' }} size="small" />}
          {product.stock > 0 && product.stock < 5 && <Chip label="נחטף!" sx={{ bgcolor: '#fff3e0', color: '#ef6c00', fontWeight: 'bold' }} size="small" />}
      </Box>

      {/* תמונת המוצר */}
      <Box sx={{ p: 2, pb: 0, display: 'flex', justifyContent: 'center', height: 220, overflow: 'hidden' }}>
          <CardMedia
            component="img" image={product.imageUrl} alt={product.name}
            sx={{ height: '100%', width: '100%', objectFit: 'contain', transition: 'transform 0.5s', '&:hover': { transform: 'scale(1.08)' } }}
          />
      </Box>
      
      {/* פרטי המוצר ותגיות */}
      <CardContent sx={{ flexGrow: 1, pt: 1 }}>
        <Stack direction="row" spacing={1} mb={2} flexWrap="wrap" useFlexGap sx={{ rowGap: 1 }}>
            <Chip label={product.category} size="small" onClick={(e) => handleChipClick(e, 'category', product.category)} sx={{ bgcolor: '#f5f5f5', fontWeight: 'bold', fontSize: '0.7rem' }} />
            {product.carMake && <Chip label={product.carMake} size="small" onClick={(e) => handleChipClick(e, 'carMake', product.carMake)} sx={{ bgcolor: '#ffebee', color: FERRARI_RED, fontWeight: 'bold', fontSize: '0.7rem' }} />}
            {product.brand && <Chip label={product.brand} size="small" onClick={(e) => handleChipClick(e, 'brand', product.brand)} sx={{ bgcolor: '#f3e5f5', color: '#7b1fa2', fontSize: '0.7rem' }} />}
            {product.scale && <Chip label={product.scale} size="small" variant="outlined" onClick={(e) => handleChipClick(e, 'scale', product.scale)} sx={{ fontSize: '0.7rem' }} />}
        </Stack>

        <Typography gutterBottom variant="h6" sx={{ fontWeight: '800', lineHeight: 1.2, fontSize: '1.1rem' }}>{product.name}</Typography>
        <Typography variant="h5" sx={{ color: FERRARI_RED, fontWeight: '900', mt: 'auto' }}>₪{product.price}</Typography>
      </CardContent>

      {/* כפתורי פעולה */}
      <Box sx={{ p: 2, pt: 0, display: 'flex', gap: 1.5 }}>
        <Button 
            variant="contained" fullWidth size="large" onClick={handleAddToCart} disabled={product.stock === 0} startIcon={<AddShoppingCartIcon />}
            sx={{ borderRadius: 50, fontWeight: 'bold', bgcolor: FERRARI_RED, '&:hover': { bgcolor: '#b71c1c' } }}
        >
            {product.stock === 0 ? 'אזל' : 'הוסף לסל'}
        </Button>
        {/* <Button variant="outlined" onClick={(e) => { e.stopPropagation(); navigate(`/product/${product.id}`); }} sx={{ minWidth: 50, borderRadius: 50, borderColor: '#e0e0e0', color: 'text.secondary' }}>
            <VisibilityIcon />
        </Button> */}
      </Box>
    </Card>
  );
};