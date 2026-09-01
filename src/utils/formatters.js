/**
 * Format number to Indonesian Rupiah currency safely
 * @param {number|string} amount 
 * @param {Object} options 
 * @returns {string}
 */
export const formatRupiah = (amount, { showPrefix = true, showSign = false, type = 'expense' } = {}) => {
  const num = Number(amount);
  const safeNum = isNaN(num) ? 0 : num;
  const absoluteValue = Math.abs(safeNum);

  let formatted = '0';
  try {
    formatted = new Intl.NumberFormat('id-ID', {
      style: 'decimal',
      maximumFractionDigits: 0,
    }).format(absoluteValue);
  } catch (e) {
    formatted = String(Math.round(absoluteValue));
  }

  const prefix = showPrefix ? 'Rp ' : '';
  
  if (showSign) {
    const sign = type === 'income' ? '+ ' : '- ';
    return `${sign}${prefix}${formatted}`;
  }
  
  return `${prefix}${formatted}`;
};

/**
 * Format a raw number or input string with thousands dot separators (e.g. 50000 -> "50.000")
 * @param {string|number} value 
 * @returns {string}
 */
export const formatNumberWithDots = (value) => {
  if (value === null || value === undefined || value === '') return '';
  const cleanNum = String(value).replace(/\D/g, '');
  if (!cleanNum) return '';
  return cleanNum.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
};

/**
 * Parse a dot-formatted string back to a clean number (e.g. "50.000" -> 50000)
 * @param {string|number} value 
 * @returns {number}
 */
export const parseNumberFromDots = (value) => {
  if (value === null || value === undefined || value === '') return 0;
  if (typeof value === 'number') return isNaN(value) ? 0 : value;
  const clean = String(value).replace(/\D/g, '');
  return parseInt(clean, 10) || 0;
};

/**
 * Format date to full Indonesian formatted date string safely
 * @param {Date|string} date 
 * @returns {string}
 */
export const formatIndonesianDate = (date = new Date()) => {
  try {
    let dateObj = date;
    if (typeof date === 'string' || typeof date === 'number') {
      dateObj = new Date(date);
    }
    if (!dateObj || isNaN(dateObj.getTime())) {
      dateObj = new Date();
    }
    return new Intl.DateTimeFormat('id-ID', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(dateObj);
  } catch (e) {
    return 'Hari Ini';
  }
};

/**
 * Format time to HH:mm WIB safely
 * @param {Date|string} date 
 * @returns {string}
 */
export const formatTime = (date = new Date()) => {
  try {
    let dateObj = date;
    if (typeof date === 'string' || typeof date === 'number') {
      dateObj = new Date(date);
    }
    if (!dateObj || isNaN(dateObj.getTime())) {
      dateObj = new Date();
    }
    const hours = String(dateObj.getHours()).padStart(2, '0');
    const minutes = String(dateObj.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes} WIB`;
  } catch (e) {
    return 'Baru saja';
  }
};

/**
 * Calculate remaining days in the current month from today (inclusive) safely
 * @param {Date|string} date 
 * @returns {number}
 */
export const getRemainingDaysInMonth = (date = new Date()) => {
  try {
    let now = date;
    if (typeof date === 'string' || typeof date === 'number') {
      now = new Date(date);
    }
    if (!now || isNaN(now.getTime())) {
      now = new Date();
    }
    const year = now.getFullYear();
    const month = now.getMonth(); // 0-indexed
    const lastDayDate = new Date(year, month + 1, 0).getDate();
    const currentDay = now.getDate();
    return Math.max(1, lastDayDate - currentDay + 1);
  } catch (e) {
    return 30;
  }
};
