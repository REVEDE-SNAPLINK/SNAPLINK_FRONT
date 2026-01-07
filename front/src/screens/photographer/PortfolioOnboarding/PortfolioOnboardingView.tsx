import React, { useEffect, useState } from 'react';
import { Control, Controller, FieldErrors, useWatch } from 'react-hook-form';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import styled from '@/utils/scale/CustomStyled.ts';
import { SubmitButton, Typography } from '@/components/theme';
import ScreenContainer from '@/components/common/ScreenContainer';
import { theme } from '@/theme';
import { Platform } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import Checkbox from '@/components/theme/Checkbox';
import TextInput from '@/components/theme/TextInput.tsx';
import ProfileImageUpload from '@/components/ProfileImageUpload.tsx';
import { GetRegionsResponse } from '@/api/regions.ts';
import { GetConceptsResponse } from '@/api/concepts.ts';
import FormInput from '@/components/form/FormInput.tsx';
import DropDownInput from '@/components/form/DropDownInput.tsx';
import OptionItem, { Option, TimeOptionCheckboxWrapper } from '@/components/OptionItem.tsx';
import CloseIcon from '@/assets/icons/multiply.svg'
import ImageUploadInput from '@/components/form/ImageUploadInput.tsx';
import { UploadImageFile } from '@/api/photographers.ts';

export interface Tag {
  id: number;
  name: string;
}

export interface DaySchedule {
  startTime: Date | null;
  endTime: Date | null;
}

export interface PortfolioOnboardingFormData {
  description: string;
  portfolioTitle: string;
  portfolioDescription: string;
  portfolioIsLinked: boolean;
  regionIds: number[];
  tagIds: number[];
  conceptIds: number[];
  shootingProductName: string;
  shootingProductBasePrice: string;
  shootingProductPhotoTime: string | null;
  shootingProductPersonnel: string | null;
  shootingProductDescription: string;
  shootingProductEditingType: string | null;
  shootingProductProvidesRawFile: boolean;
  shootingProductEditingDeadline: string | null;
  shootingProductSelectionAuthority: string | null;
  shootingProductProvidedEditCount: string;
  availableDays: string[];
  daySchedules: { [day: string]: DaySchedule };
  shootingProductOptions: Option[];
}

interface PortfolioOnboardingViewProps {
  currentStep: number;
  control: Control<PortfolioOnboardingFormData>;
  errors: FieldErrors<PortfolioOnboardingFormData>;
  onPressBack: () => void;
  onPressClose: () => void;
  onPressSubmit: () => void;
  isSubmitDisabled: boolean;
  submitButtonText: string;
  progress: number;
  profileImageURI?: string;
  onProfileImageUpload: () => void;
  photoURIs: UploadImageFile[];
  onRemoveImage: (index: number) => void;
  onAddImages: (images: UploadImageFile[]) => void;
  regions: GetRegionsResponse[];
  tags: Tag[];
  concepts: GetConceptsResponse[];
  onToggleRegion: (id: number) => void;
  onToggleTag: (id: number) => void;
  onToggleConcept: (id: number) => void;
  onDeleteOption: (index: number) => void;
  onToggleDay: (day: string) => void;
  navigation?: any;
}

