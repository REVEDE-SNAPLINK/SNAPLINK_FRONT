import { useMemo, useRef } from 'react';
import { Control, Controller, useWatch } from 'react-hook-form';
import styled from '@/utils/scale/CustomStyled.ts';
import ScreenContainer from '@/components/common/ScreenContainer';
import { SubmitButton, Typography } from '@/components/theme';
import Checkbox from '@/components/theme/Checkbox';
import DropDownInput from '@/components/form/DropDownInput.tsx';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

export interface DaySchedule {
  startTime: Date | null;
  endTime: Date | null;
}

export interface ScheduleFormData {
  availableDays: string[];
  daySchedules: { [day: string]: DaySchedule };
}

interface ScheduleFormViewProps {
  control: Control<ScheduleFormData>;
  onPressBack: () => void;
  onPressSubmit: () => void;
  isSubmitDisabled: boolean;
  submitButtonText?: string;

  navigation?: any;
}

const days = [
  '월요일',
  '화요일',
  '수요일',
  '목요일',
  '금요일',
  '토요일',
  '일요일',
];

export default function ScheduleFormView({
  control,
  onPressBack,
  onPressSubmit,
  isSubmitDisabled,
  submitButtonText = '저장하기',
  navigation,
}: ScheduleFormViewProps) {
  const scrollViewRef = useRef<any>(null);

  const timeOptions = useMemo(
    () => Array.from({ length: 24 }, (_, i) => `${String(i).padStart(2, '0')}:00`),
    []
  );

  const availableDays = useWatch({ control, name: 'availableDays' }) || [];
  const selectedWeekdays = availableDays.filter((day) => day !== '공휴일');

  const getEndTimeOptions = (startTime: Date | null) => {
    if (!startTime) return timeOptions;
    const startHour = startTime.getHours();
    return timeOptions.filter((time) => parseInt(time.split(':')[0], 10) > startHour);
  };

  return (
    <ScreenContainer
      headerShown
      headerTitle="촬영 가능 일정"
      onPressBack={onPressBack}
      paddingHorizontal={40}
      iconSize={20}

      navigation={navigation}>
      <Container>
        <KeyboardAwareScrollView
          innerRef={(ref) => { scrollViewRef.current = ref; }}
          enableOnAndroid
          keyboardShouldPersistTaps="handled"
          extraScrollHeight={100}
          showsVerticalScrollIndicator={false}
          nestedScrollEnabled
          contentContainerStyle={{ paddingBottom: 120 }}
        >
          <FormContainer>
            <Typography fontSize={18} lineHeight="140%" marginBottom={20}>
              <Typography fontSize={18} fontWeight="semiBold" lineHeight="140%">
                촬영 가능한 일정
              </Typography>
              을 자세히 알려주세요.
            </Typography>
            <Typography fontSize={12} marginBottom={10} color="#767676">
              *중복 선택 가능
            </Typography>

            {/* 요일 체크 */}
            <Controller
              control={control}
              name="availableDays"
              render={({ field: { value, onChange } }) => (
                <>
                  {days.map((day, i) => (
                    <CheckOptionWrapper key={i}>
                      <Checkbox
                        isChecked={(value || []).includes(day)}
                        onPress={() => {
                          const current = value || [];
                          onChange(
                            current.includes(day)
                              ? current.filter((d) => d !== day)
                              : [...current, day]
                          );
                        }}
                      />
                      <Typography fontSize={12} color="#767676" marginLeft={12}>
                        {day}
                      </Typography>
                    </CheckOptionWrapper>
                  ))}
                </>
              )}
            />

            {/* 선택된 요일별 시간 설정 */}
            <Controller
              control={control}
              name="daySchedules"
              render={({ field: { onChange, value } }) => (
                <>
                  {selectedWeekdays.map((day) => {
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
                              value={
                                startTime
                                  ? `${String(startTime.getHours()).padStart(2, '0')}:00`
                                  : undefined
                              }
                              onChange={(timeStr) => {
                                const [hours] = timeStr.split(':').map(Number);
                                const date = new Date();
                                date.setHours(hours, 0, 0, 0);

                                const prevEnd = daySchedule.endTime;
                                const nextEnd =
                                  prevEnd && prevEnd.getHours() <= hours ? null : prevEnd;

                                onChange({
                                  ...(value || {}),
                                  [day]: {
                                    ...daySchedule,
                                    startTime: date,
                                    endTime: nextEnd,
                                  },
                                });
                              }}
                              scrollViewRef={scrollViewRef}
                            />
                          </TimeDropDownInputWrapper>

                          <TimeBarWrapper>
                            <TimeBar />
                          </TimeBarWrapper>

                          <TimeDropDownInputWrapper>
                            <DropDownInput
                              placeholder="종료 시간"
                              options={endTimeOptions}
                              value={
                                daySchedule.endTime
                                  ? `${String(daySchedule.endTime.getHours()).padStart(2, '0')}:00`
                                  : undefined
                              }
                              onChange={(timeStr) => {
                                const [hours] = timeStr.split(':').map(Number);
                                const date = new Date();
                                date.setHours(hours, 0, 0, 0);

                                onChange({
                                  ...(value || {}),
                                  [day]: {
                                    ...daySchedule,
                                    endTime: date,
                                  },
                                });
                              }}
                              disabled={!startTime}
                              scrollViewRef={scrollViewRef}
                            />
                          </TimeDropDownInputWrapper>
                        </TimeOptionWrapper>
                      </DayScheduleSection>
                    );
                  })}
                </>
              )}
            />

            <ScrollViewSpacer />
          </FormContainer>
        </KeyboardAwareScrollView>

        {/* Footer 고정 */}
        <Footer>
          <SubmitButton
            onPress={onPressSubmit}
            width="100%"
            disabled={isSubmitDisabled}
            text={submitButtonText}
            marginBottom={10}
          />
        </Footer>
      </Container>
    </ScreenContainer>
  );
}

const Container = styled.View`
  flex: 1;
  width: 100%;
`;

const FormContainer = styled.View`
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

const ScrollViewSpacer = styled.View`
  height: 50px;
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
`;

const TimeBarWrapper = styled.View`
  height: 50px;
  justify-content: center;
`;

const TimeBar = styled.View`
  width: 16px;
  height: 2px;
  margin: 0 10px;
  background-color: #c8c8c8;
`;

const TimeDropDownInputWrapper = styled.View`
  width: 130px;
`;

const DayScheduleSection = styled.View`
  width: 100%;
`;