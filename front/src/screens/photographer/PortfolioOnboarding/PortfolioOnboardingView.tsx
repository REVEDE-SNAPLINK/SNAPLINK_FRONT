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
import { theme } from '@/theme';
import Icon from '@/components/Icon.tsx';
import CrossIcon from '@/assets/icons/cross.svg';
import { Platform, ScrollView } from 'react-native';
import Checkbox from '@/components/Checkbox.tsx';
import FormInput from '@/components/form/FormInput.tsx';
import DropDownInput from '@/components/form/DropDownInput.tsx';
import TimeInput from '@/components/form/TimeInput.tsx';
import TextInput from '@/components/theme/TextInput.tsx';
import ProfileImageUpload from '@/components/ProfileImageUpload.tsx';
import { GetRegionsResponse } from '@/api/regions.ts';
import { GetConceptsResponse } from '@/api/concepts.ts';

export interface PortfolioOnboardingFormData {
  introduction: string;
  shootingRegions: number[];
  shootingConcepts: number[];
  basePrice: string;
  shootingDuration: string | null;
  shootingPeople: string | null;
  retouchingType: string | null;
  provideRawFiles: boolean;
  retouchingDuration: string | null;
  retouchingSelectionRight: string | null;
  availableDays: string[];
  startTime: Date | null;
  endTime: Date | null;
}

interface PortfolioOnboardingViewProps {
  currentStep: number;
  control: Control<PortfolioOnboardingFormData>;
  errors: FieldErrors<PortfolioOnboardingFormData>;
  onPressSubmit: () => void;
  isSubmitDisabled: boolean;
  submitButtonText: string;
  progress: number;
  profileImageURI?: string;
  onProfileImageUpload: () => void;
  photoURIs: string[];
  onPhotoUpload: () => void;
  regions: GetRegionsResponse[];
  concepts: GetConceptsResponse[];
  onToggleRegion: (id: number) => void;
  onToggleConcept: (id: number) => void;
  onToggleDay: (day: string) => void;
}

export default function PortfolioOnboardingView({
  currentStep,
  control,
  onPressSubmit,
  isSubmitDisabled,
  submitButtonText,
  progress,
  profileImageURI,
  onProfileImageUpload,
  photoURIs,
  onPhotoUpload,
  regions,
  concepts,
  onToggleRegion,
  onToggleConcept,
  onToggleDay,
}: PortfolioOnboardingViewProps) {
  const opacity = useSharedValue(1);
  const progressWidth = useSharedValue(0);

  useEffect(() => {
    opacity.value = 0;
    opacity.value = withTiming(1, {
      duration: 300,
      easing: Easing.out(Easing.ease),
    });
  }, [currentStep, opacity]);

  useEffect(() => {
    progressWidth.value = withTiming(progress, {
      duration: 300,
      easing: Easing.out(Easing.ease),
    });
  }, [progress, progressWidth]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  const progressBarStyle = useAnimatedStyle(() => ({
    width: `${progressWidth.value}%`,
  }));

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <PortfolioOnboardingStep1
            control={control}
            profileImageURI={profileImageURI}
            onProfileImageUpload={onProfileImageUpload}
          />
        );
      case 1:
        return (
          <PortfolioOnboardingStep2
            photoURIs={photoURIs}
            onPhotoUpload={onPhotoUpload}
          />
        );
      case 2:
        return (
          <PortfolioOnboardingStep3
            regions={regions}
            control={control}
            onToggleRegion={onToggleRegion}
          />
        );
      case 3:
        return (
          <PortfolioOnboardingStep4
            concepts={concepts}
            control={control}
            onToggleConcept={onToggleConcept}
          />
        );
      case 4:
        return <PortfolioOnboardingStep5 control={control} />;
      case 5:
        return <PortfolioOnboardingStep6 control={control} />;
      case 6:
        return <PortfolioOnboardingStep7 control={control} onToggleDay={onToggleDay} />;
      default:
        return null;
    }
  };

  return (
    <ScreenContainer headerShown={false} paddingHorizontal={40}>
      <KeyboardFormView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollContainer>
          <AnimatedFormContainer style={animatedStyle}>
            {renderStep()}
          </AnimatedFormContainer>
        </ScrollContainer>
      </KeyboardFormView>
      <Footer>
        <ProgressBarContainer>
          <Typography
            fontSize={12}
            color="#767676"
            marginBottom={11}
          >
            {progress}% 작성했어요!
          </Typography>
          <ProgressBar>
            <ProgressBarFill style={progressBarStyle} />
          </ProgressBar>
        </ProgressBarContainer>
        <SubmitButton
          onPress={onPressSubmit}
          width="100%"
          disabled={isSubmitDisabled}
          text={submitButtonText}
          marginBottom={33}
        />
      </Footer>
    </ScreenContainer>
  );
}

