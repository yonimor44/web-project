import { useState, useEffect } from 'react';
import { Container, Paper, Typography, TextField, Button, Box, Divider, Alert, CircularProgress, Grid, FormControlLabel, Checkbox } from '@mui/material';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext'; 
import { ordersService } from '../services/orders.service';
import { usersService } from '../services/users.service'; 
import { useNavigate, useLocation } from 'react-router-dom';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import StorefrontIcon from '@mui/icons-material/Storefront';
import EditIcon from '@mui/icons-material/Edit';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import type { ChangeEvent, FormEvent } from 'react';
import type { CreateOrderDto } from '../services/orders.service';

const FERRARI_RED = '#d32f2f';

export const CheckoutPage = () => {
  const { cart, clearCart, fetchCart } = useCart() as any; 
  const { user, refreshUser } = useAuth(); // הוספנו את refreshUser
  const navigate = useNavigate();
  const location = useLocation();
  const { selectedItemIds } = location.state || {};

  const [loading, setLoading] = useState<boolean>(false);
  const [success, setSuccess] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [saveAsDefault, setSaveAsDefault] = useState(false); 

  const [formData, setFormData] = useState<Omit<CreateOrderDto, 'selectedItemIds'>>({ 
      shippingAddress: '', city: '', phone: '' 
  });

  // מילוי אוטומטי
  useEffect(() => {
    if (user) {
        setFormData({
            shippingAddress: user.defaultAddress || '',
            city: user.defaultCity || '',
            phone: user.defaultPhone || ''
        });
    }
  }, [user]);

  const itemsToCheckout = cart?.items 
    ? (selectedItemIds && selectedItemIds.length > 0 
        ? cart.items.filter((item: any) => selectedItemIds.includes(item.id))
        : cart.items)
    : [];

  const checkoutTotal = itemsToCheckout.reduce((sum: number, item: any) => sum + (Number(item.product.price) * item.quantity), 0);

  useEffect(() => {
    if ((!cart || cart.items.length === 0) && !success) { navigate('/cart'); }
  }, [cart, success, navigate]);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // 1. שמירת כתובת כברירת מחדל + רענון גלובלי
      if (saveAsDefault && user) {
          try {
              await usersService.updateProfile({
                  defaultAddress: formData.shippingAddress,
                  defaultCity: formData.city,
                  defaultPhone: formData.phone
              });
              // זה התיקון הקריטי! מעדכן את ה-AuthContext במידע החדש
              if (refreshUser) await refreshUser(); 
          } catch (err) {
              console.error("Failed to update default address", err);
          }
      }

      // 2. ביצוע ההזמנה
      const orderPayload: CreateOrderDto = {
          ...formData,
          selectedItemIds: selectedItemIds || []
      };

      await ordersService.create(orderPayload);
      
      // 3. ניקוי עגלה - סדר הפעולות תוקן
      // קודם כל מנקים את ה-UI מיד!
      if (clearCart && (!selectedItemIds || selectedItemIds.length === 0)) { 
          clearCart(); 
      }
      
      // אחר כך מסנכרנים מול השרת ליתר ביטחון
      if (fetchCart) { 
          await fetchCart(); 
      }
      
      setSuccess(true);
    } catch (err: any) {
      console.error(err);
      setError('אירעה שגיאה בביצוע ההזמנה. נסה שוב.');
    } finally { setLoading(false); }
  };

  if (success) {
    return (
      <Container maxWidth="sm" sx={{ mt: 8, textAlign: 'center' }}>
        <Paper elevation={3} sx={{ p: 6, borderRadius: 8 }}>
            <CheckCircleIcon color="success" sx={{ fontSize: 100, mb: 2 }} />
            <Typography variant="h3" gutterBottom fontWeight="bold">תודה רבה! 🎉</Typography>
            <Typography variant="h5" color="text.secondary" paragraph>ההזמנה שלך התקבלה בהצלחה.</Typography>
            <Button variant="contained" size="large" onClick={() => navigate('/')} sx={{ mt: 3, borderRadius: 50, px: 5, fontWeight: 'bold', bgcolor: FERRARI_RED, '&:hover': { bgcolor: '#b71c1c' } }}>חזרה לדף הבית</Button>
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 6, mb: 6 }}>
      <Box sx={{ mb: 4 }}>
          <Typography variant="h3" gutterBottom fontWeight="800" sx={{ letterSpacing: '-1px' }}>קופה ותשלום 💳</Typography>
      </Box>

      <Grid container spacing={4}>
       <Grid size={{ xs: 12, md: 7 }}>
          <Paper elevation={0} sx={{ p: 4, borderRadius: 4, border: '1px solid #e0e0e0' }}>
            <Typography variant="h5" gutterBottom fontWeight="bold" sx={{ mb: 3 }}>פרטי משלוח</Typography>
            <Box component="form" onSubmit={handleSubmit}>
              <TextField required fullWidth label="כתובת מלאה" name="shippingAddress" margin="normal" value={formData.shippingAddress} onChange={handleChange} sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }} />
              <Grid container spacing={2}>
                  <Grid size={{ xs: 6 }}><TextField required fullWidth label="עיר" name="city" margin="normal" value={formData.city} onChange={handleChange} sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }} /></Grid>
                  <Grid size={{ xs: 6 }}><TextField required fullWidth label="טלפון" name="phone" margin="normal" value={formData.phone} onChange={handleChange} sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }} /></Grid>
              </Grid>

              <FormControlLabel
                control={
                    <Checkbox 
                        checked={saveAsDefault}
                        onChange={(e) => setSaveAsDefault(e.target.checked)}
                        icon={<RadioButtonUncheckedIcon />}
                        checkedIcon={<CheckCircleIcon />}
                        sx={{ color: '#bdbdbd', '&.Mui-checked': { color: FERRARI_RED } }}
                    />
                }
                label="שמור כתובת זו כברירת מחדל להזמנות הבאות"
                sx={{ mt: 2, color: 'text.secondary' }}
              />

              {error && <Alert severity="error" sx={{ mt: 2, borderRadius: 2 }}>{error}</Alert>}
              
              <Button type="submit" variant="contained" fullWidth size="large" disabled={loading} sx={{ mt: 4, height: 55, fontSize: '1.2rem', borderRadius: 50, fontWeight: 'bold', bgcolor: FERRARI_RED, boxShadow: '0 8px 20px rgba(211, 47, 47, 0.25)', '&:hover': { bgcolor: '#b71c1c', boxShadow: '0 12px 25px rgba(211, 47, 47, 0.35)' } }}>
                {loading ? <CircularProgress size={24} color="inherit" /> : `שלם עכשיו ₪${checkoutTotal.toLocaleString()}`}
              </Button>
            </Box>
          </Paper>
          <Box sx={{ mt: 4, display: 'flex', gap: 2, justifyContent: 'center' }}>
              <Button variant="outlined" startIcon={<StorefrontIcon />} onClick={() => navigate('/')} sx={{ borderRadius: 50, px: 3, py: 1, borderColor: '#e0e0e0', color: 'text.secondary', '&:hover': { borderColor: FERRARI_RED, color: FERRARI_RED } }}>הוסף עוד פריטים</Button>
              <Button variant="outlined" startIcon={<ArrowBackIcon />} onClick={() => navigate('/cart')} sx={{ borderRadius: 50, px: 3, py: 1, borderColor: '#e0e0e0', color: 'text.secondary', '&:hover': { borderColor: FERRARI_RED, color: FERRARI_RED } }}>חזור לעגלה</Button>
          </Box>
        </Grid>

        <Grid size={{ xs: 12, md: 5 }}>
          <Paper elevation={4} sx={{ p: 4, borderRadius: 4, bgcolor: '#fafafa', backgroundImage: 'linear-gradient(to bottom right, #ffffff, #f8f9fa)', position: 'sticky', top: 100 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="h5" fontWeight="bold">סיכום הזמנה</Typography>
                <Button startIcon={<EditIcon />} size="small" onClick={() => navigate('/cart')} sx={{ borderRadius: 20, color: 'text.secondary', '&:hover': { color: FERRARI_RED } }}>ערוך</Button>
            </Box>
            <Divider sx={{ mb: 3 }} />
            <Box sx={{ maxHeight: 350, overflowY: 'auto', mb: 2, pr: 1 }}>
                {itemsToCheckout.map((item: any) => (
                  <Box key={item.id} sx={{ display: 'flex', justifyContent: 'space-between', mb: 2, alignItems: 'center' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Box component="img" src={item.product.imageUrl} sx={{ width: 50, height: 50, objectFit: 'contain', mr: 2, borderRadius: 2, bgcolor: 'white', p: 0.5, border: '1px solid #eee' }} />
                        <Box>
                            <Typography variant="body2" fontWeight="bold" component="div">
                                {item.product.carMake} {item.product.name}
                            </Typography>
                            <Typography variant="caption" color="text.secondary" component="div">
                                כמות: {item.quantity}
                            </Typography>
                        </Box>
                    </Box>
                    <Typography variant="body2" fontWeight="bold" color="primary" sx={{ color: FERRARI_RED }}>
                        ₪{(Number(item.product.price) * item.quantity).toLocaleString()}
                    </Typography>
                  </Box>
                ))}
            </Box>
            <Divider sx={{ my: 3 }} />
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h6">סה"כ לתשלום:</Typography>
              <Typography variant="h4" fontWeight="900" sx={{ color: FERRARI_RED }}>₪{checkoutTotal.toLocaleString()}</Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};