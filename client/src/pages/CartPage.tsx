import { Container, Typography, Box, List, ListItem, ListItemAvatar, Avatar, ListItemText, IconButton, Divider, Button, Paper, ButtonGroup } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useCart } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';

export const CartPage = () => {
  // שים לב: אנחנו מושכים פה גם את updateQuantity (נצטרך לוודא שהוא קיים בקונטקסט)
  const { cart, removeFromCart, updateQuantity, loading } = useCart();
  const navigate = useNavigate();

  const totalPrice = cart?.items.reduce((sum, item) => sum + (item.product.price * item.quantity), 0) || 0;
// סידור פריטים לפי ID
  const sortedItems = cart?.items  ? [...cart.items].sort((a, b) => a.id - b.id) : [];

  if (loading) {
    return <Typography sx={{ mt: 4, textAlign: 'center' }}>טוען עגלה...</Typography>;
  }

  if (!cart || cart.items.length === 0) {
    return (
      <Container maxWidth="md" sx={{ mt: 8, textAlign: 'center' }}>
        <ShoppingBagIcon sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
        <Typography variant="h5" gutterBottom>העגלה שלך ריקה</Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          נראה שעוד לא בחרת רכבים. זה הזמן להתחיל!
        </Typography>
        <Button variant="contained" onClick={() => navigate('/')}>
          חזרה לחנות
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: 'bold' }}>
        העגלה שלי 🛒
      </Typography>

      <Paper elevation={3} sx={{ borderRadius: 2, overflow: 'hidden' }}>
        <List sx={{ p: 0 }}>
          {sortedItems.map((item) => (
            <Box key={item.id}>
              <ListItem 
                secondaryAction={
                  <IconButton edge="end" aria-label="delete" color="error" onClick={() => removeFromCart(item.product.id)}>
                    <DeleteIcon />
                  </IconButton>
                }
                sx={{ p: 2 }}
              >
                <ListItemAvatar sx={{ mr: 2 }}>
                  <Avatar 
                    variant="rounded" 
                    src={item.product.imageUrl} 
                    sx={{ width: 80, height: 80 }}
                  />
                </ListItemAvatar>
                
                <ListItemText
                  primary={
                    <Typography variant="h6">
                      {item.product.carMake} {item.product.name}
                    </Typography>
                  }
                  secondary={
                    <Box component="span" sx={{ display: 'flex', flexDirection: 'column', mt: 1 }}>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        קנה מידה: {item.product.scale}
                      </Typography>
                      
                      {/* --- אזור כפתורי הכמות החדשים --- */}
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <ButtonGroup size="small" variant="outlined">
                          <Button 
                            onClick={() => {
                                // מונע ירידה מתחת ל-1 (בשביל זה יש כפתור מחיקה בצד)
                                if (item.quantity > 1) updateQuantity?.(item.product.id, item.quantity - 1);
                            }}
                            disabled={item.quantity <= 1}
                          >
                            <RemoveIcon fontSize="small" />
                          </Button>
                          
                          {/* הצגת הכמות הנוכחית */}
                          <Button disabled sx={{ color: 'black !important', fontWeight: 'bold' }}>
                            {item.quantity}
                          </Button>
                          
                          <Button 
                            onClick={() => updateQuantity?.(item.product.id, item.quantity + 1)}
                          >
                            <AddIcon fontSize="small" />
                          </Button>
                        </ButtonGroup>

                        <Typography variant="h6" color="primary" sx={{ fontWeight: 'bold', ml: 'auto' }}>
                          ₪{(item.product.price * item.quantity).toLocaleString()}
                        </Typography>
                      </Box>
                      {/* -------------------------------- */}
                    </Box>
                  }
                />
              </ListItem>
              <Divider />
            </Box>
          ))}
        </List>

        <Box sx={{ p: 3, bgcolor: '#f9f9f9' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="h6">סה"כ לתשלום:</Typography>
            <Typography variant="h5" color="primary" sx={{ fontWeight: 'bold' }}>
              ₪{totalPrice.toLocaleString()}
            </Typography>
          </Box>
          
          <Button 
            variant="contained" 
            size="large" 
            fullWidth 
            onClick={() => navigate('/checkout')}
            sx={{ py: 1.5, fontSize: '1.1rem' }}
          >
            לקופה
          </Button>
        </Box>
      </Paper>
      
      <Button 
        startIcon={<ArrowBackIcon />} 
        onClick={() => navigate('/')} 
        sx={{ mt: 3 }}
      >
        המשך בקניות
      </Button>
    </Container>
  );
};