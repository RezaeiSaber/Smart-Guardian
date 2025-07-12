
import React from 'react';
import { ShieldCheckIcon } from './icons';

const Header = () => (
  <header className="text-center">
    <div className="flex items-center justify-center gap-4">
      <ShieldCheckIcon />
      <h1 className="text-4xl font-bold text-slate-900 dark:text-white">Smart Guardian</h1>
    </div>
    <p className="mt-4 text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
      A smart internet protector for children and teenagers. Manage your local protection settings below. All your data stays on your device.
    </p>
  </header>
);

export default Header;
