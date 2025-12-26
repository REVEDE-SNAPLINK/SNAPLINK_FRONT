import { useEffect, useMemo } from 'react';
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
import { Platform, ScrollView } from 'react-native';
import Checkbox from '@/components/Checkbox.tsx';
import FormInput from '@/components/form/FormInput.tsx';
import DropDownInput from '@/components/form/DropDownInput.tsx';
import TimeDropDownInput from '@/components/form/TimeDropDownInput.tsx';
import { theme } from '@/theme';

interface Option {
  name: string;
  description: string;
  price: string;
  isChecked: boolean;
}

export interface ShootingInfoFormData {
  basePrice: string;
  shootingDuration: string | null;
  shootingPeople: string | null;
  shootingDescription: string;
  retouchingType: string | null;
  provideRawFiles: boolean;
  retouchingDuration: string | null;
  retouchingSelectionRight: string | null;
  availableDays: string[];
  startTime: Date | null;
  endTime: Date | null;
  additionalOptions: Option[];
}

interface AddShootingInfoViewProps {
  currentStep: number;
  control: Control<ShootingInfoFormData>;
  errors: FieldErrors<ShootingInfoFormData>;
  onPressSubmit: () => void;
  isSubmitDisabled: boolean;
  submitButtonText: string;
  onToggleDay: (day: string) => void;
}

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

// Step 1: 촬영 정보
interface Step1Props {
  control: Control<ShootingInfoFormData>;
}

const Step1 = ({ control }: Step1Props) => {
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

      <OptionList control={control} />
    </>
  );
};

// Step 2: 보정 정보
interface Step2Props {
  control: Control<ShootingInfoFormData>;
}

const Step2 = ({ control }: Step2Props) => {
  const retouchingType = control._formValues.retouchingType;
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
          </>
        )}
        <ScrollViewSpacer />
      </ScrollView>
    </>
  );
};

// Step 3: 촬영 가능 일정
interface Step3Props {
  control: Control<ShootingInfoFormData>;
  onToggleDay: (day: string) => void;
}

const Step3 = ({ control, onToggleDay }: Step3Props) => {
  // Generate time options (00:00 to 23:00)
  const timeOptions = Array.from({ length: 24 }, (_, i) =>
    `${String(i).padStart(2, '0')}:00`
  );

  const startTime = control._formValues.startTime;

  // Filter end time options to be later than start time
  const endTimeOptions = useMemo(() => {
    if (!startTime) return timeOptions;
    const startHour = startTime.getHours();
    return timeOptions.filter((time) => {
      const hour = parseInt(time.split(':')[0]);
      return hour > startHour;
    });
  }, [startTime]);

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
              <TimeDropDownInput
                placeholder="시작 시간"
                options={timeOptions}
                value={value ? `${String(value.getHours()).padStart(2, '0')}:00` : undefined}
                onChange={(timeStr) => {
                  const [hours] = timeStr.split(':').map(Number);
                  const date = new Date();
                  date.setHours(hours, 0, 0, 0);
                  onChange(date);
                }}
              />
            )}
          />
          <TimeBar />
          <Controller
            control={control}
            name="endTime"
            render={({ field: { onChange, value } }) => (
              <TimeDropDownInput
                placeholder="종료 시간"
                options={endTimeOptions}
                value={value ? `${String(value.getHours()).padStart(2, '0')}:00` : undefined}
                onChange={(timeStr) => {
                  const [hours] = timeStr.split(':').map(Number);
                  const date = new Date();
                  date.setHours(hours, 0, 0, 0);
                  onChange(date);
                }}
              />
            )}
          />
        </TimeOptionWrapper>
        <ScrollViewSpacer />
      </ScrollView>
    </>
  );
};

// OptionList and OptionItem components
interface OptionItemProps extends Option {
  setChecked: (checked: boolean) => void;
  setName: (name: string) => void;
  setDescription: (description: string) => void;
  setPrice: (price: string) => void;
}

