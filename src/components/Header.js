import React, { useState, useEffect } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Container,
  IconButton,
  Menu,
  MenuItem,
  useTheme,
  useMediaQuery,
  Avatar,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import { useNavigate, useLocation } from 'react-router-dom';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import LogoutIcon from '@mui/icons-material/Logout';

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    const checkLoginStatus = () => {
      const adminCCCD = localStorage.getItem('adminCCCD');
      const voterCCCD = localStorage.getItem('voterCCCD');
      const isAdminValue = localStorage.getItem('isAdmin') === 'true';
      const isVoterValue = localStorage.getItem('isVoter') === 'true';

      if (isAdminValue && adminCCCD) {
        setIsLoggedIn(true);
        setIsAdmin(true);
        setUserData({ name: 'Admin', cccd: adminCCCD });
      } else if (isVoterValue && voterCCCD) {
        setIsLoggedIn(true);
        setIsAdmin(false);

        // Lấy thông tin cử tri từ localStorage
        const voters = JSON.parse(localStorage.getItem('voters') || '[]');
        const voterName = localStorage.getItem('voterName');
        
        if (voterName) {
          setUserData({ name: voterName, cccd: voterCCCD });
        } else {
          const voter = voters.find(v => v.cccd === voterCCCD);
          if (voter) {
            setUserData({ name: voter.fullName, cccd: voterCCCD });
          } else {
            setUserData({ name: 'Cử tri', cccd: voterCCCD });
          }
        }
      } else {
        setIsLoggedIn(false);
        setIsAdmin(false);
        setUserData(null);
      }
    };

    checkLoginStatus();
  }, [location.pathname]);

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    if (isAdmin) {
      localStorage.removeItem('adminCCCD');
      localStorage.removeItem('isAdmin');
    } else {
      localStorage.removeItem('voterCCCD');
      localStorage.removeItem('isVoter');
    }

    setIsLoggedIn(false);
    setIsAdmin(false);
    setUserData(null);
    handleClose();
    navigate('/');
  };

  const menuItems = [
    { label: 'Danh Sách Bầu Cử', path: '/elections' },
  ];

  return (
    <AppBar position="static">
      <Container maxWidth="lg">
        <Toolbar disableGutters>
          <Typography
            variant="h5"
            component="div"
            sx={{ 
              flexGrow: 1, 
              cursor: 'pointer', 
              color: '#fff', 
              fontWeight: 700,
              letterSpacing: '0.5px'
            }}
            onClick={() => navigate('/')}
          >
            Hệ Thống Bầu Cử
          </Typography>

          {isMobile ? (
            <>
              <IconButton
                size="large"
                edge="end"
                color="inherit"
                aria-label="menu"
                onClick={handleMenu}
              >
                <MenuIcon />
              </IconButton>
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleClose}
              >
                {menuItems.map((item) => (
                  <MenuItem
                    key={item.path}
                    onClick={() => {
                      navigate(item.path);
                      handleClose();
                    }}
                  >
                    {item.label}
                  </MenuItem>
                ))}
              </Menu>
            </>
          ) : (
            <Box sx={{ display: 'flex', gap: 2 }}>
              {menuItems.map((item) => (
                <Button
                  key={item.path}
                  color="inherit"
                  onClick={() => navigate(item.path)}
                >
                  {item.label}
                </Button>
              ))}
            </Box>
          )}

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            {!isAdmin && !isLoggedIn ? (
              <>
                <Button color="inherit"  onClick={() => navigate('/login')}>
                  Đăng Nhập
                </Button>
                <Button color="inherit" onClick={() => navigate('/register')}>
                  Đăng Ký
                </Button>
                <Button
                  color="inherit"
                  variant="outlined"
                  onClick={() => navigate('/admin')}
                  sx={{ ml: 1, borderColor: 'rgba(255,255,255,0.7)', '&:hover': { borderColor: '#fff', bgcolor: 'rgba(255,255,255,0.1)' } }}
                >
                  Quản trị viên
                </Button>
              </>
            ) : (
              <>
                <IconButton
                  onClick={handleMenu}
                  color="inherit"
                  size="large"
                >
                  <Avatar sx={{ bgcolor: 'primary.light', color: 'primary.dark' }}>
                    <AccountCircleIcon />
                  </Avatar>
                </IconButton>
                <Menu
                  anchorEl={anchorEl}
                  open={Boolean(anchorEl)}
                  onClose={handleClose}
                >
                  <MenuItem disabled>
                    {isAdmin ? 'Admin' : userData?.name || 'Người dùng'}
                  </MenuItem>
                  <MenuItem onClick={handleLogout}>
                    <LogoutIcon sx={{ mr: 1 }} />
                    Đăng Xuất
                  </MenuItem>
                </Menu>
              </>
            )}
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default Header; 