import styled from '@/utils/scale/CustomStyled.ts';
import Typography from '@/components/theme/Typography.tsx';
import Icon from '@/components/Icon.tsx';
import { formatNumber } from '@/utils/format.ts';
import { useMemo } from 'react';
import { PhotographerSearchItem } from '@/api/photographers.ts';
import { Dimensions } from 'react-native';
import ArrowRightIcon from '@/assets/icons/arrow-right2.svg'

interface Props {
  items: PhotographerSearchItem[],
  marginTop: number,
  title: string,
  onPressTitle?: () => void;
  onPressItem: (id: string) => void;
}

export default function PhotographerList ({
  items,
  marginTop,
  title,
  onPressTitle,
  onPressItem,
}: Props) {
  return (
    <>
      <PhotographerListHeader marginTop={marginTop}>
        <PhotographerListTitle title={title} onPress={onPressTitle} />
      </PhotographerListHeader>
      {items.length > 0 ? (
        <PhotographerListWrapper>
          {items.map((item: PhotographerSearchItem) => (
            <PhotographerItem
              key={item.id}
              item={item}
              onPress={onPressItem}
            />
          ))}
        </PhotographerListWrapper>
      ) : (
        <EmptyStateWrapper>
          <Typography
            fontSize={14}
            fontWeight="regular"
            lineHeight="140%"
            letterSpacing="-2.5%"
            color="#999"
          >
            등록된 작가가 없습니다
          </Typography>
        </EmptyStateWrapper>
      )}
    </>
  )
}

const PhotographerListHeader = styled.View<{ marginTop: number }>`
  width: 100%;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  margin-top: ${({ marginTop }) => marginTop}px;
  margin-bottom: 15px;
`

const PhotographerListTitleWrapper = styled.TouchableOpacity`
  flex-direction: row;
  align-items: center;
`

const PhotographerListTitle = ({ title, onPress }: { title: string, onPress?:() => void }) => {

  const Title = useMemo(() => (
        <Typography
        fontSize={16}
        fontWeight="semiBold"
        lineHeight="140%"
        letterSpacing="-2.5%"
        marginRight={7.75}
      >{title}</Typography>
  ), [title])

  if (onPress !== undefined) {
    return (
      <PhotographerListTitleWrapper onPress={onPress}>
        {Title}
        <Icon width={24} height={24} Svg={ArrowRightIcon} />
      </PhotographerListTitleWrapper>
    )
  }

  return (
    <PhotographerListTitleWrapper>
      {Title}
    </PhotographerListTitleWrapper>
  )
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const ITEM_MARGIN = 10;
const ITEM_SIZE = (SCREEN_WIDTH - ITEM_MARGIN * 2) / 3;

const PhotographerListWrapper = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  align-content: space-between;
  width: 100%;
`

const PhotographerItemWrapper = styled.TouchableOpacity<{ isLastItem?: boolean }>`
  width: ${ITEM_SIZE}px;
  ${({ isLastItem }) => isLastItem !== undefined || !isLastItem ? `margin-right: ${ITEM_MARGIN}px;` : ``}
`

const SampleSnapImageWrapper = styled.View`
  width: 100%;
  height: ${ITEM_SIZE}px;
  margin-bottom: 8px;
  overflow: hidden;
  border-radius: 5px;
`

const SampleSnapImage = styled.Image`
  width: 100%;
  height: 100%;
  background-color: #ccc;
`

interface PhotographerItemProps {
  item: PhotographerSearchItem;
  onPress: (id: string) => void;
}

const PhotographerItem = ({
  item,
  onPress,
}: PhotographerItemProps) => {
  return (
    <PhotographerItemWrapper onPress={() => onPress(item.id)}>
      <SampleSnapImageWrapper>
        {item.portfolioImages.length > 0 !== undefined ? (
          <SampleSnapImage source={{ uri: item.portfolioImages[0] }} />
        ) : (
          <SampleSnapImage />
          )
        }
      </SampleSnapImageWrapper>
      <Typography
        fontSize={11}
        fontWeight="medium"
        lineHeight="140%"
        letterSpacing="-2.5%"
        marginBottom={2}
      >{item.nickname} | {item.concepts[0]}</Typography>
      <Typography
        fontSize={11}
        fontWeight="medium"
        lineHeight="140%"
        letterSpacing="-2.5%"
      >{formatNumber(item.basePrice)}원</Typography>
    </PhotographerItemWrapper>
  )
}

const EmptyStateWrapper = styled.View`
  width: 100%;
  height: ${ITEM_SIZE}px;
  justify-content: center;
  align-items: center;
`