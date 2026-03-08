import { useState } from 'react';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import ScreenContainer from '@/components/layout/ScreenContainer';
import styled from '@/utils/scale/CustomStyled';
import { SubmitButton, Typography, TextInput, Alert } from '@/components/ui';
import { MainNavigationProp, MainStackParamList } from '@/types/navigation.ts';
import { useRejectBookingMutation } from '@/mutations/bookings.ts';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { trackBookingEvent } from '@/utils/analytics.ts';
import { useAuthStore } from '@/store/authStore.ts';

type BookingRejectRouteProp = RouteProp<MainStackParamList, 'BookingReject'>;

export default function BookingRejectScreen() {
  const navigation = useNavigation<MainNavigationProp>();
  const route = useRoute<BookingRejectRouteProp>();
  const { bookingId } = route.params;
  const { userId } = useAuthStore();

  const [reason, setReason] = useState('');
  const [error, setError] = useState<string | null>(null);

  const rejectBookingMutation = useRejectBookingMutation();

  const handlePressBack = () => navigation.goBack();

  const handleChangeReason = (text: string) => {
    if (error) setError(null);
    setReason(text);
  };

  const handlePressSubmit = () => {
    Alert.show({
      title: '현재 예약을 거절하시겠습니까?',
      message: '거절 후에는 다시 수락할 수 없습니다.',
      buttons: [
        { text: '취소', type: "cancel", onPress: () => { } },
        {
          text: '에약 거절', onPress: async () => {
            const trimmedReason = reason.trim();

            if (!trimmedReason) {
              setError('거부 사유를 입력해주세요.');
              return;
            }

            try {
              await rejectBookingMutation.mutateAsync({ bookingId, reason: trimmedReason });

              // 작가 측 예약 거절 이벤트 (기존 BookingManageContainer의 photographer_booking_rejected와 보완)
              trackBookingEvent('booking_rejected_by_photographer', bookingId.toString(), userId, {
                reason_length: trimmedReason.length, // 사유 원문은 개인정보로 미수집
              });

              Alert.show({
                title: '거절 완료',
                message: '거절이 완료되었습니다.',
                buttons: [
                  { text: '확인', onPress: handlePressBack },
                ]
              });
            } catch (e: any) {
              const message = e?.message ?? '예약을 거부할 수 없어요. 잠시 후 다시 시도해주세요.';
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
      headerTitle="예약 거절"
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
              예약을 거절하는 사유를 입력해주세요
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
            text="거부하기"
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
  margin-top: 20px;
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
