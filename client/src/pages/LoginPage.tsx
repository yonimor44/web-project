// דף התחברות למערכת.
// תומך בהתחברות רגילה (אימייל/סיסמה) והתחברות דרך Google OAuth.
// מזהה אם המשתמש הגיע מקישור עם טוקן ומבצע התחברות אוטומטית.

import { useState, useEffect } from 'react';
import { Container, Paper, Typography, TextField, Button, Box, Divider, Alert, InputAdornment, IconButton, Avatar } from '@mui/material';
import GoogleIcon from '@mui/icons-material/Google';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const FERRARI_RED = '#d32f2f';

export const LoginPage = () => {
  const { login, loginWithToken } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // --- טיפול בחזרה מגוגל ---
  // אם הגענו לדף הזה עם פרמטר 'token' ב-URL, סימן שהשרת הפנה אותנו לכאן אחרי לוגין מוצלח בגוגל.
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get('token');
    
    const handleGoogleRedirect = async () => {
        if (token) {
            try {
                // שימוש בטוקן כדי להיכנס למערכת
                const user = await loginWithToken(token) as any; 
                // ניתוב לפי הרשאות
                if (user?.role === 'admin') {
                    navigate('/admin');
                } else {
                    navigate('/');
                }
            } catch (e) {
                navigate('/');
            }
        }
    };

    handleGoogleRedirect();
  }, [location, loginWithToken, navigate]);

  const handleGoogleLogin = () => {
    // הפניה ל-Endpoint בשרת שמתחיל את תהליך ה-OAuth
    window.location.href = 'http://localhost:3000/auth/google';
  };
  
  // --- טיפול בטופס התחברות רגיל ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const user = await login(email, password) as any;
      // ניתוב חכם לפי תפקיד
      if (user?.role === 'admin') {
          navigate('/admin');
      } else {
          navigate('/');
      }
    } catch (err: any) {
      console.error(err);
      setError('שם משתמש או סיסמה שגויים');
    }
  };

  const handleClickShowPassword = () => setShowPassword((show) => !show);

  return (
    <Box sx={{ 
        minHeight: '90vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)' // רקע יוקרתי
    }}>
      <Container maxWidth="xs">
        <Paper elevation={10} sx={{ 
            p: 5, 
            display: 'flex', flexDirection: 'column', alignItems: 'center', 
            borderRadius: 6, 
            bgcolor: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)'
        }}>
          
          <Avatar sx={{ m: 1, bgcolor: FERRARI_RED, width: 56, height: 56, boxShadow: '0 4px 10px rgba(211, 47, 47, 0.4)' }}>
            <LockOutlinedIcon fontSize="large" />
          </Avatar>
          
          <Typography component="h1" variant="h4" sx={{ mb: 1, fontWeight: '800', letterSpacing: '-0.5px' }}>
            התחברות
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
              ברוך הבא! התחבר כדי להמשיך
          </Typography>

          {error && <Alert severity="error" sx={{ width: '100%', mb: 2, borderRadius: 2 }}>{error}</Alert>}

          <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
            <TextField
              margin="normal" required fullWidth autoFocus
              label="כתובת אימייל" type="email"
              value={email} onChange={(e) => setEmail(e.target.value)}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 50 } }}
            />
            
            <TextField
              margin="normal" required fullWidth
              label="סיסמה"
              type={showPassword ? 'text' : 'password'} 
              value={password} onChange={(e) => setPassword(e.target.value)}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 50 } }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={handleClickShowPassword} edge="end" sx={{ mr: 1 }}>
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            
            <Box sx={{ textAlign: 'left', mt: 1, ml: 1 }}>
              <Button size="small" onClick={() => alert('מנגנון שחזור סיסמה בפיתוח')} sx={{ textTransform: 'none', color: 'text.secondary', fontWeight: 'bold' }}>
                שכחתי סיסמה?
              </Button>
            </Box>

            <Button 
              type="submit" fullWidth variant="contained" size="large" 
              sx={{ 
                  mt: 3, mb: 2, py: 1.5, fontSize: '1.1rem', 
                  borderRadius: 50, bgcolor: FERRARI_RED, fontWeight: 'bold',
                  boxShadow: '0 8px 20px rgba(211, 47, 47, 0.3)',
                  '&:hover': { bgcolor: '#b71c1c', boxShadow: '0 12px 25px rgba(211, 47, 47, 0.4)' }
              }}
            >
              התחבר
            </Button>
          </Box>

          <Divider sx={{ width: '100%', my: 2, fontSize: '0.8rem', color: 'text.secondary' }}>או</Divider>

          <Button
            variant="outlined" fullWidth startIcon={<GoogleIcon />}
            onClick={handleGoogleLogin}
            sx={{ 
                mb: 3, py: 1.5, borderRadius: 50, 
                borderColor: '#e0e0e0', color: '#555', fontWeight: 'bold',
                '&:hover': { borderColor: '#bdbdbd', bgcolor: 'transparent' }
            }}
          >
            המשך עם Google
          </Button>

          <Box sx={{ mt: 1, textAlign: 'center' }}>
            <Typography variant="body2" display="inline" color="text.secondary">
              אין לך עדיין חשבון?{' '}
            </Typography>
            <Button 
              onClick={() => navigate('/register')} 
              sx={{ fontWeight: 'bold', textTransform: 'none', minWidth: 'auto', p: 0, ml: 1, color: FERRARI_RED }}
            >
              הירשם כאן
            </Button>
          </Box>

        </Paper>
      </Container>
    </Box>
  );
};