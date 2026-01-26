import { useEffect, useState } from 'react';
import { Container, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip, Box, CircularProgress, Button, Collapse, IconButton } from '@mui/material';
import { ordersService } from '../services/orders.service';
import { useNavigate } from 'react-router-dom';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

const FERRARI_RED = '#d32f2f';

const getStatusColor = (status: string) => {
    const s = status ? status.toLowerCase() : '';
    switch(s) {
        case 'pending': return 'warning';
        case 'processing': return 'info';
        case 'shipped': return 'primary';
        case 'delivered': return 'success';
        case 'cancelled': return 'error';
        default: return 'default';
    }
};

const OrderRow = ({ order }: { order: any }) => {
  const [open, setOpen] = useState(false);
  const statusToShow = order.status || 'Pending';

  return (
    <>
      <TableRow onClick={() => setOpen(!open)} sx={{ '& > *': { borderBottom: 'unset' }, cursor: 'pointer', transition: 'all 0.2s', '&:hover': { bgcolor: '#fff5f5' } }}>
        <TableCell>
            <IconButton size="small" onClick={() => setOpen(!open)} sx={{ bgcolor: open ? FERRARI_RED : '#f5f5f5', color: open ? 'white' : 'inherit', '&:hover': { bgcolor: open ? '#b71c1c' : '#e0e0e0' } }}>
                {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
            </IconButton>
        </TableCell>
        <TableCell component="th" scope="row" sx={{ fontWeight: 'bold' }}>#{order.id}</TableCell>
        <TableCell>{new Date(order.createdAt).toLocaleDateString('he-IL')}</TableCell>
        <TableCell><Chip label={statusToShow} color={getStatusColor(statusToShow) as any} size="small" sx={{ fontWeight: 'bold', borderRadius: 2 }} /></TableCell>
        <TableCell sx={{ fontWeight: '900', color: FERRARI_RED, fontSize: '1.1rem' }}>₪{Number(order.totalAmount).toLocaleString()}</TableCell>
      </TableRow>
      
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box sx={{ margin: 2, ml: 4 }}> 
                <Paper elevation={0} sx={{ p: 3, borderRadius: 4, bgcolor: '#f8f9fa', border: '1px solid #e0e0e0' }}>
                  <Typography variant="h6" gutterBottom sx={{ fontSize: '1rem', fontWeight: 'bold', color: FERRARI_RED }}>פירוט הזמנה</Typography>
                  <Table size="small">
                    <TableHead>
                      <TableRow><TableCell>מוצר</TableCell><TableCell>כמות</TableCell><TableCell align="right">מחיר</TableCell><TableCell align="right">סה"כ</TableCell></TableRow>
                    </TableHead>
                    <TableBody>
                      {order.items.map((item: any) => (
                        <TableRow key={item.id}>
                          <TableCell component="th" scope="row"><Typography variant="body2" fontWeight="bold">{item.product.carMake} {item.product.name}</Typography></TableCell>
                          <TableCell>{item.quantity}</TableCell>
                          <TableCell align="right">₪{Number(item.price).toLocaleString()}</TableCell>
                          <TableCell align="right" sx={{ fontWeight: 'bold', color: FERRARI_RED }}>₪{(Number(item.price) * item.quantity).toLocaleString()}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  <Box sx={{ mt: 3, pt: 2, borderTop: '1px dashed #bdbdbd' }}>
                      <Typography variant="subtitle2" fontWeight="bold">כתובת למשלוח:</Typography>
                      <Typography variant="body2">{order.shippingAddress || order.address}, {order.city} | טלפון: {order.phone}</Typography>
                  </Box>
                </Paper>
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  );
};

export const MyOrdersPage = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const data = await ordersService.getMyOrders();
        setOrders(data.sort((a: any, b: any) => b.id - a.id));
      } catch (error) { console.error(error); } finally { setLoading(false); }
    };
    fetchOrders();
  }, []);

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}><CircularProgress sx={{ color: FERRARI_RED }} /></Box>;

  return (
    <Container maxWidth="lg" sx={{ mt: 6, mb: 6, position: 'relative' }}>
      <Button 
        startIcon={<ArrowForwardIcon />} onClick={() => navigate('/')} 
        sx={{ position: 'absolute', top: 0, left: 0, borderRadius: 20, color: 'text.secondary', '&:hover': { color: FERRARI_RED, bgcolor: 'transparent' } }}
      >
        חזרה לחנות
      </Button>

      <Typography variant="h3" gutterBottom fontWeight="800" align="center" sx={{ mb: 4, letterSpacing: '-1px' }}>ההזמנות שלי 📦</Typography>

      {orders.length === 0 ? (
          <Paper elevation={0} sx={{ p: 5, textAlign: 'center', borderRadius: 6, bgcolor: '#f5f5f5' }}>
              <ReceiptLongIcon sx={{ fontSize: 80, color: 'text.secondary', mb: 2, opacity: 0.3 }} />
              <Typography variant="h5" fontWeight="bold">אין הזמנות עדיין</Typography>
              <Button variant="contained" onClick={() => navigate('/')} sx={{ mt: 3, borderRadius: 50, bgcolor: FERRARI_RED, fontWeight: 'bold', '&:hover': { bgcolor: '#b71c1c' } }}>התחל לקנות</Button>
          </Paper>
      ) : (
          <TableContainer component={Paper} elevation={0} sx={{ borderRadius: 4, border: '1px solid #e0e0e0', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
            <Table>
              <TableHead sx={{ bgcolor: '#f8f9fa' }}>
                <TableRow>
                  <TableCell width="50px" />
                  <TableCell sx={{ fontWeight: 'bold' }}>הזמנה</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>תאריך</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>סטטוס</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>סה"כ</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {orders.map((order) => <OrderRow key={order.id} order={order} />)}
              </TableBody>
            </Table>
          </TableContainer>
      )}
    </Container>
  );
};