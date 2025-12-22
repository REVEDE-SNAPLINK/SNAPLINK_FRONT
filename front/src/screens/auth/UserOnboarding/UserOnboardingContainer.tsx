import { useState, useCallback, useMemo, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import UserOnboardingView, {
  UserOnboardingFormData,
} from '@/screens/auth/UserOnboarding/UserOnboardingView.tsx';
import { AuthStackParamList, RootNavigationProp } from '@/types/navigation.ts';
import { useAuthStore } from '@/store/authStore.ts';
import { SignUpFormData } from '@/api/auth.ts';

type UserOnboardingRouteProp = RouteProp<AuthStackParamList, 'UserOnboarding'>;

const REQUIRED_TERMS = ['age', 'service', 'privacy'];
const TOTAL_STEPS = 5;

export default function UserOnboardingContainer() {
  const route = useRoute<UserOnboardingRouteProp>();
  const navigation = useNavigation<RootNavigationProp>();
  const { userId, signUp } = useAuthStore();
  const type = route.params.type;

  const [currentStep, setCurrentStep] = useState(0);
  const [agreedTerms, setAgreedTerms] = useState<string[]>([]);
  const [showTermsError, setShowTermsError] = useState(false);
  const [nicknameError, setNicknameError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    formState: { errors },
    trigger,
    watch,
  } = useForm<UserOnboardingFormData>({
    defaultValues: {
      agreedTerms: [],
      name: '',
      nickname: '',
      birthDate: null,
      gender: null,
    },
    mode: 'onChange',
  });

  const watchedName = watch('name');
  const watchedNickname = watch('nickname');
  const watchedBirthDate = watch('birthDate');
  const watchedGender = watch('gender');

  // 닉네임이 변경되면 중복 에러 초기화
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    setNicknameError(null);
  }, [watchedNickname]);

  const handleToggleTerm = useCallback((termId: string) => {
    setShowTermsError(false);
    setAgreedTerms((prev) => {
      if (prev.includes(termId)) {
        return prev.filter((id) => id !== termId);
      }
      return [...prev, termId];
    });
  }, []);

  const handleToggleAllTerms = useCallback(() => {
    setShowTermsError(false);
    const allTermIds = ['age', 'service', 'privacy', 'optional', 'marketing', 'notification'];
    setAgreedTerms((prev) => {
      if (prev.length === allTermIds.length) {
        return [];
      }
      return allTermIds;
    });
  }, []);

  const checkNicknameDuplicate = useCallback(async (nickname: string): Promise<boolean> => {
    // TODO: API 호출로 변경
    // const response = await checkNicknameAPI(nickname);
    // return response.isDuplicate;

    // 임시: 테스트용 중복 닉네임 목록
    const duplicateNicknames = ['테스트', 'admin', 'test', '관리자'];
    return duplicateNicknames.includes(nickname.trim());
  }, []);

  const validateStep = useCallback(
    async (step: number): Promise<boolean> => {
      switch (step) {
        case 0:
          return REQUIRED_TERMS.every((termId) =>
            agreedTerms.includes(termId)
          );
        case 1:
          return await trigger('name');
        case 2:
          const isNicknameValid = await trigger('nickname');
          if (!isNicknameValid) return false;

          // 닉네임 중복 체크
          const isDuplicate = await checkNicknameDuplicate(watchedNickname);
          if (isDuplicate) {
            setNicknameError('이미 사용 중인 닉네임이에요!');
            return false;
          }
          setNicknameError(null);
          return true;
        case 3:
          return await trigger('birthDate');
        case 4:
          return await trigger('gender');
        default:
          return false;
      }
    },
    [agreedTerms, trigger, checkNicknameDuplicate, watchedNickname]
  );

  const isStepValid = useMemo(() => {
    switch (currentStep) {
      case 0:
        return REQUIRED_TERMS.every((termId) => agreedTerms.includes(termId));
      case 1:
        return watchedName.trim() !== '';
      case 2:
        return watchedNickname.trim() !== '';
      case 3:
        return watchedBirthDate !== null;
      case 4:
        return watchedGender !== null;
      default:
        return false;
    }
  }, [currentStep, agreedTerms, watchedName, watchedNickname, watchedBirthDate, watchedGender]);

  const handlePressSubmit = async () => {
    // 버튼 disabled 상태 재확인
    if (!isStepValid) {
      // 약관 동의 스텝에서 에러 표시
      if (currentStep === 0) {
        setShowTermsError(true);
      }
      return;
    }

    const isValid = await validateStep(currentStep);

    if (!isValid) {
      // 약관 동의 스텝에서 에러 표시
      if (currentStep === 0) {
        setShowTermsError(true);
      }
      return;
    }

    // 다음 스텝으로 이동하면 에러 초기화
    setShowTermsError(false);

    if (currentStep < TOTAL_STEPS - 1) {
      setCurrentStep((prev) => prev + 1);
    } else {
      await handleSubmit(onSubmit)();
    }
  };

  const onSubmit = useCallback(
    async (data: UserOnboardingFormData) => {
      const YYYY = data.birthDate?.getFullYear();
      const MM = data.birthDate?.getMonth();
      const DD = data.birthDate?.getDate();

      const signUpData: SignUpFormData = {
        name: data.name,
        nickname: data.nickname,
        email: '',
        birthDate: `${YYYY}-${MM}-${DD}`,
        gender: data.gender,
        consentMarketing: data.agreedTerms.includes('marketing'),
        id: userId as string
      };

      await signUp(signUpData);
      navigation.replace('Main');
    },
    [signUp, userId, navigation],
  );

  const submitButtonText = currentStep === TOTAL_STEPS - 1 ? '완료' : '다음';

  return (
    <UserOnboardingView
      currentStep={currentStep}
      control={control}
      errors={errors}
      onPressSubmit={handlePressSubmit}
      onToggleTerm={handleToggleTerm}
      onToggleAllTerms={handleToggleAllTerms}
      agreedTerms={agreedTerms}
      showTermsError={showTermsError}
      nicknameError={nicknameError}
      isSubmitDisabled={!isStepValid}
      submitButtonText={submitButtonText}
    />
  );
}
