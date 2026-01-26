import { useState, useRef } from 'react';
import { FlatList, Dimensions, Modal, KeyboardAvoidingView, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import ScreenContainer from '@/components/common/ScreenContainer';
import styled from '@/utils/scale/CustomStyled.ts';
import { Typography } from '@/components/theme';
import Icon from '@/components/Icon';
import { theme } from '@/theme';
import CrossBlackIcon from '@/assets/icons/cross-black.svg';
import SendIcon from '@/assets/icons/send.svg';
import IconButton from '@/components/IconButton.tsx';
import ImageIcon from '@/assets/icons/image.svg';
import PaperPlusIcon from '@/assets/icons/paper-plus.svg';
import { ChatMessage } from '@/api/chat.ts';
import { formatChatDayjs } from '@/utils/format.ts';
import MoreIcon from '@/assets/icons/more.svg';
import SlideModal from '@/components/theme/SlideModal.tsx';
import ServerImage from '@/components/ServerImage.tsx';
import FileDownloadButton from '@/components/FileDownloadButton.tsx';
import CrossWhiteIcon from '@/assets/icons/cross-white.svg';
import DownloadIcon from '@/assets/icons/download-white.svg';
import { UserType } from '@/types/auth.ts';
import ChatWhiteIcon from '@/assets/icons/chat-white.svg';
import ChatBlackIcon from '@/assets/icons/chat-black.svg';
import dayjs from 'dayjs';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export interface FileDownloadState {
  isDownloaded: boolean;
  isDownloading: boolean;
  localPath?: string;
  fileName?: string;
  fileSize?: string;
  downloadKey?: string;
}

interface ChatDetailsViewProps {
  userType: UserType;
  partnerNickname: string;
  myUserId: string;
  opponentProfileImageURI: string;
  messages: ChatMessage[];
  messageInput: string;
  isModalVisible: boolean;
  isBlocked: boolean;
  onChangeMessageInput: (text: string) => void;
  onPressSend: () => void;
  onPressBack: () => void;
  recommendedMessages: string[];
  onPressRecommendedMessage: (message: string) => void;
  onCloseModal: () => void;
  onPressBlock: () => void;
  onPressReport: () => void;
  onPressTool: () => void;
  onPressAlbum?: () => void;
  onPressFile?: () => void;
  onLoadMore?: () => void;
  onLeaveChatRoom: () => void;
  isFetchingNextPage?: boolean;
  hasNextPage?: boolean;
  fileDownloadStates: Record<string, FileDownloadState>;
  onPressFileDownload: (messageId: number, fileUrl: string) => void;
  onPressImage: (imageUrl: string, imageUrls: string[]) => void;
  onDownloadImage: (imageUrl: string) => void;
  imagePreviewVisible: boolean;
  imagePreviewUrls: string[];
  imagePreviewIndex: number;
  onChangeImagePreviewIndex: (index: number) => void;
  onCloseImagePreview: () => void;
  navigation?: any;
  messageReadStates: Record<number, number>; // ✅ 메시지 읽음 상태 (messageId -> unreadCount)
}

export default function ChatDetailsView({
  partnerNickname,
  myUserId,
  opponentProfileImageURI,
  messages,
  messageInput,
  isModalVisible,
  isBlocked,
  onChangeMessageInput,
  onPressSend,
  onPressBack,
  recommendedMessages,
  onPressRecommendedMessage,
  onPressTool,
  onCloseModal,
  onPressBlock,
  onPressReport,
  onPressAlbum,
  onPressFile,
  onLoadMore,
  onLeaveChatRoom,
  isFetchingNextPage,
  fileDownloadStates,
  onPressFileDownload,
  onPressImage,
  onDownloadImage,
  imagePreviewVisible,
  imagePreviewUrls,
  imagePreviewIndex,
  onChangeImagePreviewIndex,
  onCloseImagePreview,
  hasNextPage,
  navigation,
  messageReadStates,
}: ChatDetailsViewProps) {
  const [showExtraButtons, setShowExtraButtons] = useState(false);
  const [showRecommandationMessages, setShowRecommandationMessages] = useState(false);
  const [inputHeight, setInputHeight] = useState(40);
  const scrollRef = useRef<any>(null);

  // Refs for end-reached throttling
  const endReachedLockRef = useRef(false);
  const lastEndReachedAtRef = useRef(0);

  const hasRecommendedMessages = recommendedMessages.length > 0;
  const hasInputValue = messageInput.trim().length > 0;

  const scrollToBottom = () => {
    scrollRef.current?.scrollToEnd({ animated: true });
  };

  const handlePressCross = () => {
    setShowExtraButtons(!showExtraButtons);
  };

  const insets = useSafeAreaInsets();

  const renderMessage = ({ item, index }: { item: ChatMessage, index: number }) => {
    const isMyMessage = myUserId === item.senderId;

    // 1. 유효한 메시지만 필터링된 리스트를 가져옵니다 (FlatList data와 동일하게)
    const validMessages = messages.filter(v => v.messageId !== null);

    // 2. 현재 메시지 날짜 (KST 기준)
    const currentMessageDate = dayjs.utc(item.sentAt).add(9, 'hour');

    // 3. 이전 메시지 날짜 확인
    // index > 0 일 때, 'validMessages' 배열에서 이전 아이템을 가져와 비교합니다.
    const prevItem = index > 0 ? validMessages[index - 1] : null;
    const prevMessageDate = prevItem ? dayjs.utc(prevItem.sentAt).add(9, 'hour') : null;

    // 4. 날짜 문자열(YYYY-MM-DD) 비교 (가장 정확함)
    const showDateSeparator =
      index === 0 ||
      (prevMessageDate && currentMessageDate.format('YYYY-MM-DD') !== prevMessageDate.format('YYYY-MM-DD'));

    const dateDisplayText = currentMessageDate.format('YYYY년 MM월 DD일');

    // --- 타입별 메시지 컨텐츠 렌더링 함수 ---
    const renderContent = () => {
      // 1. FILE 타입
      if (item.type === 'FILE') {
        const downloadKey = encodeURIComponent(String(item.content ?? '').replace(/^\/+/, ''));
        const fileState =
          fileDownloadStates[downloadKey] ||
          fileDownloadStates[String(item.messageId)] || {
            isDownloaded: false,
            isDownloading: false,
          };

        return (
          <FileDownloadButton
            fileName={fileState.fileName || '파일'}
            fileSize={fileState.fileSize}
            isDownloaded={fileState.isDownloaded}
            isDownloading={fileState.isDownloading}
            onPress={() => onPressFileDownload(item.messageId, item.content)}
          />
        );
      }

      // 2. IMAGE 타입
      if (item.type === 'IMAGE') {
        let imageUrls: string[] = [];
        try {
          const parsed = JSON.parse(item.content);
          imageUrls = Array.isArray(parsed) ? parsed : [parsed];
        } catch {
          imageUrls = [item.content];
        }
        return (
          <ImageList imageCount={imageUrls.length} isMyMessage={isMyMessage}>
            {imageUrls.map((imageUrl: string, idx: number) => (
              <ImageWrapper key={idx} onPress={() => onPressImage(imageUrl, imageUrls)}>
                <UploadImage uri={imageUrl} />
              </ImageWrapper>
            ))}
          </ImageList>
        );
      }

      // 3. TEXT 타입 (기본)
      return (
        <MessageText fontSize={14} color={isMyMessage ? '#fff' : '#000'}>
          {item.content}
        </MessageText>
      );
    };

    // --- 최종 UI 리턴 ---
    return (
      <MessageGroupContainer key={item.messageId || index}>
        {/* 날짜 구분선 */}
        {showDateSeparator && (
          <DateSeparator>
            <DateSeparatorLine />
            <DateText fontSize={12} color="#8F8F8F" fontWeight="medium">
              {dateDisplayText}
            </DateText>
            <DateSeparatorLine />
          </DateSeparator>
        )}

        {/* 메시지 본문 */}
        {isMyMessage ? (
          <MyMessageContainer>
            <MyMessageMetaContainer>
              {/* ✅ 읽음 숫자 표시 (1이면 표시, 0이면 숨김) */}
              {messageReadStates[item.messageId] === 1 && (
                <UnreadCount fontSize={10} color={theme.colors.primary}>
                  1
                </UnreadCount>
              )}
              <MessageTime fontSize={10} color="#AAAAAA">
                {formatChatDayjs(item.sentAt)}
              </MessageTime>
            </MyMessageMetaContainer>
            {item.type === 'TEXT' ? (
              <MyMessageBubble>{renderContent()}</MyMessageBubble>
            ) : (
              <MessageContentWrapper isMyMessage={true}>
                {renderContent()}
              </MessageContentWrapper>
            )}
          </MyMessageContainer>
        ) : (
          <PartnerMessageContainer>
            <PartnerProfileImageWrapper>
              <PartnerProfileImage uri={opponentProfileImageURI} />
            </PartnerProfileImageWrapper>
            <PartnerMessageContent>
              <Typography fontSize={12} fontWeight="semiBold" marginBottom={5}>
                {item.senderNickname}
              </Typography>
              <PartnerMessageRow>
                {item.type === 'TEXT' ? (
                  <PartnerMessageBubble>{renderContent()}</PartnerMessageBubble>
                ) : (
                  <PartnerContentWrapper>{renderContent()}</PartnerContentWrapper>
                )}
                <MessageTime fontSize={10} color="#AAAAAA">
                  {formatChatDayjs(item.sentAt)}
                </MessageTime>
              </PartnerMessageRow>
            </PartnerMessageContent>
          </PartnerMessageContainer>
        )}
      </MessageGroupContainer>
    );
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? -insets.bottom : 0}
    >
      <ScreenContainer
        headerShown={true}
        headerTitle={partnerNickname}
        onPressBack={onPressBack}
        headerToolIcon={MoreIcon}
        onPressTool={onPressTool}
        alignItemsCenter={false}
        navigation={navigation}
        iconSize={35}
      >
        {/* 채팅 내역 */}
        <MessagesContainer>
          <FlatList
            ref={scrollRef}
            data={messages.filter(v => v.messageId !== null)}
            keyExtractor={(item, index) =>
              String(
                (item as any).messageId ??
                  `${item.senderId}-${item.sentAt}-${index}`,
              )
            }
            renderItem={renderMessage}
            onContentSizeChange={scrollToBottom}
            contentContainerStyle={{ padding: 16 }}
            ListFooterComponent={
              isFetchingNextPage ? (
                <LoadingContainer>
                  <Typography fontSize={12} color="#AAAAAA">
                    로딩 중...
                  </Typography>
                </LoadingContainer>
              ) : null
            }
            onScroll={e => {
              if (!onLoadMore) return;
              if (isFetchingNextPage) return;
              if (hasNextPage === false) return;

              const y = e?.nativeEvent?.contentOffset?.y ?? 0;
              // when close to top, load older messages
              if (y > 60) return;

              const now = Date.now();
              if (endReachedLockRef.current) return;
              if (now - lastEndReachedAtRef.current < 800) return;

              endReachedLockRef.current = true;
              lastEndReachedAtRef.current = now;
              onLoadMore();

              setTimeout(() => {
                endReachedLockRef.current = false;
              }, 500);
            }}
            scrollEventThrottle={16}
          />
          {/* 차단 상태 Overlay */}
          {isBlocked && (
            <BlockedOverlay>
              <Typography fontSize={16} fontWeight="semiBold" color="#fff">
                차단된 사용자입니다{'\n'}
                차단을 해제하면 메시지를 보낼 수 있습니다
              </Typography>
            </BlockedOverlay>
          )}
        </MessagesContainer>
        {/* 하단 입력 영역 */}
        {!isBlocked &&
          <InputContainer>
            {/* 추천 메시지 버튼들 */}
            {showRecommandationMessages && hasRecommendedMessages && (
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
              <CrossButton
                onPress={handlePressCross}
                showExtraButtons={showExtraButtons}
              >
                <Icon width={20} height={20} Svg={CrossBlackIcon} />
              </CrossButton>
              <MessageInputWrapper hasInputValue={hasInputValue}>
                <MessageInput
                  height={inputHeight}
                  value={messageInput}
                  onChangeText={onChangeMessageInput}
                  onSubmitEditing={() => {
                    onPressSend();
                    scrollRef.current
                  }}
                  onContentSizeChange={(event) => {
                    setInputHeight(
                      Math.min(120, Math.max(event.nativeEvent.contentSize.height, 40)),
                    );
                  }}
                  textAlignVertical="center"
                  multiline
                />
                <IconButton
                  width={25}
                  height={25}
                  Svg={SendIcon}
                  onPress={onPressSend}
                  disabled={!hasInputValue}
                />
              </MessageInputWrapper>
            </InputRow>

            {/* 앨범/파일 버튼 (cross 버튼 클릭 시 표시) */}
            {showExtraButtons && (
              <ExtraButtonsContainer>
                <ExtraButtonWrapper onPress={onPressAlbum}>
                  <ExtraButton>
                    <Icon width={30} height={30} Svg={ImageIcon} />
                  </ExtraButton>
                  <Typography fontSize={12} color="#000" lineHeight={20}>
                    앨범
                  </Typography>
                </ExtraButtonWrapper>
                <ExtraButtonWrapper onPress={onPressFile}>
                  <ExtraButton>
                    <Icon width={30} height={30} Svg={PaperPlusIcon} />
                  </ExtraButton>
                  <Typography fontSize={12} color="#000" lineHeight={20}>
                    파일
                  </Typography>
                </ExtraButtonWrapper>
                <ExtraButtonWrapper onPress={() => setShowRecommandationMessages(!showRecommandationMessages)}>
                  <ExtraButton isChecked={showRecommandationMessages}>
                    <Icon width={30} height={30} Svg={showRecommandationMessages ? ChatWhiteIcon : ChatBlackIcon} />
                  </ExtraButton>
                  <Typography fontSize={12} color="#000" lineHeight={20}>
                    추천 메시지
                  </Typography>
                </ExtraButtonWrapper>
              </ExtraButtonsContainer>
            )}
          </InputContainer>
        }
      </ScreenContainer>

      <SlideModal
        visible={isModalVisible}
        onClose={onCloseModal}
        showHeader={false}
        minHeight={260}
        scrollable={false}
      >
        <EditModalWrapper>
          <EditModalButton onPress={onPressBlock}>
            <Typography fontSize={16} letterSpacing="-2.5%">
              {isBlocked ? '차단 해제' : '차단하기'}
            </Typography>
          </EditModalButton>
          <EditModalDivider />
          <EditModalButton onPress={onPressReport}>
            <Typography fontSize={16} letterSpacing="-2.5%" color="#FF0000">
              신고하기
            </Typography>
          </EditModalButton>
          <EditModalDivider />
          <EditModalButton onPress={onLeaveChatRoom}>
            <Typography fontSize={16} letterSpacing="-2.5%" color="#FF0000">
              채팅방 나가기
            </Typography>
          </EditModalButton>
        </EditModalWrapper>
      </SlideModal>

      {/* 이미지 프리뷰 모달 */}
      <Modal
        visible={imagePreviewVisible}
        transparent={true}
        onRequestClose={onCloseImagePreview}
        animationType="fade"
      >
        <ImagePreviewContainer>
          <ImagePreviewHeader>
            <CloseButton onPress={onCloseImagePreview}>
              <Icon width={24} height={24} Svg={CrossWhiteIcon} />
            </CloseButton>
            <ImageCounter>
              <Typography fontSize={16} color="#fff" fontWeight="semiBold">
                {Math.min(
                  imagePreviewIndex + 1,
                  Math.max(imagePreviewUrls.length, 1),
                )}{' '}
                / {imagePreviewUrls.length}
              </Typography>
            </ImageCounter>
            <DownloadButton
              onPress={() => {
                const target = imagePreviewUrls[imagePreviewIndex];
                if (target) onDownloadImage(target);
              }}
            >
              <Icon width={24} height={24} Svg={DownloadIcon} />
            </DownloadButton>
          </ImagePreviewHeader>

          <ImagePreviewList
            data={imagePreviewUrls}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={(e: any) => {
              const x = e?.nativeEvent?.contentOffset?.x ?? 0;
              const next = Math.round(x / SCREEN_WIDTH);
              if (Number.isFinite(next)) onChangeImagePreviewIndex(next);
            }}
            onScrollToIndexFailed={() => {
              // no-op: prevents red screen when list not measured yet
            }}
            keyExtractor={(item: string, index: number) => `preview-${index}`}
            renderItem={({ item }: { item: string }) => (
              <ImagePreviewWrapper>
                <PreviewImage uri={item} resizeMode="contain" />
              </ImagePreviewWrapper>
            )}
            initialScrollIndex={
              imagePreviewUrls.length > 0 ? imagePreviewIndex : 0
            }
            getItemLayout={(data: any, index: number) => ({
              length: SCREEN_WIDTH,
              offset: SCREEN_WIDTH * index,
              index,
            })}
          />
        </ImagePreviewContainer>
      </Modal>
    </KeyboardAvoidingView>
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
  position: relative;
`;

const BlockedOverlay = styled.View`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.7);
  justify-content: center;
  align-items: center;
  padding: 20px;
`;

const InputContainer = styled.View`
  width: 100%;
  background-color: #fff;
  padding-top: 20px;
  padding-bottom: 20px;
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

const ExtraButton = styled.View<{ isChecked?: boolean }>`
  ${({ isChecked }) => `background-color: ${isChecked ? theme.colors.primary : "#EEEEEE"}`};
  width: 45px;
  height: 45px;
  border-radius: 45px;
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

const MessageInputWrapper = styled.View<{ hasInputValue: boolean }>`
  flex: 1;
  flex-direction: row;
  padding-horizontal: 12px;
  border: 1px solid ${({ hasInputValue }) => hasInputValue ? theme.colors.primary : theme.colors.disabled};
  border-radius: 8px;
  align-items: center;
`;

const MessageInput = styled.TextInput<{ height: number }>`
  flex: 1;
  color: #000;
  font-size: 14px;
  font-family: Pretendard-Regular;
  margin-right: 10px;
  padding-top: ${Platform.OS === 'ios' ? '10px' : '8px'};
  padding-bottom: ${Platform.OS === 'ios' ? '10px' : '8px'};
  
  height: ${({ height }) => height}px;
`;

// 메시지 스타일
const MyMessageContainer = styled.View`
  flex-direction: row;
  justify-content: flex-end;
  align-items: flex-end;
  margin-bottom: 10px;
`;

const MyMessageBubble = styled.View`
  background-color: #00A980;
  border-radius: 12px;
  padding: 10px 15px;
  max-width: 70%;
  margin-left: 5px;
`;

const MessageTime = styled(Typography)`
  margin-bottom: 2px;
`;

// ✅ 내 메시지의 읽음 숫자 + 시간을 담는 컨테이너
const MyMessageMetaContainer = styled.View`
  flex-direction: column;
  align-items: flex-end;
  justify-content: flex-end;
`;

// ✅ 읽음 숫자 (카톡 스타일 "1")
const UnreadCount = styled(Typography)`
  margin-bottom: 2px;
`;

const MessageText = styled(Typography)`
`;

const MessageContentWrapper = styled.View<{ isMyMessage: boolean }>`
  /* TEXT bubble has no extra top gap; keep FILE/IMAGE aligned with the time the same way */
  margin-top: 0px;
  ${({ isMyMessage }) => (isMyMessage ? 'margin-left: 5px;' : '')}
`;

const PartnerContentWrapper = styled.View`
  /* Keep same spacing as TEXT between bubble and time */
  margin-right: 5px;
`;

const PartnerMessageContainer = styled.View`
  flex-direction: row;
  align-items: flex-start;
  margin-bottom: 10px;
`;

const PartnerProfileImageWrapper = styled.Pressable`
  width: 40px;
  height: 40px;
  border-radius: 40px;
  background-color: #ccc;
  margin-right: 8px;
  overflow: hidden;
`

const PartnerProfileImage = styled(ServerImage)`
  width: 100%;
  height: 100%;
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

const LoadingContainer = styled.View`
  padding: 16px;
  align-items: center;
  justify-content: center;
`;

const EditModalWrapper = styled.View`
  width: 100%;
  border: 1px solid #EAEAEA;
  border-radius: 4px;
  margin-vertical: 20px;
`

const EditModalButton = styled.TouchableOpacity`
  padding: 18px;
  align-items: center;
`;

const EditModalDivider = styled.View`
  height: 1px;
  background-color: #e0e0e0;
`;

const ImageList = styled.View<{ imageCount: number; isMyMessage: boolean }>`
  flex-direction: row;
  flex-wrap: wrap;
  ${({ imageCount, isMyMessage }) => {
    // 2개 이하일 때는 좌우 정렬
    if (imageCount <= 2) {
      return `
        justify-content: ${isMyMessage ? 'flex-end' : 'flex-start'};
      `;
    }
    // 3개 이상일 때는 그리드 (한줄에 3개)
    return `
      width: 200px;
    `;
  }}
  gap: 5px;
`

const ImageWrapper = styled.TouchableOpacity`
  width: 60px;
  height: 60px;
  border-radius: 5px;
  overflow: hidden;
`

const UploadImage = styled(ServerImage)`
  width: 100%;
  height: 100%;
`

const ImagePreviewContainer = styled.View`
  flex: 1;
  background-color: rgba(0, 0, 0, 0.95);
`;

const ImagePreviewHeader = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  padding-top: 60px;
  background-color: rgba(0, 0, 0, 0.5);
`;

const CloseButton = styled.TouchableOpacity`
  width: 44px;
  height: 44px;
  justify-content: center;
  align-items: center;
  transform: rotate(45deg);
`;

const ImageCounter = styled.View`
  flex: 1;
  align-items: center;
`;

const DownloadButton = styled.TouchableOpacity`
  width: 44px;
  height: 44px;
  justify-content: center;
  align-items: center;
`;

const ImagePreviewList = styled.FlatList`
  flex: 1;
` as unknown as typeof FlatList;

const ImagePreviewWrapper = styled.View`
  width: ${SCREEN_WIDTH}px;
  height: 100%;
  justify-content: center;
  align-items: center;
`;

const PreviewImage = styled(ServerImage)`
  width: 100%;
  height: 100%;
`;

const MessageGroupContainer = styled.View`
  width: 100%;
`;

const DateSeparator = styled.View`
  flex-direction: row;
  align-items: center;
  margin-vertical: 24px;
  padding-horizontal: 8px;
`;

const DateSeparatorLine = styled.View`
  flex: 1;
  height: 1px;
  background-color: #EAEAEA;
`;

const DateText = styled(Typography)`
  margin-horizontal: 12px;
`;