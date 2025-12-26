import { theme } from '@/theme';
import styled from '@/utils/scale/CustomStyled.ts';
import Icon from '@/components/Icon.tsx';
import Typography from '@/components/theme/Typography.tsx';
import ScreenContainer from '@/components/ScreenContainer.tsx';
import IconButton from '@/components/IconButton.tsx';
import Banner, { BannerItem } from '@/components/user/Banner.tsx';
import PhotographerList from '@/components/user/PhotographerList.tsx';
import LogoIcon from '@/assets/icons/logo-icon.svg'
import NotificationIcon from '@/assets/icons/notification.svg';
import AIButtonIcon from '@/assets/icons/ai-button.svg'
import { PhotographerSearchItem } from '@/api/photographers.ts';

interface HomeViewProps {
  onPressNotification: () => void;
  onPressAI:  () => void;
  onPressAllPhotographer: () => void;
  onPressAllPhotographerItem: (photographerId: string) => void;
  onPressPopularPhotographerItem: (photographerId: string) => void;
  searchKey: string;
  onChangeSearchKey: (searchKey: string) => void;
  onSubmitSearchKey: () => void;
  bannerItems: BannerItem[];
  allPhotographerItems: PhotographerSearchItem[];
  popularPhotographerItems: PhotographerSearchItem[];
}

export default function HomeView({
  onPressNotification,
  onPressAI,
  onPressAllPhotographer,
  onPressAllPhotographerItem,
  onPressPopularPhotographerItem,
  bannerItems,
  allPhotographerItems,
  popularPhotographerItems,
  searchKey,
  onChangeSearchKey,
  onSubmitSearchKey,
}: HomeViewProps) {
  return (
    <ScreenContainer headerShown={false} paddingHorizontal={26}>
      <Header>
        <LogoWrapper>
          <Icon
            width={18}
            height={17}
            Svg={LogoIcon}
          />
          <Typography
            fontSize={20}
            fontWeight="bold"
            lineHeight="140%"
            letterSpacing="-2.5%"
            marginLeft={5}
          >
            Snaplink
          </Typography>
        </LogoWrapper>
        <IconButton
          width={24}
          height={24}
          Svg={NotificationIcon}
          onPress={onPressNotification}
        />
      </Header>
      <SearchFormWrapper>
        <IconButton
          width={40}
          height={41}
          Svg={AIButtonIcon}
          onPress={onPressAI}
        />
        <SearchInputWrapper>
          <Icon
            width={16.67}
            height={17.47}
            source={require('@/assets/icons/search.png')}
          />
          <SearchInput
            placeholder="웨딩 스냅 작가를 찾고 있나요?"
            placeholderTextColor={theme.colors.disabled}
            value={searchKey}
            onChangeText={onChangeSearchKey}
            onSubmitEditing={(_) => onSubmitSearchKey()}
          />
        </SearchInputWrapper>
      </SearchFormWrapper>
      <ScrollContainer
        persistentScrollbar={false}
        nestedScrollEnabled
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Banner items={bannerItems} height={264} autoPlay autoPlayInterval={3000} />
        <PhotographerList
          items={allPhotographerItems}
          marginTop={24}
          title="스냅링크 전체 작가"
          onPressTitle={onPressAllPhotographer}
          onPressItem={onPressAllPhotographerItem}
        />
        <PhotographerList
          items={popularPhotographerItems}
          marginTop={15}
          title="지금 가장 인기있는 작가"
          onPressItem={onPressPopularPhotographerItem}
        />
        <ScrollSpacer />
      </ScrollContainer>
    </ScreenContainer>
  );
}

const Header = styled.View`
  width: 100%;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  height: 30px;
  margin-bottom: 24px;
`;

const LogoWrapper = styled.View`
  flex-direction: row;
  align-items: center;
`;

const SearchFormWrapper = styled.View`
  flex-direction: row;
  width: 100%;
  height: 41px;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 28px;
`;

const SearchInputWrapper = styled.View`
  flex: 1;
  flex-direction: row;
  padding-left: 12px;
  border: 1px solid ${theme.colors.primary};
  border-radius: 8px;
  height: 100%;
  margin-left: 8px;
  align-items: center;
`;

const SearchInput = styled.TextInput`
  margin-left: 10.33px;
  color: #000;
  font-size: 14px;
  font-family: Pretendard-Regular;
  font-weight: regular;
`;

const ScrollContainer = styled.ScrollView`
  scroll-behavior: smooth;
  scrollbar-width: none;
  flex-grow: 1;
`

const ScrollSpacer = styled.View`
  height: 50px;
`