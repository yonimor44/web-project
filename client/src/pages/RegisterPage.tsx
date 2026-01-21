import { useState } from 'react';
import { Container, Paper, Typography, TextField, Button, Box, Alert } from '@mui/material';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export const RegisterPage = () => {
  const { register } = useAuth(); // הפונקציה מהקונטקסט
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: ''
  });
  
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // בדיקה בסיסית לפני שליחה
    if (formData.password.length < 6) {
        setError('הסיסמה חייבת להכיל לפחות 6 תווים');
        return;
    }

    try {
      // שולחים את המידע לשרת דרך הקונטקסט
      await register(formData.firstName, formData.lastName, formData.email, formData.password);
      
      // אם ההרשמה הצליחה, הקונטקסט כבר יחבר אותנו אוטומטית
      navigate('/'); // מעבירים לדף הבית
    } catch (err: any) {
        console.error(err);
        // מציגים את השגיאה שהשרת החזיר (למשל: "משתמש כבר קיים")
        setError(err.response?.data?.message || 'שגיאה בהרשמה. נסה שוב מאוחר יותר.');
    }
  };

  return (
    <Container maxWidth="xs" sx={{ mt: 8 }}>
      <Paper elevation={3} sx={{ p: 4, display: 'flex', flexDirection: 'column', alignItems: 'center', borderRadius: 2 }}>
        
        <Typography component="h1" variant="h4" sx={{ mb: 1, fontWeight: 'bold' }}>
          הרשמה למערכת 📝
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
          צור חשבון חדש והתחל לקנות
        </Typography>

        {error && <Alert severity="error" sx={{ width: '100%', mb: 2 }}>{error}</Alert>}

        <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
          
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
                margin="normal" required fullWidth label="שם פרטי" name="firstName"
                value={formData.firstName} onChange={handleChange} autoFocus
            />
            <TextField
                margin="normal" required fullWidth label="שם משפחה" name="lastName"
                value={formData.lastName} onChange={handleChange}
            />
          </Box>

          <TextField
            margin="normal" required fullWidth label="כתובת אימייל" name="email" type="email"
            value={formData.email} onChange={handleChange}
          />
          
          <TextField
            margin="normal" required fullWidth label="סיסמה" name="password" type="password"
            value={formData.password} onChange={handleChange}
            helperText="מינימום 6 תווים"
          />
          
          <Button 
            type="submit" 
            fullWidth 
            variant="contained" 
            size="large" 
            sx={{ mt: 3, mb: 2, py: 1.5, fontSize: '1.1rem' }}
          >
            הירשם
          </Button>
          
          <Box sx={{ mt: 2, textAlign: 'center' }}>
            <Typography variant="body2" display="inline">
                כבר יש לך חשבון?{' '}
            </Typography>
            <Button 
                onClick={() => navigate('/login')} 
                sx={{ fontWeight: 'bold', textTransform: 'none', minWidth: 'auto', p: 0, ml: 1 }}
            >
                התחבר כאן
            </Button>
          </Box>

        </Box>
      </Paper>
    </Container>
  );
};