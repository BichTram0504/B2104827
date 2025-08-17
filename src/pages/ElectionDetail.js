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
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  FormLabel,
  Snackbar,
  IconButton,
  Checkbox,
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import { formatDate } from '../utils/helpers';
import { getElectionStatus, getStatusColor, getStatusText, getRemainingTime } from '../utils/electionHelpers';
import EventIcon from '@mui/icons-material/Event';
import PeopleIcon from '@mui/icons-material/People';
import HowToVoteIcon from '@mui/icons-material/HowToVote';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import InfoIcon from '@mui/icons-material/Info';
import CloseIcon from '@mui/icons-material/Close';
const defaultElectionImage = 'https://i.imgur.com/D2lDXPB.jpg';

function ElectionDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [election, setElection] = useState(null);
  const [candidates, setCandidates] = useState([]);
  const [selectedCandidates, setSelectedCandidates] = useState([]);
  const [openVoteDialog, setOpenVoteDialog] = useState(false);
  const [openLoginDialog, setOpenLoginDialog] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });
  const [votes, setVotes] = useState({});
  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    loadElection();
    loadCandidates();
    loadVotes();
    
    // Kiểm tra xem có nên hiển thị kết quả không (khi chuyển từ trang danh sách)
    const shouldShowResults = localStorage.getItem(`showResults_${id}`);
    if (shouldShowResults === 'true') {
      setShowResults(true);
      // Xóa tham số sau khi đã dùng
      localStorage.removeItem(`showResults_${id}`);
    }
    
    // Chỉ tạo dữ liệu mẫu nếu là lần đầu xem cuộc bầu cử này
    const hasGeneratedSampleData = localStorage.getItem(`sample_votes_generated_${id}`);
    
    if (!hasGeneratedSampleData && election && getElectionStatus(election) === 'completed') {
      // Đặt timeout để đảm bảo dữ liệu đã được tải
      const timeoutId = setTimeout(() => {
        createSampleVoteData();
        // Đánh dấu đã tạo dữ liệu mẫu để không tạo lại
        localStorage.setItem(`sample_votes_generated_${id}`, 'true');
      }, 1000);
      
      // Cleanup timeout khi component unmount
      return () => clearTimeout(timeoutId);
    }
  }, [id, election]);

  const loadElection = () => {
    try {
      setLoading(true);
      const storedElections = localStorage.getItem('elections');
      if (storedElections) {
        const elections = JSON.parse(storedElections);
        const foundElection = elections.find(e => e.id === id);
        if (foundElection) {
          setElection(foundElection);
        } else {
          setError('Không tìm thấy cuộc bầu cử này');
          navigate('/elections');
        }
      }
    } catch (error) {
      console.error('Error loading election:', error);
      setError('Không thể tải thông tin cuộc bầu cử');
    } finally {
      setLoading(false);
    }
  };

  const loadCandidates = async () => {
    try {
      // Load candidates from localStorage
      const storedCandidates = localStorage.getItem('candidates');
      if (storedCandidates) {
        const allCandidates = JSON.parse(storedCandidates);
        // Filter candidates for this specific election
        const electionCandidates = allCandidates.filter(c => c.electionId === id);
        
        if (electionCandidates.length > 0) {
          console.log("Loaded candidates:", electionCandidates);
          setCandidates(electionCandidates);
        } else {
          // If no candidates found for this election, create sample ones
          console.log("No candidates found for this election. Creating samples.");
          createSampleCandidates();
        }
      } else {
        // If no candidates data exists at all, create samples
        console.log("No candidates data exists. Creating samples.");
        createSampleCandidates();
      }
    } catch (error) {
      console.error('Error loading candidates:', error);
      setError('Không thể tải dữ liệu ứng cử viên');
    }
  };

  const loadVotes = () => {
    try {
      const storedVotes = localStorage.getItem(`votes_${id}`);
      if (storedVotes) {
        const parsedVotes = JSON.parse(storedVotes);
        console.log("Loaded votes:", parsedVotes);
        setVotes(parsedVotes);
      } else {
        // Khởi tạo số phiếu là 0 cho mỗi ứng cử viên
        const initialVotes = {};
        const storedCandidates = localStorage.getItem('candidates');
        if (storedCandidates) {
          const allCandidates = JSON.parse(storedCandidates);
          const electionCandidates = allCandidates.filter(c => c.electionId === id);
          electionCandidates.forEach(candidate => {
            initialVotes[candidate.id] = 0;
          });
          setVotes(initialVotes);
          
          // Chỉ lưu initialVotes vào localStorage nếu đây là cuộc bầu cử đang diễn ra
          // Nếu là cuộc bầu cử đã kết thúc, chúng ta sẽ để createSampleVoteData() tạo dữ liệu thay vì dữ liệu rỗng
          if (election && getElectionStatus(election) !== 'completed') {
            localStorage.setItem(`votes_${id}`, JSON.stringify(initialVotes));
            console.log("Initialized votes for active election:", initialVotes);
          }
        }
      }
    } catch (error) {
      console.error('Error loading votes:', error);
      // Khởi tạo mảng votes trống để tránh lỗi
      setVotes({});
    }
  };

  const handleVoteClick = () => {
    const isVoter = localStorage.getItem('isVoter') === 'true';
    if (!isVoter) {
      setOpenLoginDialog(true);
      return;
    }
    
    // Reset selected candidates when opening the dialog
    setSelectedCandidates([]);
    setOpenVoteDialog(true);
  };

  const handleCandidateSelect = (event) => {
    const candidateId = event.target.value;
    
    if (event.target.checked) {
      // Add to selected candidates if checked
      setSelectedCandidates([...selectedCandidates, candidateId]);
    } else {
      // Remove from selected candidates if unchecked
      setSelectedCandidates(selectedCandidates.filter(id => id !== candidateId));
    }
  };

  const handleVoteSubmit = () => {
    if (selectedCandidates.length === 0) {
      setSnackbar({
        open: true,
        message: 'Vui lòng chọn ít nhất một ứng cử viên.'
      });
      return;
    }

    try {
      // Get voter CCCD
      const voterCCCD = localStorage.getItem('voterCCCD');
      if (!voterCCCD) {
        setSnackbar({
          open: true,
          message: 'Không tìm thấy thông tin cử tri.'
        });
        return;
      }

      // Clone current votes object to avoid direct state mutation
      const newVotes = { ...(votes || {}) };
      
      // Increment vote count for each selected candidate
      selectedCandidates.forEach(candidateId => {
        if (!candidateId) return;
        newVotes[candidateId] = (newVotes[candidateId] || 0) + 1;
      });

      // Save updated votes to localStorage
      localStorage.setItem(`votes_${id}`, JSON.stringify(newVotes));
      
      // Update votes state
      setVotes(newVotes);
      
      // Mark this voter as having voted in this election
      const voterVotedKey = `voter_${voterCCCD}_voted`;
      const votedElections = JSON.parse(localStorage.getItem(voterVotedKey) || '[]');
      if (!votedElections.includes(id)) {
        votedElections.push(id);
        localStorage.setItem(voterVotedKey, JSON.stringify(votedElections));
      }
      
      // Show success message and close dialog
      setSnackbar({
        open: true,
        message: 'Bỏ phiếu thành công!'
      });
      setOpenVoteDialog(false);
      setSelectedCandidates([]);
      
      console.log("Vote submitted successfully. Updated votes:", newVotes);
    } catch (error) {
      console.error('Error submitting vote:', error);
      setSnackbar({
        open: true,
        message: 'Đã xảy ra lỗi khi bỏ phiếu.'
      });
    }
  };

  const handleLoginRedirect = () => {
    navigate('/login');
  };

  const handleSnackbarClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbar({ ...snackbar, open: false });
  };

  const getTotalVotes = () => {
    if (!votes || Object.keys(votes).length === 0) return 0;
    
    // Sử dụng reduce với kiểm tra để tránh lỗi với giá trị không hợp lệ
    return Object.values(votes).reduce((sum, count) => {
      // Đảm bảo count là số hợp lệ
      const validCount = Number.isInteger(count) && count >= 0 ? count : 0;
      return sum + validCount;
    }, 0);
  };

  const getVotePercentage = (candidateId) => {
    const totalVotes = getTotalVotes();
    
    // Xử lý các trường hợp đặc biệt
    if (totalVotes === 0) return 0;
    if (typeof candidateId === 'undefined' || candidateId === null) return 0;
    
    // Đảm bảo candidateId có trong votes và là số hợp lệ
    const candidateVotes = votes[candidateId];
    if (typeof candidateVotes === 'undefined' || candidateVotes === null) return 0;
    
    // Tính phần trăm và làm tròn đến 1 số thập phân
    const percentage = (candidateVotes / totalVotes) * 100;
    return Math.round(percentage * 10) / 10; // Làm tròn đến 1 số thập phân
  };

  // Hàm mới để xác định người thắng cuộc
  const getWinners = () => {
    if (!votes || Object.keys(votes).length === 0) return [];
    
    // Tìm số phiếu cao nhất
    const maxVotes = Math.max(...Object.values(votes));
    if (maxVotes === 0) return []; // Không có ai được bầu
    
    // Tìm tất cả ứng cử viên có số phiếu cao nhất (có thể có trường hợp hòa)
    return Object.keys(votes).filter(candidateId => votes[candidateId] === maxVotes);
  };

  // Kiểm tra xem một ứng cử viên có phải là người thắng cuộc không
  const isWinner = (candidateId) => {
    if (!shouldShowResults()) return false;
    return getWinners().includes(candidateId);
  };

  const canVote = () => {
    if (!election) return false;
    
    const status = getElectionStatus(election);
    if (status !== 'active') return false;
    
    const isVoter = localStorage.getItem('isVoter') === 'true';
    const voterCCCD = localStorage.getItem('voterCCCD');
    
    if (!isVoter || !voterCCCD) return false; // Nếu chưa đăng nhập thì không thể bỏ phiếu
    
    // Kiểm tra xem cử tri này đã bỏ phiếu cho cuộc bầu cử này chưa
    const voterVotedKey = `voter_${voterCCCD}_voted`;
    const voterVotedElections = JSON.parse(localStorage.getItem(voterVotedKey) || '[]');
    
    return !voterVotedElections.includes(id);
  };

  // Hàm kiểm tra xem có thể hiển thị nút xem kết quả không - không dùng nữa vì nút đã được đưa lên màn hình chính
  const canShowResultsButton = () => {
    if (!election) return false;
    
    // Chỉ cho phép xem kết quả nếu cuộc bầu cử đã kết thúc
    const status = getElectionStatus(election);
    return status === 'completed';
  };

  // Kết quả bầu cử chỉ được hiển thị khi ĐỒNG THỜI:
  // 1. Cuộc bầu cử kết thúc 
  // 2. Người dùng đã bấm nút "Xem kết quả" (showResults = true)
  const shouldShowResults = () => {
    if (!election) return false;
    if (!showResults) return false; // Chỉ hiển thị khi showResults = true
    
    // Chỉ hiển thị kết quả khi cuộc bầu cử đã kết thúc
    const status = getElectionStatus(election);
    return status === 'completed';
  };

  // Thêm hàm kiểm tra giá trị số phiếu
  const getValidVoteCount = (candidateId) => {
    if (!votes || !candidateId || !(candidateId in votes)) return 0;
    const count = votes[candidateId];
    return Number.isInteger(count) && count >= 0 ? count : 0;
  };

  // Sửa lại hàm tạo dữ liệu mẫu
  const createSampleVoteData = () => {
    try {
      console.log("Checking if sample vote data needs to be created for election:", id);
      
      // Kiểm tra xem cuộc bầu cử đã kết thúc chưa
      const status = getElectionStatus(election);
      if (status !== 'completed') {
        console.log("Not creating sample votes for non-completed election");
        return;
      }
      
      // Kiểm tra xem đã có dữ liệu votes trong localStorage chưa
      const existingVotes = localStorage.getItem(`votes_${id}`);
      if (existingVotes) {
        console.log("Sample vote data already exists:", JSON.parse(existingVotes));
        setVotes(JSON.parse(existingVotes));
        return; // Không tạo lại nếu đã có
      }
      
      const storedCandidates = localStorage.getItem('candidates');
      if (storedCandidates) {
        const allCandidates = JSON.parse(storedCandidates);
        const electionCandidates = allCandidates.filter(c => c.electionId === id);
        
        // Tạo dữ liệu bầu cử mẫu
        if (electionCandidates.length > 0) {
          let sampleVotes = {};
          const totalVoters = Math.floor(Math.random() * 50) + 20; // Từ 20-70 cử tri
          let remainingVoters = totalVoters;
          
          // Gán số phiếu cho các ứng cử viên, đảm bảo tổng số phiếu bằng tổng số cử tri
          for (let i = 0; i < electionCandidates.length; i++) {
            const candidate = electionCandidates[i];
            if (!candidate || !candidate.id) continue;
            
            // Ứng cử viên cuối cùng nhận số phiếu còn lại
            if (i === electionCandidates.length - 1) {
              sampleVotes[candidate.id] = remainingVoters;
            } else {
              // Phân phối ngẫu nhiên nhưng hợp lý
              const maxVotes = Math.min(remainingVoters, Math.floor(totalVoters / 2));
              const votes = Math.floor(Math.random() * maxVotes);
              sampleVotes[candidate.id] = votes;
              remainingVoters -= votes;
            }
          }
          
          // Trường hợp có 1 ứng cử viên
          if (electionCandidates.length === 1 && electionCandidates[0] && electionCandidates[0].id) {
            sampleVotes[electionCandidates[0].id] = totalVoters;
          }
          
          setVotes(sampleVotes);
          localStorage.setItem(`votes_${id}`, JSON.stringify(sampleVotes));
          
          // Đánh dấu là đã hiển thị kết quả
          setShowResults(true);
          
          console.log("Created and stored sample vote data:", sampleVotes, "Total voters:", totalVoters);
        }
      }
    } catch (error) {
      console.error('Error creating sample vote data:', error);
    }
  };

  // Sửa lại hàm hiển thị thông tin phiếu bầu để tránh re-render không cần thiết
  const renderVoteResults = (candidate) => {
    if (!candidate || !candidate.id) {
      console.error("Invalid candidate data:", candidate);
      return null;
    }
    
    const voteCount = getValidVoteCount(candidate.id);
    const percentage = getVotePercentage(candidate.id);
    const total = getTotalVotes();
    const winner = isWinner(candidate.id);
    
    return (
      <Box sx={{ mt: 2, p: 1, bgcolor: 'rgba(0,0,0,0.03)', borderRadius: 1 }}>
        {winner && (
          <Chip 
            label="Trúng cử" 
            color="success" 
            size="small" 
            sx={{ mb: 1, fontWeight: 'bold' }} 
          />
        )}
        <Typography variant="body1" sx={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold' }}>
          <span>Số phiếu:</span>
          <span>{voteCount}</span>
        </Typography>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
          <Typography variant="body2" color="text.secondary">
            Tỷ lệ:
          </Typography>
          <Typography variant="body2" fontWeight="bold" color={winner ? 'success.main' : 'primary.main'}>
            {percentage}%
          </Typography>
        </Box>
        <Box 
          sx={{ 
            mt: 1, 
            width: '100%', 
            height: '12px', 
            bgcolor: 'grey.200', 
            borderRadius: '4px', 
            overflow: 'hidden' 
          }}
        >
          <Box 
            sx={{ 
              width: `${percentage}%`, 
              height: '100%', 
              bgcolor: winner ? 'success.main' : 'primary.main'
            }} 
          />
        </Box>
        <Typography variant="caption" sx={{ mt: 1, display: 'block', textAlign: 'center' }}>
          {voteCount} phiếu / {total} tổng số phiếu
        </Typography>
      </Box>
    );
  };

  // Hàm tạo ứng cử viên mẫu
  const createSampleCandidates = () => {
    // Chỉ tạo mẫu cho cuộc bầu cử hiện tại
    if (!election) return;

    const sampleCandidates = [
      {
        id: Date.now() + '-1',
        name: 'Nguyễn Văn A',
        birthDate: '1980-05-15',
        hometown: 'Hà Nội',
        position: 'Kỹ sư Công nghệ thông tin',
        description: 'Ứng cử viên có nhiều năm kinh nghiệm trong lĩnh vực công nghệ thông tin và quản lý dự án.',
        achievements: 'Phát triển nhiều dự án lớn, giải thưởng Sáng tạo Khoa học Công nghệ Việt Nam 2019',
        motto: 'Sáng tạo vì cộng đồng',
        imageUrl: 'https://i.imgur.com/8VUQSgK.jpg',
        electionId: id
      },
      {
        id: Date.now() + '-2',
        name: 'Trần Thị B',
        birthDate: '1985-11-20',
        hometown: 'TP. Hồ Chí Minh',
        position: 'Giảng viên Đại học',
        description: 'Ứng cử viên hiện đang là giảng viên Đại học với nhiều công trình nghiên cứu khoa học nổi bật.',
        achievements: 'Tiến sĩ tại Đại học Oxford, có 15 công trình nghiên cứu đăng trên tạp chí quốc tế',
        motto: 'Giáo dục là chìa khóa thành công',
        imageUrl: 'https://i.imgur.com/qMSXTCg.jpg',
        electionId: id
      },
      {
        id: Date.now() + '-3',
        name: 'Lê Văn C',
        birthDate: '1975-08-10',
        hometown: 'Đà Nẵng',
        position: 'Doanh nhân',
        description: 'Ứng cử viên là một doanh nhân thành đạt với nhiều đóng góp cho cộng đồng.',
        achievements: 'Sáng lập 3 công ty thành công, tạo việc làm cho hơn 500 lao động',
        motto: 'Kinh doanh gắn liền với trách nhiệm xã hội',
        imageUrl: 'https://i.imgur.com/2Wki6HO.jpg',
        electionId: id
      }
    ];

    // Thêm các ứng cử viên mẫu vào localStorage
    const storedCandidates = JSON.parse(localStorage.getItem('candidates') || '[]');
    const updatedCandidates = [...storedCandidates, ...sampleCandidates];
    localStorage.setItem('candidates', JSON.stringify(updatedCandidates));
    
    // Cập nhật state
    setCandidates(sampleCandidates);
    console.log("Sample candidates created:", sampleCandidates);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Button variant="contained" onClick={() => navigate('/elections')}>
          Quay lại danh sách bầu cử
        </Button>
      </Container>
    );
  }

  if (!election) {
    return (
      <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="h5" gutterBottom>
            Không tìm thấy cuộc bầu cử
          </Typography>
          <Button variant="contained" onClick={() => navigate('/elections')}>
            Quay lại danh sách bầu cử
          </Button>
        </Paper>
      </Container>
    );
  }

  const status = getElectionStatus(election);
  const isActive = status === 'active';
  const isCompleted = status === 'completed';

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Button variant="outlined" onClick={() => navigate('/elections')} sx={{ mb: 0 }}>
          &larr; Quay lại danh sách bầu cử
        </Button>
      </Box>
      
      <Paper sx={{ p: 3, mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            {election.title}
          </Typography>
          <Chip
            label={getStatusText(status)}
            color={getStatusColor(status)}
            sx={{ fontWeight: 'bold' }}
          />
        </Box>
        
        <Grid container spacing={4}>
          <Grid item xs={12} md={4}>
            <Box sx={{ mb: 3 }}>
              <img 
                src={election.logoUrl || defaultElectionImage} 
                alt={election.title}
                style={{ 
                  width: '100%', 
                  borderRadius: '8px',
                  maxHeight: '300px',
                  objectFit: 'contain'
                }} 
              />
            </Box>
            
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Thông tin cuộc bầu cử
                </Typography>
                <Divider sx={{ mb: 2 }} />
                
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
                      secondary={candidates.length} 
                    />
                  </ListItem>
                  {isActive && (
                    <ListItem>
                      <ListItemText 
                        primary={<Typography variant="body1" color="primary" fontWeight="bold">{getRemainingTime(election.endTime)}</Typography>}
                      />
                    </ListItem>
                  )}
                </List>
              </CardContent>
            </Card>
            
            {isActive && canVote() && (
              <Button
                variant="contained"
                color="primary"
                fullWidth
                size="large"
                startIcon={<HowToVoteIcon />}
                onClick={handleVoteClick}
                sx={{ mb: 2 }}
              >
                Bầu cử ngay
              </Button>
            )}
            
            {isActive && !canVote() && (
              <Alert severity="info" sx={{ mb: 2 }}>
                Bạn đã bỏ phiếu cho cuộc bầu cử này
              </Alert>
            )}
            
            {isCompleted && (
              <Alert severity="info" sx={{ mb: 2 }}>
                Cuộc bầu cử đã kết thúc vào {formatDate(election.endTime)}
              </Alert>
            )}
          </Grid>
          
          <Grid item xs={12} md={8}>
            <Typography variant="h5" gutterBottom>
              Mô tả
            </Typography>
            <Typography variant="body1" paragraph>
              {election.description || 'Không có mô tả cho cuộc bầu cử này.'}
            </Typography>
            
            <Divider sx={{ my: 3 }} />
            
            <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h5" gutterBottom>
                Danh sách ứng cử viên {shouldShowResults() && '& Kết quả'}
              </Typography>
              {shouldShowResults() && (
                <Box sx={{ textAlign: 'right' }}>
                  <Typography variant="subtitle1" fontWeight="bold">
                    Tổng số phiếu: {getTotalVotes()}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Số người trúng cử: {getWinners().length}
                  </Typography>
                </Box>
              )}
            </Box>
            
            {candidates.length === 0 ? (
              <Paper sx={{ p: 3, textAlign: 'center' }}>
                <Typography variant="body1">
                  Chưa có ứng cử viên nào cho cuộc bầu cử này
                </Typography>
              </Paper>
            ) : (
              <Grid container spacing={3}>
                {candidates.map((candidate) => (
                  <Grid item xs={12} sm={6} key={candidate.id}>
                    <Card sx={{ 
                      height: '100%', 
                      display: 'flex', 
                      flexDirection: 'column',
                      transition: 'transform 0.2s, box-shadow 0.2s',
                      '&:hover': {
                        transform: 'translateY(-3px)',
                        boxShadow: 3
                      }
                    }}>
                      {candidate.imageUrl && (
                        <CardMedia
                          component="img"
                          height="200"
                          image={candidate.imageUrl}
                          alt={candidate.name}
                        />
                      )}
                      <CardContent sx={{ flexGrow: 1 }}>
                        <Typography variant="h6" gutterBottom>
                          {candidate.name}
                        </Typography>
                        {candidate.position && (
                          <Typography variant="subtitle1" color="text.secondary" gutterBottom>
                            {candidate.position}
                          </Typography>
                        )}
                        
                        <Divider sx={{ my: 1 }} />
                        
                        <Typography variant="body2">
                          <strong>Năm sinh:</strong> {candidate.birthDate ? new Date(candidate.birthDate).getFullYear() : 'Không có thông tin'}
                        </Typography>
                        {candidate.hometown && (
                          <Typography variant="body2">
                            <strong>Quê quán:</strong> {candidate.hometown}
                          </Typography>
                        )}
                        {candidate.description && (
                          <Typography variant="body2" sx={{ mt: 1 }}>
                            <strong>Mô tả:</strong> {candidate.description}
                          </Typography>
                        )}
                        {candidate.achievements && (
                          <Typography variant="body2" sx={{ mt: 1 }}>
                            <strong>Thành tích:</strong> {candidate.achievements}
                          </Typography>
                        )}
                        {candidate.motto && (
                          <Typography variant="body2" sx={{ mt: 1, fontStyle: 'italic', color: 'primary.main' }}>
                            "{candidate.motto}"
                          </Typography>
                        )}
                        
                        {shouldShowResults() && renderVoteResults(candidate)}
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            )}
          </Grid>
        </Grid>
      </Paper>
      
      {/* Dialog bỏ phiếu */}
      <Dialog
        open={openVoteDialog}
        onClose={() => setOpenVoteDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Bỏ phiếu cho ứng cử viên</DialogTitle>
        <DialogContent dividers>
          <Alert severity="info" sx={{ mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <InfoIcon sx={{ mr: 1 }} />
              <Typography variant="body2">
                Bạn có thể chọn nhiều ứng cử viên. Sau khi bỏ phiếu, bạn sẽ không thể thay đổi lựa chọn của mình.
              </Typography>
            </Box>
          </Alert>
          
          <FormControl component="fieldset" sx={{ width: '100%' }}>
            <FormLabel component="legend">Chọn một hoặc nhiều ứng cử viên:</FormLabel>
            <Typography variant="body2" color="primary" sx={{ mt: 1, mb: 2 }}>
              Đã chọn: {selectedCandidates.length} ứng cử viên
            </Typography>
            <Box>
              {candidates.map((candidate) => (
                <FormControlLabel
                  key={candidate.id}
                  control={
                    <Checkbox 
                      checked={selectedCandidates.includes(candidate.id)}
                      onChange={handleCandidateSelect}
                      value={candidate.id}
                    />
                  }
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      {candidate.imageUrl && (
                        <Avatar 
                          src={candidate.imageUrl} 
                          alt={candidate.name} 
                          sx={{ mr: 2, width: 40, height: 40 }}
                        />
                      )}
                      <Box>
                        <Typography variant="body1">{candidate.name}</Typography>
                        {candidate.position && (
                          <Typography variant="body2" color="text.secondary">{candidate.position}</Typography>
                        )}
                      </Box>
                    </Box>
                  }
                  sx={{ mb: 1, display: 'flex', alignItems: 'flex-start' }}
                />
              ))}
            </Box>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenVoteDialog(false)}>Hủy</Button>
          <Button
            variant="contained"
            color="primary"
            onClick={handleVoteSubmit}
            disabled={selectedCandidates.length === 0}
          >
            Bỏ phiếu
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Dialog đăng nhập */}
      <Dialog
        open={openLoginDialog}
        onClose={() => setOpenLoginDialog(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Đăng nhập để bỏ phiếu</DialogTitle>
        <DialogContent>
          <Typography variant="body1" paragraph>
            Bạn cần đăng nhập hoặc đăng ký tài khoản cử tri để bỏ phiếu.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenLoginDialog(false)}>Hủy</Button>
          <Button
            variant="contained"
            color="primary"
            onClick={handleLoginRedirect}
          >
            Đăng nhập
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Snackbar thông báo */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        message={snackbar.message}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        action={
          <IconButton
            size="small"
            color="inherit"
            onClick={handleSnackbarClose}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        }
      />
    </Container>
  );
}

export default ElectionDetail; 