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
import OptionList from '@/components/OptionList.tsx';

interface Option {
  name: string;
  description: string;
  price: string;
}

export interface DaySchedule {
  startTime: Date | null;
  endTime: Date | null;
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
        return <ServiceFormStep1 control={control} onDeleteOption={onDeleteOption} />;
      case 1:
        return <ServiceFormStep2 control={control} />;
      case 2:
        return <ServiceFormStep3 control={control} onToggleDay={onToggleDay} />;
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
  onDeleteOption: (index: number) => void;
}

const ServiceFormStep1 = ({
  control,
  onDeleteOption,
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

      <OptionList control={control} onDelete={onDeleteOption} />
    </>
  );
};

interface ServiceFormStep2Props {
  control: Control<ServiceFormData>;
}

const ServiceFormStep2 = ({
  control
}: ServiceFormStep2Props) => {
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

interface ServiceFormStep3Props {
  control: Control<ServiceFormData>;
  onToggleDay: (day: string) => void;
}

const ServiceFormStep3 = ({
  control,
  onToggleDay,
}: ServiceFormStep3Props) => {
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
                    fontSize={16}
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
        <Typography
          fontSize={16}
          letterSpacing="-2.5%"
          marginBottom={17}
          marginTop={29}
        >
          특별히 예약이 불가능한 날짜를 알려주세요.
        </Typography>
        <Controller
          control={control}
          name="unavailableDateDescription"
          render={({ field: { onChange, value } }) => (
            <FormInput
              placeholder="특정 요일, 시간에 대한 참고사항에 대해 최대한 자세하게 남겨주세요 *"
              value={value}
              onChangeText={onChange}
              multiline
              height={116}
              style={{ textAlignVertical: 'top', paddingTop: 16 }}
            />
          )}
        />
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
