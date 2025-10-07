export type UserType = 'user' | 'photographer' | 'admin';

// TODO: API 설계 후 수정
export type User = {
  id: string;
  name: string;
  userType: UserType;
  email?: string;
  profileImage?: string;
}