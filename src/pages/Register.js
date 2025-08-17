import React, { useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Alert,
  Grid,
  CircularProgress,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import viLocale from 'date-fns/locale/vi';
import { subYears } from 'date-fns';

function Register() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState({
    cccd: '',
    fullName: '',
    address: '',
    birthDate: null,
    password: '',
    confirmPassword: '',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // Kiểm tra các trường bắt buộc
      if (!formData.cccd || !formData.fullName || !formData.address || 
          !formData.birthDate || !formData.password || !formData.confirmPassword) {
        setError('Vui lòng điền đầy đủ thông tin');
        setLoading(false);
        return;
      }

      // Kiểm tra mật khẩu xác nhận
      if (formData.password !== formData.confirmPassword) {
        setError('Mật khẩu xác nhận không khớp');
        setLoading(false);
        return;
      }

      // Kiểm tra tuổi (phải trên 18 tuổi)
      const eighteenYearsAgo = subYears(new Date(), 18);
      if (formData.birthDate > eighteenYearsAgo) {
        setError('Bạn phải trên 18 tuổi để đăng ký');
        setLoading(false);
        return;
      }

      // Kiểm tra CCCD đã tồn tại chưa
      const voters = JSON.parse(localStorage.getItem('voters') || '[]');
      const existingVoter = voters.find(voter => voter.cccd === formData.cccd);
      
      if (existingVoter) {
        setError('CCCD này đã được đăng ký');
        setLoading(false);
        return;
      }

      // Lưu thông tin đăng ký
      const newVoter = {
        cccd: formData.cccd,
        fullName: formData.fullName,
        address: formData.address,
        birthDate: formData.birthDate.toISOString(),
        password: formData.password,
      };

      voters.push(newVoter);
      localStorage.setItem('voters', JSON.stringify(voters));

      // Lưu thông tin đăng nhập
      localStorage.setItem('voterCCCD', formData.cccd);
      localStorage.setItem('voterName', formData.fullName);
      localStorage.setItem('isVoter', 'true');

      setSuccess('Đăng ký thành công!');
      
      // Chuyển hướng sau 1.5 giây
      setTimeout(() => {
        navigate('/elections');
      }, 1500);
    } catch (error) {
      console.error('Error during registration:', error);
      setError('Không thể đăng ký. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 8, mb: 4 }}>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3 }}>
              <AccountCircleIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
              <Typography variant="h4" component="h1" gutterBottom>
                Đăng Ký Cử Tri
              </Typography>
              <Typography variant="body2" color="text.secondary" align="center">
                Vui lòng điền đầy đủ thông tin để đăng ký tài khoản cử tri
              </Typography>
            </Box>

            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            {success && (
              <Alert severity="success" sx={{ mb: 2 }}>
                {success}
              </Alert>
            )}

            <form onSubmit={handleSubmit}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="CCCD"
                    value={formData.cccd}
                    onChange={(e) => setFormData({ ...formData, cccd: e.target.value })}
                    margin="normal"
                    required
                    placeholder="12 số CCCD"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Họ và tên"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    margin="normal"
                    required
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Địa chỉ"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    margin="normal"
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={viLocale}>
                    <DatePicker
                      label="Ngày sinh"
                      value={formData.birthDate}
                      onChange={(date) => setFormData({ ...formData, birthDate: date })}
                      renderInput={(params) => (
                        <TextField {...params} fullWidth margin="normal" required />
                      )}
                      maxDate={subYears(new Date(), 18)}
                      format="dd/MM/yyyy"
                    />
                  </LocalizationProvider>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Mật khẩu"
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    margin="normal"
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Xác nhận mật khẩu"
                    type="password"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    margin="normal"
                    required
                  />
                </Grid>
              </Grid>

              <Button
                fullWidth
                type="submit"
                variant="contained"
                color="primary"
                size="large"
                disabled={loading}
                sx={{ mt: 3 }}
              >
                {loading ? (
                  <CircularProgress size={24} color="inherit" />
                ) : (
                  'Đăng Ký'
                )}
              </Button>
            </form>

            <Box sx={{ mt: 3, textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                Đã có tài khoản?{' '}
                <Button
                  color="primary"
                  onClick={() => navigate('/login')}
                  sx={{ textTransform: 'none' }}
                >
                  Đăng nhập ngay
                </Button>
              </Typography>
            </Box>

            <Box sx={{ mt: 2, textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                Quay lại{' '}
                <Button
                  color="primary"
                  onClick={() => navigate('/')}
                  sx={{ textTransform: 'none' }}
                >
                  trang chủ
                </Button>
              </Typography>
            </Box>

            <Box sx={{ mt: 3, bgcolor: '#f5f5f5', p: 2, borderRadius: 1 }}>
              <Typography variant="body2" color="text.secondary" align="center">
                <strong>Lưu ý:</strong> Bạn phải trên 18 tuổi để đăng ký tài khoản cử tri.
                Thông tin của bạn sẽ được bảo mật và chỉ sử dụng cho mục đích bầu cử.
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Box>
    </Container>
  );
}

export default Register; 