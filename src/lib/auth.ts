export interface AuthUser {
  id: string;
  email: string;
  name: string;
  farmName: string;
  phone: string;
  role: string;
  avatarUrl?: string;
}

const STORAGE_KEY = 'farmerp_user';

export function login(email: string, password: string): AuthUser | null {
  if (!email || !password) return null;

  if (typeof window === 'undefined') return null;

  // Check if a profile already exists in storage; if so, use it (keep custom name/farm)
  const existing = getUser();
  if (existing) {
    // Update only the email if they log in with a different one
    const updated = { ...existing, email };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return updated;
  }

  // First-ever login: create a fresh profile with entered email
  const newUser: AuthUser = {
    id: 'demo-user-001',
    email,
    name: 'Farm Owner',
    farmName: 'My Farm',
    phone: '',
    role: 'owner',
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(newUser));
  return newUser;
}

export function updateProfile(updates: Partial<AuthUser>): AuthUser | null {
  if (typeof window === 'undefined') return null;
  const current = getUser();
  if (!current) return null;
  const updated = { ...current, ...updates };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  return updated;
}

export function logout(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(STORAGE_KEY);
  }
}

export function getUser(): AuthUser | null {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        return null;
      }
    }
  }
  return null;
}

export function isAuthenticated(): boolean {
  return getUser() !== null;
}
