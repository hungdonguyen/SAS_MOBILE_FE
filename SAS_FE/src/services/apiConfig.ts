import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Default host: 10.0.2.2 for Android Emulator, localhost for iOS simulator
const DEFAULT_HOST = Platform.OS === 'android' ? 'http://10.0.2.2:3001' : 'http://localhost:3001';
const STORAGE_KEY_BASE_URL = '@sas_api_base_url';

let currentBaseUrl = DEFAULT_HOST;

export const apiConfig = {
  /**
   * Khởi tạo và khôi phục Base URL đã lưu từ AsyncStorage khi mở ứng dụng
   */
  init: async (): Promise<string> => {
    try {
      const savedUrl = await AsyncStorage.getItem(STORAGE_KEY_BASE_URL);
      if (savedUrl && savedUrl.trim()) {
        currentBaseUrl = savedUrl.trim().replace(/\/+$/, '');
      }
    } catch (e) {
      console.log('[apiConfig] Error loading stored Base URL:', e);
    }
    return currentBaseUrl;
  },

  getBaseUrl: (): string => currentBaseUrl,

  setBaseUrl: (newUrl: string): void => {
    if (newUrl && newUrl.trim()) {
      const formatted = newUrl.trim().replace(/\/+$/, '');
      currentBaseUrl = formatted;
      AsyncStorage.setItem(STORAGE_KEY_BASE_URL, formatted).catch((e) =>
        console.log('[apiConfig] Error persisting Base URL:', e),
      );
    }
  },

  resetDefault: (): void => {
    currentBaseUrl = DEFAULT_HOST;
    AsyncStorage.removeItem(STORAGE_KEY_BASE_URL).catch((e) =>
      console.log('[apiConfig] Error resetting Base URL:', e),
    );
  },

  getDefaultUrl: (): string => DEFAULT_HOST,
};
