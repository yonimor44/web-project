import { useEffect, useState, useMemo } from 'react';
import { 
    Container, Typography, Paper, Table, TableBody, TableCell, 
    TableContainer, TableHead, TableRow, IconButton, Button, Box, Chip, 
    CircularProgress, Dialog, DialogTitle, DialogContent, DialogActions, 
    TextField, Grid, Autocomplete 
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { productsService } from '../services/products.service'; 
import type { Product } from '../types/product.types';
import type { ProductInput } from '../services/products.service'; 

// רשימות ברירת מחדל
const DEFAULT_CATEGORIES = ['Classic', 'Muscle', 'Sports', 'Luxury', 'SUV'];
const DEFAULT_BRANDS = ['Burago', 'Maisto', 'AutoArt', 'Hot Wheels', 'Tamiya'];
const DEFAULT_MAKES = ['Ferrari', 'Lamborghini', 'Ford', 'Porsche', 'Mazda', 'Chevrolet', 'BMW', 'Mercedes'];
const DEFAULT_SCALES = ['1:18', '1:24', '1:43', '1:64'];

const INITIAL_FORM_STATE: ProductInput = {
    name: '',
    description: '',
    price: 0,
    stock: 0,
    category: '',
    imageUrl: '',
    brand: '',
    carMake: '',
    scale: '',
    color: ''
};

export const AdminPage = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // State לטופס
  const [openDialog, setOpenDialog] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentProductId, setCurrentProductId] = useState<number | null>(null);
  const [formData, setFormData] = useState<ProductInput>(INITIAL_FORM_STATE);

  const fetchProducts = async () => {
    try {
        const data = await productsService.getAll(); 
        setProducts(data);
    } catch (error) {
        console.error('Failed to load products', error);
    } finally {
        setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // --- יצירת רשימות דינמיות ---
  const getUniqueOptions = (defaultList: string[], key: keyof Product) => {
      const existingValues = products.map(p => p[key] as string).filter(Boolean);
      return Array.from(new Set([...defaultList, ...existingValues])).sort();
  };

  const dynamicCategories = useMemo(() => getUniqueOptions(DEFAULT_CATEGORIES, 'category'), [products]);
  const dynamicBrands = useMemo(() => getUniqueOptions(DEFAULT_BRANDS, 'brand'), [products]);
  const dynamicMakes = useMemo(() => getUniqueOptions(DEFAULT_MAKES, 'carMake'), [products]);
  const dynamicScales = useMemo(() => getUniqueOptions(DEFAULT_SCALES, 'scale'), [products]);

  // --- לוגיקה לטופס ---
  const handleOpenAdd = () => {
      setEditMode(false);
      setFormData(INITIAL_FORM_STATE);
      setOpenDialog(true);
  };

  const handleOpenEdit = (product: Product) => {
      setEditMode(true);
      setCurrentProductId(product.id);
      setFormData({
          name: product.name,
          description: product.description,
          price: Number(product.price),
          stock: product.stock,
          category: product.category,
          imageUrl: product.imageUrl,
          brand: product.brand || '',
          carMake: product.carMake || '',
          scale: product.scale || '',
          color: product.color || ''
      });
      setOpenDialog(true);
  };

  const handleCloseDialog = () => {
      setOpenDialog(false);
  };

  // עדכון שדות טקסט
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value } = e.target;
      setFormData(prev => ({
          ...prev,
          [name]: (name === 'price' || name === 'stock') ? Number(value) : value
      }));
  };

  // עדכון שדות Autocomplete
  const handleAutocompleteChange = (name: keyof ProductInput, value: string | null) => {
      setFormData(prev => ({
          ...prev,
          [name]: value || ''
      }));
  };

  // --- הפונקציה המעודכנת למניעת שגיאות ---
  const handleSave = async () => {
      try {
          // 1. ניקוי נתונים: הופכים null לסטרינג ריק, ומוודאים שמספר הוא מספר
          const payload = {
              ...formData,
              price: Number(formData.price),
              stock: Number(formData.stock),
              category: formData.category || '',
              brand: formData.brand || '',
              carMake: formData.carMake || '',
              scale: formData.scale || '',
              color: formData.color || '',
          };

          if (editMode && currentProductId) {
              await productsService.updateProduct(currentProductId, payload);
              alert('המוצר עודכן בהצלחה! ✨');
          } else {
              await productsService.createProduct(payload);
              alert('המוצר נוסף בהצלחה! 🎉');
          }
          fetchProducts();
          handleCloseDialog();
      } catch (error: any) {
          console.error('Operation failed', error);
          // הצגת שגיאה מפורטת
          const msg = error.response?.data?.message;
          alert('שגיאה בשמירה: ' + (Array.isArray(msg) ? msg.join('\n') : msg));
      }
  };

  const handleDelete = async (id: number) => {
      if (window.confirm('האם אתה בטוח שברצונך למחוק מוצר זה? 🗑️')) {
          try {
              await productsService.deleteProduct(id); 
              setProducts(prev => prev.filter(p => p.id !== id));
          } catch (error) {
              console.error('Failed to delete', error);
              alert('שגיאה במחיקת המוצר.');
          }
      }
  };

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}><CircularProgress /></Box>;

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Typography variant="h4" fontWeight="bold">
            ניהול מוצרים 🛠️
          </Typography>
          <Button 
            variant="contained" 
            startIcon={<AddIcon />} 
            size="large"
            color="success"
            onClick={handleOpenAdd}
          >
              הוסף מוצר חדש
          </Button>
      </Box>

      <TableContainer component={Paper} elevation={3}>
        <Table sx={{ minWidth: 650 }}>
          <TableHead sx={{ bgcolor: '#f8f9fa' }}>
            <TableRow>
              <TableCell>מזהה</TableCell>
              <TableCell>תמונה</TableCell>
              <TableCell>שם הדגם</TableCell>
              <TableCell>יצרן</TableCell>
              <TableCell>מחיר</TableCell>
              <TableCell>מלאי</TableCell>
              <TableCell align="center">פעולות</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {products.map((product) => (
              <TableRow key={product.id} hover>
                <TableCell>{product.id}</TableCell>
                <TableCell>
                    <Box component="img" src={product.imageUrl} alt={product.name} sx={{ width: 60, height: 40, objectFit: 'contain' }} />
                </TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>{product.name}</TableCell>
                <TableCell>{product.carMake}</TableCell>
                <TableCell>₪{product.price}</TableCell>
                <TableCell>
                    <Chip 
                        label={product.stock} 
                        color={product.stock < 3 ? 'error' : 'success'} 
                        size="small" 
                        variant={product.stock === 0 ? 'filled' : 'outlined'}
                    />
                </TableCell>
                <TableCell align="center">
                    <IconButton color="primary" onClick={() => handleOpenEdit(product)}>
                        <EditIcon />
                    </IconButton>
                    <IconButton color="error" onClick={() => handleDelete(product.id)}>
                        <DeleteIcon />
                    </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* --- דיאלוג --- */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle sx={{ fontWeight: 'bold', bgcolor: '#f5f5f5' }}>
            {editMode ? 'עריכת מוצר ✏️' : 'הוספת מוצר חדש ➕'}
        </DialogTitle>
        <DialogContent dividers>
            
            <Grid container spacing={2} sx={{ mt: 0.5 }}>
                
                {/* שורה 1 */}
                <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField label="שם הדגם" name="name" fullWidth required value={formData.name} onChange={handleChange} />
                </Grid>
                
                {/* יצרן רכב */}
                <Grid size={{ xs: 12, sm: 6 }}>
                     <Autocomplete
                        freeSolo
                        options={dynamicMakes}
                        value={formData.carMake}
                        // שימוש ב-_ כדי למנוע אזהרות
                        onChange={(_, newValue) => handleAutocompleteChange('carMake', newValue)}
                        onInputChange={(_, newInputValue) => handleAutocompleteChange('carMake', newInputValue)}
                        renderInput={(params) => <TextField {...params} label="יצרן רכב" required />}
                     />
                </Grid>

                {/* שורה 2 */}
                <Grid size={{ xs: 12, sm: 6 }}>
                    <Autocomplete
                        freeSolo
                        options={dynamicCategories}
                        value={formData.category}
                        onChange={(_, newValue) => handleAutocompleteChange('category', newValue)}
                        onInputChange={(_, newInputValue) => handleAutocompleteChange('category', newInputValue)}
                        renderInput={(params) => <TextField {...params} label="קטגוריה" required />}
                     />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                    <Autocomplete
                        freeSolo
                        options={dynamicBrands}
                        value={formData.brand}
                        onChange={(_, newValue) => handleAutocompleteChange('brand', newValue)}
                        onInputChange={(_, newInputValue) => handleAutocompleteChange('brand', newInputValue)}
                        renderInput={(params) => <TextField {...params} label="מותג צעצוע" required />}
                     />
                </Grid>

                {/* שורה 3 */}
                <Grid size={{ xs: 6, sm: 3 }}>
                    <TextField label="מחיר (₪)" name="price" type="number" fullWidth required value={formData.price} onChange={handleChange} />
                </Grid>
                <Grid size={{ xs: 6, sm: 3 }}>
                    <TextField label="מלאי" name="stock" type="number" fullWidth required value={formData.stock} onChange={handleChange} />
                </Grid>
                <Grid size={{ xs: 6, sm: 3 }}>
                     <Autocomplete
                        freeSolo
                        options={dynamicScales}
                        value={formData.scale}
                        onChange={(_, newValue) => handleAutocompleteChange('scale', newValue)}
                        onInputChange={(_, newInputValue) => handleAutocompleteChange('scale', newInputValue)}
                        renderInput={(params) => <TextField {...params} label="קנה מידה" />}
                     />
                </Grid>
                <Grid size={{ xs: 6, sm: 3 }}>
                    <TextField label="צבע" name="color" fullWidth value={formData.color} onChange={handleChange} />
                </Grid>

                {/* שורה 4 */}
                <Grid size={{ xs: 12 }}>
                    <TextField 
                        label="קישור לתמונה (URL)" 
                        name="imageUrl" 
                        fullWidth 
                        required 
                        value={formData.imageUrl} 
                        onChange={handleChange} 
                        helperText="הדבק כאן קישור לתמונה מהאינטרנט"
                    />
                </Grid>
                
                {/* שורה 5 */}
                <Grid size={{ xs: 12 }}>
                    <TextField 
                        label="תיאור מלא" name="description" fullWidth multiline rows={3} 
                        value={formData.description} onChange={handleChange} 
                    />
                </Grid>

            </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 2, bgcolor: '#f5f5f5' }}>
            <Button onClick={handleCloseDialog} color="inherit" size="large">ביטול</Button>
            <Button onClick={handleSave} variant="contained" color="primary" size="large">
                {editMode ? 'שמור שינויים' : 'צור מוצר'}
            </Button>
        </DialogActions>
      </Dialog>

    </Container>
  );
};