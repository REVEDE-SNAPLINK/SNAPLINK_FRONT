import { useState } from 'react';
import { View } from 'react-native';
import styled from '@/utils/scale/CustomStyled';
import BottomNavigation, { TabItem } from '@/components/navigation/BottomNavigation';
import Typography from '@/components/theme/Typography';

// 임시 아이콘 - TODO: 실제 아이콘으로 교체 필요
import ConsentIcon from '@/assets/icons/consent.svg';
import ArrowRightIcon from '@/assets/icons/arrow-right.svg';
import KakaoIcon from '@/assets/icons/kakao.svg';
import NaverIcon from '@/assets/icons/naver.svg';

// Photographer용 탭 구성 (임시)
const tabs: TabItem[] = [
  { key: 'schedule', label: '일정', IconSvg: ConsentIcon },
  { key: 'chat', label: '채팅', IconSvg: ArrowRightIcon },
  { key: 'home', label: '홈', IconSvg: KakaoIcon },
  { key: 'more', label: '더보기', IconSvg: NaverIcon },
];

export default function PhotographerTab() {
  const [activeIndex, setActiveIndex] = useState(2); // 홈을 기본값으로

  return (
    <Container>
      <ScreenContainer>
        <PlaceholderContainer>
          <Typography fontSize={24} fontWeight="bold">
            Photographer Tab
          </Typography>
          <Typography fontSize={16} color="#666">
            Coming soon...
          </Typography>
        </PlaceholderContainer>
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

const PlaceholderContainer = styled(View)`
  flex: 1;
  justify-content: center;
  align-items: center;
`;
