import { useEffect, useState } from 'react';
import { Container, Typography, CircularProgress, Box, Grid, TextField, MenuItem, InputAdornment, Paper, Slider, Button } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import SortIcon from '@mui/icons-material/Sort';
import FilterListIcon from '@mui/icons-material/FilterList'; 
import CloseIcon from '@mui/icons-material/Close'; 
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings'; // אייקון חדש לאדמין
import type { Product } from '../types/product.types';
import { productsService } from '../services/products.service';
import { ProductCard } from '../components/ProductCard';
import type { ProductFilters } from '../services/products.service';
import { useAuth } from '../context/AuthContext'; // ייבוא הקונטקסט לבדיקת הרשאות
import { useNavigate } from 'react-router-dom'; // ייבוא לניווט

// ... (רשימות קבועות נשארות אותו דבר) ...
const CATEGORIES = ['All', 'Classic', 'Muscle', 'Sports', 'Luxury', 'SUV'];
const BRANDS = ['All', 'Burago', 'Maisto', 'AutoArt', 'Hot Wheels'];
const CAR_MAKES = ['All', 'Ferrari', 'Lamborghini', 'Ford', 'Porsche', 'Mazda'];
const SCALES = ['All', '1:18', '1:24', '1:43', '1:64'];

const SORT_OPTIONS = [
    { value: 'name_asc', label: 'שם: א-ת' },
    { value: 'name_desc', label: 'שם: ת-א' },
    { value: 'price_asc', label: 'מחיר: מהזול ליקר' },
    { value: 'price_desc', label: 'מחיר: מהיקר לזול' },
];

const FILTER_TYPES = [
    { value: 'category', label: 'קטגוריה' },
    { value: 'maxPrice', label: 'טווח מחיר' },
    { value: 'carMake', label: 'יצרן רכב' },
    { value: 'brand', label: 'מותג צעצוע' },
    { value: 'scale', label: 'קנה מידה' },
];

