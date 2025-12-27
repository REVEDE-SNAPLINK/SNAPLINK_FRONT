import { Control, Controller } from 'react-hook-form';
import { ScrollView } from 'react-native';
import styled from '@/utils/scale/CustomStyled.ts';
import { Typography } from '@/components/theme';
import DropDownInput from '@/components/form/DropDownInput.tsx';
import Checkbox from '@/components/Checkbox.tsx';
import FormInput from '@/components/form/FormInput.tsx';

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

export interface DaySchedule {
  startTime: Date | null;
  endTime: Date | null;
}

export interface Step8FormData {
  availableDays: string[];
  daySchedules: { [day: string]: DaySchedule };
  unavailableDateDescription: string;
}

interface PortfolioStep8Props<T extends Step8FormData> {
  control: Control<T>;
  onToggleDay: (day: string) => void;
}

export default function PortfolioStep8<T extends Step8FormData>({
  control,
  onToggleDay,
}: PortfolioStep8Props<T>) {
  // Generate time options (00:00 to 23:00)
  const timeOptions = Array.from({ length: 24 }, (_, i) =>
    `${String(i).padStart(2, '0')}:00`
  );

  const availableDays = control._formValues.availableDays || [];
  const selectedWeekdays = availableDays.filter(day => day !== '공휴일');

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
        {selectedWeekdays.map((day) => (
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
}

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
`;

const TimeBarWrapper = styled.View`
  height: 50px;
  justify-content: center;
`

const TimeBar = styled.View`
  width: 16px;
  height: 2px;
  margin: 0 10px;
  background-color: #C8C8C8;
`;

const TimeDropDownInputWrapper = styled.View`
  width: 130px;
`

const DayScheduleSection = styled.View`
  width: 100%;
`
