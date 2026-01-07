import { Linking } from 'react-native';
import InAppBrowser from 'react-native-inappbrowser-reborn';
import { WEBSITE_URL } from '@/config/api.ts';

export const openUrl = async (url: string) => {
  try {
    const isAvailable = await InAppBrowser.isAvailable();

    if (isAvailable) {
      await InAppBrowser.open(url, {
        // iOS
        dismissButtonStyle: 'close',
        preferredBarTintColor: '#ffffff',
        preferredControlTintColor: '#000000',

        // Android
        showTitle: true,
        enableUrlBarHiding: true,
        enableDefaultShare: false,
      });
    } else {
      // InAppBrowser 사용 불가 시 fallback
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      }
    }
  } catch (e) {
    console.warn('Failed to open url:', e);
  }
};

export const openTermUrl = (url: string) => {
  openUrl(WEBSITE_URL+url);
}