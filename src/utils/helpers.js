import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

/**
 * Format ngày tháng theo định dạng tiếng Việt
 * @param {string | Date} date - Ngày cần format
 * @returns {string} - Ngày đã format
 */
export const formatDate = (date) => {
  if (!date) return 'Không xác định';
  
  try {
    const dateObj = new Date(date);
    
    // Kiểm tra xem dateObj có phải là ngày hợp lệ hay không
    if (isNaN(dateObj.getTime())) {
      return 'Không xác định';
    }
    
    return new Intl.DateTimeFormat('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(dateObj);
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Không xác định';
  }
};

// Hàm định dạng số phiếu bầu
export const formatVoteCount = (count) => {
  if (count === undefined || count === null) return '0';
  
  return count.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}; 