import React, { useState, useEffect } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  IconButton,
  Menu,
  MenuItem,
  Chip,
  CircularProgress,
  useMediaQuery,
  useTheme,
  Avatar,
  Alert,
  Fade,
  Grow,
  Divider,
} from '@mui/material';
import { Link as RouterLink, useNavigate, useLocation } from 'react-router-dom';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import LogoutIcon from '@mui/icons-material/Logout';
import EditIcon from '@mui/icons-material/Edit';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import LoadingButton from '@mui/lab/LoadingButton';
import axios from 'axios';
import { useWeb3 } from '../contexts/Web3Context';
import HowToVoteIcon from '@mui/icons-material/HowToVote';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import PersonIcon from '@mui/icons-material/Person';
import WalletIcon from '@mui/icons-material/Wallet';

function Header() {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { active, account, isConnecting, error, connectWallet, disconnectWallet } = useWeb3();
  
  const [anchorEl, setAnchorEl] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userData, setUserData] = useState(null);
  const [openEditVoter, setOpenEditVoter] = useState(false);
  const [editVoterData, setEditVoterData] = useState({ name: '', birthDate: '', address: '' });
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState('');
  const [editSuccess, setEditSuccess] = useState(false);

  // Khi là cử tri, lấy thông tin từ localStorage (hoặc backend nếu có)
  useEffect(() => {
    if (!isAdmin && isLoggedIn && userData) {
      const voterName = localStorage.getItem('voterName') || userData.name || '';
      const voterBirthDate = localStorage.getItem('voterBirthDate') || '';
      const voterAddress = localStorage.getItem('voterAddress') || '';
      
      console.log('Initializing edit voter data:', {
        name: voterName,
        birthDate: voterBirthDate,
        address: voterAddress
      });
      
      setEditVoterData({
        name: voterName,
        birthDate: voterBirthDate,
        address: voterAddress
      });
    }
  }, [isAdmin, isLoggedIn, userData]);

  // Thêm useEffect để đồng bộ trạng thái đăng nhập khi localStorage thay đổi
  useEffect(() => {
    function syncLoginState() {
      const adminCCCD = localStorage.getItem('adminCCCD');
      const isAdminValue = localStorage.getItem('isAdmin') === 'true';
      const voterCCCD = localStorage.getItem('voterCCCD');
      const isVoterValue = localStorage.getItem('isVoter') === 'true';
      if (isAdminValue && adminCCCD) {
        setIsLoggedIn(true);
        setIsAdmin(true);
        setUserData({ name: 'Admin', cccd: adminCCCD });
      } else if (isVoterValue && voterCCCD) {
        setIsLoggedIn(true);
        setIsAdmin(false);
        const voterName = localStorage.getItem('voterName');
        setUserData({ name: voterName || 'Cử tri', cccd: voterCCCD });
      } else {
        setIsLoggedIn(false);
        setIsAdmin(false);
        setUserData(null);
      }
    }
    syncLoginState();
    window.addEventListener('storage', syncLoginState);
    return () => window.removeEventListener('storage', syncLoginState);
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
      localStorage.removeItem('adminName');
      localStorage.removeItem('adminEmail');
      
      if (active) {
        disconnectWallet();
      }

      setIsLoggedIn(false);
      setIsAdmin(false);
      setUserData(null);
      
      handleClose();
      
      navigate('/', { replace: true });
    } else {
      localStorage.removeItem('voterCCCD');
      localStorage.removeItem('isVoter');
      localStorage.removeItem('voterName');
      localStorage.removeItem('voterEmail');
      
      if (active) {
        disconnectWallet();
      }

      setIsLoggedIn(false);
      setIsAdmin(false);
      setUserData(null);
      
      handleClose();
      
      navigate('/', { replace: true });
    }
  };

  const handleOpenEditVoter = async () => {
    setEditError('');
    setEditSuccess(false);
    setEditLoading(true);
    
    try {
      // Lấy thông tin mới nhất từ server
      const jwt = localStorage.getItem('jwt');
      if (jwt) {
        const res = await axios.get('http://localhost:5000/api/voters/me', {
          headers: { 
            'Authorization': `Bearer ${jwt}`,
            'Content-Type': 'application/json'
          }
        });
        
        // Cập nhật dữ liệu form với thông tin từ server
        setEditVoterData({
          name: res.data.fullName || '',
          birthDate: res.data.birthDate || '',
          address: res.data.address || ''
        });
        
        // Cập nhật localStorage nếu có dữ liệu mới
        if (res.data.fullName) {
          localStorage.setItem('voterName', res.data.fullName);
        }
        if (res.data.birthDate) {
          localStorage.setItem('voterBirthDate', res.data.birthDate);
        }
        if (res.data.address) {
          localStorage.setItem('voterAddress', res.data.address);
        }
      } else {
        // Fallback: sử dụng dữ liệu từ localStorage
        const voterName = localStorage.getItem('voterName') || '';
        const voterBirthDate = localStorage.getItem('voterBirthDate') || '';
        const voterAddress = localStorage.getItem('voterAddress') || '';
        
        setEditVoterData({
          name: voterName,
          birthDate: voterBirthDate,
          address: voterAddress
        });
      }
    } catch (err) {
      console.error('Error fetching voter data:', err);
      // Fallback: sử dụng dữ liệu từ localStorage
      const voterName = localStorage.getItem('voterName') || '';
      const voterBirthDate = localStorage.getItem('voterBirthDate') || '';
      const voterAddress = localStorage.getItem('voterAddress') || '';
      
      setEditVoterData({
        name: voterName,
        birthDate: voterBirthDate,
        address: voterAddress
      });
    } finally {
      setEditLoading(false);
    setOpenEditVoter(true);
    }
  };
  const handleCloseEditVoter = () => {
    setOpenEditVoter(false);
  };
  const handleEditVoterChange = (e) => {
    setEditVoterData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };
  const handleEditVoterSubmit = async (e) => {
    e.preventDefault();
    setEditLoading(true);
    setEditError('');
    setEditSuccess(false);
    
    try {
      const jwt = localStorage.getItem('jwt');
      console.log('JWT token:', jwt ? 'Present' : 'Missing');
      
      if (!jwt) {
        setEditError('Không tìm thấy token đăng nhập. Vui lòng đăng nhập lại.');
        return;
      }

      // Validation
      if (!editVoterData.name || editVoterData.name.trim() === '') {
        setEditError('Họ và tên không được để trống.');
        return;
      }

      const requestData = {
        fullName: editVoterData.name.trim(),
        birthDate: editVoterData.birthDate || null,
        address: editVoterData.address || ''
      };
      
      console.log('Sending update request:', requestData);
      
      const res = await axios.put('http://localhost:5000/api/voters/me', requestData, {
        headers: { 
          'Authorization': `Bearer ${jwt}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('Update response:', res.data);
      
      // Cập nhật localStorage với dữ liệu từ server
      localStorage.setItem('voterName', res.data.fullName);
      if (res.data.birthDate) {
      localStorage.setItem('voterBirthDate', res.data.birthDate);
      }
      if (res.data.address) {
      localStorage.setItem('voterAddress', res.data.address);
      }
      
      // Cập nhật userData state ngay lập tức
      setUserData(prev => ({
        ...prev,
        name: res.data.fullName
      }));
      
      // Cập nhật editVoterData để form hiển thị dữ liệu mới
      setEditVoterData({
        name: res.data.fullName,
        birthDate: res.data.birthDate || '',
        address: res.data.address || ''
      });
      
      setEditSuccess(true);
      
      // Đóng dialog sau 2 giây để user thấy thông báo thành công
      setTimeout(() => {
      setOpenEditVoter(false);
        setEditSuccess(false);
      }, 2000);
      
    } catch (err) {
      console.error('Edit voter error:', err);
      console.error('Error response:', err.response?.data);
      
      if (err.response?.status === 401) {
        setEditError('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
        // Tự động logout nếu token hết hạn
        setTimeout(() => {
          localStorage.clear();
          window.location.reload();
        }, 3000);
      } else if (err.response?.status === 404) {
        setEditError('Không tìm thấy thông tin cử tri. Vui lòng đăng nhập lại.');
      } else if (err.response?.status === 400) {
        setEditError(err.response.data.error || 'Dữ liệu không hợp lệ. Vui lòng kiểm tra lại.');
      } else if (err.response?.status === 500) {
        setEditError('Lỗi server. Vui lòng thử lại sau.');
      } else if (err.code === 'NETWORK_ERROR') {
        setEditError('Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng.');
      } else {
        setEditError(err.response?.data?.error || 'Cập nhật thất bại. Vui lòng thử lại.');
      }
    } finally {
      setEditLoading(false);
    }
  };

  const formatAddress = (address) => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const isAdminDashboard = location.pathname.startsWith('/admin/dashboard');

  if (isAdminDashboard) return null;

  return (
    <>
      <AppBar
        position="fixed"
        sx={{
          background: 'linear-gradient(135deg,rgb(0, 44, 21) 0%,rgb(0, 118, 72) 50%, rgb(0, 44, 21) 100%)',
          color: 'primary.contrastText',
          height: 70,
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
          zIndex: 1000,
          backdropFilter: 'blur(10px)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.03"%3E%3Ccircle cx="30" cy="30" r="2"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
            pointerEvents: 'none',
          },
        }}
      >
        <Toolbar sx={{ minHeight: '70px !important', px: { xs: 2, md: 4 } }}>
          {/* Logo và tên hệ thống */}
          <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
            <Grow in timeout={800}>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2,
                  textDecoration: 'none',
                  color: 'inherit',
                }}
                component={RouterLink}
                to="/"
              >
                <Box
                  sx={{
                    width: 45,
                    height: 45,
                    borderRadius: '12px',
                    background: 'linear-gradient(135deg, rgba(255,255,255,0.2), rgba(255,255,255,0.1))',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255,255,255,0.2)',
                    boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
                  }}
                >
                  <HowToVoteIcon sx={{ fontSize: 28, color: 'white' }} />
                </Box>
          <Typography
            variant="h4"
            sx={{
                    fontWeight: 700,
                    letterSpacing: 1.2,
                    textShadow: '0 2px 8px rgba(0,0,0,0.3)',
                    background: 'linear-gradient(135deg, #ffffff, #e0f2f1)',
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
            }}
          >
            HỆ THỐNG BẦU CỬ
          </Typography>
              </Box>
            </Grow>
          </Box>

          {/* Navigation và User Actions */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1, md: 2 } }}>
            {isLoggedIn && (
              <Fade in timeout={600}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                {isAdmin ? (
                  <Button
                    color="inherit"
                    component={RouterLink}
                    to="/admin/dashboard"
                      startIcon={<AdminPanelSettingsIcon />}
                      sx={{
                        borderRadius: 2,
                        px: 3,
                        py: 1,
                        fontWeight: 600,
                        textTransform: 'none',
                        background: 'rgba(255,255,255,0.1)',
                        backdropFilter: 'blur(10px)',
                        border: '1px solid rgba(255,255,255,0.2)',
                        '&:hover': {
                          background: 'rgba(255,255,255,0.2)',
                          transform: 'translateY(-1px)',
                        },
                        transition: 'all 0.3s ease',
                      }}
                  >
                    Quản lý
                  </Button>
                ) : (
                  <Button
                    color="inherit"
                    component={RouterLink}
                    to="/elections"
                      startIcon={<HowToVoteIcon />}
                      sx={{
                        borderRadius: 2,
                        px: 3,
                        py: 1,
                        fontWeight: 600,
                        textTransform: 'none',
                        background: 'rgba(255,255,255,0.1)',
                        backdropFilter: 'blur(10px)',
                        border: '1px solid rgba(255,255,255,0.2)',
                        '&:hover': {
                          background: 'rgba(255,255,255,0.2)',
                          transform: 'translateY(-1px)',
                        },
                        transition: 'all 0.3s ease',
                      }}
                  >
                    Danh sách bầu cử
                  </Button>
                )}
                </Box>
              </Fade>
            )}

            {/* Wallet Connection */}
            {active && (
              <Fade in timeout={800}>
              <Chip
                  icon={<WalletIcon />}
                label={formatAddress(account)}
                color="secondary"
                variant="outlined"
                sx={{ 
                    bgcolor: 'rgba(255,255,255,0.15)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255,255,255,0.3)',
                    '& .MuiChip-label': { 
                      color: 'white',
                      fontWeight: 600,
                    },
                    '& .MuiChip-icon': {
                      color: 'white',
                    },
                    '&:hover': {
                      bgcolor: 'rgba(255,255,255,0.25)',
                    },
                    transition: 'all 0.3s ease',
                  }}
                />
              </Fade>
            )}

            {/* User Menu */}
            {isLoggedIn ? (
              <Fade in timeout={1000}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <IconButton
                  size="large"
                  onClick={handleMenu}
                  color="inherit"
                    sx={{
                      background: 'rgba(255,255,255,0.1)',
                      backdropFilter: 'blur(10px)',
                      border: '1px solid rgba(255,255,255,0.2)',
                      '&:hover': {
                        background: 'rgba(255,255,255,0.2)',
                        transform: 'scale(1.05)',
                      },
                      transition: 'all 0.3s ease',
                    }}
                  >
                    <Avatar 
                      sx={{ 
                        bgcolor: isAdmin ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.15)',
                        width: 35,
                        height: 35,
                      }}
                    >
                      {isAdmin ? <AdminPanelSettingsIcon /> : <PersonIcon />}
                  </Avatar>
                </IconButton>
                {!isAdmin && (
                    <Typography
                      variant="body1"
                      sx={{
                        fontWeight: 600,
                        color: 'white',
                        textShadow: '0 1px 3px rgba(0,0,0,0.3)',
                        display: { xs: 'none', sm: 'block' },
                      }}
                    >
                      {userData?.name || 'Cử tri'}
                    </Typography>
                )}
                <Menu
                  anchorEl={anchorEl}
                  open={Boolean(anchorEl)}
                  onClose={handleClose}
                  anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                  transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                    PaperProps={{
                      sx: {
                        mt: 1,
                        minWidth: 200,
                        background: 'rgba(255,255,255,0.95)',
                        backdropFilter: 'blur(20px)',
                        border: '1px solid rgba(255,255,255,0.3)',
                        boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                        borderRadius: 2,
                      }
                    }}
                  >
                    <MenuItem disabled sx={{ opacity: 0.7, fontWeight: 600 }}>
                      {isAdmin ? '👨‍💼 Admin' : `👤 ${userData?.name || 'Cử tri'}`}
                    </MenuItem>
                    <Divider />
                    {!isAdmin && (
                      <MenuItem 
                        onClick={() => { handleClose(); handleOpenEditVoter(); }}
                        sx={{ 
                          '&:hover': { bgcolor: 'rgba(22, 147, 133, 0.1)' },
                          transition: 'all 0.2s ease',
                        }}
                      >
                        <EditIcon fontSize="small" sx={{ mr: 1, color: '#169385' }} />
                        Chỉnh sửa thông tin
                      </MenuItem>
                    )}
                    <MenuItem 
                      onClick={handleLogout}
                      sx={{ 
                        '&:hover': { bgcolor: 'rgba(244, 67, 54, 0.1)' },
                        transition: 'all 0.2s ease',
                      }}
                    >
                      <LogoutIcon sx={{ mr: 1, color: '#f44336' }} />
                      Đăng xuất
                    </MenuItem>
                </Menu>
                </Box>
              </Fade>
            ) : (
              <Fade in timeout={1200}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1, md: 2 } }}>
                {active && (
                  <IconButton
                    size="large"
                    onClick={handleMenu}
                    color="inherit"
                      sx={{
                        background: 'rgba(255,255,255,0.1)',
                        backdropFilter: 'blur(10px)',
                        border: '1px solid rgba(255,255,255,0.2)',
                        '&:hover': {
                          background: 'rgba(255,255,255,0.2)',
                          transform: 'scale(1.05)',
                        },
                        transition: 'all 0.3s ease',
                      }}
                    >
                      <WalletIcon />
                  </IconButton>
                )}
                {!active && !isLoggedIn && (
                  <Button
                    color="inherit"
                    onClick={connectWallet}
                    disabled={isConnecting}
                      startIcon={isConnecting ? <CircularProgress size={20} color="inherit" /> : <WalletIcon />}
                      sx={{
                        borderRadius: 2,
                        px: 3,
                        py: 1,
                        fontWeight: 600,
                        textTransform: 'none',
                        background: 'rgba(255,255,255,0.1)',
                        backdropFilter: 'blur(10px)',
                        border: '1px solid rgba(255,255,255,0.2)',
                        '&:hover': {
                          background: 'rgba(255,255,255,0.2)',
                          transform: 'translateY(-1px)',
                        },
                        '&:disabled': {
                          background: 'rgba(255,255,255,0.05)',
                        },
                        transition: 'all 0.3s ease',
                      }}
                  >
                    {isConnecting ? 'Đang kết nối...' : 'Kết nối ví'}
                  </Button>
                )}
                  {!active && isLoggedIn && (
                    <Button
                      color="inherit"
                      onClick={connectWallet}
                      disabled={isConnecting}
                      startIcon={isConnecting ? <CircularProgress size={20} color="inherit" /> : <WalletIcon />}
                      sx={{
                        borderRadius: 2,
                        px: 3,
                        py: 1,
                        fontWeight: 600,
                        textTransform: 'none',
                        background: 'rgba(255,255,255,0.1)',
                        backdropFilter: 'blur(10px)',
                        border: '1px solid rgba(255,255,255,0.2)',
                        '&:hover': {
                          background: 'rgba(255,255,255,0.2)',
                          transform: 'translateY(-1px)',
                        },
                        '&:disabled': {
                          background: 'rgba(255,255,255,0.05)',
                        },
                        transition: 'all 0.3s ease',
                      }}
                    >
                      {isConnecting ? 'Đang kết nối...' : 'Kết nối ví'}
                    </Button>
                  )}
                  {!isMobile && !isLoggedIn && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Button
                        color="inherit"
                        component={RouterLink}
                        to="/login"
                        sx={{
                          borderRadius: 2,
                          px: 3,
                          py: 1,
                          fontWeight: 600,
                          textTransform: 'none',
                          background: 'rgba(255,255,255,0.1)',
                          backdropFilter: 'blur(10px)',
                          border: '1px solid rgba(255,255,255,0.2)',
                          '&:hover': {
                            background: 'rgba(255,255,255,0.2)',
                            transform: 'translateY(-1px)',
                          },
                          transition: 'all 0.3s ease',
                        }}
                      >
                        Đăng nhập
                    </Button>
                    <Button
                      color="inherit"
                      component={RouterLink}
                      to="/register"
                        sx={{
                          borderRadius: 2,
                          px: 3,
                          py: 1,
                          fontWeight: 600,
                          textTransform: 'none',
                          background: 'rgba(255,255,255,0.1)',
                          backdropFilter: 'blur(10px)',
                          border: '1px solid rgba(255,255,255,0.2)',
                          '&:hover': {
                            background: 'rgba(255,255,255,0.2)',
                            transform: 'translateY(-1px)',
                          },
                          transition: 'all 0.3s ease',
                        }}
                    >
                      Đăng ký
                    </Button>
                    <Button
                      color="inherit"
                      variant="outlined"
                      component={RouterLink}
                      to="/admin"
                        startIcon={<AdminPanelSettingsIcon />}
                      sx={{ 
                          borderRadius: 2,
                          px: 3,
                          py: 1,
                          fontWeight: 600,
                          textTransform: 'none',
                        borderColor: 'rgba(255,255,255,0.5)',
                          backdropFilter: 'blur(10px)',
                        '&:hover': {
                          borderColor: 'white',
                            backgroundColor: 'rgba(255,255,255,0.15)',
                            transform: 'translateY(-1px)',
                          },
                          transition: 'all 0.3s ease',
                      }}
                    >
                      Quản trị viên
                    </Button>
                    </Box>
                )}
                {active && (
                  <Menu
                    anchorEl={anchorEl}
                    open={Boolean(anchorEl)}
                    onClose={handleClose}
                      PaperProps={{
                        sx: {
                          mt: 1,
                          minWidth: 200,
                          background: 'rgba(255,255,255,0.95)',
                          backdropFilter: 'blur(20px)',
                          border: '1px solid rgba(255,255,255,0.3)',
                          boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                          borderRadius: 2,
                        }
                      }}
                    >
                      <MenuItem 
                        onClick={handleLogout}
                        sx={{ 
                          '&:hover': { bgcolor: 'rgba(244, 67, 54, 0.1)' },
                          transition: 'all 0.2s ease',
                        }}
                      >
                        <LogoutIcon sx={{ mr: 1, color: '#f44336' }} />
                      Ngắt kết nối ví
                    </MenuItem>
                  </Menu>
                )}
                </Box>
              </Fade>
            )}
          </Box>
        </Toolbar>
      </AppBar>

      {/* Dialog chỉnh sửa thông tin cử tri */}
      <EditVoterDialog
        open={openEditVoter}
        onClose={handleCloseEditVoter}
        data={editVoterData}
        onChange={handleEditVoterChange}
        onSubmit={handleEditVoterSubmit}
        loading={editLoading}
        error={editError}
        success={editSuccess}
      />
    </>
  );
}

// Dialog chỉnh sửa thông tin cử tri
function EditVoterDialog({ open, onClose, data, onChange, onSubmit, loading, error, success }) {
  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="md" 
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 4,
          background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
          boxShadow: '0 25px 80px rgba(0,0,0,0.2)',
          border: '1px solid rgba(255,255,255,0.3)',
          overflow: 'hidden',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
        }
      }}
    >
      {/* Header với gradient và pattern */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, rgb(0, 44, 21) 0%, rgb(0, 118, 72) 50%, rgb(0, 88, 54) 100%)',
          color: 'white',
          p: 4,
          position: 'relative',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.08"%3E%3Ccircle cx="30" cy="30" r="2"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
            pointerEvents: 'none',
          },
          '&::after': {
            content: '""',
            position: 'absolute',
            top: '50%',
            right: '-50px',
            width: '200px',
            height: '200px',
            background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)',
            borderRadius: '50%',
            transform: 'translateY(-50%)',
          },
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, position: 'relative', zIndex: 1 }}>
          <Box
            sx={{
              width: 60,
              height: 60,
              borderRadius: '16px',
              background: 'linear-gradient(135deg, rgba(255,255,255,0.25), rgba(255,255,255,0.15))',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backdropFilter: 'blur(15px)',
              border: '1px solid rgba(255,255,255,0.3)',
              boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
            }}
          >
            <EditIcon sx={{ fontSize: 32, color: 'white' }} />
          </Box>
          <Box sx={{ flex: 1 }}>
            <Typography variant="h4" sx={{ fontWeight: 800, mb: 1, letterSpacing: 0.5 }}>
              Chỉnh sửa thông tin cá nhân
            </Typography>
            <Typography variant="body1" sx={{ opacity: 0.95, fontSize: '1.1rem' }}>
              Cập nhật và quản lý thông tin cá nhân của bạn một cách an toàn
            </Typography>
          </Box>
        </Box>
      </Box>

      <form onSubmit={onSubmit}>
                <DialogContent sx={{ 
          p: 0, 
          flex: 1, 
          overflow: 'auto',
          '&::-webkit-scrollbar': {
            width: '8px',
          },
          '&::-webkit-scrollbar-track': {
            background: 'rgba(0,0,0,0.05)',
            borderRadius: '4px',
          },
          '&::-webkit-scrollbar-thumb': {
            background: 'rgba(0, 118, 72, 0.3)',
            borderRadius: '4px',
            '&:hover': {
              background: 'rgba(0, 118, 72, 0.5)',
            },
          },
        }}>
          {loading ? (
            <Box sx={{ 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center', 
              py: 8,
              background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
              minHeight: '400px',
            }}>
              <Box
                sx={{
                  width: 80,
                  height: 80,
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, rgb(0, 118, 72), rgb(0, 88, 54))',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mb: 3,
                  boxShadow: '0 10px 30px rgba(0, 118, 72, 0.3)',
                }}
              >
                <CircularProgress size={40} sx={{ color: 'white' }} />
              </Box>
              <Typography variant="h5" color="text.primary" sx={{ mb: 1, fontWeight: 600 }}>
                Đang tải thông tin...
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Vui lòng chờ trong giây lát
              </Typography>
            </Box>
          ) : (
            <Box sx={{ 
              display: 'grid', 
              gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, 
              gap: 4, 
              p: 4,
              background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
              minHeight: '400px',
              pb: 6, // Thêm padding bottom để tránh content bị che bởi buttons
            }}>
              {/* Cột trái - Thông tin cơ bản */}
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                <Typography variant="h6" sx={{ 
                  fontWeight: 700, 
                  color: '#1a202c', 
                  mb: 2,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                }}>
                  <Box sx={{ 
                    width: 4, 
                    height: 20, 
                    background: 'linear-gradient(135deg, rgb(0, 118, 72), rgb(0, 88, 54))',
                    borderRadius: 2,
                  }} />
                  Thông tin cơ bản
                </Typography>

                {/* Họ và tên */}
                <Box>
                  <Typography variant="subtitle1" sx={{ mb: 1.5, fontWeight: 600, color: '#2d3748' }}>
                    Họ và tên *
                  </Typography>
          <TextField
            name="name"
            value={data.name}
            onChange={onChange}
            fullWidth
                    placeholder="Nhập họ và tên đầy đủ"
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 3,
                        background: 'rgba(255,255,255,0.8)',
                        backdropFilter: 'blur(10px)',
                        border: '1px solid rgba(255,255,255,0.3)',
                        '&:hover': {
                          background: 'rgba(255,255,255,0.95)',
                          border: '1px solid rgba(0, 118, 72, 0.3)',
                        },
                        '&.Mui-focused': {
                          background: 'white',
                          border: '2px solid rgb(0, 118, 72)',
                          boxShadow: '0 0 0 4px rgba(0, 118, 72, 0.1)',
                        },
                      },
                      '& .MuiInputBase-input': {
                        fontSize: '1rem',
                        padding: '16px 20px',
                      },
                    }}
                    InputProps={{
                      startAdornment: (
                        <Box sx={{ mr: 2, color: 'rgb(0, 118, 72)' }}>
                          <PersonIcon sx={{ fontSize: 24 }} />
                        </Box>
                      ),
                    }}
                  />
                </Box>

                {/* Ngày sinh */}
                <Box>
                  <Typography variant="subtitle1" sx={{ mb: 1.5, fontWeight: 600, color: '#2d3748' }}>
                    Ngày sinh
                  </Typography>
          <TextField
            name="birthDate"
            type="date"
            value={data.birthDate}
            onChange={onChange}
            fullWidth
            InputLabelProps={{ shrink: true }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 3,
                        background: 'rgba(255,255,255,0.8)',
                        backdropFilter: 'blur(10px)',
                        border: '1px solid rgba(255,255,255,0.3)',
                        '&:hover': {
                          background: 'rgba(255,255,255,0.95)',
                          border: '1px solid rgba(0, 118, 72, 0.3)',
                        },
                        '&.Mui-focused': {
                          background: 'white',
                          border: '2px solid rgb(0, 118, 72)',
                          boxShadow: '0 0 0 4px rgba(0, 118, 72, 0.1)',
                        },
                      },
                      '& .MuiInputBase-input': {
                        fontSize: '1rem',
                        padding: '16px 20px',
                      },
                    }}
                    InputProps={{
                      startAdornment: (
                        <Box sx={{ mr: 2, color: 'rgb(0, 118, 72)' }}>
                          <Box sx={{ fontSize: 24 }}>📅</Box>
                        </Box>
                      ),
                    }}
                  />
                </Box>
              </Box>

              {/* Cột phải - Thông tin bổ sung */}
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                <Typography variant="h6" sx={{ 
                  fontWeight: 700, 
                  color: '#1a202c', 
                  mb: 2,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                }}>
                  <Box sx={{ 
                    width: 4, 
                    height: 20, 
                    background: 'linear-gradient(135deg, rgb(0, 118, 72), rgb(0, 88, 54))',
                    borderRadius: 2,
                  }} />
                  Thông tin bổ sung
                </Typography>

                {/* Địa chỉ */}
                <Box>
                  <Typography variant="subtitle1" sx={{ mb: 1.5, fontWeight: 600, color: '#2d3748' }}>
                    Địa chỉ hiện tại
                  </Typography>
          <TextField
            name="address"
            value={data.address}
            onChange={onChange}
            fullWidth
                    placeholder="Nhập địa chỉ chi tiết..."
                    multiline
                    rows={4}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 3,
                        background: 'rgba(255,255,255,0.8)',
                        backdropFilter: 'blur(10px)',
                        border: '1px solid rgba(255,255,255,0.3)',
                        '&:hover': {
                          background: 'rgba(255,255,255,0.95)',
                          border: '1px solid rgba(0, 118, 72, 0.3)',
                        },
                        '&.Mui-focused': {
                          background: 'white',
                          border: '2px solid rgb(0, 118, 72)',
                          boxShadow: '0 0 0 4px rgba(0, 118, 72, 0.1)',
                        },
                      },
                      '& .MuiInputBase-input': {
                        fontSize: '1rem',
                        padding: '16px 20px',
                      },
                    }}
                    InputProps={{
                      startAdornment: (
                        <Box sx={{ mr: 2, color: 'rgb(0, 118, 72)', mt: 1 }}>
                        </Box>
                      ),
                    }}
                  />
                </Box>

              </Box>
            </Box>
          )}
            {(error || success) && (
              <Box sx={{ p: 4, pt: 0 }}>
                {error && (
                  <Alert 
                    severity="error" 
                    sx={{ 
                      borderRadius: 3,
                      '& .MuiAlert-icon': { fontSize: 28 },
                      background: 'rgba(244, 67, 54, 0.08)',
                      border: '1px solid rgba(244, 67, 54, 0.2)',
                      boxShadow: '0 4px 15px rgba(244, 67, 54, 0.1)',
                      marginTop: -5,
                    }}
                  >
                    <Box>
                      <Typography variant="body1" sx={{ fontWeight: 700, mb: 0.5, color: 'black' }}>
                        ❌ Có lỗi xảy ra
                      </Typography>
                      <Typography variant="body2" sx={{ fontSize: 15, lineHeight: 1.5, color: 'black' }}>
                        {error}
                      </Typography>
                    </Box>
                  </Alert>
                )}

                {success && (
                  <Alert 
                    severity="success" 
                    sx={{ 
                      borderRadius: 3,
                      '& .MuiAlert-icon': { fontSize: 28 },
                      background: 'rgba(76, 175, 80, 0.08)',
                      border: '1px solid rgba(76, 175, 80, 0.2)',
                      boxShadow: '0 4px 15px rgba(76, 175, 80, 0.1)',
                    }}
                  >
                    <Box>
                      <Typography variant="body1" sx={{ fontWeight: 700, mb: 0.5, color: 'black' }}>
                        ✅ Cập nhật thành công!
                      </Typography>
                      <Typography variant="body2" sx={{ fontSize: 15, lineHeight: 1.5 }}>
                        Thông tin cá nhân của bạn đã được cập nhật thành công và lưu vào hệ thống.
                      </Typography>
                    </Box>
                  </Alert>
                )}
              </Box>
            )}
        </DialogContent>

          <DialogActions sx={{ 
            p: 4, 
            pt: 0, 
            gap: 3,
            background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
            borderTop: '1px solid rgba(0,0,0,0.05)',
            flexShrink: 0, // Đảm bảo buttons không bị co lại
            position: 'sticky',
            bottom: 0,
            zIndex: 1,
          }}>
            <Button 
              onClick={onClose}
              variant="outlined"
              sx={{
                borderRadius: 3,
                px: 5,
                py: 2,
                fontWeight: 600,
                textTransform: 'none',
                fontSize: '1rem',
                borderColor: 'rgba(0, 118, 72, 0.3)',
                color: 'rgb(0, 118, 72)',
                background: 'rgba(255,255,255,0.8)',
                backdropFilter: 'blur(10px)',
                '&:hover': {
                  borderColor: 'rgb(0, 118, 72)',
                  backgroundColor: 'rgba(0, 118, 72, 0.05)',
                  transform: 'translateY(-1px)',
                  boxShadow: '0 4px 15px rgba(0, 118, 72, 0.2)',
                },
                transition: 'all 0.3s ease',
              }}
            >
              Hủy bỏ
            </Button>
            <LoadingButton 
              type="submit" 
              loading={loading} 
              variant="contained"
              sx={{
                borderRadius: 3,
                px: 5,
                py: 2,
                fontWeight: 700,
                textTransform: 'none',
                fontSize: '1rem',
                background: 'linear-gradient(135deg, rgb(0, 118, 72) 0%, rgb(0, 88, 54) 100%)',
                boxShadow: '0 6px 20px rgba(0, 118, 72, 0.3)',
                '&:hover': {
                  background: 'linear-gradient(135deg, rgb(0, 88, 54) 0%, rgb(0, 118, 72) 100%)',
                  boxShadow: '0 8px 25px rgba(0, 118, 72, 0.4)',
                  transform: 'translateY(-2px)',
                },
                '&:disabled': {
                  background: '#e2e8f0',
                  boxShadow: 'none',
                  transform: 'none',
                },
                transition: 'all 0.3s ease',
              }}
            >
              {loading ? 'Đang cập nhật...' : 'Lưu thay đổi'}
            </LoadingButton>
        </DialogActions>
      </form>
    </Dialog>
  );
}

export default Header;