interface PortfolioOnboardingStep1Props {
  control: Control<PortfolioOnboardingFormData>;
  profileImageURI?: string;
  onProfileImageUpload: () => void;
}

const PortfolioOnboardingStep1 = ({
  control,
  profileImageURI,
  onProfileImageUpload,
}: PortfolioOnboardingStep1Props) => {
  return (
    <>
      <Typography fontSize={18} lineHeight="140%" marginBottom={20}>
        <Typography fontSize={18} fontWeight="semiBold" lineHeight="140%">
          포트폴리오 프로필
        </Typography>
        을 채워주세요.
      </Typography>
      <Typography
        fontSize={16}
        letterSpacing="-2.5%"
      >
        프로필 사진을 등록해 주세요.
      </Typography>
      <ProfileImageUpload
        imageURI={profileImageURI}
        onPress={onProfileImageUpload}
        marginTop={40}
        marginBottom={40}
      />
      <Typography
        fontSize={16}
        letterSpacing="-2.5%"
        marginBottom={10}
      >
        작가님을 표현할 한 줄 소개를 입력해주세요.
      </Typography>
      <Controller
        control={control}
        name="introduction"
        render={({ field: { onChange, value } }) => (
          <TextInput
            placeholder="입력"
            value={value}
            onChangeText={onChange}
            multiline
            height={115}
            maxLength={200}
          />
        )}
      />
    </>
  );
};

interface PortfolioOnboardingStep2Props {
  photoURIs: string[];
  onPhotoUpload: () => void;
}

const PortfolioOnboardingStep2 = ({
  photoURIs,
  onPhotoUpload,
}: PortfolioOnboardingStep2Props) => {
  return (
    <>
      <Typography fontSize={18} lineHeight="140%" marginBottom={20}>
        <Typography fontSize={18} fontWeight="semiBold" lineHeight="140%">
          포트폴리오 사진
        </Typography>
        을 등록해 주세요.
      </Typography>
      <Typography
        fontSize={12}
        letterSpacing={0.2}
        marginBottom={12}
        color="#737373"
      >
        *최초 등록은 1장만 업로드해도 포트폴리오 등록이 완료됩니다.
      </Typography>
      <PhotoScrollContainerWrapper>
        <PhotoScrollContainer>
          <PhotoGrid>
            <PhotoWrapper>
              <UploadPhotoButton onPress={onPhotoUpload}>
                <Icon width={20} height={20} Svg={CrossIcon} />
              </UploadPhotoButton>
            </PhotoWrapper>
            {photoURIs.map((uri, index) => (
              <PhotoWrapper key={index}>
                <PhotoImage source={{ uri }} />
              </PhotoWrapper>
            ))}
          </PhotoGrid>
          <ScrollViewSpacer />
        </PhotoScrollContainer>
      </PhotoScrollContainerWrapper>
    </>
  );
};

interface PortfolioOnboardingStep3Props {
  regions: GetRegionsResponse[],
  control: Control<PortfolioOnboardingFormData>;
  onToggleRegion: (id: number) => void;
}

