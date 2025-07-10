/**
 * Format thời gian từ phút sang giờ/phút
 * @param {number} minutes - Số phút cần format
 * @returns {string} - Thời gian đã được format
 */
export const formatDuration = (minutes) => {
  if (!minutes || minutes <= 0) return "0 phút";

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  if (hours === 0) {
    // Chỉ có phút
    return `${minutes} phút`;
  } else if (remainingMinutes === 0) {
    // Chỉ có giờ (tròn giờ)
    return `${hours} giờ`;
  } else {
    // Có cả giờ và phút
    return `${hours} giờ ${remainingMinutes} phút`;
  }
};

/**
 * Format thời gian ngắn gọn (chỉ hiển thị đơn vị chính)
 * @param {number} minutes - Số phút cần format
 * @returns {string} - Thời gian đã được format ngắn gọn
 */
export const formatDurationShort = (minutes) => {
  if (!minutes || minutes <= 0) return "0p";

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  if (hours === 0) {
    // Chỉ có phút
    return `${minutes}p`;
  } else if (remainingMinutes === 0) {
    // Chỉ có giờ (tròn giờ)
    return `${hours}h`;
  } else {
    // Có cả giờ và phút
    return `${hours}h${remainingMinutes}p`;
  }
};

/**
 * Format thời gian với đơn vị tùy chỉnh
 * @param {number} minutes - Số phút cần format
 * @param {string} hourUnit - Đơn vị giờ (mặc định: "giờ")
 * @param {string} minuteUnit - Đơn vị phút (mặc định: "phút")
 * @returns {string} - Thời gian đã được format
 */
export const formatDurationCustom = (
  minutes,
  hourUnit = "giờ",
  minuteUnit = "phút"
) => {
  if (!minutes || minutes <= 0) return `0 ${minuteUnit}`;

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  if (hours === 0) {
    // Chỉ có phút
    return `${minutes} ${minuteUnit}`;
  } else if (remainingMinutes === 0) {
    // Chỉ có giờ (tròn giờ)
    return `${hours} ${hourUnit}`;
  } else {
    // Có cả giờ và phút
    return `${hours} ${hourUnit} ${remainingMinutes} ${minuteUnit}`;
  }
};
