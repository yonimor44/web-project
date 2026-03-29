// דף הניהול המרכזי של האפליקציה (Dashboard).
// מבנה הדף:
// - כותרת ראשית
// - סרגל טאבים (Tabs) למעבר בין הקטגוריות השונות.
// - טבלאות נתונים דינמיות בהתאם לטאב שנבחר.
// - מודל (Dialog) משוכלל ליצירה ועריכה של מוצרים (כולל העלאת קבצים).

import { useEffect, useState, useMemo } from 'react';
import { 
    Container, Typography, Paper, Table, TableBody, TableCell, 
    TableContainer, TableHead, TableRow, IconButton, Button, Box, Chip, 
    CircularProgress, Dialog, DialogTitle, DialogContent, DialogActions, 
    TextField, Grid, Autocomplete, Tabs, Tab, MenuItem, Select, FormControl, Avatar, Fade 
} from '@mui/material';

import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import InventoryIcon from '@mui/icons-material/Inventory';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';
import PeopleIcon from '@mui/icons-material/People';
import DashboardIcon from '@mui/icons-material/Dashboard';
import CloudUploadIcon from '@mui/icons-material/CloudUpload'; 
import { productsService } from '../services/products.service'; 
import { ordersService } from '../services/orders.service';
import { usersService } from '../services/users.service';
import type { Product } from '../types/product.types';
import type { ProductInput } from '../services/products.service'; 
import type { User } from '../types/auth.types';

const FERRARI_RED = '#d32f2f';

