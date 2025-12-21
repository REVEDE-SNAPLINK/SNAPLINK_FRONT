import { useState } from 'react';
import { View } from 'react-native';
import styled from '@/utils/scale/CustomStyled';
import BottomNavigation, { TabItem } from '@/components/navigation/BottomNavigation';
import HomeContainer from '@/screens/user/Home/HomeContainer';
import CommunityScreen from '@/screens/CommunityScreen';
import ChatScreen from '@/screens/ChatScreen';
import ScrapScreen from '@/screens/ScrapScreen';
import ProfileContainer from '@/screens/user/Profile/ProfileContainer.tsx';

import CommunityIcon from '@/assets/icons/group.svg';
import CommunityColorIcon from '@/assets/icons/group-color.svg';
import ChatIcon from '@/assets/icons/chat.svg';
import ChatColorIcon from '@/assets/icons/chat-color.svg';
import HomeIcon from '@/assets/icons/home.svg';
import HomeColorIcon from '@/assets/icons/home-color.svg';
import ScrapIcon from '@/assets/icons/bookmark.svg';
import ScrapColorIcon from '@/assets/icons/bookmark-color.svg';
import MoreIcon from '@/assets/icons/more-square.svg';
import MoreColorIcon from '@/assets/icons/more-square-color.svg';

const TABS_CONFIG = [
  { key: 'community', label: '커뮤니티', Icon: CommunityIcon, ColorIcon: CommunityColorIcon, component: CommunityScreen },
  { key: 'chat', label: '채팅', Icon: ChatIcon, ColorIcon: ChatColorIcon, component: ChatScreen },
  { key: 'home', label: '홈', Icon: HomeIcon, ColorIcon: HomeColorIcon, component: HomeContainer },
  { key: 'scrap', label: '스크랩', Icon: ScrapIcon, ColorIcon: ScrapColorIcon, component: ScrapScreen },
  { key: 'more', label: '더보기', Icon: MoreIcon, ColorIcon: MoreColorIcon, component: ProfileContainer },
];

export default function UserTab() {
  const [activeIndex, setActiveIndex] = useState(2); // 홈을 기본값으로

  const tabs: TabItem[] = TABS_CONFIG.map((tab, index) => ({
    key: tab.key,
    label: tab.label,
    IconSvg: activeIndex === index ? tab.ColorIcon : tab.Icon,
  }));

  const ScreenComponent = TABS_CONFIG[activeIndex].component;

  return (
    <Container>
      <ScreenContainer>
        <ScreenComponent />
      </ScreenContainer>
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