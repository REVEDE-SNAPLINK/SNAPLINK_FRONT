export type UserType = 'user' | 'photographer' | 'admin';

// TODO: API 설계 후 수정
export type User = {
  id: string;
  name: string;
  userType: UserType;
  email?: string;
  profileImage?: string;
}

export type UserProfile = {
  id: string;
  nickname: string;
  name: string;
  email: string;
  profileImage?: string;
  userType: UserType;
  isExpertMode: boolean;
  createdAt: string;
}

export type Consent = {
  id: string;
  title: string;
  required: boolean;
  isChecked: boolean;
}