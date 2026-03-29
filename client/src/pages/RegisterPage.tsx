// דף הרשמה למשתמשים חדשים.
// כולל ולידציה בצד הלקוח (התאמת סיסמאות, אורך סיסמה) וטיפול בשגיאות מהשרת (למשל אימייל תפוס).

import { useState } from 'react';
import { Container, Paper, Typography, TextField, Button, Box, Alert, InputAdornment, IconButton, Avatar } from '@mui/material';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import PersonAddOutlinedIcon from '@mui/icons-material/PersonAddOutlined';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const FERRARI_RED = '#d32f2f';

export const RegisterPage = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  
  // ניהול כל שדות הטופס באובייקט אחד
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // עדכון גנרי של שדות הטופס
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

    // --- ולידציות בצד הלקוח (Client-Side Validation) ---
    // חוסך קריאה לשרת אם הנתונים בבירור לא תקינים
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
      // שליחת הבקשה לשרת דרך הקונטקסט
      await register(formData.firstName, formData.lastName, formData.email, formData.password);
      
      // אם הפעולה הצליחה (לא נזרקה שגיאה), המשתמש כבר מחובר אוטומטית.
      // נעביר אותו לדף הבית.
      navigate('/'); 
    } catch (err: any) {
        console.error(err);
        // חילוץ הודעת השגיאה מהשרת (תומך גם במערך שגיאות מ-class-validator)
        const serverMsg = err.response?.data?.message;
        if (Array.isArray(serverMsg)) {
            setError(serverMsg[0]); // הצגת השגיאה הראשונה ברשימה
        } else {
            setError(serverMsg || 'שגיאה בהרשמה. נסה שוב מאוחר יותר.');
        }
    } finally {
        setLoading(false);
    }
  };

  return (
    <Box sx={{ 
        minHeight: '90vh', 
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)' 
    }}>
      <Container maxWidth="xs">
        <Paper elevation={10} sx={{ 
            p: 4, display: 'flex', flexDirection: 'column', alignItems: 'center', 
            borderRadius: 6, bgcolor: 'rgba(255, 255, 255, 0.95)', backdropFilter: 'blur(10px)'
        }}>
          
          <Avatar sx={{ m: 1, bgcolor: FERRARI_RED, width: 56, height: 56, boxShadow: '0 4px 10px rgba(211, 47, 47, 0.4)' }}>
            <PersonAddOutlinedIcon fontSize="large" />
          </Avatar>

          <Typography component="h1" variant="h4" sx={{ mb: 1, fontWeight: '800', letterSpacing: '-0.5px' }}>
            הרשמה למערכת
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
            צור חשבון חדש והתחל לקנות
          </Typography>

          {error && <Alert severity="error" sx={{ width: '100%', mb: 2, borderRadius: 2 }}>{error}</Alert>}

          <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
            
            {/* שדות שם פרטי ומשפחה בשורה אחת לחיסכון במקום */}
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                margin="normal" required fullWidth label="שם פרטי" name="firstName"
                value={formData.firstName} onChange={handleChange} autoFocus
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 50 } }}
              />
              <TextField
                margin="normal" required fullWidth label="שם משפחה" name="lastName"
                value={formData.lastName} onChange={handleChange}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 50 } }}
              />
            </Box>

            <TextField
              margin="normal" required fullWidth label="כתובת אימייל" name="email" type="email"
              value={formData.email} onChange={handleChange}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 50 } }}
            />
            
            <TextField
              margin="normal" required fullWidth label="סיסמה" name="password" 
              type={showPassword ? 'text' : 'password'} 
              value={formData.password} onChange={handleChange}
              helperText="מינימום 8 תווים"
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
            
            <TextField
              margin="normal" required fullWidth label="אימות סיסמה" name="confirmPassword" type="password"
              value={formData.confirmPassword} onChange={handleChange}
              // סימון שגיאה ויזואלי אם הסיסמאות לא תואמות תוך כדי הקלדה
              error={formData.confirmPassword !== '' && formData.password !== formData.confirmPassword}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 50 } }}
            />
            
            <Button 
              type="submit" fullWidth variant="contained" size="large" disabled={loading}
              sx={{ 
                  mt: 3, mb: 2, py: 1.5, fontSize: '1.1rem', borderRadius: 50, 
                  bgcolor: FERRARI_RED, fontWeight: 'bold',
                  boxShadow: '0 8px 20px rgba(211, 47, 47, 0.3)',
                  '&:hover': { bgcolor: '#b71c1c', boxShadow: '0 12px 25px rgba(211, 47, 47, 0.4)' }
              }}
            >
              {loading ? 'רושם...' : 'הירשם'}
            </Button>
            
            <Box sx={{ mt: 2, textAlign: 'center' }}>
              <Typography variant="body2" display="inline" color="text.secondary">
                  כבר יש לך חשבון?{' '}
              </Typography>
              <Button 
                  onClick={() => navigate('/login')} 
                  sx={{ fontWeight: 'bold', textTransform: 'none', minWidth: 'auto', p: 0, ml: 1, color: FERRARI_RED }}
              >
                  התחבר כאן
              </Button>
            </Box>

          </Box>
        </Paper>
      </Container>
    </Box>
  );
};