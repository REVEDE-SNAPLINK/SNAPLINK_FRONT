import { useState } from 'react';
import { TouchableOpacity, Modal, ScrollView } from 'react-native';
import styled from '@/utils/scale/CustomStyled.ts';
import FormErrorMessage from '@/components/FormErrorMessage.tsx';
import ArrowDownIcon from '@/assets/icons/arrow-down.svg';
import Icon from '@/components/Icon.tsx';
import { theme } from '@/theme';

interface DropDownInputProps {
  placeholder: string;
  options: string[];
  value?: string;
  onChange?: (value: string) => void;
  errorMessage?: string;
}

const InputFieldWrapper = styled.View`
  width: 100%;
  background-color: #F9F9F9;
  border: 1px solid #E9E9E9;
  border-radius: 5px;
  height: 50px;
  padding: 0 21px;
  align-items: center;
  justify-content: space-between;
  flex-direction: row;
`;

const StyledInputField = styled.Text`
  flex: 1;
  font-size: 14px;
  font-family: Pretendard-Regular;
  letter-spacing: 0.2px;
  color: #000;
`;

const PlaceholderText = styled.Text`
  flex: 1;
  font-size: 14px;
  font-family: Pretendard-Regular;
  letter-spacing: 0.2px;
  color: #737373;
`;

const FormErrorMessageSpacer = styled.View`
  height: 10px;
`;

const DropDownModalOverlay = styled.View`
  flex: 1;
  justify-content: center;
  align-items: center;
  background-color: rgba(0, 0, 0, 0.3);
`;

const DropDownContent = styled.View`
  width: 80%;
  max-height: 300px;
  background-color: #fff;
  border-radius: 8px;
  overflow: hidden;
`;

const DropDownOption = styled.TouchableOpacity<{ isSelected: boolean }>`
  width: 100%;
  padding: 15px 20px;
  background-color: ${({ isSelected }) => isSelected ? `rgba(${parseInt(theme.colors.primary.slice(1, 3), 16)}, ${parseInt(theme.colors.primary.slice(3, 5), 16)}, ${parseInt(theme.colors.primary.slice(5, 7), 16)}, 0.2)` : '#fff'};
  border-bottom-width: 1px;
  border-bottom-color: #E9E9E9;
`;

const OptionText = styled.Text`
  font-size: 14px;
  font-family: Pretendard-Regular;
  letter-spacing: 0.2px;
  color: #000;
`;

export default function DropDownInput({
  placeholder,
  options,
  value,
  onChange,
  errorMessage,
}: DropDownInputProps) {
  const [isDropDownVisible, setIsDropDownVisible] = useState(false);

  const handlePress = () => {
    setIsDropDownVisible(true);
  };

  const handleSelectOption = (option: string) => {
    onChange?.(option);
    setIsDropDownVisible(false);
  };

  return (
    <>
      <TouchableOpacity
        onPress={handlePress}
        activeOpacity={0.7}
        style={{ width: '100%' }}
      >
        <InputFieldWrapper pointerEvents="none">
          {value ? (
            <StyledInputField>{value}</StyledInputField>
          ) : (
            <PlaceholderText>{placeholder}</PlaceholderText>
          )}
          <Icon width={24} height={24} Svg={ArrowDownIcon} />
        </InputFieldWrapper>
      </TouchableOpacity>
      {errorMessage && (
        <>
          <FormErrorMessageSpacer />
          <FormErrorMessage message={errorMessage} />
        </>
      )}
      <Modal
        visible={isDropDownVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsDropDownVisible(false)}
      >
        <TouchableOpacity
          style={{ flex: 1 }}
          activeOpacity={1}
          onPress={() => setIsDropDownVisible(false)}
        >
          <DropDownModalOverlay>
            <TouchableOpacity
              activeOpacity={1}
              onPress={(e) => e.stopPropagation()}
              style={{ width: '80%', maxHeight: 300 }}
            >
              <DropDownContent>
                <ScrollView>
                  {options.map((option, index) => (
                    <DropDownOption
                      key={index}
                      isSelected={value === option}
                      onPress={() => handleSelectOption(option)}
                    >
                      <OptionText>{option}</OptionText>
                    </DropDownOption>
                  ))}
                </ScrollView>
              </DropDownContent>
            </TouchableOpacity>
          </DropDownModalOverlay>
        </TouchableOpacity>
      </Modal>
    </>
  );
}
