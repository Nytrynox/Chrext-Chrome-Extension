// Greenhouse ATS Parser

console.log('Job Copilot: Greenhouse parser loaded');

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
    const titleEl = document.querySelector('.app-title, h1.job-title');
    const title = titleEl?.textContent?.trim() || '';
    
    const companyEl = document.querySelector('.company-name');
    const company = companyEl?.textContent?.trim() || window.location.hostname.split('.')[0];
    
    const locationEl = document.querySelector('.location');
    const location = locationEl?.textContent?.trim() || '';
    
    const descEl = document.querySelector('#content, .job-description');
    const description = descEl?.textContent?.trim() || '';
    
    if (!description) {
      return null;
    }
    
    return {
      platform: 'greenhouse',
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
  const firstName = resumeData?.contact?.name?.split(' ')[0] || '';
  const lastName = resumeData?.contact?.name?.split(' ').slice(1).join(' ') || '';
  
  const firstNameInput = document.querySelector('input[name*="first_name"]');
  if (firstNameInput && !firstNameInput.value) {
    firstNameInput.value = firstName;
    firstNameInput.dispatchEvent(new Event('input', { bubbles: true }));
  }
  
  const lastNameInput = document.querySelector('input[name*="last_name"]');
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
}
