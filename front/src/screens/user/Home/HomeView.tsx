import { theme } from '@/theme';
import styled from '@/utils/scale/CustomStyled.ts';
import Icon from '@/components/Icon.tsx';
import Typography from '@/components/theme/Typography.tsx';
import ScreenContainer from '@/components/ScreenContainer.tsx';
import IconButton from '@/components/IconButton.tsx';
import Banner, { BannerItem } from '@/components/user/Banner.tsx';
import { PhotographerInfo } from '@/types/photographer.ts';
import PhotographerList from '@/components/user/PhotographerList.tsx';

interface HomeViewProps {
  onPressNotification: () => void;
  onPressAI:  () => void;
  onPressAllPhotographer: () => void;
  onPressPopularPhotographer: () => void;
  onPressAllPhotographerItem: (id: string) => void;
  onPressPopularPhotographerItem: (id: string) => void;
  searchKey: string;
  onChangeSearchKey: (searchKey: string) => void;
  onSubmitSearchKey: () => void;
  bannerItems: BannerItem[];
  allPhotographerItems: PhotographerInfo[];
  popularPhotographerItems: PhotographerInfo[];
}

export default function HomeView({
  onPressNotification,
  onPressAI,
  onPressAllPhotographer,
  onPressPopularPhotographer,
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
    <ScreenContainer paddingHorizontal={26}>
      <Header>
        <LogoWrapper>
          <Icon
            width={18}
            height={17}
            source={require('@/assets/icons/logo-icon.png')}
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
          source={require('@/assets/icons/notification.png')}
          onPress={onPressNotification}
        />
      </Header>
      <SearchFormWrapper>
        <AIButton onPress={onPressAI}>
          <Icon
            width={13.02}
            height={16.56}
            source={require('@/assets/icons/profile.png')}
          />
          <Typography
            fontSize={8}
            fontWeight="bold"
            lineHeight="140%"
            letterSpacing="-2.5%"
            color="#fff"
          >
            AI 추천
          </Typography>
        </AIButton>
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
          enabledFilter
        />
        <PhotographerList
          items={popularPhotographerItems}
          marginTop={15}
          title="지금 가장 인기있는 작가"
          onPressTitle={onPressPopularPhotographer}
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

const AIButton = styled.TouchableOpacity`
  background-color: ${theme.colors.primary};
  width: 40px;
  height: 41px;
  border-radius: 20px;
  align-items: center;
  justify-content: space-between;
  padding-vertical: 5px;
  box-sizing: border-box;
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