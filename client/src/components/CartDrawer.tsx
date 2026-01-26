import { 
    Box, Typography, Drawer, List, ListItem, ListItemText, 
    ListItemAvatar, Avatar, IconButton, Button, Divider, Paper 
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import CloseIcon from '@mui/icons-material/Close';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import { useCart } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';

const FERRARI_RED = '#d32f2f';

export const CartDrawer = () => {
    const { cart, removeFromCart, updateQuantity, total, isCartOpen, setIsCartOpen } = useCart();
    const navigate = useNavigate();

    const handleClose = () => setIsCartOpen(false);
    const handleGoToCart = () => { handleClose(); navigate('/cart'); };
    const sortedItems = cart?.items ? [...cart.items].sort((a, b) => a.id - b.id) : [];

    return (
        <Drawer 
            anchor="right" open={isCartOpen} onClose={handleClose}
            PaperProps={{
                sx: { 
                    height: 'calc(100% - 32px)', top: 16, right: 16,
                    width: { xs: 'calc(100% - 32px)', sm: 380 }, 
                    borderRadius: 6, boxShadow: '-10px 0 30px rgba(0,0,0,0.1)',
                    display: 'flex', flexDirection: 'column', overflow: 'hidden'
                }
            }}
            slotProps={{ backdrop: { sx: { backgroundColor: 'rgba(0,0,0,0.2)' } } }}
        >
            {/* Header */}
            <Box sx={{ p: 3, pb: 2, flexShrink: 0, bgcolor: 'white', zIndex: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="h5" fontWeight="800" sx={{ letterSpacing: '-0.5px' }}>הסל שלי 🛍️</Typography>
                    <IconButton onClick={handleClose} sx={{ bgcolor: '#f5f5f5', '&:hover': { bgcolor: '#ffebee', color: FERRARI_RED } }}><CloseIcon /></IconButton>
                </Box>
                <Divider sx={{ mt: 2 }} />
            </Box>

            {/* Items */}
            <Box sx={{ flexGrow: 1, overflowY: 'auto', px: 3, '&::-webkit-scrollbar': { width: '6px' }, '&::-webkit-scrollbar-thumb': { backgroundColor: '#e0e0e0', borderRadius: '10px' } }}>
                {!cart || cart.items.length === 0 ? (
                    <Box sx={{ textAlign: 'center', mt: 10, opacity: 0.7 }}>
                        <ShoppingBagIcon sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
                        <Typography variant="body1" fontWeight="bold">העגלה שלך ריקה</Typography>
                    </Box>
                ) : (
                    <List disablePadding>
                        {sortedItems.map((item) => (
                            <Paper key={item.id} elevation={0} sx={{ mb: 2, p: 2, borderRadius: 4, border: '1px solid #f0f0f0', '&:hover': { borderColor: FERRARI_RED, boxShadow: '0 4px 12px rgba(211, 47, 47, 0.05)' } }}>
                                <ListItem disablePadding alignItems="flex-start">
                                    <ListItemAvatar>
                                        <Avatar src={item.product.imageUrl} variant="rounded" sx={{ width: 70, height: 70, mr: 2, bgcolor: 'transparent', objectFit: 'contain' }} />
                                    </ListItemAvatar>
                                    <ListItemText
                                        primary={<Typography variant="subtitle1" fontWeight="bold" sx={{ lineHeight: 1.2, mb: 0.5 }}>{item.product.carMake} {item.product.name}</Typography>}
                                        secondary={
                                            <Box>
                                                <Typography variant="body2" sx={{ color: FERRARI_RED, fontWeight: 'bold', mb: 1 }}>₪{Number(item.product.price).toFixed(2)}</Typography>
                                                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', bgcolor: '#f5f5f5', borderRadius: 50, px: 1 }}>
                                                        <IconButton size="small" onClick={() => updateQuantity(item.product.id, item.quantity - 1)} disabled={item.quantity <= 1}><RemoveIcon fontSize="small" /></IconButton>
                                                        <Typography sx={{ mx: 1.5, fontSize: '0.9rem', fontWeight: 'bold' }}>{item.quantity}</Typography>
                                                        <IconButton size="small" onClick={() => updateQuantity(item.product.id, item.quantity + 1)} disabled={item.quantity >= item.product.stock}><AddIcon fontSize="small" /></IconButton>
                                                    </Box>
                                                    <IconButton size="small" sx={{ color: '#e0e0e0', '&:hover': { color: FERRARI_RED } }} onClick={() => removeFromCart(item.product.id)}><DeleteIcon fontSize="small" /></IconButton>
                                                </Box>
                                            </Box>
                                        }
                                    />
                                </ListItem>
                            </Paper>
                        ))}
                    </List>
                )}
            </Box>

            {/* Footer */}
            {cart && cart.items.length > 0 && (
                <Box sx={{ p: 3, pt: 2, borderTop: '1px solid #f0f0f0', flexShrink: 0, bgcolor: 'white', zIndex: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                        <Typography variant="h6" fontWeight="bold">סה"כ לתשלום:</Typography>
                        <Typography variant="h5" sx={{ color: FERRARI_RED, fontWeight: '800' }}>₪{total.toLocaleString()}</Typography>
                    </Box>
                    <Button 
                        variant="contained" fullWidth size="large" onClick={handleGoToCart} 
                        sx={{ borderRadius: 50, py: 1.5, fontSize: '1.1rem', fontWeight: 'bold', textTransform: 'none', bgcolor: FERRARI_RED, '&:hover': { bgcolor: '#b71c1c', boxShadow: '0 8px 20px rgba(211, 47, 47, 0.3)' } }}
                    >
                        צפייה בסל וסיכום הזמנה
                    </Button>
                </Box>
            )}
        </Drawer>
    );
};