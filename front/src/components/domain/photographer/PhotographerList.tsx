import styled from '@/utils/scale/CustomStyled.ts';
import Typography from '@/components/ui/Typography.tsx';
import Icon from '@/components/ui/Icon.tsx';
import { formatNumber } from '@/utils/format.ts';
import { useMemo } from 'react';
import { PhotographerSearchItem } from '@/api/photographers.ts';
import ArrowRightIcon from '@/assets/icons/arrow-right2.svg'
import ServerImage from '@/components/ui/ServerImage.tsx';

interface Props {
  items: PhotographerSearchItem[],
  marginTop: number,
  title: string,
  onPressTitle?: () => void;
  onPressItem: (id: string) => void;
  width: number;
}

const ITEM_MARGIN = 10;

export default function PhotographerList({
  items,
  marginTop,
  title,
  onPressTitle,
  onPressItem,
  width,
}: Props) {
  const itemWidth = (width - ITEM_MARGIN * 2) / 3;

  return (
    <Container>
      <PhotographerListHeader marginTop={marginTop}>
        <PhotographerListTitle title={title} onPress={onPressTitle} />
      </PhotographerListHeader>
      {items.length > 0 ? (
        <PhotographerListWrapper>
          {items.map((item: PhotographerSearchItem, index) => (
            <PhotographerItem
              key={item.id}
              width={itemWidth}
              item={item}
              onPress={onPressItem}
              isLast={index === 2}
            />
          ))}
        </PhotographerListWrapper>
      ) : (
        <EmptyStateWrapper size={width}>
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
    </Container>
  )
}

const Container = styled.View`
  width: 100%;
  flex: 1;
`

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

const PhotographerListTitle = ({ title, onPress }: { title: string, onPress?: () => void }) => {

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

const PhotographerListWrapper = styled.View`
  flex-direction: row;
  align-items: center;
  align-content: space-between;
  width: 100%;
`

const PhotographerItemWrapper = styled.TouchableOpacity<{ width: number, isLastItem?: boolean }>`
  width: ${({ width }) => width}px;
  ${({ isLastItem }) => isLastItem !== undefined || !isLastItem ? `margin-right: ${ITEM_MARGIN}px;` : ``}
`

const SampleSnapImageWrapper = styled.View<{ size: number }>`
  margin-bottom: 8px;
  overflow: hidden;
  border-radius: 5px;
  ${({ size }) => `
    width: ${size}px;
    height: ${size}px;
  `}
`

const SampleSnapImage = styled(ServerImage)`
  width: 100%;
  height: 100%;
  background-color: #ccc;
`

interface PhotographerItemProps {
  item: PhotographerSearchItem;
  onPress: (id: string) => void;
  width: number;
  isLast: boolean;
}

const PhotographerItem = ({
  item,
  onPress,
  width,
  isLast,
}: PhotographerItemProps) => {
  return (
    <PhotographerItemWrapper width={width} onPress={() => onPress(item.id)} isLastItem={isLast}>
      <SampleSnapImageWrapper size={width}>
        {item.portfolioImages.length > 0 !== undefined ? (
          <SampleSnapImage uri={item.portfolioImages[0]} requestWidth={width * 2} />
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

const EmptyStateWrapper = styled.View<{ size: number }>`
  ${({ size }) => `
    width: ${size}px;
  `}
  min-height: 120px;
  padding-vertical: 16px;
  justify-content: center;
  align-items: center;
`;