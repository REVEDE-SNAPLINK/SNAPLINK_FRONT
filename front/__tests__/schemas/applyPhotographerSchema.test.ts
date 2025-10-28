import { applyPhotographerSchema } from '@/schemas/applyPhotographerSchema';

describe('applyPhotographerSchema', () => {
  const validData = {
    name: '홍길동',
    gender: 0,
    birthday: new Date('1990-01-01'),
    location: '서울',
    category: 0,
    photofolioImages: [{ uri: 'test.jpg' }],
    introduction: '안녕하세요. 10년 경력의 사진작가입니다.',
    profileImage: { uri: 'profile.jpg' },
  };

  describe('Valid cases', () => {
    it('should validate correct data', () => {
      const result = applyPhotographerSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });
  });

  describe('Name validation', () => {
    it('should fail when name is empty', () => {
      const result = applyPhotographerSchema.safeParse({
        ...validData,
        name: '',
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('이름을 입력해주세요');
      }
    });
  });

  describe('Gender validation', () => {
    it('should fail when gender is null', () => {
      const result = applyPhotographerSchema.safeParse({
        ...validData,
        gender: null,
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('성별을 선택해주세요');
      }
    });
  });

  describe('Birthday validation', () => {
    it('should fail when birthday is not provided', () => {
      const { birthday, ...dataWithoutBirthday } = validData;
      const result = applyPhotographerSchema.safeParse(dataWithoutBirthday);
      expect(result.success).toBe(false);
    });

    it('should accept valid date', () => {
      const result = applyPhotographerSchema.safeParse({
        ...validData,
        birthday: new Date('2000-05-15'),
      });
      expect(result.success).toBe(true);
    });
  });

  describe('Category validation', () => {
    it('should fail when category is null', () => {
      const result = applyPhotographerSchema.safeParse({
        ...validData,
        category: null,
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('촬영 유형을 선택해주세요');
      }
    });
  });

  describe('Photofolio images validation', () => {
    it('should fail when no images are provided', () => {
      const result = applyPhotographerSchema.safeParse({
        ...validData,
        photofolioImages: [],
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe(
          '포토폴리오 사진을 최소 1장 이상 업로드해주세요'
        );
      }
    });

    it('should accept multiple images', () => {
      const result = applyPhotographerSchema.safeParse({
        ...validData,
        photofolioImages: [
          { uri: 'test1.jpg' },
          { uri: 'test2.jpg' },
          { uri: 'test3.jpg' },
        ],
      });
      expect(result.success).toBe(true);
    });
  });

  describe('Introduction validation', () => {
    it('should fail when introduction is less than 10 characters', () => {
      const result = applyPhotographerSchema.safeParse({
        ...validData,
        introduction: '짧은글',
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe(
          '자기소개를 10자 이상 입력해주세요'
        );
      }
    });

    it('should accept introduction with 10 or more characters', () => {
      const result = applyPhotographerSchema.safeParse({
        ...validData,
        introduction: '열 글자 이상의 자기소개입니다.',
      });
      expect(result.success).toBe(true);
    });
  });

  describe('Profile image validation', () => {
    it('should fail when profile image is null', () => {
      const result = applyPhotographerSchema.safeParse({
        ...validData,
        profileImage: null,
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe(
          '프로필 사진을 업로드해주세요'
        );
      }
    });
  });
});
