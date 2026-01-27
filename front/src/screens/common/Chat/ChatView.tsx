import styled from '@/utils/scale/CustomStyled';
import { Typography } from '@/components/theme';
import ServerImage from '@/components/ServerImage';
import { ChatRoomItem } from '@/api/chat';
import { formatTimeAgo } from '@/utils/format';
import HeaderWithBackButton from '@/components/common/HeaderWithBackButton.tsx';

// 마지막 메시지 타입에 따른 표시 텍스트 변환
const formatLastMessage = (message: string | undefined): string => {
  if (!message) return '없음';

  // CloudFront 경로로 시작하는 경우 파일/이미지로 판단
  if (message.startsWith('/')) {
    const lowerMessage = message.toLowerCase();
    // 이미지 확장자 체크
    if (lowerMessage.match(/\.(jpg|jpeg|png|gif|webp|heic|heif)(\?|$)/i)) {
      return '사진';
    }
    // 그 외 파일
    return '파일';
  }

  // JSON 배열 형태의 이미지 URL들 (다중 이미지)
  if (message.startsWith('[') && message.includes('/')) {
    return '사진';
  }

  return message;
};

interface ChatViewProps {
  chatRooms: ChatRoomItem[];
  onPressChatRoom: (roomId: number, opponentNickname: string, opponentProfileImageURI: string) => void;
}

export default function ChatView({
  chatRooms,
  onPressChatRoom,
}:  ChatViewProps) {
  const hasChatRooms = chatRooms.length > 0;

  return (
    <Container>
      <HeaderWithBackButton title="채팅 내역" />
      {!hasChatRooms ? (
        <EmptyContainer>
          <Typography
            fontSize={16}
            fontWeight="medium"
            color="#AAAAAA"
            style={{ textAlign: 'center' }}
          >
            아직 채팅 내역이 없어요.
          </Typography>
        </EmptyContainer>
      ) : (
        <ScrollContainer showsVerticalScrollIndicator={false}>
          {chatRooms.map((chatRoom) => (
            <ChatItem key={chatRoom.roomId} onPress={() => onPressChatRoom(chatRoom.roomId, chatRoom.opponentNickname, chatRoom.profileImageURI ?? '')}>
              <ChatProfileImageWrapper>
                <ChatProfileImage {...(chatRoom.profileImageURI ? { uri: chatRoom.profileImageURI } : {})} />
              </ChatProfileImageWrapper>
              <ChatContentWrapper>
                <ChatContentHeader>
                  <Typography
                    fontSize={16}
                    fontWeight="semiBold"
                    marginRight={5}
                  >
                    {chatRoom.opponentNickname}
                  </Typography>
                  <Typography
                    fontSize={12}
                    color="#C8C8C8"
                  >
                    {formatTimeAgo(chatRoom.lastMessageTime)}
                  </Typography>
                </ChatContentHeader>
                <Typography
                  fontSize={14}
                  color="#AAAAAA"
                  numberOfLines={1}
                  ellipsizeMode="tail"
                  marginTop={5}
                >
                  {formatLastMessage(chatRoom.lastMessage)}
                </Typography>
              </ChatContentWrapper>
              {chatRoom.unreadCount > 0 && <UnreadTextCounter>
                <Typography
                  fontSize={16}
                  color="#fff"
                >
                  {chatRoom.unreadCount}
                </Typography>
              </UnreadTextCounter>}
            </ChatItem>
          ))}
        </ScrollContainer>
      )}
    </Container>
  );
}

const Container = styled.View`
  flex: 1;
  padding-horizontal: 20px;
`

const EmptyContainer = styled.View`
  flex: 1;
  justify-content: center;
  align-items: center;
`;

const ScrollContainer = styled.ScrollView`
  flex: 1;
  width: 100%;
`

const ChatItem = styled.TouchableOpacity`
  width: 100%;
  flex-direction: row;
  margin-bottom: 25px;
  align-items: center;
  height: 65px;
`

const ChatProfileImageWrapper = styled.View`
  width: 60px;
  height: 60px;
  border-radius: 65px;
  overflow: hidden;
  background-color: #ccc;
  border-width: 1px;
  border-style: solid;
  border-color: #C8C8C8;
`
const ChatProfileImage = styled(ServerImage)`
  width: 100%;
  height: 100%;
`

const ChatContentWrapper = styled.View`
  margin-left: 9px;
  flex: 1;
  justify-content: center;
  height: 65px;
`

const ChatContentHeader = styled.View`
  flex-direction: row;
  align-items: center;
`

const UnreadTextCounter = styled.View`
  width: 25px;
  height: 25px;
  border-radius: 25px;
  background-color: #E84E4E;
  align-items: center;
  justify-content: center;
  margin-left: 10px;
`
