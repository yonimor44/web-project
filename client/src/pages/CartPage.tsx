import { useState, useEffect } from 'react';
import { 
    Container, Typography, Box, List, ListItem, ListItemAvatar, 
    Avatar, ListItemText, IconButton, Divider, Button, Paper, 
    Checkbox, Tooltip 
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ShoppingCartCheckoutIcon from '@mui/icons-material/ShoppingCartCheckout';
import CheckCircleIcon from '@mui/icons-material/CheckCircle'; // אייקון מסומן עגול
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked'; // אייקון לא מסומן עגול
import { useCart } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';

const FERRARI_RED = '#d32f2f';

export const CartPage = () => {
  const { cart, removeFromCart, updateQuantity, loading } = useCart();
  const navigate = useNavigate();

  const [selectedItems, setSelectedItems] = useState<number[]>([]);

  useEffect(() => {
    if (cart?.items) {
        if (selectedItems.length === 0 && cart.items.length > 0) {
            setSelectedItems(cart.items.map(item => item.id));
        }
    }
  }, [cart]);

  const handleToggle = (itemId: number) => {
    if (selectedItems.includes(itemId)) {
        setSelectedItems(prev => prev.filter(id => id !== itemId));
    } else {
        setSelectedItems(prev => [...prev, itemId]);
    }
  };

  const selectedTotal = cart?.items
    .filter(item => selectedItems.includes(item.id))
    .reduce((sum, item) => sum + (Number(item.product.price) * item.quantity), 0) || 0;

  const selectedCount = selectedItems.length;
  const sortedItems = cart?.items ? [...cart.items].sort((a, b) => a.id - b.id) : [];

  const handleCheckout = () => {
      navigate('/checkout', { state: { selectedItemIds: selectedItems } });
  };

  if (loading) return <Typography sx={{ mt: 4, textAlign: 'center' }}>טוען עגלה...</Typography>;

  if (!cart || cart.items.length === 0) {
    return (
      <Container maxWidth="md" sx={{ mt: 8, textAlign: 'center' }}>
        <Paper elevation={0} sx={{ p: 5, borderRadius: 8, bgcolor: '#f5f5f5' }}>
            <ShoppingBagIcon sx={{ fontSize: 80, color: 'text.secondary', mb: 2, opacity: 0.3 }} />
            <Typography variant="h5" gutterBottom fontWeight="bold">העגלה שלך ריקה</Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
            נראה שעוד לא בחרת רכבים. זה הזמן להתחיל!
            </Typography>
            <Button 
                variant="contained" 
                onClick={() => navigate('/')}
                sx={{ borderRadius: 50, px: 4, fontWeight: 'bold', bgcolor: FERRARI_RED, '&:hover': { bgcolor: '#b71c1c' } }}
            >
            חזרה לחנות
            </Button>
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: '800', letterSpacing: '-0.5px' }}>
        העגלה שלי 🛒
      </Typography>

      <Paper elevation={0} sx={{ borderRadius: 4, overflow: 'hidden', border: '1px solid #e0e0e0', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
        <List sx={{ p: 0 }}>
          {sortedItems.map((item) => {
            const isSelected = selectedItems.includes(item.id);
            return (
            <Box key={item.id} sx={{ bgcolor: isSelected ? 'white' : '#fafafa', transition: '0.3s' }}>
              <ListItem 
                sx={{ p: 2 }}
                secondaryAction={
                  <Tooltip title="הסר מהעגלה">
                      <IconButton edge="end" aria-label="delete" sx={{ color: '#e0e0e0', '&:hover': { color: FERRARI_RED } }} onClick={() => removeFromCart(item.product.id)}>
                        <DeleteIcon />
                      </IconButton>
                  </Tooltip>
                }
              >
                {/* --- צ'ק בוקס עגול ויפה --- */}
                <Checkbox 
                    checked={isSelected}
                    onChange={() => handleToggle(item.id)}
                    icon={<RadioButtonUncheckedIcon />} // עיגול ריק
                    checkedIcon={<CheckCircleIcon />}   // עיגול מלא עם וי
                    sx={{ 
                        mr: 1, 
                        color: '#bdbdbd', 
                        '&.Mui-checked': { color: FERRARI_RED } 
                    }}
                />

                <ListItemAvatar sx={{ mr: 2 }}>
                  <Avatar 
                    variant="rounded" 
                    src={item.product.imageUrl} 
                    sx={{ 
                        width: 90, height: 90, 
                        objectFit: 'contain', 
                        bgcolor: 'transparent',
                        filter: isSelected ? 'none' : 'grayscale(100%) opacity(0.5)', 
                        transition: '0.3s'
                    }} 
                  />
                </ListItemAvatar>
                
                <ListItemText
                  primary={
                    <Typography variant="h6" fontWeight="bold" color={isSelected ? 'text.primary' : 'text.secondary'}>
                      {item.product.carMake} {item.product.name}
                    </Typography>
                  }
                  secondary={
                    <Box component="span" sx={{ display: 'flex', flexDirection: 'column', mt: 1 }}>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        {item.product.scale && `קנה מידה: ${item.product.scale}`}
                      </Typography>
                      
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, opacity: isSelected ? 1 : 0.5 }}>
                        
                        {/* --- כפתורי כמות מעוגלים (קפסולה) --- */}
                        <Box sx={{ 
                            display: 'flex', alignItems: 'center', 
                            bgcolor: '#f5f5f5', 
                            borderRadius: 50, // קפסולה עגולה
                            px: 1, py: 0.5,
                            border: '1px solid #eee'
                        }}>
                            <IconButton 
                                size="small" 
                                onClick={() => { if (item.quantity > 1) updateQuantity(item.product.id, item.quantity - 1); }} 
                                disabled={item.quantity <= 1 || !isSelected}
                                sx={{ width: 28, height: 28 }}
                            >
                                <RemoveIcon fontSize="small" sx={{ fontSize: 16 }} />
                            </IconButton>
                            
                            <Typography sx={{ mx: 1.5, fontWeight: 'bold', fontSize: '0.95rem' }}>
                                {item.quantity}
                            </Typography>
                            
                            <IconButton 
                                size="small" 
                                onClick={() => updateQuantity(item.product.id, item.quantity + 1)} 
                                disabled={item.quantity >= item.product.stock || !isSelected}
                                sx={{ width: 28, height: 28 }}
                            >
                                <AddIcon fontSize="small" sx={{ fontSize: 16 }} />
                            </IconButton>
                        </Box>
                        {/* -------------------------------------- */}

                        <Typography variant="h6" sx={{ fontWeight: 'bold', ml: 'auto', color: FERRARI_RED }}>
                          ₪{(Number(item.product.price) * item.quantity).toLocaleString()}
                        </Typography>
                      </Box>
                    </Box>
                  }
                />
              </ListItem>
              <Divider component="li" />
            </Box>
          )})}
        </List>

        <Box sx={{ p: 4, bgcolor: '#fdfdfd' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="body1" color="text.secondary">פריטים שנבחרו לתשלום:</Typography>
            <Typography variant="body1" fontWeight="bold">{selectedCount}</Typography>
          </Box>
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
            <Typography variant="h5" fontWeight="bold">סה"כ לתשלום:</Typography>
            <Typography variant="h4" sx={{ fontWeight: '900', color: FERRARI_RED }}>
              ₪{selectedTotal.toLocaleString()}
            </Typography>
          </Box>
          
          <Button 
            variant="contained" 
            size="large" 
            fullWidth 
            onClick={handleCheckout}
            disabled={selectedCount === 0}
            startIcon={<ShoppingCartCheckoutIcon />}
            sx={{ 
                py: 1.8, fontSize: '1.2rem', borderRadius: 50, 
                bgcolor: FERRARI_RED, boxShadow: '0 8px 16px rgba(211, 47, 47, 0.24)',
                '&:hover': { bgcolor: '#b71c1c', boxShadow: '0 12px 20px rgba(211, 47, 47, 0.3)' }
            }}
          >
            {selectedCount === 0 ? 'בחר פריטים לתשלום' : 'מעבר לקופה'}
          </Button>
        </Box>
      </Paper>
      
      <Button 
        startIcon={<ArrowBackIcon />} 
        onClick={() => navigate('/')} 
        sx={{ mt: 3, borderRadius: 50, px: 3, color: 'text.secondary', '&:hover': { color: FERRARI_RED, bgcolor: 'transparent' } }}
      >
        המשך בקניות
      </Button>
    </Container>
  );
};