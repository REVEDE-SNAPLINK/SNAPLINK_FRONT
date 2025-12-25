import { useState } from 'react';
import { KeyboardAvoidingView, Platform, FlatList } from 'react-native';
import ScreenContainer from '@/components/ScreenContainer.tsx';
import styled from '@/utils/scale/CustomStyled.ts';
import { Typography } from '@/components/theme';
import Icon from '@/components/Icon';
import { theme } from '@/theme';
import CrossBlackIcon from '@/assets/icons/cross-black.svg';
import SendIcon from '@/assets/icons/send.svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import IconButton from '@/components/IconButton.tsx';
import ImageIcon from '@/assets/icons/image.svg'
import PaperPlusIcon from '@/assets/icons/paper-plus.svg'

interface Message {
  id: string;
  senderId: string;
  senderNickname: string;
  senderProfileImage: string;
  content: string;
  timestamp: string; // "오후 1:10"
  isMine: boolean;
}

interface ChatDetailsViewProps {
  partnerNickname: string;
  messages: Message[];
  messageInput: string;
  onChangeMessageInput: (text: string) => void;
  onPressSend: () => void;
  onPressBack: () => void;
  recommendedMessages: string[];
  onPressRecommendedMessage: (message: string) => void;
  onPressAlbum?: () => void;
  onPressFile?: () => void;
}

