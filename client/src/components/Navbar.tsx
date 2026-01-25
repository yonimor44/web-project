import React from 'react';
import { AppBar, Toolbar, Typography, Button, IconButton, Badge, Box, Avatar, Menu, MenuItem, Divider, ListItemIcon } from '@mui/material';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import HomeIcon from '@mui/icons-material/Home'; // <--- אייקון לבית
import LogoutIcon from '@mui/icons-material/Logout'; // <--- אייקון ליציאה
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';

export const Navbar = () => {
  const { user, logout } = useAuth(); 
  const navigate = useNavigate();
  
  let totalItems = 0;
  try {
     const cartContext = useCart();
     totalItems = cartContext.totalItems;
  } catch(e) {
     console.log('Cart context not ready yet');
  }

  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  // פונקציה כללית לניווט וסגירת התפריט
  const handleNavigate = (path: string) => {
      handleMenuClose();
      navigate(path);
  };

  const handleLogout = () => {
    handleMenuClose();
    logout();
    navigate('/'); 
  };
  
  return (
    <AppBar position="static" sx={{ backgroundColor: '#000000' }}>
      <Toolbar>
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

        {user ? (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            
            <Button 
                color="inherit" 
                onClick={() => navigate('/my-orders')}
                startIcon={<ReceiptLongIcon />}
                sx={{ display: { xs: 'none', md: 'flex' } }}
            >
                ההזמנות שלי
            </Button>

            <IconButton color="inherit" onClick={() => navigate('/cart')}>
              <Badge badgeContent={totalItems} color="error"> 
                <ShoppingCartIcon />
              </Badge>
            </IconButton>

            <Box sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }} onClick={handleMenuOpen}>
              <Typography variant="subtitle1" sx={{ marginRight: 1, display: { xs: 'none', sm: 'block' } }}>
                שלום, {user.firstName}
              </Typography>
             <Avatar src={user.picture} alt={user.firstName} sx={{ bgcolor: '#e74c3c' }}>
                {!user.picture && user.firstName?.charAt(0).toUpperCase()}
              </Avatar>
            </Box>

            {/* --- התפריט המשודרג --- */}
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
              slotProps={{ paper: { sx: { width: 200, mt: 1 } } }} // קצת עיצוב
            >
              {/* דף הבית */}
              <MenuItem onClick={() => handleNavigate('/')}>
                  <ListItemIcon><HomeIcon fontSize="small" /></ListItemIcon>
                  דף הבית
              </MenuItem>

              {/* עגלת קניות */}
              <MenuItem onClick={() => handleNavigate('/cart')}>
                  <ListItemIcon>
                      <Badge badgeContent={totalItems} color="error" variant="dot">
                          <ShoppingCartIcon fontSize="small" />
                      </Badge>
                  </ListItemIcon>
                  העגלה שלי
              </MenuItem>

              {/* ההזמנות שלי */}
              <MenuItem onClick={() => handleNavigate('/my-orders')}>
                  <ListItemIcon><ReceiptLongIcon fontSize="small" /></ListItemIcon>
                  ההזמנות שלי
              </MenuItem>
              
              <Divider />
              
              {/* התנתקות */}
              <MenuItem onClick={handleLogout} sx={{ color: 'error.main' }}>
                  <ListItemIcon><LogoutIcon fontSize="small" color="error" /></ListItemIcon>
                  התנתק
              </MenuItem>
            </Menu>
          </Box>
        ) : (
          <Button color="inherit" onClick={() => navigate('/login')} sx={{ fontWeight: 'bold' }}>
            התחברות / הרשמה
          </Button>
        )}
      </Toolbar>
    </AppBar>
  );
};