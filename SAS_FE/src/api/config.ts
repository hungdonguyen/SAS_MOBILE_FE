import { Platform } from 'react-native';

/**
 * Platform-aware API Base URL resolver.
 * - Android Emulator uses 10.0.2.2 to reach host machine localhost.
 * - iOS Simulator / Web uses localhost / 127.0.0.1.
 * - Physical devices should use LAN IP (e.g. http://192.168.1.X:3001).
 */
const getBaseUrl = (): string => {
  if (__DEV__) {
    if (Platform.OS === 'android') {
      return 'http://10.0.2.2:3001';
    }
    return 'http://localhost:3001';
  }
  return 'http://localhost:3001';
};

export const API_BASE_URL = getBaseUrl();
export const API_TIMEOUT_MS = 15000;
