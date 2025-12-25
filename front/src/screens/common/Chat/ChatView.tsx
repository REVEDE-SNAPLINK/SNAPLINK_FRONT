import ScreenContainer from '@/components/ScreenContainer.tsx';
import styled from '@/utils/scale/CustomStyled.ts';
import { Typography } from '@/components/theme';

interface ChatRoom {
  id: string;
  userId: string;
  userNickname: string;
  userProfileImage: string;
  lastMessage: string;
  lastMessageTime: string;
}

interface ChatViewProps {
  chatRooms: ChatRoom[];
  onPressChatRoom: (chatRoomId: string) => void;
}

export default function ChatView({
  chatRooms,
  onPressChatRoom,
}:  ChatViewProps) {
  return (
    <ScreenContainer
      headerShown={true}
      headerTitle="채팅 내역"
      paddingHorizontal={28}
    >
      <ScrollContainer showsVerticalScrollIndicator={false}>
        {chatRooms.map((chatRoom) => (
          <ChatItem key={chatRoom.id} onPress={() => onPressChatRoom(chatRoom.id)}>
            <ChatProfileImageWrapper>
              <ChatProfileImage source={{ uri: chatRoom.userProfileImage }} />
            </ChatProfileImageWrapper>
            <ChatContentWrapper>
              <ChatContentHeader>
                <Typography
                  fontSize={14}
                  fontWeight="semiBold"
                  lineHeight="140%"
                  letterSpacing="-2.5%"
                  marginRight={5}
                >
                  {chatRoom.userNickname}
                </Typography>
                <Typography
                  fontSize={10}
                  lineHeight="140%"
                  letterSpacing="-2.5%"
                  color="#C8C8C8"
                >
                  {chatRoom.lastMessageTime}
                </Typography>
              </ChatContentHeader>
              <LastMessageText
                fontSize={12}
                lineHeight="140%"
                letterSpacing="-2.5%"
                color="#AAAAAA"
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {chatRoom.lastMessage}
              </LastMessageText>
            </ChatContentWrapper>
            <UnreadTextCounter>
              <Typography
                fontSize={16}
                color="#fff"
              >
                3
              </Typography>
            </UnreadTextCounter>
          </ChatItem>
        ))}
      </ScrollContainer>
    </ScreenContainer>
  );
}

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
  width: 65px;
  height: 65px;
  border-radius: 65px;
  overflow: hidden;
  background-color: #ccc;
  border-width: 1px;
  border-style: solid;
  border-color: #C8C8C8;
`

const ChatProfileImage = styled.Image`
  width: 100%;
  height: 100%;
`

const ChatContentWrapper = styled.View`
  margin-left: 9px;
  flex: 1;
  justify-content: center;
`

const ChatContentHeader = styled.View`
  flex-direction: row;
  align-items: flex-end;
`

const LastMessageText = styled(Typography)`
  flex: 1;
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