const PortfolioOnboardingStep3 = ({
  regions,
  control,
  onToggleRegion,
}: PortfolioOnboardingStep3Props) => {
  return (
    <>
      <Typography fontSize={18} lineHeight="140%" marginBottom={20}>
        <Typography fontSize={18} fontWeight="semiBold" lineHeight="140%">
          주로 활동하는 지역
        </Typography>
        을 선택해 주세요.
      </Typography>
      <Typography
        fontSize={12}
        marginBottom={10}
        color="#767676"
      >
        *중복 선택 가능
      </Typography>
      <ScrollView>
        <Controller
          control={control}
          name="shootingRegions"
          render={({ field: { value } }) => (
            <>
              {regions.map((region) => (
                <CheckOptionWrapper key={region.id}>
                  <Checkbox
                    isChecked={value.includes(region.id)}
                    onPress={() => onToggleRegion(region.id)}
                  />
                  <Typography
                    fontSize={12}
                    color="#767676"
                    marginLeft={12}
                  >
                    {region.city}
                  </Typography>
                </CheckOptionWrapper>
              ))}
            </>
          )}
        />
        <ScrollViewSpacer />
      </ScrollView>
    </>
  );
};

interface PortfolioOnboardingStep4Props {
  concepts: GetConceptsResponse[],
  control: Control<PortfolioOnboardingFormData>;
  onToggleConcept: (id: number) => void;
}

const PortfolioOnboardingStep4 = ({
  concepts,
  control,
  onToggleConcept,
}: PortfolioOnboardingStep4Props) => {
  return (
    <>
      <Typography fontSize={18} lineHeight="140%" marginBottom={20}>
        <Typography fontSize={18} fontWeight="semiBold" lineHeight="140%">
          주로 활동하는 컨셉
        </Typography>
        을 선택해 주세요.
      </Typography>
      <Typography
        fontSize={12}
        marginBottom={10}
        color="#767676"
      >
        *중복 선택 가능
      </Typography>
      <ScrollView>
        <Controller
          control={control}
          name="shootingConcepts"
          render={({ field: { value } }) => (
            <>
              {concepts.map((concept) => (
                <CheckOptionWrapper key={concept.id}>
                  <Checkbox
                    isChecked={value.includes(concept.id)}
                    onPress={() => onToggleConcept(concept.id)}
                  />
                  <Typography
                    fontSize={12}
                    color="#767676"
                    marginLeft={12}
                  >
                    {concept.conceptName}
                  </Typography>
                </CheckOptionWrapper>
              ))}
            </>
          )}
        />
        <ScrollViewSpacer />
      </ScrollView>
    </>
  );
};

interface PortfolioOnboardingStep5Props {
  control: Control<PortfolioOnboardingFormData>;
}

