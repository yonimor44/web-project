// מודל אישור הוספה לעגלה.
// נותן פידבק ויזואלי ברור ומאפשר בחירה בין מעבר לתשלום להמשך קניות.

import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography, Box, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import { useCart } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';

export const CartSuccessModal = () => {
    const { isSuccessModalOpen, setIsSuccessModalOpen, lastAddedItem } = useCart();
    const navigate = useNavigate();

    const handleClose = () => setIsSuccessModalOpen(false);
    const handleGoToCart = () => { handleClose(); navigate('/cart'); };

    if (!lastAddedItem) return null;

    return (
        <Dialog 
            open={isSuccessModalOpen} onClose={handleClose}
            maxWidth="xs" fullWidth
            PaperProps={{ sx: { borderRadius: 3, p: 1 } }}
        >
            <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                <IconButton onClick={handleClose} size="small"><CloseIcon /></IconButton>
            </Box>
            
            <Box sx={{ textAlign: 'center', mt: -2 }}>
                <CheckCircleIcon color="success" sx={{ fontSize: 60, mb: 1 }} />
                <DialogTitle sx={{ p: 0, fontWeight: 'bold' }}>המוצר נוסף לעגלה!</DialogTitle>
            </Box>

            <DialogContent sx={{ textAlign: 'center', py: 3 }}>
                <Box component="img" src={lastAddedItem.imageUrl} alt={lastAddedItem.name} sx={{ width: 100, height: 70, objectFit: 'contain', mb: 2 }} />
                <Typography variant="h6" fontWeight="bold">{lastAddedItem.carMake} {lastAddedItem.name}</Typography>
                <Typography variant="body1" color="text.secondary">₪{Number(lastAddedItem.price).toFixed(2)}</Typography>
            </DialogContent>

            <DialogActions sx={{ flexDirection: 'column', gap: 1, px: 3, pb: 3 }}>
                <Button variant="contained" fullWidth size="large" onClick={handleGoToCart} startIcon={<ShoppingCartIcon />}>
                    עבור לעגלת הקניות
                </Button>
                <Button variant="outlined" color="inherit" fullWidth size="large" onClick={handleClose} sx={{ ml: '0 !important' }}>
                    המשך בקניות
                </Button>
            </DialogActions>
        </Dialog>
    );
};