const OptionItem = ({ name, description, price, setName, setDescription, setPrice, isChecked, setChecked }: OptionItemProps) => {
  return (
    <OptionWrapper>
      <OptionCheckWrapper>
        <Checkbox isChecked={isChecked} onPress={() => setChecked(!isChecked)} />
        <Typography
          fontSize={14}
          color="primary"
          marginLeft={12}
        >옵션 추가하기</Typography>
      </OptionCheckWrapper>
      <Typography
        fontSize={14}
      >
        <Typography
          fontSize={16}
          letterSpacing="-2.5%"
          marginBottom={10}
        >
          추가 옵션
        </Typography>
        <FormInput
          placeholder="추가 옵션명 *"
          value={name}
          onChangeText={setName}
        />
        <Typography
          fontSize={16}
          letterSpacing="-2.5%"
          marginBottom={10}
          marginTop={25}
        >
          추가 옵션 설명
        </Typography>
        <FormInput
          placeholder="입력해주세요 *"
          value={description}
          onChangeText={setDescription}
          multiline
          height={116}
          style={{ textAlignVertical: 'top', paddingTop: 16 }}
        />
      </Typography>
      <Typography
        fontSize={16}
        letterSpacing="-2.5%"
        marginBottom={10}
      >
        추가 옵션 비용
      </Typography>
      <FormInput
        placeholder="원 *"
        value={price}
        onChangeText={setPrice}
        keyboardType="numeric"
      />
    </OptionWrapper>
  )
}

interface OptionProps {
  control: Control<ShootingInfoFormData>;
}

const OptionList = ({
  control,
}: OptionProps) => {
  return (
    <Controller
      control={control}
      name="additionalOptions"
      render={({ field: { onChange, value: options } }) => {
        const optionList = options || [];
        return (
          <>
            <AddOptionButton
              onPress={() => {
                const newOptions = [...optionList, { name: '', description: '', price: '', isChecked: true}];
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
            {optionList.map((option: Option, index: number) => (
              <OptionItem
                key={index}
                name={option.name}
                description={option.description}
                price={option.price}
                isChecked={option.isChecked}
                setChecked={(checked: boolean) => {
                  const newOptions = [...optionList];
                  newOptions[index] = { ...newOptions[index], isChecked: checked };
                  onChange(newOptions);
                }}
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
              />
            ))}
          </>
        )
      }}
    />
  )
}

export default function AddShootingInfoView({
  currentStep,
  control,
  errors,
  onPressSubmit,
  isSubmitDisabled,
  submitButtonText,
  onToggleDay,
}: AddShootingInfoViewProps) {
  // Animation for step transition
  const translateX = useSharedValue(0);

  useEffect(() => {
    translateX.value = 0;
    translateX.value = withTiming(0, {
      duration: 300,
      easing: Easing.out(Easing.ease),
    });
  }, [currentStep]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  // Render current step
  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return <Step1 control={control} />;
      case 1:
        return <Step2 control={control} />;
      case 2:
        return <Step3 control={control} onToggleDay={onToggleDay} />;
      default:
        return null;
    }
  };

  return (
    <ScreenContainer headerShown={true} headerTitle="촬영 정보 추가" alignItemsCenter={false}>
      <KeyboardFormView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <ScrollContainer
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 24 }}
        >
          <AnimatedFormContainer style={animatedStyle}>
            {renderStep()}
          </AnimatedFormContainer>
        </ScrollContainer>

        <Footer style={{ paddingBottom: Platform.OS === 'ios' ? 34 : 20 }}>
          <SubmitButton
            text={submitButtonText}
            onPress={onPressSubmit}
            disabled={isSubmitDisabled}
          />
        </Footer>
      </KeyboardFormView>
    </ScreenContainer>
  );
}

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

const Footer = styled.View`
  width: 100%;
  padding-horizontal: 24px;
  padding-top: 20px;
`;

const ScrollViewSpacer = styled.View`
  height: 40px;
`;

const CheckOptionWrapper = styled.View`
  flex-direction: row;
  align-items: center;
  margin-bottom: 16px;
`;

const TimeOptionWrapper = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
`;

const TimeBar = styled.View`
  width: 16px;
  height: 2px;
  background-color: #C8C8C8;
`;

const AddOptionButton = styled.TouchableOpacity`
  width: 100%;
  height: 49px;
  border-radius: 8px;
  border: 1px solid ${theme.colors.primary};
  justify-content: center;
  align-items: center;
  margin-top: 20px;
`

const OptionWrapper = styled.View`
  width: 100%;
  padding: 21px 13px;
  border-radius: 10px;
  border: 1px solid ${theme.colors.primary};
  margin-top: 20px;
`

const OptionCheckWrapper = styled.View`
  flex-direction: row;
  align-items: center;
`
