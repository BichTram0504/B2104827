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
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import PersonIcon from '@mui/icons-material/Person';

function Login() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    cccd: '',
    password: '',
  });

  // Thêm dữ liệu cử tri mẫu nếu chưa có
  useEffect(() => {
    const voters = JSON.parse(localStorage.getItem('voters') || '[]');
    
    if (voters.length === 0) {
      // Tạo một số cử tri mẫu
      const sampleVoters = [
        { 
          cccd: '123456789012', 
          password: 'password123',
          fullName: 'Nguyễn Văn Đạt',
          address: 'Hà Nội',
          birthDate: '1990-01-01'
        },
        { 
          cccd: '098765432109', 
          password: 'password456',
          fullName: 'Trần Thị Trinh',
          address: 'TP HCM',
          birthDate: '1992-05-15'
        }
      ];
      localStorage.setItem('voters', JSON.stringify(sampleVoters));
      console.log('Đã tạo dữ liệu cử tri mẫu:', sampleVoters);
    }
  }, []);

  // Xử lý đăng nhập
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Kiểm tra thông tin đăng nhập
      if (!formData.cccd || !formData.password) {
        setError('Vui lòng nhập đầy đủ thông tin');
        setLoading(false);
        return;
      }

      // Lấy danh sách cử tri từ localStorage
      const voters = JSON.parse(localStorage.getItem('voters') || '[]');
      const voter = voters.find(v => v.cccd === formData.cccd && v.password === formData.password);

      if (!voter) {
        setError('Số CCCD hoặc mật khẩu không đúng');
        setLoading(false);
        return;
      }

      // Lưu thông tin đăng nhập vào localStorage
      localStorage.setItem('isVoter', 'true');
      localStorage.setItem('voterCCCD', voter.cccd);
      localStorage.setItem('voterName', voter.fullName);
      
      console.log("Đăng nhập thành công:", {
        cccd: voter.cccd,
        name: voter.fullName
      });

      // Chuyển hướng đến trang danh sách bầu cử
      setTimeout(() => {
        navigate('/elections');
      }, 1000);
    } catch (error) {
      console.error('Login error:', error);
      setError('Có lỗi xảy ra khi đăng nhập. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 8, mb: 4 }}>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3 }}>
              <PersonIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
              <Typography variant="h4" component="h1" gutterBottom>
                Đăng Nhập Cử Tri
              </Typography>
              <Typography variant="body2" color="text.secondary" align="center">
                Vui lòng nhập CCCD và mật khẩu để đăng nhập
              </Typography>
            </Box>

            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            <form onSubmit={handleLogin}>
              <TextField
                fullWidth
                label="CCCD"
                value={formData.cccd}
                onChange={(e) => setFormData({ ...formData, cccd: e.target.value })}
                margin="normal"
                required
                placeholder="Ví dụ: 123456789012"
              />
              <TextField
                fullWidth
                label="Mật khẩu"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                margin="normal"
                required
                placeholder="Ví dụ: ********"
              />
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
                  'Đăng Nhập'
                )}
              </Button>
            </form>

            <Box sx={{ mt: 3, textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                Chưa có tài khoản?{' '}
                <Link
                  component="button"
                  variant="body2"
                  onClick={() => navigate('/register')}
                >
                  Đăng ký ngay
                </Link>
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

            {/* <Box sx={{ mt: 3, bgcolor: '#f5f5f5', p: 2, borderRadius: 1 }}>
              <Typography variant="body2" color="text.secondary" align="center">
                <strong>Lưu ý:</strong> Kết nối ví MetaMask chỉ cần thiết khi tham gia bỏ phiếu.
                Bạn có thể đăng nhập bình thường để xem thông tin cuộc bầu cử.
              </Typography>
              <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 1 }}>
              </Typography>
            </Box> */}
          </CardContent>
        </Card>
      </Box>
    </Container>
  );
}

export default Login; 