
import * as React from 'react';
import { useState } from 'react';
import { LockClosedIcon } from './icons';

interface ProtectionPanelProps {
  isEnabled: boolean;
  onToggleEnabled: (enabled: boolean) => void;
  isLocked: boolean;
}

export const ProtectionPanel: React.FC<ProtectionPanelProps> = ({ isEnabled, onToggleEnabled, isLocked }) => (
  <div>
    <h3 className="text-lg font-medium mb-2">Protection</h3>
    <div className="flex items-center justify-between py-2">
      <span className="font-bold text-base">Content Filtering</span>
      <div className="flex items-center gap-3" style={{marginLeft: 'auto'}}>
        <span className={`font-medium ${isEnabled ? 'text-blue-600 dark:text-blue-400' : 'text-slate-500'}`}>{isEnabled ? 'Enabled' : 'Disabled'}</span>
        <label htmlFor="toggle-enabled" className="flex items-center cursor-pointer">
          <div className="relative">
            <input type="checkbox" id="toggle-enabled" className="sr-only" checked={isEnabled} onChange={(e: React.ChangeEvent<HTMLInputElement>) => onToggleEnabled(e.target.checked)} disabled={isLocked} />
            <div className="block bg-gray-200 dark:bg-gray-600 w-14 h-8 rounded-full"></div>
            <div className={`dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform ${isEnabled ? 'transform translate-x-6' : ''}`}></div>
          </div>
        </label>
      </div>
    </div>
  </div>
);

interface PasswordPanelProps {
  password: string;
  onSetPassword: (password: string) => void;
  isLocked: boolean;
  onToggleLocked: (locked: boolean) => void;
}

export const PasswordPanel: React.FC<PasswordPanelProps> = ({ password, onSetPassword, isLocked, onToggleLocked }) => {
  const [localPassword, setLocalPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [unlockPw, setUnlockPw] = useState('');
  const [unlockMsg, setUnlockMsg] = useState('');

  const hashPassword = async (pw: string) => {
    const encoder = new TextEncoder();
    const data = encoder.encode(pw);
    const hashBuffer = await window.crypto.subtle.digest('SHA-256', data);
    return Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');
  };

  const handlePasswordSave = async () => {
    if (!localPassword) return;
    const hash = await hashPassword(localPassword);
    onSetPassword(hash);
    alert('Password updated!');
  };

  const handleUnlock = async () => {
    if (!unlockPw) return;
    const hash = await hashPassword(unlockPw);
    if (hash === password) {
      onToggleLocked(false);
      setUnlockMsg('✅ قفل باز شد');
      setUnlockPw('');
    } else {
      setUnlockMsg('❌ رمز اشتباه است');
    }
  };

  return (
    <div>
      <h3 className="text-lg font-medium mb-2 flex items-center gap-2"><LockClosedIcon /> Password Settings</h3>
      <div className="flex flex-col sm:flex-row gap-2 items-center justify-center mb-2">
        <input
          id="password-input"
          type={showPassword ? "text" : "password"}
          value={localPassword}
          onChange={(e) => setLocalPassword(e.target.value)}
          placeholder={password ? "Change password..." : "Set password..."}
          className="w-full sm:w-64 bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 dark:text-slate-200 text-center"
          disabled={isLocked}
        />
        <button type="button" onClick={() => setShowPassword(!showPassword)} className="px-3 py-2 text-sm text-slate-500 hover:text-slate-700 dark:hover:text-slate-300">
          {showPassword ? 'Hide' : 'Show'}
        </button>
        <button
          onClick={handlePasswordSave}
          className="bg-blue-600 text-white font-semibold px-4 py-2 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center gap-2 transition-colors"
          disabled={isLocked || !localPassword}
        >
          <LockClosedIcon />
          <span>{password ? 'Change' : 'Set'} Password</span>
        </button>
      </div>
      {password && !isLocked && (
        <button
          onClick={() => onToggleLocked(true)}
          className="bg-red-500 text-white px-4 py-2 rounded-lg mt-2 hover:bg-red-600 transition-colors"
        >
          Lock Settings
        </button>
      )}
      {isLocked && (
        <div className="flex flex-col items-center mt-4">
          <input
            type="password"
            value={unlockPw}
            onChange={(e) => setUnlockPw(e.target.value)}
            placeholder="Enter password to unlock..."
            className="w-full sm:w-64 border rounded px-4 py-2 text-center mb-2"
          />
          <button onClick={handleUnlock} className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors">Unlock</button>
          <span className={`mt-2 text-sm ${unlockMsg.includes('✅') ? 'text-green-600' : unlockMsg ? 'text-red-600' : ''}`}>{unlockMsg}</span>
        </div>
      )}
    </div>
  );
};
