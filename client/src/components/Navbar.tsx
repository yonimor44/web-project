import React from 'react';
import { AppBar, Toolbar, Typography, Button, IconButton, Badge, Box, Avatar, Menu, MenuItem } from '@mui/material';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext'; // <--- 1. הוספת הייבוא של העגלה
import { useNavigate } from 'react-router-dom';

export const Navbar = () => {
  const { user, logout } = useAuth(); 
  const navigate = useNavigate();
  
  // <--- 2. שליפת כמות הפריטים מהקונטקסט
  // אנחנו משתמשים בזהירות כדי שאם אין קונטקסט (בטעות) זה לא יקרוס
  let totalItems = 0;
  try {
     const cartContext = useCart();
     totalItems = cartContext.totalItems;
  } catch(e) {
     console.log('Cart context not ready yet');
  }
  // -------------------------------------

  // ניהול התפריט הקטן שנפתח בלחיצה על המשתמש
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    handleMenuClose();
    logout();
    navigate('/'); // מומלץ להחזיר לדף הבית אחרי התנתקות
  };

  return (
    <AppBar position="static" sx={{ backgroundColor: '#000000' }}> {/* צבע שחור יוקרתי לרכבים */}
      <Toolbar>
        {/* לוגו ואייקון */}
        <DirectionsCarIcon sx={{ display: { xs: 'none', md: 'flex' }, mr: 1, color: '#e74c3c' }} />
        <Typography
          variant="h6"
          noWrap
          component="div"
          sx={{ flexGrow: 1, cursor: 'pointer', fontWeight: 'bold' }}
          onClick={() => navigate('/')}
        >
          Jhoni shop 🏎️
        </Typography>

        {/* אזור המשתמש */}
        {user ? (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            {/* כפתור עגלה */}
            <IconButton color="inherit" onClick={() => navigate('/cart')}>
              {/* <--- 3. החיבור למספר האמיתי */}
              <Badge badgeContent={totalItems} color="error"> 
                <ShoppingCartIcon />
              </Badge>
            </IconButton>

            {/* שם משתמש ותמונה */}
            <Box sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }} onClick={handleMenuOpen}>
              <Typography variant="subtitle1" sx={{ marginRight: 1, display: { xs: 'none', sm: 'block' } }}>
                שלום, {user.firstName}
              </Typography>
             <Avatar src={user.picture} alt={user.firstName} sx={{ bgcolor: '#e74c3c' }}>
                {/* Fallback: אם אין תמונה, מציגים את האות הראשונה */}
                {!user.picture && user.firstName?.charAt(0).toUpperCase()}
              </Avatar>
            </Box>

            {/* תפריט נפתח */}
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
            >
              <MenuItem onClick={handleLogout}>התנתק</MenuItem>
            </Menu>
          </Box>
        ) : (
          /* כפתור התחברות לאורחים */
          <Button color="inherit" onClick={() => navigate('/login')} sx={{ fontWeight: 'bold' }}>
            התחברות / הרשמה
          </Button>
        )}
      </Toolbar>
    </AppBar>
  );
};