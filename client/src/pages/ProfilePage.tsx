// דף פרופיל המשתמש.
// מחולק ל-Grid: צד ימין לפרטי חשבון וסיסמה, צד שמאל לעדכון פרטים וכתובת.
// משתמש ב-usersService לעדכון הנתונים וב-refreshUser כדי לסנכרן את האפליקציה.

import { useState, useEffect } from 'react';
import { Container, Paper, TextField, Button, Box, Avatar, Divider, Alert, CircularProgress, Grid } from '@mui/material';
import Typography from '@mui/material/Typography';
import PersonIcon from '@mui/icons-material/Person';
import SaveIcon from '@mui/icons-material/Save';
import HomeIcon from '@mui/icons-material/Home';
import KeyIcon from '@mui/icons-material/Key';
import { useAuth } from '../context/AuthContext';
import { usersService } from '../services/users.service';

const FERRARI_RED = '#d32f2f';

export const ProfilePage = () => {
  const { user, refreshUser } = useAuth() as any; 
  
  // State לטופס הפרטים האישיים
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    defaultAddress: '',
    defaultCity: '',
    defaultPhone: ''
  });

  // מילוי הטופס בנתונים הקיימים (אם יש משתמש)
  useEffect(() => {
    if (user) {
        setFormData({
            firstName: user.firstName || '',
            lastName: user.lastName || '',
            defaultAddress: user.defaultAddress || '',
            defaultCity: user.defaultCity || '',
            defaultPhone: user.defaultPhone || ''
        });
    }
  }, [user]);

  // State נפרד לשינוי סיסמה
  const [passData, setPassData] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [showPassword, setShowPassword] = useState(false);

  // States להודעות הצלחה/שגיאה (נפרד לכל חלק כדי לא לבלבל)
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [profileMsg, setProfileMsg] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const [loadingPass, setLoadingPass] = useState(false);
  const [passMsg, setPassMsg] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePassChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassData({ ...passData, [e.target.name]: e.target.value });
  };

  // שמירת פרטים וכתובת
  const handleSaveProfile = async () => {
    setLoadingProfile(true);
    setProfileMsg(null);
    try {
      await usersService.updateProfile(formData);
      setProfileMsg({ type: 'success', text: 'הפרטים והכתובת נשמרו בהצלחה!' });
      
      // עדכון הקונטקסט הגלובלי כדי שהשינויים ישתקפו מיד (למשל השם בנאבבר)
      if (refreshUser) await refreshUser();
      
    } catch (error) {
      setProfileMsg({ type: 'error', text: 'שגיאה בשמירת הפרטים.' });
    } finally {
      setLoadingProfile(false);
    }
  };

  // שינוי סיסמה
  const handleChangePassword = async () => {
      if (passData.newPassword !== passData.confirmPassword) {
          setPassMsg({ type: 'error', text: 'הסיסמאות החדשות אינן תואמות' });
          return;
      }
      if (passData.newPassword.length < 6) {
          setPassMsg({ type: 'error', text: 'הסיסמה חייבת להכיל לפחות 6 תווים' });
          return;
      }

      setLoadingPass(true);
      setPassMsg(null);
      try {
          await usersService.changePassword({ 
              currentPassword: passData.currentPassword, 
              newPassword: passData.newPassword 
          });
          setPassMsg({ type: 'success', text: 'הסיסמה שונתה בהצלחה!' });
          setPassData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      } catch (error: any) {
          const errMsg = error.response?.data?.message || 'שגיאה בשינוי הסיסמה';
          setPassMsg({ type: 'error', text: errMsg });
      } finally {
          setLoadingPass(false);
      }
  };

  if (!user) return null;

  return (
    <Container maxWidth="lg" sx={{ mt: 6, mb: 6 }}>
      
      <Box sx={{ textAlign: 'center', mb: 6 }}>
        <Typography variant="h3" fontWeight="900" sx={{ letterSpacing: '-1px' }}>הפרופיל שלי 👤</Typography>
      </Box>

      <Grid container spacing={4}>
        
        {/* --- עמודה ימנית (במסך גדול): תמונה וסיסמה --- */}
        <Grid size={{ xs: 12, md: 4 }}>
            <Paper elevation={0} sx={{ p: 4, borderRadius: 6, textAlign: 'center', border: '1px solid #e0e0e0', mb: 3 }}>
                <Avatar 
                    src={user.picture} 
                    imgProps={{ referrerPolicy: 'no-referrer' }} 
                    sx={{ width: 100, height: 100, bgcolor: FERRARI_RED, fontSize: '2.5rem', mb: 2, mx: 'auto', boxShadow: '0 4px 15px rgba(211, 47, 47, 0.3)' }}
                >
                    {!user.picture && user.firstName?.charAt(0).toUpperCase()}
                </Avatar>
                <Typography variant="h6" fontWeight="bold">{user.firstName} {user.lastName}</Typography>
                <Typography variant="body2" color="text.secondary">{user.email}</Typography>
            </Paper>

            <Paper elevation={0} sx={{ p: 4, borderRadius: 6, border: '1px solid #e0e0e0' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, gap: 1 }}>
                    <KeyIcon sx={{ color: FERRARI_RED }} />
                    <Typography variant="h6" fontWeight="bold">שינוי סיסמה</Typography>
                </Box>
                
                {passMsg && <Alert severity={passMsg.type} sx={{ mb: 2, borderRadius: 2 }}>{passMsg.text}</Alert>}

                {user.provider === 'google' ? (
                     <Typography variant="body2" color="text.secondary">לא ניתן לשנות סיסמה למשתמשי Google</Typography>
                ) : (
                    <>
                        <TextField fullWidth type={showPassword ? "text" : "password"} label="סיסמה נוכחית" name="currentPassword" margin="dense" value={passData.currentPassword} onChange={handlePassChange} sx={{ '& .MuiOutlinedInput-root': { borderRadius: 4 } }} />
                        <TextField fullWidth type={showPassword ? "text" : "password"} label="סיסמה חדשה" name="newPassword" margin="dense" value={passData.newPassword} onChange={handlePassChange} sx={{ '& .MuiOutlinedInput-root': { borderRadius: 4 } }} />
                        <TextField fullWidth type={showPassword ? "text" : "password"} label="אימות סיסמה" name="confirmPassword" margin="dense" value={passData.confirmPassword} onChange={handlePassChange} sx={{ '& .MuiOutlinedInput-root': { borderRadius: 4 } }} />
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
                            <Button size="small" onClick={() => setShowPassword(!showPassword)}>{showPassword ? 'הסתר' : 'הצג'}</Button>
                            <Button variant="contained" onClick={handleChangePassword} disabled={loadingPass} sx={{ borderRadius: 50, bgcolor: FERRARI_RED }}>עדכן</Button>
                        </Box>
                    </>
                )}
            </Paper>
        </Grid>

        {/* --- עמודה שמאלית: פרטים אישיים וכתובת --- */}
        <Grid size={{ xs: 12, md: 8 }}>
            <Paper elevation={0} sx={{ p: 5, borderRadius: 6, bgcolor: '#fbfbfb', border: '1px solid #e0e0e0' }}>
                
                {profileMsg && <Alert severity={profileMsg.type} sx={{ mb: 3, borderRadius: 4 }}>{profileMsg.text}</Alert>}

                {/* חלק 1: שדות שם */}
                <Box sx={{ mb: 4 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, gap: 1 }}>
                        <PersonIcon sx={{ color: FERRARI_RED }} />
                        <Typography variant="h6" fontWeight="bold">פרטים אישיים</Typography>
                    </Box>
                    <Grid container spacing={2}>
                        <Grid size={{ xs: 12, sm: 6 }}><TextField label="שם פרטי" name="firstName" fullWidth value={formData.firstName} onChange={handleChange} sx={{ '& .MuiOutlinedInput-root': { borderRadius: 4, bgcolor: 'white' } }} /></Grid>
                        <Grid size={{ xs: 12, sm: 6 }}><TextField label="שם משפחה" name="lastName" fullWidth value={formData.lastName} onChange={handleChange} sx={{ '& .MuiOutlinedInput-root': { borderRadius: 4, bgcolor: 'white' } }} /></Grid>
                    </Grid>
                </Box>

                <Divider sx={{ my: 3 }} />

                {/* חלק 2: שדות כתובת */}
                <Box sx={{ mb: 4 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, gap: 1 }}>
                        <HomeIcon sx={{ color: FERRARI_RED }} />
                        <Typography variant="h6" fontWeight="bold">כתובת ברירת מחדל</Typography>
                    </Box>
                    <Grid container spacing={2}>
                        <Grid size={{ xs: 12 }}><TextField label="כתובת מלאה" name="defaultAddress" fullWidth value={formData.defaultAddress} onChange={handleChange} sx={{ '& .MuiOutlinedInput-root': { borderRadius: 4, bgcolor: 'white' } }} /></Grid>
                        <Grid size={{ xs: 12, sm: 6 }}><TextField label="עיר" name="defaultCity" fullWidth value={formData.defaultCity} onChange={handleChange} sx={{ '& .MuiOutlinedInput-root': { borderRadius: 4, bgcolor: 'white' } }} /></Grid>
                        <Grid size={{ xs: 12, sm: 6 }}><TextField label="טלפון" name="defaultPhone" fullWidth value={formData.defaultPhone} onChange={handleChange} sx={{ '& .MuiOutlinedInput-root': { borderRadius: 4, bgcolor: 'white' } }} /></Grid>
                    </Grid>
                </Box>

                <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                    <Button 
                        variant="contained" size="large" onClick={handleSaveProfile} disabled={loadingProfile}
                        startIcon={loadingProfile ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
                        sx={{ px: 5, py: 1.5, borderRadius: 50, bgcolor: FERRARI_RED, boxShadow: '0 8px 20px rgba(211, 47, 47, 0.25)', '&:hover': { bgcolor: '#b71c1c' } }}
                    >
                        {loadingProfile ? 'שומר...' : 'שמור הכל'}
                    </Button>
                </Box>
            </Paper>
        </Grid>

      </Grid>
    </Container>
  );
};