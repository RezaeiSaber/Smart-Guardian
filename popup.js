document.addEventListener('DOMContentLoaded', () => {
    const statusText = document.getElementById('status-text');
    const settingsButton = document.getElementById('settings-button');
    const statusIcon = document.getElementById('status-icon');
    const toggleEnabled = document.getElementById('toggle-enabled-popup');
    const toggleLabel = document.getElementById('toggle-label-popup');
    const passwordSection = document.getElementById('password-popup-section');
    const passwordInput = document.getElementById('password-popup-input');
    const passwordBtn = document.getElementById('password-popup-btn');
    const passwordMsg = document.getElementById('password-popup-message');

    let isEnabled = false;
    let passwordHash = '';
    let isLocked = false;

    // Load status and password
    chrome.storage.local.get(['isEnabled', 'passwordHash'], (result) => {
        isEnabled = !!result.isEnabled;
        passwordHash = result.passwordHash || '';
        updateStatusUI();
    });

    function updateStatusUI() {
        if (isEnabled) {
            statusText.textContent = 'Enabled';
            statusText.className = 'status-text-enabled';
            if (statusIcon) statusIcon.textContent = '🟢';
            if (toggleEnabled) toggleEnabled.checked = true;
            if (toggleLabel) toggleLabel.textContent = 'On';
        } else {
            statusText.textContent = 'Disabled';
            statusText.className = 'status-text-disabled';
            if (statusIcon) statusIcon.textContent = '🔴';
            if (toggleEnabled) toggleEnabled.checked = false;
            if (toggleLabel) toggleLabel.textContent = 'Off';
        }
        if (passwordSection) passwordSection.classList.add('hidden');
        if (passwordMsg) passwordMsg.textContent = '';
    }

    if (toggleEnabled) {
        toggleEnabled.addEventListener('change', (e) => {
            if (!toggleEnabled.checked) {
                // Turn off: if password is set, it will ask for password
                if (passwordHash) {
                    if (passwordSection) passwordSection.classList.remove('hidden');
                    if (passwordInput) passwordInput.value = '';
                    if (passwordMsg) passwordMsg.textContent = '';
                    // After confirming password, turn off
                    passwordBtn.onclick = async () => {
                        const pw = passwordInput.value.trim();
                        if (!pw) return;
                        const hash = await hashPassword(pw);
                        if (hash === passwordHash) {
                            chrome.storage.local.set({ isEnabled: false }, () => {
                                isEnabled = false;
                                updateStatusUI();
                            });
                        } else {
                            if (passwordMsg) passwordMsg.textContent = '❌ Incorrect password.';
                        }
                    };
                    // Return toggle to on state to confirm password
                    toggleEnabled.checked = true;
                    return;
                }
            }
            // Turn on or off without password
            chrome.storage.local.set({ isEnabled: toggleEnabled.checked }, () => {
                isEnabled = toggleEnabled.checked;
                updateStatusUI();
            });
        });
    }

    async function hashPassword(password) {
        const encoder = new TextEncoder();
        const data = encoder.encode(password);
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        return Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');
    }

    // Add click listener to the settings button.
    if (settingsButton) {
        settingsButton.addEventListener('click', () => {
            chrome.runtime.openOptionsPage();
        });
    }

    // Listen for changes in storage to keep the popup status up-to-date.
    chrome.storage.onChanged.addListener((changes, namespace) => {
        if (namespace === 'local' && changes.isEnabled) {
            isEnabled = changes.isEnabled.newValue;
            updateStatusUI();
        }
        if (namespace === 'local' && changes.passwordHash) {
            passwordHash = changes.passwordHash.newValue || '';
        }
    });
});