import { useState, useCallback, useMemo, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import UserOnboardingView, {
  UserOnboardingFormData,
} from '@/screens/auth/UserOnboarding/UserOnboardingView.tsx';
import { useAuthStore } from '@/store/authStore.ts';
import { SignUpFormData } from '@/api/auth.ts';
import { requestPermission } from '@/utils/permissions.ts'
import { useNavigation } from '@react-navigation/native';
import { AuthNavigationProp, RootNavigationProp } from '@/types/navigation.ts';
import { Linking } from 'react-native';
import { Alert } from '@/components/theme';

const REQUIRED_TERMS = ['age', 'service', 'privacy'];
const TOTAL_STEPS = 6;

export default function UserOnboardingContainer() {
  const rootNavigation = useNavigation<RootNavigationProp>();
  const authNavigation = useNavigation<AuthNavigationProp>();
  const { userId, userType, signUp, setIsFirst, setUserType } = useAuthStore();

  const [currentStep, setCurrentStep] = useState(0);
  const [agreedTerms, setAgreedTerms] = useState<string[]>([]);
  const [showTermsError, setShowTermsError] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);
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
      email: '',
      nickname: '',
      birthDate: new Date(),
      gender: null,
    },
    mode: 'onChange',
  });

  const watchedName = watch('name');
  const watchedEmail = watch('email');
  const watchedNickname = watch('nickname');
  const watchedBirthDate = watch('birthDate');
  const watchedGender = watch('gender');

  // 닉네임이 변경되면 중복 에러 초기화
  useEffect(() => {
    setNicknameError(null);
  }, [watchedNickname]);

  const handlePressBack = () => {
    if (currentStep === 0) {
      authNavigation.goBack();
    } else {
      setCurrentStep((prev) => prev - 1);
    }
  }

  const handlePressUser = () => {
    setUserType('user');
    setCurrentStep(1);
  }
  const handlePressPhotographer = () => {
    setUserType('photographer');
    setCurrentStep(1);
  }

  const handlePressTermLink = async (url: string) => {
    const supported = await Linking.canOpenURL(url);

    if (supported) {
      await Linking.openURL(url);
    } else {
      Alert.show({
        'title': '링크 연결 실패',
        'message': '지원되지 않는 주소잆니다.',
      })
    }
  }

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

  const checkEmailDuplicate = useCallback(async (nickname: string): Promise<boolean> => {
    // TODO: API 호출로 변경
    // const response = await checkNicknameAPI(nickname);
    // return response.isDuplicate;

    // 임시: 테스트용 중복 닉네임 목록
    const duplicateEmails = ['테스트', 'admin', 'test', '관리자'];
    return duplicateEmails.includes(nickname.trim());
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
        case 1:
          return REQUIRED_TERMS.every((termId) =>
            agreedTerms.includes(termId)
          );
        case 2:
          return await trigger('name');
        case 3:
          const isEmailValid = await trigger('email');
          if (!isEmailValid) return false;

          // 이메일 중복 체크
          const isDuplicateEmail = await checkEmailDuplicate(watchedEmail);
          if (isDuplicateEmail) {
            setEmailError('이미 사용 중인 이메일이에요!');
            return false;
          }
          setEmailError(null);
          return true;
        case 4:
          const isNicknameValid = await trigger('nickname');
          if (!isNicknameValid) return false;

          // 닉네임 중복 체크
          const isDuplicateNickname = await checkNicknameDuplicate(watchedNickname);
          if (isDuplicateNickname) {
            setNicknameError('이미 사용 중인 닉네임이에요!');
            return false;
          }
          setNicknameError(null);
          return true;
        case 5:
          return await trigger('birthDate');
        case 6:
          return await trigger('gender');
        default:
          return false;
      }
    },
    [agreedTerms, trigger, checkEmailDuplicate, checkNicknameDuplicate, watchedEmail, watchedNickname],
  );

  const isStepValid = useMemo(() => {
    switch (currentStep) {
      case 1:
        return REQUIRED_TERMS.every((termId) => agreedTerms.includes(termId));
      case 2:
        return watchedName.trim() !== '';
      case 3:
        return watchedEmail.trim() !== '';
      case 4:
        return watchedNickname.trim() !== '';
      case 5:
        return watchedBirthDate !== null;
      case 6:
        return watchedGender !== null;
      default:
        return false;
    }
  }, [currentStep, agreedTerms, watchedName, watchedEmail, watchedNickname, watchedBirthDate, watchedGender]);

  const handlePressSubmit = async () => {
    // 버튼 disabled 상태 재확인
    if (!isStepValid) {
      // 약관 동의 스텝에서 에러 표시
      if (currentStep === 1) {
        setShowTermsError(true);
      }
      return;
    }

    const isValid = await validateStep(currentStep);

    if (!isValid) {
      // 약관 동의 스텝에서 에러 표시
      if (currentStep === 1) {
        setShowTermsError(true);
      }
      return;
    }

    // 다음 스텝으로 이동하면 에러 초기화
    setShowTermsError(false);

    if (currentStep === 1) {
      await requestPermission('notification');
    }

    if (currentStep < TOTAL_STEPS - 1) {
      setCurrentStep((prev) => prev + 1);
    } else {
      await handleSubmit(onSubmit)();
    }
  };

  const onSubmit = useCallback(
    async (data: UserOnboardingFormData) => {
      const YYYY = data.birthDate?.getFullYear() ?? 2000;
      let month = data.birthDate?.getMonth() ?? 1 + 1;
      const MM = month < 10 ? '0' + month : month;
      let date = data.birthDate?.getDate() ?? 1;
      const DD = date < 10 ? '0' + date : date;

      const isAgreeMarketing = data.agreedTerms.includes('marketing');

      const signUpData: SignUpFormData = {
        name: data.name,
        nickname: data.nickname,
        email: data.email,
        birthDate: `${YYYY}-${MM}-${DD}`,
        gender: data.gender,
        role: userType === 'user' ? "USER" : "PHOTOGRAPHER",
        consentMarketing: isAgreeMarketing,
        id: userId
      };

      signUp(signUpData).then(() => {
        setIsFirst(true);
        rootNavigation.reset({ index: 0, routes: [{ name: "Main" }] });
      });
    },
    [signUp, userId, userType, rootNavigation, setIsFirst],
  );

  const submitButtonText = currentStep === TOTAL_STEPS - 1 ? '완료' : '다음';

  return (
    <UserOnboardingView
      currentStep={currentStep}
      control={control}
      errors={errors}
      onPressBack={handlePressBack}
      onPressUser={handlePressUser}
      onPressPhotographer={handlePressPhotographer}
      onPressTermLink={handlePressTermLink}
      onPressSubmit={handlePressSubmit}
      onToggleTerm={handleToggleTerm}
      onToggleAllTerms={handleToggleAllTerms}
      agreedTerms={agreedTerms}
      showTermsError={showTermsError}
      emailError={emailError}
      nicknameError={nicknameError}
      isSubmitDisabled={!isStepValid}
      submitButtonText={submitButtonText}
    />
  );
}