export default function PortfolioOnboardingView({
  currentStep,
  control,
  onPressBack,
  onPressClose,
  onPressSubmit,
  isSubmitDisabled,
  submitButtonText,
  progress,
  profileImageURI,
  onProfileImageUpload,
  photoURIs,
  onRemoveImage,
  onAddImages,
  regions,
  tags,
  concepts,
  onToggleRegion,
  onToggleTag,
  onToggleConcept,
  onDeleteOption,
  onToggleDay,
  navigation,
}: PortfolioOnboardingViewProps) {
  const opacity = useSharedValue(1);
  const progressWidth = useSharedValue(0);


  const scrollRef = React.useRef<any>(null);

  useEffect(() => {
    requestAnimationFrame(() => {
      scrollRef.current?.scrollToPosition(0, 0, false);
    });
  }, [currentStep]);
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
            control={control}
            photoURIs={photoURIs}
            onRemoveImage={onRemoveImage}
            onAddImages={onAddImages}
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
        return <PortfolioOnboardingStep6 control={control} />;
      case 6:
        return <PortfolioOnboardingStep7 control={control} onDeleteOption={onDeleteOption} />;
      case 7:
        return <PortfolioOnboardingStep8 control={control} />;
      case 8:
        return <PortfolioOnboardingStep9 control={control} onToggleDay={onToggleDay} />;
      default:
        return null;
    }
  };

  return (
    <ScreenContainer
      headerShown
      headerTitle="작가 가입"
      onPressBack={onPressBack}
      onPressTool={onPressClose}
      headerToolIcon={CloseIcon}
      paddingHorizontal={16}
      alignItemsCenter={false}
      iconSize={20}
      navigation={navigation}
    >
      <KeyboardFormView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={0}
      >
        <KeyboardAwareScrollView
          ref={scrollRef}
          enableOnAndroid
          keyboardShouldPersistTaps="handled"
          extraScrollHeight={20}
          contentContainerStyle={{
            alignItems: 'stretch',
          }}
        >
          <AnimatedFormContainer style={animatedStyle}>
            {renderStep()}
          </AnimatedFormContainer>
        </KeyboardAwareScrollView>
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
          marginBottom={10}
        />
      </Footer>
    </ScreenContainer>
  );
}

const TITLE_FONT_SIZE = 16;
const CAPTION_FONT_SIZE = 14;

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
  // @ts-ignore
  const { handleAutoScrollOnFocus } = PortfolioOnboardingView as any;
  return (
    <>
      <Typography fontSize={TITLE_FONT_SIZE} lineHeight="140%">
        <Typography fontSize={TITLE_FONT_SIZE} fontWeight="semiBold" lineHeight="140%">
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
        fontSize={CAPTION_FONT_SIZE}
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
            placeholder="작가님을 표현할 수 있는 주 촬영 컨셉, MBTI 등등 자유롭게 내용을 작성해 주세요."
            value={value}
            onChangeText={onChange}
            multiline
            height={115}
            maxLength={200}
            onFocus={handleAutoScrollOnFocus}
          />
        )}
      />
    </>
  );
};

interface PortfolioOnboardingStep2Props {
  control: Control<PortfolioOnboardingFormData>;
  photoURIs: UploadImageFile[];
  onRemoveImage: (index: number) => void;
  onAddImages: (images: any[]) => void;
}

const PortfolioOnboardingStep2 = ({
  control,
  photoURIs,
  onRemoveImage,
  onAddImages,
}: PortfolioOnboardingStep2Props) => {
  // @ts-ignore
  const { handleAutoScrollOnFocus } = PortfolioOnboardingView as any;
  return (
    <>
      <Typography fontSize={TITLE_FONT_SIZE} lineHeight="140%" marginBottom={20}>
        <Typography fontSize={TITLE_FONT_SIZE} fontWeight="semiBold" lineHeight="140%">
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
      <ImageUploadInput
        images={photoURIs}
        onRemoveImage={onRemoveImage}
        onAddImages={onAddImages}
      />
      <Typography
        fontSize={CAPTION_FONT_SIZE}
        letterSpacing="-2.5%"
        marginBottom={10}
        marginTop={22}
      >
        커뮤니티 게시글 제목
      </Typography>
      <Controller
        control={control}
        name="portfolioTitle"
        render={({ field: { onChange, value } }) => (
          <TextInput
            placeholder="게시글 제목"
            value={value}
            onChangeText={onChange}
            onFocus={handleAutoScrollOnFocus}
          />
        )}
      />
      <Typography
        fontSize={CAPTION_FONT_SIZE}
        letterSpacing="-2.5%"
        marginBottom={10}
        marginTop={22}
      >
        포트폴리오 게시글 내용을 작성해주세요.
      </Typography>
      <Controller
        control={control}
        name="portfolioDescription"
        render={({ field: { onChange, value } }) => (
          <TextInput
            placeholder="게시글에 작성할 내용을 자유롭게 작성해 주세요."
            maxLength={200}
            multiline
            value={value}
            onChangeText={onChange}
            height={115}
            onFocus={handleAutoScrollOnFocus}
          />
        )}
      />
      <CheckOptionWrapper>
        <Controller
          control={control}
          name="portfolioIsLinked"
          render={({ field: { onChange, value } }) => (
            <Checkbox
              isChecked={value}
              onPress={() => onChange(!value)}
            />
          )}
        />
        <Typography
          fontSize={12}
          color="#767676"
          marginLeft={12}
        >
          커뮤니티에 함께 게시하기
        </Typography>
      </CheckOptionWrapper>
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
      <Typography fontSize={TITLE_FONT_SIZE} lineHeight="140%" marginBottom={20}>
        <Typography fontSize={TITLE_FONT_SIZE} fontWeight="semiBold" lineHeight="140%">
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
      <Controller
        control={control}
        name="regionIds"
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
      <Typography fontSize={TITLE_FONT_SIZE} lineHeight="140%" marginBottom={20}>
        <Typography fontSize={TITLE_FONT_SIZE} fontWeight="semiBold" lineHeight="140%">
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
      <Controller
        control={control}
        name="tagIds"
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
                  {tag.name}
                </Typography>
              </CheckOptionWrapper>
            ))}
          </>
        )}
      />
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
      <Typography fontSize={TITLE_FONT_SIZE} lineHeight="140%" marginBottom={20}>
        <Typography fontSize={TITLE_FONT_SIZE} fontWeight="semiBold" lineHeight="140%">
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
      <Controller
        control={control}
        name="conceptIds"
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
    </>
  );
};

