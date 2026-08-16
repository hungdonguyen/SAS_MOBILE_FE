import AsyncStorage from '@react-native-async-storage/async-storage';
import { StudentUserSession } from '../types/studentTypes';

const STORAGE_KEY_USER = '@sas_auth_user';
const STORAGE_KEY_TOKEN = '@sas_auth_token';

let sessionState: StudentUserSession | null = null;
let storedAccessToken: string | null = null;

export const authStorage = {
  /**
   * Khôi phục phiên đăng nhập và token từ AsyncStorage khi khởi động ứng dụng
   */
  init: async (): Promise<{ user: StudentUserSession | null; token: string | null }> => {
    try {
      const [savedUser, savedToken] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEY_USER),
        AsyncStorage.getItem(STORAGE_KEY_TOKEN),
      ]);

      if (savedUser) {
        sessionState = JSON.parse(savedUser);
      }
      if (savedToken) {
        storedAccessToken = savedToken;
      }
    } catch (e) {
      console.log('[authStorage] Error restoring auth storage from AsyncStorage:', e);
    }
    return { user: sessionState, token: storedAccessToken };
  },

  getUser: (): StudentUserSession | null => {
    return sessionState;
  },

  setUser: (user: StudentUserSession): void => {
    sessionState = user;
    AsyncStorage.setItem(STORAGE_KEY_USER, JSON.stringify(user)).catch((e) =>
      console.log('[authStorage] Error persisting user session:', e),
    );
  },

  setAccessToken: (token: string | null): void => {
    storedAccessToken = token;
    if (token) {
      AsyncStorage.setItem(STORAGE_KEY_TOKEN, token).catch((e) =>
        console.log('[authStorage] Error persisting access token:', e),
      );
    } else {
      AsyncStorage.removeItem(STORAGE_KEY_TOKEN).catch((e) =>
        console.log('[authStorage] Error removing access token:', e),
      );
    }
  },

  getAccessToken: (): string | null => {
    return storedAccessToken;
  },

  setHasRegisteredFace: (status: boolean): void => {
    if (sessionState) {
      sessionState.hasRegisteredFace = status;
      AsyncStorage.setItem(STORAGE_KEY_USER, JSON.stringify(sessionState)).catch((e) =>
        console.log('[authStorage] Error updating hasRegisteredFace:', e),
      );
    }
  },

  clearUser: (): void => {
    sessionState = null;
    storedAccessToken = null;
    Promise.all([
      AsyncStorage.removeItem(STORAGE_KEY_USER),
      AsyncStorage.removeItem(STORAGE_KEY_TOKEN),
    ]).catch((e) => console.log('[authStorage] Error clearing auth storage:', e));
  },

  isAuthenticated: (): boolean => {
    return sessionState !== null;
  },
};

