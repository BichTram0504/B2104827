import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Button,
  Divider,
  Chip,
  Alert,
  CircularProgress,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import PersonIcon from '@mui/icons-material/Person';
import HowToVoteIcon from '@mui/icons-material/HowToVote';
import EventIcon from '@mui/icons-material/Event';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

function Dashboard() {
  const navigate = useNavigate();
  const [voter, setVoter] = useState(null);
  const [elections, setElections] = useState([]);
  const [votedElections, setVotedElections] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Kiểm tra trạng thái đăng nhập
    const isVoter = localStorage.getItem('isVoter') === 'true';
    const voterCCCD = localStorage.getItem('voterCCCD');
    
    if (!isVoter || !voterCCCD) {
      navigate('/login');
      return;
    }

    // Tải thông tin cử tri
    loadVoterInfo(voterCCCD);
    
    // Tải danh sách bầu cử
    loadElections();
    
    // Tải danh sách bầu cử đã tham gia
    loadVotedElections();
  }, [navigate]);

  const loadVoterInfo = (voterCCCD) => {
    try {
      const votersData = JSON.parse(localStorage.getItem('voters') || '[]');
      const voter = votersData.find(v => v.cccd === voterCCCD);
      
      if (voter) {
        setVoter(voter);
      } else {
        // Thử tìm trong danh sách cử tri đăng ký
        const registeredVoters = JSON.parse(localStorage.getItem('registeredVoters') || '[]');
        const registeredVoter = registeredVoters.find(v => v.cccd === voterCCCD);
        
        if (registeredVoter) {
          setVoter(registeredVoter);
        }
      }
    } catch (error) {
      console.error('Error loading voter data:', error);
    }
  };

  const loadElections = () => {
    try {
      const storedElections = localStorage.getItem('elections');
      if (storedElections) {
        setElections(JSON.parse(storedElections));
      }
    } catch (error) {
      console.error('Error loading elections:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadVotedElections = () => {
    try {
      const votedElections = JSON.parse(localStorage.getItem('votedElections') || '[]');
      setVotedElections(votedElections);
    } catch (error) {
      console.error('Error loading voted elections:', error);
    }
  };

  const getElectionStatus = (election) => {
    const now = new Date();
    const startTime = new Date(election.startTime);
    const endTime = new Date(election.endTime);
    
    if (now < startTime) return 'upcoming';
    if (now >= startTime && now <= endTime) return 'active';
    return 'completed';
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'upcoming':
        return 'info';
      case 'active':
        return 'success';
      case 'completed':
        return 'default';
      default:
        return 'error';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'upcoming':
        return 'Sắp diễn ra';
      case 'active':
        return 'Đang diễn ra';
      case 'completed':
        return 'Đã kết thúc';
      default:
        return 'Không xác định';
    }
  };

  const formatDate = (date) => {
    if (!date) return '';
    try {
      return format(new Date(date), 'dd/MM/yyyy HH:mm', { locale: vi });
    } catch (error) {
      return '';
    }
  };

  const getActiveElections = () => {
    return elections.filter(election => getElectionStatus(election) === 'active');
  };

  const hasVoted = (electionId) => {
    return votedElections.includes(electionId);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Trang Cử Tri
      </Typography>

      {voter && (
        <Paper sx={{ p: 3, mb: 4 }}>
          <Typography variant="h5" gutterBottom>
            Thông Tin Cử Tri
          </Typography>
          <Divider sx={{ mb: 2 }} />
          
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <List>
                <ListItem>
                  <ListItemIcon>
                    <PersonIcon />
                  </ListItemIcon>
                  <ListItemText primary="Họ và tên" secondary={voter.fullName} />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <PersonIcon />
                  </ListItemIcon>
                  <ListItemText primary="CCCD" secondary={voter.cccd} />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <PersonIcon />
                  </ListItemIcon>
                  <ListItemText primary="Địa chỉ" secondary={voter.address} />
                </ListItem>
                {voter.birthDate && (
                  <ListItem>
                    <ListItemIcon>
                      <EventIcon />
                    </ListItemIcon>
                    <ListItemText primary="Ngày sinh" secondary={formatDate(voter.birthDate)} />
                  </ListItem>
                )}
              </List>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Box 
                sx={{ 
                  height: '100%', 
                  display: 'flex', 
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'center',
                  bgcolor: 'primary.light',
                  color: 'primary.contrastText',
                  p: 3,
                  borderRadius: 2
                }}
              >
                <HowToVoteIcon sx={{ fontSize: 48, mb: 2 }} />
                <Typography variant="h6" align="center" gutterBottom>
                  Cuộc bầu cử đang diễn ra
                </Typography>
                <Typography variant="h3" align="center">
                  {getActiveElections().length}
                </Typography>
                
                {getActiveElections().length > 0 && (
                  <Button 
                    variant="contained" 
                    color="secondary"
                    onClick={() => navigate('/elections')}
                    sx={{ mt: 2 }}
                  >
                    Xem danh sách bầu cử
                  </Button>
                )}
              </Box>
            </Grid>
          </Grid>
        </Paper>
      )}

      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h5" gutterBottom>
          Cuộc Bầu Cử Đang Diễn Ra
        </Typography>
        <Divider sx={{ mb: 2 }} />
        
        {getActiveElections().length === 0 ? (
          <Alert severity="info">
            Hiện tại không có cuộc bầu cử nào đang diễn ra
          </Alert>
        ) : (
          <Grid container spacing={3}>
            {getActiveElections().map((election) => (
              <Grid item xs={12} sm={6} md={4} key={election.id}>
                <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                      <Typography variant="h6" component="h2">
                        {election.title}
                      </Typography>
                      <Chip
                        label={getStatusText('active')}
                        color={getStatusColor('active')}
                        size="small"
                      />
                    </Box>
                    <Typography variant="body2" color="text.secondary" paragraph>
                      {election.description}
                    </Typography>
                    <Typography variant="body2" color="text.primary">
                      Kết thúc vào: {formatDate(election.endTime)}
                    </Typography>
                    
                    {hasVoted(election.id) ? (
                      <Box display="flex" alignItems="center" mt={2}>
                        <CheckCircleIcon color="success" sx={{ mr: 1 }} />
                        <Typography variant="body2" color="success.main">
                          Bạn đã bỏ phiếu cho cuộc bầu cử này
                        </Typography>
                      </Box>
                    ) : (
                      <Button
                        variant="contained"
                        color="primary"
                        fullWidth
                        sx={{ mt: 2 }}
                        onClick={() => navigate(`/elections/${election.id}`)}
                      >
                        Bỏ phiếu ngay
                      </Button>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Paper>

      <Paper sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>
          Lịch Sử Bỏ Phiếu
        </Typography>
        <Divider sx={{ mb: 2 }} />
        
        {votedElections.length === 0 ? (
          <Alert severity="info">
            Bạn chưa tham gia bỏ phiếu trong cuộc bầu cử nào
          </Alert>
        ) : (
          <List>
            {votedElections.map((electionId) => {
              const election = elections.find(e => e.id === electionId);
              return election ? (
                <React.Fragment key={electionId}>
                  <ListItem>
                    <ListItemIcon>
                      <HowToVoteIcon color="primary" />
                    </ListItemIcon>
                    <ListItemText
                      primary={election.title}
                      secondary={`Đã bỏ phiếu vào ngày ${formatDate(new Date())}`}
                    />
                    <Button 
                      variant="outlined" 
                      size="small"
                      onClick={() => navigate(`/elections/${election.id}`)}
                    >
                      Chi tiết
                    </Button>
                  </ListItem>
                  <Divider />
                </React.Fragment>
              ) : null;
            })}
          </List>
        )}
      </Paper>
    </Container>
  );
}

export default Dashboard; 