import * as Keychain from 'react-native-keychain';

export type StoredTokens = {
  refreshToken: string;
}

const SERVICE = 'com.snaplink.auth.tokens';

export async function saveRefreshToken(refreshToken: string) {
  await Keychain.setGenericPassword(
    'refresh',
    refreshToken,
    {
      service: SERVICE,
      accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
    }
  );
}

export async function loadRefreshToken(): Promise<string | null> {
  const response = await Keychain.getGenericPassword({ service: SERVICE });
  if (!response) return null;
  return response.password;
}

export async function clearRefreshToken() {
  await Keychain.resetGenericPassword({ service: SERVICE });
}