interface PortfolioOnboardingStep6Props {
  control: Control<PortfolioOnboardingFormData>;
}

const PortfolioOnboardingStep6 = ({
  control,
}: PortfolioOnboardingStep6Props) => {
  // @ts-ignore
  const { handleAutoScrollOnFocus } = PortfolioOnboardingView as any;
  return (
    <>
      <Typography fontSize={TITLE_FONT_SIZE} lineHeight="140%" marginBottom={24}>
        <Typography fontSize={TITLE_FONT_SIZE} fontWeight="semiBold" lineHeight="140%">
          촬영 정보
        </Typography>
        를 자세히 알려주세요.
      </Typography>
      <Typography
        fontSize={CAPTION_FONT_SIZE}
        letterSpacing="-2.5%"
        marginBottom={10}
      >
        기본 촬영 서비스명
      </Typography>
      <Controller
        control={control}
        name="shootingProductName"
        render={({ field: { onChange, value } }) => (
          <FormInput
            placeholder="판매할 서비스 이름을 입력해주세요 *"
            value={value}
            onChangeText={onChange}
            onFocus={handleAutoScrollOnFocus}
          />
        )}
      />
      <Typography
        fontSize={CAPTION_FONT_SIZE}
        letterSpacing="-2.5%"
        marginBottom={10}
        marginTop={25}
      >
        기본 촬영 비용
      </Typography>
      <Controller
        control={control}
        name="shootingProductBasePrice"
        render={({ field: { onChange, value } }) => (
          <FormInput
            placeholder="원"
            value={value}
            onChangeText={onChange}
            keyboardType="numeric"
            onFocus={handleAutoScrollOnFocus}
          />
        )}
      />
      <Typography
        fontSize={CAPTION_FONT_SIZE}
        letterSpacing="-2.5%"
        marginBottom={10}
        marginTop={25}
      >
        기본 촬영과 관련된 내용을 설명해주세요.
      </Typography>
      <Controller
        control={control}
        name="shootingProductDescription"
        render={({ field: { onChange, value } }) => (
          <FormInput
            placeholder="입력해주세요 *"
            value={value}
            onChangeText={onChange}
            multiline
            height={116}
            style={{ textAlignVertical: 'top', paddingTop: 16 }}
            onFocus={handleAutoScrollOnFocus}
          />
        )}
      />
      <Typography
        fontSize={CAPTION_FONT_SIZE}
        letterSpacing="-2.5%"
        marginBottom={10}
        marginTop={25}
      >
        촬영 소요 시간
      </Typography>
      <Controller
        control={control}
        name="shootingProductPhotoTime"
        render={({ field: { onChange, value } }) => {
          const currentNumber = value ? parseFloat(value) : null;
          const currentHour = currentNumber !== null ? Math.floor(currentNumber) : null;
          const currentMinute = currentNumber !== null ? (currentNumber % 1 === 0 ? 0 : 30) : null;
          const is6HoursOrMore = currentNumber !== null && currentNumber >= 6;

          return (
            <DurationWrapper>
              <DurationDropdownWrapper>
                <DropDownInput
                  placeholder="시간"
                  options={['1시간', '2시간', '3시간', '4시간', '5시간', '6시간 이상']}
                  value={
                    currentHour === null ? undefined :
                    currentHour >= 6 ? '6시간 이상' :
                    `${currentHour}시간`
                  }
                  onChange={(hourStr) => {
                    const isLongDuration = hourStr === '6시간 이상';
                    const hour = isLongDuration ? 6 : parseInt(hourStr, 10);
                    const minute = isLongDuration ? 0 : currentMinute || 0;
                    const newValue = hour + (minute / 60);
                    onChange(newValue.toString());
                  }}
                />
              </DurationDropdownWrapper>
              <DurationDropdownWrapper>
                <DropDownInput
                  placeholder="분"
                  options={['00분', '30분']}
                  value={is6HoursOrMore ? '00분' : (currentMinute === null ? undefined : `${String(currentMinute).padStart(2, '0')}분`)}
                  onChange={(minuteStr) => {
                    const minute = parseInt(minuteStr, 10);
                    const hour = currentHour || 1;
                    const newValue = hour + (minute / 60);
                    onChange(newValue.toString());
                  }}
                  disabled={is6HoursOrMore}
                />
              </DurationDropdownWrapper>
            </DurationWrapper>
          );
        }}
      />
      <Typography
        fontSize={CAPTION_FONT_SIZE}
        letterSpacing="-2.5%"
        marginBottom={10}
        marginTop={25}
      >
        촬영 인원
      </Typography>
      <Controller
        control={control}
        name="shootingProductPersonnel"
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
        fontSize={CAPTION_FONT_SIZE}
        letterSpacing="-2.5%"
        marginBottom={10}
        marginTop={25}
      >
        원본 파일 제공
      </Typography>
      <Controller
        control={control}
        name="shootingProductProvidesRawFile"
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
    </>
  );
};

