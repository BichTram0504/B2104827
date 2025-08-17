import React from 'react';
import {
  Box,
  Container,
  Grid,
  Typography,
  Link,
  Divider,
} from '@mui/material';

function Footer() {
  return (
    <Box
      component="footer"
      sx={{
        bgcolor: 'primary.main',
        color: 'white',
        py: 6,
        mt: 'auto',
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          <Grid item xs={12} sm={4}>
            <Typography variant="h4" gutterBottom>
              Hệ Thống Bầu Cử
            </Typography>
            <Typography variant="body2">
              Nền tảng bầu cử trực tuyến an toàn, minh bạch và dễ dàng sử dụng.
            </Typography>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Typography variant="h6" gutterBottom>
              Liên Hệ
            </Typography>
            <Typography variant="body2" paragraph>
              Địa chỉ: 123 Đường NVL, Ninh Kiều, Cần Thơ.
            </Typography>
            <Typography variant="body2" paragraph>
              Email: block@baucuonline.com
            </Typography>
            <Typography variant="body2">
              Điện thoại: (012) 345-6789
            </Typography>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Typography variant="h6" gutterBottom>
              Trợ Giúp
            </Typography>
            <Link href="#" color="inherit" underline="hover" display="block" sx={{ mb: 1 }}>
              Hướng dẫn sử dụng
            </Link>
            <Link href="#" color="inherit" underline="hover" display="block" sx={{ mb: 1 }}>
              Chính sách bảo mật
            </Link>
            <Link href="#" color="inherit" underline="hover" display="block">
              Điều khoản sử dụng
            </Link>
          </Grid>
        </Grid>
        <Divider sx={{ my: 3, bgcolor: 'rgba(255,255,255,0.2)' }} />
        <Typography variant="body2" align="center">
          © {new Date().getFullYear()} Hệ Thống Bầu Cử. Đã đăng ký bản quyền.
        </Typography>
      </Container>
    </Box>
  );
}

export default Footer; 