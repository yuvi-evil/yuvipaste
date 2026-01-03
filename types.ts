export interface User {
  uid: string;
  email: string;
  isVerified: boolean;
  createdAt: number;
}

export interface ApiKey {
  id: string;
  key: string; // YUVI_xxxxxxxx
  status: 'active' | 'revoked';
  createdAt: number;
  userId: string;
}

export interface Paste {
  id: string;
  title: string;
  content: string;
  type: 'json' | 'text' | 'code' | 'markdown';
  createdAt: number;
  userId: string;
  size: number;
}

export interface AuthState {
  user: User | null;
  isLoading: boolean;
}

export enum RoutePath {
  HOME = '/',
  LOGIN = '/login',
  REGISTER = '/register',
  VERIFY = '/verify',
  DASHBOARD = '/dashboard',
  API_KEYS = '/dashboard/keys',
  MY_PASTES = '/dashboard/pastes',
  PASTE_VIEW = '/paste/:id',
  RAW_VIEW = '/raw/:id'
}