interface PortfolioOnboardingStep7Props {
  control: Control<PortfolioOnboardingFormData>;
  onDeleteOption: (index: number) => void;
}

const PortfolioOnboardingStep7 = ({
  control,
  onDeleteOption,
}: PortfolioOnboardingStep7Props) => {
  const [isTimeOptions, setTimeOptions] = useState<boolean[]>([false]);

  // @ts-ignore
  const { handleAutoScrollOnFocus } = PortfolioOnboardingView as any;
  return (
    <>
      <Typography fontSize={TITLE_FONT_SIZE} lineHeight="140%" marginBottom={24}>
        <Typography fontSize={TITLE_FONT_SIZE} fontWeight="semiBold" lineHeight="140%">
          추가할 옵션
        </Typography>
        을 선택해 주세요.
      </Typography>
      <Controller
        control={control}
        name="shootingProductOptions"
        render={({ field: { onChange, value: options } }) => {
          const optionList = options || [];
          const firstOption = optionList[0] || { name: '', description: '', price: '', time: '' };
          const restOptions = optionList.slice(1);

          return (
            <>
              {/* 첫 번째 추가 옵션 (항상 표시) */}
              <Typography
                fontSize={CAPTION_FONT_SIZE}
                letterSpacing="-2.5%"
                marginBottom={10}
              >
                추가 옵션
              </Typography>
              <FormInput
                placeholder="추가 옵션명 *"
                value={firstOption.name}
                onChangeText={(name: string) => {
                  const newOptions = [...optionList];
                  if (newOptions.length === 0) {
                    newOptions.push({ name, description: '', price: '', time: '' });
                  } else {
                    newOptions[0] = { ...newOptions[0], name };
                  }
                  onChange(newOptions);
                }}
                onFocus={handleAutoScrollOnFocus}
              />
              <TimeOptionCheckboxWrapper>
                <Checkbox isChecked={isTimeOptions[0]} onPress={() => setTimeOptions([!isTimeOptions[0], ...isTimeOptions.slice(1)])} />
                <Typography
                  fontSize={14}
                  letterSpacing="-2.5%"
                  marginLeft={10}
                >
                  시간 추가 옵션
                </Typography>
              </TimeOptionCheckboxWrapper>
              {isTimeOptions[0] && (
                <FormInput
                  placeholder="추가 옵션이 시간일 경우 입력해주세요.(분)"
                  value={firstOption.time || ''}
                  keyboardType="numeric"
                  onChangeText={(time: string) => {
                    const newOptions = [...optionList];
                    if (newOptions.length === 0) {
                      newOptions.push({ name: '', description: '', price: '', time });
                    } else {
                      newOptions[0] = { ...newOptions[0], time };
                    }
                    onChange(newOptions);
                  }}
                  onFocus={handleAutoScrollOnFocus}
                />
              )}
              <Typography
                fontSize={CAPTION_FONT_SIZE}
                letterSpacing="-2.5%"
                marginBottom={10}
                marginTop={21}
              >
                추가 옵션 설명
              </Typography>
              <FormInput
                placeholder="입력해주세요 *"
                value={firstOption.description}
                onChangeText={(description: string) => {
                  const newOptions = [...optionList];
                  if (newOptions.length === 0) {
                    newOptions.push({ name: '', description, price: '', time: '' });
                  } else {
                    newOptions[0] = { ...newOptions[0], description };
                  }
                  onChange(newOptions);
                }}
                multiline
                height={116}
                style={{ textAlignVertical: 'top', paddingTop: 16 }}
                onFocus={handleAutoScrollOnFocus}
              />
              <Typography
                fontSize={CAPTION_FONT_SIZE}
                letterSpacing="-2.5%"
                marginBottom={10}
                marginTop={21}
              >
                추가 옵션 비용
              </Typography>
              <FormInput
                placeholder="원 *"
                value={firstOption.price}
                onChangeText={(price: string) => {
                  const newOptions = [...optionList];
                  if (newOptions.length === 0) {
                    newOptions.push({ name: '', description: '', price, time: '' });
                  } else {
                    newOptions[0] = { ...newOptions[0], price };
                  }
                  onChange(newOptions);
                }}
                keyboardType="numeric"
                onFocus={handleAutoScrollOnFocus}
              />

              {/* 옵션 추가 버튼 */}
              <AddOptionButton
                onPress={() => {
                  const newOptions = [...optionList, { name: '', description: '', price: '', time: '' }];
                  setTimeOptions([...isTimeOptions, false]);
                  onChange(newOptions);
                }}
              >
                <Typography
                  fontSize={14}
                  fontWeight="bold"
                  color="primary"
                >
                  옵션 추가
                </Typography>
              </AddOptionButton>

              {/* 추가된 옵션들 */}
              {restOptions.map((option: Option, index: number) => (
                <OptionItem
                  key={index}
                  name={option.name}
                  description={option.description}
                  price={option.price}
                  isTimeOption={isTimeOptions[index + 1]}
                  time={option.time}
                  setName={(name: string) => {
                    const newOptions = [...optionList];
                    newOptions[index + 1] = { ...newOptions[index + 1], name };
                    onChange(newOptions);
                  }}
                  setDescription={(description: string) => {
                    const newOptions = [...optionList];
                    newOptions[index + 1] = { ...newOptions[index + 1], description };
                    onChange(newOptions);
                  }}
                  setPrice={(price: string) => {
                    const newOptions = [...optionList];
                    newOptions[index + 1] = { ...newOptions[index + 1], price };
                    onChange(newOptions);
                  }}
                  setIsTimeOption={(isTimeOption: boolean) => {
                    setTimeOptions([...isTimeOptions.slice(0, index + 1), isTimeOption, ...isTimeOptions.slice(index + 2)]);
                  }}
                  setTime={(time: string) => {
                    const newOptions = [...optionList];
                    newOptions[index + 1] = { ...newOptions[index + 1], time };
                    onChange(newOptions);
                  }}
                  onDelete={() => onDeleteOption(index + 1)}
                />
              ))}
            </>
          );
        }}
      />
    </>
  );
};

