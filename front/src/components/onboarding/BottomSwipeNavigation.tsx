import styled from 'styled-components/native';
import {theme} from '@/constants/theme.ts';
import AppText from '@/components/AppText.tsx';
import ArrowRightIcon from '@/assets/icons/arrow-right.svg';

interface BottomSwipeNavigationProps {
  length: number;
  idx: number;
  onSkip: () => void;
  onNext: () => void;
}

export default function BottomSwipeNavigation ({
  length, idx, onSkip, onNext
}: BottomSwipeNavigationProps) {
  return (
    <Container>
      <SkipButton onPress={onSkip} testID="skip-button">
        <AppText
          fontSize={14}
          color='#B8BFCC'
          fontWeight={700}
          lineHeight={20}
        >Skip</AppText>
      </SkipButton>
      <Pagination>
        {Array(length).fill(0).map((_, index) => (
          <Dot key={index} isActive={index === idx} testID={`pagination-dot-${index}`} />
        ))}
      </Pagination>
      <NextButton onPress={onNext} testID="next-button">
        <ArrowRightIcon width={theme.moderateScale(25)} height={theme.moderateScale(25)} />
      </NextButton>
    </Container>
  )
}

const Container = styled.View`
  width: ${theme.horizontalScale(311)};
  height: ${theme.moderateScale(36)};
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  position: absolute;
  bottom: ${theme.verticalScale(77)};
`

const SkipButton = styled.TouchableOpacity`
  justify-content: center;
`

const Pagination = styled.View`
  width: ${theme.horizontalScale(38)};
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
`

const Dot = styled.View<{ isActive: boolean }>`
  width: ${({ isActive }) => isActive ? theme.horizontalScale(16) : theme.horizontalScale(8)}px;
  height: ${theme.verticalScale(4)}px;
  background-color: ${({ isActive }) => isActive ? theme.colors.primary : '#D6D9E1'};
  border-radius: ${theme.moderateScale(2)}px;
`

const NextButton = styled.TouchableOpacity`
  height: ${theme.moderateScale(36)};
  width: ${theme.moderateScale(36)};
  border-radius: 50%;
  justify-content: center;
  align-items: center;
  background-color: ${theme.colors.primary};
`