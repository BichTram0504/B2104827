import React, { useState, useEffect } from 'react';
import { 
  Container, Typography, Box, Grid, Paper, 
  Button, CircularProgress, Divider, Alert,
  List, ListItem, ListItemText, ListItemAvatar, 
  Avatar, Card, CardContent, CardHeader, 
  IconButton
} from '@mui/material';
import { 
  BarChart, PieChart
} from '@mui/x-charts';
import { useParams, useNavigate } from 'react-router-dom';
import { formatDate } from '../utils/helpers';
import { getElectionStatus } from '../utils/electionHelpers';
import { ArrowBack as ArrowBackIcon, Person as PersonIcon, EmojiEvents as EmojiEventsIcon } from '@mui/icons-material';

function ElectionResultsReport() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [election, setElection] = useState(null);
  const [candidates, setCandidates] = useState([]);
  const [votes, setVotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [results, setResults] = useState({
    votesByCandidate: [],
    totalVotes: 0,
    participationRate: 0,
    winner: null,
  });

  useEffect(() => {
    const fetchData = () => {
      try {
        // Lấy dữ liệu từ localStorage
        const storedElections = JSON.parse(localStorage.getItem('elections')) || [];
        const storedCandidates = JSON.parse(localStorage.getItem('candidates')) || [];
        const storedVotes = JSON.parse(localStorage.getItem('votes')) || [];
        const storedVoters = JSON.parse(localStorage.getItem('voters')) || [];

        // Tìm cuộc bầu cử với id tương ứng
        const foundElection = storedElections.find(e => e.id.toString() === id);
        
        if (!foundElection) {
          setError('Không tìm thấy cuộc bầu cử');
          setLoading(false);
          return;
        }

        // Lọc danh sách ứng cử viên tham gia cuộc bầu cử này
        const electionCandidates = storedCandidates.filter(
          candidate => candidate.electionId === foundElection.id
        );

        // Lọc các phiếu bầu cho cuộc bầu cử này
        const electionVotes = storedVotes.filter(
          vote => vote.electionId === foundElection.id
        );

        // Tính toán kết quả
        const voteCount = {};
        electionCandidates.forEach(candidate => {
          voteCount[candidate.id] = 0;
        });

        electionVotes.forEach(vote => {
          if (voteCount[vote.candidateId] !== undefined) {
            voteCount[vote.candidateId]++;
          }
        });

        // Tạo mảng kết quả và sắp xếp theo số phiếu giảm dần
        const votesByCandidate = electionCandidates.map(candidate => ({
          candidate: candidate,
          votes: voteCount[candidate.id] || 0
        })).sort((a, b) => b.votes - a.votes);

        const totalVotes = electionVotes.length;
        const totalVoters = storedVoters.length;
        const participationRate = totalVoters > 0 ? (totalVotes / totalVoters) * 100 : 0;
        
        // Xác định người chiến thắng (nếu có)
        let winner = null;
        if (votesByCandidate.length > 0 && votesByCandidate[0].votes > 0) {
          winner = votesByCandidate[0].candidate;
        }

        setElection(foundElection);
        setCandidates(electionCandidates);
        setVotes(electionVotes);
        setResults({
          votesByCandidate,
          totalVotes,
          participationRate,
          winner
        });
        
        setLoading(false);
      } catch (err) {
        console.error('Lỗi khi tải dữ liệu:', err);
        setError('Có lỗi xảy ra khi tải dữ liệu');
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleBack = () => {
    navigate(-1);
  };

  const renderCharts = () => {
    if (results.votesByCandidate.length === 0) {
      return (
        <Alert severity="info" sx={{ mt: 3 }}>
          Không có dữ liệu bầu cử để hiển thị biểu đồ.
        </Alert>
      );
    }

    // Data cho biểu đồ cột
    const barChartData = results.votesByCandidate.map(item => ({
      name: item.candidate.name,
      votes: item.votes
    }));

    // Data cho biểu đồ tròn
    const pieChartData = results.votesByCandidate.map(item => ({
      id: item.candidate.id,
      value: item.votes,
      label: item.candidate.name,
    }));

    return (
      <Grid container spacing={3} sx={{ mt: 1 }}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Biểu đồ phiếu bầu theo ứng cử viên
            </Typography>
            <Box sx={{ height: 300, width: '100%' }}>
              <BarChart
                series={[
                  {
                    data: barChartData.map(item => item.votes),
                    label: 'Số phiếu bầu',
                    color: '#2196f3'
                  }
                ]}
                xAxis={[{ 
                  data: barChartData.map(item => item.name),
                  scaleType: 'band' 
                }]}
                height={300}
              />
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Tỷ lệ phiếu bầu
            </Typography>
            <Box sx={{ height: 300, width: '100%', display: 'flex', justifyContent: 'center' }}>
              <PieChart
                series={[
                  {
                    data: pieChartData,
                    highlightScope: { faded: 'global', highlighted: 'item' },
                    faded: { innerRadius: 30, additionalRadius: -30, color: 'gray' },
                  }
                ]}
                height={300}
                margin={{ right: 120 }}
                slotProps={{
                  legend: {
                    direction: 'column',
                    position: { vertical: 'middle', horizontal: 'right' },
                    padding: 0,
                  },
                }}
              />
            </Box>
          </Paper>
        </Grid>
      </Grid>
    );
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (error || !election) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Button 
          startIcon={<ArrowBackIcon />} 
          onClick={handleBack}
          sx={{ mb: 3 }}
        >
          Quay lại
        </Button>
        <Alert severity="error">
          {error || 'Không tìm thấy dữ liệu cuộc bầu cử'}
        </Alert>
      </Container>
    );
  }

  // Kiểm tra trạng thái của cuộc bầu cử
  const status = getElectionStatus(election);
  const isCompleted = status === 'completed';

  if (!isCompleted) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Button 
          startIcon={<ArrowBackIcon />} 
          onClick={handleBack}
          sx={{ mb: 3 }}
        >
          Quay lại
        </Button>
        <Alert severity="warning">
          Cuộc bầu cử này chưa kết thúc. Kết quả sẽ được hiển thị sau khi cuộc bầu cử kết thúc.
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Button 
        startIcon={<ArrowBackIcon />} 
        onClick={handleBack}
        sx={{ mb: 3 }}
      >
        Quay lại
      </Button>

      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Kết quả bầu cử: {election.title}
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} md={8}>
            <Typography variant="body1" paragraph>
              <strong>Mô tả:</strong> {election.description || 'Không có mô tả'}
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Typography variant="body1">
                  <strong>Thời gian bắt đầu:</strong> {formatDate(election.startTime)}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body1">
                  <strong>Thời gian kết thúc:</strong> {formatDate(election.endTime)}
                </Typography>
              </Grid>
            </Grid>
          </Grid>
          <Grid item xs={12} md={4}>
            <Paper variant="outlined" sx={{ p: 2, bgcolor: 'action.hover' }}>
              <Typography variant="h6" gutterBottom>
                Tổng quan
              </Typography>
              <List dense>
                <ListItem>
                  <ListItemText 
                    primary="Tổng số phiếu bầu" 
                    secondary={results.totalVotes} 
                  />
                </ListItem>
                <ListItem>
                  <ListItemText 
                    primary="Tổng số ứng cử viên" 
                    secondary={candidates.length} 
                  />
                </ListItem>
                <ListItem>
                  <ListItemText 
                    primary="Tỷ lệ tham gia" 
                    secondary={`${results.participationRate.toFixed(1)}%`} 
                  />
                </ListItem>
              </List>
            </Paper>
          </Grid>
        </Grid>
      </Paper>

      {/* Hiển thị người thắng cử (nếu có) */}
      {results.winner && (
        <Card sx={{ mb: 4, bgcolor: '#f9fbe7' }}>
          <CardHeader
            title="Người Thắng Cuộc"
            avatar={
              <Avatar sx={{ bgcolor: '#4caf50' }}>
                <EmojiEventsIcon />
              </Avatar>
            }
          />
          <CardContent>
            <Grid container spacing={3} alignItems="center">
              <Grid item xs={12} sm={4} md={3}>
                <Box
                  component="img"
                  src={results.winner.imageUrl || '/candidate-placeholder.png'}
                  alt={results.winner.name}
                  sx={{
                    width: '100%',
                    borderRadius: 2,
                    mb: { xs: 2, sm: 0 },
                    maxHeight: 200,
                    objectFit: 'cover'
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={8} md={9}>
                <Typography variant="h5" gutterBottom>
                  {results.winner.name}
                </Typography>
                <Typography variant="subtitle1" gutterBottom>
                  {results.winner.position || 'Không có chức vụ'}
                </Typography>
                <Typography variant="body2" paragraph>
                  {results.winner.description || 'Không có mô tả'}
                </Typography>
                <Typography variant="h6" color="success.main">
                  Số phiếu bầu: {results.votesByCandidate[0].votes} 
                  {results.totalVotes > 0 && ` (${((results.votesByCandidate[0].votes / results.totalVotes) * 100).toFixed(1)}%)`}
                </Typography>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      )}

      {/* Biểu đồ kết quả */}
      <Typography variant="h5" gutterBottom>
        Biểu đồ kết quả
      </Typography>
      {renderCharts()}

      {/* Danh sách chi tiết kết quả */}
      <Typography variant="h5" sx={{ mt: 4, mb: 2 }}>
        Kết quả chi tiết
      </Typography>
      <Paper>
        <List>
          {results.votesByCandidate.map((item, index) => (
            <React.Fragment key={item.candidate.id}>
              <ListItem 
                secondaryAction={
                  <Typography variant="h6">
                    {item.votes} phiếu
                    {results.totalVotes > 0 && 
                      <Typography component="span" variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                        ({((item.votes / results.totalVotes) * 100).toFixed(1)}%)
                      </Typography>
                    }
                  </Typography>
                }
              >
                <ListItemAvatar>
                  <Avatar 
                    src={item.candidate.imageUrl} 
                    alt={item.candidate.name}
                    sx={{ 
                      width: 50, 
                      height: 50,
                      mr: 2,
                      bgcolor: index === 0 ? 'success.light' : 'grey.300'
                    }}
                  >
                    {!item.candidate.imageUrl && <PersonIcon />}
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={
                    <Typography variant="h6">
                      {index === 0 && results.winner && <EmojiEventsIcon sx={{ color: 'warning.main', mr: 1, verticalAlign: 'middle' }} />}
                      {item.candidate.name}
                    </Typography>
                  }
                  secondary={item.candidate.position || 'Không có chức vụ'}
                  primaryTypographyProps={{ 
                    fontWeight: index === 0 ? 'bold' : 'normal' 
                  }}
                />
              </ListItem>
              {index < results.votesByCandidate.length - 1 && <Divider variant="inset" component="li" />}
            </React.Fragment>
          ))}
        </List>
      </Paper>
    </Container>
  );
}

export default ElectionResultsReport; 