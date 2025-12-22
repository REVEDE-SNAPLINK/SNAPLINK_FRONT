import { useEffect } from 'react';
import { Control, Controller, FieldErrors } from 'react-hook-form';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import styled from '@/utils/scale/CustomStyled.ts';
import { SubmitButton, Typography } from '@/components/theme';
import ScreenContainer from '@/components/ScreenContainer.tsx';
import FormErrorMessage from '@/components/FormErrorMessage.tsx';
import FormInput from '@/components/form/FormInput.tsx';
import DateInput from '@/components/form/DateInput.tsx';
import RadioGroup, { RadioOption } from '@/components/RadioGroup.tsx';
import TermsAgreement, { TermItem } from '@/components/TermsAgreement.tsx';

export interface UserOnboardingFormData {
  agreedTerms: string[];
  name: string;
  nickname: string;
  birthDate: Date | null;
  gender: 'FEMALE' | 'MALE' | null;
}

interface UserOnboardingViewProps {
  currentStep: number;
  control: Control<UserOnboardingFormData>;
  errors: FieldErrors<UserOnboardingFormData>;
  onPressSubmit: () => void;
  onToggleTerm: (termId: string) => void;
  onToggleAllTerms: () => void;
  agreedTerms: string[];
  showTermsError: boolean;
  nicknameError: string | null;
  isSubmitDisabled: boolean;
  submitButtonText: string;
}

const TERMS_DATA: TermItem[] = [
  { id: 'age', label: '만 14세 이상입니다', required: true },
  { id: 'service', label: '이용약관 동의', required: true, link: '#' },
  { id: 'privacy', label: '개인정보 수집 및 이용 동의', required: true, link: '#' },
  { id: 'optional', label: '선택정보 수집 및 이용 동의', required: false, link: '#' },
  { id: 'marketing', label: '개인정보 마케팅 활용 동의', required: false, link: '#' },
  { id: 'notification', label: '마케팅 알림 수신 동의', required: false, link: '#' },
];

const GENDER_OPTIONS: RadioOption<'FEMALE' | 'MALE'>[] = [
  { label: '여성', value: 'FEMALE' },
  { label: '남성', value: 'MALE' },
];

export default function UserOnboardingView({
  currentStep,
  control,
  errors,
  onPressSubmit,
  onToggleTerm,
  onToggleAllTerms,
  agreedTerms,
  showTermsError,
  nicknameError,
  isSubmitDisabled,
  submitButtonText,
}: UserOnboardingViewProps) {
  const opacity = useSharedValue(1);

  useEffect(() => {
    opacity.value = 0;
    opacity.value = withTiming(1, {
      duration: 300,
      easing: Easing.out(Easing.ease),
    });
  }, [currentStep, opacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return <UserOnboardingStep1 agreedTerms={agreedTerms} onToggleTerm={onToggleTerm} onToggleAllTerms={onToggleAllTerms} showError={showTermsError} />;
      case 1:
        return <UserOnboardingStep2 control={control} errors={errors} />;
      case 2:
        return <UserOnboardingStep3 control={control} errors={errors} nicknameError={nicknameError} />;
      case 3:
        return <UserOnboardingStep4 control={control} errors={errors} />;
      case 4:
        return <UserOnboardingStep5 control={control} errors={errors} />;
      default:
        return null;
    }
  };

  return (
    <ScreenContainer headerShown={false}>
      <AnimatedFormContainer style={animatedStyle}>
        {renderStep()}
      </AnimatedFormContainer>
      <SubmitButton
        onPress={onPressSubmit}
        width={327}
        disabled={isSubmitDisabled}
        text={submitButtonText}
        position="absolute"
        bottom={33}
      />
    </ScreenContainer>
  );
}

interface UserOnboardingStep1Props {
  agreedTerms: string[];
  onToggleTerm: (termId: string) => void;
  onToggleAllTerms: () => void;
  showError: boolean;
}

const UserOnboardingStep1 = ({
  agreedTerms,
  onToggleTerm,
  onToggleAllTerms,
  showError,
}: UserOnboardingStep1Props) => {
  return (
    <>
      <Typography fontSize={18} lineHeight="140%" marginBottom={20}>
        <Typography fontSize={18} fontWeight="semiBold" lineHeight="140%">
          서비스 이용약관
        </Typography>
        에 동의해주세요.
      </Typography>
      <TermsAgreement
        terms={TERMS_DATA}
        agreedTerms={agreedTerms}
        onToggleTerm={onToggleTerm}
        onToggleAll={onToggleAllTerms}
      />
      {showError && (
        <FormErrorMessage message="필수 약관에 동의하지 않으면 가입이 어려워요!" />
      )}
    </>
  );
};
UserOnboardingStep1.displayName = 'UserOnboardingStep1';

