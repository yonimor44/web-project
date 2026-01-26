import React from 'react';
import { AppBar, Toolbar, Typography, Button, IconButton, Badge, Box, Avatar, Menu, MenuItem, Divider, ListItemIcon, useScrollTrigger } from '@mui/material';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import HomeIcon from '@mui/icons-material/Home';
import LogoutIcon from '@mui/icons-material/Logout';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import LoginIcon from '@mui/icons-material/Login';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useNavigate, useLocation } from 'react-router-dom'; // הוספנו useLocation

import logoRed from './logo-red.png'; 

const FERRARI_RED = '#d32f2f';
const TEXT_DARK = '#1a1a1a';

export const Navbar = () => {
  const { user, logout } = useAuth(); 
  const navigate = useNavigate();
  const location = useLocation(); // הוק לזיהוי העמוד הנוכחי
  const { totalItems, setIsCartOpen } = useCart(); 
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  const trigger = useScrollTrigger({ disableHysteresis: true, threshold: 10 });

  // בדיקה האם אנחנו בדף התחברות או הרשמה
  const isAuthPage = location.pathname === '/login' || location.pathname === '/register';

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

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
    <AppBar 
      position="sticky" 
      elevation={trigger ? 4 : 0} 
      sx={{ 
        backgroundColor: 'rgba(255, 255, 255, 0.9)', 
        backdropFilter: 'blur(10px)', 
        borderBottom: trigger ? 'none' : '1px solid rgba(0,0,0,0.05)',
        color: TEXT_DARK,
        transition: 'all 0.3s ease'
      }}
    >
      <Toolbar sx={{ py: 1 }}> 
        
        <Box 
            component="img"
            src={logoRed} 
            alt="Yoni's Models"
            sx={{ 
                height: { xs: 40, md: 50 }, 
                cursor: 'pointer',
                mr: { xs: 1, md: 2 },
                display: 'block'
            }}
            onClick={() => navigate('/')}
        />

        <Box sx={{ flexGrow: 1 }} /> 

        {user ? (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1, md: 3 } }}>
            {/* ... שאר הקוד של משתמש מחובר נשאר אותו דבר ... */}
             <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 1 }}>
                {user.role === 'admin' && (
                    <Button 
                        color="inherit" 
                        onClick={() => navigate('/admin')}
                        startIcon={<AdminPanelSettingsIcon sx={{ color: FERRARI_RED }} />}
                        sx={{ fontWeight: 'bold', borderRadius: 20, px: 2 }}
                    >
                        ניהול
                    </Button>
                )}
                <Button 
                    color="inherit" 
                    onClick={() => navigate('/my-orders')}
                    startIcon={<ReceiptLongIcon />}
                    sx={{ borderRadius: 20, px: 2 }}
                >
                    הזמנות
                </Button>
            </Box>

            <IconButton 
                onClick={() => setIsCartOpen(true)}
                sx={{ color: TEXT_DARK, '&:hover': { color: FERRARI_RED, bgcolor: 'rgba(211, 47, 47, 0.04)' } }}
            >
              <Badge 
                badgeContent={totalItems} 
                sx={{ 
                    '& .MuiBadge-badge': { 
                        bgcolor: FERRARI_RED, color: 'white', fontWeight: 'bold' 
                    } 
                }}
              > 
                <ShoppingCartIcon />
              </Badge>
            </IconButton>

            <Box 
                sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer', p: 0.5, borderRadius: 50, '&:hover': { bgcolor: 'rgba(0,0,0,0.04)' } }} 
                onClick={handleMenuOpen}
            >
             <Avatar src={user.picture} alt={user.firstName} sx={{ bgcolor: FERRARI_RED, width: 35, height: 35 }}>
                {!user.picture && <PersonOutlineIcon fontSize="small" />}
              </Avatar>
              <Typography variant="subtitle2" sx={{ ml: 1, mr: 0.5, fontWeight: 'bold', display: { xs: 'none', sm: 'block' } }}>
                {user.firstName}
              </Typography>
            </Box>

            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
              onClick={handleMenuClose}
              slotProps={{ 
                  paper: { 
                      elevation: 4,
                      sx: { 
                          width: 220, mt: 1.5, borderRadius: 4, overflow: 'visible',
                          '&:before': {
                              content: '""', display: 'block', position: 'absolute', top: 0, right: 14, width: 10, height: 10, bgcolor: 'background.paper', transform: 'translateY(-50%) rotate(45deg)', zIndex: 0,
                          },
                      } 
                  } 
              }}
              transformOrigin={{ horizontal: 'right', vertical: 'top' }}
              anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            >
              <MenuItem onClick={() => handleNavigate('/')}><ListItemIcon><HomeIcon fontSize="small" /></ListItemIcon>דף הבית</MenuItem>
              {user.role === 'admin' && (<MenuItem onClick={() => handleNavigate('/admin')}><ListItemIcon><AdminPanelSettingsIcon fontSize="small" sx={{ color: FERRARI_RED }} /></ListItemIcon>פאנל ניהול</MenuItem>)}
              <MenuItem onClick={() => handleNavigate('/my-orders')}><ListItemIcon><ReceiptLongIcon fontSize="small" /></ListItemIcon>הזמנות שלי</MenuItem>
              <Divider />
              <MenuItem onClick={handleLogout} sx={{ color: FERRARI_RED, fontWeight: 'bold' }}><ListItemIcon><LogoutIcon fontSize="small" sx={{ color: FERRARI_RED }} /></ListItemIcon>התנתק</MenuItem>
            </Menu>
          </Box>
        ) : (
          // --- כאן השינוי: מציגים את הכפתור רק אם אנחנו *לא* בדף אימות ---
          !isAuthPage && (
              <Button 
                variant="contained"
                onClick={() => navigate('/login')} 
                startIcon={<LoginIcon />}
                sx={{ 
                    fontWeight: 'bold', 
                    borderRadius: 50, 
                    px: 3,
                    bgcolor: FERRARI_RED,
                    boxShadow: '0 4px 12px rgba(211, 47, 47, 0.2)',
                    '&:hover': { bgcolor: '#b71c1c', boxShadow: '0 6px 16px rgba(211, 47, 47, 0.3)' }
                }}
              >
                התחברות / הרשמה
              </Button>
          )
        )}
      </Toolbar>
    </AppBar>
  );
};