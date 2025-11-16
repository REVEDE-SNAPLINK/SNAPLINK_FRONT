import { useState } from 'react';
import { View } from 'react-native';
import styled from '@/utils/scale/CustomStyled';
import BottomNavigation, { TabItem } from '@/components/navigation/BottomNavigation';
import HomeContainer from '@/screens/user/Home/HomeContainer';
import CommunityScreen from '@/screens/CommunityScreen';
import ChatScreen from '@/screens/ChatScreen';
import ScrapScreen from '@/screens/ScrapScreen';
import ProfileContainer from '@/screens/user/Profile/ProfileContainer.tsx';

const tabs: TabItem[] = [
  { key: 'community', label: '커뮤니티', iconSource: require('@/assets/icons/group.png') },
  { key: 'chat', label: '채팅', iconSource: require('@/assets/icons/chat.png') },
  { key: 'home', label: '홈', iconSource: require('@/assets/icons/home.png') },
  { key: 'scrap', label: '스크랩', iconSource: require('@/assets/icons/bookmark.png') },
  { key: 'more', label: '더보기', iconSource: require('@/assets/icons/more.png') },
];

export default function UserTab() {
  const [activeIndex, setActiveIndex] = useState(2); // 홈을 기본값으로

  const renderScreen = () => {
    switch (activeIndex) {
      case 0:
        return <CommunityScreen />;
      case 1:
        return <ChatScreen />;
      case 2:
        return <HomeContainer />;
      case 3:
        return <ScrapScreen />;
      case 4:
        return <ProfileContainer />;
      default:
        return <HomeContainer />;
    }
  };

  return (
    <Container>
      <ScreenContainer>{renderScreen()}</ScreenContainer>
      <BottomNavigation
        tabs={tabs}
        activeIndex={activeIndex}
        onTabPress={setActiveIndex}
      />
    </Container>
  );
}

const Container = styled(View)`
  flex: 1;
  background-color: #FFFFFF;
`;

const ScreenContainer = styled(View)`
  flex: 1;
`;