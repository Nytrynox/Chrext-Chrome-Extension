// Lever ATS Parser

console.log('Job Copilot: Lever parser loaded');

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
    const titleEl = document.querySelector('.posting-headline h2');
    const title = titleEl?.textContent?.trim() || '';
    
    const companyEl = document.querySelector('.main-header-logo img');
    const company = companyEl?.alt || window.location.hostname.split('.')[1] || '';
    
    const locationEl = document.querySelector('.location');
    const location = locationEl?.textContent?.trim() || '';
    
    const descEl = document.querySelector('.section-wrapper');
    const description = descEl?.textContent?.trim() || '';
    
    if (!description) {
      return null;
    }
    
    return {
      platform: 'lever',
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
  const nameInput = document.querySelector('input[name="name"]');
  if (nameInput && !nameInput.value && resumeData?.contact?.name) {
    nameInput.value = resumeData.contact.name;
    nameInput.dispatchEvent(new Event('input', { bubbles: true }));
  }
  
  const emailInput = document.querySelector('input[name="email"]');
  if (emailInput && !emailInput.value && resumeData?.contact?.email) {
    emailInput.value = resumeData.contact.email;
    emailInput.dispatchEvent(new Event('input', { bubbles: true }));
  }
  
  const phoneInput = document.querySelector('input[name="phone"]');
  if (phoneInput && !phoneInput.value && resumeData?.contact?.phone) {
    phoneInput.value = resumeData.contact.phone;
    phoneInput.dispatchEvent(new Event('input', { bubbles: true }));
  }
}
