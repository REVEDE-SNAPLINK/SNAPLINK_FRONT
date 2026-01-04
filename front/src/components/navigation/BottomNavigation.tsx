import styled from '@/utils/scale/CustomStyled';
import Typography from '@/components/theme/Typography';
import Icon from '@/components/Icon';
import { ComponentType } from 'react';
import { SvgProps } from 'react-native-svg';
import { theme } from '@/theme';
import BadgeIcon from '@/components/theme/BadgeIcon.tsx';

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

const Container = styled.View`
  height: 65px;
  background: #fff;
  padding-horizontal: 27px;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0px -2px 2px rgba(0, 0, 0, 0.08);
`;

const TabButton = styled.TouchableOpacity`
  align-items: center;
  justify-content: center;
  position: relative;
`;

const IconWrapper = styled.View`
  margin-bottom: 4px;
`;
