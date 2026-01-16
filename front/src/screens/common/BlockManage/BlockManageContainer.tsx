import { useMemo } from 'react';
import { useNavigation } from '@react-navigation/native';
import { MainNavigationProp } from '@/types/navigation';
import BlockManageView from './BlockManageView';
import { Alert } from '@/components/theme';
import { useBlocksQuery } from '@/queries/block';
import { useUnblockUserMutation } from '@/mutations/block';

export interface BlockedUser {
  id: string;
  nickname: string;
  profileImageUrl: string;
}

export default function BlockManageContainer() {
  const navigation = useNavigation<MainNavigationProp>();

  const { data: blocksData = [] } = useBlocksQuery();
  const unblockMutation = useUnblockUserMutation();

  const blockedUsers: BlockedUser[] = useMemo(() => {
    return blocksData.map(block => ({
      id: block.userId,
      nickname: block.nickname,
      profileImageUrl: block.profileImageUrl,
    }));
  }, [blocksData]);

  const handleUnblock = (userId: string) => {
    const user = blockedUsers.find(u => u.id === userId);
    if (!user) return;

    Alert.show({
      title: '차단 해제',
      message: `${user.nickname}님의 차단을 해제하시겠습니까?`,
      buttons: [
        { text: '취소', type: 'cancel', onPress: () => {} },
        {
          text: '해제',
          type: 'destructive',
          onPress: () => {
            unblockMutation.mutate(userId, {
              onSuccess: () => {
                Alert.show({
                  title: '차단 해제 완료',
                  message: `${user.nickname}님의 차단이 해제되었습니다.`,
                });
              },
              onError: () => {
                Alert.show({
                  title: '차단 해제 실패',
                  message: '차단 해제 처리 중 오류가 발생했습니다.',
                });
              },
            });
          },
        },
      ],
    });
  };

  const handlePressBack = () => navigation.goBack();

  return (
    <BlockManageView
      blockedUsers={blockedUsers}
      onPressBack={handlePressBack}
      onUnblock={handleUnblock}
    />
  );
}
