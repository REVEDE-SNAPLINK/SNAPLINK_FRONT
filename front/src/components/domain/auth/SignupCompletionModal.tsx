import React from 'react';
import { useNavigation } from '@react-navigation/native';
import styled from '@/utils/scale/CustomStyled';
import CommonModal from '@/components/ui/CommonModal';
import Typography from '@/components/ui/Typography';
import { MainNavigationProp } from '@/types/navigation.ts';
import SubmitButton from '@/components/ui/SubmitButton'
import { useAuthStore } from '@/store/authStore.ts';

export default function SignupCompletionModal() {
  const navigation = useNavigation<MainNavigationProp>();
  const { userType, signUpCompletionModalType, setSignUpCompletionModalType, setIsFirst } = useAuthStore();

  const handleClose = () => {
    setSignUpCompletionModalType();
    setIsFirst(false);
  };

  const handleNavigateToPortfolio = () => {
    handleClose();
    navigation.replace('PortfolioOnboarding');
    setIsFirst(false);
  };

  const renderPhotographerContent = () => (
    <>
      <Typography
        fontSize={16}
        fontWeight='semiBold'
        lineHeight="140%"
        letterSpacing="-2.5%"
        color="#000"
        marginBottom={20}
      >
        🎉 스냅링크 작가가 되신걸 환영해요!
      </Typography>
      <Typography
        fontSize={12}
        lineHeight="140%"
        letterSpacing="-2.5%"
        color="textSecondary"
        marginBottom={30}
      >
        이제 포트폴리오를 작성하면 수익을 창출할 수 있어요.{'\n'}
        고객과 만날 수 있도록 지금 바로, 포트폴리오를 작성해 볼까요?
      </Typography>
      <SubmitButton
        text="네, 작성할게요"
        width="100%"
        size="small"
        onPress={handleNavigateToPortfolio}
        marginBottom={10}
      />
      <LaterButton onPress={handleClose}>
        <Typography
          fontSize={10}
          lineHeight="140%"
          letterSpacing="-2.5%"
          color="textSecondary"
          style={{ textDecorationLine: 'underline' }}
        >
          다음에 할게요
        </Typography>
      </LaterButton>
    </>
  );

  const renderUserContent = () => (
    <>
      <Typography
        fontSize={16}
        fontWeight='semiBold'
        lineHeight="140%"
        letterSpacing="-2.5%"
        color="#000"
        marginBottom={20}
      >
        🎉 스냅링크 회원이 되신걸 환영해요!
      </Typography>
      <Typography
        fontSize={12}
        lineHeight="140%"
        letterSpacing="-2.5%"
        color="textSecondary"
        marginBottom={30}
      >
        이제 스냅링크의 다양한 서비스를 이용할 수 있어요.
      </Typography>
      <SubmitButton
        text="확인"
        size='small'
        width="100%"
        onPress={handleClose}
      />
    </>
  );

  return (
    <CommonModal visible={!signUpCompletionModalType} onClose={handleClose}>
      {userType === 'photographer'
        ? renderPhotographerContent()
        : renderUserContent()}
    </CommonModal>
  );
}

const LaterButton = styled.TouchableOpacity`
  align-items: center;
`;
