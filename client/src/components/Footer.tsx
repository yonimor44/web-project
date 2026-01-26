import { Box, Container, Typography, Divider } from '@mui/material';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';

const FERRARI_RED = '#d32f2f';

export const Footer = () => {
  return (
    <Box sx={{ 
        bgcolor: '#1a1a1a', 
        color: 'white', 
        py: 2, // ריפוד נמוך מאוד (דק)
        mt: 'auto', 
        borderTop: `3px solid ${FERRARI_RED}` 
    }}>
      <Container maxWidth="xl">
        <Box sx={{ 
            display: 'flex', 
            flexDirection: { xs: 'column', md: 'row' }, // במובייל זה מעל זה, במחשב אחד ליד השני
            alignItems: 'center', 
            justifyContent: 'space-between', // דוחף את הצדדים לקצוות
            gap: 1
        }}>
          
          {/* צד ימין: לוגו + תיאור קצר */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <DirectionsCarIcon sx={{ color: FERRARI_RED, fontSize: 24 }} />
                  <Typography variant="h6" fontWeight="900" sx={{ fontSize: '1.1rem', letterSpacing: 1, textTransform: 'uppercase' }}>
                      Jhoni Shop
                  </Typography>
              </Box>
              
              {/* קו מפריד קטן (מוסתר במובייל) */}
              <Divider orientation="vertical" flexItem sx={{ bgcolor: '#444', height: 20, my: 'auto', display: { xs: 'none', md: 'block' } }} />
              
              <Typography variant="body2" sx={{ color: '#aaa', fontSize: '0.9rem', display: { xs: 'none', sm: 'block' } }}>
                הבית של רכבי האספנות בישראל
              </Typography>
          </Box>

          {/* צד שמאל: זכויות יוצרים */}
          <Typography variant="caption" sx={{ color: '#666', fontSize: '0.85rem' }}>
            © {new Date().getFullYear()} כל הזכויות שמורות. נבנה באהבה לרכבים 🏎️
          </Typography>

        </Box>
      </Container>
    </Box>
  );
};