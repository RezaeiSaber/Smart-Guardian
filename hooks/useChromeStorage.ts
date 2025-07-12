// hooks/useChromeStorage.ts

import { useState, useEffect } from 'react';

function useChromeStorage<T>(key: string, initialValue: T): [T, (value: T) => void] {
  const [storedValue, setStoredValue] = useState<T>(initialValue);

  useEffect(() => {
    if (chrome && chrome.storage && chrome.storage.local) {
      chrome.storage.local.get([key], (result) => {
        if (result[key] !== undefined) {
          setStoredValue(result[key]);
        }
      });
    }
  }, [key, initialValue]);

  const setValue = (value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);

      if (chrome && chrome.storage && chrome.storage.local) {
        chrome.storage.local.set({ [key]: valueToStore });
      }
    } catch (error) {
      console.error('Error writing to storage', error);
    }
  };

  return [storedValue, setValue];
}

export default useChromeStorage;