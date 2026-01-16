// Indeed Job Page Parser

console.log('Job Copilot: Indeed parser loaded');

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'ANALYZE_JOB') {
    const jobData = extractJobData();
    sendResponse(jobData);
    return true;
  }
  
  if (message.type === 'AUTOFILL_FORM') {
    autofillApplication(message.resumeData);
    sendResponse({ success: true });
    return true;
  }
});

function extractJobData() {
  try {
    const titleEl = document.querySelector('.jobsearch-JobInfoHeader-title, h1[data-testid="jobsearch-JobInfoHeader-title"]');
    const title = titleEl?.textContent?.trim() || '';
    
    const companyEl = document.querySelector('[data-testid="inlineHeader-companyName"], .jobsearch-InlineCompanyRating-companyHeader');
    const company = companyEl?.textContent?.trim() || '';
    
    const locationEl = document.querySelector('[data-testid="job-location"], .jobsearch-JobInfoHeader-subtitle > div');
    const location = locationEl?.textContent?.trim() || '';
    
    const descEl = document.querySelector('#jobDescriptionText, .jobsearch-jobDescriptionText');
    const description = descEl?.textContent?.trim() || '';
    
    if (!description) {
      return null;
    }
    
    return {
      platform: 'indeed',
      title,
      company,
      location,
      description,
      url: window.location.href
    };
    
  } catch (error) {
    console.error('Job Copilot: Error extracting job data:', error);
    return null;
  }
}

function autofillApplication(resumeData) {
  const applyBtn = document.querySelector('.jobsearch-IndeedApplyButton-newDesign, #indeedApplyButton');
  if (applyBtn) {
    applyBtn.style.border = '3px solid #6366f1';
    showNotification('Ready to assist', 'Click Apply and form will be pre-filled');
  }
}

function showNotification(title, message) {
  const notification = document.createElement('div');
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: #6366f1;
    color: white;
    padding: 16px 20px;
    border-radius: 8px;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
    z-index: 999999;
    font-family: -apple-system, BlinkMacSystemFont, sans-serif;
    max-width: 280px;
  `;
  
  notification.innerHTML = `
    <div style="font-weight: 600; margin-bottom: 4px;">${title}</div>
    <div style="font-size: 13px; opacity: 0.9;">${message}</div>
  `;
  
  document.body.appendChild(notification);
  setTimeout(() => notification.remove(), 4000);
}
