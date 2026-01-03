import { User, ApiKey, Paste } from '../types';

/**
 * NOTE: In a production environment, this file would import `firebase/auth`, `firebase/firestore`
 * and `firebase/functions` to perform real backend operations.
 * 
 * For this "Web Builder" demo, we are simulating the backend latency and persistence 
 * using localStorage to ensure the UI is fully functional and reviewable immediately.
 */

const LATENCY = 600;

// Local Storage Keys
const STORAGE_KEYS = {
  USER: 'yuvi_user',
  KEYS: 'yuvi_api_keys',
  PASTES: 'yuvi_pastes'
};

// --- Auth Simulation ---

export const mockRegister = async (email: string, password: string): Promise<User> => {
  await new Promise(r => setTimeout(r, LATENCY));
  if (!email.endsWith('@gmail.com')) {
    throw new Error("Registration restricted to @gmail.com accounts only.");
  }
  
  const newUser: User = {
    uid: 'user_' + Math.random().toString(36).substr(2, 9),
    email,
    isVerified: false,
    createdAt: Date.now()
  };
  
  localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(newUser));
  return newUser;
};

export const mockLogin = async (email: string, password: string): Promise<User> => {
  await new Promise(r => setTimeout(r, LATENCY));
  const stored = localStorage.getItem(STORAGE_KEYS.USER);
  if (!stored) throw new Error("User not found.");
  
  const user = JSON.parse(stored) as User;
  if (user.email !== email) throw new Error("Invalid credentials.");
  
  // Note: Password check skipped for mock
  return user;
};

export const mockVerifyOTP = async (otp: string): Promise<User> => {
  await new Promise(r => setTimeout(r, LATENCY));
  const stored = localStorage.getItem(STORAGE_KEYS.USER);
  if (!stored) throw new Error("No session.");
  
  // Mock Logic: Any 6 digit OTP works if it's not '000000'
  if (otp.length !== 6 || otp === '000000') throw new Error("Invalid OTP.");

  const user = JSON.parse(stored) as User;
  user.isVerified = true;
  localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
  return user;
};

export const getSession = (): User | null => {
  const stored = localStorage.getItem(STORAGE_KEYS.USER);
  return stored ? JSON.parse(stored) : null;
};

export const logout = () => {
  localStorage.removeItem(STORAGE_KEYS.USER);
};

// --- API Key Simulation ---

export const getApiKeys = async (userId: string): Promise<ApiKey[]> => {
  await new Promise(r => setTimeout(r, LATENCY));
  const allKeys = JSON.parse(localStorage.getItem(STORAGE_KEYS.KEYS) || '[]') as ApiKey[];
  return allKeys.filter(k => k.userId === userId);
};

export const generateApiKey = async (userId: string): Promise<ApiKey> => {
  await new Promise(r => setTimeout(r, LATENCY));
  const allKeys = JSON.parse(localStorage.getItem(STORAGE_KEYS.KEYS) || '[]') as ApiKey[];
  const userKeys = allKeys.filter(k => k.userId === userId && k.status === 'active');
  
  if (userKeys.length >= 2) {
    throw new Error("Maximum of 2 active API keys allowed.");
  }

  const newKey: ApiKey = {
    id: 'key_' + Math.random().toString(36).substr(2, 9),
    key: `YUVI_${Math.random().toString(36).substr(2, 8).toUpperCase()}${Math.random().toString(36).substr(2, 8).toUpperCase()}`,
    status: 'active',
    createdAt: Date.now(),
    userId
  };

  allKeys.push(newKey);
  localStorage.setItem(STORAGE_KEYS.KEYS, JSON.stringify(allKeys));
  return newKey;
};

export const revokeApiKey = async (keyId: string): Promise<void> => {
  await new Promise(r => setTimeout(r, LATENCY));
  let allKeys = JSON.parse(localStorage.getItem(STORAGE_KEYS.KEYS) || '[]') as ApiKey[];
  allKeys = allKeys.map(k => k.id === keyId ? { ...k, status: 'revoked' } : k);
  localStorage.setItem(STORAGE_KEYS.KEYS, JSON.stringify(allKeys));
};

// --- Paste Simulation (Usually this is done via CURL/API) ---

export const getPastes = async (userId: string): Promise<Paste[]> => {
  await new Promise(r => setTimeout(r, LATENCY));
  const allPastes = JSON.parse(localStorage.getItem(STORAGE_KEYS.PASTES) || '[]') as Paste[];
  return allPastes.filter(p => p.userId === userId).sort((a, b) => b.createdAt - a.createdAt);
};

export const getPasteById = async (pasteId: string): Promise<Paste | null> => {
  await new Promise(r => setTimeout(r, 400));
  const allPastes = JSON.parse(localStorage.getItem(STORAGE_KEYS.PASTES) || '[]') as Paste[];
  return allPastes.find(p => p.id === pasteId) || null;
};

// Mock function to simulate the API endpoint behaviour from the client side for demonstration
export const simulateCreatePasteApi = async (apiKey: string, title: string, content: string, type: 'json'|'text'|'code'): Promise<Paste> => {
   await new Promise(r => setTimeout(r, LATENCY));
   
   // Validate Key
   const allKeys = JSON.parse(localStorage.getItem(STORAGE_KEYS.KEYS) || '[]') as ApiKey[];
   const validKey = allKeys.find(k => k.key === apiKey && k.status === 'active');
   if (!validKey) throw new Error("Invalid or inactive API Key.");

   // Validate Limit
   const allPastes = JSON.parse(localStorage.getItem(STORAGE_KEYS.PASTES) || '[]') as Paste[];
   const userPastes = allPastes.filter(p => p.userId === validKey.userId);
   if (userPastes.length >= 10) throw new Error("Paste limit reached (Max 10).");

   const newPaste: Paste = {
     id: Math.random().toString(36).substr(2, 6).toUpperCase(), // Short ID like 'A9fK2Q'
     title: title || 'Untitled',
     content,
     type,
     createdAt: Date.now(),
     userId: validKey.userId,
     size: content.length
   };

   allPastes.push(newPaste);
   localStorage.setItem(STORAGE_KEYS.PASTES, JSON.stringify(allPastes));
   return newPaste;
}