import ScreenContainer from '@/components/common/ScreenContainer';
import styled from '@/utils/scale/CustomStyled';
import { useNavigation } from '@react-navigation/native';
import { MainNavigationProp } from '@/types/navigation.ts';
import { theme } from '@/theme';
import Icon from '@/components/Icon.tsx';
import ArrowRightIcon from '@/assets/icons/arrow-right2-gray.svg';
import { useAuthStore } from '@/store/authStore.ts';
import { Alert, Typography } from '@/components/theme';
import { usePhotographerStatusQuery } from '@/queries/photographers.ts';
import { useActivePhotographerMutation, useInactivePhotographerMutation } from '@/mutations/photographers.ts';

export default function AccountManageScreen() {
  const navigation = useNavigation<MainNavigationProp>();

  const { signOut, withdraw, userType } = useAuthStore();

  const { data: photographerStatus } = usePhotographerStatusQuery();
  const activeMutation = useActivePhotographerMutation();
  const inactiveMutation = useInactivePhotographerMutation();

  const handlePressBack = () => navigation.goBack();

  const handlePressLogout = () => {
    Alert.show({
      title: '로그아웃',
      message: '로그아웃 하시겠습니까?',
      buttons: [
        {
          text: '취소',
          onPress: () => {},
          type: 'cancel',
        },
        {
          text: '확인',
          onPress: () => signOut(),
          type: 'destructive',
        },
      ],
    });
  }

  const handleChangePrivate = async () => {
    const isActive = photographerStatus === 'ACTIVE';
    const isInactive = photographerStatus === 'INACTIVE';

    if (isActive) {
      Alert.show({
        title: '계정 비공개',
        message: '계정을 비공개 처리하면 검색되지 않고 예약이 닫힙니다.\n계속하시겠습니까?',
        buttons: [
          {
            text: '취소',
            onPress: () => {},
            type: 'cancel',
          },
          {
            text: '비공개 전환',
            onPress: async () => {

              // 비공개 전환
              inactiveMutation.mutate(undefined, {
                onSuccess: () => {
                  Alert.show({
                    title: '비공개 전환 완료',
                    message: '계정이 비공개 처리되었습니다.',
                  });
                },
                onError: () => {
                  Alert.show({
                    title: '비공개 전환 실패',
                    message: '승인된 예약이 있어 계정을 비공개 처리할 수 없습니다. 모든 예약이 완료된 후 다시 시도해주세요.',
                  });
                },
              });
            },
            type: 'destructive',
          },
        ],
      });
    } else if (isInactive) {
      // INACTIVE -> ACTIVE로 전환 (공개)
      Alert.show({
        title: '계정 공개',
        message: '계정을 공개 처리하면 검색되고 예약을 받을 수 있습니다.\n계속하시겠습니까?',
        buttons: [
          {
            text: '취소',
            onPress: () => {},
            type: 'cancel',
          },
          {
            text: '공개 전환',
            onPress: () => {
              activeMutation.mutate(undefined, {
                onSuccess: () => {
                  Alert.show({
                    title: '공개 전환 완료',
                    message: '계정이 공개 처리되었습니다.',
                  });
                },
                onError: () => {
                  Alert.show({
                    title: '공개 전환 실패',
                    message: '계정 공개 처리에 실패했습니다.',
                  });
                },
              });
            },
          },
        ],
      });
    } else {
      Alert.show({
        title: '알림',
        message: '현재 계정 상태에서는 이 작업을 수행할 수 없습니다.',
      });
    }
  }

  const handlePressWithdraw = async () => {
    Alert.show({
      title: '계정 탈퇴',
      message: '계정을 탈퇴하면 모든 정보가 삭제되며, 이 작업은 되돌릴 수 없습니다. 정말 탈퇴하시겠습니까?',
      buttons: [
        {
          text: '취소',
          onPress: () => {},
          type: 'cancel',
        },
        {
          text: '계정 탈퇴',
          onPress: () => withdraw(),
          type: 'destructive',
        },
      ],
    });
  }

  return (
    <ScreenContainer
      headerShown={true}
      headerTitle="계정 관리"
      onPressBack={handlePressBack}
      paddingHorizontal={33}
    >
      <InfoContainer>
        <InfoButton onPress={handlePressLogout} name="계정 로그아웃" />
        {userType === 'photographer' && (
          <InfoButton
            onPress={handleChangePrivate}
            name={photographerStatus === 'ACTIVE' ? '계정 비공개' : photographerStatus === 'INACTIVE' ? '계정 공개' : '계정 상태 관리'}
          />
        )}
        <InfoButton onPress={handlePressWithdraw} name="계정 탈퇴하기" isLast />
      </InfoContainer>
    </ScreenContainer>
  );
}

const InfoContainer = styled.View`
  width: 100%;
  border-radius: 8px;
  border: 1px solid #EAEAEA;
  margin-bottom: 20px;
`

const InfoWrapper = styled.TouchableOpacity<{ isLast: boolean }>`
  width: 100%;
  height: 42px;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  padding-horizontal: 10px;
  ${({ isLast }) => !isLast && `
    border-bottom-width: 1px;
    border-bottom-color: #EAEAEA;
  `}
`

const InfoValueWrapper = styled.View`
  flex-direction: row;
  height: 100%;
  align-items: center;
`

interface InfoButtonProps {
  onPress: () => void;
  name: string;
  value?: string;
  isLast?: boolean;
}

const InfoButton = ({
  onPress,
  name,
  value,
  isLast = false,
}: InfoButtonProps) => {
  return (
    <InfoWrapper onPress={onPress} isLast={isLast}>
      <Typography
        fontSize={12}
        fontWeight="semiBold"
        lineHeight="140%"
        letterSpacing="-2.5%"
      >
        {name}
      </Typography>
      <InfoValueWrapper>
        {value !== undefined && (
          <Typography
            fontSize={12}
            lineHeight="140%"
            letterSpacing="-2.5%"
            color={theme.colors.disabled}
          >
            {value}
          </Typography>
        )}
        <Icon
          width={15}
          height={15}
          Svg={ArrowRightIcon}
        />
      </InfoValueWrapper>
    </InfoWrapper>
  );
}
