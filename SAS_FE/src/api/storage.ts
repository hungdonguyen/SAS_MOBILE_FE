/**
 * Auth Storage helper for managing user session & token in memory / runtime.
 */
class AuthStorage {
  private accessToken: string | null = null;
  private userRole: 'admin' | 'lecturer' | 'student' | null = null;
  private userId: string | null = null;

  setToken(token: string | null): void {
    this.accessToken = token;
  }

  getToken(): string | null {
    return this.accessToken;
  }

  setUserSession(userId: string | null, role: 'admin' | 'lecturer' | 'student' | null, token?: string | null): void {
    this.userId = userId;
    this.userRole = role;
    if (token !== undefined) {
      this.accessToken = token;
    }
  }

  getUserRole(): 'admin' | 'lecturer' | 'student' | null {
    return this.userRole;
  }

  getUserId(): string | null {
    return this.userId;
  }

  clear(): void {
    this.accessToken = null;
    this.userRole = null;
    this.userId = null;
  }
}

export const authStorage = new AuthStorage();
