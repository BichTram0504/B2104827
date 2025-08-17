import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline, Box } from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { vi } from 'date-fns/locale';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import ElectionList from './pages/ElectionList';
import ElectionDetail from './pages/ElectionDetail';

// Components
import Header from './components/Header';
import Footer from './components/Footer';

// Create Theme 
const theme = createTheme({
  palette: {
    primary: {
      main: '#20B2AA', // lightseagreen
      light: '#5ed4cd',
      dark: '#00827b',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#607d8b', // xám xanh
      light: '#8eacbb',
      dark: '#34515e',
      contrastText: '#ffffff',
    },
    background: {
      default: '#f5f5f5', // xám nhạt
      paper: '#ffffff',  // trắng
    },
    text: {
      primary: '#333333',
      secondary: '#757575',
    },
    divider: '#e0e0e0',
  },
  typography: {
    fontFamily: [
      'Roboto',
      'Arial',
      'sans-serif',
    ].join(','),
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
          fontWeight: 500,
        },
        containedPrimary: {
          '&:hover': {
            backgroundColor: '#00827b',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        },
      },
    },
  },
});

// Route guard for admin routes
const AdminRoute = ({ children }) => {
  const isAdmin = localStorage.getItem('isAdmin') === 'true';
  console.log('AdminRoute check:', isAdmin);
  return isAdmin ? children : <Navigate to="/admin" />;
};

// Route guard for voter routes
const VoterRoute = ({ children }) => {
  const isVoter = localStorage.getItem('isVoter') === 'true';
  console.log('VoterRoute check:', isVoter);
  return isVoter ? children : <Navigate to="/login" />;
};

function App() {
  // Check for existing login on app start
  useEffect(() => {
    const voterCCCD = localStorage.getItem('voterCCCD');
    const adminCCCD = localStorage.getItem('adminCCCD');
    
    console.log('App init - voter login:', !!voterCCCD);
    console.log('App init - admin login:', !!adminCCCD);
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={vi}>
        <Router>
          <Box 
            sx={{ 
              display: 'flex', 
              flexDirection: 'column', 
              minHeight: '100vh' 
            }}
          >
            <Header />
            <Box 
              component="main" 
              sx={{ 
                flexGrow: 1, 
                pt: 2,
                pb: 4
              }}
            >
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                {/* Tạm thời chuyển hướng đến trang bầu cử thay vì dashboard */}
                <Route path="/dashboard" element={<Navigate to="/elections" />} />
                <Route path="/admin" element={<AdminLogin />} />
                <Route path="/admin/dashboard" element={
                  <AdminRoute>
                    <AdminDashboard />
                  </AdminRoute>
                } />
                <Route path="/elections" element={<ElectionList />} />
                <Route path="/elections/:id" element={<ElectionDetail />} />
                {/* Sử dụng redirect thay vì component NotFound */}
                <Route path="*" element={<Navigate to="/" />} />
              </Routes>
            </Box>
            <Footer />
          </Box>
        </Router>
      </LocalizationProvider>
    </ThemeProvider>
  );
}

export default App;
