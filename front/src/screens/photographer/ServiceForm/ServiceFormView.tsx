import { useEffect } from 'react';
import { Control, FieldErrors, Controller, useWatch } from 'react-hook-form';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import styled from '@/utils/scale/CustomStyled.ts';
import { SubmitButton, Typography } from '@/components/theme';
import ScreenContainer from '@/components/common/ScreenContainer';
import { Platform, ScrollView } from 'react-native';
import FormInput from '@/components/form/FormInput.tsx';
import DropDownInput from '@/components/form/DropDownInput.tsx';
import Checkbox from '@/components/theme/Checkbox.tsx';
import OptionItem, { Option } from '@/components/OptionItem.tsx';
import { theme } from '@/theme';

export interface DaySchedule {
  startTime: Date | null;
  endTime: Date | null;
}

export interface ServiceFormData {
  shootingProductName: string;
  basePrice: string;
  shootingDuration: string | null;
  shootingPeople: string | null;
  shootingDescription: string;
  retouchingType: string | null;
  provideRawFiles: boolean;
  retouchingDuration: string | null;
  retouchingSelectionRight: string | null;
  shootingProductProvidedEditCount: string;
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
  isEditMode: boolean;
  navigation?: any;
}

export default function ServiceFormView({
  currentStep,
  control,
  onPressBack,
  onPressSubmit,
  isSubmitDisabled,
  submitButtonText,
  onDeleteOption,
  isEditMode,
  navigation,
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
        return <ServiceFormStep1 control={control} />;
      case 1:
        return <ServiceFormStep2 control={control} onDeleteOption={onDeleteOption} isEditMode={isEditMode} />;
      case 2:
        return <ServiceFormStep3 control={control} />;
      default:
        return null;
    }
  };

  return (
    <ScreenContainer
      headerShown
      headerTitle={isEditMode ? '촬영 서비스 수정' : '촬영 서비스 등록'}
      paddingHorizontal={20}
      onPressBack={onPressBack}
      navigation={navigation}
    >
      <KeyboardFormView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollContainer showsVerticalScrollIndicator={false}>
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

interface ServiceFormStep1Props {
  control: Control<ServiceFormData>;
}

const ServiceFormStep1 = ({
  control,
}: ServiceFormStep1Props) => {
  return (
    <>
      <Typography fontSize={18} lineHeight="140%" marginBottom={24}>
        <Typography fontSize={18} fontWeight="semiBold" lineHeight="140%">
          촬영 정보
        </Typography>
        를 자세히 알려주세요.
      </Typography>
      <Typography
        fontSize={16}
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
          />
        )}
      />
      <Typography
        fontSize={16}
        letterSpacing="-2.5%"
        marginBottom={10}
        marginTop={25}
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
        기본 촬영과 관련된 내용을 설명해주세요.
      </Typography>
      <Controller
        control={control}
        name="shootingDescription"
        render={({ field: { onChange, value } }) => (
          <FormInput
            placeholder="입력해주세요 *"
            value={value}
            onChangeText={onChange}
            multiline
            height={116}
            style={{ textAlignVertical: 'top', paddingTop: 16 }}
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
    </>
  );
};

interface ServiceFormStep2Props {
  control: Control<ServiceFormData>;
  onDeleteOption: (index: number) => void;
  isEditMode: boolean;
}

const ServiceFormStep2 = ({
  control,
  onDeleteOption,
  isEditMode,
}: ServiceFormStep2Props) => {
  return (
    <>
      <Typography fontSize={18} lineHeight="140%" marginBottom={24}>
        <Typography fontSize={18} fontWeight="semiBold" lineHeight="140%">
          추가할 옵션
        </Typography>
        을 선택해 주세요.
      </Typography>
      <Controller
        control={control}
        name="additionalOptions"
        render={({ field: { onChange, value: options } }) => {
          const optionList = options || [];
          const firstOption = optionList[0] || { name: '', description: '', price: '', time: '' };
          const restOptions = optionList.slice(1);

          return (
            <>
              {/* 신규 등록 모드: 첫 번째 추가 옵션 인라인 폼 (항상 표시) */}
              {!isEditMode && (
                <>
                  <Typography
                    fontSize={16}
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
                  />
                  <Typography
                    fontSize={16}
                    letterSpacing="-2.5%"
                    marginBottom={10}
                    marginTop={21}
                  >
                    시간 추가 옵션
                  </Typography>
                  <FormInput
                    placeholder="추가 옵션이 시간일 경우 입력해주세요.(분)"
                    value={firstOption.time || ''}
                    onChangeText={(time: string) => {
                      const newOptions = [...optionList];
                      if (newOptions.length === 0) {
                        newOptions.push({ name: '', description: '', price: '', time });
                      } else {
                        newOptions[0] = { ...newOptions[0], time };
                      }
                      onChange(newOptions);
                    }}
                  />
                  <Typography
                    fontSize={16}
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
                  />
                  <Typography
                    fontSize={16}
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
                  />
                </>
              )}

              {/* 옵션 추가 버튼 */}
              <AddOptionButton
                onPress={() => {
                  const newOptions = [...optionList, { name: '', description: '', price: '', time: '' }];
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

              {/* 수정 모드: 모든 옵션을 OptionItem으로 표시 */}
              {isEditMode && optionList.map((option: Option, index: number) => (
                <OptionItem
                  key={index}
                  id={option.id}
                  name={option.name}
                  description={option.description}
                  price={option.price}
                  time={option.time}
                  setName={(name: string) => {
                    const newOptions = [...optionList];
                    newOptions[index] = { ...newOptions[index], name };
                    onChange(newOptions);
                  }}
                  setDescription={(description: string) => {
                    const newOptions = [...optionList];
                    newOptions[index] = { ...newOptions[index], description };
                    onChange(newOptions);
                  }}
                  setPrice={(price: string) => {
                    const newOptions = [...optionList];
                    newOptions[index] = { ...newOptions[index], price };
                    onChange(newOptions);
                  }}
                  setTime={(time: string) => {
                    const newOptions = [...optionList];
                    newOptions[index] = { ...newOptions[index], time };
                    onChange(newOptions);
                  }}
                  onDelete={() => onDeleteOption(index)}
                />
              ))}

              {/* 신규 등록 모드: 두 번째 이후 옵션들만 OptionItem으로 표시 */}
              {!isEditMode && restOptions.map((option: Option, index: number) => (
                <OptionItem
                  key={index}
                  id={option.id}
                  name={option.name}
                  description={option.description}
                  price={option.price}
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

interface ServiceFormStep3Props {
  control: Control<ServiceFormData>;
}

const ServiceFormStep3 = ({
  control
}: ServiceFormStep3Props) => {
  const retouchingType = useWatch({ control, name: 'retouchingType' });
  const showRetouchingDetails = retouchingType && retouchingType !== '제공하지 않음';

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
        {showRetouchingDetails && (
          <>
            <Typography
              fontSize={16}
              letterSpacing="-2.5%"
              marginBottom={10}
              marginTop={25}
            >
              보정 작업 소요 기간
            </Typography>
            <Controller
              control={control}
              name="retouchingDuration"
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
            <Typography
              fontSize={16}
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
                />
              )}
            />
          </>
        )}
        <ScrollViewSpacer />
      </ScrollView>
    </>
  );
};


const Footer = styled.View`
  width: 100%;
  padding-top: 20px;
  padding-bottom: 20px;
  align-items: center;
  justify-content: center;
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

const DurationWrapper = styled.View`
  width: 100%;
  flex-direction: row;
  justify-content: space-between;
  gap: 10px;
`;

const DurationDropdownWrapper = styled.View`
  flex: 1;
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
