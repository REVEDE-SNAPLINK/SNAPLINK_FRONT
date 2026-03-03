import styled from '@/utils/scale/CustomStyled';
import Typography from '@/components/ui/Typography';
import Icon from '@/components/ui/Icon';
import { ComponentType } from 'react';
import { SvgProps } from 'react-native-svg';
import { theme } from '@/theme';
import BadgeIcon from '@/components/ui/BadgeIcon.tsx';
import { Dimensions } from 'react-native';

export type TabItem = {
  key: string;
  label: string;
  IconSvg: ComponentType<SvgProps>;
  badgeCount?: number;
};

type BottomNavigationProps = {
  tabs: TabItem[];
  activeIndex: number;
  onTabPress: (index: number) => void;
};

export default function BottomNavigation({
  tabs,
  activeIndex,
  onTabPress,
}: BottomNavigationProps) {
  return (
    <Container>
      {tabs.map((tab, index) => {
        const isActive = index === activeIndex;

        return (
          <TabButton
            key={tab.key}
            onPress={() => onTabPress(index)}
            activeOpacity={0.7}
          >
            <IconWrapper>
              {tab.badgeCount !== undefined ? (
                <BadgeIcon badgeCount={tab.badgeCount} width={24} height={24} Svg={tab.IconSvg} />
              ) : (
                <Icon width={24} height={24} Svg={tab.IconSvg} />
              )}
            </IconWrapper>
            <Typography
              fontSize={10}
              lineHeight="140%"
              letterSpacing="-2.5%"
              color={isActive ? theme.colors.primary : '#AAAAAA'}
            >
              {tab.label}
            </Typography>
          </TabButton>
        );
      })}
    </Container>
  );
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const TAB_WIDTH = SCREEN_WIDTH / 5;

const Container = styled.View`
  height: 65px;
  background: #fff;
  flex-direction: row;
  align-items: center;
`;

const TabButton = styled.TouchableOpacity`
  width: ${TAB_WIDTH}px;
  align-items: center;
  justify-content: center;
  position: relative;
`;

const IconWrapper = styled.View`
  margin-bottom: 4px;
`;
