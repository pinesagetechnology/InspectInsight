import { BrowserStorageKey } from "../enums";


export const addDays = (date: Date, days: number) => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

export const saveToStorage = (key: BrowserStorageKey, state: any) => {
  try {
    const serializedState = JSON.stringify(state);
    localStorage.setItem(key, serializedState); // Or use sessionStorage
  } catch (e) {
    throw (`Could not store form data ${key}`);
  }
}

export const removeToStorage = (key: BrowserStorageKey) => {
  try {
    localStorage.removeItem(key);
  } catch (e) {
    throw (`Could not remove item form store: ${key}`);
  }
}

export const getLocalStorage = (key: BrowserStorageKey) => {
  const savedState = localStorage.getItem(key);
  if (savedState) {
    const initialValue = JSON.parse(savedState);

    return initialValue || "";

  }
}
