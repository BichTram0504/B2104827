import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Chip,
  useTheme
} from '@mui/material';

const RateLimitNotification = ({ open, onClose, message, code, retryAfter }) => {
  const theme = useTheme();
  const [countdown, setCountdown] = useState(retryAfter || 0);

  useEffect(() => {
    if (retryAfter && retryAfter > 0) {
      const timer = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [retryAfter]);

  const getRateLimitInfo = (code) => {
    switch (code) {
      case 'LOGIN_RATE_LIMIT_EXCEEDED':
        return {
          title: 'Quá nhiều lần đăng nhập thất bại',
          description: 'Tài khoản của bạn đã bị tạm khóa do đăng nhập thất bại quá nhiều lần.',
          waitTime: '15 phút',
          severity: 'error'
        };
      case 'VOTE_RATE_LIMIT_EXCEEDED':
        return {
          title: 'Quá nhiều lần thử bỏ phiếu',
          description: 'Bạn đã thử bỏ phiếu quá nhiều lần. Vui lòng chờ để tránh spam.',
          waitTime: '1 giờ',
          severity: 'error'
        };
      case 'ELECTION_CREATE_RATE_LIMIT_EXCEEDED':
        return {
          title: 'Quá nhiều lần tạo cuộc bầu cử',
          description: 'Bạn đã tạo quá nhiều cuộc bầu cử trong thời gian ngắn.',
          waitTime: '1 giờ',
          severity: 'warning'
        };
      case 'CHATBOT_RATE_LIMIT_EXCEEDED':
        return {
          title: 'Quá nhiều tin nhắn chatbot',
          description: 'Bạn đã gửi quá nhiều tin nhắn. Vui lòng chờ một lúc.',
          waitTime: '5 phút',
          severity: 'info'
        };
      case 'REGISTER_RATE_LIMIT_EXCEEDED':
        return {
          title: 'Quá nhiều lần đăng ký',
          description: 'Bạn đã thử đăng ký quá nhiều lần. Vui lòng chờ một lúc.',
          waitTime: '15 phút',
          severity: 'warning'
        };
      default:
        return {
          title: 'Quá nhiều yêu cầu',
          description: 'Bạn đã gửi quá nhiều yêu cầu trong thời gian ngắn.',
          waitTime: '15 phút',
          severity: 'warning'
        };
    }
  };

  const rateLimitInfo = getRateLimitInfo(code);
  const isDarkMode = theme.palette.mode === 'dark';

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'error':
        return 'linear-gradient(135deg, #f44336 0%, #d32f2f 100%)';
      case 'warning':
        return 'linear-gradient(135deg, #ff9800 0%, #f57c00 100%)';
      case 'info':
        return 'linear-gradient(135deg, #2196f3 0%, #1976d2 100%)';
      default:
        return 'linear-gradient(135deg, #ff9800 0%, #f57c00 100%)';
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          background: isDarkMode 
            ? 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)' 
            : 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
          border: `1px solid ${isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`
        }
      }}
    >
      <DialogTitle sx={{ 
        background: getSeverityColor(rateLimitInfo.severity),
        color: '#fff',
        borderRadius: '12px 12px 0 0',
        display: 'flex',
        alignItems: 'center',
        gap: 2
      }}>
        <Box sx={{ 
          width: 24, 
          height: 24, 
          borderRadius: '50%', 
          background: 'rgba(255, 255, 255, 0.2)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          ⏰
        </Box>
        <Typography variant="h6" sx={{ fontWeight: 700 }}>
          {rateLimitInfo.title}
        </Typography>
      </DialogTitle>
      
      <DialogContent sx={{ 
        p: 3,
        background: isDarkMode ? 'rgba(255, 255, 255, 0.02)' : '#fff',
        color: isDarkMode ? '#fff' : '#222'
      }}>
        <Box sx={{ mb: 2 }}>
          <Typography variant="body1" sx={{ mb: 2, color: isDarkMode ? '#fff' : '#222' }}>
            {rateLimitInfo.description}
          </Typography>
          
          {code && (
            <Chip 
              label={`Mã lỗi: ${code}`}
              color="warning"
              size="small"
              sx={{ mb: 1 }}
            />
          )}
          
          <Box sx={{ 
            p: 2, 
            bgcolor: isDarkMode ? 'rgba(255, 152, 0, 0.1)' : 'rgba(255, 152, 0, 0.05)',
            borderRadius: 2,
            border: `1px solid ${isDarkMode ? 'rgba(255, 152, 0, 0.3)' : 'rgba(255, 152, 0, 0.2)'}`,
            mb: 2
          }}>
            <Typography variant="body2" color="warning.main" sx={{ fontWeight: 600 }}>
              ⏱️ Thời gian chờ: {rateLimitInfo.waitTime}
            </Typography>
            
            {countdown > 0 && (
              <Typography variant="body2" color="warning.main" sx={{ mt: 1, fontSize: '0.9rem' }}>
                Còn lại: {Math.floor(countdown / 60)}:{(countdown % 60).toString().padStart(2, '0')}
              </Typography>
            )}
          </Box>
          
          <Box sx={{ 
            p: 2, 
            bgcolor: isDarkMode ? 'rgba(22, 147, 133, 0.1)' : 'rgba(22, 147, 133, 0.05)',
            borderRadius: 2,
            border: `1px solid ${isDarkMode ? 'rgba(22, 147, 133, 0.3)' : 'rgba(22, 147, 133, 0.2)'}`
          }}>
            <Typography variant="body2" color="primary.main" sx={{ fontWeight: 600 }}>
              💡 Gợi ý: Hãy chờ một lúc trước khi thực hiện lại thao tác này.
            </Typography>
          </Box>
        </Box>
      </DialogContent>
      
      <DialogActions sx={{ 
        p: 3,
        background: isDarkMode ? 'rgba(255, 255, 255, 0.02)' : '#f8f9fa',
        borderTop: `1px solid ${isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`
      }}>
        <Button 
          onClick={onClose}
          variant="contained"
          sx={{
            borderRadius: 2,
            textTransform: 'none',
            fontWeight: 600,
            bgcolor: rateLimitInfo.severity === 'error' ? '#f44336' : '#ff9800',
            '&:hover': {
              bgcolor: rateLimitInfo.severity === 'error' ? '#d32f2f' : '#f57c00'
            }
          }}
        >
          Đã hiểu
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default RateLimitNotification;
