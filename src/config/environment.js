const config = {
  // API Configuration
  api: {
    baseUrl: process.env.REACT_APP_API_URL || 'http://localhost:5000',
    timeout: parseInt(process.env.REACT_APP_API_TIMEOUT) || 10000,
  },

  // Blockchain Configuration
  blockchain: {
    contractAddress: process.env.REACT_APP_CONTRACT_ADDRESS || 'your_smart_contract_address_here',
    chainId: process.env.REACT_APP_CHAIN_ID || '31337', // Hardhat localhost
    rpcUrl: process.env.REACT_APP_RPC_URL || 'http://localhost:8545',
  },

  // Dialogflow Configuration
  dialogflow: {
    projectId: process.env.REACT_APP_DIALOGFLOW_PROJECT_ID || 'voting-9xfa',
    apiEndpoint: process.env.REACT_APP_DIALOGFLOW_ENDPOINT || 'https://dialogflow.googleapis.com/v2',
    accessToken: process.env.REACT_APP_DIALOGFLOW_TOKEN || '',
  },

  // reCAPTCHA Configuration
  recaptcha: {
    siteKey: process.env.REACT_APP_RECAPTCHA_SITE_KEY || 'your_recaptcha_site_key_here',
  },

  // App Configuration
  app: {
    name: 'Voting System',
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development',
  },

  // Feature Flags
  features: {
    enableChatbot: process.env.REACT_APP_ENABLE_CHATBOT === 'true',
    enableBlockchain: process.env.REACT_APP_ENABLE_BLOCKCHAIN === 'true',
    enableRecaptcha: process.env.REACT_APP_ENABLE_RECAPTCHA === 'true',
  },

  // Validation Rules
  validation: {
    cccdLength: 12,
    passwordMinLength: 6,
    emailRegex: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    cccdRegex: /^[0-9]{12}$/,
  },

  // Local Storage Keys
  storage: {
    jwtToken: 'jwt',
    userRole: 'userRole',
    voterCCCD: 'voterCCCD',
    adminCCCD: 'adminCCCD',
    userName: 'userName',
    walletAddress: 'walletAddress',
    isAdmin: 'isAdmin',
    isVoter: 'isVoter',
    isSuperAdmin: 'isSuperAdmin',
  },

  // Error Messages
  errors: {
    networkError: 'Lỗi kết nối mạng. Vui lòng kiểm tra kết nối internet.',
    serverError: 'Lỗi server. Vui lòng thử lại sau.',
    unauthorized: 'Bạn không có quyền truy cập.',
    notFound: 'Không tìm thấy dữ liệu.',
    validationError: 'Dữ liệu không hợp lệ.',
    duplicateEntry: 'Dữ liệu đã tồn tại.',
  },

  // Success Messages
  success: {
    loginSuccess: 'Đăng nhập thành công',
    registerSuccess: 'Đăng ký thành công',
    createSuccess: 'Tạo thành công',
    updateSuccess: 'Cập nhật thành công',
    deleteSuccess: 'Xóa thành công',
    voteSuccess: 'Bỏ phiếu thành công',
  },
};

// Validation
const requiredEnvVars = ['REACT_APP_CONTRACT_ADDRESS'];
const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingVars.length > 0) {
  console.warn(`⚠️  Warning: Missing environment variables: ${missingVars.join(', ')}`);
  if (config.app.environment === 'production') {
    console.error('❌ Production environment requires all environment variables to be set');
  }
}

export default config;
