import { useState, useEffect } from 'react';
import { Container, Paper, Typography, TextField, Button, Box, Divider, Alert, InputAdornment, IconButton } from '@mui/material';
import GoogleIcon from '@mui/icons-material/Google';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const LoginPage = () => {
  const { login, loginWithToken } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  
  // סטייט חדש להצגה/הסתרה של הסיסמה
  const [showPassword, setShowPassword] = useState(false);

  // 1. טיפול בחזרה מגוגל
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get('token');
    if (token) {
      loginWithToken(token); 
      navigate('/'); 
    }
  }, [location, loginWithToken, navigate]);

  const handleGoogleLogin = () => {
    window.location.href = 'http://localhost:3000/auth/google';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      await login(email, password);
      navigate('/'); 
    } catch (err: any) {
      console.error(err);
      setError('שם משתמש או סיסמה שגויים');
    }
  };

  // פונקציה להחלפת מצב תצוגת סיסמה
  const handleClickShowPassword = () => setShowPassword((show) => !show);

  return (
    <Container maxWidth="xs" sx={{ mt: 8 }}>
      <Paper elevation={3} sx={{ p: 4, display: 'flex', flexDirection: 'column', alignItems: 'center', borderRadius: 2 }}>
        
        <Typography component="h1" variant="h4" sx={{ mb: 1, fontWeight: 'bold' }}>
          התחברות 🔐
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
          ברוך הבא! התחבר כדי להמשיך
        </Typography>

        {error && <Alert severity="error" sx={{ width: '100%', mb: 2 }}>{error}</Alert>}

        <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
          <TextField
            margin="normal"
            required
            fullWidth
            label="כתובת אימייל"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoFocus
          />
          
          {/* שדה סיסמה משודרג עם כפתור עין */}
          <TextField
            margin="normal"
            required
            fullWidth
            label="סיסמה"
            type={showPassword ? 'text' : 'password'} // משתנה לפי הסטייט
            value={password}
            onChange={(e) => setPassword(e.target.value)}
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
          
          <Box sx={{ textAlign: 'left', mt: 1 }}>
            <Button size="small" onClick={() => alert('אל דאגה, מנגנון שחזור סיסמה יפותח בקרוב!')} sx={{ textTransform: 'none' }}>
              שכחתי סיסמה?
            </Button>
          </Box>

          <Button 
            type="submit" 
            fullWidth 
            variant="contained" 
            size="large" 
            sx={{ mt: 3, mb: 2, py: 1.5, fontSize: '1.1rem' }}
          >
            התחבר
          </Button>
        </Box>

        <Divider sx={{ width: '100%', my: 2 }}>או</Divider>

        <Button
          variant="outlined"
          fullWidth
          startIcon={<GoogleIcon />}
          onClick={handleGoogleLogin}
          sx={{ mb: 3, py: 1.5, borderColor: '#ddd', color: '#555' }}
        >
          המשך עם Google
        </Button>

        <Box sx={{ mt: 1, textAlign: 'center' }}>
          <Typography variant="body2" display="inline">
            אין לך עדיין חשבון?{' '}
          </Typography>
          <Button 
            onClick={() => navigate('/register')} 
            sx={{ fontWeight: 'bold', textTransform: 'none', minWidth: 'auto', p: 0, ml: 1 }}
          >
            הירשם כאן
          </Button>
        </Box>

      </Paper>
    </Container>
  );
};