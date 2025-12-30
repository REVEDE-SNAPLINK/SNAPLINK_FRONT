import { useState } from 'react';
import { Platform } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import ScreenContainer from '@/components/common/ScreenContainer';
import styled from '@/utils/scale/CustomStyled';
import { SubmitButton, Typography, TextInput } from '@/components/theme';
import { MainNavigationProp, MainStackParamList } from '@/types/navigation.ts';
import { useCancelBookingMutation } from '@/mutations/bookings.ts';

type BookingCancelRouteProp = RouteProp<MainStackParamList, 'BookingCancel'>;

export default function BookingCancelScreen() {
  const navigation = useNavigation<MainNavigationProp>();
  const route = useRoute<BookingCancelRouteProp>();
  const { bookingId } = route.params;

  const [reason, setReason] = useState('');
  const [error, setError] = useState<string | null>(null);

  const cancelBookingMutation = useCancelBookingMutation();

  const handlePressBack = () => navigation.goBack();

  const handleChangeReason = (text: string) => {
    if (error) setError(null);
    setReason(text);
  };

  const handlePressSubmit = async () => {
    const trimmedReason = reason.trim();

    if (!trimmedReason) {
      setError('취소 사유를 입력해주세요.');
      return;
    }

    try {
      await cancelBookingMutation.mutateAsync({ bookingId, reason: trimmedReason });
      navigation.goBack();
    } catch (e: any) {
      const message = e?.message ?? '예약을 취소할 수 없어요. 잠시 후 다시 시도해주세요.';
      setError(message);
    }
  };

  const isSubmitDisabled = reason.trim().length === 0;

  return (
    <ScreenContainer
      headerShown={true}
      headerTitle="예약 취소"
      onPressBack={handlePressBack}
    >
      <KeyboardFormView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollContainer>
          <Content>
            <Typography
              fontSize={16}
              lineHeight={22.4}
              letterSpacing="-2.5%"
              color="#3C3C3C"
              marginBottom={16}
            >
              취소 사유를 입력해주세요.
            </Typography>
            <TextInput
              placeholder="취소 사유를 입력하세요"
              value={reason}
              onChangeText={handleChangeReason}
              multiline={true}
              height={150}
              maxLength={200}
              error={!!error}
            />
            {error && (
              <ErrorText>
                <Typography fontSize={12} color="#FF3B30">
                  {error}
                </Typography>
              </ErrorText>
            )}
          </Content>
        </ScrollContainer>

        <Footer>
          <SubmitButton
            onPress={handlePressSubmit}
            width={327}
            disabled={isSubmitDisabled}
            text="취소하기"
            bottom={33}
          />
        </Footer>
      </KeyboardFormView>
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
  padding-bottom: 82px;
`;

const Content = styled.View`
  padding: 0 40px;
  margin-top: 40px;
`;

const Footer = styled.View`
  width: 100%;
  height: 82px;
  align-items: center;
  justify-content: flex-end;
`;

const ErrorText = styled.View`
  margin-top: 8px;
`;
