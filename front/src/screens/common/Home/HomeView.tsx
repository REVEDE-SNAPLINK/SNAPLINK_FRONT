import { theme } from '@/theme';
import styled from '@/utils/scale/CustomStyled.ts';
import Icon from '@/components/Icon.tsx';
import Typography from '@/components/theme/Typography.tsx';
import IconButton from '@/components/IconButton.tsx';
import Banner, { BannerItem } from '@/components/user/Banner.tsx';
import PhotographerList from '@/components/user/PhotographerList.tsx';
import LogoIcon from '@/assets/icons/logo-icon.svg'
import AIButtonIcon from '@/assets/icons/ai-button.svg'
import { PhotographerSearchItem } from '@/api/photographers.ts';
import NotificationButton from '@/components/theme/NotificationButton.tsx';
import { Dimensions } from 'react-native';
import SearchIcon from '@/assets/icons/search-gray.svg'

interface HomeViewProps {
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

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CONTAINER_MARGIN = 20;
const LIST_WIDTH = SCREEN_WIDTH - CONTAINER_MARGIN * 2;

export default function HomeView({
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
    <Container>
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
        <NotificationButton />
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
            Svg={SearchIcon}
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
        showsVerticalScrollIndicator={false}
      >
        <Banner items={bannerItems} />
        <ListWrapper>
          <PhotographerList
            items={allPhotographerItems}
            marginTop={24}
            title="스냅링크 전체 작가"
            onPressTitle={onPressAllPhotographer}
            onPressItem={onPressAllPhotographerItem}
            width={LIST_WIDTH}
          />
          <PhotographerList
            items={popularPhotographerItems}
            marginTop={15}
            title="지금 가장 인기있는 작가"
            onPressItem={onPressPopularPhotographerItem}
            width={LIST_WIDTH}
          />
        </ListWrapper>
        <ScrollSpacer />
      </ScrollContainer>
    </Container>
  );
}

const Container = styled.View`
  flex: 1;
`

const Header = styled.View`
  width: 100%;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  height: 30px;
  margin-bottom: 24px;
  margin-top: 24px;
  padding: 0 ${CONTAINER_MARGIN}px;
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
  margin-bottom: 15px;
  padding: 0 ${CONTAINER_MARGIN}px;
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
  width: 100%;
`

const ScrollSpacer = styled.View`
  height: 50px;
`

const ListWrapper = styled.View`
  padding-horizontal: ${CONTAINER_MARGIN}px;
`