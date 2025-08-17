import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  CircularProgress,
  Divider,
  Alert,
  Card,
  CardContent,
  Grid,
  Chip,
  Stack,
  IconButton,
  Container,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar
} from '@mui/material';
import { useContract } from '../hooks/useContract';
import { formatDate } from '../utils/helpers';
import EqualizerIcon from '@mui/icons-material/Equalizer';
import PieChartIcon from '@mui/icons-material/PieChart';
import PersonIcon from '@mui/icons-material/Person';
import HowToVoteIcon from '@mui/icons-material/HowToVote';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import BarChartIcon from '@mui/icons-material/BarChart';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';

// Đăng ký các thành phần chart
ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

const ElectionResultsReport = ({ electionId, onBack }) => {
  const { getCandidates, getElectionResult, getElections, getCandidateVotes } = useContract();
  const [election, setElection] = useState(null);
  const [candidates, setCandidates] = useState([]);
  const [voteData, setVoteData] = useState({});
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [chartType, setChartType] = useState('pie'); // 'pie' hoặc 'bar'
  const [results, setResults] = useState([]);

  // Tạo dữ liệu ngẫu nhiên để hiển thị nếu không có kết nối blockchain
  const generateMockData = (candidateList, totalVotes) => {
    if (!candidateList || candidateList.length === 0) return null;
    
    // Tạo số phiếu ngẫu nhiên tổng bằng totalVotes
    let votes = Array(candidateList.length).fill(0);
    let remainingVotes = totalVotes || 100;
    
    for (let i = 0; i < votes.length - 1; i++) {
      // Mỗi ứng viên được 1-50% số phiếu còn lại
      const voteShare = Math.floor(Math.random() * 0.5 * remainingVotes) + 1;
      votes[i] = voteShare;
      remainingVotes -= voteShare;
    }
    
    // Ứng viên cuối cùng nhận số phiếu còn lại
    votes[votes.length - 1] = remainingVotes;
    
    // Xác định người thắng (số phiếu cao nhất)
    const maxVotes = Math.max(...votes);
    const winnerIndex = votes.indexOf(maxVotes);
    
    return {
      voteData: candidateList.map((candidate, index) => ({
        candidateId: index,
        voteCount: votes[index]
      })),
      resultData: {
        totalVotes: totalVotes || 100,
        totalVoters: Math.floor(totalVotes * 1.2) || 120, // Thêm 20% là cử tri không bỏ phiếu
        winningCandidateId: winnerIndex,
        winningVoteCount: maxVotes
      }
    };
  };

  useEffect(() => {
    const loadElectionData = () => {
      try {
        setLoading(true);
        
        // Lấy thông tin cuộc bầu cử
        const storedElections = JSON.parse(localStorage.getItem('elections') || '[]');
        const currentElection = storedElections.find(e => e.id.toString() === electionId.toString());
        
        if (!currentElection) {
          setError('Không tìm thấy thông tin cuộc bầu cử');
          setLoading(false);
          return;
        }
        
        setElection(currentElection);
        
        // Lấy danh sách ứng cử viên thuộc cuộc bầu cử
        const storedCandidates = JSON.parse(localStorage.getItem('candidates') || '[]');
        const electionCandidates = storedCandidates.filter(
          c => c.electionId && c.electionId.toString() === electionId.toString()
        );
        
        if (electionCandidates.length === 0) {
          setError('Cuộc bầu cử này chưa có ứng cử viên');
          setCandidates([]);
          setLoading(false);
          return;
        }
        
        setCandidates(electionCandidates);
        
        // Lấy dữ liệu phiếu bầu từ local storage
        const storedVotes = localStorage.getItem(`votes_${electionId}`);
        if (!storedVotes) {
          console.log("No votes found for election", electionId);
          setVoteData({});
        } else {
          console.log("Found votes for election", electionId, JSON.parse(storedVotes));
          setVoteData(JSON.parse(storedVotes));
        }
        
        // Tính toán kết quả
        calculateResults(electionCandidates, JSON.parse(storedVotes || '{}'));
        
        setLoading(false);
      } catch (error) {
        console.error('Error loading election results:', error);
        setError('Đã xảy ra lỗi khi tải kết quả bầu cử');
        setLoading(false);
      }
    };
    
    loadElectionData();
  }, [electionId]);

  // Tính toán kết quả bầu cử
  const calculateResults = (candidatesList, votes) => {
    if (!candidatesList || candidatesList.length === 0 || !votes) {
      setResults([]);
      return;
    }
    
    const resultsArray = [];
    let totalVotes = 0;
    
    // Tính tổng số phiếu
    Object.values(votes).forEach(count => {
      totalVotes += count;
    });
    
    // Tính kết quả cho mỗi ứng cử viên
    candidatesList.forEach(candidate => {
      const voteCount = votes[candidate.id] || 0;
      const percentage = totalVotes > 0 ? (voteCount / totalVotes) * 100 : 0;
      
      resultsArray.push({
        candidate: candidate,
        votes: voteCount,
        percentage: percentage
      });
    });
    
    // Sắp xếp theo số phiếu giảm dần
    resultsArray.sort((a, b) => b.votes - a.votes);
    
    setResults(resultsArray);
  };

  // Chuẩn bị dữ liệu cho biểu đồ
  const prepareChartData = () => {
    if (!candidates || candidates.length === 0 || !voteData) return null;

    const candidateNames = candidates.map(c => c.name || `Ứng cử viên ${c.id}`);
    const voteCounts = candidates.map(c => voteData[c.id] || 0);
    
    // Tạo màu sắc ngẫu nhiên cho các phần
    const generateRandomColors = (count) => {
      const colors = [];
      for (let i = 0; i < count; i++) {
        const r = Math.floor(Math.random() * 200);
        const g = Math.floor(Math.random() * 200);
        const b = Math.floor(Math.random() * 200);
        colors.push(`rgba(${r}, ${g}, ${b}, 0.8)`);
      }
      return colors;
    };
    
    const backgroundColors = generateRandomColors(candidates.length);
    
    return {
      labels: candidateNames,
      datasets: [
        {
          label: 'Số phiếu bầu',
          data: voteCounts,
          backgroundColor: backgroundColors,
          borderColor: backgroundColors.map(color => color.replace('0.8', '1')),
          borderWidth: 1,
        },
      ],
    };
  };

  const chartData = prepareChartData();

  // Xác định ứng cử viên thắng cử
  const getWinner = () => {
    if (results.length === 0) return null;
    return results[0].candidate;
  };

  const winningCandidate = getWinner();

  // Dữ liệu cho biểu đồ
  const getPieChartData = () => {
    if (!results || results.length === 0) return [];
    
    return results.map(result => ({
      id: result.candidate.id,
      value: result.votes,
      label: result.candidate.name,
    }));
  };

  // Hiển thị màu sắc cho biểu đồ
  const getChartColors = () => {
    const colors = ['#2196f3', '#f44336', '#4caf50', '#ff9800', '#9c27b0', '#607d8b', '#e91e63', '#673ab7'];
    return results.map((_, index) => colors[index % colors.length]);
  };

  // Tính tổng số phiếu
  const getTotalVotes = () => {
    if (!voteData || Object.keys(voteData).length === 0) return 0;
    return Object.values(voteData).reduce((sum, count) => sum + count, 0);
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
      <Box>
        <Button startIcon={<ArrowBackIcon />} onClick={onBack} sx={{ mb: 2 }}>
          Quay lại
        </Button>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  // Hiển thị biểu đồ tròn bằng Chart.js
  const renderPieChart = () => {
    if (!chartData) return null;
    
    return (
      <Box height={300} display="flex" justifyContent="center" alignItems="center">
        <Pie 
          data={chartData}
          options={{
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                position: 'right',
                labels: {
                  boxWidth: 15,
                  font: {
                    size: 11
                  }
                }
              }
            }
          }}
        />
      </Box>
    );
  };

  return (
    <Container>
      <Box mb={4}>
        <Stack direction="row" alignItems="center" spacing={2} mb={2}>
          <IconButton onClick={onBack} edge="start">
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h5" component="h1">
            Kết quả bầu cử: {election?.title}
          </Typography>
        </Stack>
        
        <Divider sx={{ mb: 2 }} />
        
        <Grid container spacing={3} mb={4}>
          <Grid item xs={12} md={4}>
            <Card variant="outlined">
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={2}>
                  <PeopleAltIcon color="primary" fontSize="large" />
                  <Box>
                    <Typography variant="h6" gutterBottom>Tổng số ứng cử viên</Typography>
                    <Typography variant="h4">{candidates.length}</Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Card variant="outlined">
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={2}>
                  <HowToVoteIcon color="secondary" fontSize="large" />
                  <Box>
                    <Typography variant="h6" gutterBottom>Tổng số phiếu bầu</Typography>
                    <Typography variant="h4">{getTotalVotes()}</Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Card variant="outlined">
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={2}>
                  <BarChartIcon color="success" fontSize="large" />
                  <Box>
                    <Typography variant="h6" gutterBottom>Tỷ lệ tham gia</Typography>
                    <Typography variant="h4">
                      {/* Mô phỏng tỷ lệ với một số lượng cử tri giả */}
                      {`${Math.round((getTotalVotes() / Math.max(100, getTotalVotes() * 1.5)) * 100)}%`}
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
        
        {results.length > 0 ? (
          <Grid container spacing={4}>
            <Grid item xs={12} md={5}>
              <Typography variant="h6" gutterBottom>Biểu đồ kết quả</Typography>
              <Paper 
                elevation={0} 
                sx={{ 
                  p: 2, 
                  height: 350, 
                  display: 'flex', 
                  justifyContent: 'center', 
                  alignItems: 'center',
                  border: '1px solid #e0e0e0'
                }}
              >
                {renderPieChart()}
              </Paper>
            </Grid>
            
            <Grid item xs={12} md={7}>
              <Typography variant="h6" gutterBottom>Bảng kết quả chi tiết</Typography>
              <Paper elevation={0} sx={{ border: '1px solid #e0e0e0' }}>
                <List>
                  {results.map((result, index) => (
                    <React.Fragment key={result.candidate.id}>
                      {index > 0 && <Divider />}
                      <ListItem 
                        sx={{ 
                          bgcolor: index === 0 ? 'rgba(76, 175, 80, 0.1)' : 'transparent',
                          py: 2
                        }}
                      >
                        <ListItemAvatar>
                          <Avatar 
                            src={result.candidate.imageUrl || undefined}
                            sx={{ 
                              bgcolor: index === 0 ? 'success.main' : 'primary.main',
                            }}
                          >
                            {index === 0 ? '1' : <PersonIcon />}
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText 
                          primary={
                            <Typography variant="subtitle1" fontWeight={index === 0 ? 'bold' : 'normal'}>
                              {result.candidate.name}
                            </Typography>
                          }
                          secondary={
                            <Box mt={1}>
                              <Typography variant="body2" color="text.secondary">
                                {result.candidate.position || 'Không có chức vụ'}
                              </Typography>
                              <Box 
                                mt={1} 
                                display="flex" 
                                alignItems="center" 
                                justifyContent="space-between"
                              >
                                <Typography variant="body2">
                                  <strong>{result.votes}</strong> phiếu bầu
                                </Typography>
                                <Typography 
                                  variant="body2" 
                                  fontWeight="bold" 
                                  color={index === 0 ? 'success.main' : 'primary.main'}
                                >
                                  {result.percentage.toFixed(1)}%
                                </Typography>
                              </Box>
                              <Box 
                                mt={1} 
                                width="100%" 
                                height={6}
                                bgcolor="grey.200"
                                borderRadius={3}
                              >
                                <Box 
                                  width={`${result.percentage}%`} 
                                  height="100%"
                                  bgcolor={index === 0 ? 'success.main' : 'primary.main'}
                                  borderRadius={3}
                                />
                              </Box>
                            </Box>
                          }
                        />
                      </ListItem>
                    </React.Fragment>
                  ))}
                </List>
              </Paper>
            </Grid>
          </Grid>
        ) : (
          <Alert severity="info">
            Chưa có dữ liệu kết quả bầu cử. Có thể cuộc bầu cử chưa kết thúc hoặc chưa có phiếu bầu nào.
          </Alert>
        )}
      </Box>
    </Container>
  );
};

export default ElectionResultsReport; 