// API Configuration
export const API_BASE_URL = 'http://localhost:3000';

export const API_ENDPOINTS = {
  AUTH: {
    REGISTER: '/api/auth/register',
    LOGIN: '/api/auth/login',
    REFRESH: '/api/auth/refresh',
    ME: '/api/auth/me'
  },
  RESUME: {
    UPLOAD: '/api/resume/upload',
    GET: '/api/resume',
    UPDATE: '/api/resume',
    DELETE: '/api/resume',
    PARSE: '/api/resume/parse'
  },
  JOB: {
    ANALYZE: '/api/job/analyze',
    HISTORY: '/api/job/history'
  },
  APPLY: {
    AUTOFILL: '/api/apply/autofill',
    GENERATE_ANSWERS: '/api/apply/generate-answers'
  },
  USER: {
    USAGE: '/api/user/usage'
  },
  PAYMENT: {
    CHECKOUT: '/api/payment/checkout'
  }
};

// Storage Keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'auth_token',
  USER_DATA: 'user_data',
  RESUME_ID: 'resume_id',
  RESUME_DATA: 'resume_data',
  ANALYSIS_CACHE: 'analysis_cache',
  PREFERENCES: 'user_preferences'
};

// Tier Limits
export const TIER_LIMITS = {
  FREE: {
    ANALYSES_PER_WEEK: 5,
    AI_ANSWERS: false,
    COVER_LETTERS: false
  },
  PAID: {
    ANALYSES_PER_WEEK: Infinity,
    AI_ANSWERS: true,
    COVER_LETTERS: true
  }
};

// Match Score Thresholds
export const MATCH_THRESHOLDS = {
  MIN_SCORE: 35,
  MAX_SCORE: 85,
  APPLY: 70,
  APPLY_WITH_CHANGES: 55
};

// Verdict Types
export const VERDICTS = {
  APPLY: 'APPLY',
  APPLY_WITH_CHANGES: 'APPLY_WITH_CHANGES',
  SKIP: 'SKIP'
};

// Job Platforms
export const PLATFORMS = {
  LINKEDIN: 'linkedin',
  INDEED: 'indeed',
  GREENHOUSE: 'greenhouse',
  LEVER: 'lever',
  GENERIC: 'generic'
};

// Message Types (for extension messaging)
export const MESSAGE_TYPES = {
  ANALYZE_JOB: 'ANALYZE_JOB',
  GET_RESUME: 'GET_RESUME',
  AUTOFILL_FORM: 'AUTOFILL_FORM',
  GENERATE_ANSWER: 'GENERATE_ANSWER',
  PAGE_PARSED: 'PAGE_PARSED',
  UPDATE_BADGE: 'UPDATE_BADGE'
};

// Error Messages
export const ERROR_MESSAGES = {
  NO_RESUME: 'Please upload your resume first',
  NO_JOB_DETECTED: 'No job posting detected on this page',
  RATE_LIMIT: 'You\'ve reached your weekly limit. Upgrade to continue.',
  API_ERROR: 'Something went wrong. Please try again.',
  AUTH_REQUIRED: 'Please sign in to continue',
  INVALID_PAGE: 'This doesn\'t appear to be a job posting page'
};

// UI Constants
export const UI = {
  ANIMATION_DURATION: 300,
  DEBOUNCE_DELAY: 500,
  CACHE_DURATION: 24 * 60 * 60 * 1000
};
