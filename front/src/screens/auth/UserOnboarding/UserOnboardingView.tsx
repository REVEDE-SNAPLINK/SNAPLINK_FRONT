import React, { useEffect } from 'react';
import { Control, Controller, FieldErrors } from 'react-hook-form';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import styled from '@/utils/scale/CustomStyled.ts';
import { SubmitButton, Typography } from '@/components/theme';
import ScreenContainer from '@/components/common/ScreenContainer';
import FormErrorMessage from '@/components/form/FormErrorMessage';
import FormInput from '@/components/form/FormInput.tsx';
import DateInput from '@/components/form/DateInput.tsx';
import RadioGroup, { RadioOption } from '@/components/RadioGroup.tsx';
import TermsAgreement, { TermItem } from '@/components/TermsAgreement.tsx';
import { Platform } from 'react-native';
import Icon from '@/components/Icon.tsx';
import TypeUserImg from '@/assets/imgs/type-user.svg';
import ArrowRightIcon from '@/assets/icons/arrow-right2.svg';
import TypePhotographerImg from '@/assets/imgs/type-photographer.svg';
import { TERMS_BASE_URL } from '@/config/api.ts';

// Email validation regex
const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

export interface UserOnboardingFormData {
  agreedTerms: string[];
  name: string;
  email: string;
  nickname: string;
  birthDate: Date;
  gender: 'FEMALE' | 'MALE' | null;
}

interface UserOnboardingViewProps {
  onPressBack: () => void;
  currentStep: number;
  control: Control<UserOnboardingFormData>;
  errors: FieldErrors<UserOnboardingFormData>;
  onPressUser: () => void;
  onPressPhotographer: () => void;
  onPressTermLink: (url: string) => void;
  onPressSubmit: () => void;
  onToggleTerm: (termId: string) => void;
  onToggleAllTerms: () => void;
  agreedTerms: string[];
  showTermsError: boolean;
  emailError: string | null;
  nicknameError: string | null;
  isSubmitDisabled: boolean;
  submitButtonText: string;
}

// TODO: 랜딩 페이지 구현 후 실제 링크로 연결
const TERMS_DATA: TermItem[] = [
  { id: 'age', label: '만 14세 이상입니다', required: true },
  { id: 'service', label: '이용약관 동의', required: true, link: TERMS_BASE_URL },
  { id: 'privacy', label: '개인정보 수집 및 이용 동의', required: true, link: TERMS_BASE_URL },
  { id: 'optional', label: '선택정보 수집 및 이용 동의', required: false, link: TERMS_BASE_URL },
  { id: 'marketing', label: '개인정보 마케팅 활용 동의', required: false, link: TERMS_BASE_URL },
  { id: 'notification', label: '마케팅 알림 수신 동의', required: false, link: TERMS_BASE_URL },
];

const GENDER_OPTIONS: RadioOption<'FEMALE' | 'MALE'>[] = [
  { label: '여성', value: 'FEMALE' },
  { label: '남성', value: 'MALE' },
];

export default function UserOnboardingView({
  currentStep,
  control,
  errors,
  onPressBack,
  onPressUser,
  onPressPhotographer,
  onPressTermLink,
  onPressSubmit,
  onToggleTerm,
  onToggleAllTerms,
  agreedTerms,
  showTermsError,
  emailError,
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
        return <UserOnboardingStep1 onPressUser={onPressUser} onPressPhotographer={onPressPhotographer} />;
      case 1:
        return <UserOnboardingStep2 agreedTerms={agreedTerms} onToggleTerm={onToggleTerm} onToggleAllTerms={onToggleAllTerms} showError={showTermsError} onPressTermLink={onPressTermLink} />;
      case 2:
        return <UserOnboardingStep3 control={control} errors={errors} />;
      case 3:
        return <UserOnboardingStep4 control={control} errors={errors} emailError={emailError} />;
      case 4:
        return <UserOnboardingStep5 control={control} errors={errors}  nicknameError={nicknameError} />;
      case 5:
        return <UserOnboardingStep6 control={control} errors={errors} />;
      case 6:
        return <UserOnboardingStep7 control={control} errors={errors} />;
      default:
        return null;
    }
  };

  return (
    <ScreenContainer
      headerShown
      isShowLogo
      onPressBack={onPressBack}
    >
      <KeyboardFormView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollContainer>
          <AnimatedFormContainer style={animatedStyle}>
            {renderStep()}
          </AnimatedFormContainer>
        </ScrollContainer>
      </KeyboardFormView>
      {currentStep > 0 &&
        <Footer>
          <SubmitButton
            onPress={onPressSubmit}
            width={327}
            disabled={isSubmitDisabled}
            text={submitButtonText}
            position="absolute"
            bottom={33}
          />
        </Footer>
      }
    </ScreenContainer>
  );
}

