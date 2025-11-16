import styled from '@/utils/scale/CustomStyled.ts';
import Typography from '@/components/theme/Typography.tsx';
import Icon from '@/components/Icon.tsx';
import { PhotographerInfo } from '@/types/photographer.ts';
import { formatNumber } from '@/utils/format.ts';
import { useMemo } from 'react';

interface Props {
  items: PhotographerInfo[],
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
      <PhotographerListWrapper>
        {items.map((item: PhotographerInfo) => (
          <PhotographerItem
            key={item.id}
            item={item}
            onPress={onPressItem}
          />
        ))}
      </PhotographerListWrapper>
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
        <Icon width={24} height={24} source={require('@/assets/icons/arrow-right2.png')} />
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
  justify-content: space-between;
  align-items: center;
  align-content: space-between;
  width: 100%;
`

const PhotographerItemWrapper = styled.TouchableOpacity`
  width: 101px;
`

const SampleSnapImageWrapper = styled.View`
  width: 100%;
  height: 101px;
  margin-bottom: 8px;
  overflow: hidden;
  border-radius: 5px;
`

const SampleSnapImage = styled.Image`
  max-width: 100%;
  max-height: 100%;
`

interface PhotographerItemProps {
  item: PhotographerInfo;
  onPress: (id: string) => void;
}

const PhotographerItem = ({
  item,
  onPress,
}: PhotographerItemProps) => {
  const { id, uri, info, price } = item;

  return (
    <PhotographerItemWrapper onPress={() => onPress(id)}>
      <SampleSnapImageWrapper>
        <SampleSnapImage source={uri !== undefined ? { uri: uri } : require('@/assets/imgs/snap-sample1.png')} />
      </SampleSnapImageWrapper>
      <Typography
        fontSize={11}
        fontWeight="medium"
        lineHeight="140%"
        letterSpacing="-2.5%"
        marginBottom={2}
      >{info}</Typography>
      <Typography
        fontSize={11}
        fontWeight="medium"
        lineHeight="140%"
        letterSpacing="-2.5%"
      >{formatNumber(price)}원</Typography>
    </PhotographerItemWrapper>
  )
}