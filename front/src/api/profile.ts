import { UserProfile } from '@/types/auth';

/**
 * Dummy user profile data for development
 * TODO: Replace with actual API call when backend is ready
 */
const DUMMY_USER_PROFILE: UserProfile = {
  id: '1',
  nickname: '스냅유저123',
  name: '김철수',
  email: 'user@snaplink.com',
  profileImage: 'https://picsum.photos/200/200?random=user1',
  userType: 'user',
  isExpertMode: false,
  createdAt: '2024-01-10T09:00:00Z',
};

/**
 * Fetch user profile data
 * TODO: Replace with actual API call
 */
export const getUserProfile = async (userId: string): Promise<UserProfile> => {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 500));

  // TODO: Replace with actual API call
  // const response = await fetch(`/api/users/${userId}/profile`);
  // const data = await response.json();
  // return data;

  return DUMMY_USER_PROFILE;
};

/**
 * Update user profile data
 * TODO: Replace with actual API call
 */
export const updateUserProfile = async (
  userId: string,
  updates: Partial<UserProfile>
): Promise<UserProfile> => {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 500));

  // TODO: Replace with actual API call
  // const response = await fetch(`/api/users/${userId}/profile`, {
  //   method: 'PUT',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify(updates),
  // });
  // const data = await response.json();
  // return data;

  return {
    ...DUMMY_USER_PROFILE,
    ...updates,
  };
};

/**
 * Toggle expert mode (user <-> photographer)
 * TODO: Replace with actual API call
 */
export const toggleExpertMode = async (
  userId: string,
  isExpertMode: boolean
): Promise<UserProfile> => {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 500));

  // TODO: Replace with actual API call
  // const response = await fetch(`/api/users/${userId}/expert-mode`, {
  //   method: 'PUT',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify({ isExpertMode }),
  // });
  // const data = await response.json();
  // return data;

  return {
    ...DUMMY_USER_PROFILE,
    isExpertMode,
    userType: isExpertMode ? 'photographer' : 'user',
  };
};

/**
 * Upload profile image
 * TODO: Replace with actual API call
 */
export const uploadProfileImage = async (
  userId: string,
  imageUri: string
): Promise<string> => {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 800));

  // TODO: Replace with actual API call
  // const formData = new FormData();
  // formData.append('image', {
  //   uri: imageUri,
  //   type: 'image/jpeg',
  //   name: 'profile.jpg',
  // });
  // const response = await fetch(`/api/users/${userId}/profile-image`, {
  //   method: 'POST',
  //   body: formData,
  // });
  // const data = await response.json();
  // return data.imageUrl;

  // Return the URI for now (in real app, this would be the uploaded image URL)
  return imageUri;
};
