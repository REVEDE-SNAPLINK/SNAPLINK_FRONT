import { theme } from '@/theme';
import Typography from '@/components/theme/Typography.tsx';
import styled from '@/utils/scale/CustomStyled.ts';

interface HistoryCardProps {
  onPress: () => void;
  onPressShowPhoto?: () => void;
  onPressWriteReview?: () => void;
  status: 'PENDING' | 'CONFIRMED' | 'COMPLETED';
  nickname: string;
  name: string;
  type: string;
  datetime: string;
}

export default function HistoryCard({
  onPress,
  onPressShowPhoto,
  onPressWriteReview,
  status,
  nickname,
  name,
  type,
  datetime,
}: HistoryCardProps) {
  return (
    <HistoryContainer>
      <InfoWrapper>
        <Header title={nickname + '과 함께한 추억이에요'} onPress={onPress} />
        <Description name="작가명" value={name} marginBottom={12} />
        <Description name="촬영 항목" value={type} marginBottom={12} />
        <Description name="촬영 일시" value={datetime} />
      </InfoWrapper>
      {status !== 'COMPLETED' ? (
        <Status
          text={
            status === 'PENDING'
              ? '아직 촬영 전이에요'
              : '작가님이 작업 중이에요'
          }
        />
      ) : (
        <ActionButtonWrapper>
          {onPressShowPhoto && (
            <ShowPhotoButton onPress={onPressShowPhoto}>
              <Typography
                fontSize={12}
                fontWeight="bold"
                lineHeight="140%"
                letterSpacing="-2.5%"
                color="#fff"
              >
                사진 보기
              </Typography>
            </ShowPhotoButton>
          )}
          {onPressWriteReview && (
            <WriteReviewButton onPress={onPressWriteReview}>
              <Typography
                fontSize={12}
                fontWeight="bold"
                lineHeight="140%"
                letterSpacing="-2.5%"
                color={theme.colors.primary}
              >
                후기 작성
              </Typography>
            </WriteReviewButton>
          )}
        </ActionButtonWrapper>
      )}
    </HistoryContainer>
  );
}

const HistoryContainer = styled.View`
  width: 100%;
  border-radius: 10px;
  box-shadow: 0 4px 4px rgba(0, 0, 0, 0.25);
  background-color: #fff;
  padding: 17px 20px;
  justify-content: space-between;
  margin-bottom: 15px;
`

const InfoWrapper = styled.View`
  width: 100%;
  margin-bottom: 15px;
`

const HeaderContainer = styled.View`
  width: 100%;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
`

const ViewDetailButton = styled.TouchableOpacity`
  padding: 3px 5px;
  border-radius: 100px;
  border: 1px solid ${theme.colors.disabled};
  justify-content: center;
  align-items: center;
`

const Header = ({ title, onPress }: {title: string, onPress: () => void}) => (
  <HeaderContainer>
    <Typography
      fontSize={16}
      fontWeight="semiBold"
      lineHeight="140%"
      letterSpacing="-2.5%"
      color="#000"
    >
      {title}
    </Typography>
    <ViewDetailButton onPress={onPress}>
      <Typography
        fontSize={11}
        lineHeight="140%"
        letterSpacing="-2.5%"
        color={theme.colors.disabled}
      >
        상세보기
      </Typography>
    </ViewDetailButton>
  </HeaderContainer>
);

const DescriptionWrapper = styled.View<{ marginBottom?: number }>`
  width: 100%;
  flex-direction: row;
  align-items: center;
  ${({ marginBottom }) => marginBottom !== undefined && `margin-bottom: ${marginBottom}px;`}
`

const DescriptionNameWrapper = styled.View`
  width: 45px;
  margin-right: 40px;
`

const Description = ({ name, value, marginBottom }: {name: string, value: string, marginBottom?: number}) => (
  <DescriptionWrapper marginBottom={marginBottom}>
    <DescriptionNameWrapper>
      <Typography
        fontSize={11}
        lineHeight="140%"
        letterSpacing="-2.5%"
        color={theme.colors.disabled}
      >
        {name}
      </Typography>
    </DescriptionNameWrapper>
    <Typography
      fontSize={11}
      lineHeight="140%"
      letterSpacing="-2.5%"
      color={theme.colors.textSecondary}
    >
      {value}
    </Typography>
  </DescriptionWrapper>
)

const StatusWrapper = styled.View`
  width: 100%;
  height: 40px;
  border-radius: 8px;
  border: 1px solid ${theme.colors.disabled};
  justify-content: center;
  align-items: center;
`

const Status = ({ text }: { text: string }) => (
  <StatusWrapper>
    <Typography
      fontSize={12}
      fontWeight="bold"
      lineHeight="140%"
      letterSpacing="-2.5%"
      color={theme.colors.disabled}
    >
      {text}
    </Typography>
  </StatusWrapper>
)

const ActionButtonWrapper = styled.View`
  width: 100%;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
`

const ActionButton = styled.TouchableOpacity`
  flex: 1;
  height: 40px;
  border-radius: 8px;
  justify-content: center;
  align-items: center;
`

const ShowPhotoButton = styled(ActionButton)`
  background-color: ${theme.colors.primary};
  margin-right: 7px;
`

const WriteReviewButton = styled(ActionButton)`
  border: 1px solid ${theme.colors.primary};
`