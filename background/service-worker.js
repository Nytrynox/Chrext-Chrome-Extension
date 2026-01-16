// Background Service Worker for AI Job Application Copilot

console.log('Service worker loaded');

// Extension installation
chrome.runtime.onInstalled.addListener((details) => {
  console.log('Extension installed:', details.reason);
  
  if (details.reason === 'install') {
    // Set default values
    chrome.storage.local.set({
      analyses_count: 0,
      user_tier: 'free'
    });
    
    // Create cleanup alarm (only after install)
    chrome.alarms.create('cleanup', { periodInMinutes: 1440 });
  }
});

// Handle messages from popup and content scripts
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('Message received:', request.type);
  
  if (request.type === 'UPDATE_BADGE') {
    const { count, limit } = request;
    chrome.action.setBadgeText({ text: `${count}/${limit}` });
    chrome.action.setBadgeBackgroundColor({ color: '#8B5CF6' });
    sendResponse({ success: true });
  }
  
  if (request.type === 'ANALYZE_JOB') {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]) {
        chrome.tabs.sendMessage(tabs[0].id, request, (response) => {
          sendResponse(response);
        });
      }
    });
    return true;
  }
  
  return true;
});

// Handle alarms
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'cleanup') {
    chrome.storage.local.get(['analysis_cache'], (result) => {
      const cache = result.analysis_cache || {};
      const oneDayAgo = Date.now() - (24 * 60 * 60 * 1000);
      
      const cleaned = {};
      for (const key in cache) {
        if (cache[key].timestamp > oneDayAgo) {
          cleaned[key] = cache[key];
        }
      }
      
      chrome.storage.local.set({ analysis_cache: cleaned });
    });
  }
});
