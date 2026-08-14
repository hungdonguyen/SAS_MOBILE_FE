import { authStorage as serviceAuthStorage } from '../services/authStorage';

export interface UserSessionData {
  userId: string;
  username: string;
  fullName?: string | null;
  email?: string | null;
  role: 'admin' | 'lecturer' | 'student';
  avatarUrl?: string | null;
  hasRegisteredFace?: boolean;
  department?: string | null;
}

/**
 * Unified Auth Storage helper for managing user session & token.
 */
class AuthStorage {
  private userSession: UserSessionData | null = null;

  setToken(token: string | null): void {
    serviceAuthStorage.setAccessToken(token);
  }

  getToken(): string | null {
    return serviceAuthStorage.getAccessToken();
  }

  getAccessToken(): string | null {
    return serviceAuthStorage.getAccessToken();
  }

  setAccessToken(token: string | null): void {
    serviceAuthStorage.setAccessToken(token);
  }

  setUserSession(session: UserSessionData | null, token?: string | null): void {
    this.userSession = session;
    if (token !== undefined) {
      this.setToken(token);
    }
    if (session) {
      serviceAuthStorage.setUser({
        userId: session.userId,
        username: session.username,
        role: session.role,
        hasRegisteredFace: Boolean(session.hasRegisteredFace),
      });
    } else {
      serviceAuthStorage.clearUser();
    }
  }

  getUser(): UserSessionData | null {
    if (this.userSession) return this.userSession;
    const base = serviceAuthStorage.getUser();
    if (base) {
      return {
        userId: base.userId,
        username: base.username,
        role: base.role as any,
        hasRegisteredFace: base.hasRegisteredFace,
      };
    }
    return null;
  }

  getUserRole(): 'admin' | 'lecturer' | 'student' | null {
    const session = this.getUser();
    return session?.role || null;
  }

  getUserId(): string | null {
    const session = this.getUser();
    return session?.userId || null;
  }

  clear(): void {
    this.userSession = null;
    serviceAuthStorage.clearUser();
  }

  isAuthenticated(): boolean {
    return serviceAuthStorage.isAuthenticated() || this.userSession !== null;
  }
}

export const authStorage = new AuthStorage();
export default authStorage;
