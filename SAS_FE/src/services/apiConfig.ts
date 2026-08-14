import { Platform } from 'react-native';

// Default host: 10.0.2.2 for Android Emulator, localhost for iOS simulator
const DEFAULT_HOST = Platform.OS === 'android' ? 'http://10.0.2.2:3001' : 'http://localhost:3001';

let currentBaseUrl = DEFAULT_HOST;

export const apiConfig = {
  getBaseUrl: (): string => currentBaseUrl,
  setBaseUrl: (newUrl: string): void => {
    if (newUrl && newUrl.trim()) {
      currentBaseUrl = newUrl.trim().replace(/\/+$/, ''); // Remove trailing slashes
    }
  },
  resetDefault: (): void => {
    currentBaseUrl = DEFAULT_HOST;
  },
  getDefaultUrl: (): string => DEFAULT_HOST,
};
