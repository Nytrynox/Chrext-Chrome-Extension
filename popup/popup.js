// Popup JavaScript - Job Copilot

const API_URL = 'http://localhost:3000';

// DOM Elements
const elements = {
  uploadArea: document.getElementById('uploadArea'),
  resumeInput: document.getElementById('resumeInput'),
  browseBtn: document.getElementById('browseBtn'),
  resumeInfo: document.getElementById('resumeInfo'),
  resumeName: document.getElementById('resumeName'),
  resumeStatus: document.getElementById('resumeStatus'),
  deleteResume: document.getElementById('deleteResume'),
  analyzeBtn: document.getElementById('analyzeBtn'),
  resultsSection: document.getElementById('resultsSection'),
  resumeSection: document.getElementById('resumeSection'),
  analyzeSection: document.getElementById('analyzeSection'),
  loadingState: document.getElementById('loadingState'),
  errorState: document.getElementById('errorState'),
  scoreValue: document.getElementById('scoreValue'),
  scoreRing: document.getElementById('scoreRing'),
  verdictBadge: document.getElementById('verdictBadge'),
  verdictText: document.getElementById('verdictText'),
  jobTitle: document.getElementById('jobTitle'),
  jobCompany: document.getElementById('jobCompany'),
  reasoningText: document.getElementById('reasoningText'),
  matchedSkills: document.getElementById('matchedSkills'),
  brutalFeedback: document.getElementById('brutalFeedback'),
  reqYears: document.getElementById('reqYears'),
  yourYears: document.getElementById('yourYears'),
  gapYears: document.getElementById('gapYears'),
  atsProgress: document.getElementById('atsProgress'),
  atsText: document.getElementById('atsText'),
  missingSkills: document.getElementById('missingSkills'),
  helpApplyBtn: document.getElementById('helpApplyBtn'),
  upgradeBtn: document.getElementById('upgradeBtn'),
  settingsBtn: document.getElementById('settingsBtn'),
  retryBtn: document.getElementById('retryBtn'),
  usageText: document.getElementById('usageText')
};

// Initialize
document.addEventListener('DOMContentLoaded', init);

async function init() {
  setupEventListeners();
  await loadSavedResume();
  setupTabs();
}

function setupEventListeners() {
  // Upload area
  elements.uploadArea?.addEventListener('click', () => elements.resumeInput?.click());
  elements.browseBtn?.addEventListener('click', (e) => {
    e.stopPropagation();
    elements.resumeInput?.click();
  });
  elements.resumeInput?.addEventListener('change', handleFileSelect);
  elements.deleteResume?.addEventListener('click', deleteResume);
  
  // Drag and drop
  elements.uploadArea?.addEventListener('dragover', (e) => {
    e.preventDefault();
    elements.uploadArea.style.borderColor = '#6366f1';
  });
  elements.uploadArea?.addEventListener('dragleave', () => {
    elements.uploadArea.style.borderColor = '';
  });
  elements.uploadArea?.addEventListener('drop', handleDrop);
  
  // Analyze
  elements.analyzeBtn?.addEventListener('click', analyzeJob);
  elements.retryBtn?.addEventListener('click', analyzeJob);
  
  // Help apply
  elements.helpApplyBtn?.addEventListener('click', helpApply);
  
  // Footer
  elements.upgradeBtn?.addEventListener('click', openPricing);
  elements.settingsBtn?.addEventListener('click', openSettings);
}

function setupTabs() {
  document.querySelectorAll('.tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
      document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
      tab.classList.add('active');
      document.getElementById(tab.dataset.tab)?.classList.add('active');
    });
  });
}

// File Handling
function handleDrop(e) {
  e.preventDefault();
  elements.uploadArea.style.borderColor = '';
  const file = e.dataTransfer?.files[0];
  if (file && file.type === 'application/pdf') {
    processFile(file);
  }
}

function handleFileSelect(e) {
  const file = e.target?.files?.[0];
  if (file) processFile(file);
}

async function processFile(file) {
  if (file.type !== 'application/pdf') {
    showError('Invalid File', 'Please upload a PDF file');
    return;
  }

  try {
    showLoading();
    
    const base64 = await fileToBase64(file);
    
    const response = await fetch(`${API_URL}/api/resume/parse`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        filename: file.name,
        content: base64
      })
    });

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error || 'Upload failed');
    }

    const data = await response.json();
    
    await chrome.storage.local.set({
      resume_id: data.resume_id,
      resume_data: data.resume,
      resume_name: file.name
    });

    showResumeInfo(file.name);
    elements.analyzeBtn.disabled = false;
    hideLoading();
    
  } catch (error) {
    console.error('Upload error:', error);
    showError('Upload Failed', error.message || 'Could not process resume');
  }
}

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

async function loadSavedResume() {
  const data = await chrome.storage.local.get(['resume_data', 'resume_name']);
  if (data.resume_data) {
    showResumeInfo(data.resume_name || 'resume.pdf');
    elements.analyzeBtn.disabled = false;
  }
}

