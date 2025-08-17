import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Paper,
  Button,
  TextField,
  FormControlLabel,
  Checkbox,
  Grid,
  IconButton,
  Divider,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  FormHelperText,
  CircularProgress,
  Alert,
  Stack,
  Avatar,
  ListItemAvatar,
  Chip,
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Card,
  CardContent,
  CardMedia,
  CardActions,
  Snackbar,
  ButtonGroup,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import HowToVoteIcon from '@mui/icons-material/HowToVote';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import AssessmentIcon from '@mui/icons-material/Assessment';
import DoneAllIcon from '@mui/icons-material/DoneAll';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LoadingButton } from '@mui/lab';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import ImageUpload from '../components/ImageUpload';
import ElectionResultsReport from '../components/ElectionResultsReport';
import { formatDate } from '../utils/helpers';
import { getElectionStatus, getStatusColor, getStatusText } from '../utils/electionHelpers';
import CloseIcon from '@mui/icons-material/Close';

function AdminDashboard() {
  const navigate = useNavigate();
  const [elections, setElections] = useState([]);
  const [candidates, setCandidates] = useState([]);
  const [voters, setVoters] = useState([]);
  const [openElectionDialog, setOpenElectionDialog] = useState(false);
  const [openCandidateDialog, setOpenCandidateDialog] = useState(false);
  const [selectedElection, setSelectedElection] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  const [electionFormData, setElectionFormData] = useState({
    title: '',
    description: '',
    startTime: null,
    endTime: null,
    logoUrl: '',
  });
  const [candidateFormData, setCandidateFormData] = useState({
    name: '',
    birthDate: null,
    hometown: '',
    position: '',
    achievements: '',
    motto: '',
    imageUrl: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [openEditCandidateDialog, setOpenEditCandidateDialog] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [admins, setAdmins] = useState([]);
  const [openAddAdminDialog, setOpenAddAdminDialog] = useState(false);
  const [adminFormData, setAdminFormData] = useState({
    name: '',
    cccd: '',
    email: '',
    password: ''
  });
  const [selectedElectionIdForResult, setSelectedElectionIdForResult] = useState(null);
  const [showElectionResults, setShowElectionResults] = useState(false);
  const [viewMode, setViewMode] = useState('elections'); // 'elections', 'candidates', 'results'
  const [filteredCandidates, setFilteredCandidates] = useState([]);
  const [selectedElectionForCandidates, setSelectedElectionForCandidates] = useState(null);
  const [openViewCandidateDialog, setOpenViewCandidateDialog] = useState(false);

  // Kiểm tra đăng nhập admin
  useEffect(() => {
    const checkAdminLogin = () => {
      const isAdmin = localStorage.getItem('isAdmin') === 'true';
      const adminCCCD = localStorage.getItem('adminCCCD');
      
      console.log("Admin status check:", { isAdmin, adminCCCD });
      
      if (!isAdmin || !adminCCCD) {
        console.log("Not authenticated as admin, redirecting...");
        navigate('/admin');
        return;
      }
      
      console.log("Admin authenticated successfully");
      
      // Tạo dữ liệu mẫu nếu chưa có
      createSampleData();
      
      // Tải danh sách admin
      loadAdmins();
    };
    
    checkAdminLogin();
  }, [navigate]);

  // Tạo dữ liệu mẫu nếu chưa có
  const createSampleData = () => {
    // Tạo danh sách bầu cử mẫu nếu chưa có
    if (!localStorage.getItem('elections')) {
      const sampleElections = [
        {
          id: '1',
          title: 'Bầu cử hội đồng nhân dân 2023',
          description: 'Cuộc bầu cử đại biểu hội đồng nhân dân các cấp nhiệm kỳ 2023-2028',
          startTime: new Date(2023, 6, 1),
          endTime: new Date(2023, 6, 15),
          logoUrl: '',
          status: 'completed'
        },
        {
          id: '2',
          title: 'Bầu cử trưởng thôn 2024',
          description: 'Cuộc bầu cử trưởng thôn, tổ trưởng tổ dân phố nhiệm kỳ 2024-2026',
          startTime: new Date(2024, 0, 15),
          endTime: new Date(2024, 1, 15),
          logoUrl: '',
          status: 'active'
        }
      ];
      localStorage.setItem('elections', JSON.stringify(sampleElections));
    }
    
    // Tạo danh sách ứng cử viên mẫu nếu chưa có
    if (!localStorage.getItem('candidates')) {
      const sampleCandidates = [
        {
          id: '1',
          name: 'Nguyễn Văn Đạt',
          birthDate: new Date(1980, 0, 15),
          hometown: 'Hà Nội',
          position: 'Đại biểu HĐND',
          achievements: 'Đã có 10 năm kinh nghiệm trong lĩnh vực hành chính công',
          motto: 'Vì nhân dân phục vụ',
          imageUrl: '',
          electionId: '1'
        },
        {
          id: '2',
          name: 'Trần Thị Linh',
          birthDate: new Date(1985, 5, 10),
          hometown: 'Hồ Chí Minh',
          position: 'Trưởng thôn',
          achievements: 'Tích cực tham gia các hoạt động cộng đồng, phát triển kinh tế địa phương',
          motto: 'Đoàn kết, xây dựng quê hương',
          imageUrl: '',
          electionId: '2'
        }
      ];
      localStorage.setItem('candidates', JSON.stringify(sampleCandidates));
    }
    
    // Tạo danh sách cử tri mẫu nếu chưa có
    if (!localStorage.getItem('voters')) {
      const sampleVoters = [
        {
          cccd: '123456789012',
          fullName: 'Lê Minh Huy',
          address: 'Số 1, Đường Lý Thường Kiệt, Hà Nội',
          birthDate: new Date(1990, 3, 20),
          password: 'password123'
        },
        {
          cccd: '234567890123',
          fullName: 'Phạm Thị Duy',
          address: 'Số 25, Đường Nguyễn Huệ, Hồ Chí Minh',
          birthDate: new Date(1988, 7, 15),
          password: 'password456'
        }
      ];
      localStorage.setItem('voters', JSON.stringify(sampleVoters));
    }
  };

  // Load data khi component mount
  useEffect(() => {
    loadElections();
    loadCandidates();
    loadVoters();
  }, []);

  // Cập nhật filteredCandidates khi candidates thay đổi
  useEffect(() => {
    console.log('useEffect: candidates changed, updating filteredCandidates');
    console.log('Current viewMode:', viewMode);
    console.log('selectedElectionForCandidates:', selectedElectionForCandidates);
    
    if (viewMode === 'candidates' && selectedElectionForCandidates) {
      console.log('Calling filterCandidatesByElection from useEffect');
      filterCandidatesByElection(selectedElectionForCandidates);
    }
  }, [candidates, viewMode, selectedElectionForCandidates]);

  // Hiển thị thông báo
  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const hideSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const loadElections = () => {
    try {
      setLoading(true);
      // Lấy danh sách bầu cử từ localStorage
      const storedElections = localStorage.getItem('elections');
      if (storedElections) {
        setElections(JSON.parse(storedElections));
      }
    } catch (error) {
      console.error('Error loading elections:', error);
      showSnackbar('Không thể tải danh sách bầu cử', 'error');
    } finally {
      setLoading(false);
    }
  };

  const loadCandidates = () => {
    console.log('Loading candidates from localStorage');
    try {
      const storedCandidatesStr = localStorage.getItem('candidates');
      if (storedCandidatesStr) {
        try {
          const parsedCandidates = JSON.parse(storedCandidatesStr);
          console.log(`Loaded ${parsedCandidates.length} candidates from localStorage`);
          
          // Ensure all candidates have string IDs
          const normalizedCandidates = parsedCandidates.map(candidate => ({
            ...candidate,
            id: String(candidate.id),
            electionId: candidate.electionId ? String(candidate.electionId) : ''
          }));
          
          setCandidates(normalizedCandidates);
          
          // If in candidates view, update filtered candidates
          if (viewMode === 'candidates' && selectedElectionForCandidates) {
            console.log('Filtering candidates for election:', selectedElectionForCandidates);
            const filtered = normalizedCandidates.filter(
              c => c.electionId && String(c.electionId) === String(selectedElectionForCandidates)
            );
            console.log(`Found ${filtered.length} candidates for this election`);
            setFilteredCandidates(filtered);
          }
        } catch (parseError) {
          console.error('Error parsing candidates from localStorage:', parseError);
          setCandidates([]);
          setFilteredCandidates([]);
        }
      } else {
        console.log('No candidates found in localStorage');
        setCandidates([]);
        setFilteredCandidates([]);
      }
    } catch (error) {
      console.error('Error loading candidates:', error);
      showSnackbar('Không thể tải danh sách ứng cử viên', 'error');
    }
  };

  const loadVoters = () => {
    try {
      // Lấy danh sách cử tri từ localStorage
      const storedVoters = localStorage.getItem('voters');
      if (storedVoters) {
        const voters = JSON.parse(storedVoters);
        console.log("Loaded voters:", voters);
        setVoters(voters);
      } else {
        console.log("No voters found in localStorage");
        setVoters([]);
      }
    } catch (error) {
      console.error('Error loading voters:', error);
      showSnackbar('Không thể tải danh sách cử tri', 'error');
    }
  };

  // Cập nhật danh sách cử tri mỗi khi tab thay đổi sang tab Danh sách cử tri
  useEffect(() => {
    if (activeTab === 2) {
      loadVoters();
    }
  }, [activeTab]);

  const handleCreateElection = () => {
    try {
      setCreating(true);
      setError('');
      
      // Lấy dữ liệu từ form
      const formData = { ...electionFormData };
      console.log("Creating election with form data:", formData);
      
      // Kiểm tra thông tin
      if (!formData.title || !formData.startTime || !formData.endTime) {
        setError('Vui lòng điền đầy đủ thông tin bắt buộc');
        console.log("Missing required fields");
        setCreating(false);
        return;
      }

      // Tạo ID cho cuộc bầu cử mới
      const electionId = Date.now().toString();
      
      // Tạo cuộc bầu cử mới
      const newElection = {
        id: electionId,
        title: formData.title,
        description: formData.description || '',
        startTime: formData.startTime instanceof Date ? formData.startTime.toISOString() : formData.startTime,
        endTime: formData.endTime instanceof Date ? formData.endTime.toISOString() : formData.endTime,
        logoUrl: formData.logoUrl || '',
        status: 'upcoming',
        candidates: []
      };
      
      console.log("New election object:", newElection);

      // Cập nhật danh sách bầu cử
      const updatedElections = [...elections, newElection];
      setElections(updatedElections);
      
      // Lưu vào localStorage
      localStorage.setItem('elections', JSON.stringify(updatedElections));
      console.log("Elections saved to localStorage:", updatedElections);

      // Đóng dialog và reset form
      setOpenElectionDialog(false);
      setElectionFormData({
        title: '',
        description: '',
        startTime: null,
        endTime: null,
        logoUrl: '',
      });
      
      showSnackbar('Tạo cuộc bầu cử thành công');
    } catch (error) {
      console.error('Error creating election:', error);
      showSnackbar('Không thể tạo cuộc bầu cử. Vui lòng thử lại sau.', 'error');
    } finally {
      setCreating(false);
    }
  };

  // Handle adding candidate
  const handleAddCandidate = (electionId) => {
    console.log('handleAddCandidate called with electionId:', electionId);
    
    if (!electionId) {
      console.error('No election ID provided for adding candidate');
      showSnackbar('Vui lòng chọn cuộc bầu cử trước khi thêm ứng cử viên', 'error');
        return;
      }

    // Reset form data và lưu election đã chọn
    resetCandidateForm();
    setSelectedElection(electionId.toString());
    
    // Thiết lập giá trị mặc định cho form
      setCandidateFormData({
        name: '',
        birthDate: null,
        hometown: '',
        position: '',
      description: '',
        achievements: '',
        motto: '',
        imageUrl: '',
      });
      
    console.log('Opening candidate dialog for election ID:', electionId);
    setOpenCandidateDialog(true);
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleDeleteElection = (id) => {
    try {
      // Chuyển đổi id sang string để đảm bảo so sánh đúng
      const idStr = id.toString();
      
      // Tìm thông tin cuộc bầu cử cần xóa để hiển thị trong xác nhận
      const electionToDelete = elections.find(election => election.id.toString() === idStr);
      
      if (!electionToDelete) {
        showSnackbar('Không tìm thấy cuộc bầu cử', 'error');
        return;
      }

      // Kiểm tra trạng thái cuộc bầu cử - không cho phép xóa cuộc bầu cử đang diễn ra
      const status = getElectionStatus(electionToDelete);
      if (status === 'active') {
        showSnackbar('Không thể xóa cuộc bầu cử đang diễn ra', 'error');
        return;
      }

      // Yêu cầu xác nhận trước khi xóa
      if (!window.confirm(`Bạn có chắc chắn muốn xóa cuộc bầu cử "${electionToDelete.title}"? Tất cả dữ liệu liên quan sẽ bị xóa và không thể khôi phục.`)) {
        return;
      }
      
      // Xóa các ứng cử viên thuộc cuộc bầu cử này
      const candidatesToDelete = candidates.filter(candidate => candidate.electionId.toString() === idStr);
      if (candidatesToDelete.length > 0) {
        const updatedCandidates = candidates.filter(candidate => candidate.electionId.toString() !== idStr);
      setCandidates(updatedCandidates);
      localStorage.setItem('candidates', JSON.stringify(updatedCandidates));
        console.log(`Đã xóa ${candidatesToDelete.length} ứng cử viên thuộc cuộc bầu cử ${idStr}`);
      }
      
      // Xóa dữ liệu phiếu bầu
      localStorage.removeItem(`votes_${idStr}`);
      localStorage.removeItem(`showResults_${idStr}`);
      localStorage.removeItem(`sample_votes_generated_${idStr}`);
      
      // Xóa cuộc bầu cử
      const updatedElections = elections.filter(election => election.id.toString() !== idStr);
    setElections(updatedElections);
    localStorage.setItem('elections', JSON.stringify(updatedElections));
      
      showSnackbar(`Đã xóa cuộc bầu cử "${electionToDelete.title}" và tất cả dữ liệu liên quan`, 'success');
    } catch (error) {
      console.error('Lỗi khi xóa cuộc bầu cử:', error);
      showSnackbar('Đã xảy ra lỗi khi xóa cuộc bầu cử', 'error');
    }
  };

  const handleDeleteCandidate = (id) => {
    console.log('Delete candidate called with ID:', id);
    
    try {
      // Convert ID to string for consistent comparison
      const candidateId = String(id);
      
      // Get data from localStorage
      const storedCandidatesStr = localStorage.getItem('candidates');
      if (!storedCandidatesStr) {
        console.error('No candidates found in localStorage');
        showSnackbar('Không tìm thấy dữ liệu ứng cử viên', 'error');
        return;
      }
      
      const storedCandidates = JSON.parse(storedCandidatesStr);
      console.log('Current candidates in localStorage:', storedCandidates);
      
      // Find candidate to delete
      const candidateToDelete = storedCandidates.find(c => String(c.id) === candidateId);
      if (!candidateToDelete) {
        console.error('Candidate not found with ID:', candidateId);
        showSnackbar('Không tìm thấy ứng cử viên', 'error');
        return;
      }
      
      console.log('Found candidate to delete:', candidateToDelete);
      
      // Confirm deletion
      if (!window.confirm(`Bạn có chắc chắn muốn xóa ứng cử viên "${candidateToDelete.name}"?`)) {
        console.log('User cancelled deletion');
        return;
      }
      
      // Filter out the candidate to be deleted
      const updatedCandidates = storedCandidates.filter(c => String(c.id) !== candidateId);
      
      console.log('Updated candidate list:', updatedCandidates);
      console.log('Removed:', candidateToDelete);
      
      // Update localStorage
    localStorage.setItem('candidates', JSON.stringify(updatedCandidates));
      
      // Update state
      setCandidates(updatedCandidates);
      
      // Update filtered candidates if in the Candidates tab
      if (viewMode === 'candidates' && selectedElectionForCandidates) {
        const newFiltered = updatedCandidates.filter(
          c => c.electionId && String(c.electionId) === String(selectedElectionForCandidates)
        );
        setFilteredCandidates(newFiltered);
      }
      
      showSnackbar(`Đã xóa ứng cử viên "${candidateToDelete.name}" thành công`, 'success');
      
      // Reload to ensure UI is updated
      setTimeout(() => {
        loadCandidates();
        if (viewMode === 'candidates' && selectedElectionForCandidates) {
          filterCandidatesByElection(selectedElectionForCandidates);
        }
      }, 300);
      
    } catch (error) {
      console.error('Error deleting candidate:', error);
      showSnackbar('Đã xảy ra lỗi khi xóa ứng cử viên', 'error');
    }
  };

  // Thêm chức năng xóa cử tri
  const handleDeleteVoter = (cccd) => {
    try {
      // Tìm thông tin cử tri cần xóa để hiển thị trong xác nhận
      const voterToDelete = voters.find(voter => voter.cccd === cccd);
      
      if (!voterToDelete) {
        showSnackbar('Không tìm thấy cử tri', 'error');
        return;
      }
      
      // Yêu cầu xác nhận trước khi xóa
      if (!window.confirm(`Bạn có chắc chắn muốn xóa cử tri "${voterToDelete.fullName}" (CCCD: ${voterToDelete.cccd})? Dữ liệu này không thể khôi phục.`)) {
        return;
      }
      
      // Xóa dữ liệu phiếu bầu của cử tri
      localStorage.removeItem(`voter_${cccd}_voted`);
      
      // Xóa cử tri
      const updatedVoters = voters.filter(voter => voter.cccd !== cccd);
      setVoters(updatedVoters);
      localStorage.setItem('voters', JSON.stringify(updatedVoters));
      
      showSnackbar(`Đã xóa cử tri "${voterToDelete.fullName}" thành công`, 'success');
    } catch (error) {
      console.error('Lỗi khi xóa cử tri:', error);
      showSnackbar('Đã xảy ra lỗi khi xóa cử tri', 'error');
    }
  };

  // Dialog tạo cuộc bầu cử mới
  const NewElectionDialog = ({ open, onClose, onSave }) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [startTime, setStartTime] = useState(new Date());
    const [endTime, setEndTime] = useState(new Date(new Date().setDate(new Date().getDate() + 7)));
    const [logoUrl, setLogoUrl] = useState('');
    const [logoFile, setLogoFile] = useState(null);
    const [logoPreview, setLogoPreview] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogoChange = (event) => {
      if (event.target.files && event.target.files[0]) {
        const file = event.target.files[0];
        if (file.size > 5 * 1024 * 1024) {
          setError('Kích thước file không được vượt quá 5MB');
          return;
        }
        
        const reader = new FileReader();
        reader.onload = (e) => {
          setLogoPreview(e.target.result);
          setLogoUrl(e.target.result);
        };
        reader.readAsDataURL(file);
        setLogoFile(file);
      }
    };

    const handleSave = () => {
      if (!title) {
        setError('Vui lòng nhập tiêu đề cuộc bầu cử');
        return;
      }
      
      if (!startTime || !endTime) {
        setError('Vui lòng chọn thời gian bắt đầu và kết thúc');
        return;
      }
      
      if (startTime >= endTime) {
        setError('Thời gian kết thúc phải sau thời gian bắt đầu');
        return;
      }
      
      setLoading(true);
      
      // Cập nhật dữ liệu form và gọi hàm tạo cuộc bầu cử
      setElectionFormData({
        title,
        description,
        startTime,
        endTime,
        logoUrl
      });
      
      console.log("Form data being saved:", {
        title,
        description,
        startTime,
        endTime,
        logoUrl
      });
      
      // Gọi onSave ngay lập tức
      try {
        onSave();
      } catch (error) {
        console.error("Error saving election:", error);
      } finally {
        setLoading(false);
      }
    };

    return (
      <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth PaperProps={{ sx: { maxHeight: '90vh' } }}>
        <DialogTitle>Tạo cuộc bầu cử mới</DialogTitle>
        <DialogContent dividers sx={{ pb: 2, overflowY: 'auto' }}>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          
          <Grid container spacing={3}>
            <Grid item xs={12} md={8}>
              <TextField
                label="Tiêu đề cuộc bầu cử"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                fullWidth
                required
                margin="normal"
              />
              
              <TextField
                label="Mô tả"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                fullWidth
                multiline
                rows={4}
                margin="normal"
              />
              
              <Box sx={{ mt: 2, mb: 3 }}>
                <DateTimePicker
                  label="Thời gian bắt đầu"
                  value={startTime}
                  onChange={setStartTime}
                  slotProps={{ textField: { fullWidth: true, margin: "normal" } }}
                  ampm={false}
                  format="dd/MM/yyyy HH:mm"
                />
                
                <DateTimePicker
                  label="Thời gian kết thúc"
                  value={endTime}
                  onChange={setEndTime}
                  slotProps={{ textField: { fullWidth: true, margin: "normal" } }}
                  ampm={false}
                  format="dd/MM/yyyy HH:mm"
                />
              </Box>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Box sx={{ border: '1px dashed #ccc', borderRadius: 1, p: 2, mt: 2, mb: 2, textAlign: 'center' }}>
                {logoPreview ? (
                  <Box sx={{ mb: 2 }}>
                    <img
                      src={logoPreview}
                      alt="Logo preview"
                      style={{ maxWidth: '100%', maxHeight: '200px' }}
                    />
                  </Box>
                ) : (
                  <Box sx={{ py: 6 }}>
                    <Typography color="textSecondary">Logo cuộc bầu cử</Typography>
                  </Box>
                )}
                
                <Button
                  variant="outlined"
                  component="label"
                  startIcon={<CloudUploadIcon />}
                >
                  Tải lên logo
                  <input
                    type="file"
                    hidden
                    onChange={handleLogoChange}
                    accept="image/*"
                  />
                </Button>
                <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                  Chấp nhận file: JPG, PNG. Tối đa 5MB
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Hủy</Button>
          <LoadingButton
            loading={loading}
            onClick={handleSave}
            variant="contained"
          >
            Tạo cuộc bầu cử
          </LoadingButton>
        </DialogActions>
      </Dialog>
    );
  };

  // Tạo hàm xử lý chỉnh sửa ứng cử viên khi click vào nút sửa
  const handleEditCandidate = (candidate) => {
    console.log('Edit candidate called with:', candidate);
    
    try {
      if (!candidate || !candidate.id) {
        console.error('Invalid candidate data:', candidate);
        showSnackbar('Dữ liệu ứng cử viên không hợp lệ', 'error');
        return;
      }
      
      // Convert candidate data to ensure all fields are present
      const candidateData = {
        id: String(candidate.id),
        name: candidate.name || '',
      birthDate: candidate.birthDate ? new Date(candidate.birthDate) : null,
      hometown: candidate.hometown || '',
      position: candidate.position || '',
        description: candidate.description || '',
      achievements: candidate.achievements || '',
      motto: candidate.motto || '',
      imageUrl: candidate.imageUrl || '',
        electionId: candidate.electionId ? String(candidate.electionId) : ''
      };
      
      console.log('Prepared candidate data for editing:', candidateData);
      
      // Save the candidate to be edited to state
      setSelectedCandidate(candidateData);
      
      // Set the form data
    setCandidateFormData({
        name: candidateData.name,
        birthDate: candidateData.birthDate,
        hometown: candidateData.hometown,
        position: candidateData.position,
        description: candidateData.description,
        achievements: candidateData.achievements,
        motto: candidateData.motto,
        imageUrl: candidateData.imageUrl,
        electionId: candidateData.electionId
      });
      
      console.log('Form data set for editing');
      
      // Set the selected election
      setSelectedElection(candidateData.electionId);
      
      // Open the edit dialog
      console.log('Opening edit dialog');
      setOpenEditCandidateDialog(true);
      
    } catch (error) {
      console.error('Error preparing candidate for edit:', error);
      showSnackbar('Đã xảy ra lỗi khi chuẩn bị chỉnh sửa ứng cử viên', 'error');
    }
  };

  // Hàm cập nhật thông tin ứng cử viên sau khi chỉnh sửa
  const handleUpdateCandidate = () => {
    console.log('Update candidate called');
    setCreating(true);
    setError('');
    
    try {
      // Validate input
      if (!candidateFormData.name || !candidateFormData.birthDate) {
        setError('Vui lòng điền đầy đủ thông tin bắt buộc');
        setCreating(false);
        return;
      }
      
      // Check if we have a candidate to update
      if (!selectedCandidate || !selectedCandidate.id) {
        setError('Không tìm thấy thông tin ứng cử viên để cập nhật');
        setCreating(false);
        return;
      }
      
      console.log('Selected candidate to update:', selectedCandidate);
      console.log('Form data for update:', candidateFormData);
      
      // Get current candidates from localStorage
      const storedCandidatesStr = localStorage.getItem('candidates');
      if (!storedCandidatesStr) {
        setError('Không tìm thấy dữ liệu ứng cử viên');
        setCreating(false);
        return;
      }
      
      const storedCandidates = JSON.parse(storedCandidatesStr);
      
      // Create updated candidate object
      const updatedCandidate = {
        ...selectedCandidate,
        name: candidateFormData.name.trim(),
            birthDate: candidateFormData.birthDate,
        hometown: candidateFormData.hometown || '',
        position: candidateFormData.position || '',
        description: candidateFormData.description || '',
        achievements: candidateFormData.achievements || '',
        motto: candidateFormData.motto || '',
        imageUrl: candidateFormData.imageUrl || '',
        // Make sure to keep the same ID and electionId
        id: selectedCandidate.id,
        electionId: selectedCandidate.electionId
      };
      
      console.log('Updated candidate object:', updatedCandidate);
      
      // Find and update the candidate in the array
      const candidateId = String(selectedCandidate.id);
      const candidateIndex = storedCandidates.findIndex(c => String(c.id) === candidateId);
      
      if (candidateIndex === -1) {
        setError('Không tìm thấy ứng cử viên trong danh sách');
        setCreating(false);
        return;
      }
      
      // Replace the candidate at the found index
      storedCandidates[candidateIndex] = updatedCandidate;
      
      // Save to localStorage
      localStorage.setItem('candidates', JSON.stringify(storedCandidates));
      
      // Update state
      setCandidates(storedCandidates);
      
      // Close dialog and reset form
      setOpenEditCandidateDialog(false);
      resetCandidateForm();
      setSelectedCandidate(null);
      
      // Update filtered candidates if in Candidates tab
      if (viewMode === 'candidates' && selectedElectionForCandidates) {
        const filtered = storedCandidates.filter(
          c => c.electionId && String(c.electionId) === String(selectedElectionForCandidates)
        );
        setFilteredCandidates(filtered);
      }
      
      // Show success message
      showSnackbar('Cập nhật ứng cử viên thành công', 'success');
      
      // Reload candidates to ensure UI is updated
      setTimeout(loadCandidates, 300);
      
    } catch (error) {
      console.error('Error updating candidate:', error);
      setError('Đã xảy ra lỗi khi cập nhật ứng cử viên: ' + error.message);
    } finally {
      setCreating(false);
    }
  };
  
  // Hàm lưu thông tin ứng cử viên mới
  const handleSaveCandidate = () => {
    try {
      setCreating(true);
      setError('');
      
      console.log('Saving new candidate with form data:', candidateFormData);
      console.log('Selected election ID:', selectedElection);
      
      // Kiểm tra thông tin
      if (!candidateFormData.name || !candidateFormData.birthDate) {
        setError('Vui lòng điền đầy đủ thông tin bắt buộc');
        setCreating(false);
        return;
      }

      // Kiểm tra tuổi (phải trên 18 tuổi)
      const birthDate = new Date(candidateFormData.birthDate);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      if (age < 18 || (age === 18 && monthDiff < 0)) {
        setError('Ứng cử viên phải đủ 18 tuổi trở lên');
        setCreating(false);
        return;
      }

      // Kiểm tra xem đã chọn cuộc bầu cử chưa
      if (!selectedElection) {
        setError('Vui lòng chọn cuộc bầu cử cho ứng cử viên');
        setCreating(false);
        return;
      }

      // Tạo ID cho ứng cử viên mới
      const candidateId = Date.now().toString();
      
      // Tạo ứng cử viên mới
      const newCandidate = {
        id: candidateId,
        name: candidateFormData.name.trim(),
        birthDate: candidateFormData.birthDate,
        hometown: candidateFormData.hometown || '',
        position: candidateFormData.position || '',
        description: candidateFormData.description || '',
        achievements: candidateFormData.achievements || '',
        motto: candidateFormData.motto || '',
        imageUrl: candidateFormData.imageUrl || '',
        electionId: selectedElection
      };

      console.log('Created new candidate:', newCandidate);

      // Đọc danh sách ứng cử viên hiện tại từ localStorage
      const storedCandidates = JSON.parse(localStorage.getItem('candidates') || '[]');
      console.log('Current candidates in localStorage:', storedCandidates.length);
      
      // Cập nhật danh sách ứng cử viên
      const updatedCandidates = [...storedCandidates, newCandidate];
      console.log('Updated candidates list:', updatedCandidates.length);
      
      // Cập nhật state và localStorage
      setCandidates(updatedCandidates);
      localStorage.setItem('candidates', JSON.stringify(updatedCandidates));
      console.log('Saved candidates to localStorage');

      // Đóng dialog và reset form
      setOpenCandidateDialog(false);
      resetCandidateForm();
      
      // Cập nhật danh sách ứng cử viên được lọc
      if (viewMode === 'candidates' && selectedElectionForCandidates) {
        console.log('Updating filtered candidates view');
        setTimeout(() => {
          filterCandidatesByElection(selectedElectionForCandidates);
        }, 100);
      }
      
      showSnackbar('Thêm ứng cử viên thành công');
      setCreating(false);
    } catch (error) {
      console.error('Error adding candidate:', error);
      showSnackbar('Không thể thêm ứng cử viên. Vui lòng thử lại sau.', 'error');
      setCreating(false);
    }
  };

  // Thêm hàm để mở dialog sửa ứng cử viên
  const resetCandidateForm = () => {
      setCandidateFormData({
        name: '',
        birthDate: null,
        hometown: '',
        position: '',
        achievements: '',
        motto: '',
        imageUrl: '',
      });
  };

  // Thêm hàm tải danh sách admin
  const loadAdmins = () => {
    try {
      const storedAdmins = localStorage.getItem('admins');
      if (storedAdmins) {
        setAdmins(JSON.parse(storedAdmins));
      } else {
        // Tạo danh sách admin mẫu nếu chưa có
        const currentAdminCCCD = localStorage.getItem('adminCCCD');
        const currentAdminName = localStorage.getItem('adminName') || 'Admin';
        
        const initialAdmins = [
          {
            id: '1',
            name: currentAdminName,
            cccd: currentAdminCCCD,
            email: 'admin@example.com',
            createdAt: new Date()
          }
        ];
        localStorage.setItem('admins', JSON.stringify(initialAdmins));
        setAdmins(initialAdmins);
      }
    } catch (error) {
      console.error('Error loading admins:', error);
    }
  };

  // Thêm hàm xử lý thêm admin mới
  const handleAddAdmin = () => {
    try {
      setLoading(true);
      setError('');
      
      // Kiểm tra dữ liệu nhập vào
      if (!adminFormData.name || !adminFormData.cccd || !adminFormData.email || !adminFormData.password) {
        setError('Vui lòng nhập đầy đủ thông tin admin');
        setLoading(false);
        return;
      }
      
      // Kiểm tra định dạng CCCD (12 chữ số)
      if (!/^\d{12}$/.test(adminFormData.cccd)) {
        setError('CCCD phải có đúng 12 chữ số');
        setLoading(false);
        return;
      }
      
      // Kiểm tra email hợp lệ
      if (!/\S+@\S+\.\S+/.test(adminFormData.email)) {
        setError('Email không hợp lệ');
        setLoading(false);
        return;
      }
      
      // Kiểm tra CCCD đã tồn tại chưa
      const storedAdmins = JSON.parse(localStorage.getItem('admins') || '[]');
      const adminExists = storedAdmins.some(admin => admin.cccd === adminFormData.cccd);
      if (adminExists) {
        setError('CCCD này đã được sử dụng');
        setLoading(false);
        return;
      }
      
      // Thêm admin mới
      const newAdmin = {
        id: Date.now().toString(),
        name: adminFormData.name,
        cccd: adminFormData.cccd,
        email: adminFormData.email,
        createdAt: new Date()
      };
      
      // Lưu thông tin đăng nhập của admin vào localStorage
      const loginData = JSON.parse(localStorage.getItem('loginData') || '{}');
      loginData[adminFormData.cccd] = {
        password: adminFormData.password,
        isAdmin: true,
        name: adminFormData.name
      };
      localStorage.setItem('loginData', JSON.stringify(loginData));
      
      // Cập nhật danh sách admin
      const updatedAdmins = [...storedAdmins, newAdmin];
      localStorage.setItem('admins', JSON.stringify(updatedAdmins));
      setAdmins(updatedAdmins);
      
      // Hiển thị thông báo thành công
      setSnackbar({
        open: true,
        message: 'Thêm admin mới thành công',
        severity: 'success'
      });
      
      // Đóng dialog và reset form
      setOpenAddAdminDialog(false);
      setAdminFormData({
        name: '',
        cccd: '',
        email: '',
        password: ''
      });
    } catch (error) {
      console.error('Error adding admin:', error);
      setError('Có lỗi xảy ra khi thêm admin');
    } finally {
      setLoading(false);
    }
  };

  // Thêm hàm xoá admin (tuỳ chọn)
  const handleDeleteAdmin = (adminId) => {
    try {
      // Không cho phép xoá admin hiện tại
      const currentAdminCCCD = localStorage.getItem('adminCCCD');
      const adminToDelete = admins.find(admin => admin.id === adminId);
      
      if (adminToDelete.cccd === currentAdminCCCD) {
        setSnackbar({
          open: true,
          message: 'Không thể xoá tài khoản admin hiện tại',
          severity: 'error'
        });
        return;
      }
      
      // Xác nhận xoá admin
      if (!window.confirm(`Bạn có chắc chắn muốn xoá admin "${adminToDelete.name}"?`)) {
        return;
      }
      
      // Xoá admin khỏi danh sách
      const updatedAdmins = admins.filter(admin => admin.id !== adminId);
      localStorage.setItem('admins', JSON.stringify(updatedAdmins));
      setAdmins(updatedAdmins);
      
      // Xoá thông tin đăng nhập của admin
      const loginData = JSON.parse(localStorage.getItem('loginData') || '{}');
      delete loginData[adminToDelete.cccd];
      localStorage.setItem('loginData', JSON.stringify(loginData));
      
      // Hiển thị thông báo thành công
      setSnackbar({
        open: true,
        message: 'Xoá admin thành công',
        severity: 'success'
      });
    } catch (error) {
      console.error('Error deleting admin:', error);
      setSnackbar({
        open: true,
        message: 'Có lỗi xảy ra khi xoá admin',
        severity: 'error'
      });
    }
  };

  // Thêm function lọc ứng cử viên theo cuộc bầu cử
  const filterCandidatesByElection = (electionId) => {
    console.log('filterCandidatesByElection called with electionId:', electionId);
    
    // If no election selected, show all candidates
    if (!electionId) {
      console.log('No election selected, showing all candidates');
      setFilteredCandidates(candidates);
      setSelectedElectionForCandidates(null);
      return;
    }
    
    // Convert ID to string for consistent comparison
    const electionIdStr = String(electionId);
    setSelectedElectionForCandidates(electionIdStr);
    
    // Get current candidates from localStorage to ensure we have the latest data
    try {
      const storedCandidatesStr = localStorage.getItem('candidates');
      const currentCandidates = storedCandidatesStr ? JSON.parse(storedCandidatesStr) : [];
      
      console.log(`Found ${currentCandidates.length} total candidates in localStorage`);
      
      // Filter candidates for the selected election
      const filtered = currentCandidates.filter(candidate => 
        candidate && candidate.electionId && String(candidate.electionId) === electionIdStr
      );
      
      console.log(`Filtered to ${filtered.length} candidates for election ${electionIdStr}`);
      
      // Update filtered candidates
      setFilteredCandidates(filtered);
      
      // Also update the main candidates array
      setCandidates(currentCandidates);
    } catch (error) {
      console.error('Error filtering candidates:', error);
      setFilteredCandidates([]);
    }
  };

  // Xem kết quả bầu cử
  const handleViewResults = (electionId) => {
    setSelectedElectionIdForResult(electionId);
    setShowElectionResults(true);
    setViewMode('results');
  };

  // Hàm quay lại từ màn hình kết quả
  const handleBackFromResults = () => {
    setShowElectionResults(false);
    setSelectedElectionIdForResult(null);
    setViewMode('elections');
  };

  // Thêm chức năng chuyển đổi chế độ xem
  const handleViewModeChange = (newView) => {
    setViewMode(newView);
    
    // Nếu chuyển tab, reset form và đóng dialog
    setOpenElectionDialog(false);
    setOpenCandidateDialog(false);
    setOpenEditCandidateDialog(false);
    setOpenAddAdminDialog(false);
    setSelectedCandidate(null);
    
    // Load dữ liệu khi chuyển tab
    if (newView === 'voters') {
      loadVoters();
    }
  };

  // Thêm hàm renderContent để hiển thị nội dung dựa vào tab đang chọn
  const renderContent = () => {
    if (showElectionResults && selectedElectionIdForResult) {
  return (
        <ElectionResultsReport 
          electionId={selectedElectionIdForResult} 
          onBack={handleBackFromResults} 
        />
      );
    }

    switch (viewMode) {
      case 'elections':
        return renderElectionsTab();
      case 'candidates':
        return renderCandidatesTab();
      case 'admins':
        return renderAdminsTab();
      case 'voters':
        return renderVotersTab();
      default:
        return renderElectionsTab();
    }
  };

  // Tab Cuộc bầu cử
  const renderElectionsTab = () => {
    return (
      <Paper sx={{ p: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h5">Quản lý cuộc bầu cử</Typography>
            <Button 
              variant="contained" 
              onClick={() => setOpenElectionDialog(true)}
              startIcon={<AddIcon />}
            >
              Tạo cuộc bầu cử mới
            </Button>
          </Box>

          {loading ? (
          <Box display="flex" justifyContent="center" my={4}>
              <CircularProgress />
            </Box>
        ) : elections.length > 0 ? (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Tên cuộc bầu cử</TableCell>
                  <TableCell>Bắt đầu</TableCell>
                  <TableCell>Kết thúc</TableCell>
                  <TableCell>Trạng thái</TableCell>
                  <TableCell align="center">Ứng cử viên</TableCell>
                  <TableCell align="center">Thao tác</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {elections.map((election) => {
                  const status = getElectionStatus(election);
                  const candidateCount = candidates.filter(
                    c => c.electionId && c.electionId.toString() === election.id.toString()
                  ).length;
                  
                  return (
                    <TableRow key={election.id}>
                      <TableCell>{election.title}</TableCell>
                      <TableCell>{formatDate(election.startTime)}</TableCell>
                      <TableCell>{formatDate(election.endTime)}</TableCell>
                      <TableCell>
                        <Chip 
                          label={getStatusText(status)} 
                          color={getStatusColor(status)} 
                          size="small" 
                        />
                      </TableCell>
                      <TableCell align="center">{candidateCount}</TableCell>
                      <TableCell align="center">
                        <ButtonGroup size="small">
                          <Button
                            variant="outlined"
                            color="primary" 
                            onClick={() => handleAddCandidate(election.id)}
                            disabled={status !== 'upcoming'}
                            startIcon={<PersonAddIcon />}
                          >
                            ỨCV
                          </Button>
                          
                          <Button
                            variant="outlined"
                            color="info" 
                            onClick={() => handleViewResults(election.id)}
                            startIcon={<AssessmentIcon />}
                          >
                            Kết quả
                          </Button>
                          
                          {status === 'active' && (
                            <Button
                              variant="outlined"
                              color="success" 
                              onClick={() => handleMarkCompleted(election.id)}
                              startIcon={<DoneAllIcon />}
                            >
                              Kết thúc
                            </Button>
                          )}
                          
                          {status !== 'active' && (
                            <Button
                              variant="outlined"
                              color="error" 
                              onClick={() => handleDeleteElection(election.id)}
                              disabled={status === 'active'}
                              startIcon={<DeleteIcon />}
                            >
                              Xóa
                            </Button>
                          )}
                        </ButtonGroup>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        ) : (
          <Alert severity="info">
            Chưa có cuộc bầu cử nào. Hãy tạo cuộc bầu cử mới.
          </Alert>
        )}
                  </Paper>
    );
  };

  // Tab Ứng cử viên
  const renderCandidatesTab = () => {
    return (
      <Paper sx={{ p: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h5">Quản lý ứng cử viên</Typography>
          <Box display="flex" alignItems="center" gap={2}>
            <FormControl variant="outlined" sx={{ minWidth: 200 }}>
              <InputLabel>Chọn cuộc bầu cử</InputLabel>
              <Select
                value={selectedElectionForCandidates || ''}
                onChange={(e) => filterCandidatesByElection(e.target.value)}
                label="Chọn cuộc bầu cử"
              >
                {elections.map((election) => (
                  <MenuItem key={election.id} value={election.id}>
                            {election.title}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            {selectedElectionForCandidates && (
              <Button
                variant="contained"
                startIcon={<PersonAddIcon />}
                onClick={() => handleAddCandidate(selectedElectionForCandidates)}
              >
                Thêm ứng cử viên
              </Button>
            )}
                          </Box>
                        </Box>

        {loading ? (
          <Box display="flex" justifyContent="center" my={4}>
            <CircularProgress />
          </Box>
        ) : filteredCandidates && filteredCandidates.length > 0 ? (
          <Grid container spacing={3}>
            {filteredCandidates.map((candidate) => {
              const election = elections.find(e => e && e.id && candidate.electionId && 
                e.id.toString() === candidate.electionId.toString());
              const status = election ? getElectionStatus(election) : 'unknown';
              return (
                <Grid item xs={12} sm={6} md={4} key={`${candidate.electionId}-${candidate.id}`}>
                  <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                    <CardMedia
                      component="img"
                      height="200"
                      image={candidate.imageUrl || 'https://via.placeholder.com/300x200?text=Ứng+cử+viên'}
                      alt={candidate.name}
                    />
                    <CardContent sx={{ flexGrow: 1 }}>
                      <Typography variant="h6" gutterBottom>
                        {candidate.name}
                        </Typography>
                      <Typography variant="body2" color="text.secondary" paragraph>
                        {candidate.position || 'Chức vụ: Không có thông tin'}
                        </Typography>
                      <Typography variant="body2" color="text.secondary">
                        <strong>Ngày sinh:</strong> {formatDate(candidate.birthDate)}
                        </Typography>
                      <Typography variant="body2" color="text.secondary">
                        <strong>Quê quán:</strong> {candidate.hometown || 'Không có thông tin'}
                        </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        {candidate.description && candidate.description.length > 100 
                          ? `${candidate.description.substring(0, 100)}...` 
                          : candidate.description || 'Không có mô tả'}
                      </Typography>
                    </CardContent>
                    <CardActions>
                          <Button 
                        size="small" 
                        onClick={() => handleViewCandidate(candidate)}
                        sx={{ mr: 'auto' }}
                      >
                        Xem chi tiết
                          </Button>
                      <Button 
                    color="primary" 
                        size="small"
                        startIcon={<EditIcon fontSize="small" />}
                    onClick={() => handleEditCandidate(candidate)}
                  >
                        Sửa
                      </Button>
                      <Button 
                    color="error" 
                        size="small"
                        startIcon={<DeleteIcon fontSize="small" />}
                    onClick={() => handleDeleteCandidate(candidate.id)}
                  >
                        Xóa
                      </Button>
                    </CardActions>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        ) : (
          <Alert severity="info">
            {selectedElectionForCandidates 
              ? 'Chưa có ứng cử viên nào trong cuộc bầu cử này.' 
              : 'Vui lòng chọn một cuộc bầu cử để xem ứng cử viên.'}
          </Alert>
        )}
      </Paper>
    );
  };

  // Tab Quản lý Admin
  const renderAdminsTab = () => {
    return (
      <Paper sx={{ p: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h5">Quản lý Admin</Typography>
            <Button 
              variant="contained" 
              onClick={() => setOpenAddAdminDialog(true)}
              startIcon={<PersonAddIcon />}
            >
              Thêm quản trị viên mới
            </Button>
          </Box>
          
        {loading ? (
          <Box display="flex" justifyContent="center" my={4}>
            <CircularProgress />
          </Box>
        ) : admins.length > 0 ? (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Họ và tên</TableCell>
                  <TableCell>CCCD/CMND</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Thao tác</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {admins.map((admin) => (
                  <TableRow key={admin.id}>
                    <TableCell>{admin.name}</TableCell>
                    <TableCell>{admin.cccd}</TableCell>
                    <TableCell>{admin.email}</TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={1} justifyContent="center">
                          <IconButton 
                            color="error" 
                            onClick={() => handleDeleteAdmin(admin.id)}
                          >
                          <DeleteIcon fontSize="small" />
                          </IconButton>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        ) : (
          <Alert severity="info">
            Chưa có quản trị viên nào. Hãy thêm quản trị viên mới.
          </Alert>
        )}
      </Paper>
    );
  };

  // Tab Quản lý Cử tri
  const renderVotersTab = () => {
    return (
      <Paper sx={{ p: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h5">Quản lý cử tri</Typography>
        </Box>
        
        {loading ? (
          <Box display="flex" justifyContent="center" my={4}>
            <CircularProgress />
          </Box>
        ) : voters.length > 0 ? (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Họ và tên</TableCell>
                  <TableCell>CCCD/CMND</TableCell>
                  <TableCell>Địa chỉ</TableCell>
                  <TableCell>Ngày sinh</TableCell>
                  <TableCell>Trạng thái bầu cử</TableCell>
                  <TableCell align="center">Thao tác</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {voters.map((voter) => {
                  // Lấy thông tin các cuộc bầu cử mà cử tri đã tham gia
                  const voterVotedKey = `voter_${voter.cccd}_voted`;
                  const votedElections = JSON.parse(localStorage.getItem(voterVotedKey) || '[]');
                  
                  return (
                    <TableRow key={voter.cccd}>
                      <TableCell>{voter.fullName}</TableCell>
                      <TableCell>{voter.cccd}</TableCell>
                      <TableCell>{voter.address}</TableCell>
                      <TableCell>{formatDate(voter.birthDate)}</TableCell>
                      <TableCell>
                        {votedElections.length > 0 ? (
                          <Box>
                              <Chip 
                              label={`Đã tham gia ${votedElections.length} cuộc bầu cử`} 
                              color="success" 
                                size="small" 
                            />
                            <Box mt={1}>
                              {votedElections.map(electionId => {
                                const election = elections.find(e => e.id === electionId);
                                return election ? (
                                  <Typography variant="caption" display="block" key={electionId}>
                                    • {election.title}
                                  </Typography>
                                ) : null;
                              })}
                            </Box>
                          </Box>
                        ) : (
                          <Chip 
                            label="Chưa tham gia bầu cử" 
                            color="default" 
                            size="small" 
                          />
                        )}
                      </TableCell>
                      <TableCell align="center">
                        <IconButton 
                          color="error" 
                          size="small"
                          onClick={() => handleDeleteVoter(voter.cccd)}
                          title="Xóa cử tri"
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        ) : (
          <Alert severity="info">
            Chưa có cử tri nào trong hệ thống. Cử tri sẽ được thêm khi họ đăng ký tài khoản.
          </Alert>
        )}
      </Paper>
    );
  };

  // Thêm hàm để xử lý hoàn thành cuộc bầu cử
  const handleMarkCompleted = (electionId) => {
    try {
      // Chuyển đổi id sang string để đảm bảo so sánh đúng
      const idStr = electionId.toString();
      
      // Tìm cuộc bầu cử
      const election = elections.find(e => e.id.toString() === idStr);
      if (!election) {
        showSnackbar('Không tìm thấy cuộc bầu cử', 'error');
        return;
      }
      
      // Kiểm tra trạng thái
      const status = getElectionStatus(election);
      if (status !== 'active' && status !== 'upcoming') {
        showSnackbar('Chỉ có thể đánh dấu hoàn thành cho các cuộc bầu cử đang diễn ra hoặc sắp diễn ra', 'error');
        return;
      }
      
      // Xác nhận
      if (!window.confirm(`Bạn có chắc chắn muốn kết thúc cuộc bầu cử "${election.title}"?`)) {
        return;
      }
      
      // Cập nhật trạng thái hoàn thành
      const updatedElection = {
        ...election,
        isCompleted: true,
        status: 'completed'
      };
      
      // Cập nhật danh sách
      const updatedElections = elections.map(e => 
        e.id.toString() === idStr ? updatedElection : e
      );
      
      // Lưu vào localStorage
      localStorage.setItem('elections', JSON.stringify(updatedElections));
      setElections(updatedElections);
      
      // Tạo phiếu bầu mẫu nếu chưa có
      const votesKey = `votes_${idStr}`;
      const storedVotes = localStorage.getItem(votesKey);
      if (!storedVotes || JSON.parse(storedVotes).length === 0) {
        createSampleVotesForElection(idStr);
      }
      
      showSnackbar(`Đã kết thúc cuộc bầu cử "${election.title}"`, 'success');
      
      // Hiển thị kết quả
      handleViewResults(idStr);
    } catch (error) {
      console.error('Lỗi khi đánh dấu hoàn thành cuộc bầu cử:', error);
      showSnackbar('Đã xảy ra lỗi khi đánh dấu hoàn thành cuộc bầu cử', 'error');
    }
  };
  
  // Hàm tạo dữ liệu phiếu bầu mẫu cho cuộc bầu cử đã kết thúc
  const createSampleVotesForElection = (electionId) => {
    try {
      // Kiểm tra xem đã có dữ liệu votes cho cuộc bầu cử này chưa
      const existingVotes = localStorage.getItem(`votes_${electionId}`);
      if (existingVotes) {
        console.log(`Votes already exist for election ${electionId}:`, JSON.parse(existingVotes));
        return; // Không tạo lại nếu đã có
      }
      
      // Lấy các ứng cử viên thuộc cuộc bầu cử này
      const electionCandidates = candidates.filter(c => c.electionId === electionId);
      if (electionCandidates.length === 0) {
        console.log(`No candidates found for election ${electionId}`);
        return;
      }
      
      // Tạo dữ liệu phiếu bầu ngẫu nhiên
      const sampleVotes = {};
      const totalVoters = Math.floor(Math.random() * 50) + 20; // Từ 20-70 cử tri
      let remainingVoters = totalVoters;
      
      // Phân phối số phiếu cho các ứng cử viên
      for (let i = 0; i < electionCandidates.length; i++) {
        const candidate = electionCandidates[i];
        
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
      
      // Lưu vào localStorage
      localStorage.setItem(`votes_${electionId}`, JSON.stringify(sampleVotes));
      // Đánh dấu là đã hiển thị kết quả để trang chi tiết biết hiển thị kết quả
      localStorage.setItem(`showResults_${electionId}`, 'true');
      
      console.log(`Created sample votes for election ${electionId}:`, sampleVotes);
    } catch (error) {
      console.error('Error creating sample votes:', error);
    }
  };

  // Thêm hàm xem chi tiết ứng cử viên
  const handleViewCandidate = (candidate) => {
    if (!candidate || !candidate.id) {
      console.error('Invalid candidate data for viewing:', candidate);
      showSnackbar('Dữ liệu ứng cử viên không hợp lệ', 'error');
      return;
    }
    
    // Lưu ứng cử viên được chọn
    setSelectedCandidate(candidate);
    
    // Mở dialog xem chi tiết
    setOpenViewCandidateDialog(true);
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Quản lý Hệ thống Bầu cử
        </Typography>
        <Divider />
        </Box>

      <Paper sx={{ mb: 4 }}>
        <Tabs 
          value={viewMode} 
          onChange={(e, newValue) => handleViewModeChange(newValue)}
          variant="fullWidth"
        >
          <Tab 
            label="Cuộc bầu cử" 
            value="elections" 
            icon={<HowToVoteIcon />} 
            iconPosition="start" 
          />
          <Tab 
            label="Ứng cử viên" 
            value="candidates" 
            icon={<PeopleAltIcon />} 
            iconPosition="start"
          />
          <Tab 
            label="Cử tri" 
            value="voters" 
            icon={<HowToVoteIcon />} 
            iconPosition="start"
          />
          <Tab 
            label="Quản lý Admin" 
            value="admins" 
            icon={<PersonAddIcon />} 
            iconPosition="start"
          />
        </Tabs>
      </Paper>

      {/* Nội dung dựa vào tab đang chọn */}
      {renderContent()}

      {/* Dialog tạo cuộc bầu cử */}
      <Dialog 
        open={openElectionDialog} 
        onClose={() => setOpenElectionDialog(false)}
        fullWidth
        maxWidth="sm"
      >
        <NewElectionDialog
          open={openElectionDialog}
          onClose={() => setOpenElectionDialog(false)}
          onSave={handleCreateElection}
        />
      </Dialog>

      {/* Dialog thêm ứng cử viên */}
      <Dialog open={openCandidateDialog} onClose={() => setOpenCandidateDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Thêm ứng cử viên mới</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            Nhập thông tin ứng cử viên cho cuộc bầu cử: {elections.find(e => e.id === selectedElection)?.title}
          </DialogContentText>
          
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
          <TextField
                label="Họ và tên"
            fullWidth
                required
            value={candidateFormData.name}
                onChange={(e) => setCandidateFormData({...candidateFormData, name: e.target.value})}
            margin="normal"
                error={error.includes('tên')}
              />
              
          <TextField
            label="Quê quán"
            fullWidth
            value={candidateFormData.hometown}
                onChange={(e) => setCandidateFormData({...candidateFormData, hometown: e.target.value})}
            margin="normal"
          />
              
          <TextField
                label="Chức vụ/Vị trí"
            fullWidth
            value={candidateFormData.position}
                onChange={(e) => setCandidateFormData({...candidateFormData, position: e.target.value})}
            margin="normal"
          />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="Ngày sinh"
                  value={candidateFormData.birthDate}
                  onChange={(newValue) => setCandidateFormData({ ...candidateFormData, birthDate: newValue })}
                  slotProps={{ textField: { fullWidth: true, margin: "normal" } }}
                />
              </LocalizationProvider>
              
          <TextField
                label="Thành tựu"
            fullWidth
            value={candidateFormData.achievements}
                onChange={(e) => setCandidateFormData({...candidateFormData, achievements: e.target.value})}
            margin="normal"
            multiline
                rows={2}
          />
              
          <TextField
                label="Phương châm"
            fullWidth
            value={candidateFormData.motto}
                onChange={(e) => setCandidateFormData({...candidateFormData, motto: e.target.value})}
            margin="normal"
          />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                label="Mô tả"
                fullWidth
                multiline
                rows={3}
                value={candidateFormData.description || ''}
                onChange={(e) => setCandidateFormData({...candidateFormData, description: e.target.value})}
                margin="normal"
              />
            </Grid>
            
            <Grid item xs={12}>
              <Typography variant="subtitle1" sx={{ mb: 1 }}>
                Ảnh đại diện
              </Typography>
            <ImageUpload
              value={candidateFormData.imageUrl}
                onChange={(url) => setCandidateFormData({...candidateFormData, imageUrl: url})}
              />
            </Grid>
          </Grid>
          
          {error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenCandidateDialog(false)}>Hủy</Button>
          <Button 
            variant="contained" 
            onClick={handleSaveCandidate}
            disabled={creating}
          >
            {creating ? 'Đang lưu...' : 'Lưu ứng cử viên'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog sửa thông tin ứng cử viên */}
      <Dialog
        open={openEditCandidateDialog}
        onClose={() => setOpenEditCandidateDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Sửa thông tin ứng cử viên</DialogTitle>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Họ và tên ứng cử viên"
                variant="outlined"
                margin="normal"
                value={candidateFormData.name}
                onChange={(e) => setCandidateFormData({ ...candidateFormData, name: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                label="Ngày sinh"
                value={candidateFormData.birthDate}
                onChange={(newValue) => setCandidateFormData({ ...candidateFormData, birthDate: newValue })}
                  slotProps={{ textField: { fullWidth: true, margin: "normal" } }}
              />
              </LocalizationProvider>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Quê quán"
                variant="outlined"
                margin="normal"
                value={candidateFormData.hometown}
                onChange={(e) => setCandidateFormData({ ...candidateFormData, hometown: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Chức vụ"
                variant="outlined"
                margin="normal"
                value={candidateFormData.position}
                onChange={(e) => setCandidateFormData({ ...candidateFormData, position: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Mô tả"
                variant="outlined"
                margin="normal"
                multiline
                rows={3}
                value={candidateFormData.description || ''}
                onChange={(e) => setCandidateFormData({ ...candidateFormData, description: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Thành tích"
                variant="outlined"
                margin="normal"
                multiline
                rows={3}
                value={candidateFormData.achievements}
                onChange={(e) => setCandidateFormData({ ...candidateFormData, achievements: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Phương châm"
                variant="outlined"
                margin="normal"
                value={candidateFormData.motto}
                onChange={(e) => setCandidateFormData({ ...candidateFormData, motto: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom sx={{ mt: 2 }}>
                Ảnh ứng cử viên
              </Typography>
              <ImageUpload
                value={candidateFormData.imageUrl}
                onChange={(url) => setCandidateFormData({ ...candidateFormData, imageUrl: url })}
                label="Ảnh ứng cử viên"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setOpenEditCandidateDialog(false)}
            color="inherit"
          >
            Hủy
          </Button>
          <LoadingButton
            loading={creating}
            onClick={handleUpdateCandidate}
            variant="contained"
          >
            Cập nhật
          </LoadingButton>
        </DialogActions>
      </Dialog>

      {/* Dialog thêm admin mới */}
      <Dialog open={openAddAdminDialog} onClose={() => setOpenAddAdminDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Thêm quản trị viên mới</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
          <TextField
              label="Họ tên"
            fullWidth
            required
              value={adminFormData.name}
              onChange={(e) => setAdminFormData({...adminFormData, name: e.target.value})}
              margin="normal"
          />
          <TextField
              label="CCCD/CMND"
            fullWidth
            required
              value={adminFormData.cccd}
              onChange={(e) => setAdminFormData({...adminFormData, cccd: e.target.value})}
              margin="normal"
          />
          <TextField
            label="Email"
              fullWidth
              required
            type="email"
            value={adminFormData.email}
              onChange={(e) => setAdminFormData({...adminFormData, email: e.target.value})}
              margin="normal"
          />
          <TextField
            label="Mật khẩu"
              fullWidth
              required
            type="password"
            value={adminFormData.password}
              onChange={(e) => setAdminFormData({...adminFormData, password: e.target.value})}
              margin="normal"
            />
            {error && (
              <Alert severity="error" sx={{ mt: 2 }}>
                {error}
              </Alert>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenAddAdminDialog(false)}>Hủy</Button>
          <Button 
            variant="contained"
            onClick={handleAddAdmin}
            disabled={creating}
          >
            {creating ? 'Đang thêm...' : 'Thêm admin'}
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
            <DialogTitle>
              Thông tin chi tiết ứng cử viên
              <IconButton
                aria-label="close"
                onClick={() => setOpenViewCandidateDialog(false)}
                sx={{
                  position: 'absolute',
                  right: 8,
                  top: 8,
                }}
              >
                <CloseIcon />
              </IconButton>
            </DialogTitle>
            <DialogContent dividers>
              <Grid container spacing={3}>
                <Grid item xs={12} md={4}>
                  {selectedCandidate.imageUrl ? (
                    <Box
                      component="img"
                      src={selectedCandidate.imageUrl}
                      alt={selectedCandidate.name}
                      sx={{
                        width: '100%',
                        borderRadius: 2,
                        maxHeight: 300,
                        objectFit: 'cover',
                      }}
                    />
                  ) : (
                    <Box
                      sx={{
                        width: '100%',
                        height: 200,
                        bgcolor: 'grey.200',
                        borderRadius: 2,
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                      }}
                    >
                      <Typography color="text.secondary">Không có ảnh</Typography>
                    </Box>
                  )}
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
                    
                    <Grid item xs={12}>
                      <Typography variant="body2" sx={{ mt: 1 }}>
                        <strong>Cuộc bầu cử:</strong> {
                          elections.find(e => e.id === selectedCandidate.electionId)?.title || 'Không xác định'
                        }
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
        </DialogActions>
          </>
        )}
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={hideSnackbar}
        message={snackbar.message}
      />
    </Container>
  );
}

export default AdminDashboard; 