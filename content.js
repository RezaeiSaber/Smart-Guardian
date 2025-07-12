// This script is injected into web pages to scan for keywords.

// Use a flag to ensure the script only runs once per page load.
if (typeof window.smartGuardianScanner === 'undefined') {
  window.smartGuardianScanner = true;

  // Function to inject the extension's CSS file into the page.
  const injectCSS = () => {
    // Check if the link is already injected.
    if (document.getElementById('smart-guardian-styles')) return;

    const link = document.createElement('link');
    link.id = 'smart-guardian-styles';
    link.rel = 'stylesheet';
    link.type = 'text/css';
    link.href = chrome.runtime.getURL('styles.css');
    (document.head || document.documentElement).appendChild(link);
  };

  const showAlertOverlay = (keyword) => {
    // Prevent creating multiple overlays.
    if (document.getElementById('smart-guardian-overlay')) return;

    injectCSS();

    // Create a blur container for the whole page content
    let blurContainer = document.getElementById('smart-guardian-blur-bg');
    if (!blurContainer) {
      blurContainer = document.createElement('div');
      blurContainer.id = 'smart-guardian-blur-bg';
      // Move all body children into the blur container
      while (document.body.firstChild) {
        blurContainer.appendChild(document.body.firstChild);
      }
      document.body.appendChild(blurContainer);
    }
    blurContainer.style.filter = 'blur(40px)';
    blurContainer.style.pointerEvents = 'none';
    blurContainer.style.transition = 'filter 0.3s';
    blurContainer.style.position = 'relative';
    blurContainer.style.zIndex = '0';

    // Create overlay (modal only, no blur)
    const overlay = document.createElement('div');
    overlay.id = 'smart-guardian-overlay';
    overlay.style.background = 'rgba(30,41,59,0.25)';
    overlay.style.backdropFilter = 'blur(24px)';
    overlay.style.webkitBackdropFilter = 'blur(24px)';
    overlay.style.position = 'fixed';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.width = '100vw';
    overlay.style.height = '100vh';
    overlay.style.zIndex = '2147483647';
    overlay.style.display = 'flex';
    overlay.style.justifyContent = 'center';
    overlay.style.alignItems = 'center';
    overlay.style.animation = 'fadeIn 0.3s forwards';

    // Modal
    const modal = document.createElement('div');
    modal.style.background = 'white';
    modal.style.borderRadius = '20px';
    modal.style.boxShadow = '0 8px 32px #0002, 0 2px 8px #3b82f633';
    modal.style.padding = '2.5rem 2rem 2rem 2rem';
    modal.style.maxWidth = '95vw';
    modal.style.width = '370px';
    modal.style.textAlign = 'center';
    modal.style.position = 'relative';
    modal.style.display = 'flex';
    modal.style.flexDirection = 'column';
    modal.style.alignItems = 'center';
    modal.style.gap = '1.2rem';
    modal.style.zIndex = '2147483648';

    // Icon
    const icon = document.createElement('div');
    icon.textContent = '🚫';
    icon.style.fontSize = '3.5rem';
    icon.style.marginBottom = '0.5rem';
    icon.style.color = '#dc2626';
    modal.appendChild(icon);

    // Title
    // const title = document.createElement('h2');
    // title.textContent = 'Inappropriate Content Detected';
    // title.style.fontWeight = 'bold';
    // title.style.fontSize = '1.35rem';
 
    // // title.style.color = '#fff';
    // title.style.color = '#000';
    // title.style.textShadow = 'none';
    // modal.appendChild(title);

    // Message
    const message = document.createElement('div');
    message.innerHTML = `This page contains sensitive content related to <b style="color:#dc2626">${keyword}</b>`;
    message.style.fontSize = '1.05rem';
    message.style.color = '#475569';
    modal.appendChild(message);

    // Password input
    const pwInput = document.createElement('input');
    pwInput.type = 'password';
    pwInput.placeholder = 'Password to continue...';
    pwInput.style.width = '100%';
    pwInput.style.padding = '0.7rem';
    pwInput.style.fontSize = '1.1rem';
    pwInput.style.borderRadius = '10px';
    pwInput.style.border = '1px solid #cbd5e1';
    pwInput.style.marginTop = '0.5rem';
    pwInput.style.textAlign = 'center';
    modal.appendChild(pwInput);

    // Status message
    const statusMsg = document.createElement('div');
    statusMsg.style.fontSize = '0.98rem';
    statusMsg.style.height = '1.2em';
    statusMsg.style.margin = '0.5rem 0 0.2rem 0';
    statusMsg.style.color = '#dc2626';
    modal.appendChild(statusMsg);

    // Continue button
    const continueBtn = document.createElement('button');
    continueBtn.textContent = 'Continue';
    continueBtn.style.width = '100%';
    continueBtn.style.padding = '0.8rem';
    continueBtn.style.fontSize = '1.1rem';
    continueBtn.style.borderRadius = '10px';
    continueBtn.style.border = 'none';
    continueBtn.style.background = 'linear-gradient(90deg,#3b82f6,#2563eb)';
    continueBtn.style.color = 'white';
    continueBtn.style.fontWeight = 'bold';
    continueBtn.style.cursor = 'pointer';
    continueBtn.style.marginTop = '0.5rem';
    continueBtn.style.boxShadow = '0 2px 8px #3b82f633';
    continueBtn.addEventListener('click', async () => {
      const pw = pwInput.value.trim();
      if (pw.length < 4) {
        statusMsg.textContent = 'Password must be at least 4 characters.';
        return;
      }
      // Validate password
      const encoder = new TextEncoder();
      const data = encoder.encode(pw);
      const hashBuffer = await crypto.subtle.digest('SHA-256', data);
      const hash = Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');
      chrome.storage.local.get(['passwordHash'], result => {
        if (hash === result.passwordHash) {
          // Remove overlay and blur
          overlay.remove();
          blurContainer.style.filter = '';
          blurContainer.style.pointerEvents = '';
        } else {
          statusMsg.textContent = 'Incorrect password.';
        }
      });
    });
    modal.appendChild(continueBtn);

    // Exit button
    const exitBtn = document.createElement('button');
    exitBtn.textContent = 'Exit';
    exitBtn.style.width = '100%';
    exitBtn.style.padding = '0.8rem';
    exitBtn.style.fontSize = '1.1rem';
    exitBtn.style.borderRadius = '10px';
    exitBtn.style.border = 'none';
    exitBtn.style.background = '#dc2626';
    exitBtn.style.color = 'white';
    exitBtn.style.fontWeight = 'bold';
    exitBtn.style.cursor = 'pointer';
    exitBtn.style.marginTop = '0.5rem';
    exitBtn.style.boxShadow = '0 2px 8px #3b82f633';
    exitBtn.addEventListener('click', () => {
      chrome.runtime.sendMessage({ action: 'closeAndOpenBlank' });
    });
    modal.appendChild(exitBtn);

    overlay.appendChild(modal);
    document.body.appendChild(overlay);
  };

  const scanPage = (keywords) => {
    // Combine title and body text for a more comprehensive scan.
    const pageText = (document.title + ' ' + document.body.innerText).toLowerCase();

    for (const keyword of keywords) {
      // Use word boundaries to avoid matching parts of words (e.g., 'sex' in 'essex').
      const regex = new RegExp(`\\b${keyword.toLowerCase()}\\b`);
      if (regex.test(pageText)) {
        console.log(`Smart Guardian: Found blocked keyword: ${keyword}`);
        showAlertOverlay(keyword);
        // Stop scanning after the first match.
        return;
      }
    }
  };

  // New: Check for blocked domains before scanning for keywords
  const checkBlockedDomain = (blockedDomains) => {
    const currentDomain = window.location.hostname.replace(/^www\./, '').toLowerCase();
    for (const domain of blockedDomains || []) {
      if (currentDomain === domain.toLowerCase() || currentDomain.endsWith('.' + domain.toLowerCase())) {
        showAlertOverlay(domain);
        return true;
      }
    }
    return false;
  };

  // --- FASTEST KEYWORD BLOCKING ---
  let keywordScanInterval = null;
  let keywordScanStopped = false;
  let keywordMutationObserver = null;
  function scanForKeywords(keywords) {
    if (!document.body) return false;
    const pageText = (document.title + ' ' + document.body.innerText).toLowerCase();
    for (const keyword of keywords) {
      const regex = new RegExp(`\\b${keyword.toLowerCase()}\\b`);
      if (regex.test(pageText)) {
        showAlertOverlay(keyword);
        stopAllKeywordScanning();
        return true;
      }
    }
    return false;
  }
  function startAllKeywordScanning(keywords) {
    if (keywordScanInterval || keywordMutationObserver) return;
    // 1. Initial scan immediately
    if (scanForKeywords(keywords)) return;
    // 2. Fast interval scan (every 30ms)
    keywordScanInterval = setInterval(() => {
      if (keywordScanStopped) return;
      scanForKeywords(keywords);
    }, 30);
    // 3. MutationObserver for any DOM change
    keywordMutationObserver = new MutationObserver(() => {
      scanForKeywords(keywords);
    });
    keywordMutationObserver.observe(document.body, { childList: true, subtree: true, characterData: true });
  }
  function stopAllKeywordScanning() {
    keywordScanStopped = true;
    if (keywordScanInterval) {
      clearInterval(keywordScanInterval);
      keywordScanInterval = null;
    }
    if (keywordMutationObserver) {
      keywordMutationObserver.disconnect();
      keywordMutationObserver = null;
    }
  }

  // Fetch settings from storage and initiate the scan.
  chrome.storage.local.get(['keywords', 'isEnabled', 'blockedDomains'], (result) => {
    if (!result.isEnabled) return;
    if (checkBlockedDomain(result.blockedDomains)) {
      return;
    }
    if (result.keywords && result.keywords.length > 0) {
      startAllKeywordScanning(result.keywords);
      document.addEventListener('DOMContentLoaded', () => {
        scanForKeywords(result.keywords);
        stopAllKeywordScanning();
      });
    }
  });
}