interface UserOnboardingStep1Props {
  onPressUser: () => void;
  onPressPhotographer: () => void;
}

const UserOnboardingStep1 = ({
  onPressUser,
  onPressPhotographer
}: UserOnboardingStep1Props) => {
  return (
    <>
      <Typography fontSize={18} lineHeight="140%" marginBottom={20}>
        <Typography fontSize={18} fontWeight="semiBold" lineHeight="140%">
          스냅링크
        </Typography>
        를 어떻게 이용하고 싶으신가요?
      </Typography>
      <SelectButtonWrapper>
        <SelectButton
          onPress={onPressUser}
        >
          <SelectButtonImageWrapper>
            <Icon width={89} height={101} Svg={TypeUserImg} />
          </SelectButtonImageWrapper>
          <SelectButtonTextWrapper>
            <SelectButtonTitleWrapper>
              <Typography
                fontSize={16}
                fontWeight="semiBold"
                lineHeight="140%"
                letterSpacing="-2.5%"
              >
                고객으로 시작
              </Typography>
              <Icon width={24} height={24} Svg={ArrowRightIcon} />
            </SelectButtonTitleWrapper>
            <Typography
              fontSize={12}
              lineHeight="140%"
              letterSpacing="-2.5%"
              color="#767676"
            >
              내가 원하는 작가님을 찾아서{'\n'}사진을 촬영해 보세요.
            </Typography>
          </SelectButtonTextWrapper>
        </SelectButton>

        <SelectButton
          onPress={onPressPhotographer}
        >
          <SelectButtonImageWrapper>
            <Icon width={87} height={73} Svg={TypePhotographerImg} />
          </SelectButtonImageWrapper>
          <SelectButtonTextWrapper>
            <SelectButtonTitleWrapper>
              <Typography
                fontSize={16}
                fontWeight="semiBold"
                lineHeight="140%"
                letterSpacing="-2.5%"
              >
                사진 작가로 시작
              </Typography>
              <Icon width={24} height={24} Svg={ArrowRightIcon} />
            </SelectButtonTitleWrapper>
            <Typography
              fontSize={12}
              lineHeight="140%"
              letterSpacing="-2.5%"
              color="#767676"
            >
              스냅 사진작가로 활동하고{'\n'}수익을 창출해 보세요.
            </Typography>
          </SelectButtonTextWrapper>
        </SelectButton>
        <Typography
          fontSize={12}
          color="#767676"
          marginBottom={6}
        >
          가입한 후에는 언제든 원하는 상태로 전환할 수 있어요!
        </Typography>
      </SelectButtonWrapper>
    </>
  );
};
UserOnboardingStep1.displayName = 'UserOnboardingStep1';

interface UserOnboardingStep2Props {
  agreedTerms: string[];
  onToggleTerm: (termId: string) => void;
  onToggleAllTerms: () => void;
  onPressTermLink: (url: string) => void;
  showError: boolean;
}

