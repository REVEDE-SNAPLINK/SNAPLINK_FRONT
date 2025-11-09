import { styled } from '@/utils/CustomStyled';
import Typography from '@/components/theme/Typography';
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
        <Typography
          fontSize={14}
          color='#B8BFCC'
          fontWeight="bold"
          lineHeight={20}
        >Skip</Typography>
      </SkipButton>
      <Pagination>
        {Array(length).fill(0).map((_, index) => (
          <Dot key={index} $isActive={index === idx} testID={`pagination-dot-${index}`} />
        ))}
      </Pagination>
      <NextButton onPress={onNext} testID="next-button">
        <ArrowRightIcon width={25} height={25} />
      </NextButton>
    </Container>
  )
}

const Container = styled.View`
  width: 311px;
  height: 36px;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  position: absolute;
  bottom: 77px;
`

const SkipButton = styled.TouchableOpacity`
  justify-content: center;
`

const Pagination = styled.View`
  width: 38px;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
`

const Dot = styled.View<{ $isActive: boolean }>`
  width: ${({ $isActive }) => $isActive ? '16px' : '8px'};
  height: 4px;
  background-color: ${({ $isActive }) => $isActive ? '#00A980' : '#D6D9E1'};
  border-radius: 2px;
`

const NextButton = styled.TouchableOpacity`
  height: 36px;
  width: 36px;
  border-radius: 18px;
  justify-content: center;
  align-items: center;
  background-color: #00A980;
`