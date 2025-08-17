import React, { useState, useEffect, useCallback } from 'react';
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  CardMedia,
  CardActions,
  Button,
  Divider,
  Paper,
  Chip,
  Alert,
  CircularProgress,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Snackbar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  AppBar,
  Toolbar,
  IconButton,
  Avatar,
  CardActionArea,
  Stack,
} from '@mui/material';
import { useWeb3React } from '@web3-react/core';
import { ethers } from 'ethers';
import { useNavigate } from 'react-router-dom';
import VotingSystem from '../contracts/VotingSystem.json';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import HowToVoteIcon from '@mui/icons-material/HowToVote';
import PersonIcon from '@mui/icons-material/Person';
import HistoryIcon from '@mui/icons-material/History';
import BallotIcon from '@mui/icons-material/Ballot';
import EventIcon from '@mui/icons-material/Event';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import InfoIcon from '@mui/icons-material/Info';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { useWeb3Connection } from '../hooks/useWeb3Connection';
import { useContract } from '../hooks/useContract';
import contractConfig from '../utils/contractConfig';
import { ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import { formatDate } from '../utils/helpers';
import { getElectionStatus } from '../utils/electionHelpers';

function VoterDashboard() {
  const { account, library, active } = useWeb3React();
  const navigate = useNavigate();
  const [voter, setVoter] = useState(null);
  const [elections, setElections] = useState([]);
  const [votingHistory, setVotingHistory] = useState([]);
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success',
  });
  const [currentUser, setCurrentUser] = useState(null);
  const [candidates, setCandidates] = useState([]);
  const [votes, setVotes] = useState([]);
  const [selectedElection, setSelectedElection] = useState(null);
  const [openVoteDialog, setOpenVoteDialog] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [openViewCandidateDialog, setOpenViewCandidateDialog] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const hideSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const checkVoterStatus = useCallback(async () => {
    if (!account || !library) {
      navigate('/login');
      return false;
    }

    try {
      const contract = new ethers.Contract(
        process.env.REACT_APP_CONTRACT_ADDRESS,
        VotingSystem.abi,
        library
      );

      const isRegistered = await contract.isVoter(account);
      if (!isRegistered) {
        showSnackbar('Bạn cần đăng ký tài khoản cử tri trước', 'error');
        navigate('/register');
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error checking voter status:', error);
      showSnackbar('Không thể kiểm tra trạng thái cử tri', 'error');
      return false;
    }
  }, [account, library, navigate]);

  const loadVoterInfo = useCallback(async () => {
    if (!account || !library) return;

    try {
      const contract = new ethers.Contract(
        process.env.REACT_APP_CONTRACT_ADDRESS,
        VotingSystem.abi,
        library
      );

      const voterData = await contract.getVoter(account);
      
      setVoter({
        address: account,
        name: voterData.name,
        cccd: voterData.cccd,
        birthDate: new Date(voterData.birthDate * 1000),
        address: voterData.voterAddress,
        hasVoted: voterData.hasVoted,
        isRegistered: voterData.isRegistered,
      });
    } catch (error) {
      console.error('Error loading voter information:', error);
      showSnackbar('Không thể tải thông tin cử tri', 'error');
    }
  }, [account, library]);

  const loadElections = useCallback(async () => {
    if (!account || !library) return;
    
    try {
      const contract = new ethers.Contract(
        process.env.REACT_APP_CONTRACT_ADDRESS,
        VotingSystem.abi,
        library
      );

      const electionCount = await contract.getElectionCount();
      const now = Math.floor(Date.now() / 1000);
      const electionsData = [];

      for (let i = 0; i < electionCount; i++) {
        const election = await contract.getElection(i);
        
        // Chỉ lấy các cuộc bầu cử đang diễn ra hoặc sắp diễn ra
        if (election.endTime >= now && !election.isCompleted) {
          electionsData.push({
            id: i,
            title: election.title,
            description: election.description,
            startTime: new Date(election.startTime * 1000),
            endTime: new Date(election.endTime * 1000),
            logoUrl: election.logoUrl || 'https://via.placeholder.com/150',
            isCompleted: election.isCompleted,
            isVoted: await contract.hasVoted(account, i),
          });
        }
      }

      setElections(electionsData);
    } catch (error) {
      console.error('Error loading elections:', error);
      showSnackbar('Không thể tải danh sách bầu cử', 'error');
    } finally {
      setLoading(false);
    }
  }, [account, library]);

  const loadVotingHistory = useCallback(async () => {
    if (!account || !library) return;
    
    try {
      const contract = new ethers.Contract(
        process.env.REACT_APP_CONTRACT_ADDRESS,
        VotingSystem.abi,
        library
      );

      const historyData = await contract.getVoterHistory(account);
      const history = [];

      for (let i = 0; i < historyData.length; i++) {
        const electionId = historyData[i].electionId;
        const electionData = await contract.getElection(electionId);
        const candidateData = await contract.getCandidate(electionId, historyData[i].candidateId);
        
        history.push({
          electionId,
          electionTitle: electionData.title,
          candidateName: candidateData.name,
          timestamp: new Date(historyData[i].timestamp * 1000),
        });
      }

      setVotingHistory(history);
    } catch (error) {
      console.error('Error loading voting history:', error);
      showSnackbar('Không thể tải lịch sử bỏ phiếu', 'error');
    }
  }, [account, library]);

  useEffect(() => {
    const init = async () => {
      const isValidVoter = await checkVoterStatus();
      if (isValidVoter) {
        await Promise.all([
          loadVoterInfo(),
          loadElections(),
          loadVotingHistory()
        ]);
      }
    };

    if (active) {
      init();
    } else {
      navigate('/login');
    }
  }, [active, checkVoterStatus, loadVoterInfo, loadElections, loadVotingHistory, navigate]);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const getElectionStatus = (election) => {
    const now = new Date();
    if (election.startTime > now) return 'Upcoming';
    if (election.endTime > now) return 'Active';
    return 'Ended';
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Active':
        return 'success';
      case 'Upcoming':
        return 'warning';
      default:
        return 'error';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'Active':
        return 'Đang diễn ra';
      case 'Upcoming':
        return 'Sắp diễn ra';
      case 'Ended':
        return 'Đã kết thúc';
      default:
        return status;
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('currentVoter');
    navigate('/login');
  };

  const handleSelectElection = (election) => {
    setSelectedElection(election);
  };

  const handleBackToElections = () => {
    setSelectedElection(null);
  };

  const handleViewCandidate = (candidate) => {
    setSelectedCandidate(candidate);
    setOpenViewCandidateDialog(true);
  };

  const handleOpenVoteDialog = (candidate) => {
    // Kiểm tra xem cử tri đã bỏ phiếu chưa
    const hasVoted = votes.some(
      vote => vote.voterId === currentUser.id && vote.electionId === selectedElection.id
    );

    if (hasVoted) {
      showSnackbar('Bạn đã bỏ phiếu cho cuộc bầu cử này rồi!', 'warning');
      return;
    }

    setSelectedCandidate(candidate);
    setOpenVoteDialog(true);
  };

  const handleCloseVoteDialog = () => {
    setOpenVoteDialog(false);
  };

  const handleSubmitVote = () => {
    if (!selectedCandidate || !selectedElection || !currentUser) {
      showSnackbar('Dữ liệu không hợp lệ!', 'error');
      return;
    }

    setSubmitLoading(true);

    // Tạo phiếu bầu mới
    const newVote = {
      id: Date.now().toString(),
      electionId: selectedElection.id,
      candidateId: selectedCandidate.id,
      voterId: currentUser.id,
      timestamp: new Date().toISOString()
    };

    // Cập nhật localStorage
    const updatedVotes = [...votes, newVote];
    localStorage.setItem('votes', JSON.stringify(updatedVotes));
    setVotes(updatedVotes);

    // Hiển thị thông báo thành công
    setTimeout(() => {
      setSubmitLoading(false);
      setOpenVoteDialog(false);
      showSnackbar('Bỏ phiếu thành công!', 'success');
    }, 1000);
  };

  // Kiểm tra xem cử tri đã bỏ phiếu cho cuộc bầu cử này chưa
  const hasVotedForElection = (electionId) => {
    return votes.some(vote => vote.voterId === currentUser?.id && vote.electionId === electionId);
  };

  // Lấy thông tin ứng cử viên đã bỏ phiếu
  const getVotedCandidate = (electionId) => {
    const vote = votes.find(vote => vote.voterId === currentUser?.id && vote.electionId === electionId);
    if (!vote) return null;
    
    return candidates.find(candidate => candidate.id === vote.candidateId);
  };

  // Render danh sách cuộc bầu cử
  const renderElectionsList = () => {
    if (loading) {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      );
    }

    if (elections.length === 0) {
      return (
        <Alert severity="info" sx={{ mt: 3 }}>
          Hiện tại không có cuộc bầu cử nào đang diễn ra.
        </Alert>
      );
    }

    return (
      <Grid container spacing={3} sx={{ mt: 1 }}>
        {elections.map((election) => {
          const status = getElectionStatus(election);
          const voted = hasVotedForElection(election.id);
          const votedCandidate = getVotedCandidate(election.id);
          
          return (
            <Grid item xs={12} md={6} key={election.id}>
              <Card 
                variant="outlined" 
                sx={{ 
                  height: '100%', 
                  display: 'flex', 
                  flexDirection: 'column',
                  transition: 'transform 0.3s, box-shadow 0.3s',
                  '&:hover': {
                    transform: 'translateY(-5px)',
                    boxShadow: 3,
                  }
                }}
              >
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Typography variant="h5" component="h2" gutterBottom>
                      {election.title}
                    </Typography>
                    <Chip 
                      label={status === 'active' ? 'Đang diễn ra' : 'Đã kết thúc'} 
                      color={status === 'active' ? 'success' : 'default'}
                      size="small"
                    />
                  </Box>
                  
                  <Typography color="text.secondary" gutterBottom>
                    <strong>Bắt đầu:</strong> {formatDate(election.startTime)}
                  </Typography>
                  <Typography color="text.secondary" gutterBottom>
                    <strong>Kết thúc:</strong> {formatDate(election.endTime)}
                  </Typography>

                  {voted && (
                    <Box sx={{ mt: 2, p: 1, bgcolor: 'success.light', borderRadius: 1 }}>
                      <Typography variant="body2">
                        <CheckCircleIcon fontSize="small" sx={{ mr: 0.5, verticalAlign: 'middle' }} />
                        Bạn đã bỏ phiếu cho: <strong>{votedCandidate?.name || 'Không xác định'}</strong>
                      </Typography>
                    </Box>
                  )}
                </CardContent>
                <Box sx={{ p: 2, pt: 0 }}>
                  <Button 
                    variant="contained" 
                    color="primary" 
                    fullWidth
                    onClick={() => handleSelectElection(election)}
                    disabled={status === 'completed' && voted}
                    startIcon={status === 'completed' ? <CheckCircleIcon /> : <HowToVoteIcon />}
                  >
                    {status === 'completed' 
                      ? (voted ? 'Đã bỏ phiếu' : 'Xem kết quả') 
                      : (voted ? 'Xem chi tiết' : 'Tham gia bầu cử')}
                  </Button>
                </Box>
              </Card>
            </Grid>
          );
        })}
      </Grid>
    );
  };

  // Render thông tin chi tiết cuộc bầu cử và danh sách ứng cử viên
  const renderElectionDetail = () => {
    if (!selectedElection) return null;

    // Lọc danh sách ứng cử viên theo cuộc bầu cử
    const electionCandidates = candidates.filter(
      candidate => candidate.electionId === selectedElection.id
    );

    const status = getElectionStatus(selectedElection);
    const voted = hasVotedForElection(selectedElection.id);
    const votedCandidate = getVotedCandidate(selectedElection.id);

    return (
      <Box>
        <Button 
          startIcon={<ArrowBackIcon />}
          onClick={handleBackToElections}
          sx={{ mb: 3 }}
        >
          Quay lại danh sách
        </Button>

        <Paper elevation={1} sx={{ p: 3, mb: 4 }}>
          <Typography variant="h4" gutterBottom>
            {selectedElection.title}
          </Typography>
          
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 2 }}>
            <Chip 
              label={status === 'active' ? 'Đang diễn ra' : 'Đã kết thúc'} 
              color={status === 'active' ? 'success' : 'default'}
            />
            {voted && (
              <Chip 
                icon={<CheckCircleIcon />} 
                label="Đã bỏ phiếu" 
                color="info"
              />
            )}
          </Box>
          
          <Divider sx={{ my: 2 }} />
          
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Typography variant="body1" sx={{ mb: 1 }}>
                <strong>Thời gian bắt đầu:</strong> {formatDate(selectedElection.startTime)}
              </Typography>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Typography variant="body1" sx={{ mb: 1 }}>
                <strong>Thời gian kết thúc:</strong> {formatDate(selectedElection.endTime)}
              </Typography>
            </Grid>
            
            <Grid item xs={12}>
              <Typography variant="body1" sx={{ mb: 1 }}>
                <strong>Mô tả:</strong> {selectedElection.description || 'Không có mô tả'}
              </Typography>
            </Grid>
          </Grid>
          
          {voted && (
            <Alert severity="success" sx={{ mt: 3 }}>
              Bạn đã bỏ phiếu cho ứng cử viên: <strong>{votedCandidate?.name || 'Không xác định'}</strong> vào lúc{' '}
              {formatDate(votes.find(v => v.voterId === currentUser?.id && v.electionId === selectedElection.id)?.timestamp)}
            </Alert>
          )}
        </Paper>

        <Typography variant="h5" gutterBottom>
          Danh sách ứng cử viên
        </Typography>

        {electionCandidates.length === 0 ? (
          <Alert severity="info">Không có ứng cử viên nào trong cuộc bầu cử này.</Alert>
        ) : (
          <Grid container spacing={3}>
            {electionCandidates.map((candidate) => {
              const isVoted = voted && votedCandidate?.id === candidate.id;
              
              return (
                <Grid item xs={12} sm={6} md={4} key={candidate.id}>
                  <Card 
                    sx={{ 
                      height: '100%', 
                      display: 'flex', 
                      flexDirection: 'column',
                      border: isVoted ? '2px solid #4caf50' : undefined,
                      transition: 'transform 0.2s',
                      '&:hover': {
                        transform: 'scale(1.02)',
                      }
                    }}
                  >
                    <CardActionArea onClick={() => handleViewCandidate(candidate)}>
                      <CardMedia
                        component="img"
                        height="160"
                        image={candidate.imageUrl || '/candidate-placeholder.png'}
                        alt={candidate.name}
                        sx={{ objectFit: 'cover' }}
                      />
                      <CardContent>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <Typography gutterBottom variant="h6" component="div">
                            {candidate.name}
                          </Typography>
                          {isVoted && (
                            <CheckCircleIcon color="success" />
                          )}
                        </Box>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          {candidate.position || 'Không có chức vụ'}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" noWrap>
                          {candidate.description?.substring(0, 100) || 'Không có mô tả'}
                          {candidate.description?.length > 100 && '...'}
                        </Typography>
                      </CardContent>
                    </CardActionArea>

                    {status === 'active' && !voted && (
                      <Box sx={{ p: 2, pt: 0, mt: 'auto' }}>
                        <Button 
                          variant="contained" 
                          onClick={() => handleOpenVoteDialog(candidate)}
                          fullWidth
                          startIcon={<HowToVoteIcon />}
                        >
                          Bầu chọn
                        </Button>
                      </Box>
                    )}
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        )}
      </Box>
    );
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Hệ thống Bầu cử
          </Typography>
          {currentUser && (
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Typography variant="body1" sx={{ mr: 2 }}>
                Xin chào, {currentUser.name}
              </Typography>
              <Button color="inherit" onClick={handleLogout}>
                Đăng xuất
              </Button>
            </Box>
          )}
        </Toolbar>
      </AppBar>
      
      <Container sx={{ py: 4 }}>
        {selectedElection ? renderElectionDetail() : (
          <Box>
            <Typography variant="h4" gutterBottom>
              Danh sách cuộc bầu cử
            </Typography>
            <Typography variant="subtitle1" color="text.secondary" gutterBottom>
              Hãy chọn một cuộc bầu cử để tham gia hoặc xem kết quả.
            </Typography>
            {renderElectionsList()}
          </Box>
        )}
      </Container>

      {/* Dialog xác nhận bỏ phiếu */}
      <Dialog
        open={openVoteDialog}
        onClose={handleCloseVoteDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Xác nhận bỏ phiếu</DialogTitle>
        <DialogContent>
          <Typography variant="body1" gutterBottom>
            Bạn đang bỏ phiếu cho ứng cử viên <strong>{selectedCandidate?.name}</strong> trong cuộc bầu cử <strong>{selectedElection?.title}</strong>.
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            Lưu ý: Sau khi xác nhận, bạn sẽ không thể thay đổi lựa chọn của mình.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseVoteDialog}>Hủy</Button>
          <Button 
            variant="contained" 
            color="primary" 
            onClick={handleSubmitVote}
            disabled={submitLoading}
            startIcon={submitLoading && <CircularProgress size={20} />}
          >
            {submitLoading ? 'Đang xử lý...' : 'Xác nhận bỏ phiếu'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog xem chi tiết ứng cử viên */}
      <Dialog
        open={openViewCandidateDialog}
        onClose={() => setOpenViewCandidateDialog(false)}
        maxWidth="md"
        fullWidth
      >
        {selectedCandidate && (
          <>
            <DialogTitle sx={{ pb: 0 }}>
              Thông tin chi tiết ứng cử viên
            </DialogTitle>
            <DialogContent sx={{ pt: 3 }}>
              <Grid container spacing={3}>
                <Grid item xs={12} md={4}>
                  <Box 
                    component="img" 
                    src={selectedCandidate.imageUrl || '/candidate-placeholder.png'} 
                    alt={selectedCandidate.name}
                    sx={{ 
                      width: '100%', 
                      borderRadius: 1,
                      maxHeight: 300,
                      objectFit: 'cover'
                    }}
                  />
                </Grid>
                <Grid item xs={12} md={8}>
                  <Typography variant="h5" gutterBottom>
                    {selectedCandidate.name}
                  </Typography>
                  
                  <Typography variant="subtitle1" color="text.secondary" gutterBottom>
                    {selectedCandidate.position || 'Không có chức vụ'}
                  </Typography>
                  
                  <Divider sx={{ my: 2 }} />
                  
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2">
                        <strong>Ngày sinh:</strong> {formatDate(selectedCandidate.birthDate)}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2">
                        <strong>Quê quán:</strong> {selectedCandidate.hometown || 'Không có thông tin'}
                      </Typography>
                    </Grid>
                    
                    {selectedCandidate.description && (
                      <Grid item xs={12}>
                        <Typography variant="body2" sx={{ mt: 1 }}>
                          <strong>Mô tả:</strong> {selectedCandidate.description}
                        </Typography>
                      </Grid>
                    )}
                    
                    {selectedCandidate.achievements && (
                      <Grid item xs={12}>
                        <Typography variant="body2" sx={{ mt: 1 }}>
                          <strong>Thành tích:</strong> {selectedCandidate.achievements}
                        </Typography>
                      </Grid>
                    )}
                    
                    {selectedCandidate.motto && (
                      <Grid item xs={12}>
                        <Typography variant="body2" sx={{ mt: 2, fontStyle: 'italic', color: 'primary.main' }}>
                          "{selectedCandidate.motto}"
                        </Typography>
                      </Grid>
                    )}
                  </Grid>
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setOpenViewCandidateDialog(false)}>
                Đóng
              </Button>
              {getElectionStatus(selectedElection) === 'active' && !hasVotedForElection(selectedElection?.id) && (
                <Button 
                  variant="contained" 
                  color="primary"
                  onClick={() => {
                    setOpenViewCandidateDialog(false);
                    handleOpenVoteDialog(selectedCandidate);
                  }}
                  startIcon={<HowToVoteIcon />}
                >
                  Bầu chọn
                </Button>
              )}
            </DialogActions>
          </>
        )}
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={hideSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={hideSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default VoterDashboard; 