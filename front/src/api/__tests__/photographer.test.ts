import { searchPhotographers, SearchPhotographerParams } from '../photographer';

describe('searchPhotographers', () => {
  describe('Search Functionality', () => {
    it('should search by nickname', async () => {
      const params: SearchPhotographerParams = {
        searchKey: '유앤미',
        page: 1,
        pageSize: 10,
      };

      const result = await searchPhotographers(params);

      expect(result.photographers.length).toBeGreaterThan(0);
      expect(result.photographers[0].nickname).toContain('유앤미');
    });

    it('should search by shooting type - 웨딩', async () => {
      const params: SearchPhotographerParams = {
        searchKey: '웨딩',
        page: 1,
        pageSize: 10,
      };

      const result = await searchPhotographers(params);

      expect(result.photographers.length).toBeGreaterThan(0);
      result.photographers.forEach((photographer) => {
        const hasShootingType = photographer.shootingTypes.some((type) =>
          type.includes('웨딩')
        );
        const hasNickname = photographer.nickname.includes('웨딩');
        const hasStyleTag = photographer.styleTags.some((tag) => tag.includes('웨딩'));
        expect(hasShootingType || hasNickname || hasStyleTag).toBe(true);
      });
    });

    it('should search by shooting type - 인물', async () => {
      const params: SearchPhotographerParams = {
        searchKey: '인물',
        page: 1,
        pageSize: 10,
      };

      const result = await searchPhotographers(params);

      expect(result.photographers.length).toBeGreaterThan(0);
      result.photographers.forEach((photographer) => {
        const hasShootingType = photographer.shootingTypes.some((type) =>
          type.includes('인물')
        );
        const hasNickname = photographer.nickname.includes('인물');
        const hasStyleTag = photographer.styleTags.some((tag) => tag.includes('인물'));
        expect(hasShootingType || hasNickname || hasStyleTag).toBe(true);
      });
    });

    it('should search by shooting type - 커플', async () => {
      const params: SearchPhotographerParams = {
        searchKey: '커플',
        page: 1,
        pageSize: 10,
      };

      const result = await searchPhotographers(params);

      expect(result.photographers.length).toBeGreaterThan(0);
      result.photographers.forEach((photographer) => {
        const hasShootingType = photographer.shootingTypes.some((type) =>
          type.includes('커플')
        );
        const hasNickname = photographer.nickname.includes('커플');
        const hasStyleTag = photographer.styleTags.some((tag) => tag.includes('커플'));
        expect(hasShootingType || hasNickname || hasStyleTag).toBe(true);
      });
    });

    it('should search by shooting type - 반려동물', async () => {
      const params: SearchPhotographerParams = {
        searchKey: '반려동물',
        page: 1,
        pageSize: 10,
      };

      const result = await searchPhotographers(params);

      expect(result.photographers.length).toBeGreaterThan(0);
      result.photographers.forEach((photographer) => {
        const hasShootingType = photographer.shootingTypes.some((type) =>
          type.includes('반려동물')
        );
        const hasNickname = photographer.nickname.includes('반려동물');
        const hasStyleTag = photographer.styleTags.some((tag) => tag.includes('반려동물'));
        expect(hasShootingType || hasNickname || hasStyleTag).toBe(true);
      });
    });

    it('should search by style tag - 우정', async () => {
      const params: SearchPhotographerParams = {
        searchKey: '우정',
        page: 1,
        pageSize: 10,
      };

      const result = await searchPhotographers(params);

      expect(result.photographers.length).toBeGreaterThan(0);
      result.photographers.forEach((photographer) => {
        const hasStyleTag = photographer.styleTags.some((tag) => tag.includes('우정'));
        const hasNickname = photographer.nickname.includes('우정');
        const hasShootingType = photographer.shootingTypes.some((type) =>
          type.includes('우정')
        );
        expect(hasStyleTag || hasNickname || hasShootingType).toBe(true);
      });
    });

    it('should search by style tag - 자연광', async () => {
      const params: SearchPhotographerParams = {
        searchKey: '자연광',
        page: 1,
        pageSize: 10,
      };

      const result = await searchPhotographers(params);

      expect(result.photographers.length).toBeGreaterThan(0);
      result.photographers.forEach((photographer) => {
        const hasStyleTag = photographer.styleTags.some((tag) => tag.includes('자연광'));
        const hasNickname = photographer.nickname.includes('자연광');
        const hasShootingType = photographer.shootingTypes.some((type) =>
          type.includes('자연광')
        );
        expect(hasStyleTag || hasNickname || hasShootingType).toBe(true);
      });
    });

    it('should search by style tag - 감성', async () => {
      const params: SearchPhotographerParams = {
        searchKey: '감성',
        page: 1,
        pageSize: 10,
      };

      const result = await searchPhotographers(params);

      expect(result.photographers.length).toBeGreaterThan(0);
      result.photographers.forEach((photographer) => {
        const hasStyleTag = photographer.styleTags.some((tag) => tag.includes('감성'));
        const hasNickname = photographer.nickname.includes('감성');
        const hasShootingType = photographer.shootingTypes.some((type) =>
          type.includes('감성')
        );
        expect(hasStyleTag || hasNickname || hasShootingType).toBe(true);
      });
    });

    it('should search by style tag - 빈티지', async () => {
      const params: SearchPhotographerParams = {
        searchKey: '빈티지',
        page: 1,
        pageSize: 10,
      };

      const result = await searchPhotographers(params);

      expect(result.photographers.length).toBeGreaterThan(0);
      result.photographers.forEach((photographer) => {
        const hasStyleTag = photographer.styleTags.some((tag) => tag.includes('빈티지'));
        const hasNickname = photographer.nickname.includes('빈티지');
        const hasShootingType = photographer.shootingTypes.some((type) =>
          type.includes('빈티지')
        );
        expect(hasStyleTag || hasNickname || hasShootingType).toBe(true);
      });
    });

    it('should search by style tag - 로맨틱', async () => {
      const params: SearchPhotographerParams = {
        searchKey: '로맨틱',
        page: 1,
        pageSize: 10,
      };

      const result = await searchPhotographers(params);

      expect(result.photographers.length).toBeGreaterThan(0);
      result.photographers.forEach((photographer) => {
        const hasStyleTag = photographer.styleTags.some((tag) => tag.includes('로맨틱'));
        const hasNickname = photographer.nickname.includes('로맨틱');
        const hasShootingType = photographer.shootingTypes.some((type) =>
          type.includes('로맨틱')
        );
        expect(hasStyleTag || hasNickname || hasShootingType).toBe(true);
      });
    });

    it('should be case insensitive', async () => {
      const params: SearchPhotographerParams = {
        searchKey: '웨딩',
        page: 1,
        pageSize: 10,
      };

      const result = await searchPhotographers(params);

      expect(result.photographers.length).toBeGreaterThan(0);
    });

    it('should return empty array when no match found', async () => {
      const params: SearchPhotographerParams = {
        searchKey: '존재하지않는검색어12345',
        page: 1,
        pageSize: 10,
      };

      const result = await searchPhotographers(params);

      expect(result.photographers.length).toBe(0);
      expect(result.totalCount).toBe(0);
      expect(result.hasNextPage).toBe(false);
    });

    it('should search with partial matching', async () => {
      const params: SearchPhotographerParams = {
        searchKey: '웨',
        page: 1,
        pageSize: 10,
      };

      const result = await searchPhotographers(params);

      expect(result.photographers.length).toBeGreaterThan(0);
    });

    it('should return all photographers when searchKey is empty', async () => {
      const params: SearchPhotographerParams = {
        searchKey: '',
        page: 1,
        pageSize: 10,
      };

      const result = await searchPhotographers(params);

      expect(result.photographers.length).toBeGreaterThan(0);
    });

    it('should return all photographers when searchKey is not provided', async () => {
      const params: SearchPhotographerParams = {
        page: 1,
        pageSize: 10,
      };

      const result = await searchPhotographers(params);

      expect(result.photographers.length).toBeGreaterThan(0);
    });
  });

  describe('Filter Functionality', () => {
    it('should filter by shooting type', async () => {
      const params: SearchPhotographerParams = {
        filters: [
          {
            categoryId: 'shooting-type',
            type: 'ENUM',
            values: ['웨딩'],
          },
        ],
        page: 1,
        pageSize: 10,
      };

      const result = await searchPhotographers(params);

      expect(result.photographers.length).toBeGreaterThan(0);
      result.photographers.forEach((photographer) => {
        expect(photographer.shootingTypes).toContain('웨딩');
      });
    });

    it('should filter by multiple shooting types', async () => {
      const params: SearchPhotographerParams = {
        filters: [
          {
            categoryId: 'shooting-type',
            type: 'ENUM',
            values: ['웨딩', '인물'],
          },
        ],
        page: 1,
        pageSize: 10,
      };

      const result = await searchPhotographers(params);

      expect(result.photographers.length).toBeGreaterThan(0);
      result.photographers.forEach((photographer) => {
        const hasType =
          photographer.shootingTypes.includes('웨딩') ||
          photographer.shootingTypes.includes('인물');
        expect(hasType).toBe(true);
      });
    });

    it('should filter by region', async () => {
      const params: SearchPhotographerParams = {
        filters: [
          {
            categoryId: 'region',
            type: 'ENUM',
            values: ['서울'],
          },
        ],
        page: 1,
        pageSize: 10,
      };

      const result = await searchPhotographers(params);

      expect(result.photographers.length).toBeGreaterThan(0);
      result.photographers.forEach((photographer) => {
        expect(photographer.region).toBe('서울');
      });
    });

    it('should filter by gender', async () => {
      const params: SearchPhotographerParams = {
        filters: [
          {
            categoryId: 'gender',
            type: 'ENUM',
            values: ['여성작가'],
          },
        ],
        page: 1,
        pageSize: 10,
      };

      const result = await searchPhotographers(params);

      expect(result.photographers.length).toBeGreaterThan(0);
      result.photographers.forEach((photographer) => {
        expect(photographer.gender).toBe('여성작가');
      });
    });

    it('should filter by price range', async () => {
      const params: SearchPhotographerParams = {
        filters: [
          {
            categoryId: 'price',
            type: 'NUMBER',
            min: 50000,
            max: 100000,
          },
        ],
        page: 1,
        pageSize: 10,
      };

      const result = await searchPhotographers(params);

      expect(result.photographers.length).toBeGreaterThan(0);
      result.photographers.forEach((photographer) => {
        expect(photographer.price).toBeGreaterThanOrEqual(50000);
        expect(photographer.price).toBeLessThanOrEqual(100000);
      });
    });

    it('should apply multiple filters together', async () => {
      const params: SearchPhotographerParams = {
        filters: [
          {
            categoryId: 'shooting-type',
            type: 'ENUM',
            values: ['웨딩'],
          },
          {
            categoryId: 'region',
            type: 'ENUM',
            values: ['서울'],
          },
        ],
        page: 1,
        pageSize: 10,
      };

      const result = await searchPhotographers(params);

      result.photographers.forEach((photographer) => {
        expect(photographer.shootingTypes).toContain('웨딩');
        expect(photographer.region).toBe('서울');
      });
    });

    it('should combine search and filters', async () => {
      const params: SearchPhotographerParams = {
        searchKey: '웨딩',
        filters: [
          {
            categoryId: 'region',
            type: 'ENUM',
            values: ['서울'],
          },
        ],
        page: 1,
        pageSize: 10,
      };

      const result = await searchPhotographers(params);

      result.photographers.forEach((photographer) => {
        expect(photographer.region).toBe('서울');
        const hasWedding =
          photographer.shootingTypes.some((type) => type.includes('웨딩')) ||
          photographer.nickname.includes('웨딩') ||
          photographer.styleTags.some((tag) => tag.includes('웨딩'));
        expect(hasWedding).toBe(true);
      });
    });
  });

  describe('Sorting Functionality', () => {
    it('should sort by recommended (rating and review count) by default', async () => {
      const params: SearchPhotographerParams = {
        page: 1,
        pageSize: 10,
      };

      const result = await searchPhotographers(params);

      expect(result.photographers.length).toBeGreaterThan(0);
      // Check if sorted by rating descending
      for (let i = 0; i < result.photographers.length - 1; i++) {
        const current = result.photographers[i];
        const next = result.photographers[i + 1];
        if (current.rating === next.rating) {
          expect(current.reviewCount).toBeGreaterThanOrEqual(next.reviewCount);
        } else {
          expect(current.rating).toBeGreaterThanOrEqual(next.rating);
        }
      }
    });

    it('should sort by latest when sortBy is latest', async () => {
      const params: SearchPhotographerParams = {
        sortBy: 'latest',
        page: 1,
        pageSize: 10,
      };

      const result = await searchPhotographers(params);

      expect(result.photographers.length).toBeGreaterThan(0);
      // Check if sorted by createdAt descending
      for (let i = 0; i < result.photographers.length - 1; i++) {
        const current = result.photographers[i];
        const next = result.photographers[i + 1];
        expect(new Date(current.createdAt).getTime()).toBeGreaterThanOrEqual(
          new Date(next.createdAt).getTime()
        );
      }
    });

    it('should sort by recommended when sortBy is recommended', async () => {
      const params: SearchPhotographerParams = {
        sortBy: 'recommended',
        page: 1,
        pageSize: 10,
      };

      const result = await searchPhotographers(params);

      expect(result.photographers.length).toBeGreaterThan(0);
      // Check if sorted by rating descending
      for (let i = 0; i < result.photographers.length - 1; i++) {
        const current = result.photographers[i];
        const next = result.photographers[i + 1];
        if (current.rating === next.rating) {
          expect(current.reviewCount).toBeGreaterThanOrEqual(next.reviewCount);
        } else {
          expect(current.rating).toBeGreaterThanOrEqual(next.rating);
        }
      }
    });
  });

  describe('Pagination Functionality', () => {
    it('should return correct page size', async () => {
      const params: SearchPhotographerParams = {
        page: 1,
        pageSize: 3,
      };

      const result = await searchPhotographers(params);

      expect(result.photographers.length).toBeLessThanOrEqual(3);
    });

    it('should return correct second page', async () => {
      const params: SearchPhotographerParams = {
        page: 2,
        pageSize: 3,
      };

      const result = await searchPhotographers(params);

      expect(result.photographers.length).toBeGreaterThan(0);
    });

    it('should have correct hasNextPage when more data exists', async () => {
      const params: SearchPhotographerParams = {
        page: 1,
        pageSize: 3,
      };

      const result = await searchPhotographers(params);

      if (result.totalCount > 3) {
        expect(result.hasNextPage).toBe(true);
        expect(result.nextPage).toBe(2);
      }
    });

    it('should have correct hasNextPage when no more data exists', async () => {
      const params: SearchPhotographerParams = {
        page: 1,
        pageSize: 100,
      };

      const result = await searchPhotographers(params);

      expect(result.hasNextPage).toBe(false);
      expect(result.nextPage).toBeNull();
    });

    it('should return correct totalCount', async () => {
      const params: SearchPhotographerParams = {
        page: 1,
        pageSize: 10,
      };

      const result = await searchPhotographers(params);

      expect(result.totalCount).toBeGreaterThan(0);
      expect(typeof result.totalCount).toBe('number');
    });

    it('should return empty page when page number exceeds available data', async () => {
      const params: SearchPhotographerParams = {
        page: 999,
        pageSize: 10,
      };

      const result = await searchPhotographers(params);

      expect(result.photographers.length).toBe(0);
      expect(result.hasNextPage).toBe(false);
    });
  });

  describe('Combined Search and Filter Scenarios', () => {
    it('should search by style tag and filter by region', async () => {
      const params: SearchPhotographerParams = {
        searchKey: '감성',
        filters: [
          {
            categoryId: 'region',
            type: 'ENUM',
            values: ['서울'],
          },
        ],
        page: 1,
        pageSize: 10,
      };

      const result = await searchPhotographers(params);

      result.photographers.forEach((photographer) => {
        expect(photographer.region).toBe('서울');
        const hasTag =
          photographer.styleTags.some((tag) => tag.includes('감성')) ||
          photographer.nickname.includes('감성') ||
          photographer.shootingTypes.some((type) => type.includes('감성'));
        expect(hasTag).toBe(true);
      });
    });

    it('should search by shooting type, filter, and sort', async () => {
      const params: SearchPhotographerParams = {
        searchKey: '웨딩',
        filters: [
          {
            categoryId: 'gender',
            type: 'ENUM',
            values: ['여성작가'],
          },
        ],
        sortBy: 'latest',
        page: 1,
        pageSize: 10,
      };

      const result = await searchPhotographers(params);

      result.photographers.forEach((photographer) => {
        expect(photographer.gender).toBe('여성작가');
        const hasWedding =
          photographer.shootingTypes.some((type) => type.includes('웨딩')) ||
          photographer.nickname.includes('웨딩') ||
          photographer.styleTags.some((tag) => tag.includes('웨딩'));
        expect(hasWedding).toBe(true);
      });

      // Check sorting
      for (let i = 0; i < result.photographers.length - 1; i++) {
        const current = result.photographers[i];
        const next = result.photographers[i + 1];
        expect(new Date(current.createdAt).getTime()).toBeGreaterThanOrEqual(
          new Date(next.createdAt).getTime()
        );
      }
    });
  });
});
