import { useEffect, useState } from 'react';
import { Container, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip, Box, CircularProgress, Button, Collapse } from '@mui/material';
import { ordersService } from '../services/orders.service';
import { useNavigate } from 'react-router-dom';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';

// קומפוננטה לשורה בודדת
const OrderRow = ({ order }: { order: any }) => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <TableRow 
        // 1. הופכים את כל השורה ללחיצה
        onClick={() => setOpen(!open)}
        sx={{ 
            '& > *': { borderBottom: 'unset' }, 
            cursor: 'pointer', // סמן של יד
            transition: 'background-color 0.2s',
            '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.04)' } // אפקט מעבר עכבר
        }}
      >
        <TableCell>
            {/* הורדתי את ה-onClick מהכפתור כדי שלא יתנגש, הוא רק ויזואלי עכשיו */}
            <Button size="small" sx={{ pointerEvents: 'none' }}>
                {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
            </Button>
        </TableCell>
        <TableCell component="th" scope="row">
          {order.id}
        </TableCell>
        <TableCell>{new Date(order.orderDate).toLocaleDateString('he-IL')}</TableCell>
        <TableCell>
            <Chip 
                label={order.status} 
                color={order.status === 'pending' ? 'warning' : order.status === 'delivered' ? 'success' : 'default'} 
                size="small" 
            />
        </TableCell>
        <TableCell>₪{order.totalAmount}</TableCell>
      </TableRow>
      
      {/* --- החלק שנפתח (נשאר אותו דבר) --- */}
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box sx={{ margin: 1 }}>
              <Typography variant="h6" gutterBottom component="div">
                פירוט הזמנה
              </Typography>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>מוצר</TableCell>
                    <TableCell>כמות</TableCell>
                    <TableCell align="right">מחיר ליחידה</TableCell>
                    <TableCell align="right">סה"כ</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {order.items.map((item: any) => (
                    <TableRow key={item.id}>
                      <TableCell>{item.product.name}</TableCell>
                      <TableCell>{item.quantity}</TableCell>
                      <TableCell align="right">₪{item.price}</TableCell>
                      <TableCell align="right">
                        ₪{Number(item.price) * item.quantity}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <Box sx={{ mt: 2 }}>
                  <Typography variant="body2" fontWeight="bold">כתובת למשלוח:</Typography>
                  <Typography variant="body2">{order.shippingAddress}, {order.city}</Typography>
                  <Typography variant="body2">טלפון: {order.phone}</Typography>
              </Box>
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
        setOrders(data);
      } catch (error) {
        console.error('Failed to load orders', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>;

  if (orders.length === 0) {
    return (
        <Container sx={{ textAlign: 'center', mt: 8 }}>
            <Typography variant="h5" gutterBottom>אין לך עדיין הזמנות</Typography>
            <Button variant="contained" onClick={() => navigate('/')}>התחל לקנות</Button>
        </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom fontWeight="bold">
        ההזמנות שלי 📦
      </Typography>
      
      <TableContainer component={Paper}>
        <Table aria-label="collapsible table">
          <TableHead>
            <TableRow>
              <TableCell />
              <TableCell>מספר הזמנה</TableCell>
              <TableCell>תאריך</TableCell>
              <TableCell>סטטוס</TableCell>
              <TableCell>סכום כולל</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {orders.map((order) => (
              <OrderRow key={order.id} order={order} />
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Container>
  );
};