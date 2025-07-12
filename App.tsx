// App.tsx
import * as React from 'react';
import useChromeStorage from './hooks/useChromeStorage';
import { INITIAL_KEYWORDS } from './constants';
import KeywordManager from './components/KeywordManager';
import { ProtectionPanel, PasswordPanel } from './components/SettingsPanel';
import Header from './components/Header';
import Footer from './components/Footer';

function App() {
  const [keywords, setKeywords] = useChromeStorage<string[]>('keywords', INITIAL_KEYWORDS);
  const [isEnabled, setIsEnabled] = useChromeStorage<boolean>('isEnabled', true);
  const [password, setPassword] = useChromeStorage<string>('smart-guardian-password', '');
  const [isLocked, setIsLocked] = useChromeStorage<boolean>('smart-guardian-locked', false);

  const addKeyword = (keyword: string) => {
    const trimmed = keyword.trim().toLowerCase();
    if (trimmed && !keywords.includes(trimmed)) {
      setKeywords([...keywords, trimmed].sort());
    }
  };

  const removeKeyword = (keywordToRemove: string) => {
    setKeywords(keywords.filter(k => k !== keywordToRemove));
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-gray-900 text-slate-800 dark:text-slate-200 font-sans">
      <main className="settings-grid-main">
        <Header />
        <div className="settings-grid">
          {/* ستون اول: Protection و Password */}
          <div className="settings-col settings-col-left">
            <ProtectionPanel
              isEnabled={isEnabled}
              onToggleEnabled={setIsEnabled}
              isLocked={isLocked}
            />
            <PasswordPanel
              password={password}
              onSetPassword={setPassword}
              isLocked={isLocked}
              onToggleLocked={setIsLocked}
            />
          </div>
          {/* ستون دوم: Blacklist */}
          <div className="settings-col">
            <KeywordManager
              keywords={keywords}
              onAddKeyword={addKeyword}
              onRemoveKeyword={removeKeyword}
              isLocked={isLocked}
            />
          </div>
          {/* ستون سوم: Blocked Sites */}
          <div className="settings-col">
            {/* TODO: Replace with BlockedSitesManager component */}
            <div className="setting-block glass-card" style={{minHeight: 300, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'}}>
              <h2 className="card-title mb-2">Blocked Sites</h2>
              <p className="mb-4">Block entire websites by domain (e.g. example.com). Everything is saved locally.</p>
              <div style={{color: '#fff', opacity: 0.7}}>Your blocked sites list is empty.</div>
            </div>
          </div>
        </div>
        <Footer />
      </main>
    </div>
  );
}

export default App;