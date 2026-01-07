import SlideModal from '@/components/theme/SlideModal.tsx';
import { mappingReason, REASON, REASONS, reportUser, TargetType } from '@/api/reports.ts';
import { UserType } from '@/types/auth.ts';
import styled from '@/utils/scale/CustomStyled.ts';
import { Alert, SubmitButton, Typography } from '@/components/theme';
import { useState } from 'react';
import FormInput from '@/components/form/FormInput.tsx';

interface ReportModalProps {
  visible: boolean;
  onClose: () => void;
  targetId: string;
  targetType: TargetType;
  targetUserType: UserType;
}

export default function ReportModal({
  visible,
  onClose,
  targetId,
  targetType,
  targetUserType,
}: ReportModalProps) {
  const [customReason, setCustomReason] = useState<string>('');
  const [isOtherReasonModalVisible, setIsOtherReasonModalVisible] = useState<boolean>(false);
  const reasons = REASONS.filter((reason) => targetUserType === 'user' ? reason !== 'UNILATERAL_CANCELLATION' : true );

  const handleReportUser = (reason: REASON, onCloseAfterFinish: () => void) => {
    reportUser({
      targetId,
      targetType,
      reason,
      customReason: customReason,
      description: ''
    }).then(() => {
      onCloseAfterFinish();
      Alert.show({
        title: '소중한 의견 감사합니다',
        message: '신고는 익명으로 처리됩니다. \n앞으로 더 나은 경험을 할 수 있도록 개선하겠습니다.'
      })
    })
  }

  const handlePressReport = async (reason: REASON) => {
    if (reason !== 'OTHER') {
      await handleReportUser(reason, onClose);
    } else {
      onClose();
      setIsOtherReasonModalVisible(true);
    }
  }

  const handleCloseOtherReasonModal = () => {
    setIsOtherReasonModalVisible(false);
  }

  return (
    <>
      <SlideModal
        visible={visible}
        onClose={onClose}
        headerAlign="center"
        title="신고하기"
      >
        {reasons.map((reason) => (
          <ReportButton onPress={() => handlePressReport(reason)}>
            <Typography
              fontSize={14}
            >
              {mappingReason(reason)}
            </Typography>
          </ReportButton>
        ))}
      </SlideModal>
      <SlideModal
        visible={isOtherReasonModalVisible}
        onClose={handleCloseOtherReasonModal}
        headerAlign="center"
        title="신고하기"
        minHeight={320}
        footer={(
          <SubmitButton
            width="100%"
            onPress={() => handleReportUser("OTHER", handleCloseOtherReasonModal)}
            disabled={customReason === ''}
            text="신고하기"
          />
        )}
      >
        <FormInput
          placeholder="신고 사유를 작성해주세요."
          multiline={true}
          height={100}
          onChangeText={setCustomReason}
          value={customReason}
        />
      </SlideModal>
    </>
  )
}

const ReportButton = styled.TouchableOpacity`
  margin-bottom: 25px;
`