interface UserOnboardingStep2Props {
  control: Control<UserOnboardingFormData>;
  errors: FieldErrors<UserOnboardingFormData>;
}

const UserOnboardingStep2 = ({ control, errors }: UserOnboardingStep2Props) => {
  return (
    <>
      <Typography fontSize={18} lineHeight="140%" marginBottom={20}>
        <Typography fontSize={18} fontWeight="semiBold" lineHeight="140%">
          본인 확인
        </Typography>
        을 위해{'\n'}이름을 입력해 주세요.
      </Typography>
      <Controller
        control={control}
        name="name"
        rules={{
          required: '이름을 입력해주세요.',
          validate: (value) => value.trim() !== '' || '이름을 입력해주세요.',
        }}
        render={({ field: { onChange, onBlur, value } }) => (
          <FormInput
            placeholder="이름 *"
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            errorMessage={errors.name?.message}
          />
        )}
      />
    </>
  );
};
UserOnboardingStep2.displayName = 'UserOnboardingStep2';

interface UserOnboardingStep3Props {
  control: Control<UserOnboardingFormData>;
  errors: FieldErrors<UserOnboardingFormData>;
  nicknameError: string | null;
}

const UserOnboardingStep3 = ({ control, errors, nicknameError }: UserOnboardingStep3Props) => {
  return (
    <>
      <Typography fontSize={18} lineHeight="140%" marginBottom={20}>
        <Typography fontSize={18} fontWeight="semiBold" lineHeight="140%">
          닉네임
        </Typography>
        을 입력해 주세요.
      </Typography>
      <Controller
        control={control}
        name="nickname"
        rules={{
          required: '닉네임을 입력해주세요.',
          validate: (value) => value.trim() !== '' || '닉네임을 입력해주세요.',
        }}
        render={({ field: { onChange, onBlur, value } }) => (
          <FormInput
            placeholder="닉네임 *"
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            errorMessage={nicknameError || errors.nickname?.message}
          />
        )}
      />
    </>
  );
};
UserOnboardingStep3.displayName = 'UserOnboardingStep3';

interface UserOnboardingStep4Props {
  control: Control<UserOnboardingFormData>;
  errors: FieldErrors<UserOnboardingFormData>;
}

const UserOnboardingStep4 = ({ control, errors }: UserOnboardingStep4Props) => {
  return (
    <>
      <Typography fontSize={18} lineHeight="140%" marginBottom={20}>
        <Typography fontSize={18} fontWeight="semiBold" lineHeight="140%">
          생년월일
        </Typography>
        을 입력해 주세요.
      </Typography>
      <Typography fontSize={12} lineHeight="140%" color="#767676" marginBottom={10}>
        생년월일을 8자리로 입력해 주세요.
      </Typography>
      <Controller
        control={control}
        name="birthDate"
        rules={{
          required: '생년월일을 입력해주세요.',
        }}
        render={({ field: { onChange, value } }) => (
          <DateInput
            placeholder="YYYY.MM.DD *"
            value={value || undefined}
            onChange={onChange}
            errorMessage={errors.birthDate?.message}
          />
        )}
      />
    </>
  );
};
UserOnboardingStep4.displayName = 'UserOnboardingStep4';

interface UserOnboardingStep5Props {
  control: Control<UserOnboardingFormData>;
  errors: FieldErrors<UserOnboardingFormData>;
}

const UserOnboardingStep5 = ({ control, errors }: UserOnboardingStep5Props) => {
  return (
    <>
      <Typography fontSize={18} lineHeight="140%" marginBottom={20}>
        <Typography fontSize={18} fontWeight="semiBold" lineHeight="140%">
          성별
        </Typography>
        을 선택해 주세요.
      </Typography>
      <Controller
        control={control}
        name="gender"
        rules={{
          required: '성별을 선택해주세요.',
        }}
        render={({ field: { onChange, value } }) => (
          <RadioGroup
            options={GENDER_OPTIONS}
            value={value || undefined}
            onChange={onChange}
          />
        )}
      />
      {errors.gender && <FormErrorMessage message={errors.gender.message || ''} />}
    </>
  );
};
UserOnboardingStep5.displayName = 'UserOnboardingStep5';

const AnimatedFormContainer = styled(Animated.View)`
  flex: 1;
  width: 100%;
  padding: 0 40px;
  margin-top: 40px;
`;
