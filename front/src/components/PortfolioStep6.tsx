import { Control, Controller } from 'react-hook-form';
import { Typography } from '@/components/theme';
import FormInput from '@/components/form/FormInput.tsx';
import DropDownInput from '@/components/form/DropDownInput.tsx';
import Checkbox from '@/components/Checkbox.tsx';
import OptionList from '@/components/OptionList.tsx';
import styled from '@/utils/scale/CustomStyled.ts';

interface Option {
  name: string;
  description: string;
  price: string;
}

export interface Step6FormData {
  basePrice: string;
  shootingDescription: string;
  shootingDuration: string | null;
  shootingPeople: string | null;
  provideRawFiles: boolean;
  additionalOptions: Option[];
}

interface PortfolioStep6Props<T extends Step6FormData> {
  control: Control<T>;
  onDeleteOption: (index: number) => void;
}

export default function PortfolioStep6<T extends Step6FormData>({
  control,
  onDeleteOption,
}: PortfolioStep6Props<T>) {
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
          // Parse current value to hour and minute
          const currentNumber = value ? parseFloat(value) : null;
          const currentHour = currentNumber !== null ? Math.floor(currentNumber) : null;
          const currentMinute = currentNumber !== null ? (currentNumber % 1 === 0 ? 0 : 30) : null;

          // Check if "6시간 이상" is selected
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
}

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
