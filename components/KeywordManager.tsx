
import React, { useState } from 'react';
import { TrashIcon, PlusIcon } from './icons';

interface KeywordManagerProps {
  keywords: string[];
  onAddKeyword: (keyword: string) => void;
  onRemoveKeyword: (keyword: string) => void;
  isLocked: boolean;
}

const KeywordManager: React.FC<KeywordManagerProps> = ({ keywords, onAddKeyword, onRemoveKeyword, isLocked }) => {
  const [newKeyword, setNewKeyword] = useState('');

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!isLocked) {
    onAddKeyword(newKeyword);
    setNewKeyword('');
    }
  };

  const handleRemove = (keyword: string) => {
    if (!isLocked) {
      onRemoveKeyword(keyword);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-800 shadow-lg rounded-xl p-6 transition-colors duration-300">
      <h2 className="text-2xl font-semibold mb-4 text-slate-800 dark:text-slate-100">Blacklist Manager</h2>
      <p className="text-slate-500 dark:text-slate-400 mb-6">Add or remove keywords to customize the content filter. Changes are saved automatically.</p>
      <form onSubmit={handleSubmit} className="flex gap-2 mb-6">
        <input
          type="text"
          value={newKeyword}
          onChange={(e) => setNewKeyword(e.target.value)}
          placeholder="Enter a new keyword..."
          className="flex-grow bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 dark:text-slate-200"
          disabled={isLocked}
        />
        <button
          type="submit"
          className="bg-blue-600 text-white font-semibold px-4 py-2 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-slate-800 flex items-center gap-2 transition-colors disabled:opacity-50"
          disabled={!newKeyword.trim() || isLocked}
        >
          <PlusIcon />
          <span>Add</span>
        </button>
      </form>
      <div className="space-y-2">
        <h3 className="text-lg font-medium text-slate-700 dark:text-slate-300 mb-2">Current Keywords:</h3>
        {keywords.length > 0 ? (
          <div className="flex flex-wrap gap-2" aria-label="Blacklisted keywords">
            {keywords.map((keyword) => (
              <span
                key={keyword}
                className="bg-slate-200 dark:bg-slate-700 rounded-full px-3 py-1.5 text-sm font-medium text-slate-700 dark:text-slate-200 flex items-center gap-2"
              >
                <span>{keyword}</span>
                <button
                  onClick={() => handleRemove(keyword)}
                  className="text-slate-500 dark:text-slate-400 hover:text-red-500 dark:hover:text-red-400 transition-colors"
                  aria-label={`Remove ${keyword}`}
                  disabled={isLocked}
                >
                  <TrashIcon />
                </button>
              </span>
            ))}
          </div>
        ) : (
          <p className="text-slate-500 dark:text-slate-400 italic">No keywords in the blacklist. Add one above to start.</p>
        )}
      </div>
    </div>
  );
};

export default KeywordManager;
