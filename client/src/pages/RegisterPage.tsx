import { useState } from 'react';
import { Container, Paper, Typography, TextField, Button, Box, Alert, InputAdornment, IconButton } from '@mui/material';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export const RegisterPage = () => {
  const { register } = useAuth(); // שימוש בקונטקסט
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '' // 1. שדה חדש לאימות
  });

  const [showPassword, setShowPassword] = useState(false); // 2. מצב תצוגת סיסמה
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleClickShowPassword = () => setShowPassword((show) => !show);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // 3. בדיקת תאימות סיסמאות
    if (formData.password !== formData.confirmPassword) {
        setError('הסיסמאות אינן תואמות! אנא נסה שוב.');
        return;
    }

    if (formData.password.length < 6) {
        setError('הסיסמה חייבת להכיל לפחות 6 תווים');
        return;
    }

    setLoading(true);

    try {
      // שולחים לשרת רק את מה שצריך (בלי confirmPassword)
      await register(formData.firstName, formData.lastName, formData.email, formData.password);
      
      // אם ההרשמה הצליחה, מציגים הודעה ומעבירים לדף הבית
      // (בדרך כלל register ב-AuthContext גם עושה לוגין אוטומטי ושומר את הטוקן)
      navigate('/'); 
    } catch (err: any) {
        console.error(err);
        const serverMsg = err.response?.data?.message;
        if (Array.isArray(serverMsg)) {
            setError(serverMsg[0]);
        } else {
            setError(serverMsg || 'שגיאה בהרשמה. נסה שוב מאוחר יותר.');
        }
    } finally {
        setLoading(false);
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
          
          {/* שדה סיסמה עם כפתור העין */}
          <TextField
            margin="normal" 
            required 
            fullWidth 
            label="סיסמה" 
            name="password" 
            type={showPassword ? 'text' : 'password'} 
            value={formData.password} 
            onChange={handleChange}
            helperText="מינימום 6 תווים"
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    aria-label="toggle password visibility"
                    onClick={handleClickShowPassword}
                    edge="end"
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
          
          {/* שדה אימות סיסמה */}
          <TextField
            margin="normal" 
            required 
            fullWidth 
            label="אימות סיסמה" 
            name="confirmPassword" 
            type="password"
            value={formData.confirmPassword} 
            onChange={handleChange}
            error={formData.confirmPassword !== '' && formData.password !== formData.confirmPassword}
          />
          
          <Button 
            type="submit" 
            fullWidth 
            variant="contained" 
            size="large" 
            disabled={loading}
            sx={{ mt: 3, mb: 2, py: 1.5, fontSize: '1.1rem' }}
          >
            {loading ? 'רושם...' : 'הירשם'}
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