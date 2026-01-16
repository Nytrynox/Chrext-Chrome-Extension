/**
 * Utility functions shared across the extension
 */

/**
 * Debounce function to limit rapid calls
 */
export function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Safely parse JSON with fallback
 */
export function safeJSONParse(str, fallback = null) {
  try {
    return JSON.parse(str);
  } catch (e) {
    console.error('Failed to parse JSON:', e);
    return fallback;
  }
}

/**
 * Clean text by removing extra whitespace
 */
export function cleanText(text) {
  if (!text) return '';
  return text.trim().replace(/\s+/g, ' ');
}

/**
 * Extract domain from URL
 */
export function getDomain(url) {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname;
  } catch (e) {
    return '';
  }
}

/**
 * Detect job platform from URL
 */
export function detectPlatform(url) {
  const domain = getDomain(url);
  
  if (domain.includes('linkedin.com')) return 'linkedin';
  if (domain.includes('indeed.com')) return 'indeed';
  if (domain.includes('greenhouse.io')) return 'greenhouse';
  if (domain.includes('lever.co')) return 'lever';
  
  return 'generic';
}

/**
 * Format date for display
 */
export function formatDate(date) {
  const options = { year: 'numeric', month: 'short', day: 'numeric' };
  return new Date(date).toLocaleDateString('en-US', options);
}

/**
 * Calculate percentage
 */
export function calculatePercentage(value, total) {
  if (total === 0) return 0;
  return Math.round((value / total) * 100);
}

/**
 * Clamp number between min and max
 */
export function clamp(num, min, max) {
  return Math.min(Math.max(num, min), max);
}

/**
 * Get verdict color for UI
 */
export function getVerdictColor(verdict) {
  const colors = {
    'APPLY': '#22c55e',
    'APPLY_WITH_CHANGES': '#f59e0b',
    'SKIP': '#ef4444'
  };
  return colors[verdict] || '#6b7280';
}

/**
 * Get score color based on value
 */
export function getScoreColor(score) {
  if (score >= 70) return '#22c55e';
  if (score >= 55) return '#f59e0b';
  return '#ef4444';
}

/**
 * Truncate text with ellipsis
 */
export function truncate(text, maxLength) {
  if (!text || text.length <= maxLength) return text;
  return text.substring(0, maxLength - 3) + '...';
}

/**
 * Generate unique ID
 */
export function generateId() {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Check if user is authenticated
 */
export async function isAuthenticated() {
  const { auth_token } = await chrome.storage.local.get('auth_token');
  return !!auth_token;
}

/**
 * Sleep/delay utility
 */
export function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Copy text to clipboard
 */
export async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (e) {
    console.error('Failed to copy:', e);
    return false;
  }
}

/**
 * Show notification
 */
export function showNotification(title, message, type = 'info') {
  chrome.notifications.create({
    type: 'basic',
    iconUrl: 'icons/icon48.png',
    title,
    message
  });
}

/**
 * Extract text content from HTML
 */
export function extractText(html) {
  const div = document.createElement('div');
  div.innerHTML = html;
  return cleanText(div.textContent || div.innerText || '');
}

/**
 * Validate email
 */
export function isValidEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

/**
 * Normalize skill name for matching
 */
export function normalizeSkill(skill) {
  return skill
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
    .trim();
}

/**
 * Count word occurrences in text
 */
export function countOccurrences(text, word) {
  const regex = new RegExp(`\\b${word}\\b`, 'gi');
  const matches = text.match(regex);
  return matches ? matches.length : 0;
}

/**
 * Format currency
 */
export function formatCurrency(amount) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount);
}

/**
 * Get time ago string
 */
export function timeAgo(date) {
  const seconds = Math.floor((new Date() - new Date(date)) / 1000);
  
  const intervals = {
    year: 31536000,
    month: 2592000,
    week: 604800,
    day: 86400,
    hour: 3600,
    minute: 60
  };
  
  for (const [unit, secondsInUnit] of Object.entries(intervals)) {
    const interval = Math.floor(seconds / secondsInUnit);
    if (interval >= 1) {
      return `${interval} ${unit}${interval === 1 ? '' : 's'} ago`;
    }
  }
  
  return 'just now';
}
