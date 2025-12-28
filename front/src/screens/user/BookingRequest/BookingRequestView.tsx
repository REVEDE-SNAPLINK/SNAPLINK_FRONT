import ScreenContainer from '@/components/common/ScreenContainer';
import Typography from '@/components/theme/Typography.tsx';
import styled from '@/utils/scale/CustomStyled.ts';
import SubmitButton from '@/components/theme/SubmitButton.tsx';
import TextInput from '@/components/theme/TextInput.tsx';

interface BookingRequestViewProps {
  onPressBack: () => void;
  nickname: string;
  onSubmit: () => void;
  isSubmitDisabled: boolean;
  additionalRequest: string;
  onChangeAdditionalRequest: (text: string) => void;
}

export default function BookingRequestView({
  onPressBack,
  nickname,
  onSubmit,
  isSubmitDisabled,
  additionalRequest,
  onChangeAdditionalRequest,
}: BookingRequestViewProps) {

  return (
    <ScreenContainer onPressBack={onPressBack} headerTitle={nickname} alignItemsCenter={false}>
      <ScrollContainer showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20 }}>
        <Typography fontSize={16} fontWeight="semiBold" lineHeight="140%" letterSpacing="-2.5%" color="#000" marginBottom={16}>
          요청사항을 작성해주세요 <Typography fontSize={12} letterSpacing="-2.5%" color="textSecondary">(최소 15자)</Typography>
        </Typography>

        <TextInput
          height={170}
          placeholder="요청사항을 자유롭게 남겨주세요."
          multiline
          maxLength={1000}
          value={additionalRequest}
          onChangeText={onChangeAdditionalRequest}
        />

      </ScrollContainer>
      <SubmitButton disabled={isSubmitDisabled} width={327} text="예약하기" onPress={onSubmit} position='absolute' bottom={36} />
    </ScreenContainer>
  );
}

const ScrollContainer = styled.ScrollView`
  flex: 1;
`;