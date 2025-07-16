/**
 * Format số điện thoại Việt Nam theo chuẩn quốc tế
 * @param {string} phoneNumber - Số điện thoại cần format
 * @returns {string} - Số điện thoại đã được format
 */
export const formatVietnamesePhoneNumber = (phoneNumber) => {
  if (!phoneNumber) return "Không có";

  // Loại bỏ tất cả ký tự không phải số
  const cleaned = phoneNumber.replace(/\D/g, "");

  // Kiểm tra nếu là số điện thoại Việt Nam hợp lệ
  if (cleaned.length === 10) {
    // Format: 0xx xxx xxxx
    return cleaned.replace(/(\d{3})(\d{3})(\d{4})/, "$1 $2 $3");
  } else if (cleaned.length === 11 && cleaned.startsWith("84")) {
    // Format: +84 xx xxx xxxx
    const without84 = cleaned.substring(2);
    return `+84 ${without84.replace(/(\d{2})(\d{3})(\d{4})/, "$1 $2 $3")}`;
  } else if (cleaned.length === 11 && cleaned.startsWith("0")) {
    // Format: 0xx xxx xxxx
    return cleaned.replace(/(\d{3})(\d{3})(\d{4})/, "$1 $2 $3");
  }

  // Nếu không match format nào, trả về số gốc
  return phoneNumber;
};

/**
 * Kiểm tra số điện thoại Việt Nam có hợp lệ không
 * @param {string} phoneNumber - Số điện thoại cần kiểm tra
 * @returns {boolean} - true nếu hợp lệ, false nếu không
 */
export const isValidVietnamesePhoneNumber = (phoneNumber) => {
  if (!phoneNumber) return false;

  // Loại bỏ tất cả ký tự không phải số
  const cleaned = phoneNumber.replace(/\D/g, "");

  // Kiểm tra các pattern số điện thoại Việt Nam
  const patterns = [
    /^0[3-9]\d{8}$/, // 0xx xxx xxxx
    /^84[3-9]\d{8}$/, // 84xx xxx xxxx
    /^\+84[3-9]\d{8}$/, // +84xx xxx xxxx
  ];

  return patterns.some((pattern) => pattern.test(cleaned));
};

/**
 * Chuẩn hóa số điện thoại về định dạng quốc tế (+84)
 * @param {string} phoneNumber - Số điện thoại cần chuẩn hóa
 * @returns {string} - Số điện thoại đã chuẩn hóa
 */
export const normalizeVietnamesePhoneNumber = (phoneNumber) => {
  if (!phoneNumber) return null;

  // Loại bỏ tất cả ký tự không phải số
  const cleaned = phoneNumber.replace(/\D/g, "");

  if (cleaned.length === 10 && cleaned.startsWith("0")) {
    // Chuyển 0xx xxx xxxx thành +84xx xxx xxxx
    return `+84${cleaned.substring(1)}`;
  } else if (cleaned.length === 11 && cleaned.startsWith("84")) {
    // Đã là định dạng quốc tế
    return `+${cleaned}`;
  }

  return null;
};
