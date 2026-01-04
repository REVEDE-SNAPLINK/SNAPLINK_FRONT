import { useState } from 'react';
import { StatusBar, View } from 'react-native';
import styled from '@/utils/scale/CustomStyled';
import BottomNavigation, { TabItem } from '@/components/navigation/BottomNavigation';
import HomeContainer from '@/screens/common/Home/HomeContainer';
import CommunityContainer from '@/screens/common/Community/CommunityContainer';
import BookmarksContainer from '@/screens/user/Bookmarks/BookmarksContainer.tsx';
import ProfileContainer from '@/screens/common/Profile/ProfileContainer.tsx';
import ChatContainer from '@/screens/common/Chat/ChatContainer.tsx';

import CommunityIcon from '@/assets/icons/group.svg';
import CommunityColorIcon from '@/assets/icons/group-color.svg';
import ChatIcon from '@/assets/icons/chat.svg';
import ChatColorIcon from '@/assets/icons/chat-color.svg';
import HomeIcon from '@/assets/icons/home.svg';
import HomeColorIcon from '@/assets/icons/home-color.svg';
import ScrapIcon from '@/assets/icons/bookmark.svg';
import ScrapColorIcon from '@/assets/icons/bookmark-color.svg';
import ProfileIcon from '@/assets/icons/profile-gray.svg';
import ProfileColorIcon from '@/assets/icons/profile-color.svg';
import CalendarIcon from '@/assets/icons/calendar-gray.svg';
import CalendarColorIcon from '@/assets/icons/calendar-color.svg';
import { useAuthStore } from '@/store/authStore.ts';
import BookingCalendarContainer from '@/screens/photographer/BookingCalendar/BookingCalendarContainer.tsx';
import { SafeAreaView } from 'react-native-safe-area-context';

const USER_TABS_CONFIG = [
  { key: 'community', label: '커뮤니티', Icon: CommunityIcon, ColorIcon: CommunityColorIcon, component: CommunityContainer },
  { key: 'chat', label: '채팅', Icon: ChatIcon, ColorIcon: ChatColorIcon, component: ChatContainer },
  { key: 'home', label: '홈', Icon: HomeIcon, ColorIcon: HomeColorIcon, component: HomeContainer },
  { key: 'scrap', label: '스크랩', Icon: ScrapIcon, ColorIcon: ScrapColorIcon, component: BookmarksContainer },
  { key: 'profile', label: '마이', Icon: ProfileIcon, ColorIcon: ProfileColorIcon, component: ProfileContainer },
];

const PHOTOGRAPHER_TABS_CONFIG = [
  { key: 'community', label: '커뮤니티', Icon: CommunityIcon, ColorIcon: CommunityColorIcon, component: CommunityContainer },
  { key: 'chat', label: '채팅', Icon: ChatIcon, ColorIcon: ChatColorIcon, component: ChatContainer },
  { key: 'home', label: '홈', Icon: HomeIcon, ColorIcon: HomeColorIcon, component: HomeContainer },
  { key: 'booking', label: '일정 관리', Icon: CalendarIcon, ColorIcon: CalendarColorIcon, component: BookingCalendarContainer },
  { key: 'profile', label: '마이', Icon: ProfileIcon, ColorIcon: ProfileColorIcon, component: ProfileContainer },
];

export default function MainTab() {
  const { userType, isExpertMode } = useAuthStore();

  const [activeIndex, setActiveIndex] = useState(2); // 홈을 기본값으로

  const CURRRENT_TABS_CONFIG = userType === "photographer" && isExpertMode ? PHOTOGRAPHER_TABS_CONFIG : USER_TABS_CONFIG;

  const tabs: TabItem[] = CURRRENT_TABS_CONFIG.map((tab, index) => ({
    key: tab.key,
    label: tab.label,
    IconSvg: activeIndex === index ? tab.ColorIcon : tab.Icon,
  }));

  const ScreenComponent = CURRRENT_TABS_CONFIG[activeIndex].component;

  return (
    <Container>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
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

const Container = styled(SafeAreaView)`
  flex: 1;
  background-color: #FFFFFF;
`;

const ScreenContainer = styled(View)`
  flex: 1;
`;
