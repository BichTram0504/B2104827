import React from 'react';
import {
  Container,
  Typography,
  Box,
  Button,
  Grid,
  Card,
  CardContent,
  useTheme,
  Divider,
  Link,
  Paper,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import HowToVoteIcon from '@mui/icons-material/HowToVote';
import SecurityIcon from '@mui/icons-material/Security';
import SpeedIcon from '@mui/icons-material/Speed';
import TransparencyIcon from '@mui/icons-material/Visibility';
import ArticleIcon from '@mui/icons-material/Article';
import InfoIcon from '@mui/icons-material/Info';

const Home = () => {
  const navigate = useNavigate();
  const theme = useTheme();

  const features = [
    {
      icon: <SecurityIcon sx={{ fontSize: 40 }} />,
      title: 'Bảo Mật Tuyệt Đối',
      description: 'Sử dụng công nghệ blockchain để đảm bảo tính bảo mật và không thể can thiệp vào kết quả bầu cử.',
    },
    {
      icon: <SpeedIcon sx={{ fontSize: 40 }} />,
      title: 'Nhanh Chóng & Tiện Lợi',
      description: 'Bỏ phiếu trực tuyến mọi lúc mọi nơi, không cần phải đến địa điểm bỏ phiếu.',
    },
    {
      icon: <TransparencyIcon sx={{ fontSize: 40 }} />,
      title: 'Minh Bạch & Công Khai',
      description: 'Mọi hoạt động bầu cử đều được ghi lại trên blockchain, có thể kiểm tra và xác minh.',
    },
  ];

  const recentArticles = [
    {
      title: "Giải pháp bỏ phiếu điện tử sử dụng công nghệ Blockchain",
      url: "https://tapchitaichinh.vn/su-kien-noi-bat/giai-phap-bo-phieu-dien-tu-su-dung-cong-nghe-blockchain-340018.html",
      date: "15/03/2023",
      source: "Tạp chí Tài chính",
      image: "https://tailieu.antoanthongtin.gov.vn/Files/files/site-2/images/20210831/4056d34eb10c5852011d.jpg"
    },
    {
      title: "Nghiên cứu ứng dụng công nghệ blockchain trong bầu cử điện tử",
      url: "https://namdinh.gov.vn/portal/Pages/2021-10-5/Ung-dung-Blockchain-trong-Chinh-phu-dien-tuja6ggf.aspx",
      date: "20/04/2023",
      source: "Tạp chí BCVT",
      image: "https://nghiencuuquocte.org/wp-content/uploads/2019/04/blockchain.jpg"
    },
    {
      title: "Blockchain: Công nghệ giúp bầu cử minh bạch và an toàn",
      url: "https://nghiencuuquocte.org/2019/04/09/minh-bach-hoa-bau-cu-cong-nghe-blockchain/",
      date: "28/05/2023",
      source: "VOV.VN",
      image: "https://cdn2.tuoitre.vn/tto/i/s626/2017/10/12/659679b5.jpg"
    },
  ];

  return (
    <Box>
      {/* Hero Section */}
      <Box
        sx={{
          bgcolor: 'primary.main',
          color: 'white',
          py: 8,
          mb: 6,
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={6}>
              <Typography variant="h2" component="h1" gutterBottom>
                Hệ Thống Bầu Cử Trực Tuyến
              </Typography>
              <Typography variant="h5" sx={{ mb: 4 }}>
                Sử dụng công nghệ blockchain để đảm bảo tính minh bạch và bảo mật
              </Typography>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Button
                  variant="contained"
                  color="secondary"
                  // size="large"
                  // margin-left = "70%"
                  onClick={() => navigate('/login')}
                >
                  Đăng Nhập
                </Button>
                <Button
                  variant="outlined"
                  color="inherit"
                  size="large"
                  onClick={() => navigate('/register')}
                >
                  Đăng Ký
                </Button>
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <HowToVoteIcon sx={{ fontSize: 250, opacity: 0.8, marginLeft: "30%"}} />
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Blockchain Info Section */}
      <Container maxWidth="lg" sx={{ mb: 8 }}>
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <InfoIcon sx={{ fontSize: 48, color: 'primary.main', mb: 1 }} />
          <Typography variant="h3" component="h2" gutterBottom>
            Blockchain Là Gì?
          </Typography>
        </Box>
        
        <Paper elevation={3} sx={{ p: 4, mb: 5 }}>
          <Grid container spacing={4}>
            <Grid item xs={12} md={6}>
              <Typography variant="body1" paragraph>
                <strong>Blockchain</strong> là một công nghệ lưu trữ và truyền tải dữ liệu dưới dạng các khối liên kết với nhau, 
                sử dụng mã hóa để đảm bảo an toàn. Mỗi khối dữ liệu được liên kết với khối trước đó tạo thành một chuỗi khối dữ liệu.
              </Typography>
              
              <Typography variant="body1" paragraph>
                <strong>Đặc điểm nổi bật của Blockchain:</strong>
              </Typography>
              
              <Grid container spacing={3} sx={{ mb: 3 }}>
                <Grid item xs={12} md={4}>
                  <Card sx={{ height: '100%', bgcolor: 'primary.light', color: 'white' }}>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>Phi tập trung</Typography>
                      <Typography variant="body2">
                        Dữ liệu được lưu trữ trên nhiều máy tính khác nhau, không tập trung vào một máy chủ.
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Card sx={{ height: '100%', bgcolor: 'secondary.main', color: 'white' }}>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>Minh bạch</Typography>
                      <Typography variant="body2">
                        Mọi giao dịch đều được ghi lại và có thể kiểm tra, xác thực bởi tất cả người dùng.
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Card sx={{ height: '100%', bgcolor: 'primary.dark', color: 'white' }}>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>Không thể sửa đổi</Typography>
                      <Typography variant="body2">
                        Dữ liệu đã được xác nhận không thể bị thay đổi hoặc xóa bỏ.
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
              
              <Typography variant="body1" paragraph>
                <strong>Trong hệ thống bầu cử</strong>, blockchain đảm bảo rằng mỗi phiếu bầu được ghi nhận một cách an toàn, 
                minh bạch và không thể bị sửa đổi. Công nghệ này giải quyết nhiều vấn đề của hệ thống bầu cử truyền thống như 
                gian lận, thiếu minh bạch và chi phí cao.
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box sx={{ textAlign: 'center', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <img 
                  src="https://funix.edu.vn/wp-content/uploads/2023/03/hoc-cong-nghe-thong-tin-co-kho-khong-va-dieu-can-biet.jpg" 
                  alt="Blockchain Technology Diagram" 
                  style={{ maxWidth: '100%', height: 'auto', borderRadius: '8px', marginBottom: '1rem' }}
                />
                <img 
                  src="https://bytesoft.vn/uploads/12/blockchain-va-banking-bytesoft.gif" 
                  alt="Blockchain Voting System" 
                  style={{ maxWidth: '100%', height: 'auto', borderRadius: '8px' }}
                />
                
              </Box>
            </Grid>
          </Grid>
        </Paper>
      </Container>

      {/* Features Section */}
      <Container maxWidth="lg" sx={{ mb: 8 }}>
        <Typography variant="h3" component="h2" align="center" gutterBottom>
          Ưu Điểm Của Hệ Thống
        </Typography>
        <Grid container spacing={4} sx={{ mt: 2 }}>
          {features.map((feature, index) => (
            <Grid item xs={12} md={4} key={index}>
              <Card sx={{ height: '100%' }}>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Box sx={{ color: 'primary.main', mb: 2 }}>
                    {feature.icon}
                  </Box>
                  <Typography variant="h5" component="h3" gutterBottom>
                    {feature.title}
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    {feature.description}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Process Section */}
      <Box sx={{ bgcolor: 'background.default', py: 8 }}>
        <Container maxWidth="lg">
          <Typography variant="h3" component="h2" align="center" gutterBottom>
            Quy Trình Bầu Cử
          </Typography>
          <Typography variant="subtitle1" align="center" color="text.secondary" sx={{ mb: 6 }}>
            Các bước tham gia bầu cử điện tử sử dụng công nghệ blockchain
          </Typography>

          {/* Flowchart/Timeline style */}
          <Box sx={{ position: 'relative', my: 4, px: { xs: 2, md: 6 } }}>
            {/* Vertical line */}
            <Box 
              sx={{
                position: 'absolute',
                left: { xs: '30px', md: '50%' },
                transform: { xs: 'none', md: 'translateX(-30%)' },
                top: 0,
                bottom: 0,
                width: '4px',
                bgcolor: 'primary.main',
                zIndex: 0
              }}
            />

            {/* Step 1 */}
            <Box sx={{ 
              display: 'flex', 
              flexDirection: { xs: 'row', md: 'row' }, 
              alignItems: 'center',
              mb: 5,
              position: 'relative'
            }}>
              <Box 
                sx={{
                  width: 40,
                  height: 40,
                  bgcolor: 'primary.main',
                  color: 'white',
                  borderRadius: '50%',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  fontSize: 24,
                  fontWeight: 'bold',
                  mr: { xs: 2, md: 0 },
                  zIndex: 1,
                  boxShadow: 3,
                  flexShrink: 0
                }}
              >
                1
              </Box>
              <Card sx={{ 
                ml: { xs: 0, md: 3 }, 
                width: { xs: 'calc(100% - 80px)', md: '45%' },
                boxShadow: 3,
                position: { md: 'absolute' },
                left: { md: 0 },
                top: { md: '-25px' }
              }}>
                <CardContent>
                  <Typography variant="h5" component="h3" gutterBottom color="primary.main">
                    Đăng Ký Tài Khoản
                  </Typography>
                  <Typography variant="body1">
                    Đăng ký tài khoản với thông tin cá nhân, CCCD/CMND và tạo mật khẩu đăng nhập an toàn để tham gia bầu cử.
                  </Typography>
                </CardContent>
              </Card>
            </Box>

            {/* Step 2 */}
            <Box sx={{ 
              display: 'flex', 
              flexDirection: { xs: 'row', md: 'row-reverse' }, 
              alignItems: 'center',
              mb: 5,
              position: 'relative'
            }}>
              <Box 
                sx={{
                  width: 40,
                  height: 40,
                  bgcolor: 'primary.main',
                  color: 'white',
                  borderRadius: '50%',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  fontSize: 24,
                  fontWeight: 'bold',
                  ml: { xs: 0, md: 0 },
                  mr: { xs: 2, md: 0 },
                  zIndex: 1,
                  boxShadow: 3,
                  flexShrink: 0,
                  order: { xs: 0, md: 2 }
                }}
              >
                2
              </Box>
              <Card sx={{ 
                ml: { xs: 0, md: 0 }, 
                mr: { xs: 0, md: 3 },
                width: { xs: 'calc(100% - 80px)', md: '45%' },
                boxShadow: 3,
                position: { md: 'absolute' },
                right: { md: 0 },
                top: { md: '-25px' },
                order: { xs: 1, md: 1 }
              }}>
                <CardContent>
                  <Typography variant="h5" component="h3" gutterBottom color="primary.main">
                    Xác Thực Danh Tính
                  </Typography>
                  <Typography variant="body1">
                    Đăng nhập vào hệ thống với tài khoản đã đăng ký. Hệ thống sẽ xác thực danh tính của bạn thông qua thông tin cá nhân.
                  </Typography>
                </CardContent>
              </Card>
            </Box>

            {/* Step 3 */}
            <Box sx={{ 
              display: 'flex', 
              flexDirection: { xs: 'row', md: 'row' }, 
              alignItems: 'center',
              mb: 5,
              position: 'relative'
            }}>
              <Box 
                sx={{
                  width: 40,
                  height: 40,
                  bgcolor: 'primary.main',
                  color: 'white',
                  borderRadius: '50%',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  fontSize: 24,
                  fontWeight: 'bold',
                  mr: { xs: 2, md: 0 },
                  zIndex: 1,
                  boxShadow: 3,
                  flexShrink: 0
                }}
              >
                3
              </Box>
              <Card sx={{ 
                ml: { xs: 0, md: 3 }, 
                width: { xs: 'calc(100% - 80px)', md: '45%' },
                boxShadow: 3,
                position: { md: 'absolute' },
                left: { md: 0 },
                top: { md: '-25px' }
              }}>
                <CardContent>
                  <Typography variant="h5" component="h3" gutterBottom color="primary.main">
                    Xem Danh Sách Bầu Cử
                  </Typography>
                  <Typography variant="body1">
                    Truy cập trang danh sách các cuộc bầu cử, xem thông tin chi tiết, thời gian bắt đầu và kết thúc của từng cuộc bầu cử.
                  </Typography>
                </CardContent>
              </Card>
            </Box>

            {/* Step 4 */}
            <Box sx={{ 
              display: 'flex', 
              flexDirection: { xs: 'row', md: 'row-reverse' }, 
              alignItems: 'center',
              mb: 5,
              position: 'relative'
            }}>
              <Box 
                sx={{
                  width: 40,
                  height: 40,
                  bgcolor: 'primary.main',
                  color: 'white',
                  borderRadius: '50%',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  fontSize: 24,
                  fontWeight: 'bold',
                  ml: { xs: 0, md: 0 },
                  mr: { xs: 2, md: 0 },
                  zIndex: 1,
                  boxShadow: 3,
                  flexShrink: 0,
                  order: { xs: 0, md: 2 }
                }}
              >
                4
              </Box>
              <Card sx={{ 
                ml: { xs: 0, md: 0 }, 
                mr: { xs: 0, md: 3 },
                width: { xs: 'calc(100% - 80px)', md: '45%' },
                boxShadow: 3,
                position: { md: 'absolute' },
                right: { md: 0 },
                top: { md: '-25px' },
                order: { xs: 1, md: 1 }
              }}>
                <CardContent>
                  <Typography variant="h5" component="h3" gutterBottom color="primary.main">
                    Tìm Hiểu Thông Tin Ứng Cử Viên
                  </Typography>
                  <Typography variant="body1">
                    Nghiên cứu thông tin về các ứng cử viên, bao gồm tiểu sử, thành tích, và cam kết của họ trước khi bỏ phiếu.
                  </Typography>
                </CardContent>
              </Card>
            </Box>

            {/* Step 5 */}
            <Box sx={{ 
              display: 'flex', 
              flexDirection: { xs: 'row', md: 'row' }, 
              alignItems: 'center',
              mb: 5,
              position: 'relative'
            }}>
              <Box 
                sx={{
                  width: 40,
                  height: 40,
                  bgcolor: 'primary.main',
                  color: 'white',
                  borderRadius: '50%',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  fontSize: 24,
                  fontWeight: 'bold',
                  mr: { xs: 2, md: 0 },
                  zIndex: 1,
                  boxShadow: 3,
                  flexShrink: 0
                }}
              >
                5
              </Box>
              <Card sx={{ 
                ml: { xs: 0, md: 3 }, 
                width: { xs: 'calc(100% - 80px)', md: '45%' },
                boxShadow: 3,
                position: { md: 'absolute' },
                left: { md: 0 },
                top: { md: '-25px' }
              }}>
                <CardContent>
                  <Typography variant="h5" component="h3" gutterBottom color="primary.main">
                    Bỏ Phiếu 
                  </Typography>
                  <Typography variant="body1">
                    Thực hiện quyền bầu cử của bạn bằng cách chọn ứng cử viên và xác nhận lựa chọn. Lá phiếu của bạn được mã hóa và lưu trữ an toàn trên blockchain.
                  </Typography>
                </CardContent>
              </Card>
            </Box>

            {/* Step 6 */}
            <Box sx={{ 
              display: 'flex', 
              flexDirection: { xs: 'row', md: 'row-reverse' }, 
              alignItems: 'center',
              position: 'relative'
            }}>
              <Box 
                sx={{
                  width: 40,
                  height: 40,
                  bgcolor: 'primary.main',
                  color: 'white',
                  borderRadius: '50%',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  fontSize: 24,
                  fontWeight: 'bold',
                  ml: { xs: 0, md: 0 },
                  mr: { xs: 2, md: 0 },
                  zIndex: 1,
                  boxShadow: 3,
                  flexShrink: 0,
                  order: { xs: 0, md: 2 }
                }}
              >
                6
              </Box>
              <Card sx={{ 
                ml: { xs: 0, md: 0 }, 
                mr: { xs: 0, md: 3 },
                width: { xs: 'calc(100% - 80px)', md: '45%' },
                boxShadow: 3,
                position: { md: 'absolute' },
                right: { md: 0 },
                top: { md: '-25px' },
                order: { xs: 1, md: 1 }
              }}>
                <CardContent>
                  <Typography variant="h5" component="h3" gutterBottom color="primary.main">
                    Xem Kết Quả
                  </Typography>
                  <Typography variant="body1">
                    Sau khi cuộc bầu cử kết thúc, xem kết quả chính xác và minh bạch. Kết quả được lưu trữ trên blockchain nên không thể bị sửa đổi.
                  </Typography>
                </CardContent>
              </Card>
            </Box>
          </Box>
              <br/>
          <Box sx={{ textAlign: 'center', mt: 6 }}>
            <Button 
              variant="contained" 
              color="primary" 
              size="large"
              onClick={() => navigate('/register')}
            >
              Bắt đầu ngay
            </Button>
          </Box>
        </Container>
      </Box>

      {/* Recent Articles Section */}
      <Box sx={{ bgcolor: 'primary.main', color: 'white', py: 8 }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 5 }}>
            <ArticleIcon sx={{ fontSize: 48, mb: 1 }} />
            <Typography variant="h3" component="h2" gutterBottom>
              Bài Báo Về Blockchain & Bầu Cử
            </Typography>
            <Typography variant="subtitle1" sx={{ opacity: 0.8, maxWidth: '700px', mx: 'auto' }}>
              Tìm hiểu thêm về cách blockchain đang cách mạng hóa hệ thống bầu cử trên toàn thế giới
            </Typography>
          </Box>
          
          <Grid container spacing={4}>
            {recentArticles.map((article, index) => (
              <Grid item xs={12} md={4} key={index}>
                <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', bgcolor: 'primary.dark', color: 'white' }}>
                  <Box sx={{ position: 'relative', pt: '60%' }}>
                    <img 
                      src={article.image} 
                      alt={article.title}
                      style={{ 
                        position: 'absolute', 
                        top: 0, 
                        left: 0, 
                        width: '100%', 
                        height: '100%', 
                        objectFit: 'cover',
                        borderTopLeftRadius: '4px',
                        borderTopRightRadius: '4px'
                      }} 
                    />
                  </Box>
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography variant="caption" sx={{ opacity: 0.8 }}>
                      {article.date} • {article.source}
                    </Typography>
                    <Typography variant="h6" component="h3" gutterBottom sx={{ mt: 1, fontWeight: 'bold' }}>
                      {article.title}
                    </Typography>
                    <Button 
                      component="a" 
                      href={article.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      variant="outlined" 
                      color="inherit"
                      size="small"
                      sx={{ mt: 2 }}
                    >
                      Đọc bài viết
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>
    </Box>
  );
};

export default Home; 