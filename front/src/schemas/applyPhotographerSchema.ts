import { z } from 'zod';

const consentSchema = z.object({
  id: z.string(),
  title: z.string(),
  required: z.boolean(),
  isChecked: z.boolean(),
});

export const applyPhotographerSchema = z.object({
  name: z.string().min(1, { message: '이름을 입력해주세요' }),
  gender: z.number().nullable().refine((val) => val !== null, {
    message: '성별을 선택해주세요',
  }),
  birthday: z.date({ message: '생년월일을 선택해주세요' }),
  location: z.string().min(1, { message: '활동 지역을 선택해주세요' }).optional(),
  category: z.number().nullable().refine((val) => val !== null, {
    message: '촬영 유형을 선택해주세요',
  }),
  photofolioImages: z.array(z.any()).min(1, { message: '포토폴리오 사진을 최소 1장 이상 업로드해주세요' }),
  introduction: z.string().min(10, { message: '자기소개를 10자 이상 입력해주세요' }),
  profileImage: z.any().nullable().refine((val) => val !== null, {
    message: '프로필 사진을 업로드해주세요',
  }),
  consents: z.array(consentSchema).refine(
    (consents) => {
      // 모든 필수 동의 항목이 체크되었는지 확인
      return consents
        .filter((consent) => consent.required)
        .every((consent) => consent.isChecked);
    },
    { message: '필수 동의 항목을 모두 체크해주세요' }
  ),
});

export type ApplyPhotographerFormData = z.infer<typeof applyPhotographerSchema>;
