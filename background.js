// Default keywords to be used on first installation.
const INITIAL_KEYWORDS = [
  "porn", "nude", "sex", "xxx", "drugs", "violence", 
  "killing", "suicide", "gambling", "rape", "abuse"
];

// On extension installation, set up the default keywords and enabled status.
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    chrome.storage.local.set({
      keywords: INITIAL_KEYWORDS,
      isEnabled: true
    });
  }
});

// Listener for tab updates to inject the content script.
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  // Check if the tab has finished loading and has a valid URL.
  if (changeInfo.status === 'complete' && tab.url && tab.url.startsWith('http')) {
    // Check if protection is enabled before injecting.
    chrome.storage.local.get('isEnabled', (result) => {
      if (result.isEnabled) {
        chrome.scripting.executeScript({
          target: { tabId: tabId },
          files: ['content.js']
        }).catch(err => {
          if (!err.message.includes('Cannot access a chrome:// URL') && !err.message.includes('Cannot access contents of the page')) {
            console.error("Smart Guardian: Failed to inject content script.", err);
          }
        });
      }
    });
  }
});

// Listen for messages from content scripts (e.g., to close tab and open blank)
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.action === 'closeAndOpenBlank' && sender.tab && sender.tab.id) {
    chrome.tabs.create({ url: 'about:blank' }, () => {
      chrome.tabs.remove(sender.tab.id);
    });
  }
});