interface PortfolioOnboardingStep8Props {
  control: Control<PortfolioOnboardingFormData>;
}

const PortfolioOnboardingStep8 = ({
  control
}: PortfolioOnboardingStep8Props) => {
  const retouchingType = useWatch({ control, name: 'shootingProductEditingType' });
  const showRetouchingDetails = retouchingType && retouchingType !== '제공하지 않음';

  // @ts-ignore
  const { handleAutoScrollOnFocus } = PortfolioOnboardingView as any;
  return (
    <>
      <Typography fontSize={TITLE_FONT_SIZE} lineHeight="140%" marginBottom={24}>
        <Typography fontSize={TITLE_FONT_SIZE} fontWeight="semiBold" lineHeight="140%">
          보정 정보
        </Typography>
        를 자세히 알려주세요.
      </Typography>
      <Typography
        fontSize={CAPTION_FONT_SIZE}
        letterSpacing="-2.5%"
        marginBottom={10}
      >
        보정 작업 제공
      </Typography>
      <Controller
        control={control}
        name="shootingProductEditingType"
        render={({ field: { onChange, value } }) => (
          <DropDownInput
            placeholder="선택해주세요 *"
            options={['얼굴 보정', '색감 보정', '얼굴, 색감 보정', '제공하지 않음']}
            value={value || undefined}
            onChange={onChange}
          />
        )}
      />
      {showRetouchingDetails && (
        <>
          <Typography
            fontSize={CAPTION_FONT_SIZE}
            letterSpacing="-2.5%"
            marginBottom={10}
            marginTop={25}
          >
            보정 작업 소요 기간
          </Typography>
          <Controller
            control={control}
            name="shootingProductEditingDeadline"
            render={({ field: { onChange, value } }) => (
              <DropDownInput
                placeholder="선택해주세요 *"
                options={['당일 보정', '2일 이내', '3일 이내', '4일 이내', '5일 이내', '7일 이내', '7일 이상']}
                value={value || undefined}
                onChange={onChange}
              />
            )}
          />
          <Typography
            fontSize={CAPTION_FONT_SIZE}
            letterSpacing="-2.5%"
            marginBottom={10}
            marginTop={25}
          >
            보정 사진 선택 권한
          </Typography>
          <Controller
            control={control}
            name="shootingProductSelectionAuthority"
            render={({ field: { onChange, value } }) => (
              <DropDownInput
                placeholder="선택해주세요 *"
                options={['작가 선택', '고객 선택', '작가와 고객 함께 선택']}
                value={value || undefined}
                onChange={onChange}
              />
            )}
          />
          <Typography
            fontSize={CAPTION_FONT_SIZE}
            letterSpacing="-2.5%"
            marginBottom={10}
            marginTop={25}
          >
            제공하는 사진 장수
          </Typography>
          <Controller
            control={control}
            name="shootingProductProvidedEditCount"
            render={({ field: { onChange, value } }) => (
              <FormInput
                placeholder="입력해주세요 *"
                value={value}
                onChangeText={onChange}
                keyboardType="numeric"
                onFocus={handleAutoScrollOnFocus}
              />
            )}
          />
        </>
      )}
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

interface PortfolioOnboardingStep9Props {
  control: Control<PortfolioOnboardingFormData>;
  onToggleDay: (day: string) => void;
}

const PortfolioOnboardingStep9 = ({
  control,
  onToggleDay,
}: PortfolioOnboardingStep9Props) => {
  const timeOptions = Array.from({ length: 24 }, (_, i) =>
    `${String(i).padStart(2, '0')}:00`
  );

  const availableDays = useWatch({ control, name: 'availableDays' }) || [];
  const selectedWeekdays = availableDays.filter((day: string) => day !== '공휴일');

  const getEndTimeOptions = (startTime: Date | null) => {
    if (!startTime) return timeOptions;
    const startHour = startTime.getHours();
    return timeOptions.filter((time) => {
      const hour = parseInt(time.split(':')[0], 10);
      return hour > startHour;
    });
  };

  return (
    <>
      <Typography fontSize={TITLE_FONT_SIZE} lineHeight="140%" marginBottom={20}>
        <Typography fontSize={TITLE_FONT_SIZE} fontWeight="semiBold" lineHeight="140%">
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
      {selectedWeekdays.map((day: string) => (
        <Controller
          key={day}
          control={control}
          name="daySchedules"
          render={({ field: { onChange, value } }) => {
            const daySchedule = value?.[day] || { startTime: null, endTime: null };
            const startTime = daySchedule.startTime;
            const endTimeOptions = getEndTimeOptions(startTime);

            return (
              <DayScheduleSection key={day}>
                <Typography
                  fontSize={CAPTION_FONT_SIZE}
                  letterSpacing="-2.5%"
                  marginBottom={17}
                  marginTop={29}
                >
                  {day} 촬영 가능 시간대
                </Typography>
                <TimeOptionWrapper>
                  <TimeDropDownInputWrapper>
                    <DropDownInput
                      placeholder="시작 시간"
                      options={timeOptions}
                      value={startTime ? `${String(startTime.getHours()).padStart(2, '0')}:00` : undefined}
                      onChange={(timeStr) => {
                        const [hours] = timeStr.split(':').map(Number);
                        const date = new Date();
                        date.setHours(hours, 0, 0, 0);
                        onChange({
                          ...value,
                          [day]: { ...daySchedule, startTime: date }
                        });
                      }}
                    />
                  </TimeDropDownInputWrapper>
                  <TimeBarWrapper>
                    <TimeBar />
                  </TimeBarWrapper>
                  <TimeDropDownInputWrapper>
                    <DropDownInput
                      placeholder="종료 시간"
                      options={endTimeOptions}
                      value={daySchedule.endTime ? `${String(daySchedule.endTime.getHours()).padStart(2, '0')}:00` : undefined}
                      onChange={(timeStr) => {
                        const [hours] = timeStr.split(':').map(Number);
                        const date = new Date();
                        date.setHours(hours, 0, 0, 0);
                        onChange({
                          ...value,
                          [day]: { ...daySchedule, endTime: date }
                        });
                      }}
                    />
                  </TimeDropDownInputWrapper>
                </TimeOptionWrapper>
              </DayScheduleSection>
            );
          }}
        />
      ))}
    </>
  );
};

const KeyboardFormView = styled.KeyboardAvoidingView`
  flex: 1;
  width: 100%;
`

const AnimatedFormContainer = styled(Animated.View)`
  width: 100%;
  align-self: stretch;
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


const CheckOptionWrapper = styled.View`
  width: 100%;
  align-self: stretch;
  flex-direction: row;
  align-items: center;
  margin-bottom: 15px;
`;

const DurationWrapper = styled.View`
  width: 100%;
  flex-direction: row;
  justify-content: space-between;
  gap: 10px;
`;

const DurationDropdownWrapper = styled.View`
  flex: 1;
`;

const TimeOptionWrapper = styled.View`
  width: 100%;
  flex-direction: row;
  justify-content: space-between;
`;

const TimeBarWrapper = styled.View`
  height: 50px;
  justify-content: center;
`;

const TimeBar = styled.View`
  width: 16px;
  height: 2px;
  margin: 0 10px;
  background-color: #C8C8C8;
`;

const TimeDropDownInputWrapper = styled.View`
  width: 130px;
`;

const DayScheduleSection = styled.View`
  width: 100%;
`;

const AddOptionButton = styled.TouchableOpacity`
  width: 100%;
  height: 49px;
  border-radius: 8px;
  border: 1px solid ${theme.colors.primary};
  justify-content: center;
  align-items: center;
  margin-top: 20px;
`;

