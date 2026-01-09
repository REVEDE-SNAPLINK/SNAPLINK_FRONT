import styled from '@/utils/scale/CustomStyled.ts';
import { Typography } from '@/components/theme';
import FormInput from '@/components/form/FormInput.tsx';
import Icon from '@/components/Icon.tsx';
import CrossIcon from '@/assets/icons/cross-black.svg';
import { theme } from '@/theme';
import React from 'react';
import DropDownInput from '@/components/form/DropDownInput.tsx';

export interface Option {
  id?: number; // ID for existing options (used in edit mode)
  name: string;
  description: string;
  time: string;
  price: string;
  isTimeOption?: boolean;
}

interface OptionItemProps extends Option {
  setName: (name: string) => void;
  setDescription: (description: string) => void;
  setPrice: (price: string) => void;
  setIsTimeOption?: (isTimeOption: boolean) => void;
  setTime?: (time: string) => void;
  onDelete: () => void;
}

export default function OptionItem({
  name,
  description,
  price,
  setName,
  setDescription,
  setPrice,
  onDelete
}: OptionItemProps) {
  return (
    <OptionWrapper>
      <DeleteButtonWrapper onPress={onDelete}>
        <Icon width={18} height={18} Svg={CrossIcon} onPress={onDelete} />
      </DeleteButtonWrapper>
      <Typography
        fontSize={18}
        letterSpacing="-2.5%"
        marginBottom={16}
        fontWeight="bold"
      >
        부가옵션 추가하기
      </Typography>
      <Typography
        fontSize={16}
        letterSpacing="-2.5%"
        marginBottom={10}
      >
        부가 옵션
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
        marginTop={21}
      >
        부가 옵션 설명
      </Typography>
      <FormInput
        placeholder="입력해주세요 *"
        value={description}
        onChangeText={setDescription}
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
        부가 옵션 비용
      </Typography>
      <FormInput
        placeholder="원 *"
        value={price}
        onChangeText={setPrice}
        keyboardType="numeric"
      />
    </OptionWrapper>
  );
}

interface TimeOptionItemProps {
  price: string;
  setPrice: (price: string) => void;
  time: string;
  setTime: (time: string) => void;
  onDelete: () => void;
}

export function TimeOptionItem({
  price,
  setPrice,
  time,
  setTime,
  onDelete
}: TimeOptionItemProps) {
  // time은 분단위로 저장되어 있음 (예: 90 = 1시간 30분)
  const currentMinutes = time ? parseInt(time, 10) : null;
  const currentHour = currentMinutes !== null ? Math.floor(currentMinutes / 60) : null;
  const currentMinute = currentMinutes !== null ? (currentMinutes % 60) : null;

  return (
    <OptionWrapper>
      <DeleteButtonWrapper onPress={onDelete}>
        <Icon width={18} height={18} Svg={CrossIcon} onPress={onDelete} />
      </DeleteButtonWrapper>
      <Typography
        fontSize={18}
        letterSpacing="-2.5%"
        marginBottom={16}
        fontWeight="bold"
      >
        시간옵션 추가하기
      </Typography>
      <Typography
        fontSize={16}
        letterSpacing="-2.5%"
        marginBottom={10}
      >
        추가 옵션 시간
      </Typography>
      <DurationWrapper>
        <DurationDropdownWrapper>
          <DropDownInput
            placeholder="시간"
            options={['0시간', '1시간', '2시간', '3시간', '4시간', '5시간']}
            value={currentHour === null ? undefined : `${currentHour}시간`}
            onChange={(hourStr) => {
              const hour = parseInt(hourStr, 10);
              const minute = currentMinute || 0;
              const totalMinutes = hour * 60 + minute;
              setTime(totalMinutes.toString());
            }}
          />
        </DurationDropdownWrapper>
        <DurationDropdownWrapper>
          <DropDownInput
            placeholder="분"
            options={['00분', '30분']}
            value={currentMinute === null ? undefined : `${String(currentMinute).padStart(2, '0')}분`}
            onChange={(minuteStr) => {
              const minute = parseInt(minuteStr, 10);
              const hour = currentHour || 0;
              const totalMinutes = hour * 60 + minute;
              setTime(totalMinutes.toString());
            }}
          />
        </DurationDropdownWrapper>
      </DurationWrapper>
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
        value={price}
        onChangeText={setPrice}
        keyboardType="numeric"
      />
    </OptionWrapper>
  );
}

const DeleteButtonWrapper = styled.TouchableOpacity`
  position: absolute;
  right: 9px;
  top: 9px;
  transform: rotate(45deg);
`;

const OptionWrapper = styled.View`
  width: 100%;
  padding: 21px 13px;
  border-radius: 10px;
  border: 1px solid ${theme.colors.primary};
  margin-top: 20px;
`;

const DurationWrapper = styled.View`
  flex-direction: row;
  gap: 10px;
`;

const DurationDropdownWrapper = styled.View`
  flex: 1;
`;
