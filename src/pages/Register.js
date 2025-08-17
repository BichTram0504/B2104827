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
  Grid,
  CircularProgress,
  IconButton,
  InputAdornment,
  Paper,
  Fade,
  Slide,
  Grow,
  useTheme,
  useMediaQuery,
  Divider,
  Chip,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import viLocale from 'date-fns/locale/vi';
import { subYears } from 'date-fns';
import { useWeb3React } from '@web3-react/core';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import HowToRegIcon from '@mui/icons-material/HowToReg';
import { GoogleReCaptchaProvider, useGoogleReCaptcha } from 'react-google-recaptcha-v3';
import SecurityIcon from '@mui/icons-material/Security';
import PersonIcon from '@mui/icons-material/Person';
import HomeIcon from '@mui/icons-material/Home';
import CakeIcon from '@mui/icons-material/Cake';
import LockIcon from '@mui/icons-material/Lock';
import Chatbot from '../components/Chatbot';

const RECAPTCHA_SITE_KEY = '6LcykYsrAAAAAFkUzlKj6ppo4wfNSY7vr0d95Sz_';

function RegisterForm() {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { account } = useWeb3React();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    cccd: '',
    fullName: '',
    address: '',
    birthDate: null,
    password: '',
    confirmPassword: '',
  });
  const [step, setStep] = useState(0);
  const { executeRecaptcha } = useGoogleReCaptcha();

  // Animation effect for form fields
  useEffect(() => {
    const timer = setTimeout(() => setStep(1), 300);
    return () => clearTimeout(timer);
  }, []);

  const handleSubmit = async (e) => {
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
      if (!executeRecaptcha) {
        setError('Không thể xác thực reCAPTCHA. Vui lòng thử lại sau.');
        setLoading(false);
        return;
      }
      // Lấy token reCAPTCHA v3
      const recaptchaToken = await executeRecaptcha('register');
      // Gọi API backend để đăng ký
      const response = await fetch('http://localhost:5000/api/voters/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cccd: formData.cccd,
          fullName: formData.fullName,
          address: formData.address,
          birthDate: formData.birthDate,
          password: formData.password,
          walletAddress: account || null,
          recaptchaToken,
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.error || 'Đăng ký thất bại');
        setLoading(false);
        return;
      }
      setSuccess('Đăng ký thành công!');
      // Lưu JWT nếu backend trả về (nếu muốn tự động đăng nhập)
      if (data.token) {
        localStorage.setItem('jwt', data.token);
        localStorage.setItem('isVoter', 'true');
        localStorage.setItem('voterCCCD', data.voter?.cccd || formData.cccd);
        localStorage.setItem('voterName', data.voter?.fullName || formData.fullName);
        if (account) {
          localStorage.setItem('walletAddress', account);
        }
      }
      // Tắt timeout để tránh lỗi
      // setTimeout(() => {
      //   navigate('/elections');
      // }, 1500);
      navigate('/elections');
    } catch (error) {
      // Xử lý rate limit errors
      if (error.response?.status === 429) {
        const rateLimitMessage = error.response?.data?.error || 'Quá nhiều lần đăng ký, vui lòng thử lại sau';
        setError(rateLimitMessage);
      } else {
        setError('Không thể đăng ký. Vui lòng thử lại sau.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleClickShowConfirmPassword = () => {
    setShowConfirmPassword(!showConfirmPassword);
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
          top: '10%',
          left: '5%',
          width: 200,
          height: 200,
          borderRadius: '50%',
          background: 'linear-gradient(45deg, rgba(15, 107, 95, 0.05), rgba(15, 150, 133, 0.03))',
          animation: 'float 6s ease-in-out infinite',
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          top: '60%',
          right: '10%',
          width: 150,
          height: 150,
          borderRadius: '50%',
          background: 'linear-gradient(45deg, rgba(15, 107, 95, 0.04), rgba(15, 150, 133, 0.02))',
          animation: 'float 8s ease-in-out infinite reverse',
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
                    <HowToRegIcon sx={{ fontSize: 60, color: '#0f6b5f' }} />
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
                    Chào mừng bạn!
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
                    Tham gia hệ thống bỏ phiếu điện tử để thực hiện quyền công dân của mình
                  </Typography>
                  
                  {/* Feature highlights */}
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 4 }}>
                    {[
                      { icon: <SecurityIcon />, text: 'Bảo mật cao với blockchain' },
                      { icon: <PersonIcon />, text: 'Xác thực danh tính an toàn' },
                      { icon: <HomeIcon />, text: 'Bỏ phiếu mọi lúc, mọi nơi' },
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

          {/* Right side - Registration form */}
          <Grow in={step >= 1} timeout={1000}>
            <Paper 
              elevation={8}
              sx={{
                p: { xs: 3, sm: 4, md: 5 },
                width: '100%',
                maxWidth: 600,
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
                      <HowToRegIcon sx={{ fontSize: 40, color: '#ffffff' }} />
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
                      Đăng Ký Cử Tri
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
                      Vui lòng điền đầy đủ thông tin để tạo tài khoản cử tri
                    </Typography>
                  </Box>
                </Fade>

                {/* Progress indicator */}
                <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
                  {[0, 1, 2].map((stepIndex) => (
                    <Box
                      key={stepIndex}
                      sx={{
                        width: 12,
                        height: 12,
                        borderRadius: '50%',
                        mx: 0.5,
                        background: stepIndex <= step ? '#0f6b5f' : '#e2e8f0',
                        transition: 'all 0.3s ease',
                        transform: stepIndex === step ? 'scale(1.2)' : 'scale(1)',
                      }}
                    />
                  ))}
                </Box>
              </Box>

              {/* Alerts */}
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

              {success && (
                <Fade in={!!success} timeout={300}>
                  <Alert 
                    severity="success" 
                    sx={{ 
                      mb: 3, 
                      borderRadius: 2, 
                      fontSize: 14,
                      '& .MuiAlert-icon': { fontSize: 24 },
                    }}
                  >
                    {success}
                  </Alert>
                </Fade>
              )}

              {/* Registration form */}
              <form onSubmit={handleSubmit} autoComplete="off">
                <Grid container spacing={3}>
                  {/* Personal Information Section */}
                  <Grid item xs={12}>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="h6" sx={{ 
                        color: '#0f6b5f', 
                        fontWeight: 600, 
                        mb: 1,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                      }}>
                        <PersonIcon sx={{ fontSize: 20, color: '#0f6b5f' }} />
                        Thông tin cá nhân
                      </Typography>
                      <Divider sx={{ opacity: 0.6, borderColor: '#0f6b5f' }} />
                    </Box>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="CCCD"
                      value={formData.cccd}
                      onChange={(e) => setFormData({ ...formData, cccd: e.target.value })}
                      required
                      placeholder="Nhập 12 số CCCD"
                      variant="outlined"
                      InputLabelProps={{ 
                        sx: { 
                          fontSize: 14, 
                          fontWeight: 500,
                          color: '#0f6b5f',
                        } 
                      }}
                      sx={{
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
                            },
                          },
                        },
                        '& .MuiInputLabel-root.Mui-focused': {
                          color: '#0f6b5f',
                        },
                      }}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Họ và tên"
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      required
                      placeholder="Nhập họ và tên đầy đủ"
                      variant="outlined"
                      InputLabelProps={{ 
                        sx: { 
                          fontSize: 14, 
                          fontWeight: 500,
                          color: '#0f6b5f',
                        } 
                      }}
                      sx={{
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
                            },
                          },
                        },
                        '& .MuiInputLabel-root.Mui-focused': {
                          color: '#0f6b5f',
                        },
                      }}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={viLocale}>
                      <DatePicker
                        label="Ngày sinh"
                        value={formData.birthDate}
                        onChange={(date) => setFormData({ ...formData, birthDate: date })}
                        renderInput={(params) => (
                          <TextField 
                            {...params} 
                            fullWidth 
                            required 
                            placeholder="Chọn ngày sinh"
                            InputLabelProps={{ 
                              sx: { 
                                fontSize: 14, 
                                fontWeight: 500,
                                color: '#0f6b5f',
                              } 
                            }}
                            sx={{
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
                                  },
                                },
                              },
                              '& .MuiInputLabel-root.Mui-focused': {
                                color: '#0f6b5f',
                              },
                            }}
                          />
                        )}
                        maxDate={subYears(new Date(), 18)}
                        format="dd/MM/yyyy"
                      />
                    </LocalizationProvider>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Địa chỉ"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      required
                      placeholder="Nhập địa chỉ hiện tại"
                      variant="outlined"
                      InputLabelProps={{ 
                        sx: { 
                          fontSize: 14, 
                          fontWeight: 500,
                          color: '#0f6b5f',
                        } 
                      }}
                      sx={{
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
                            },
                          },
                        },
                        '& .MuiInputLabel-root.Mui-focused': {
                          color: '#0f6b5f',
                        },
                      }}
                    />
                  </Grid>

                  {/* Security Section */}
                  <Grid item xs={12}>
                    <Box sx={{ mb: 2, mt: 2 }}>
                      <Typography variant="h6" sx={{ 
                        color: '#0f6b5f', 
                        fontWeight: 600, 
                        mb: 1,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                      }}>
                        <LockIcon sx={{ fontSize: 20, color: '#0f6b5f' }} />
                        Bảo mật tài khoản
                      </Typography>
                      <Divider sx={{ opacity: 0.6, borderColor: '#0f6b5f' }} />
                    </Box>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Mật khẩu"
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      required
                      placeholder="Tạo mật khẩu mạnh"
                      variant="outlined"
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
                              onClick={handleClickShowPassword}
                              edge="end"
                              sx={{ color: '#0f6b5f' }}
                            >
                              {showPassword ? <VisibilityOff /> : <Visibility />}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                      sx={{
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
                            },
                          },
                        },
                        '& .MuiInputLabel-root.Mui-focused': {
                          color: '#0f6b5f',
                        },
                      }}
                    />
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Xác nhận mật khẩu"
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                      required
                      placeholder="Nhập lại mật khẩu"
                      variant="outlined"
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
                              onClick={handleClickShowConfirmPassword}
                              edge="end"
                              sx={{ color: '#0f6b5f' }}
                            >
                              {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                      sx={{
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
                            },
                          },
                        },
                        '& .MuiInputLabel-root.Mui-focused': {
                          color: '#0f6b5f',
                        },
                      }}
                    />
                  </Grid>

                  {/* Password strength indicator */}
                  <Grid item xs={12}>
                    <Box sx={{ 
                      p: 2, 
                      borderRadius: 2, 
                      background: '#f8f9fa',
                      border: '1px solid #e9ecef',
                    }}>
                      <Typography variant="body2" sx={{ 
                        color: '#0f6b5f', 
                        mb: 1,
                        fontWeight: 500,
                      }}>
                        💡 Gợi ý mật khẩu mạnh:
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                        {[
                          'Ít nhất 8 ký tự',
                          'Chữ hoa và chữ thường',
                          'Số và ký tự đặc biệt',
                        ].map((tip, index) => (
                          <Chip
                            key={index}
                            label={tip}
                            size="small"
                            sx={{
                              fontSize: '0.75rem',
                              background: '#e9ecef',
                              color: '#0f6b5f',
                            }}
                          />
                        ))}
                      </Box>
                    </Box>
                  </Grid>

                  {/* Submit button */}
                  <Grid item xs={12}>
                    <Button
                      type="submit"
                      fullWidth
                      variant="contained"
                      disabled={loading}
                      sx={{
                        mt: 2,
                        py: 2,
                        fontSize: '1.1rem',
                        fontWeight: 700,
                        borderRadius: 3,
                        background: 'linear-gradient(135deg, #0f6b5f, #0f8a7a)',
                        boxShadow: '0 8px 25px rgba(15, 107, 95, 0.2)',
                        transition: 'all 0.3s ease',
                        textTransform: 'none',
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
                      {loading ? (
                        <CircularProgress size={24} color="inherit" />
                      ) : (
                        'Hoàn tất đăng ký'
                      )}
                    </Button>
                  </Grid>

                  {/* Additional info */}
                  <Grid item xs={12}>
                    <Box sx={{ textAlign: 'center', mt: 2 }}>
                      <Typography variant="body2" sx={{ fontSize: 13, color: '#0f6b5f' }}>
                        Bằng việc đăng ký, bạn đồng ý với{' '}
                        <Typography
                          component="span"
                          variant="body2"
                          sx={{
                            color: '#0f6b5f',
                            fontWeight: 600,
                            cursor: 'pointer',
                            '&:hover': { textDecoration: 'underline' },
                          }}
                        >
                          điều khoản sử dụng
                        </Typography>
                        {' '}và{' '}
                        <Typography
                          component="span"
                          variant="body2"
                          sx={{
                            color: '#0f6b5f',
                            fontWeight: 600,
                            cursor: 'pointer',
                            '&:hover': { textDecoration: 'underline' },
                          }}
                        >
                          chính sách bảo mật
                        </Typography>
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </form>
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

export default function Register() {
  return (
    <GoogleReCaptchaProvider reCaptchaKey={RECAPTCHA_SITE_KEY} language="vi">
      <RegisterForm />
    </GoogleReCaptchaProvider>
  );
}
