import { useState, useCallback } from 'react';

const useRateLimit = () => {
  const [rateLimitInfo, setRateLimitInfo] = useState({ 
    open: false, 
    message: '', 
    code: '', 
    retryAfter: null 
  });

  const showRateLimitInfo = useCallback((message, code, retryAfter = null) => {
    setRateLimitInfo({ open: true, message, code, retryAfter });
  }, []);

  const hideRateLimitInfo = useCallback(() => {
    setRateLimitInfo({ ...rateLimitInfo, open: false });
  }, [rateLimitInfo]);

  const handleRateLimitError = useCallback((error, customMessage = null) => {
    if (error.response?.status === 429) {
      const rateLimitData = error.response.data;
      const message = customMessage || rateLimitData?.error || 'Quá nhiều yêu cầu, vui lòng thử lại sau';
      const code = rateLimitData?.code || 'RATE_LIMIT_EXCEEDED';
      const retryAfter = error.response.headers['retry-after'];
      
      showRateLimitInfo(message, code, retryAfter);
      return true; // Return true to indicate rate limit was handled
    }
    return false; // Return false to indicate no rate limit
  }, [showRateLimitInfo]);

  return {
    rateLimitInfo,
    showRateLimitInfo,
    hideRateLimitInfo,
    handleRateLimitError
  };
};

export default useRateLimit;