const UserOnboardingStep2 = ({
  agreedTerms,
  onToggleTerm,
  onToggleAllTerms,
  onPressTermLink,
  showError,
}: UserOnboardingStep2Props) => {
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
        onPressLink={onPressTermLink}
      />
      {showError && (
        <FormErrorMessage message="필수 약관에 동의하지 않으면 가입이 어려워요!" />
      )}
    </>
  );
};
UserOnboardingStep2.displayName = 'UserOnboardingStep2';

interface UserOnboardingStep3Props {
  control: Control<UserOnboardingFormData>;
  errors: FieldErrors<UserOnboardingFormData>;
}

const UserOnboardingStep3 = ({ control, errors }: UserOnboardingStep3Props) => {
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
UserOnboardingStep3.displayName = 'UserOnboardingStep3';

interface UserOnboardingStep4Props {
  control: Control<UserOnboardingFormData>;
  errors: FieldErrors<UserOnboardingFormData>;
  emailError: string | null;
}

const UserOnboardingStep4 = ({ control, errors, emailError }: UserOnboardingStep4Props) => {
  return (
    <>
      <Typography fontSize={18} lineHeight="140%" marginBottom={20}>
        <Typography fontSize={18} fontWeight="semiBold" lineHeight="140%">
          이메일
        </Typography>
        을 입력해 주세요.
      </Typography>
      <Controller
        control={control}
        name="email"
        rules={{
          required: '이메일을 입력해주세요.',
          validate: {
            notEmpty: (value) => value.trim() !== '' || '이메일을 입력해주세요.',
            validFormat: (value) => EMAIL_REGEX.test(value.trim()) || '올바른 이메일 형식이 아닙니다.',
          },
        }}
        render={({ field: { onChange, onBlur, value } }) => (
          <FormInput
            placeholder="이메일 *"
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            errorMessage={emailError || errors.email?.message}
            keyboardType="email-address"
            autoCapitalize="none"
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
  nicknameError: string | null;
}

const UserOnboardingStep5 = ({ control, errors, nicknameError }: UserOnboardingStep5Props) => {
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
UserOnboardingStep5.displayName = 'UserOnboardingStep5';

interface UserOnboardingStep6Props {
  control: Control<UserOnboardingFormData>;
  errors: FieldErrors<UserOnboardingFormData>;
}

const UserOnboardingStep6 = ({ control, errors }: UserOnboardingStep6Props) => {
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
            value={value}
            onChange={onChange}
            errorMessage={errors.birthDate?.message}
          />
        )}
      />
    </>
  );
};
UserOnboardingStep6.displayName = 'UserOnboardingStep6';

interface UserOnboardingStep7Props {
  control: Control<UserOnboardingFormData>;
  errors: FieldErrors<UserOnboardingFormData>;
}

const UserOnboardingStep7 = ({ control, errors }: UserOnboardingStep7Props) => {
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
UserOnboardingStep7.displayName = 'UserOnboardingStep7';

const KeyboardFormView = styled.KeyboardAvoidingView`
  flex: 1;
  width: 100%;
`

const ScrollContainer = styled.ScrollView`
  flex: 1;
  width: 100%;
  padding-bottom: 82px;
`

const AnimatedFormContainer = styled(Animated.View)`
  flex: 1;
  width: 100%;
  padding: 0 40px;
  margin-top: 40px;
`;

const Footer = styled.View`
  width: 100%;
  height: 82px;
  align-items: center;
  justify-content: flex-end;
`

const SelectButtonWrapper = styled.View`
  width: 100%;
  align-items: center;
`

const SelectButton = styled.TouchableOpacity`
  width: 318px;
  height: 123px;
  border-radius: 16px;
  background: #F4F4F4;
  margin-bottom: 13px;
  flex-direction: row;
  justify-content: space-between;
`

const SelectButtonImageWrapper = styled.View`
  flex: 0.46;
  justify-content: center;
  align-items: center;
`

const SelectButtonTextWrapper = styled.View`
  flex: 0.54;
  justify-content: center;
`

const SelectButtonTitleWrapper = styled.View`
  flex-direction: row;
  align-items: center;
  width: 135px;
  justify-content: space-between;
  margin-bottom: 7px;
`