import { useEffect, useState } from 'react';
import { Container, Typography, CircularProgress, Box, Grid } from '@mui/material'; // נישאר עם Grid רגיל
import type { Product } from '../types/product.types';
import { productsService } from '../services/products.service';
import { ProductCard } from '../components/ProductCard';

export const HomePage = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await productsService.getAll();
        setProducts(data);
      } catch (error) {
        console.error('Failed to fetch cars:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 'bold', textAlign: 'center', mb: 5 }}>
        🏁 הנבחרים של השבוע
      </Typography>

      {/* Grid Container */}
      <Grid container spacing={4}>
        {products.map((car) => (
          /* השינוי הגדול בגרסה 7:
             1. מחקנו את המילה 'item' (היא לא קיימת יותר)
             2. המידות נכנסות לתוך אובייקט 'size'
          */
          <Grid key={car.id} size={{ xs: 12, sm: 6, md: 4 }}>
            <ProductCard product={car} />
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};