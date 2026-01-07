import styled from '@/utils/scale/CustomStyled.ts';
import { Typography } from '@/components/theme';
import FormInput from '@/components/form/FormInput.tsx';
import Icon from '@/components/Icon.tsx';
import CrossIcon from '@/assets/icons/cross-black.svg';
import { theme } from '@/theme';
import Checkbox from '@/components/theme/Checkbox.tsx';
import React from 'react';

export interface Option {
  id?: number; // ID for existing options (used in edit mode)
  name: string;
  description: string;
  price: string;
  time?: string;
}

interface OptionItemProps extends Option {
  setName: (name: string) => void;
  setDescription: (description: string) => void;
  setPrice: (price: string) => void;
  setTime?: (time: string) => void;
  onDelete: () => void;
  isTimeOption: boolean;
  setIsTimeOption: (isTimeOption: boolean) => void;
}

export default function OptionItem({
  name,
  description,
  price,
  isTimeOption,
  time = '',
  setName,
  setDescription,
  setPrice,
  setIsTimeOption,
  setTime,
  onDelete
}: OptionItemProps) {
  return (
    <OptionWrapper>
      <DeleteButtonWrapper onPress={onDelete}>
        <Icon width={18} height={18} Svg={CrossIcon} onPress={onDelete} />
      </DeleteButtonWrapper>
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
      <TimeOptionCheckboxWrapper>
        <Checkbox isChecked={isTimeOption} onPress={() => setIsTimeOption(!isTimeOption)} />
        <Typography
          fontSize={14}
          letterSpacing="-2.5%"
          marginLeft={10}
        >
          시간 추가 옵션
        </Typography>
      </TimeOptionCheckboxWrapper>
      {isTimeOption && (
        <FormInput
          placeholder="시간을 추가로 판매할 경우 입력해주세요. (분)"
          value={time}
          onChangeText={setTime}
        />
      )}
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

export const TimeOptionCheckboxWrapper = styled.View`
  flex-direction: row;
  align-items: center;
  margin-top: 20px;
  margin-bottom: 10px;
`
