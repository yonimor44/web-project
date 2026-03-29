// דף הבית - קטלוג המוצרים.
// כולל באנר ראשי, סרגל סינון וחיפוש מתקדם, ותצוגת גריד של המוצרים.

import { useEffect, useState } from 'react';
import { Container, Typography, CircularProgress, Box, Grid, TextField, MenuItem, InputAdornment, Paper, Slider, Button, Chip } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import SortIcon from '@mui/icons-material/Sort';
import FilterListIcon from '@mui/icons-material/FilterList'; 
import { productsService } from '../services/products.service';
import { ProductCard } from '../components/ProductCard';
import type { Product } from '../types/product.types';
import type { ProductFilters } from '../services/products.service';
import heroBanner from './hero-banner.png';

const FERRARI_RED = '#d32f2f';

// אפשרויות מיון קבועות
const SORT_OPTIONS = [
    { value: 'name_asc', label: 'שם: א-ת' },
    { value: 'name_desc', label: 'שם: ת-א' },
    { value: 'price_asc', label: 'מחיר: מהזול ליקר' },
    { value: 'price_desc', label: 'מחיר: מהיקר לזול' },
];

// סוגי פילטרים זמינים
const FILTER_TYPES = [
    { value: 'category', label: 'קטגוריה' },
    { value: 'maxPrice', label: 'טווח מחיר' },
    { value: 'carMake', label: 'יצרן רכב' },
    { value: 'brand', label: 'מותג צעצוע' },
    { value: 'scale', label: 'קנה מידה' },
];

