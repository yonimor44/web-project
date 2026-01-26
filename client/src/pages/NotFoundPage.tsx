import { Container, Typography, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import ReportProblemIcon from '@mui/icons-material/ReportProblem';

const FERRARI_RED = '#d32f2f';

export const NotFoundPage = () => {
  const navigate = useNavigate();

  return (
    <Container maxWidth="sm" sx={{ textAlign: 'center', mt: 10, minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      <ReportProblemIcon sx={{ fontSize: 100, color: '#bdbdbd', mb: 2 }} />
      <Typography variant="h2" fontWeight="900" sx={{ color: '#333' }}>
        404
      </Typography>
      <Typography variant="h5" gutterBottom fontWeight="bold" sx={{ mb: 1 }}>
        ירדת מהמסלול! 🛑
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        הדף שחיפשת לא נמצא. אולי הוא נסע מהר מדי?
      </Typography>
      
      <Button 
        variant="contained" 
        size="large"
        onClick={() => navigate('/')}
        sx={{ 
            borderRadius: 50, px: 4, py: 1.5, fontWeight: 'bold', fontSize: '1.1rem',
            bgcolor: FERRARI_RED, '&:hover': { bgcolor: '#b71c1c' }
        }}
      >
        חזרה לדף הבית
      </Button>
    </Container>
  );
};