/**
 * NavigationService — holds a navigation ref so API interceptors
 * (which run outside React components) can navigate to Login
 * when a token refresh fails (401 Unauthorized).
 */
import { createNavigationContainerRef } from '@react-navigation/native';

export const navigationRef = createNavigationContainerRef<any>();

export const NavigationService = {
  navigate(name: string, params?: object) {
    if (navigationRef.isReady()) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (navigationRef as any).navigate(name, params);
    }
  },

  reset(name: string) {
    if (navigationRef.isReady()) {
      navigationRef.reset({ index: 0, routes: [{ name }] });
    }
  },
};