const PortfolioOnboardingStep5 = ({ control }: PortfolioOnboardingStep5Props) => {
  return (
    <>
      <Typography fontSize={18} lineHeight="140%" marginBottom={24}>
        <Typography fontSize={18} fontWeight="semiBold" lineHeight="140%">
          촬영 정보
        </Typography>
        를 자세히 알려주세요.
      </Typography>
      <ScrollView>
        <Typography
          fontSize={16}
          letterSpacing="-2.5%"
          marginBottom={10}
        >
          기본 촬영 비용
        </Typography>
        <Controller
          control={control}
          name="basePrice"
          render={({ field: { onChange, value } }) => (
            <FormInput
              placeholder="원"
              value={value}
              onChangeText={onChange}
              keyboardType="numeric"
            />
          )}
        />
        <Typography
          fontSize={16}
          letterSpacing="-2.5%"
          marginBottom={10}
          marginTop={25}
        >
          촬영 소요 시간
        </Typography>
        <Controller
          control={control}
          name="shootingDuration"
          render={({ field: { onChange, value } }) => (
            <DropDownInput
              placeholder="선택해주세요 *"
              options={['1시간', '2시간', '3시간', '4시간', '5시간', '6시간 이상']}
              value={value || undefined}
              onChange={onChange}
            />
          )}
        />
        <Typography
          fontSize={16}
          letterSpacing="-2.5%"
          marginBottom={10}
          marginTop={25}
        >
          촬영 인원
        </Typography>
        <Controller
          control={control}
          name="shootingPeople"
          render={({ field: { onChange, value } }) => (
            <DropDownInput
              placeholder="선택해주세요 *"
              options={['1명', '2명', '3명', '4명', '5명', '6명 이상']}
              value={value || undefined}
              onChange={onChange}
            />
          )}
        />
        <Typography
          fontSize={16}
          letterSpacing="-2.5%"
          marginBottom={10}
          marginTop={25}
        >
          보정 작업 제공
        </Typography>
        <Controller
          control={control}
          name="retouchingType"
          render={({ field: { onChange, value } }) => (
            <DropDownInput
              placeholder="선택해주세요 *"
              options={['얼굴 보정', '색감 보정', '얼굴, 색감 보정', '제공하지 않음']}
              value={value || undefined}
              onChange={onChange}
            />
          )}
        />
        <Typography
          fontSize={16}
          letterSpacing="-2.5%"
          marginBottom={10}
          marginTop={25}
        >
          원본 파일 제공
        </Typography>
        <Controller
          control={control}
          name="provideRawFiles"
          render={({ field: { onChange, value } }) => (
            <CheckOptionWrapper>
              <Checkbox isChecked={value} onPress={() => onChange(!value)} />
              <Typography
                fontSize={12}
                color="#767676"
                marginLeft={12}
              >
                제공 가능
              </Typography>
            </CheckOptionWrapper>
          )}
        />
        <ScrollViewSpacer />
      </ScrollView>
    </>
  );
};

interface PortfolioOnboardingStep6Props {
  control: Control<PortfolioOnboardingFormData>;
}

const PortfolioOnboardingStep6 = ({ control }: PortfolioOnboardingStep6Props) => {
  return (
    <>
      <Typography fontSize={18} lineHeight="140%" marginBottom={24}>
        <Typography fontSize={18} fontWeight="semiBold" lineHeight="140%">
          보정 정보
        </Typography>
        를 자세히 알려주세요.
      </Typography>
      <ScrollView>
        <Typography
          fontSize={16}
          letterSpacing="-2.5%"
          marginBottom={10}
        >
          보정 작업 소요 기간
        </Typography>
        <Controller
          control={control}
          name="retouchingDuration"
          render={({ field: { onChange, value } }) => (
            <DropDownInput
              placeholder="선택해주세요 *"
              options={['당일 보정', '2일 이내', '3일 이내', '4일 이내', '5일 이내', '7일 이내']}
              value={value || undefined}
              onChange={onChange}
            />
          )}
        />
        <Typography
          fontSize={16}
          letterSpacing="-2.5%"
          marginBottom={10}
          marginTop={25}
        >
          보정 사진 선택 권한
        </Typography>
        <Controller
          control={control}
          name="retouchingSelectionRight"
          render={({ field: { onChange, value } }) => (
            <DropDownInput
              placeholder="선택해주세요 *"
              options={['작가 선택', '고객 선택', '작가와 고객 함께 선택']}
              value={value || undefined}
              onChange={onChange}
            />
          )}
        />
        <ScrollViewSpacer />
      </ScrollView>
    </>
  );
};

const days = [
  '월요일',
  '화요일',
  '수요일',
  '목요일',
  '금요일',
  '토요일',
  '일요일',
  '공휴일',
];

interface PortfolioOnboardingStep7Props {
  control: Control<PortfolioOnboardingFormData>;
  onToggleDay: (day: string) => void;
}