export default function ChatDetailsView({
  partnerNickname,
  messages,
  messageInput,
  onChangeMessageInput,
  onPressSend,
  onPressBack,
  recommendedMessages,
  onPressRecommendedMessage,
  onPressAlbum,
  onPressFile,
}: ChatDetailsViewProps) {
  const insets = useSafeAreaInsets();
  const [showExtraButtons, setShowExtraButtons] = useState(false);

  const hasRecommendedMessages = recommendedMessages.length > 0;
  const hasInputValue = messageInput.trim().length > 0;

  const handlePressCross = () => {
    setShowExtraButtons(!showExtraButtons);
  };

  const renderMessage = ({ item }: { item: Message }) => {
    if (item.isMine) {
      // 내 메시지
      return (
        <MyMessageContainer>
          <MessageTime fontSize={10} color="#AAAAAA">
            {item.timestamp}
          </MessageTime>
          <MyMessageBubble>
            <MessageText fontSize={14} color="#fff">
              {item.content}
            </MessageText>
          </MyMessageBubble>
        </MyMessageContainer>
      );
    } else {
      // 상대방 메시지
      return (
        <PartnerMessageContainer>
          <PartnerProfileImage source={{ uri: item.senderProfileImage }} />
          <PartnerMessageContent>
            <Typography fontSize={12} fontWeight="semiBold" marginBottom={5}>
              {item.senderNickname}
            </Typography>
            <PartnerMessageRow>
              <PartnerMessageBubble>
                <MessageText fontSize={14} color="#000">
                  {item.content}
                </MessageText>
              </PartnerMessageBubble>
              <MessageTime fontSize={10} color="#AAAAAA">
                {item.timestamp}
              </MessageTime>
            </PartnerMessageRow>
          </PartnerMessageContent>
        </PartnerMessageContainer>
      );
    }
  };

  return (
    <ScreenContainer
      headerShown={true}
      headerTitle={partnerNickname}
      onPressBack={onPressBack}
    >
      <KeyboardAvoidingView
        style={{ flex: 1, width: "100%" }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        {/* 채팅 내역 */}
        <MessagesContainer>
          <FlatList
            data={messages}
            keyExtractor={(item) => item.id}
            renderItem={renderMessage}
            contentContainerStyle={{ padding: 16 }}
            inverted
          />
        </MessagesContainer>

        {/* 하단 입력 영역 */}
        <InputContainer
          hasRecommendedMessages={hasRecommendedMessages}
          style={{ paddingBottom: insets.bottom }}
        >
          {/* 추천 메시지 버튼들 */}
          {hasRecommendedMessages && (
            <RecommendedMessagesContainer>
              {recommendedMessages.slice(0, 8).map((msg, index) => (
                <RecommendedMessageButton
                  key={index}
                  onPress={() => onPressRecommendedMessage(msg)}
                >
                  <RecommendedMessageText fontSize={12} color="#fff">
                    {msg}
                  </RecommendedMessageText>
                </RecommendedMessageButton>
              ))}
            </RecommendedMessagesContainer>
          )}


          {/* 입력 줄 */}
          <InputRow>
            <CrossButton onPress={handlePressCross} showExtraButtons={showExtraButtons}>
              <Icon width={20} height={20} Svg={CrossBlackIcon} />
            </CrossButton>
            <SearchInputWrapper hasInputValue={hasInputValue}>
              <SearchInput
                value={messageInput}
                onChangeText={onChangeMessageInput}
                onSubmitEditing={onPressSend}
              />
              <IconButton width={20} height={20} Svg={SendIcon} onPress={onPressSend} disabled={!hasInputValue} />
            </SearchInputWrapper>
          </InputRow>

          {/* 앨범/파일 버튼 (cross 버튼 클릭 시 표시) */}
          {showExtraButtons && (
            <ExtraButtonsContainer>
              <ExtraButtonWrapper onPress={onPressAlbum}>
                <ExtraButton>
                  <Icon width={24} height={24} Svg={ImageIcon} />
                </ExtraButton>
                <Typography fontSize={9} color="#000" lineHeight={20}>앨범</Typography>
              </ExtraButtonWrapper>
              <ExtraButtonWrapper onPress={onPressFile}>
                <ExtraButton>
                  <Icon width={24} height={24} Svg={PaperPlusIcon} />
                </ExtraButton>
                <Typography fontSize={9} color="#000" lineHeight={20}>파일</Typography>
              </ExtraButtonWrapper>
            </ExtraButtonsContainer>
          )}

        </InputContainer>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
}

const MessagesContainer = styled.View`
  flex: 1;
  border-top-width: 1px;
  border-top-style: solid;
  border-top-color: #C8C8C8;
  border-bottom-width: 1px;
  border-bottom-style: solid;
  border-bottom-color: #C8C8C8;
`;

const InputContainer = styled.View<{ hasRecommendedMessages: boolean }>`
  background-color: #fff;
  padding-top: 15px;
  padding-bottom: 36px;
  padding-left: 25px;
  padding-right: 19px;
`;

const RecommendedMessagesContainer = styled.View`
  flex-direction: row;
  flex-wrap: wrap;
  margin-bottom: 15px;
`;

const RecommendedMessageButton = styled.TouchableOpacity`
  height: 27px;
  padding: 0 10px;
  background-color: #8F8F8F;
  border-radius: 100px;
  justify-content: center;
  align-items: center;
  margin-right: 5px;
  margin-bottom: 5px;
`;

const RecommendedMessageText = styled(Typography)`
`;

const ExtraButtonsContainer = styled.View`
  flex-direction: row;
  height: 123px;
  padding-top: 35px;
`;

const ExtraButtonWrapper = styled.TouchableOpacity`
  align-items: center;
  margin-right: 35px;
`

const ExtraButton = styled.View`
  background-color: #EEEEEE;
  width: 40px;
  height: 40px;
  border-radius: 40px;
  margin-bottom: 3px;
  justify-content: center;
  align-items: center;
`;

const InputRow = styled.View`
  flex-direction: row;
  align-items: center;
  width: 100%;
`;

const CrossButton = styled.TouchableOpacity<{ showExtraButtons: boolean }>`
  width: 20px;
  height: 20px;
  justify-content: center;
  align-items: center;
  margin-right: 10px;
  transform: ${({ showExtraButtons }) => showExtraButtons ? 'rotate(45deg)' : 'rotate(0deg)'};
`;

const SearchInputWrapper = styled.View<{ hasInputValue: boolean }>`
  flex: 1;
  flex-direction: row;
  padding-horizontal: 12px;
  border: 1px solid ${({ hasInputValue }) => hasInputValue ? theme.colors.primary : theme.colors.disabled};
  border-radius: 8px;
  height: 41px;
  margin-left: 13px;
  align-items: center;
`;

const SearchInput = styled.TextInput`
  flex: 1;
  color: #000;
  font-size: 14px;
  font-family: Pretendard-Regular;
  margin-right: 10px;
`;

// 메시지 스타일
const MyMessageContainer = styled.View`
  flex-direction: row;
  justify-content: flex-end;
  align-items: flex-end;
  margin-bottom: 10px;
`;

const MyMessageBubble = styled.View`
  background-color: #69DABF;
  border-radius: 12px;
  padding: 10px 15px;
  max-width: 70%;
  margin-left: 5px;
`;

const MessageTime = styled(Typography)`
  margin-bottom: 2px;
`;

const MessageText = styled(Typography)`
`;

const PartnerMessageContainer = styled.View`
  flex-direction: row;
  align-items: flex-start;
  margin-bottom: 10px;
`;

const PartnerProfileImage = styled.Image`
  width: 40px;
  height: 40px;
  border-radius: 20px;
  background-color: #ccc;
  margin-right: 8px;
`;

const PartnerMessageContent = styled.View`
  flex: 1;
`;

const PartnerMessageRow = styled.View`
  flex-direction: row;
  align-items: flex-end;
`;

const PartnerMessageBubble = styled.View`
  background-color: #D9D9D9;
  border-radius: 12px;
  padding: 10px 15px;
  max-width: 70%;
  margin-right: 5px;
`;
