import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { ActivityIndicator } from 'react-native';
import ScreenContainer from '@/components/layout/ScreenContainer';
import { MainNavigationProp, MainStackParamList } from '@/types/navigation.ts';
import { Typography } from '@/components/ui';
import dayjs from 'dayjs';
import styled from '@/utils/scale/CustomStyled';
// 작성한 커스텀 훅 임포트
import { useNoticeDetailQuery } from '@/queries/notices';

export default function NoticeDetailScreen() {
  const navigation = useNavigation<MainNavigationProp>();
  const route = useRoute<RouteProp<MainStackParamList, 'NoticeDetail'>>();
  const { noticeId } = route.params;

  // 1. 상세 데이터 쿼리 호출
  const { data: notice, isLoading, isError } = useNoticeDetailQuery(noticeId);

  const handlePressBack = () => navigation.goBack();

  // 로딩 상태 처리
  if (isLoading) {
    return (
      <ScreenContainer headerShown headerTitle="공지사항 상세" onPressBack={handlePressBack}>
        <Center>
          <ActivityIndicator size="large" color="#000" />
        </Center>
      </ScreenContainer>
    );
  }

  // 에러 발생 시 처리
  if (isError || !notice) {
    return (
      <ScreenContainer headerShown headerTitle="공지사항 상세" onPressBack={handlePressBack}>
        <Center>
          <Typography fontSize={16} color="#8F8F8F">
            공지사항을 불러오는 중 오류가 발생했습니다.
          </Typography>
        </Center>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer
      headerShown
      headerTitle="공지사항 상세"
      onPressBack={handlePressBack}
      paddingHorizontal={20}
      alignItemsCenter={false}
    >
      <TitleSection>
        <Typography fontSize={20} fontWeight="bold" marginBottom={12} lineHeight={28}>
          {notice.title}
        </Typography>
        <Typography fontSize={14} color="#8F8F8F">
          {dayjs(notice.date).format('YYYY-MM-DD HH:mm')}
        </Typography>
      </TitleSection>

      <ContentSection>
        <Typography fontSize={16} lineHeight={26} color="#333">
          {notice.body || '공지 내용이 없습니다.'}
        </Typography>
      </ContentSection>
    </ScreenContainer>
  );
}

const Center = styled.View`
  flex: 1;
  justify-content: center;
  align-items: center;
`;

const TitleSection = styled.View`
  width: 100%;
  padding-vertical: 20px;
  border-bottom-width: 1px;
  border-bottom-color: #EEE;
  margin-bottom: 20px;
`;

const ContentSection = styled.View`
  width: 100%;
`;