const PortfolioOnboardingStep7 = ({
  control,
  onToggleDay,
}: PortfolioOnboardingStep7Props) => {
  return (
    <>
      <Typography fontSize={18} lineHeight="140%" marginBottom={20}>
        <Typography fontSize={18} fontWeight="semiBold" lineHeight="140%">
          촬영 가능한 일정
        </Typography>
        을 자세히 알려주세요.
      </Typography>
      <Typography
        fontSize={12}
        marginBottom={10}
        color="#767676"
      >
        *중복 선택 가능
      </Typography>
      <ScrollView>
        <Controller
          control={control}
          name="availableDays"
          render={({ field: { value } }) => (
            <>
              {days.map((day, i) => (
                <CheckOptionWrapper key={i}>
                  <Checkbox
                    isChecked={value.includes(day)}
                    onPress={() => onToggleDay(day)}
                  />
                  <Typography
                    fontSize={12}
                    color="#767676"
                    marginLeft={12}
                  >
                    {day}
                  </Typography>
                </CheckOptionWrapper>
              ))}
            </>
          )}
        />
        <Typography
          fontSize={16}
          letterSpacing="-2.5%"
          marginBottom={17}
          marginTop={29}
        >
          촬영 가능 시간대
        </Typography>
        <TimeOptionWrapper>
          <Controller
            control={control}
            name="startTime"
            render={({ field: { onChange, value } }) => (
              <TimeInput
                placeholder="시작 시간"
                value={value || undefined}
                onChange={onChange}
              />
            )}
          />
          <TimeBar />
          <Controller
            control={control}
            name="endTime"
            render={({ field: { onChange, value } }) => (
              <TimeInput
                placeholder="종료 시간"
                value={value || undefined}
                onChange={onChange}
              />
            )}
          />
        </TimeOptionWrapper>
        <ScrollViewSpacer />
      </ScrollView>
    </>
  );
};

const KeyboardFormView = styled.KeyboardAvoidingView`
  flex: 1;
  width: 100%;
`

const ScrollContainer = styled.ScrollView`
  flex: 1;
  width: 100%;
  padding-bottom: 152px;
`

const AnimatedFormContainer = styled(Animated.View)`
  flex: 1;
  width: 100%;
  margin-top: 40px;
`;

const ProgressBarContainer = styled.View`
  width: 100%;
  margin-bottom: 30px;
`;

const ProgressBar = styled.View`
  width: 100%;
  height: 5px;
  overflow: hidden;
  border-radius: 100px;
  background-color: #E9E9E9;
`;

const ProgressBarFill = styled(Animated.View)`
  height: 100%;
  background-color: ${theme.colors.primary};
  border-radius: 100px;
  position: absolute;
  left: 0;
  top: 0;
`;

const Footer = styled.View`
  width: 100%;
  height: 152px;
  align-items: center;
`

const PhotoScrollContainerWrapper = styled.View`
  width: 100%;
  align-items: center;
`;

const GRID_COLUMNS = 2;
const PHOTO_PADDING = 2;
const CONTAINER_WIDTH = 332;
const PHOTO_SIZE = (CONTAINER_WIDTH - (PHOTO_PADDING * 3)) / GRID_COLUMNS;

const PhotoScrollContainer = styled.ScrollView`
  width: ${CONTAINER_WIDTH}px;
`;

const PhotoGrid = styled.View`
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: space-around;
  align-content: space-between;
  width: 100%;
`;

const PhotoWrapper = styled.View`
  width: ${PHOTO_SIZE}px;
  height: ${PHOTO_SIZE}px;
  padding: ${PHOTO_PADDING}px 0;
`;

const PhotoImage = styled.Image`
  width: 100%;
  height: 100%;
  border-radius: 4px;
`;

const UploadPhotoButton = styled.TouchableOpacity`
  width: 100%;
  height: 100%;
  border: 1px dashed #C8C8C8;
  border-radius: 8px;
  justify-content: center;
  align-items: center;
`;

const ScrollViewSpacer = styled.View`
  height: 100px;
`;

const CheckOptionWrapper = styled.View`
  width: 100%;
  flex-direction: row;
  align-items: center;
  margin-bottom: 15px;
`;

const TimeOptionWrapper = styled.View`
  width: 100%;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
`;

const TimeBar = styled.View`
  width: 18px;
  height: 2px;
  background-color: #C8C8C8;
`;
