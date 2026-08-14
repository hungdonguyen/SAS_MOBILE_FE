import { StudentUserSession } from '../types/studentTypes';

let sessionState: StudentUserSession | null = {
  userId: 'stu_2211001',
  username: 'stu_2211001',
  role: 'student',
  hasRegisteredFace: false,
};

let storedAccessToken: string | null = null;

export const authStorage = {
  getUser: (): StudentUserSession | null => {
    return sessionState;
  },

  setUser: (user: StudentUserSession): void => {
    sessionState = user;
  },

  setAccessToken: (token: string | null): void => {
    storedAccessToken = token;
  },

  getAccessToken: (): string | null => {
    return storedAccessToken;
  },

  setHasRegisteredFace: (status: boolean): void => {
    if (sessionState) {
      sessionState.hasRegisteredFace = status;
    }
  },

  clearUser: (): void => {
    sessionState = null;
    storedAccessToken = null;
  },

  isAuthenticated: (): boolean => {
    return sessionState !== null;
  },
};