export const HomePage = () => {
  // --- States לנתונים דינמיים ---
  // רשימות אלו מתמלאות אוטומטית לפי המוצרים הקיימים במסד הנתונים
  const [categoriesList, setCategoriesList] = useState<string[]>(['All']);
  const [brandsList, setBrandsList] = useState<string[]>(['All']);
  const [carMakesList, setCarMakesList] = useState<string[]>(['All']);
  const [scalesList, setScalesList] = useState<string[]>(['All']);

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  
  // ניהול מצב הפילטרים הנוכחי
  const [filters, setFilters] = useState<ProductFilters>({
      search: '',
      category: 'All',
      brand: 'All',
      carMake: 'All',
      scale: 'All',
      sort: 'name_asc',
      maxPrice: 1000
  });

  // איזה פילטר נוסף פתוח כרגע? (קטגוריה/מחיר וכו')
  const [activeFilterType, setActiveFilterType] = useState<string>('');

  // --- טעינת אפשרויות סינון (בעליית הדף) ---
  useEffect(() => {
    const fetchFilterOptions = async () => {
      try {
        // מביאים את כל המוצרים כדי לגזור מהם את הקטגוריות הקיימות
        const allProducts = await productsService.getAll({}); 
        
        const getUniqueValues = (key: keyof Product) => {
            const values = allProducts.map(p => p[key]).filter(Boolean);
            return ['All', ...Array.from(new Set(values as string[])).sort()];
        };

        setCategoriesList(getUniqueValues('category'));
        setBrandsList(getUniqueValues('brand'));
        setCarMakesList(getUniqueValues('carMake'));
        setScalesList(getUniqueValues('scale'));

      } catch (error) {
        console.error('Failed to load filter options:', error);
      }
    };

    fetchFilterOptions();
  }, []);

  // --- לוגיקה לשינוי פילטרים ---
  
  // שינוי ערך ספציפי (למשל בחירת קטגוריה 'Sports')
  const handleFilterValueChange = (key: keyof ProductFilters, value: any) => {
      setFilters(prev => ({ ...prev, [key]: value }));
  };

  // החלפת סוג הפילטר הפעיל (ואיפוס האחרים)
  const handleFilterTypeChange = (newType: string) => {
      setActiveFilterType(newType);
      setFilters(prev => ({
          ...prev,
          category: 'All',
          brand: 'All',
          carMake: 'All',
          scale: 'All',
          maxPrice: 1000,
      }));
  };

  // סינון מהיר (בלחיצה על צ'יפ בכרטיס מוצר)
  const handleQuickFilter = (type: string, value: string) => {
      setActiveFilterType(type);
      setFilters({
          search: '',
          category: 'All',
          brand: 'All',
          carMake: 'All',
          scale: 'All',
          sort: 'name_asc',
          maxPrice: 1000,
          [type]: value // דורס רק את הפילטר הרלוונטי
      });
      window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // --- שליפת מוצרים (Debounced) ---
  // בכל שינוי ב-filters, נשלח בקשה לשרת עם השהיה קטנה למניעת עומס
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await productsService.getAll(filters);
        setProducts(data);
      } catch (error) { console.error('Failed to fetch cars:', error); } 
      finally { setLoading(false); }
    };

    const timeoutId = setTimeout(() => { fetchProducts(); }, 300);
    return () => clearTimeout(timeoutId);
  }, [filters]);

  // סגנון אחיד לכל ה-Selects
  const roundedSelectStyle = { 
    '& .MuiOutlinedInput-root': { borderRadius: 50, bgcolor: '#f9f9f9' },
    '& .MuiOutlinedInput-notchedOutline': { borderColor: 'transparent' },
    '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#e0e0e0' },
    '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: FERRARI_RED }
  };

  // רינדור דינמי של הפילטר הפעיל
  const renderActiveFilterInput = () => {
    switch (activeFilterType) {
        case 'category':
            return (
              <TextField select fullWidth label="בחר קטגוריה" value={filters.category} onChange={(e) => handleFilterValueChange('category', e.target.value)} sx={roundedSelectStyle}>
                  {categoriesList.map((opt) => <MenuItem key={opt} value={opt}>{opt}</MenuItem>)}
              </TextField>
            );
        case 'brand':
            return (
              <TextField select fullWidth label="בחר מותג" value={filters.brand} onChange={(e) => handleFilterValueChange('brand', e.target.value)} sx={roundedSelectStyle}>
                  {brandsList.map((opt) => <MenuItem key={opt} value={opt}>{opt}</MenuItem>)}
              </TextField>
            );
        case 'carMake':
            return (
              <TextField select fullWidth label="בחר יצרן" value={filters.carMake} onChange={(e) => handleFilterValueChange('carMake', e.target.value)} sx={roundedSelectStyle}>
                  {carMakesList.map((opt) => <MenuItem key={opt} value={opt}>{opt}</MenuItem>)}
              </TextField>
            );
        case 'scale':
            return (
              <TextField select fullWidth label="בחר קנה מידה" value={filters.scale} onChange={(e) => handleFilterValueChange('scale', e.target.value)} sx={roundedSelectStyle}>
                  {scalesList.map((opt) => <MenuItem key={opt} value={opt}>{opt}</MenuItem>)}
              </TextField>
            );
        case 'maxPrice':
            return (
              <Box sx={{ px: 2, py: 1, bgcolor: 'white', borderRadius: 4, border: '1px solid #e0e0e0' }}>
                  <Typography variant="body2" gutterBottom color="text.secondary">עד מחיר: ₪{filters.maxPrice}</Typography>
                  <Slider
                      value={filters.maxPrice || 1000}
                      onChange={(_, newValue) => handleFilterValueChange('maxPrice', newValue as number)}
                      min={0} max={1000} step={10} valueLabelDisplay="auto"
                      sx={{ color: FERRARI_RED }}
                  />
              </Box>
            );
        default: return null;
    }
  };

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}><CircularProgress sx={{ color: FERRARI_RED }} /></Box>;

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 8 }}>
      
      {/* --- באנר ראשי (Hero Banner) --- */}
      <Box 
        sx={{ 
            display: 'flex', 
            justifyContent: 'center', 
            mb: 6, 
            mt: 2,
            animation: 'fadeIn 1s ease-in'
        }}
      >
          <Box 
            component="img"
            src={heroBanner}
            alt="Yoni Luxury Models"
            sx={{ 
                maxWidth: '100%', 
                height: 'auto', 
                maxHeight: { xs: 180, md: 300 },
                objectFit: 'contain',
                filter: 'drop-shadow(0px 10px 20px rgba(0,0,0,0.1))'
            }}
          />
      </Box>

      {/* --- סרגל כלים צף (חיפוש וסינון) --- */}
      <Paper 
        elevation={0} 
        sx={{ 
            p: 3, mb: 6, 
            borderRadius: 6, 
            bgcolor: 'white',
            border: '1px solid #f0f0f0',
            boxShadow: '0 8px 30px rgba(0,0,0,0.04)' 
        }}
      >
          <Grid container spacing={3} alignItems="center">
            
            {/* שדה חיפוש טקסטואלי */}
            <Grid size={{ xs: 12, md: 4 }}>
                <TextField 
                    fullWidth
                    placeholder="חפש דגם או יצרן..." 
                    variant="outlined"
                    value={filters.search}
                    onChange={(e) => handleFilterValueChange('search', e.target.value)}
                    InputProps={{ 
                        startAdornment: <InputAdornment position="start"><SearchIcon color="action" /></InputAdornment>,
                    }}
                    sx={roundedSelectStyle}
                />
            </Grid>

            {/* דרופדאון מיון */}
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <TextField
                    select
                    fullWidth
                    label="מיון לפי"
                    value={filters.sort}
                    onChange={(e) => handleFilterValueChange('sort', e.target.value)}
                    InputProps={{ startAdornment: <InputAdornment position="start"><SortIcon /></InputAdornment> }}
                    sx={roundedSelectStyle}
                >
                    {SORT_OPTIONS.map((option) => (
                        <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>
                    ))}
                </TextField>
            </Grid>

            {/* דרופדאון בחירת סוג סינון */}
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <TextField
                    select
                    fullWidth
                    label="סנן לפי..."
                    value={activeFilterType}
                    onChange={(e) => handleFilterTypeChange(e.target.value)}
                    InputProps={{ startAdornment: <InputAdornment position="start"><FilterListIcon /></InputAdornment> }}
                    sx={roundedSelectStyle}
                >
                    <MenuItem value=""><em>ללא סינון נוסף</em></MenuItem>
                    {FILTER_TYPES.map((type) => (
                        <MenuItem key={type.value} value={type.value}>{type.label}</MenuItem>
                    ))}
                </TextField>
            </Grid>

            {/* הצגת הפילטר הפעיל + כפתור מחיקה */}
            {activeFilterType && (
                <Grid size={{ xs: 12, md: 2 }}>
                    <Box sx={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box sx={{ flexGrow: 1 }}>
                            {renderActiveFilterInput()}
                        </Box>
                        <Chip 
                            label="X" 
                            size="small" 
                            onClick={() => handleFilterTypeChange('')} 
                            sx={{ bgcolor: '#ffebee', color: FERRARI_RED, fontWeight: 'bold', cursor: 'pointer' }}
                        />
                    </Box>
                </Grid>
            )}

          </Grid>
      </Paper>

      {/* --- גריד המוצרים --- */}
      <Grid container spacing={4}>
        {products.map((car) => (
          <Grid key={car.id} size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
            <ProductCard 
                product={car} 
                onQuickFilter={handleQuickFilter} 
            />
          </Grid>
        ))}

        {/* הודעה כשאין תוצאות */}
        {products.length === 0 && (
            <Grid size={{ xs: 12 }}>
                <Paper sx={{ p: 5, textAlign: 'center', borderRadius: 4, bgcolor: 'transparent' }} elevation={0}>
                    <Typography variant="h2" sx={{ mb: 2 }}>😕</Typography>
                    <Typography variant="h6" color="text.secondary">
                        לא נמצאו רכבים תואמים לחיפוש שלך...
                    </Typography>
                    <Button 
                        variant="text" 
                        onClick={() => handleFilterTypeChange('')} 
                        sx={{ mt: 2, color: FERRARI_RED }}
                    >
                        נקה את כל הפילטרים
                    </Button>
                </Paper>
            </Grid>
        )}
      </Grid>
    </Container>
  );
};