import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Button,
  Divider,
  Chip,
  CircularProgress,
  Paper,
  List,
  ListItem,
  ListItemText,
  Avatar,
  ListItemAvatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { formatDate } from '../utils/helpers';
import { getElectionStatus, getStatusColor, getStatusText, getRemainingTime } from '../utils/electionHelpers';
import EventIcon from '@mui/icons-material/Event';
import PeopleIcon from '@mui/icons-material/People';
import HowToVoteIcon from '@mui/icons-material/HowToVote';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
// Thay đổi đường dẫn ảnh mặc định thành URL trực tiếp
const defaultElectionImage = 'https://i.imgur.com/D2lDXPB.jpg';

function ElectionList() {
  const navigate = useNavigate();
  const [elections, setElections] = useState([]);
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedElection, setSelectedElection] = useState(null);
  const [openCandidatesDialog, setOpenCandidatesDialog] = useState(false);

  useEffect(() => {
    loadElections();
    loadCandidates();
  }, []);

  const loadElections = () => {
    try {
      setLoading(true);
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

  const loadCandidates = () => {
    try {
      const storedCandidates = localStorage.getItem('candidates');
      if (storedCandidates) {
        setCandidates(JSON.parse(storedCandidates));
      }
    } catch (error) {
      console.error('Error loading candidates:', error);
    }
  };

  const getElectionCandidates = (electionId) => {
    return candidates.filter(candidate => candidate.electionId === electionId);
  };

  const handleViewCandidates = (election) => {
    setSelectedElection(election);
    setOpenCandidatesDialog(true);
  };

  const handleVote = (election) => {
    navigate(`/elections/${election.id}`);
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
      <Typography variant="h4" component="h1" gutterBottom align="center">
        Danh sách cuộc bầu cử
      </Typography>
      <Divider sx={{ mb: 4 }} />
      
      {elections.length === 0 ? (
        <Paper sx={{ p: 5, textAlign: 'center' }}>
          <Typography variant="h6">Chưa có cuộc bầu cử nào được tạo</Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
            Vui lòng quay lại sau
          </Typography>
        </Paper>
      ) : (
        <Grid container spacing={4}>
          {elections.map((election) => {
            const status = getElectionStatus(election);
            const isActive = status === 'active';
            const electionCandidates = getElectionCandidates(election.id);
            
            return (
              <Grid item xs={12} md={6} key={election.id}>
                <Card 
                  sx={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    height: '100%',
                    transition: 'transform 0.3s, box-shadow 0.3s',
                    '&:hover': {
                      transform: 'translateY(-5px)',
                      boxShadow: 6,
                    }
                  }}
                >
                  <Box sx={{ position: 'relative' }}>
                    <CardMedia
                      component="img"
                      height="160"
                      image={election.logoUrl || defaultElectionImage}
                      alt={election.title}
                    />
                    <Chip
                      label={getStatusText(status)}
                      color={getStatusColor(status)}
                      sx={{
                        position: 'absolute',
                        top: 16,
                        right: 16,
                        fontWeight: 'bold',
                      }}
                    />
                  </Box>
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography gutterBottom variant="h5" component="div">
                      {election.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {election.description}
                    </Typography>
                    
                    <List dense>
                      <ListItem>
                        <ListItemAvatar>
                          <Avatar sx={{ bgcolor: 'primary.light' }}>
                            <EventIcon />
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText 
                          primary="Thời gian bắt đầu" 
                          secondary={formatDate(election.startTime)} 
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemAvatar>
                          <Avatar sx={{ bgcolor: 'error.light' }}>
                            <AccessTimeIcon />
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText 
                          primary="Thời gian kết thúc" 
                          secondary={formatDate(election.endTime)} 
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemAvatar>
                          <Avatar sx={{ bgcolor: 'secondary.light' }}>
                            <PeopleIcon />
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText 
                          primary="Số lượng ứng cử viên"
                          secondary={electionCandidates.length} 
                        />
                      </ListItem>
                    </List>
                    
                    {isActive && (
                      <Box sx={{ color: 'success.main', fontWeight: 'bold', mb: 1 }}>
                        {getRemainingTime(election.endTime)}
                      </Box>
                    )}
                  </CardContent>
                  
                  <Divider />
                  
                  <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <Button 
                      variant="outlined" 
                      size="small"
                      onClick={() => handleViewCandidates(election)}
                    >
                      Xem danh sách ứng cử viên ({electionCandidates.length})
                    </Button>
                    
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Button
                        variant="contained"
                        color="primary"
                        size="small"
                        onClick={() => handleVote(election)}
                        fullWidth
                      >
                        {isActive ? 'Bỏ phiếu ngay' : 'Chi tiết'}
                      </Button>
                      
                      {status === 'completed' && (
                        <Button
                          variant="contained"
                          color="secondary"
                          size="small"
                          fullWidth
                          startIcon={<HowToVoteIcon />}
                          onClick={() => {
                            navigate(`/elections/${election.id}`);
                            // Thêm tham số để tự động hiển thị kết quả
                            localStorage.setItem('showResults_' + election.id, 'true');
                          }}
                        >
                          XEM KẾT QUẢ
                        </Button>
                      )}
                    </Box>
                  </Box>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}

      {/* Dialog hiển thị danh sách ứng cử viên */}
      <Dialog 
        open={openCandidatesDialog} 
        onClose={() => setOpenCandidatesDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {selectedElection && `Ứng cử viên - ${selectedElection.title}`}
        </DialogTitle>
        <DialogContent dividers>
          {selectedElection && getElectionCandidates(selectedElection.id).length === 0 ? (
            <Typography variant="body1" sx={{ textAlign: 'center', py: 2 }}>
              Chưa có ứng cử viên nào cho cuộc bầu cử này
            </Typography>
          ) : (
            <Grid container spacing={2}>
              {selectedElection && getElectionCandidates(selectedElection.id).map((candidate) => (
                <Grid item xs={12} sm={6} md={4} key={candidate.id}>
                  <Card>
                    <CardContent>
                      {candidate.imageUrl && (
                        <CardMedia
                          component="img"
                          height="140"
                          image={candidate.imageUrl}
                          alt={candidate.name}
                          sx={{ mb: 2, borderRadius: 1 }}
                        />
                      )}
                      <Typography variant="h6">{candidate.name}</Typography>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        {candidate.position}
                      </Typography>
                      
                      <Divider sx={{ my: 1 }} />
                      
                      <Typography variant="body2">
                        <strong>Năm sinh:</strong> {candidate.birthDate ? new Date(candidate.birthDate).getFullYear() : 'Không có thông tin'}
                      </Typography>
                      {candidate.hometown && (
                        <Typography variant="body2">
                          <strong>Quê quán:</strong> {candidate.hometown}
                        </Typography>
                      )}
                      {candidate.motto && (
                        <Typography variant="body2" sx={{ mt: 1, fontStyle: 'italic' }}>
                          "{candidate.motto}"
                        </Typography>
                      )}
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenCandidatesDialog(false)}>Đóng</Button>
          {selectedElection && getElectionStatus(selectedElection) === 'active' && (
            <Button 
              variant="contained" 
              onClick={() => {
                setOpenCandidatesDialog(false);
                handleVote(selectedElection);
              }}
              startIcon={<HowToVoteIcon />}
            >
              Bầu cử ngay
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Container>
  );
}

export default ElectionList; 