export const HomePage = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  
  // --- הוספות חדשות ---
  const { user } = useAuth(); // שליפת המשתמש המחובר
  const navigate = useNavigate(); // פונקציית הניווט
  // -------------------

  const [filters, setFilters] = useState<ProductFilters>({
      search: '',
      category: 'All',
      brand: 'All',
      carMake: 'All',
      scale: 'All',
      sort: 'name_asc',
      maxPrice: 1000
  });

  const [activeFilterType, setActiveFilterType] = useState<string>('');

  const handleFilterValueChange = (key: keyof ProductFilters, value: any) => {
      setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleFilterTypeChange = (newType: string) => {
      setActiveFilterType(newType);
      
      // איפוס פילטרים אחרים כשמחליפים סוג ידנית
      setFilters(prev => ({
          ...prev,
          category: 'All',
          brand: 'All',
          carMake: 'All',
          scale: 'All',
          maxPrice: 1000,
      }));
  };

  // --- הפונקציה החדשה לסינון מהיר (מהכרטיס) ---
  const handleQuickFilter = (type: string, value: string) => {
      // 1. נפתח את ה-UI המתאים (כדי שהמשתמש יראה מה נבחר)
      setActiveFilterType(type);

      // 2. נאפס הכל ונבחר רק את מה שנלחץ
      setFilters({
          search: '', // מנקים גם חיפוש
          category: 'All',
          brand: 'All',
          carMake: 'All',
          scale: 'All',
          sort: 'name_asc',
          maxPrice: 1000,
          [type]: value // דורסים את השדה הספציפי עם הערך החדש
      });

      // גלילה חלקה למעלה כדי שהמשתמש יראה את התוצאות
      window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  // ---------------------------------------------

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await productsService.getAll(filters);
        setProducts(data);
      } catch (error) {
        console.error('Failed to fetch cars:', error);
      } finally {
        setLoading(false);
      }
    };

    const timeoutId = setTimeout(() => {
        fetchProducts();
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [filters]);

  // ... (פונקציית renderActiveFilterInput נשארת אותו דבר) ...
  const renderActiveFilterInput = () => {
    switch (activeFilterType) {
        case 'category':
            return (
              <TextField select fullWidth label="בחר קטגוריה" value={filters.category} onChange={(e) => handleFilterValueChange('category', e.target.value)}>
                  {CATEGORIES.map((opt) => <MenuItem key={opt} value={opt}>{opt}</MenuItem>)}
              </TextField>
            );
        case 'brand':
            return (
              <TextField select fullWidth label="בחר מותג" value={filters.brand} onChange={(e) => handleFilterValueChange('brand', e.target.value)}>
                  {BRANDS.map((opt) => <MenuItem key={opt} value={opt}>{opt}</MenuItem>)}
              </TextField>
            );
        case 'carMake':
            return (
              <TextField select fullWidth label="בחר יצרן" value={filters.carMake} onChange={(e) => handleFilterValueChange('carMake', e.target.value)}>
                  {CAR_MAKES.map((opt) => <MenuItem key={opt} value={opt}>{opt}</MenuItem>)}
              </TextField>
            );
        case 'scale':
            return (
              <TextField select fullWidth label="בחר קנה מידה" value={filters.scale} onChange={(e) => handleFilterValueChange('scale', e.target.value)}>
                  {SCALES.map((opt) => <MenuItem key={opt} value={opt}>{opt}</MenuItem>)}
              </TextField>
            );
        case 'maxPrice':
            return (
              <Box sx={{ px: 1 }}>
                  <Typography variant="body2" gutterBottom>עד מחיר: ₪{filters.maxPrice}</Typography>
                  <Slider
                      value={filters.maxPrice || 1000}
                      onChange={(_, newValue) => handleFilterValueChange('maxPrice', newValue as number)}
                      min={0} max={1000} step={10} valueLabelDisplay="auto"
                  />
              </Box>
            );
        default:
            return null;
    }
  };


  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}><CircularProgress /></Box>;

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      
      {/* --- אזור כותרת + כפתור אדמין --- */}
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 2 }}>
          <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 'bold', textAlign: 'center' }}>
            🏁 הקטלוג המלא
          </Typography>

          {/* כפתור שמופיע אך ורק לאדמין */}
          {user?.role === 'admin' && (
              <Button 
                variant="contained" 
                color="secondary" 
                startIcon={<AdminPanelSettingsIcon />}
                onClick={() => navigate('/admin')}
                sx={{ mb: 2, fontWeight: 'bold' }}
              >
                  מעבר לפאנל ניהול
              </Button>
          )}
      </Box>
      {/* -------------------------------- */}

      <Typography variant="h6" color="text.secondary" align="center" sx={{ mb: 5 }}>
          האוסף היוקרתי ביותר של רכבים בישראל
      </Typography>

      {/* אזור הפילטרים (נשאר זהה לקודם) */}
      <Paper elevation={3} sx={{ p: 3, mb: 5, borderRadius: 2 }}>
          <Grid container spacing={2} alignItems="center">
            
            <Grid size={{ xs: 12, md: 4 }}>
                <TextField 
                    fullWidth
                    label="חפש דגם..." 
                    variant="outlined"
                    value={filters.search}
                    onChange={(e) => handleFilterValueChange('search', e.target.value)}
                    InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment> }}
                />
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <TextField
                    select
                    fullWidth
                    label="מיון לפי"
                    value={filters.sort}
                    onChange={(e) => handleFilterValueChange('sort', e.target.value)}
                    InputProps={{ startAdornment: <InputAdornment position="start"><SortIcon /></InputAdornment> }}
                >
                    {SORT_OPTIONS.map((option) => (
                        <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>
                    ))}
                </TextField>
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <TextField
                    select
                    fullWidth
                    label="סנן לפי..."
                    value={activeFilterType}
                    onChange={(e) => handleFilterTypeChange(e.target.value)}
                    InputProps={{ startAdornment: <InputAdornment position="start"><FilterListIcon /></InputAdornment> }}
                >
                    <MenuItem value=""><em>ללא סינון נוסף</em></MenuItem>
                    {FILTER_TYPES.map((type) => (
                        <MenuItem key={type.value} value={type.value}>{type.label}</MenuItem>
                    ))}
                </TextField>
            </Grid>

            {activeFilterType && (
                <Grid size={{ xs: 12, md: 2 }}>
                   <Box sx={{ position: 'relative' }}>
                       {renderActiveFilterInput()}
                       <Button 
                            size="small" color="error" startIcon={<CloseIcon />} 
                            onClick={() => handleFilterTypeChange('')}
                            sx={{ position: 'absolute', top: -35, left: 0, fontSize: '0.7rem' }}
                       >
                           נקה סינון
                       </Button>
                   </Box>
                </Grid>
            )}

          </Grid>
      </Paper>

      {/* רשימת המוצרים */}
      <Grid container spacing={4}>
        {products.map((car) => (
          <Grid key={car.id} size={{ xs: 12, sm: 6, md: 4 }}>
            {/* --- מעבירים לכרטיס את פונקציית הסינון --- */}
            <ProductCard 
                product={car} 
                onQuickFilter={handleQuickFilter} 
            />
          </Grid>
        ))}

        {products.length === 0 && (
            <Grid size={{ xs: 12 }}>
                <Typography variant="h6" align="center" color="text.secondary" sx={{ mt: 4 }}>
                    לא נמצאו רכבים תואמים לסינון... 😕
                </Typography>
            </Grid>
        )}
      </Grid>
    </Container>
  );
};