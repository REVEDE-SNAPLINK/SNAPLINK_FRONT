import { Control, Controller } from 'react-hook-form';
import styled from '@/utils/scale/CustomStyled.ts';
import { Typography } from '@/components/theme';
import FormInput from '@/components/form/FormInput.tsx';
import Icon from '@/components/Icon.tsx';
import CrossIcon from '@/assets/icons/cross-white.svg';
import { theme } from '@/theme';

interface Option {
  name: string;
  description: string;
  price: string;
}

interface OptionListProps<T extends { additionalOptions: Option[] }> {
  control: Control<T>;
  onDelete: (index: number) => void;
}

export default function OptionList<T extends { additionalOptions: Option[] }>({
  control,
  onDelete
}: OptionListProps<T>) {
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
                onDelete={() => onDelete(index)}
                name={option.name}
                description={option.description}
                price={option.price}
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

interface OptionItemProps extends Option {
  setName: (name: string) => void;
  setDescription: (description: string) => void;
  setPrice: (price: string) => void;
  onDelete: () => void;
}

const OptionItem = ({ name, description, price, setName, setDescription, setPrice, onDelete }: OptionItemProps) => {
  return (
    <OptionWrapper>
      <DeleteOptionButton onPress={onDelete}>
        <Icon width={12} height={12} Svg={CrossIcon} />
      </DeleteOptionButton>
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
  )
}

const AddOptionButton = styled.TouchableOpacity`
  width: 100%;
  height: 49px;
  border-radius: 8px;
  border: 1px solid ${theme.colors.primary};
  justify-content: center;
  align-items: center;
  margin-top: 20px;
`

const DeleteOptionButton = styled.TouchableOpacity`
  width: 20px;
  height: 20px;
  border-radius: 30px;
  align-items: center;
  justify-content: center;
  background-color: #aaa;
  position: absolute;
  right: 9px;
  top: 9px;
  transform: rotate(45deg);
`

const OptionWrapper = styled.View`
  width: 100%;
  padding: 21px 13px;
  border-radius: 10px;
  border: 1px solid ${theme.colors.primary};
  margin-top: 20px;
`
