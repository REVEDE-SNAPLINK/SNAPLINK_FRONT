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
import { Platform, ScrollView } from 'react-native';
import Checkbox from '@/components/Checkbox.tsx';
import TextInput from '@/components/theme/TextInput.tsx';
import ProfileImageUpload from '@/components/ProfileImageUpload.tsx';
import { GetRegionsResponse } from '@/api/regions.ts';
import { GetConceptsResponse } from '@/api/concepts.ts';
import PhotoGrid from '@/components/PhotoGrid.tsx';
import PortfolioStep6 from '@/components/PortfolioStep6.tsx';
import PortfolioStep7 from '@/components/PortfolioStep7.tsx';
import PortfolioStep8, { DaySchedule } from '@/components/PortfolioStep8.tsx';

export interface Tag {
  id: number;
  keyword: string;
}

interface Option {
  name: string;
  description: string;
  price: string;
}

export interface PortfolioOnboardingFormData {
  description: string;
  shootingRegions: number[];
  shootingTags: number[];
  shootingConcepts: number[];
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

interface PortfolioOnboardingViewProps {
  currentStep: number;
  control: Control<PortfolioOnboardingFormData>;
  errors: FieldErrors<PortfolioOnboardingFormData>;
  onPressBack: () => void;
  onPressSubmit: () => void;
  isSubmitDisabled: boolean;
  submitButtonText: string;
  progress: number;
  profileImageURI?: string;
  onProfileImageUpload: () => void;
  photoURIs: string[];
  onPhotoUpload: () => void;
  checkedPhotos: boolean[];
  setCheckedPhotos: (index: number) => void;
  onDeletePhotos: () => void;
  regions: GetRegionsResponse[];
  tags: Tag[];
  concepts: GetConceptsResponse[];
  onToggleRegion: (id: number) => void;
  onToggleTag: (id: number) => void;
  onToggleConcept: (id: number) => void;
  onDeleteOption: (index: number) => void;
  onToggleDay: (day: string) => void;
}

export default function PortfolioOnboardingView({
  currentStep,
  control,
  onPressBack,
  onPressSubmit,
  isSubmitDisabled,
  submitButtonText,
  progress,
  profileImageURI,
  onProfileImageUpload,
  photoURIs,
  onPhotoUpload,
  checkedPhotos,
  setCheckedPhotos,
  onDeletePhotos,
  regions,
  tags,
  concepts,
  onToggleRegion,
  onToggleTag,
  onToggleConcept,
  onDeleteOption,
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
            checkedImages={checkedPhotos}
            setCheckedImages={setCheckedPhotos}
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
            tags={tags}
            control={control}
            onToggleTag={onToggleTag}
          />
        );
      case 4:
        return (
          <PortfolioOnboardingStep5
            concepts={concepts}
            control={control}
            onToggleConcept={onToggleConcept}
          />
        );
      case 5:
        return <PortfolioStep6 control={control} onDeleteOption={onDeleteOption} />;
      case 6:
        return <PortfolioStep7 control={control} />;
      case 7:
        return <PortfolioStep8 control={control} onToggleDay={onToggleDay} />;
      default:
        return null;
    }
  };

  const canDeletePhotos = currentStep === 1 && checkedPhotos.filter((v) => v).length >= 1;

  return (
    <ScreenContainer
      headerShown
      headerTitle="작가 가입"
      {...(currentStep !== 1 ? { paddingHorizontal: 40 } : {})}
      onPressBack={onPressBack}
    >
      <KeyboardFormView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollContainer>
          <AnimatedFormContainer style={animatedStyle}>
            {renderStep()}
          </AnimatedFormContainer>
        </ScrollContainer>
      </KeyboardFormView>
      <Footer
        style={[{ ...(currentStep === 1 ? { paddingLeft: 40, paddingRight: 40 } : {}) }]}
      >
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
          onPress={canDeletePhotos ? onDeletePhotos : onPressSubmit}
          width="100%"
          disabled={isSubmitDisabled}
          text={canDeletePhotos ? '사진 삭제하기' : submitButtonText}
          marginBottom={10}
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
      <Typography fontSize={18} lineHeight="140%">
        <Typography fontSize={18} fontWeight="semiBold" lineHeight="140%">
          포트폴리오 프로필
        </Typography>
        을 채워주세요.
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
        name="description"
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
  checkedImages: boolean[];
  setCheckedImages: (index: number) => void;
}

const PortfolioOnboardingStep2 = ({
  photoURIs,
  onPhotoUpload,
  checkedImages,
  setCheckedImages,
}: PortfolioOnboardingStep2Props) => {
  return (
    <>
      <Typography fontSize={18} lineHeight="140%" marginBottom={20} marginLeft={40}>
        <Typography fontSize={18} fontWeight="semiBold" lineHeight="140%">
          포트폴리오 사진
        </Typography>
        을 등록해 주세요.
      </Typography>
      <Typography
        fontSize={12}
        letterSpacing={0.2}
        marginBottom={12}
        marginLeft={40}
        color="#737373"
      >
        *최초 등록은 1장만 업로드해도 포트폴리오 등록이 완료됩니다.
      </Typography>
      <PhotoGrid
        imageURIs={photoURIs}
        checkedImages={checkedImages}
        setCheckedImage={setCheckedImages}
        addable
        onPressAddImage={onPhotoUpload}
        width={337}
      />
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
  tags: Tag[],
  control: Control<PortfolioOnboardingFormData>;
  onToggleTag: (id: number) => void;
}

const PortfolioOnboardingStep4 = ({
  tags,
  control,
  onToggleTag,
}: PortfolioOnboardingStep4Props) => {
  return (
    <>
      <Typography fontSize={18} lineHeight="140%" marginBottom={20}>
        <Typography fontSize={18} fontWeight="semiBold" lineHeight="140%">
          촬영 관련 키워드
        </Typography>
        를 알려주세요.
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
          name="shootingTags"
          render={({ field: { value } }) => (
            <>
              {tags.map((tag) => (
                <CheckOptionWrapper key={tag.id}>
                  <Checkbox
                    isChecked={value.includes(tag.id)}
                    onPress={() => onToggleTag(tag.id)}
                  />
                  <Typography
                    fontSize={12}
                    color="#767676"
                    marginLeft={12}
                  >
                    {tag.keyword}
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
  concepts: GetConceptsResponse[],
  control: Control<PortfolioOnboardingFormData>;
  onToggleConcept: (id: number) => void;
}

const PortfolioOnboardingStep5 = ({
  concepts,
  control,
  onToggleConcept,
}: PortfolioOnboardingStep5Props) => {
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
  padding-top: 20px;
  padding-bottom: 20px;
  align-items: center;
  justify-content: center;
`

const ScrollViewSpacer = styled.View`
  height: 100px;
`;

const CheckOptionWrapper = styled.View`
  width: 100%;
  flex-direction: row;
  align-items: center;
  margin-bottom: 15px;
`;

