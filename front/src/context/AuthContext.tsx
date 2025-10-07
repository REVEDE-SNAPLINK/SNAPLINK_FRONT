import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User } from '../types/auth.ts';

/**
 * 로그인 상태
 * checking: 인증 정보 확인 중
 * signedOut: 로그인 x
 * signedIn: 로그인 완료
 * needsSignup: 회원가입 필요
 */
type AuthStatus = 'checking' | 'signedOut' | 'signedIn' | 'needsSignup';

type AuthContextValue = {
  status: AuthStatus;
  user: User | null;
  autoLogin: boolean;
  setAutoLogin: (on: boolean) => Promise<void>;
  signIn: (token: string, user: User, isNew?: boolean) => Promise<void>;
  signOut: () => Promise<void>;
  completeSignup: (user: User) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue>(null as any);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [status, setStatus] = useState<AuthStatus>('checking');
  const [user, setUser] = useState<User | null>(null);
  const [autoLogin, setAutoLoginState] = useState<boolean>(true);

  useEffect(() => {
    (async () => {
      const storedAuto = await AsyncStorage.getItem('autoLogin');
      setAutoLoginState(storedAuto !== 'false'); // default: ON

      // TODO: 소셜 로그인 구현 후 수정
      const token = null;
      if (token /* && valid */ && (storedAuto !== 'false')) {
        setUser({ id: '123', userType: 'user', name: 'SnapUser' });
        setStatus('signedIn');
      } else {
        setStatus('signedOut');
      }
    })();
  }, []);

  // 자동 로그인 설정
  const setAutoLogin = async (on: boolean) => {
    setAutoLoginState(on);
    await AsyncStorage.setItem('autoLogin', on ? 'true' : 'false');
  };

  // 로그인
  const signIn = async (token: string, u: User, isNew?: boolean) => {
    setUser(u);
    setStatus(isNew ? 'needsSignup' : 'signedIn');
  };

  // 로그아웃
  const signOut = async () => {
    setUser(null);
    setStatus('signedOut');
  };

  // 회원가입 완료
  const completeSignup = async (u: User) => {
    setUser(u);
    setStatus('signedIn');
  };

  return (
    <AuthContext.Provider value={{ status, user, autoLogin, setAutoLogin, signIn, signOut, completeSignup }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);