import { useState } from 'react';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import ScreenContainer from '@/components/layout/ScreenContainer';
import styled from '@/utils/scale/CustomStyled';
import { SubmitButton, Typography, TextInput, Alert } from '@/components/ui';
import { MainNavigationProp, MainStackParamList } from '@/types/navigation.ts';
import { useCancelBookingMutation } from '@/mutations/bookings.ts';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { trackBookingEvent } from '@/utils/analytics.ts';
import { useAuthStore } from '@/store/authStore.ts';

type BookingCancelRouteProp = RouteProp<MainStackParamList, 'BookingCancel'>;

export default function BookingCancelScreen() {
  const navigation = useNavigation<MainNavigationProp>();
  const route = useRoute<BookingCancelRouteProp>();
  const { bookingId } = route.params;
  const { userId } = useAuthStore();

  const [reason, setReason] = useState('');
  const [error, setError] = useState<string | null>(null);

  const cancelBookingMutation = useCancelBookingMutation();

  const handlePressBack = () => navigation.goBack();

  const handleChangeReason = (text: string) => {
    if (error) setError(null);
    setReason(text);
  };

  const handlePressSubmit = () => {
    Alert.show({
      title: '예약을 취소하시겠습니까?',
      message: '고객과의 사전 협의 없는 일방적인 예약 취소는 이용 제한 등의 페널티로 이어질 수 있습니다. 반드시 고객과 원만한 협의 후 취소를 진행해 주세요.',
      buttons: [
        { text: '뒤로', type: 'cancel', onPress: () => { } },
        {
          text: '예약 취소', onPress: async () => {
            const trimmedReason = reason.trim();

            if (!trimmedReason) {
              setError('취소 사유를 입력해주세요.');
              return;
            }

            try {
              await cancelBookingMutation.mutateAsync({ bookingId, reason: trimmedReason });

              // 작가 측 예약 취소 이벤트
              trackBookingEvent('booking_cancelled_by_photographer', bookingId.toString(), userId, {
                cancel_stage: 'accepted', // APPROVED 상태에서만 취소 가능
                reason_length: trimmedReason.length,
              });

              Alert.show({
                title: '취소 완료',
                message: '취소가 완료되었습니다.',
                buttons: [
                  { text: '확인', onPress: handlePressBack },
                ]
              });
            } catch (e: any) {
              const message = e?.message ?? '예약을 취소할 수 없어요. 잠시 후 다시 시도해주세요.';
              setError(message);
            }
          }
        },
      ]
    })
  };

  const isSubmitDisabled = reason.trim().length === 0;

  return (
    <ScreenContainer
      headerShown={true}
      headerTitle="예약 취소"
      onPressBack={handlePressBack}
    >
      <Container>
        <KeyboardAwareScrollView
          enableOnAndroid
          keyboardShouldPersistTaps="handled"
          extraScrollHeight={100}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 100 }}
        >
          <Content>
            <Typography
              fontSize={16}
              lineHeight={22.4}
              letterSpacing="-2.5%"
              color="#3C3C3C"
              marginBottom={16}
            >
              예약을 취소하는 사유를 입력해주세요.
            </Typography>
            <TextInput
              placeholder="내용을 작성해주세요."
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
        </KeyboardAwareScrollView>

        <Footer>
          <SubmitButton
            onPress={handlePressSubmit}
            width={327}
            disabled={isSubmitDisabled}
            text="취소하기"
            bottom={33}
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

const Content = styled.View`
  padding: 0 20px;
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
