import { useState, useRef, useEffect } from 'react';
import { FlatList, Dimensions, Modal, KeyboardAvoidingView, Platform, Keyboard } from 'react-native';
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
import DownloadIcon from '@/assets/icons/download.svg';
import { UserType } from '@/types/auth.ts';

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
}: ChatDetailsViewProps) {
  const [showExtraButtons, setShowExtraButtons] = useState(false);
  const [inputHeight, setInputHeight] = useState(40);
  const scrollRef = useRef<any>(null);

  // Refs for end-reached throttling
  const endReachedLockRef = useRef(false);
  const lastEndReachedAtRef = useRef(0);

  const hasRecommendedMessages = recommendedMessages.length > 0;
  const hasInputValue = messageInput.trim().length > 0;

  const scrollToBottom = () => {
    // animated: true를 주어 부드럽게 이동
    scrollRef.current?.scrollToEnd({ animated: true });
  };

  const handlePressCross = () => {
    setShowExtraButtons(!showExtraButtons);
  };

  const insets = useSafeAreaInsets();

  const renderMessage = ({ item }: { item: ChatMessage }) => {
    const isMyMessage = myUserId === item.senderId;

    // FILE 타입 메시지
    if (item.type === 'FILE') {
      // 다운로드 상태는 messageId가 아니라 fileUrl 기반(downloadKey)로 추적
      const downloadKey = encodeURIComponent(String(item.content ?? '').replace(/^\/+/, ''));

      // (하위 호환) 과거 messageId 키로 저장된 상태가 있으면 fallback
      const fileState =
        fileDownloadStates[downloadKey] ||
        fileDownloadStates[String(item.messageId)] || {
          isDownloaded: false,
          isDownloading: false,
        };

      if (isMyMessage) {
        return (
          <MyMessageContainer>
            <MessageTime fontSize={10} color="#AAAAAA">
              {formatChatDayjs(item.sentAt)}
            </MessageTime>
            <MessageContentWrapper isMyMessage={true}>
              <FileDownloadButton
                fileName={fileState.fileName || '파일'}
                fileSize={fileState.fileSize}
                isDownloaded={fileState.isDownloaded}
                isDownloading={fileState.isDownloading}
                onPress={() => onPressFileDownload(item.messageId, item.content)}
              />
            </MessageContentWrapper>
          </MyMessageContainer>
        );
      } else {
        return (
          <PartnerMessageContainer>
            <PartnerProfileImage source={{ uri: opponentProfileImageURI }} />
            <PartnerMessageContent>
              <Typography fontSize={12} fontWeight="semiBold" marginBottom={5}>
                {item.senderNickname}
              </Typography>
              <PartnerMessageRow>
                <PartnerContentWrapper>
                  <FileDownloadButton
                    fileName={fileState.fileName || '파일'}
                    fileSize={fileState.fileSize}
                    isDownloaded={fileState.isDownloaded}
                    isDownloading={fileState.isDownloading}
                    onPress={() => onPressFileDownload(item.messageId, item.content)}
                  />
                </PartnerContentWrapper>
                <MessageTime fontSize={10} color="#AAAAAA">
                  {formatChatDayjs(item.sentAt)}
                </MessageTime>
              </PartnerMessageRow>
            </PartnerMessageContent>
          </PartnerMessageContainer>
        );
      }
    }

    // IMAGE 타입 메시지
    if (item.type === 'IMAGE') {
      // content를 JSON 배열로 파싱 (또는 단일 URL)
      let imageUrls: string[] = [];
      try {
        const parsed = JSON.parse(item.content);
        imageUrls = Array.isArray(parsed) ? parsed : [parsed];
      } catch {
        // JSON 파싱 실패시 단일 URL로 간주
        imageUrls = [item.content];
      }

      const imageCount = imageUrls.length;
      const resolvedImageUrls = imageUrls;

      if (isMyMessage) {
        return (
          <MyMessageContainer>
            <MessageTime fontSize={10} color="#AAAAAA">
              {formatChatDayjs(item.sentAt)}
            </MessageTime>
            <MessageContentWrapper isMyMessage={true}>
              <ImageList imageCount={imageCount} isMyMessage={isMyMessage}>
                {imageUrls.map((imageUrl: string, index: number) => (
                  <ImageWrapper key={index} onPress={() => onPressImage(imageUrl, resolvedImageUrls)}>
                    <UploadImage uri={imageUrl} />
                  </ImageWrapper>
                ))}
              </ImageList>
            </MessageContentWrapper>
          </MyMessageContainer>
        );
      } else {
        return (
          <PartnerMessageContainer>
            <PartnerProfileImage source={{ uri: opponentProfileImageURI }} />
            <PartnerMessageContent>
              <Typography fontSize={12} fontWeight="semiBold" marginBottom={5}>
                {item.senderNickname}
              </Typography>
              <PartnerMessageRow>
                <PartnerContentWrapper>
                  <ImageList imageCount={imageCount} isMyMessage={isMyMessage}>
                    {imageUrls.map((imageUrl: string, index: number) => (
                      <ImageWrapper key={index} onPress={() => onPressImage(imageUrl, resolvedImageUrls)}>
                        <UploadImage uri={imageUrl} />
                      </ImageWrapper>
                    ))}
                  </ImageList>
                </PartnerContentWrapper>
                <MessageTime fontSize={10} color="#AAAAAA">
                  {formatChatDayjs(item.sentAt)}
                </MessageTime>
              </PartnerMessageRow>
            </PartnerMessageContent>
          </PartnerMessageContainer>
        );
      }
    }

    // TEXT 타입 메시지 (기본)
    if (isMyMessage) {
      return (
        <MyMessageContainer>
          <MessageTime fontSize={10} color="#AAAAAA">
            {formatChatDayjs(item.sentAt)}
          </MessageTime>
          <MyMessageBubble>
            <MessageText fontSize={14} color="#fff">
              {item.content}
            </MessageText>
          </MyMessageBubble>
        </MyMessageContainer>
      );
    } else {
      return (
        <PartnerMessageContainer>
          <PartnerProfileImage source={{ uri: opponentProfileImageURI }} />
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
                {formatChatDayjs(item.sentAt)}
              </MessageTime>
            </PartnerMessageRow>
          </PartnerMessageContent>
        </PartnerMessageContainer>
      );
    }
  };

  useEffect(() => {
    const showSub = Keyboard.addListener('keyboardDidShow', () => {
      requestAnimationFrame(() => {
        if (scrollRef.current?.scrollToEnd) {
          scrollRef.current.scrollToEnd({ animated: true });
        }
      });
    });
    return () => {
      showSub.remove();
    };
  }, []);

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
        iconSize={30}
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
              <CrossButton
                onPress={handlePressCross}
                showExtraButtons={showExtraButtons}
              >
                <Icon width={20} height={20} Svg={CrossBlackIcon} />
              </CrossButton>
              <MessageInputWrapper hasInputValue={hasInputValue} height={inputHeight}>
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
                  multiline
                  onFocus={() => {
                    requestAnimationFrame(() => {
                      if (scrollRef.current?.scrollToEnd) {
                        scrollRef.current.scrollToEnd({ animated: true });
                      }
                    });
                  }}
                />
                <IconButton
                  width={20}
                  height={20}
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
                    <Icon width={24} height={24} Svg={ImageIcon} />
                  </ExtraButton>
                  <Typography fontSize={9} color="#000" lineHeight={20}>
                    앨범
                  </Typography>
                </ExtraButtonWrapper>
                <ExtraButtonWrapper onPress={onPressFile}>
                  <ExtraButton>
                    <Icon width={24} height={24} Svg={PaperPlusIcon} />
                  </ExtraButton>
                  <Typography fontSize={9} color="#000" lineHeight={20}>
                    파일
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
                <PreviewImage uri={item} />
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

const MessageInputWrapper = styled.View<{ hasInputValue: boolean, height: number }>`
  flex: 1;
  flex-direction: row;
  padding-horizontal: 12px;
  border: 1px solid ${({ hasInputValue }) => hasInputValue ? theme.colors.primary : theme.colors.disabled};
  border-radius: 8px;
  height: ${({ height }) => height}px;
  align-items: center;
`;

const MessageInput = styled.TextInput<{ height: number }>`
  flex: 1;
  color: #000;
  font-size: 14px;
  font-family: Pretendard-Regular;
  margin-right: 10px;
  padding-top: 10px;
  height: 100%;
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