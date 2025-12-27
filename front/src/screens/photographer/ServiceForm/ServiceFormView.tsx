import { useEffect } from 'react';
import { Control, FieldErrors } from 'react-hook-form';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import styled from '@/utils/scale/CustomStyled.ts';
import { SubmitButton } from '@/components/theme';
import ScreenContainer from '@/components/ScreenContainer.tsx';
import { Platform } from 'react-native';
import PortfolioStep6 from '@/components/PortfolioStep6.tsx';
import PortfolioStep7 from '@/components/PortfolioStep7.tsx';
import PortfolioStep8, { DaySchedule } from '@/components/PortfolioStep8.tsx';

interface Option {
  name: string;
  description: string;
  price: string;
}

export interface ServiceFormData {
  basePrice: string;
  shootingDuration: string | null;
  shootingPeople: string | null;
  shootingDescription: string;
  retouchingType: string | null;
  provideRawFiles: boolean;
  retouchingDuration: string | null;
  retouchingSelectionRight: string | null;
  availableDays: string[];
  daySchedules: { [day: string]: DaySchedule };
  unavailableDateDescription: string;
  additionalOptions: Option[];
}

interface ServiceFormViewProps {
  currentStep: number;
  control: Control<ServiceFormData>;
  errors: FieldErrors<ServiceFormData>;
  onPressBack: () => void;
  onPressSubmit: () => void;
  isSubmitDisabled: boolean;
  submitButtonText: string;
  onDeleteOption: (index: number) => void;
  onToggleDay: (day: string) => void;
  isEditMode: boolean;
}

export default function ServiceFormView({
  currentStep,
  control,
  onPressBack,
  onPressSubmit,
  isSubmitDisabled,
  submitButtonText,
  onDeleteOption,
  onToggleDay,
  isEditMode,
}: ServiceFormViewProps) {
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
        return <PortfolioStep6 control={control} onDeleteOption={onDeleteOption} />;
      case 1:
        return <PortfolioStep7 control={control} />;
      case 2:
        return <PortfolioStep8 control={control} onToggleDay={onToggleDay} />;
      default:
        return null;
    }
  };

  return (
    <ScreenContainer
      headerShown
      headerTitle={isEditMode ? '촬영 서비스 수정' : '촬영 서비스 등록'}
      paddingHorizontal={40}
      onPressBack={onPressBack}
    >
      <KeyboardFormView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollContainer>
          <AnimatedFormContainer style={animatedStyle}>
            {renderStep()}
          </AnimatedFormContainer>
        </ScrollContainer>
      </KeyboardFormView>
      <Footer>
        <SubmitButton
          onPress={onPressSubmit}
          width="100%"
          disabled={isSubmitDisabled}
          text={submitButtonText}
          marginBottom={10}
        />
      </Footer>
    </ScreenContainer>
  );
}

const KeyboardFormView = styled.KeyboardAvoidingView`
  flex: 1;
  width: 100%;
`;

const ScrollContainer = styled.ScrollView`
  flex: 1;
  width: 100%;
  padding-bottom: 100px;
`;

const AnimatedFormContainer = styled(Animated.View)`
  flex: 1;
  width: 100%;
`;

const Footer = styled.View`
  width: 100%;
  padding-top: 20px;
  padding-bottom: 20px;
  align-items: center;
  justify-content: center;
`;
