import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  Alert,
  CircularProgress,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';

function AdminLogin() {
  const navigate = useNavigate();
  const [cccd, setCCCD] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    // Kiểm tra nếu đã đăng nhập admin, chuyển hướng đến trang quản trị
    const isAdmin = localStorage.getItem('isAdmin') === 'true';
    if (isAdmin) {
      navigate('/admin/dashboard');
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    setSuccess(false);

    try {
      // Kiểm tra CCCD và mật khẩu từ dữ liệu lưu trong localStorage
      const loginData = JSON.parse(localStorage.getItem('loginData') || '{}');
      
      // Nếu chưa có dữ liệu, tạo dữ liệu mẫu admin mặc định
      if (Object.keys(loginData).length === 0) {
        // Admin mặc định
        loginData['094303000777'] = {
          password: 'NfEqnqX8',
          isAdmin: true,
          name: 'Admin System'
        };
        localStorage.setItem('loginData', JSON.stringify(loginData));
      }
      
      // Kiểm tra thông tin đăng nhập
      const userData = loginData[cccd];
      
      if (userData && userData.password === password && userData.isAdmin) {
        // Lưu thông tin admin vào localStorage
        localStorage.setItem('adminCCCD', cccd);
        localStorage.setItem('adminName', userData.name);
        localStorage.setItem('isAdmin', 'true');
        
        // Đặt trạng thái thành công và đợi 1 giây trước khi chuyển hướng
        setSuccess(true);
        
        setTimeout(() => {
          // Chuyển hướng đến trang quản trị
          navigate('/admin/dashboard');
        }, 1000);
      } else {
        setError('CCCD hoặc mật khẩu không chính xác');
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('Đã xảy ra lỗi khi đăng nhập. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 8, mb: 4 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom align="center">
            Đăng nhập Quản trị viên
          </Typography>
          
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          
          {success && (
            <Alert severity="success" sx={{ mb: 2 }}>
              Đăng nhập thành công! Đang chuyển hướng...
            </Alert>
          )}
          
          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="CCCD"
              variant="outlined"
              margin="normal"
              value={cccd}
              onChange={(e) => setCCCD(e.target.value)}
              required
              placeholder="Nhập CCCD: 094303000777"
              disabled={loading || success}
            />
            <TextField
              fullWidth
              label="Mật khẩu"
              type="password"
              variant="outlined"
              margin="normal"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Nhập mật khẩu: NfEqnqX8"
              disabled={loading || success}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              color="primary"
              size="large"
              sx={{ mt: 3 }}
              disabled={loading || success}
            >
              {loading ? (
                <CircularProgress size={24} color="inherit" />
              ) : success ? (
                'Đã đăng nhập'
              ) : (
                'Đăng nhập'
              )}
            </Button>
          </form>
          
          <Box sx={{ mt: 3, textAlign: 'center' }}>
            <Button
              color="primary"
              onClick={() => navigate('/')}
            >
              Quay lại trang chủ
            </Button>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
}

export default AdminLogin; 