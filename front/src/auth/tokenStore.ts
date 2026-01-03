import * as Keychain from 'react-native-keychain';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type StoredTokens = {
  refreshToken: string;
}

const SERVICE = 'com.snaplink.auth.tokens';
const USER_ID_KEY = '@snaplink:userId';
const USER_TYPE_KEY = '@snaplink:userType';

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

/**
 * Save userId to persistent storage
 */
export async function saveUserId(userId: string): Promise<void> {
  await AsyncStorage.setItem(USER_ID_KEY, userId);
}

/**
 * Load userId from persistent storage
 */
export async function loadUserId(): Promise<string | null> {
  return await AsyncStorage.getItem(USER_ID_KEY);
}

/**
 * Clear userId from persistent storage
 */
export async function clearUserId(): Promise<void> {
  await AsyncStorage.removeItem(USER_ID_KEY);
}

/**
 * Save userType to persistent storage
 */
export async function saveUserType(userType: 'user' | 'photographer'): Promise<void> {
  await AsyncStorage.setItem(USER_TYPE_KEY, userType);
}

/**
 * Load userType from persistent storage
 */
export async function loadUserType(): Promise<'user' | 'photographer' | null> {
  const type = await AsyncStorage.getItem(USER_TYPE_KEY);
  if (type === 'user' || type === 'photographer') {
    return type;
  }
  return null;
}

/**
 * Clear userType from persistent storage
 */
export async function clearUserType(): Promise<void> {
  await AsyncStorage.removeItem(USER_TYPE_KEY);
}