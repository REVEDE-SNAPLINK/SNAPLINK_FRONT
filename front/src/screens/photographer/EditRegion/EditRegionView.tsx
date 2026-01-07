import React from 'react';
import { Control, Controller } from 'react-hook-form';
import styled from '@/utils/scale/CustomStyled.ts';
import { SubmitButton, Typography } from '@/components/theme';
import ScreenContainer from '@/components/common/ScreenContainer';
import { Platform } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import Checkbox from '@/components/theme/Checkbox';
import { GetRegionsResponse } from '@/api/regions.ts';

export interface EditRegionFormData {
  regionIds: number[];
}

interface EditRegionViewProps {
  control: Control<EditRegionFormData>;
  regions: GetRegionsResponse[];
  onToggleRegion: (id: number) => void;
  onPressBack: () => void;
  onPressSubmit: () => void;
  isSubmitDisabled: boolean;
  navigation?: any;
}

export default function EditRegionView({
  control,
  regions,
  onToggleRegion,
  onPressBack,
  onPressSubmit,
  isSubmitDisabled,
  navigation,
}: EditRegionViewProps) {
  const scrollRef = React.useRef<any>(null);

  return (
    <ScreenContainer
      headerShown
      headerTitle="촬영 지역 수정"
      onPressBack={onPressBack}
      paddingHorizontal={16}
      alignItemsCenter={false}
      navigation={navigation}
    >
      <KeyboardFormView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={0}
      >
        <KeyboardAwareScrollView
          ref={scrollRef}
          enableOnAndroid
          keyboardShouldPersistTaps="handled"
          extraScrollHeight={20}
          contentContainerStyle={{
            alignItems: 'stretch',
          }}
        >
          <FormContainer>
            <Typography fontSize={18} lineHeight="140%" marginBottom={20}>
              <Typography fontSize={18} fontWeight="semiBold" lineHeight="140%">
                주로 활동하는 지역
              </Typography>
              을 선택해 주세요.
            </Typography>
            <Typography
              fontSize={12}
              marginBottom={10}
              color="#767676"
            >
              *중복 선택 가능
            </Typography>
            <Controller
              control={control}
              name="regionIds"
              render={({ field: { value } }) => (
                <>
                  {regions.map((region) => (
                    <CheckOptionWrapper key={region.id}>
                      <Checkbox
                        isChecked={value.includes(region.id)}
                        onPress={() => onToggleRegion(region.id)}
                      />
                      <Typography
                        fontSize={12}
                        color="#767676"
                        marginLeft={12}
                      >
                        {region.city}
                      </Typography>
                    </CheckOptionWrapper>
                  ))}
                </>
              )}
            />
          </FormContainer>
        </KeyboardAwareScrollView>
      </KeyboardFormView>
      <Footer>
        <SubmitButton
          onPress={onPressSubmit}
          width="100%"
          disabled={isSubmitDisabled}
          text="완료하기"
          marginBottom={10}
        />
      </Footer>
    </ScreenContainer>
  );
}

const KeyboardFormView = styled.KeyboardAvoidingView`
  flex: 1;
  width: 100%;
`

const FormContainer = styled.View`
  width: 100%;
  align-self: stretch;
`;

const Footer = styled.View`
  width: 100%;
  padding-top: 20px;
  padding-bottom: 20px;
  align-items: center;
  justify-content: center;
`

const CheckOptionWrapper = styled.View`
  width: 100%;
  align-self: stretch;
  flex-direction: row;
  align-items: center;
  margin-bottom: 15px;
`;
