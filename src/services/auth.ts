import { UserConfig } from '../types';

// Auth service interface for future backend integration
// This scaffolding supports multiple auth providers (Firebase, Supabase, custom backend)

export interface AuthProvider {
  signIn: (email: string, password: string) => Promise<UserConfig>;
  signUp: (email: string, password: string, displayName?: string) => Promise<UserConfig>;
  signOut: () => Promise<void>;
  getCurrentUser: () => Promise<UserConfig | null>;
  onAuthStateChange: (callback: (user: UserConfig | null) => void) => () => void;
  resetPassword: (email: string) => Promise<void>;
  updateProfile: (updates: Partial<UserConfig>) => Promise<UserConfig>;
}

// Local storage auth (for offline/demo mode)
class LocalAuthProvider implements AuthProvider {
  private USER_KEY = 'timely-user';

  async signIn(email: string, _password: string): Promise<UserConfig> {
    // In local mode, just create/retrieve user
    const existingUser = this.getStoredUser();
    if (existingUser && existingUser.email === email) {
      return existingUser;
    }

    const user: UserConfig = {
      id: `local-${Date.now()}`,
      email,
      displayName: email.split('@')[0],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    this.storeUser(user);
    return user;
  }

  async signUp(email: string, _password: string, displayName?: string): Promise<UserConfig> {
    const user: UserConfig = {
      id: `local-${Date.now()}`,
      email,
      displayName: displayName ?? email.split('@')[0],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    this.storeUser(user);
    return user;
  }

  async signOut(): Promise<void> {
    localStorage.removeItem(this.USER_KEY);
  }

  async getCurrentUser(): Promise<UserConfig | null> {
    return this.getStoredUser();
  }

  onAuthStateChange(callback: (user: UserConfig | null) => void): () => void {
    // Check current state
    const user = this.getStoredUser();
    callback(user);

    // Listen for storage changes (for cross-tab sync)
    const handler = (event: StorageEvent) => {
      if (event.key === this.USER_KEY) {
        callback(event.newValue ? JSON.parse(event.newValue) : null);
      }
    };

    window.addEventListener('storage', handler);
    return () => window.removeEventListener('storage', handler);
  }

  async resetPassword(_email: string): Promise<void> {
    // No-op in local mode
    console.log('Password reset is not available in local mode');
  }

  async updateProfile(updates: Partial<UserConfig>): Promise<UserConfig> {
    const user = this.getStoredUser();
    if (!user) {
      throw new Error('No user signed in');
    }

    const updatedUser: UserConfig = {
      ...user,
      ...updates,
      updatedAt: Date.now(),
    };

    this.storeUser(updatedUser);
    return updatedUser;
  }

  private getStoredUser(): UserConfig | null {
    const stored = localStorage.getItem(this.USER_KEY);
    return stored ? JSON.parse(stored) : null;
  }

  private storeUser(user: UserConfig): void {
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
  }
}

// Placeholder for future Firebase auth
class FirebaseAuthProvider implements AuthProvider {
  async signIn(_email: string, _password: string): Promise<UserConfig> {
    throw new Error('Firebase auth not configured. Set VITE_AUTH_PROVIDER=firebase and configure Firebase.');
  }

  async signUp(_email: string, _password: string, _displayName?: string): Promise<UserConfig> {
    throw new Error('Firebase auth not configured');
  }

  async signOut(): Promise<void> {
    throw new Error('Firebase auth not configured');
  }

  async getCurrentUser(): Promise<UserConfig | null> {
    return null;
  }

  onAuthStateChange(_callback: (user: UserConfig | null) => void): () => void {
    return () => {};
  }

  async resetPassword(_email: string): Promise<void> {
    throw new Error('Firebase auth not configured');
  }

  async updateProfile(_updates: Partial<UserConfig>): Promise<UserConfig> {
    throw new Error('Firebase auth not configured');
  }
}

// Placeholder for future Supabase auth
class SupabaseAuthProvider implements AuthProvider {
  async signIn(_email: string, _password: string): Promise<UserConfig> {
    throw new Error('Supabase auth not configured. Set VITE_AUTH_PROVIDER=supabase and configure Supabase.');
  }

  async signUp(_email: string, _password: string, _displayName?: string): Promise<UserConfig> {
    throw new Error('Supabase auth not configured');
  }

  async signOut(): Promise<void> {
    throw new Error('Supabase auth not configured');
  }

  async getCurrentUser(): Promise<UserConfig | null> {
    return null;
  }

  onAuthStateChange(_callback: (user: UserConfig | null) => void): () => void {
    return () => {};
  }

  async resetPassword(_email: string): Promise<void> {
    throw new Error('Supabase auth not configured');
  }

  async updateProfile(_updates: Partial<UserConfig>): Promise<UserConfig> {
    throw new Error('Supabase auth not configured');
  }
}

// Get the appropriate auth provider based on environment
function getAuthProvider(): AuthProvider {
  const provider = import.meta.env.VITE_AUTH_PROVIDER ?? 'local';

  switch (provider) {
    case 'firebase':
      return new FirebaseAuthProvider();
    case 'supabase':
      return new SupabaseAuthProvider();
    case 'local':
    default:
      return new LocalAuthProvider();
  }
}

// Export singleton auth service
export const auth = getAuthProvider();

// Helper hooks for React
export function useAuth() {
  return auth;
}
