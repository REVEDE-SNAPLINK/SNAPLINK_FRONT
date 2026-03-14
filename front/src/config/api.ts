import remoteConfig from '@react-native-firebase/remote-config';

const DEFAULTS = {
  API_BASE_URL: 'https://api.snaplink.run',
  KAKAO_NATIVE_APP_KEY: 'fa46338c23ef208df3620a7eef81f6a6',
  CLOUDFRONT_BASE_URL: 'https://datsbgc37wc3i.cloudfront.net/',
  WEBSITE_URL: 'https://www.snaplink.run',
};

export const getApiBaseUrl = () =>
  remoteConfig().getString('API_BASE_URL') || DEFAULTS.API_BASE_URL;

export const getKakaoNativeAppKey = () =>
  remoteConfig().getString('KAKAO_NATIVE_APP_KEY') || DEFAULTS.KAKAO_NATIVE_APP_KEY;

export const getCloudfrontBaseUrl = () =>
  remoteConfig().getString('CLOUDFRONT_BASE_URL') || DEFAULTS.CLOUDFRONT_BASE_URL;

export const getWebsiteUrl = () =>
  remoteConfig().getString('WEBSITE_URL') || DEFAULTS.WEBSITE_URL;

export async function initRemoteConfig() {
  await remoteConfig().setDefaults(DEFAULTS);
  await remoteConfig().setConfigSettings({ minimumFetchIntervalMillis: 3600000 });
  await remoteConfig().fetchAndActivate();
}
