import {
  getUserProfile,
  updateUserProfile,
  toggleExpertMode,
  uploadProfileImage,
} from '../profile';
import { UserProfile } from '@/types/auth';

describe('Profile API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getUserProfile', () => {
    it('should return user profile data', async () => {
      const userId = '1';
      const result = await getUserProfile(userId);

      expect(result).toBeDefined();
      expect(result.id).toBe('1');
      expect(result.nickname).toBe('스냅유저123');
      expect(result.name).toBe('김철수');
      expect(result.email).toBe('user@snaplink.com');
      expect(result.profileImage).toBe('https://picsum.photos/200/200?random=user1');
      expect(result.userType).toBe('user');
      expect(result.isExpertMode).toBe(false);
      expect(result.createdAt).toBe('2024-01-10T09:00:00Z');
    });

    it('should have correct type structure', async () => {
      const userId = '1';
      const result = await getUserProfile(userId);

      expect(result).toMatchObject({
        id: expect.any(String),
        nickname: expect.any(String),
        name: expect.any(String),
        email: expect.any(String),
        profileImage: expect.any(String),
        userType: expect.stringMatching(/^(user|photographer|admin)$/),
        isExpertMode: expect.any(Boolean),
        createdAt: expect.any(String),
      });
    });

    it('should simulate API delay', async () => {
      const userId = '1';
      const startTime = Date.now();
      await getUserProfile(userId);
      const endTime = Date.now();

      // Should take at least 500ms (simulated API delay)
      expect(endTime - startTime).toBeGreaterThanOrEqual(400); // Allow 100ms margin
    });
  });

  describe('updateUserProfile', () => {
    it('should update user profile with partial data', async () => {
      const userId = '1';
      const updates: Partial<UserProfile> = {
        nickname: '새닉네임',
        name: '홍길동',
      };

      const result = await updateUserProfile(userId, updates);

      expect(result.nickname).toBe('새닉네임');
      expect(result.name).toBe('홍길동');
      expect(result.email).toBe('user@snaplink.com'); // Unchanged
    });

    it('should update only nickname', async () => {
      const userId = '1';
      const updates: Partial<UserProfile> = {
        nickname: '업데이트된닉네임',
      };

      const result = await updateUserProfile(userId, updates);

      expect(result.nickname).toBe('업데이트된닉네임');
      expect(result.name).toBe('김철수'); // Original value
      expect(result.email).toBe('user@snaplink.com'); // Original value
    });

    it('should update only email', async () => {
      const userId = '1';
      const updates: Partial<UserProfile> = {
        email: 'newemail@snaplink.com',
      };

      const result = await updateUserProfile(userId, updates);

      expect(result.email).toBe('newemail@snaplink.com');
      expect(result.nickname).toBe('스냅유저123'); // Original value
      expect(result.name).toBe('김철수'); // Original value
    });

    it('should update profile image', async () => {
      const userId = '1';
      const updates: Partial<UserProfile> = {
        profileImage: 'https://new-profile-image.jpg',
      };

      const result = await updateUserProfile(userId, updates);

      expect(result.profileImage).toBe('https://new-profile-image.jpg');
    });

    it('should handle multiple fields update', async () => {
      const userId = '1';
      const updates: Partial<UserProfile> = {
        nickname: '멀티업데이트',
        name: '테스트유저',
        email: 'multi@test.com',
        profileImage: 'https://multi-update.jpg',
      };

      const result = await updateUserProfile(userId, updates);

      expect(result.nickname).toBe('멀티업데이트');
      expect(result.name).toBe('테스트유저');
      expect(result.email).toBe('multi@test.com');
      expect(result.profileImage).toBe('https://multi-update.jpg');
    });

    it('should simulate API delay', async () => {
      const userId = '1';
      const updates: Partial<UserProfile> = { nickname: '새닉네임' };

      const startTime = Date.now();
      await updateUserProfile(userId, updates);
      const endTime = Date.now();

      expect(endTime - startTime).toBeGreaterThanOrEqual(400);
    });

    it('should preserve original fields not in updates', async () => {
      const userId = '1';
      const updates: Partial<UserProfile> = {
        nickname: 'Only Nickname Changed',
      };

      const result = await updateUserProfile(userId, updates);

      expect(result.id).toBe('1');
      expect(result.userType).toBe('user');
      expect(result.isExpertMode).toBe(false);
      expect(result.createdAt).toBe('2024-01-10T09:00:00Z');
    });
  });

  describe('toggleExpertMode', () => {
    it('should enable expert mode', async () => {
      const userId = '1';
      const result = await toggleExpertMode(userId, true);

      expect(result.isExpertMode).toBe(true);
      expect(result.userType).toBe('photographer');
    });

    it('should disable expert mode', async () => {
      const userId = '1';
      const result = await toggleExpertMode(userId, false);

      expect(result.isExpertMode).toBe(false);
      expect(result.userType).toBe('user');
    });

    it('should change userType to photographer when expert mode is enabled', async () => {
      const userId = '1';
      const result = await toggleExpertMode(userId, true);

      expect(result.userType).toBe('photographer');
    });

    it('should change userType to user when expert mode is disabled', async () => {
      const userId = '1';
      const result = await toggleExpertMode(userId, false);

      expect(result.userType).toBe('user');
    });

    it('should preserve other profile data when toggling', async () => {
      const userId = '1';
      const result = await toggleExpertMode(userId, true);

      expect(result.id).toBe('1');
      expect(result.nickname).toBe('스냅유저123');
      expect(result.name).toBe('김철수');
      expect(result.email).toBe('user@snaplink.com');
      expect(result.profileImage).toBe('https://picsum.photos/200/200?random=user1');
      expect(result.createdAt).toBe('2024-01-10T09:00:00Z');
    });

    it('should simulate API delay', async () => {
      const userId = '1';
      const startTime = Date.now();
      await toggleExpertMode(userId, true);
      const endTime = Date.now();

      expect(endTime - startTime).toBeGreaterThanOrEqual(400);
    });

    it('should toggle from enabled to disabled', async () => {
      const userId = '1';

      // Enable first
      const enabledResult = await toggleExpertMode(userId, true);
      expect(enabledResult.isExpertMode).toBe(true);

      // Then disable
      const disabledResult = await toggleExpertMode(userId, false);
      expect(disabledResult.isExpertMode).toBe(false);
      expect(disabledResult.userType).toBe('user');
    });
  });

  describe('uploadProfileImage', () => {
    it('should return uploaded image URL', async () => {
      const userId = '1';
      const imageUri = 'file://local/path/to/image.jpg';

      const result = await uploadProfileImage(userId, imageUri);

      expect(result).toBe(imageUri);
      expect(typeof result).toBe('string');
    });

    it('should handle different image formats', async () => {
      const userId = '1';
      const imageFormats = [
        'file://local/image.jpg',
        'file://local/image.png',
        'file://local/image.jpeg',
        'https://remote/image.jpg',
      ];

      for (const imageUri of imageFormats) {
        const result = await uploadProfileImage(userId, imageUri);
        expect(result).toBe(imageUri);
      }
    });

    it('should simulate API delay (longer than other operations)', async () => {
      const userId = '1';
      const imageUri = 'file://local/path/to/image.jpg';

      const startTime = Date.now();
      await uploadProfileImage(userId, imageUri);
      const endTime = Date.now();

      // Upload should take at least 800ms (longer than other operations)
      expect(endTime - startTime).toBeGreaterThanOrEqual(700); // Allow 100ms margin
    });

    it('should handle empty string URI', async () => {
      const userId = '1';
      const imageUri = '';

      const result = await uploadProfileImage(userId, imageUri);

      expect(result).toBe('');
    });

    it('should handle various URI formats', async () => {
      const userId = '1';
      const testUris = [
        'https://example.com/image.jpg',
        'file:///path/to/local/image.png',
        'content://media/external/images/media/123',
      ];

      for (const uri of testUris) {
        const result = await uploadProfileImage(userId, uri);
        expect(result).toBe(uri);
      }
    });
  });

  describe('API Integration', () => {
    it('should handle sequential API calls', async () => {
      const userId = '1';

      // Get profile
      const profile = await getUserProfile(userId);
      expect(profile.nickname).toBe('스냅유저123');

      // Update profile
      const updated = await updateUserProfile(userId, { nickname: '새닉네임' });
      expect(updated.nickname).toBe('새닉네임');

      // Toggle expert mode
      const toggled = await toggleExpertMode(userId, true);
      expect(toggled.isExpertMode).toBe(true);

      // Upload image
      const imageUrl = await uploadProfileImage(userId, 'file://new-image.jpg');
      expect(imageUrl).toBe('file://new-image.jpg');
    });

    it('should maintain data consistency across operations', async () => {
      const userId = '1';

      const profile = await getUserProfile(userId);
      const initialId = profile.id;
      const initialCreatedAt = profile.createdAt;

      const updated = await updateUserProfile(userId, { nickname: 'Updated' });
      expect(updated.id).toBe(initialId);
      expect(updated.createdAt).toBe(initialCreatedAt);

      const toggled = await toggleExpertMode(userId, true);
      expect(toggled.id).toBe(initialId);
      expect(toggled.createdAt).toBe(initialCreatedAt);
    });
  });

  describe('Type Safety', () => {
    it('should return UserProfile type from getUserProfile', async () => {
      const userId = '1';
      const result: UserProfile = await getUserProfile(userId);

      expect(result).toBeDefined();
    });

    it('should accept Partial<UserProfile> for updateUserProfile', async () => {
      const userId = '1';
      const updates: Partial<UserProfile> = {
        nickname: 'Test',
      };

      const result: UserProfile = await updateUserProfile(userId, updates);
      expect(result).toBeDefined();
    });

    it('should return UserProfile from toggleExpertMode', async () => {
      const userId = '1';
      const result: UserProfile = await toggleExpertMode(userId, true);

      expect(result).toBeDefined();
    });

    it('should return string from uploadProfileImage', async () => {
      const userId = '1';
      const result: string = await uploadProfileImage(userId, 'test.jpg');

      expect(typeof result).toBe('string');
    });
  });
});
