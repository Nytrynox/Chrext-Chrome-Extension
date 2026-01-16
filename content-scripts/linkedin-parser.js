// LinkedIn Job Page Parser

console.log('Job Copilot: LinkedIn parser loaded');

// Listen for messages
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
    const titleEl = document.querySelector('.job-details-jobs-unified-top-card__job-title, .jobs-details-top-card__job-title, .jobs-unified-top-card__job-title, h1[data-test-job-title], h1.top-card-layout__title, h1.t-24');
    const title = titleEl?.textContent?.trim() || '';
    
    const companyEl = document.querySelector('.job-details-jobs-unified-top-card__company-name, .jobs-details-top-card__company-name, a.topcard__org-name-link, .top-card-layout__entity-info a');
    const company = companyEl?.textContent?.trim() || '';
    
    const locationEl = document.querySelector('.job-details-jobs-unified-top-card__bullet, .jobs-details-top-card__bullet, .topcard__flavor--bullet');
    const location = locationEl?.textContent?.trim() || '';
    
    const descEl = document.querySelector('.jobs-description-content__text, .jobs-description, #job-details, .jobs-box__html-content');
    const description = descEl?.textContent?.trim() || '';
    
    if (!description) {
      return null;
    }
    
    return {
      platform: 'linkedin',
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
  try {
    const easyApplyBtn = document.querySelector('button.jobs-apply-button');
    if (!easyApplyBtn) return;
    
    easyApplyBtn.style.border = '3px solid #6366f1';
    easyApplyBtn.style.boxShadow = '0 0 20px rgba(99, 102, 241, 0.6)';
    
    showNotification('Ready to assist', 'Click Easy Apply - form will be pre-filled');
    
    const observer = new MutationObserver(() => {
      const modal = document.querySelector('.jobs-easy-apply-modal');
      if (modal) {
        setTimeout(() => fillFormFields(resumeData), 500);
        observer.disconnect();
      }
    });
    
    observer.observe(document.body, { childList: true, subtree: true });
    
  } catch (error) {
    console.error('Job Copilot: Autofill error:', error);
  }
}

function fillFormFields(resumeData) {
  try {
    const firstName = resumeData?.contact?.name?.split(' ')[0] || '';
    const lastName = resumeData?.contact?.name?.split(' ').slice(1).join(' ') || '';
    
    const firstNameInput = document.querySelector('input[name*="firstName"]');
    if (firstNameInput && !firstNameInput.value) {
      firstNameInput.value = firstName;
      firstNameInput.dispatchEvent(new Event('input', { bubbles: true }));
    }
    
    const lastNameInput = document.querySelector('input[name*="lastName"]');
    if (lastNameInput && !lastNameInput.value) {
      lastNameInput.value = lastName;
      lastNameInput.dispatchEvent(new Event('input', { bubbles: true }));
    }
    
    const emailInput = document.querySelector('input[type="email"]');
    if (emailInput && !emailInput.value && resumeData?.contact?.email) {
      emailInput.value = resumeData.contact.email;
      emailInput.dispatchEvent(new Event('input', { bubbles: true }));
    }
    
    const phoneInput = document.querySelector('input[type="tel"]');
    if (phoneInput && !phoneInput.value && resumeData?.contact?.phone) {
      phoneInput.value = resumeData.contact.phone;
      phoneInput.dispatchEvent(new Event('input', { bubbles: true }));
    }
    
    showNotification('Form assisted', 'Review carefully and submit manually');
    
  } catch (error) {
    console.error('Job Copilot: Fill fields error:', error);
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
