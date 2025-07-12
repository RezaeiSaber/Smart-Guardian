document.addEventListener('DOMContentLoaded', () => {

    // === 🔗 ELEMENTS ===
    const toggleEnabledInput = document.getElementById('toggle-enabled');
    const toggleSwitch = toggleEnabledInput.closest('.toggle-switch');
    const toggleLabel = document.getElementById('toggle-label');

    const addKeywordForm = document.getElementById('add-keyword-form');
    const newKeywordInput = document.getElementById('new-keyword-input');
    const keywordsList = document.getElementById('keywords-list');
    const noKeywordsMessage = document.getElementById('no-keywords-message');
    const addKeywordButton = addKeywordForm.querySelector('button[type="submit"]');

    const passwordInput = document.getElementById('password-input');
    const setPasswordBtn = document.getElementById('set-password-btn');
    const unlockBtn = document.getElementById('unlock-settings-btn');
    const passwordStatus = document.getElementById('password-status-message');

    const settingBlocks = document.querySelectorAll('.setting-block');

    const mainPanel = document.querySelector('main.main-settings');
    const unlockSection = document.getElementById('unlock-section');
    const unlockPasswordInput = document.getElementById('unlock-password-input');
    const unlockMsg = document.getElementById('unlock-status-message');
    const passwordSettingsSection = document.getElementById('password-settings-section');

    const addDomainForm = document.getElementById('add-domain-form');
    const newDomainInput = document.getElementById('new-domain-input');
    const domainsList = document.getElementById('domains-list');
    const noDomainsMessage = document.getElementById('no-domains-message');
    let currentDomains = [];

    let currentKeywords = [];

    // === 🔐 UTILS ===

    const hashPassword = async (password) => {
        const encoder = new TextEncoder();
        const data = encoder.encode(password);
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        return Array.from(new Uint8Array(hashBuffer))
            .map(b => b.toString(16).padStart(2, '0'))
            .join('');
    };

    const lockUI = () => {
        settingBlocks.forEach(block => {
            if (!block.querySelector('.password-control')) {
                block.classList.add('hidden');
            }
        });
        setPasswordBtn.classList.add('hidden');
        unlockBtn.classList.remove('hidden');
        if (passwordStatus) passwordStatus.textContent = ' Settings locked. Enter password to unlock.';
    };

    const unlockUI = () => {
        settingBlocks.forEach(block => {
            block.classList.remove('hidden');
        });
        setPasswordBtn.classList.remove('hidden');
        unlockBtn.classList.add('hidden');
        if (passwordStatus) passwordStatus.textContent = ' Settings unlocked.';
    };

    // showUnlockUI: only show unlock-section and hide other sections
    const showUnlockUI = () => {
        if (mainPanel) mainPanel.classList.add('hidden');
        if (unlockSection) unlockSection.classList.remove('hidden');
        if (passwordSettingsSection) passwordSettingsSection.classList.add('hidden');
        if (unlockPasswordInput) unlockPasswordInput.value = '';
        if (unlockMsg) {
            unlockMsg.textContent = '';
            unlockMsg.style.color = '#dc2626';
        }
    };
    const hideUnlockUI = () => {
        if (mainPanel) mainPanel.classList.remove('hidden');
        if (unlockSection) unlockSection.classList.add('hidden');
        if (unlockMsg) unlockMsg.textContent = '';
        if (passwordSettingsSection) passwordSettingsSection.classList.add('hidden');
    };

    // === 🔁 RENDER FUNCTIONS ===

    const renderToggle = (isEnabled) => {
        toggleEnabledInput.checked = isEnabled;
        toggleLabel.textContent = isEnabled ? 'Enabled' : 'Disabled';
        if (toggleSwitch) {
        toggleSwitch.classList.toggle('enabled', isEnabled);
        }
        toggleLabel.classList.toggle('enabled', isEnabled);
    };

    const renderKeywords = () => {
        keywordsList.innerHTML = '';
        if (currentKeywords.length === 0) {
            noKeywordsMessage.classList.remove('hidden');
        } else {
            noKeywordsMessage.classList.add('hidden');
            currentKeywords.sort().forEach(keyword => {
                const keywordEl = document.createElement('div');
                keywordEl.className = 'keyword-tag';
                keywordEl.innerHTML = `
                    <span>${keyword}</span>
                    <button data-keyword="${keyword}" class="remove-keyword-btn" aria-label="Remove ${keyword}">
                        &times;
                    </button>
                `;
                keywordsList.appendChild(keywordEl);
            });
        }
    };

    const renderDomains = () => {
        domainsList.innerHTML = '';
        if (currentDomains.length === 0) {
            noDomainsMessage.classList.remove('hidden');
        } else {
            noDomainsMessage.classList.add('hidden');
            currentDomains.sort().forEach(domain => {
                const domainEl = document.createElement('div');
                domainEl.className = 'keyword-tag';
                domainEl.innerHTML = `
                    <span>${domain}</span>
                    <button data-domain="${domain}" class="remove-domain-btn" aria-label="Remove ${domain}">
                        &times;
                    </button>
                `;
                domainsList.appendChild(domainEl);
            });
        }
    };

    // === 🧠 EVENT HANDLERS ===

    const handleToggle = (e) => {
        const isEnabled = e.target.checked;
        chrome.storage.local.set({ isEnabled }, () => renderToggle(isEnabled));
    };

    const handleAddKeyword = (e) => {
        e.preventDefault();
        const newKeyword = newKeywordInput.value.trim().toLowerCase();
        if (newKeyword && !currentKeywords.includes(newKeyword)) {
            currentKeywords.push(newKeyword);
            chrome.storage.local.set({ keywords: currentKeywords }, () => {
                renderKeywords();
                newKeywordInput.value = '';
                addKeywordButton.disabled = true;
            });
        }
    };

    const handleRemoveKeyword = (e) => {
        const removeButton = e.target.closest('.remove-keyword-btn');
        if (removeButton) {
            const keywordToRemove = removeButton.dataset.keyword;
            currentKeywords = currentKeywords.filter(k => k !== keywordToRemove);
            chrome.storage.local.set({ keywords: currentKeywords }, renderKeywords);
        }
    };

    const checkAddButtonState = () => {
        const trimmedValue = newKeywordInput.value.trim();
        addKeywordButton.disabled = trimmedValue.length === 0;
    };

    const handleAddDomain = (e) => {
        e.preventDefault();
        const newDomain = newDomainInput.value.trim().toLowerCase();
        if (newDomain && !currentDomains.includes(newDomain)) {
            currentDomains.push(newDomain);
            chrome.storage.local.set({ blockedDomains: currentDomains }, () => {
                renderDomains();
                newDomainInput.value = '';
                addDomainButton.disabled = true;
            });
        }
    };
    const handleRemoveDomain = (e) => {
        const removeButton = e.target.closest('.remove-domain-btn');
        if (removeButton) {
            const domainToRemove = removeButton.dataset.domain;
            currentDomains = currentDomains.filter(d => d !== domainToRemove);
            chrome.storage.local.set({ blockedDomains: currentDomains }, renderDomains);
        }
    };
    const checkAddDomainButtonState = () => {
        const trimmedValue = newDomainInput.value.trim();
        addDomainButton.disabled = trimmedValue.length === 0;
    };

    // ===  PASSWORD HANDLERS ===

    setPasswordBtn.addEventListener('click', async () => {
        const pw = passwordInput.value.trim();
        if (pw.length < 4) {
            if (passwordStatus) {
                passwordStatus.textContent = ' Password must be at least 4 characters.';
                passwordStatus.style.color = '#dc2626';
            }
            return;
        }
        const hash = await hashPassword(pw);
        chrome.storage.local.set({ passwordHash: hash, settingsLocked: true }, () => {
            if (passwordStatus) {
                passwordStatus.textContent = ' Password set!';
                passwordStatus.style.color = '#22c55e';
            }
            setTimeout(() => {
                // Always show unlock UI after setting password
                showUnlockUI();
                if (passwordStatus) passwordStatus.textContent = '';
            }, 1000);
        });
    });

    if (unlockBtn) {
    unlockBtn.addEventListener('click', async () => {
            const pw = unlockPasswordInput.value.trim();
            if (pw.length < 4) {
                if (unlockMsg) {
                    unlockMsg.textContent = ' Password must be at least 4 characters.';
                    unlockMsg.style.color = '#dc2626';
                }
                return;
            }
        const hash = await hashPassword(pw);
        chrome.storage.local.get(['passwordHash'], result => {
            if (hash === result.passwordHash) {
                    chrome.storage.local.set({ settingsLocked: false }, () => {
                        hideUnlockUI();
                        // Always show change password section after unlock
                        if (passwordSettingsSection) {
                            passwordSettingsSection.classList.remove('hidden');
                            setPasswordBtn.textContent = 'Change Password';
                            document.getElementById('set-password-section').classList.add('hidden');
                            document.getElementById('change-password-section').classList.remove('hidden');
                        }
                    });
            } else {
                    if (unlockMsg) {
                        unlockMsg.textContent = ' Incorrect password.';
                        unlockMsg.style.color = '#dc2626';
                    }
                }
            });
        });
        // تایید رمز با Enter
        unlockPasswordInput.addEventListener('keydown', function(e) {
            if (e.key === 'Enter') {
                unlockBtn.click();
            }
        });
    }

    // When changing password, set settingsLocked to true to require password again
    const changePasswordBtn = document.getElementById('change-password-btn');
    if (changePasswordBtn) {
        changePasswordBtn.addEventListener('click', async () => {
            const oldPw = document.getElementById('old-password').value.trim();
            const newPw = document.getElementById('new-password').value.trim();
            const changeStatus = document.getElementById('change-password-status');
            if (!oldPw || !newPw) return;
            if (newPw.length < 4) {
                if (changeStatus) {
                    changeStatus.textContent = ' New password must be at least 4 characters.';
                    changeStatus.style.color = '#dc2626';
                }
                return;
            }
            const oldHash = await hashPassword(oldPw);
            chrome.storage.local.get(['passwordHash'], result => {
                if (oldHash === result.passwordHash) {
                    hashPassword(newPw).then(newHash => {
                        chrome.storage.local.set({ passwordHash: newHash, settingsLocked: true }, () => {
                            if (changeStatus) {
                                changeStatus.textContent = ' Password changed!';
                                changeStatus.style.color = '#22c55e';
                            }
                            setTimeout(() => {
                                showUnlockUI();
                                if (changeStatus) changeStatus.textContent = '';
                            }, 1000);
                        });
                    });
                } else {
                    if (changeStatus) {
                        changeStatus.textContent = ' Incorrect current password.';
                        changeStatus.style.color = '#dc2626';
                    }
            }
        });
    });
    }

    // === 🚀 INIT ===

    const loadSettings = () => {
        chrome.storage.local.get(['isEnabled', 'keywords', 'blockedDomains', 'passwordHash', 'settingsLocked'], (result) => {
            renderToggle(typeof result.isEnabled === 'boolean' ? result.isEnabled : true);
            currentKeywords = result.keywords || [];
            renderKeywords();
            currentDomains = result.blockedDomains || [];
            renderDomains();

            // Always require password to access settings if password is set
            if (result.passwordHash) {
                if (result.settingsLocked === undefined || result.settingsLocked) {
                    showUnlockUI();
                } else {
                    hideUnlockUI();
                    unlockUI();
                    if (passwordSettingsSection) {
                        passwordSettingsSection.classList.remove('hidden');
                        setPasswordBtn.textContent = 'Change Password';
                        document.getElementById('set-password-section').classList.add('hidden');
                        document.getElementById('change-password-section').classList.remove('hidden');
                    }
                }
            } else {
                hideUnlockUI();
                unlockUI();
                if (passwordSettingsSection) {
                    passwordSettingsSection.classList.remove('hidden');
                    setPasswordBtn.textContent = 'Set Password';
                    document.getElementById('set-password-section').classList.remove('hidden');
                    document.getElementById('change-password-section').classList.add('hidden');
                }
            }
        });
    };

    // If the page is opened, and password is set, always lock settings (require password every time)
    chrome.storage.local.get(['passwordHash'], (result) => {
        if (result.passwordHash) {
            chrome.storage.local.set({ settingsLocked: true }, () => {
                loadSettings();
            });
        } else {
            loadSettings();
        }
    });

    // === 📎 BIND EVENTS ===
    toggleEnabledInput.addEventListener('change', handleToggle);
    addKeywordForm.addEventListener('submit', handleAddKeyword);
    keywordsList.addEventListener('click', handleRemoveKeyword);
    newKeywordInput.addEventListener('input', checkAddButtonState);
    // Blocked domains events
    const addDomainButton = addDomainForm.querySelector('button[type="submit"]');
    addDomainForm.addEventListener('submit', handleAddDomain);
    domainsList.addEventListener('click', handleRemoveDomain);
    newDomainInput.addEventListener('input', checkAddDomainButtonState);

    // === ⚡ INIT ===
    checkAddButtonState();
    checkAddDomainButtonState();

});
