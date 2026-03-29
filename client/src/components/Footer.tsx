// רכיב הכותרת התחתונה הקבוע.

import { Box, Container, Typography, Divider } from '@mui/material';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';

const FERRARI_RED = '#d32f2f';

export const Footer = () => {
  return (
    <Box sx={{ 
        bgcolor: '#1a1a1a', color: 'white', py: 2, mt: 'auto', 
        borderTop: `3px solid ${FERRARI_RED}` 
    }}>
      <Container maxWidth="xl">
        <Box sx={{ 
            display: 'flex', flexDirection: { xs: 'column', md: 'row' }, 
            alignItems: 'center', justifyContent: 'space-between', gap: 1
        }}>
          {/* לוגו ומידע */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <DirectionsCarIcon sx={{ color: FERRARI_RED, fontSize: 24 }} />
                  <Typography variant="h6" fontWeight="900" sx={{ letterSpacing: 1, textTransform: 'uppercase' }}>
                     Yoni's models
                  </Typography>
              </Box>
              
              <Divider orientation="vertical" flexItem sx={{ bgcolor: '#444', height: 20, my: 'auto', display: { xs: 'none', md: 'block' } }} />
              
              <Typography variant="body2" sx={{ color: '#aaa', fontSize: '0.9rem', display: { xs: 'none', sm: 'block' } }}>
                הבית של רכבי האספנות בישראל
              </Typography>
          </Box>

          <Typography variant="caption" sx={{ color: '#666', fontSize: '0.85rem' }}>
            © {new Date().getFullYear()} כל הזכויות שמורות. נבנה באהבה לרכבים 🏎️
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};