// --- קבועים ורשימות סטטיות ---
// משמשים לאכלוס ה-Dropdowns בטבלאות ובטפסים
const ORDER_STATUSES = ['pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];
const USER_ROLES = ['user', 'admin'];

// רשימות ברירת מחדל להשלמה אוטומטית (Autocomplete) בטופס המוצר.
// אלו הערכים ההתחלתיים, אך המשתמש יוכל להוסיף ערכים חדשים משלו (Free Solo).
const DEFAULT_CATEGORIES = ['Classic', 'Muscle', 'Sports', 'Luxury', 'SUV'];
const DEFAULT_BRANDS = ['Burago', 'Maisto', 'AutoArt', 'Hot Wheels', 'Tamiya'];
const DEFAULT_MAKES = ['Ferrari', 'Lamborghini', 'Ford', 'Porsche', 'Mazda', 'Chevrolet', 'BMW', 'Mercedes'];
const DEFAULT_SCALES = ['1:18', '1:24', '1:43', '1:64'];

// מצב התחלתי ריק לטופס יצירת מוצר
const INITIAL_FORM_STATE: ProductInput = {
    name: '', description: '', price: 0, stock: 0, category: '',
    imageUrl: '', brand: '', carMake: '', scale: '', color: ''
};

// פונקציית עזר ויזואלית: מחזירה את הצבע המתאים לכל סטטוס הזמנה
// משמשת לצביעת ה-Chip בטבלת ההזמנות.
const getStatusColor = (status: string): 'primary' | 'error' | 'info' | 'success' | 'warning' => {
    switch(status) {
        case 'pending': return 'warning';  
        case 'Processing': return 'info';   
        case 'Shipped': return 'primary';   
        case 'Delivered': return 'success';
        case 'Cancelled': return 'error';  
        default: return 'primary'; 
    }
};

export const AdminPage = () => {
  // --- ניהול State כללי ---
  
  // איזה טאב פעיל כרגע? (0 = מוצרים, 1 = הזמנות, 2 = משתמשים)
  const [currentTab, setCurrentTab] = useState(0);
  
  // מחסני הנתונים (Data Stores) שמתמלאים מהשרת
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<any[]>([]); 
  const [users, setUsers] = useState<User[]>([]);
  
  // אינדיקטור לטעינת נתונים (מציג ספינר כשהוא true)
  const [loading, setLoading] = useState(false);

  // --- ניהול State של מודל המוצרים (Dialog) ---
  const [openDialog, setOpenDialog] = useState(false);       // האם המודל פתוח?
  const [editMode, setEditMode] = useState(false);           // האם אנחנו במצב עריכה או יצירה?
  const [currentProductId, setCurrentProductId] = useState<number | null>(null); // ה-ID של המוצר הנערך
  
  // הנתונים בתוך הטופס
  const [formData, setFormData] = useState<ProductInput>(INITIAL_FORM_STATE);
  
  // הקובץ שנבחר להעלאה (אם המשתמש בחר להעלות תמונה חדשה)
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // --- Data Fetching ---
  // בכל פעם שהמשתמש מחליף טאב (currentTab משתנה), אנו טוענים את הנתונים הרלוונטיים
  useEffect(() => { loadData(); }, [currentTab]);

  const loadData = async () => {
      setLoading(true);
      try {
          // לוגיקה מותנית לחיסכון במשאבים: טוענים רק מה שצריך
          if (currentTab === 0) setProducts(await productsService.getAll());
          else if (currentTab === 1) setOrders(await ordersService.getAllOrders());
          else if (currentTab === 2) setUsers(await usersService.getAllUsers());
      } catch (error) { 
          console.error('Failed to load data', error); 
          alert('שגיאה בטעינת הנתונים מהשרת');
      } finally { 
          setLoading(false); 
      }
  };

  // --- לוגיקה לטאב הזמנות ---
  // מעדכן סטטוס הזמנה מול השרת ומשקף את השינוי בטבלה המקומית
  const handleOrderStatusChange = async (orderId: number, newStatus: string) => {
      try {
          await ordersService.updateStatus(orderId, newStatus);
          // עדכון אופטימיסטי של ה-State המקומי למניעת טעינה מחדש
          setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
      } catch (error) { alert('שגיאה בעדכון סטטוס'); }
  };

  // --- לוגיקה לטאב משתמשים ---
  // מאפשר להפוך משתמש לאדמין או להחזיר אותו להיות יוזר רגיל
  const handleUserRoleChange = async (userId: number, newRole: string) => {
      if (!window.confirm(`האם אתה בטוח שברצונך לשנות את התפקיד ל-${newRole}?`)) return;
      try {
          await usersService.updateRole(userId, newRole);
          setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole as any } : u));
      } catch (error) { alert('שגיאה בעדכון תפקיד'); }
  };

  // --- לוגיקה חכמה להשלמה אוטומטית (Autocomplete) ---
  // פונקציה זו סורקת את כל המוצרים הקיימים ומוציאה רשימה ייחודית של ערכים (כמו כל היצרנים הקיימים).
  // זה עוזר למנהל לבחור ערך קיים במקום להקליד מחדש ולטעות.
  const getUniqueOptions = (defaultList: string[], key: keyof Product) => {
      const existingValues = products.map(p => p[key] as string).filter(Boolean);
      // יצירת Set לסינון כפילויות ומיון אלפביתי
      return Array.from(new Set([...defaultList, ...existingValues])).sort();
  };

  // שימוש ב-useMemo כדי לא לחשב את הרשימות מחדש בכל רינדור קטן (שיפור ביצועים)
  const dynamicCategories = useMemo(() => getUniqueOptions(DEFAULT_CATEGORIES, 'category'), [products]);
  const dynamicBrands = useMemo(() => getUniqueOptions(DEFAULT_BRANDS, 'brand'), [products]);
  const dynamicMakes = useMemo(() => getUniqueOptions(DEFAULT_MAKES, 'carMake'), [products]);
  const dynamicScales = useMemo(() => getUniqueOptions(DEFAULT_SCALES, 'scale'), [products]);

  // --- פונקציות ניהול דיאלוג (Modal) ---

  // פתיחת המודל במצב "יצירה" (איפוס שדות)
  const handleOpenAdd = () => { 
      setEditMode(false); 
      setFormData(INITIAL_FORM_STATE); 
      setSelectedFile(null);
      setOpenDialog(true); 
  };
  
  // פתיחת המודל במצב "עריכה" (מילוי שדות בנתוני המוצר הנבחר)
  const handleOpenEdit = (product: Product) => {
      setEditMode(true); 
      setCurrentProductId(product.id);
      setSelectedFile(null); // איפוס קובץ (כי אולי המשתמש לא רוצה לשנות תמונה)
      
      // מיפוי הנתונים מהמוצר לטופס
      setFormData({
          name: product.name, description: product.description, price: Number(product.price),
          stock: product.stock, category: product.category, imageUrl: product.imageUrl,
          brand: product.brand || '', carMake: product.carMake || '', scale: product.scale || '', color: product.color || ''
      });
      setOpenDialog(true);
  };

  const handleCloseDialog = () => setOpenDialog(false);

  // --- Handlers לטופס ---

  // טיפול בשינוי שדות טקסט רגילים
  const handleChange = (e: any) => {
      const { name, value } = e.target;
      // המרה למספר אם מדובר במחיר או מלאי, אחרת השארת טקסט
      setFormData(prev => ({ ...prev, [name]: (name === 'price' || name === 'stock') ? Number(value) : value }));
  };

  // טיפול בשינוי שדות Autocomplete
  const handleAutocompleteChange = (name: any, value: any) => {
      setFormData(prev => ({ ...prev, [name]: value || '' }));
  };

  // --- פונקציית שמירה ראשית (Create / Update) ---
  const handleSave = async () => {
      try {
          // יצירת אובייקט FormData.
          // זה הכרחי כי אנחנו תומכים בהעלאת קבצים (תמונות), ו-JSON רגיל לא תומך בזה.
          const data = new FormData();
          
          // הוספת כל השדות הטקסטואליים ל-FormData
          data.append('name', formData.name);
          data.append('price', String(formData.price));
          data.append('stock', String(formData.stock));
          data.append('description', formData.description);
          data.append('category', formData.category || '');
          data.append('brand', formData.brand || '');
          data.append('carMake', formData.carMake || '');
          data.append('scale', formData.scale || '');
          data.append('color', formData.color || '');
          
          // לוגיקת תמונה:
          if (selectedFile) {
              // אם המשתמש בחר קובץ חדש מהמחשב - שולחים אותו
              data.append('file', selectedFile);
          } else {
              // אם לא נבחר קובץ, שולחים את ה-URL הקיים (כדי לא לדרוס תמונה קיימת בעריכה)
              data.append('imageUrl', formData.imageUrl || '');
          }

          // שליחה לשרת (Create או Update בהתאם למצב)
          if (editMode && currentProductId) { 
              await productsService.updateProduct(currentProductId, data as any); 
          } else { 
              await productsService.createProduct(data as any); 
          }
          
          // רענון הנתונים וסגירת הדיאלוג
          loadData(); 
          handleCloseDialog();
      } catch (error: any) { alert('שגיאה בשמירה'); }
  };

  // מחיקת מוצר
  const handleDelete = async (id: number) => {
      if (window.confirm('למחוק מוצר זה? 🗑️')) {
          try { 
              await productsService.deleteProduct(id); 
              // עדכון ה-State המקומי למחיקה מיידית מהטבלה
              setProducts(prev => prev.filter(p => p.id !== id)); 
            } 
          catch (error) { alert('שגיאה במחיקה.'); }
      }
  };

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      
      {/* --- כותרת ראשית --- */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 4, gap: 2 }}>
          <Avatar sx={{ bgcolor: FERRARI_RED, width: 50, height: 50, boxShadow: '0 4px 10px rgba(211, 47, 47, 0.3)' }}>
              <DashboardIcon />
          </Avatar>
          <Typography variant="h4" fontWeight="800" sx={{ letterSpacing: '-0.5px' }}>
            מרכז ניהול
          </Typography>
      </Box>

      {/* --- סרגל טאבים (Navigation) --- */}
      <Paper elevation={0} sx={{ mb: 4, borderRadius: 4, border: '1px solid #e0e0e0', overflow: 'hidden' }}>
          <Tabs 
            value={currentTab} 
            onChange={(_, newVal) => setCurrentTab(newVal)} 
            centered
            sx={{ 
                '& .MuiTabs-indicator': { backgroundColor: FERRARI_RED, height: 3 },
                '& .MuiTab-root': { fontWeight: 'bold', fontSize: '1rem', '&.Mui-selected': { color: FERRARI_RED } }
            }}
          >
            <Tab icon={<InventoryIcon />} label="ניהול מוצרים" iconPosition="start" />
            <Tab icon={<ShoppingBagIcon />} label="ניהול הזמנות" iconPosition="start" />
            <Tab icon={<PeopleIcon />} label="ניהול משתמשים" iconPosition="start" />
          </Tabs>
      </Paper>

      {/* --- אזור התוכן המתחלף --- */}
      <Box sx={{ minHeight: 400 }}>
        {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}>
                <CircularProgress sx={{ color: FERRARI_RED }} />
            </Box>
        ) : (
            // אנימציית Fade בכניסה לטאב
            <Fade in={!loading}>
                <Box>
                    {/* === טאב 1: ניהול מוצרים === */}
                    {currentTab === 0 && (
                        <>
                            {/* כפתור הוספה */}
                            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 3 }}>
                                <Button 
                                    variant="contained" startIcon={<AddIcon />} size="large" onClick={handleOpenAdd}
                                    sx={{ bgcolor: '#2e7d32', borderRadius: 50, fontWeight: 'bold', boxShadow: '0 4px 10px rgba(46, 125, 50, 0.3)' }}
                                >
                                    הוסף מוצר חדש
                                </Button>
                            </Box>
                            
                            {/* טבלת מוצרים */}
                            <TableContainer component={Paper} elevation={0} sx={{ borderRadius: 4, border: '1px solid #e0e0e0', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
                                <Table sx={{ minWidth: 650 }}>
                                <TableHead sx={{ bgcolor: '#f8f9fa' }}>
                                    <TableRow>
                                    <TableCell sx={{ fontWeight: 'bold' }}>ID</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold' }}>תמונה</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold' }}>שם הדגם</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold' }}>יצרן</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold' }}>מחיר</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold' }}>מלאי</TableCell>
                                    <TableCell align="center" sx={{ fontWeight: 'bold' }}>פעולות</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {products.map((product) => (
                                    <TableRow key={product.id} hover>
                                        <TableCell>{product.id}</TableCell>
                                        <TableCell><Box component="img" src={product.imageUrl} sx={{ width: 60, height: 40, objectFit: 'contain', borderRadius: 1 }} /></TableCell>
                                        <TableCell sx={{ fontWeight: 'bold' }}>{product.name}</TableCell>
                                        <TableCell>{product.carMake}</TableCell>
                                        <TableCell sx={{ color: FERRARI_RED, fontWeight: 'bold' }}>₪{product.price}</TableCell>
                                        {/* Chip צבעוני שמציג את מצב המלאי */}
                                        <TableCell><Chip label={product.stock} color={product.stock < 3 ? 'error' : 'success'} size="small" variant={product.stock === 0 ? 'filled' : 'outlined'} /></TableCell>
                                        <TableCell align="center">
                                            <IconButton color="primary" onClick={() => handleOpenEdit(product)}><EditIcon /></IconButton>
                                            <IconButton color="error" onClick={() => handleDelete(product.id)}><DeleteIcon /></IconButton>
                                        </TableCell>
                                    </TableRow>
                                    ))}
                                </TableBody>
                                </Table>
                            </TableContainer>
                        </>
                    )}

                    {/* === טאב 2: ניהול הזמנות === */}
                    {currentTab === 1 && (
                        <TableContainer component={Paper} elevation={0} sx={{ borderRadius: 4, border: '1px solid #e0e0e0', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
                            <Table>
                                <TableHead sx={{ bgcolor: '#f8f9fa' }}>
                                    <TableRow>
                                        <TableCell sx={{ fontWeight: 'bold' }}>#</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold' }}>לקוח</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold' }}>תאריך</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold' }}>סטטוס</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold' }}>סה"כ</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold' }}>כתובת</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold' }}>פריטים</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {orders.map((order) => {
                                        const statusColor = getStatusColor(order.status || 'pending');
                                        return (
                                            <TableRow key={order.id} hover>
                                                <TableCell>{order.id}</TableCell>
                                                <TableCell>
                                                    <Typography variant="subtitle2" fontWeight="bold">{order.user?.firstName} {order.user?.lastName}</Typography>
                                                    <Typography variant="caption" color="text.secondary">{order.user?.email}</Typography>
                                                </TableCell>
                                                <TableCell>{new Date(order.createdAt).toLocaleDateString()}</TableCell>
                                                <TableCell>
                                                    {/* דרופדאון לשינוי סטטוס ישירות מהטבלה */}
                                                    <FormControl size="small" sx={{ minWidth: 120 }}>
                                                        <Select
                                                            value={order.status || 'pending'}
                                                            onChange={(e) => handleOrderStatusChange(order.id, e.target.value)}
                                                            sx={{ 
                                                                fontSize: '0.85rem', height: 35, fontWeight: 'bold', borderRadius: 20,
                                                                color: `${statusColor}.main`,
                                                                '& .MuiOutlinedInput-notchedOutline': { borderColor: `${statusColor}.main` }
                                                            }}
                                                        >
                                                            {ORDER_STATUSES.map(status => (
                                                                <MenuItem key={status} value={status}>{status}</MenuItem>
                                                            ))}
                                                        </Select>
                                                    </FormControl>
                                                </TableCell>
                                                <TableCell sx={{ fontWeight: 'bold', color: FERRARI_RED }}>₪{order.totalAmount}</TableCell>
                                                <TableCell><Typography variant="caption">{order.city}, {order.address}</Typography></TableCell>
                                                <TableCell>{order.items?.length} פריטים</TableCell>
                                            </TableRow>
                                        );
                                    })}
                                    {orders.length === 0 && <TableRow><TableCell colSpan={7} align="center">אין הזמנות במערכת</TableCell></TableRow>}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    )}

                    {/* === טאב 3: ניהול משתמשים === */}
                    {currentTab === 2 && (
                        <TableContainer component={Paper} elevation={0} sx={{ borderRadius: 4, border: '1px solid #e0e0e0', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
                            <Table>
                                <TableHead sx={{ bgcolor: '#f8f9fa' }}>
                                    <TableRow>
                                        <TableCell sx={{ fontWeight: 'bold' }}>ID</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold' }}>שם מלא</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold' }}>אימייל</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold' }}>תפקיד</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold' }}>חיבור</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {users.map((u) => (
                                    <TableRow key={u.id} hover>
                                        <TableCell>{u.id}</TableCell>
                                        <TableCell>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                {u.picture && <Box component="img" src={u.picture} sx={{ width: 30, borderRadius: '50%' }} />}
                                                {u.firstName} {u.lastName}
                                            </Box>
                                        </TableCell>
                                        <TableCell>{u.email}</TableCell>
                                        <TableCell>
                                            {/* דרופדאון לשינוי תפקיד (User/Admin) */}
                                            <FormControl size="small">
                                                <Select
                                                    value={u.role}
                                                    onChange={(e) => handleUserRoleChange(u.id, e.target.value)}
                                                    sx={{ height: 30, fontSize: '0.85rem', borderRadius: 20, bgcolor: u.role === 'admin' ? '#ffebee' : 'transparent' }}
                                                >
                                                    {USER_ROLES.map(role => <MenuItem key={role} value={role}>{role}</MenuItem>)}
                                                </Select>
                                            </FormControl>
                                        </TableCell>
                                        <TableCell>{u.provider === 'google' ? 'Google' : 'Email'}</TableCell>
                                    </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    )}
                </Box>
            </Fade>
        )}
      </Box>

      {/* --- מודל (Dialog) להוספה ועריכת מוצר --- */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth PaperProps={{ sx: { borderRadius: 4 } }}>
        <DialogTitle sx={{ fontWeight: 'bold', bgcolor: '#f5f5f5' }}>{editMode ? 'עריכת מוצר ✏️' : 'הוספת מוצר חדש ➕'}</DialogTitle>
        <DialogContent dividers>
            {/* שימוש בגריד המודרני של MUI (size) כפי שביקשת */}
            <Grid container spacing={2} sx={{ mt: 0.5 }}>
                
                {/* --- אזור העלאת תמונה --- */}
                <Grid size={{ xs: 12 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1, p: 1, border: '1px dashed #ccc', borderRadius: 2 }}>
                        <Button
                            component="label" variant="outlined" startIcon={<CloudUploadIcon />} sx={{ borderRadius: 20 }}
                        >
                            בחר תמונה מהמחשב
                            <input type="file" hidden accept="image/*" onChange={(e) => { if (e.target.files && e.target.files[0]) setSelectedFile(e.target.files[0]); }} />
                        </Button>
                        <Typography variant="body2" sx={{ fontStyle: 'italic', color: selectedFile ? 'success.main' : 'text.secondary' }}>
                            {selectedFile ? `קובץ נבחר: ${selectedFile.name}` : 'לא נבחר קובץ חדש'}
                        </Typography>
                      </Box>
                      {/* שדה טקסט אופציונלי למקרה שהמשתמש רוצה להדביק URL במקום להעלות */}
                      <TextField label="או הדבק קישור ישיר (URL)" name="imageUrl" fullWidth required={!selectedFile} value={formData.imageUrl} onChange={handleChange} sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }} />
                </Grid>

                {/* --- שדות הטופס (משתמשים ב-Grid size) --- */}
                
                {/* שורה 1: שם הדגם ויצרן */}
                <Grid size={{ xs: 12, sm: 6 }}><TextField label="שם הדגם" name="name" fullWidth required value={formData.name} onChange={handleChange} sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }} /></Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                    {/* Autocomplete שמאפשר גם כתיבה חופשית (freeSolo) */}
                    <Autocomplete freeSolo options={dynamicMakes} value={formData.carMake} onChange={(_, v) => handleAutocompleteChange('carMake', v)} onInputChange={(_, v) => handleAutocompleteChange('carMake', v)} renderInput={(p) => <TextField {...p} label="יצרן רכב" required sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }} />} />
                </Grid>
                
                {/* שורה 2: קטגוריה ומותג */}
                <Grid size={{ xs: 12, sm: 6 }}><Autocomplete freeSolo options={dynamicCategories} value={formData.category} onChange={(_, v) => handleAutocompleteChange('category', v)} onInputChange={(_, v) => handleAutocompleteChange('category', v)} renderInput={(p) => <TextField {...p} label="קטגוריה" required sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }} />} /></Grid>
                <Grid size={{ xs: 12, sm: 6 }}><Autocomplete freeSolo options={dynamicBrands} value={formData.brand} onChange={(_, v) => handleAutocompleteChange('brand', v)} onInputChange={(_, v) => handleAutocompleteChange('brand', v)} renderInput={(p) => <TextField {...p} label="מותג צעצוע" required sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }} />} /></Grid>
                
                {/* שורה 3: מספרים (מחיר, מלאי) ופרטים נוספים */}
                <Grid size={{ xs: 6, sm: 3 }}><TextField label="מחיר (₪)" name="price" type="number" fullWidth required value={formData.price} onChange={handleChange} sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }} /></Grid>
                <Grid size={{ xs: 6, sm: 3 }}><TextField label="מלאי" name="stock" type="number" fullWidth required value={formData.stock} onChange={handleChange} sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }} /></Grid>
                <Grid size={{ xs: 6, sm: 3 }}><Autocomplete freeSolo options={dynamicScales} value={formData.scale} onChange={(_, v) => handleAutocompleteChange('scale', v)} onInputChange={(_, v) => handleAutocompleteChange('scale', v)} renderInput={(p) => <TextField {...p} label="קנה מידה" sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }} />} /></Grid>
                <Grid size={{ xs: 6, sm: 3 }}><TextField label="צבע" name="color" fullWidth value={formData.color} onChange={handleChange} sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }} /></Grid>
                
                {/* שורה 4: תיאור */}
                <Grid size={{ xs: 12 }}><TextField label="תיאור מלא" name="description" fullWidth multiline rows={3} value={formData.description} onChange={handleChange} sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }} /></Grid>
            </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 2, bgcolor: '#f5f5f5' }}>
            <Button onClick={handleCloseDialog} color="inherit" size="large" sx={{ borderRadius: 50 }}>ביטול</Button>
            <Button onClick={handleSave} variant="contained" size="large" sx={{ borderRadius: 50, bgcolor: FERRARI_RED, '&:hover': { bgcolor: '#b71c1c' } }}>{editMode ? 'שמור שינויים' : 'צור מוצר'}</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};