import ScreenContainer from '@/components/layout/ScreenContainer';
import styled from '@/utils/scale/CustomStyled';
import { useNavigation } from '@react-navigation/native';
import { MainNavigationProp } from '@/types/navigation.ts';
import { theme } from '@/theme';
import Icon from '@/components/ui/Icon.tsx';
import ArrowRightIcon from '@/assets/icons/arrow-right2-gray.svg';
import { Typography } from '@/components/ui';
import { openTermUrl } from '@/utils/link.ts';

export const TERM_ROUTE_LIST = [
  { name: '이용약관', link: '/terms' },
  { name: '개인정보 처리방침', link: '/privacy' },
  { name: '선택정보 수집 및 이용 동의', link: '/consent/optional' },
  { name: '개인정보 마케팅 활용 동의', link: '/consent/marketing' },
  { name: '마케팅 알림 수신 동의', link: '/consent/notification' },
] as const;

export default function LegalScreen() {
  const navigation = useNavigation<MainNavigationProp>();

  const handlePressBack = () => navigation.goBack();


  return (
    <ScreenContainer
      headerShown={true}
      headerTitle="계정 관리"
      onPressBack={handlePressBack}
      paddingHorizontal={20}
    >
      <InfoContainer>
        {TERM_ROUTE_LIST.map((item, index) => (
          <InfoButton key={index} name={item.name} onPress={() => openTermUrl(item.link)} {...(index === TERM_ROUTE_LIST.length - 1 ? { isLast: true } : {})} />
        ))}
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