function showResumeInfo(filename) {
  elements.uploadArea?.classList.add('hidden');
  elements.resumeInfo?.classList.remove('hidden');
  elements.resumeName.textContent = filename;
  elements.resumeStatus.textContent = 'Ready';
}

async function deleteResume() {
  await chrome.storage.local.remove(['resume_id', 'resume_data', 'resume_name']);
  elements.uploadArea?.classList.remove('hidden');
  elements.resumeInfo?.classList.add('hidden');
  elements.analyzeBtn.disabled = true;
  elements.resultsSection?.classList.add('hidden');
}

// Job Analysis
async function analyzeJob() {
  try {
    showLoading();
    hideError();
    
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    // Get job data from content script
    const jobData = await chrome.tabs.sendMessage(tab.id, { type: 'ANALYZE_JOB' });
    
    if (!jobData || !jobData.description) {
      throw new Error('No job posting detected on this page');
    }

    const resumeData = (await chrome.storage.local.get('resume_data')).resume_data;
    
    if (!resumeData) {
      throw new Error('Please upload your resume first');
    }

    const response = await fetch(`${API_URL}/api/job/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        resume_data: resumeData,
        job_data: jobData
      })
    });

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error || 'Analysis failed');
    }

    const result = await response.json();
    displayResults(result, jobData);
    
  } catch (error) {
    console.error('Analysis error:', error);
    showError('Analysis Failed', error.message);
  }
}

function displayResults(result, jobData) {
  hideLoading();
  elements.resultsSection?.classList.remove('hidden');
  elements.resumeSection?.classList.add('hidden');
  elements.analyzeSection?.classList.add('hidden');

  // Score
  const score = result.match_score || 0;
  elements.scoreValue.textContent = `${score}%`;
  
  const circumference = 2 * Math.PI * 45;
  const offset = circumference - (score / 100) * circumference;
  elements.scoreRing.style.strokeDashoffset = offset;

  // Verdict
  const verdict = result.verdict || 'SKIP';
  elements.verdictText.textContent = verdict.replace('_', ' ');
  elements.verdictBadge.className = 'verdict-badge';
  if (verdict === 'APPLY') elements.verdictBadge.classList.add('apply');
  else if (verdict === 'APPLY_WITH_CHANGES') elements.verdictBadge.classList.add('changes');
  else elements.verdictBadge.classList.add('skip');

  // Job info
  elements.jobTitle.textContent = jobData.title || 'Unknown Position';
  elements.jobCompany.textContent = jobData.company || 'Unknown Company';

  // Reasoning
  elements.reasoningText.textContent = result.verdict_reasoning || 'No analysis available';

  // Matched skills
  const matchedSkills = result.skill_breakdown?.matched || [];
  elements.matchedSkills.innerHTML = matchedSkills
    .map(skill => `<span class="tag matched">${skill}</span>`)
    .join('');

  // Missing skills
  const missingSkills = result.skill_breakdown?.missing || [];
  elements.missingSkills.innerHTML = missingSkills
    .map(skill => `<span class="tag missing">${skill}</span>`)
    .join('');

  // Experience
  elements.reqYears.textContent = `${result.experience_gap?.required || 0} years`;
  elements.yourYears.textContent = `${result.experience_gap?.candidate || 0} years`;
  elements.gapYears.textContent = `${result.experience_gap?.gap || 0} years`;

  // ATS
  const atsMatch = result.ats_keyword_match || 0;
  elements.atsProgress.style.width = `${atsMatch}%`;
  elements.atsText.textContent = `${atsMatch}%`;

  // Feedback
  const feedback = result.brutal_feedback || [];
  elements.brutalFeedback.innerHTML = feedback.map(item => `
    <div class="feedback-item ${item.impact || ''}">
      <div class="feedback-issue">${item.issue || ''}</div>
      <div class="feedback-suggestion">${item.suggestion || ''}</div>
    </div>
  `).join('');
}

// Help Apply
async function helpApply() {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    const resumeData = (await chrome.storage.local.get('resume_data')).resume_data;
    
    await chrome.tabs.sendMessage(tab.id, {
      type: 'AUTOFILL_FORM',
      resumeData: resumeData
    });
    
  } catch (error) {
    console.error('Autofill error:', error);
  }
}

// UI States
function showLoading() {
  elements.loadingState?.classList.remove('hidden');
  elements.errorState?.classList.add('hidden');
  elements.resultsSection?.classList.add('hidden');
}

function hideLoading() {
  elements.loadingState?.classList.add('hidden');
}

function showError(title, message) {
  hideLoading();
  elements.errorState?.classList.remove('hidden');
  document.getElementById('errorTitle').textContent = title;
  document.getElementById('errorMessage').textContent = message;
}

function hideError() {
  elements.errorState?.classList.add('hidden');
}

// Navigation
function openPricing() {
  // Open pricing page where user can select a plan
  chrome.tabs.create({ url: 'http://localhost:3000/api/payment/pricing' });
}

function openSettings() {
  // Settings panel - future feature
  console.log('Settings clicked');
}
