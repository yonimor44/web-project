import { useState, useEffect } from 'react'; // ייבוא מפורש של טיפוסים
import { Container, Paper, Typography, TextField, Button, Box, Divider, Alert, CircularProgress, Grid } from '@mui/material';
import { useCart } from '../context/CartContext';
import { ordersService  } from '../services/orders.service';
import { useNavigate } from 'react-router-dom';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import type { ChangeEvent, FormEvent } from 'react';
import type { CreateOrderDto } from '../services/orders.service';

export const CheckoutPage = () => {
  // שימוש ב-Typescript כדי לוודא שאנחנו מקבלים מה שאנחנו מצפים
  const { cart, total, clearCart } = useCart(); 
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState<boolean>(false);
  const [success, setSuccess] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  // אתחול הסטייט עם הטיפוס הנכון (ללא zip)
  const [formData, setFormData] = useState<CreateOrderDto>({
    shippingAddress: '',
    city: '',
    phone: ''
  });

  useEffect(() => {
    // אם העגלה ריקה וגם לא סיימנו בהצלחה -> הביתה
    if ((!cart || cart.items.length === 0) && !success) {
      navigate('/cart');
    }
  }, [cart, success, navigate]);

  // טיפול בשינוי שדה עם הגדרת טיפוס מפורשת לאירוע
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFormData({ 
      ...formData, 
      [e.target.name]: e.target.value 
    });
  };

  // טיפול בשליחה
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await ordersService.create(formData);
      
      // בדיקה ש-clearCart אכן קיים לפני שקוראים לו (למניעת קריסה אם הקונטקסט לא טען אותו)
      if (clearCart) {
          await clearCart();
      }
      
      setSuccess(true);
    } catch (err: any) {
      console.error(err);
      setError('אירעה שגיאה בביצוע ההזמנה. נסה שוב.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <Container maxWidth="sm" sx={{ mt: 8, textAlign: 'center' }}>
        <CheckCircleIcon color="success" sx={{ fontSize: 100, mb: 2 }} />
        <Typography variant="h3" gutterBottom>תודה רבה!</Typography>
        <Typography variant="h5" color="text.secondary" paragraph>
          ההזמנה שלך התקבלה בהצלחה.
        </Typography>
        <Button variant="contained" size="large" onClick={() => navigate('/')}>
          חזרה לדף הבית
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom fontWeight="bold">
        קופה ותשלום 🛍️
      </Typography>

      <Grid container spacing={3}>
       <Grid size={{ xs: 12, md: 7 }}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>פרטי משלוח</Typography>
            <Box component="form" onSubmit={handleSubmit}>
              <TextField
                required fullWidth label="כתובת מלאה" name="shippingAddress"
                margin="normal" value={formData.shippingAddress} onChange={handleChange}
              />
              
              {/* שורת העיר (ללא מיקוד) */}
              <TextField
                required fullWidth label="עיר" name="city"
                margin="normal" value={formData.city} onChange={handleChange}
              />

              <TextField
                required fullWidth label="טלפון ליצירת קשר" name="phone"
                margin="normal" value={formData.phone} onChange={handleChange}
              />

              {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}

              <Button 
                type="submit" 
                variant="contained" 
                fullWidth 
                size="large"
                disabled={loading}
                sx={{ mt: 3, height: 50, fontSize: '1.2rem' }}
              >
                {loading ? <CircularProgress size={24} color="inherit" /> : `שלם עכשיו ₪${total}`}
              </Button>
            </Box>
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, md: 7 }}>
          <Paper sx={{ p: 3, bgcolor: '#fafafa' }}>
            <Typography variant="h6" gutterBottom>סיכום הזמנה</Typography>
            <Divider sx={{ mb: 2 }} />
            
            {cart?.items.map((item) => (
              <Box key={item.id} sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="body2">
                  {item.product.name} x {item.quantity}
                </Typography>
                <Typography variant="body2" fontWeight="bold">
                  ₪{Number(item.product.price) * item.quantity}
                </Typography>
              </Box>
            ))}
            
            <Divider sx={{ my: 2 }} />
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="h5" fontWeight="bold">סה"כ לתשלום:</Typography>
              <Typography variant="h5" fontWeight="bold" color="primary">₪{total}</Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};