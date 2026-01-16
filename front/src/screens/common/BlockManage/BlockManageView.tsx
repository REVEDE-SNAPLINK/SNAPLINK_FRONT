import { FlatList } from 'react-native';
import styled from '@/utils/scale/CustomStyled';
import ScreenContainer from '@/components/common/ScreenContainer';
import { Typography } from '@/components/theme';
import ServerImage from '@/components/ServerImage';
import { BlockedUser } from './BlockManageContainer';

interface BlockManageViewProps {
  blockedUsers: BlockedUser[];
  onPressBack: () => void;
  onUnblock: (userId: string) => void;
}

export default function BlockManageView({
  blockedUsers,
  onPressBack,
  onUnblock,
}: BlockManageViewProps) {
  const renderItem = ({ item }: { item: BlockedUser }) => (
    <BlockedUserItem>
      <BlockedUserInfo>
        <ProfileImageWrapper>
          <ProfileImage uri={item.profileImageUrl} />
        </ProfileImageWrapper>
        <Typography fontSize={14} fontWeight="semiBold" marginLeft={12}>
          {item.nickname}
        </Typography>
      </BlockedUserInfo>
      <UnblockButton onPress={() => onUnblock(item.id)}>
        <Typography fontSize={12} fontWeight="bold" color="#E84E4E">
          차단해제
        </Typography>
      </UnblockButton>
    </BlockedUserItem>
  );

  return (
    <ScreenContainer
      headerShown
      headerTitle="차단 관리"
      onPressBack={onPressBack}
      alignItemsCenter={false}
    >
      {blockedUsers.length === 0 ? (
        <EmptyContainer>
          <Typography fontSize={14} color="#8F8F8F">
            차단된 사용자가 없습니다.
          </Typography>
        </EmptyContainer>
      ) : (
        <FlatList
          data={blockedUsers}
          keyExtractor={item => item.id}
          renderItem={renderItem}
          contentContainerStyle={{ paddingHorizontal: 20 }}
        />
      )}
    </ScreenContainer>
  );
}

const BlockedUserItem = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  height: 70px;
  border-bottom-width: 1px;
  border-bottom-color: #EAEAEA;
`;

const BlockedUserInfo = styled.View`
  flex-direction: row;
  align-items: center;
`;

const ProfileImageWrapper = styled.View`
  width: 50px;
  height: 50px;
  border-radius: 50px;
  overflow: hidden;
  background-color: #aaa;
`;

const ProfileImage = styled(ServerImage)`
  width: 100%;
  height: 100%;
`;

const UnblockButton = styled.TouchableOpacity`
  width: 80px;
  height: 32px;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  border-width: 1px;
  border-color: #E84E4E;
  background-color: rgba(232, 78, 78, 0.1);
`;

const EmptyContainer = styled.View`
  flex: 1;
  justify-content: center;
  align-items: center;
`;
