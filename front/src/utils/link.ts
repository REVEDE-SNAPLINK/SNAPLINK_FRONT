import { Linking } from 'react-native';
import { TERMS_BASE_URL } from '@/config/api.ts';

export const openUrl = async (url: string) => {
  const supported = await Linking.canOpenURL(url);

  if (supported) {
    await Linking.openURL(url);
  }
}

export const openTermUrl = () => {
  openUrl(TERMS_BASE_URL || 'https://snaplink-web-mu.vercel.app/');
}