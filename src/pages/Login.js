import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Alert,
  CircularProgress,
  Link,
  InputAdornment,
  IconButton,
  Paper,
  useTheme,
  useMediaQuery,
  Fade,
  Slide,
  Grow,
  Divider,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import PersonIcon from '@mui/icons-material/Person';
import { useWeb3React } from '@web3-react/core';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { GoogleReCaptchaProvider, useGoogleReCaptcha } from 'react-google-recaptcha-v3';
import LoginIcon from '@mui/icons-material/Login';
import SecurityIcon from '@mui/icons-material/Security';
import LockIcon from '@mui/icons-material/Lock';
import Chatbot from '../components/Chatbot';

const RECAPTCHA_SITE_KEY = '6LcykYsrAAAAAFkUzlKj6ppo4wfNSY7vr0d95Sz_';

function LoginForm() {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { account } = useWeb3React();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    cccd: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [step, setStep] = useState(0);
  const { executeRecaptcha } = useGoogleReCaptcha();

  // Animation effect for form fields
  useEffect(() => {
    const timer = setTimeout(() => setStep(1), 300);
    return () => clearTimeout(timer);
  }, []);

  // Xử lý đăng nhập
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      if (!formData.cccd || !formData.password) {
        setError('Vui lòng nhập đầy đủ thông tin');
        setLoading(false);
        return;
      }
      if (!executeRecaptcha) {
        setError('Không thể xác thực reCAPTCHA. Vui lòng thử lại sau.');
        setLoading(false);
        return;
      }
      const recaptchaToken = await executeRecaptcha('login');
      console.log('reCAPTCHA token:', recaptchaToken);
      if (!recaptchaToken) {
        setError('Không lấy được mã xác thực reCAPTCHA. Vui lòng thử lại.');
        setLoading(false);
        return;
      }
      let data;
      let response;
      try {
        response = await fetch('http://localhost:5000/api/voters/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            cccd: formData.cccd,
            password: formData.password,
            recaptchaToken,
          }),
        });
        try {
          data = await response.json();
        } catch (jsonErr) {
          setError('Lỗi khi phân tích dữ liệu trả về từ server.');
          setLoading(false);
          console.error('JSON parse error:', jsonErr);
          return;
        }
      } catch (fetchErr) {
        setError('Không thể kết nối tới server. Vui lòng kiểm tra mạng hoặc thử lại sau.');
        setLoading(false);
        console.error('Fetch error:', fetchErr);
        return;
      }
      if (!response.ok) {
        // Xử lý rate limit errors
        if (response.status === 429) {
          const rateLimitMessage = data?.error || 'Quá nhiều lần đăng nhập thất bại, vui lòng thử lại sau';
          setError(rateLimitMessage);
          setLoading(false);
          return;
        }
        
        setError(data?.error || 'Đăng nhập thất bại');
        setLoading(false);
        return;
      }
      // Lưu JWT vào localStorage
      localStorage.setItem('jwt', data.token);
      localStorage.setItem('isVoter', 'true');
      localStorage.setItem('voterCCCD', data.voter.cccd);
      localStorage.setItem('voterName', data.voter.fullName);
      if (account) {
        localStorage.setItem('walletAddress', account);
      }
      // Tắt timeout để tránh lỗi
      // setTimeout(() => {
      //   navigate('/elections');
      // }, 500);
      navigate('/elections');
    } catch (error) {
      setError('Có lỗi xảy ra khi đăng nhập. Vui lòng thử lại sau.');
      console.error('Login error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        paddingTop: 10,
        paddingBottom: 10,
        backgroundColor: '#ffffff',
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%230f6b5f" fill-opacity="0.03"%3E%3Ccircle cx="30" cy="30" r="2"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
          opacity: 0.5,
        },
      }}
    >
      {/* Chatbot Component */}
      <Chatbot />

      {/* Floating background elements */}
      <Box
        sx={{
          position: 'absolute',
          top: '15%',
          left: '10%',
          width: 180,
          height: 180,
          borderRadius: '50%',
          background: 'linear-gradient(45deg, rgba(15, 107, 95, 0.05), rgba(15, 150, 133, 0.03))',
          animation: 'float 7s ease-in-out infinite',
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          top: '70%',
          right: '15%',
          width: 120,
          height: 120,
          borderRadius: '50%',
          background: 'linear-gradient(45deg, rgba(15, 107, 95, 0.04), rgba(15, 150, 133, 0.02))',
          animation: 'float 9s ease-in-out infinite reverse',
        }}
      />

      <Container maxWidth="lg" sx={{ 
        minHeight: '100vh',
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        position: 'relative',
        zIndex: 1,
      }}>
        <Box sx={{ 
          display: 'flex',
          flexDirection: { xs: 'column', lg: 'row' },
          alignItems: 'center',
          justifyContent: 'center',
          width: '100%',
          gap: 4,
        }}>
          {/* Left side - Welcome content */}
          <Fade in={step >= 0} timeout={800}>
            <Box
              sx={{
                display: { xs: 'none', lg: 'flex' },
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
                color: '#0f6b5f',
                maxWidth: 400,
                p: 4,
              }}
            >
              <Slide direction="right" in={step >= 0} timeout={1000}>
                <Box sx={{ mb: 4 }}>
                  <Box
                    sx={{
                      width: 120,
                      height: 120,
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, rgba(15, 107, 95, 0.1), rgba(15, 150, 133, 0.05))',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mb: 3,
                      backdropFilter: 'blur(10px)',
                      border: '1px solid rgba(15, 107, 95, 0.1)',
                    }}
                  >
                    <LoginIcon sx={{ fontSize: 60, color: '#0f6b5f' }} />
                  </Box>
                  <Typography 
                    variant="h3" 
                    component="h1" 
                    gutterBottom
                    sx={{
                      fontWeight: 600,
                      color: '#0f6b5f',
                      mb: 2,
                    }}
                  >
                    Chào mừng trở lại!
                  </Typography>
                  <Typography 
                    variant="h6" 
                    sx={{
                      fontWeight: 400,
                      color: '#0f6b5f',
                      lineHeight: 1.6,
                      mb: 3,
                    }}
                  >
                    Đăng nhập để tham gia bỏ phiếu và thực hiện quyền công dân của mình
                  </Typography>
                  
                  {/* Feature highlights */}
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 4 }}>
                    {[
                      { icon: <SecurityIcon />, text: 'Bảo mật cao với blockchain' },
                      { icon: <PersonIcon />, text: 'Xác thực danh tính an toàn' },
                      { icon: <LockIcon />, text: 'Mã hóa đầu cuối' },
                    ].map((feature, index) => (
                      <Grow in={step >= 0} timeout={1200 + index * 200} key={index}>
                        <Box
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 2,
                            p: 2,
                            borderRadius: 2,
                            background: 'rgba(15, 107, 95, 0.05)',
                            backdropFilter: 'blur(10px)',
                            border: '1px solid rgba(15, 107, 95, 0.1)',
                          }}
                        >
                          <Box sx={{ color: '#0f6b5f', opacity: 0.9 }}>
                            {feature.icon}
                          </Box>
                          <Typography variant="body1" sx={{ fontWeight: 500, color: '#0f6b5f' }}>
                            {feature.text}
                          </Typography>
                        </Box>
                      </Grow>
                    ))}
                  </Box>
                </Box>
              </Slide>
            </Box>
          </Fade>

          {/* Right side - Login form */}
          <Grow in={step >= 1} timeout={1000}>
            <Paper 
              elevation={8}
              sx={{
                p: { xs: 3, sm: 4, md: 5 },
                width: '100%',
                maxWidth: 500,
                backgroundColor: '#ffffff',
                borderRadius: 4,
                border: '2px solid #0f6b5f',
                boxShadow: '0 8px 32px rgba(15, 107, 95, 0.1)',
                position: 'relative',
                overflow: 'hidden',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: 4,
                  background: 'linear-gradient(90deg, #0f6b5f, #0f8a7a, #0fa99a)',
                },
              }}
            >
              {/* Form header */}
              <Box sx={{ textAlign: 'center', mb: 4 }}>
                <Fade in={step >= 1} timeout={1200}>
                  <Box sx={{ mb: 3 }}>
                    <Box
                      sx={{
                        width: 80,
                        height: 80,
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #0f6b5f, #0f8a7a)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto',
                        mb: 2,
                        boxShadow: '0 8px 32px rgba(15, 107, 95, 0.2)',
                      }}
                    >
                      <LoginIcon sx={{ fontSize: 40, color: '#ffffff' }} />
                    </Box>
                    <Typography 
                      variant="h4" 
                      component="h2" 
                      gutterBottom
                      sx={{
                        color: '#0f6b5f',
                        fontWeight: 700,
                      }}
                    >
                      Đăng Nhập
                    </Typography>
                    <Typography 
                      variant="body1" 
                      sx={{ 
                        fontSize: 16,
                        maxWidth: 400,
                        margin: '0 auto',
                        color: '#0f6b5f',
                      }}
                    >
                      Vui lòng nhập thông tin đăng nhập của bạn
                    </Typography>
                  </Box>
                </Fade>
              </Box>

              {/* Error Alert */}
              {error && (
                <Fade in={!!error} timeout={300}>
                  <Alert 
                    severity="error" 
                    sx={{ 
                      mb: 3, 
                      borderRadius: 2, 
                      fontSize: 14,
                      '& .MuiAlert-icon': { fontSize: 24 },
                    }}
                  >
                    {error}
                  </Alert>
                </Fade>
              )}

              {/* Login form */}
              <form onSubmit={handleLogin} autoComplete="off">
                <Box sx={{ mb: 3 }}>
                  <Typography variant="h6" sx={{ 
                    color: '#0f6b5f', 
                    fontWeight: 600, 
                    mb: 2,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                  }}>
                    <PersonIcon sx={{ fontSize: 20, color: '#0f6b5f' }} />
                    Thông tin đăng nhập
                  </Typography>
                  <Divider sx={{ opacity: 0.6, borderColor: '#0f6b5f' }} />
                </Box>

                <TextField
                  fullWidth
                  label="Số CCCD"
                  name="cccd"
                  value={formData.cccd}
                  onChange={(e) => setFormData({ ...formData, cccd: e.target.value })}
                  margin="normal"
                  required
                  placeholder="Nhập số CCCD của bạn"
                  InputLabelProps={{ 
                    sx: { 
                      fontSize: 14, 
                      fontWeight: 500,
                      color: '#0f6b5f',
                    } 
                  }}
                  sx={{ 
                    mb: 3, 
                    '& .MuiOutlinedInput-root': { 
                      borderRadius: 2, 
                      fontSize: 15,
                      background: '#f8f9fa',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        background: '#e9ecef',
                      },
                      '&.Mui-focused': { 
                        background: 'white',
                        '& fieldset': { 
                          borderColor: '#0f6b5f', 
                          borderWidth: 2,
                          boxShadow: '0 0 0 2px rgba(15,107,95,0.1)' 
                        } 
                      } 
                    },
                    '& .MuiInputLabel-root.Mui-focused': {
                      color: '#0f6b5f',
                    },
                  }} 
                />

                <TextField
                  fullWidth
                  label="Mật khẩu"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  margin="normal"
                  required
                  placeholder="Nhập mật khẩu của bạn"
                  InputLabelProps={{ 
                    sx: { 
                      fontSize: 14, 
                      fontWeight: 500,
                      color: '#0f6b5f',
                    } 
                  }}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          aria-label="toggle password visibility"
                          onClick={() => setShowPassword(!showPassword)}
                          edge="end"
                          sx={{ color: '#0f6b5f' }}
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                  sx={{ 
                    mb: 3, 
                    '& .MuiOutlinedInput-root': { 
                      borderRadius: 2, 
                      fontSize: 15,
                      background: '#f8f9fa',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        background: '#e9ecef',
                      },
                      '&.Mui-focused': { 
                        background: 'white',
                        '& fieldset': { 
                          borderColor: '#0f6b5f', 
                          borderWidth: 2,
                          boxShadow: '0 0 0 2px rgba(15,107,95,0.1)' 
                        } 
                      } 
                    },
                    '& .MuiInputLabel-root.Mui-focused': {
                      color: '#0f6b5f',
                    },
                  }} 
                />

                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  size="large"
                  disabled={loading}
                  sx={{
                    mt: 2,
                    mb: 3,
                    py: 2,
                    background: 'linear-gradient(135deg, #0f6b5f, #0f8a7a)',
                    borderRadius: 3,
                    fontSize: '1.1rem',
                    fontWeight: 700,
                    textTransform: 'none',
                    boxShadow: '0 8px 25px rgba(15, 107, 95, 0.2)',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #0f8a7a, #0fa99a)',
                      boxShadow: '0 12px 35px rgba(15, 107, 95, 0.3)',
                      transform: 'translateY(-2px)',
                    },
                    '&:active': {
                      transform: 'translateY(0)',
                    },
                  }}
                >
                  {loading ? <CircularProgress size={24} /> : 'Đăng nhập'}
                </Button>
              </form>

              {/* Registration link */}
              <Box sx={{ textAlign: 'center', mt: 3 }}>
                <Typography variant="body2" sx={{ fontSize: 14, color: '#0f6b5f' }}>
                  Chưa có tài khoản?{' '}
                  <Link 
                    component="button"
                    variant="body2"
                    onClick={() => navigate('/register')}
                    sx={{ 
                      color: '#0f6b5f',
                      fontWeight: 600,
                      textDecoration: 'none',
                      fontSize: 14,
                      '&:hover': {
                        textDecoration: 'underline'
                      }
                    }}
                  >
                    Đăng ký ngay
                  </Link>
                </Typography>
              </Box>
            </Paper>
          </Grow>
        </Box>
      </Container>

      {/* CSS Animations */}
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
      `}</style>
    </Box>
  );
}

export default function Login() {
  return (
    <GoogleReCaptchaProvider reCaptchaKey={RECAPTCHA_SITE_KEY} language="vi">
      <LoginForm />
    </GoogleReCaptchaProvider>
  );
} 