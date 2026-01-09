import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Platform, Animated, Dimensions, FlatList, View, BackHandler } from 'react-native';
import styled from '@/utils/scale/CustomStyled.ts';
import IconButton from '@/components/IconButton.tsx';
import CancelIcon from '@/assets/icons/cancel.svg';
import IcCancelIcon from '@/assets/icons/ic-cancel.svg';
import { Alert, requestPermission, Typography } from '@/components/theme';
import Icon from '@/components/Icon.tsx';
import ArrowDownIcon from '@/assets/icons/arrow-down.svg';
import ImageIcon from '@/assets/icons/image.svg';
import { theme } from '@/theme';
import {
  CommunityPost,
  CreateCommunityPostParams,
  COMMUNITY_CATEGORY_ENUM, COMMUNITY_CATEGORIES, CATEGORY_KEYS, getCategoryEnumByValue,
} from '@/api/community.ts';
import {
  CameraOptions,
  ImageLibraryOptions,
  ImagePickerResponse,
  launchCamera,
  launchImageLibrary,
} from 'react-native-image-picker';
import { UploadImageParams } from '@/types/image.ts';
import { generateImageFilename } from '@/utils/format.ts';
import LoadingSpinner from '@/components/LoadingSpinner.tsx';
import ServerImage from '@/components/ServerImage.tsx';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AddUserIcon from '@/assets/icons/add-user.svg';
import SlideModal from '@/components/theme/SlideModal.tsx';
import SearchIcon from '@/assets/icons/search-white.svg';
import { useSearchUsersInfiniteQuery } from '@/queries/user.ts';
import { useAuthStore } from '@/store/authStore.ts';
import { useFocusEffect } from '@react-navigation/native';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface CommunityPostModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (params: CreateCommunityPostParams & { deletePhotoIds?: number[] }) => void;
  initialPost?: CommunityPost;
  isLoading: boolean;
}

export default function CommunityPostModal({
  visible,
  onClose,
  onSubmit,
  initialPost,
  isLoading,
}: CommunityPostModalProps) {
  const [selectedCategory, setSelectedCategory] = useState<COMMUNITY_CATEGORY_ENUM | null>(null);
  const [content, setContent] = useState('');
  const [images, setImages] = useState<UploadImageParams[]>([]);
  const [taggedUserId, setTaggedUserId] = useState<string>('');
  const [taggedNickname, setTaggedNickname] = useState<string>('');
  const [deletedImageIndices, setDeletedImageIndices] = useState<number[]>([]);
  const [isTopicListVisible, setIsTopicListVisible] = useState(false);
  const [isSearchingPhotographerModalVisible, setIsSearchingPhotographerModalVisible] = useState(false);
  const [searchPhotographerKey, setSearchPhotographerKey] = useState<string>('');
  const [debouncedSearchKey, setDebouncedSearchKey] = useState<string>('');

  const isDirty = selectedCategory !== null || content !== '' || images.length > 0 || (initialPost && deletedImageIndices.length > 0);

  const inset = useSafeAreaInsets();
  const { userId } = useAuthStore();

  // Debounce searchPhotographerKey
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchKey(searchPhotographerKey);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchPhotographerKey]);

  // Search users (photographers only)
  const {
    data: searchUsersData,
    fetchNextPage: fetchNextSearchUsers,
    hasNextPage: hasNextSearchUsers,
    isFetchingNextPage: isFetchingNextSearchUsers,
  } = useSearchUsersInfiniteQuery(debouncedSearchKey, { size: 20 });

  // Filter to get photographers only (exclude self)
  const searchedPhotographers = searchUsersData?.pages
    .flatMap(page => page.content)
    .filter(user => user.role === 'PHOTOGRAPHER' && user.userId !== userId) || [];

  // Sliding animation
  const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;

  const resetModal = () => {
    setSelectedCategory(null);
    setContent('');
    setImages([]);
    setDeletedImageIndices([]);
    setTaggedUserId('');
    setTaggedNickname('');
  }

  // Load initial post data when modal opens
  useEffect(() => {
    if (visible && initialPost) {
      setSelectedCategory(getCategoryEnumByValue(initialPost.categoryLabel));

      // Set tagged user info and add @nickname to content
      const taggedUser = initialPost.taggedUsers?.[0];
      if (taggedUser) {
        setTaggedUserId(taggedUser.userId);
        setTaggedNickname(taggedUser.nickname);
        // Add @nickname to content if not already present
        const mentionText = `@${taggedUser.nickname}`;
        if (!initialPost.content.includes(mentionText)) {
          setContent(`${mentionText} ${initialPost.content}`);
        } else {
          setContent(initialPost.content);
        }
      } else {
        setTaggedUserId('');
        setTaggedNickname('');
        setContent(initialPost.content);
      }

      setImages([]);
      setDeletedImageIndices([]);
    } else if (visible && !initialPost) {
      resetModal();
    }
  }, [visible, initialPost]);

  useEffect(() => {
    if (visible) {
      // Slide in from bottom
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        tension: 65,
        friction: 11,
      }).start();
    } else {
      // Slide out to bottom
      Animated.timing(slideAnim, {
        toValue: SCREEN_HEIGHT,
        duration: 250,
        useNativeDriver: true,
      }).start();
    }
  }, [visible, slideAnim]);

  const handlePressClose = useCallback(() => {
    if (isDirty) {
      Alert.show({
        title: `게시글 ${initialPost ? '수정' : '작성'}을 그만둘까요?`,
        message: '변경된 내용은 저장되지 않아요.',
        buttons: [
          {
            text: '나가기',
            type: 'cancel',
            onPress: () => {
              resetModal();
              onClose();
            },
          },
          {
            text: '계속 작성하기',
            onPress: () => {
              // Alert가 자동으로 닫힘
            },
          },
        ],
      });
      return;
    }

    onClose();
  }, [initialPost, isDirty, onClose]);

  useFocusEffect(
    React.useCallback(() => {
      const onBackPress = () => {
        if (handlePressClose) {
          handlePressClose();
          return true; // 시스템 종료 방지
        }

        return false; // 더 이상 뒤로 갈 곳이 없으면 앱 종료 허용
      };

      const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
      return () => subscription.remove();
    }, [handlePressClose])
  );

  const handlePressTopicSelector = () => {
    setIsTopicListVisible(!isTopicListVisible);
  };

  const handleSelectCategory = (category: COMMUNITY_CATEGORY_ENUM) => {
    setSelectedCategory(category);
    setIsTopicListVisible(false);
  };

  const handleCamera = async () => {
    requestPermission(
      'camera',
      async () => {
        // 권한 허용됨 - 카메라 열기
        const options: CameraOptions = {
          mediaType: 'photo',
          saveToPhotos: true,
          quality: 0.8,
        };

        const response: ImagePickerResponse = await launchCamera(options);

        console.log('Camera response:', {
          didCancel: response.didCancel,
          errorCode: response.errorCode,
          errorMessage: response.errorMessage,
          assetsLength: response.assets?.length,
          firstAssetUri: response.assets?.[0]?.uri,
        });

        if (response.didCancel) {
          console.log('User cancelled camera');
          return;
        }
        if (response.errorCode) {
          console.log('Camera error:', response.errorCode, response.errorMessage);
          Alert.show({
            title: '카메라 오류',
            message: response.errorMessage || '알 수 없는 오류',
          });
          return;
        }
        if (response.assets && response.assets[0]?.uri && response.assets[0]?.fileName && response.assets[0]?.type) {
          setImages([
            ...images,
            {
              uri: response.assets[0].uri,
              name: response.assets[0].fileName,
              type: response.assets[0].type,
            }
          ])
        } else {
          console.log('No image URI found in response');
        }
      }
    );
  };

  const handleGallery = async () => {
    requestPermission(
      'photo',
      async () => {
        // 권한 허용됨 - 갤러리 열기
        const options: ImageLibraryOptions = {
          mediaType: 'photo',
          selectionLimit: 0,
          quality: 0.8,
        };

        const response: ImagePickerResponse = await launchImageLibrary(options);

        if (response.didCancel) return;
        if (response.errorCode) {
          Alert.show({
            title: '갤러리 오류',
            message: response.errorMessage || '알 수 없는 오류',
          });
          return;
        }
        if (response.assets?.length) {
          const picked =
            response.assets
              ?.filter((a): a is { uri: string; type: string; fileName?: string } =>
                Boolean(a.uri && a.type)
              )
              .map(a => ({
                uri: a.uri,
                type: a.type,
                name: a.fileName ?? generateImageFilename(a.type),
              })) ?? [];

          setImages(prev => [...prev, ...picked]);
        }
      }
    );
  };

  const handlePressImage = () => {
    Alert.show({
      title: '사진 등록',
      message: '사진을 어떻게 업로드하시겠습니까?',
      buttons: [
        {
          text: '카메라',
          onPress: handleCamera,
          type: 'destructive',
        },
        {
          text: '갤러리',
          onPress: handleGallery,
          type: 'destructive',
        },
        {
          text: '취소',
          onPress: () => console.log('취소됨'),
          type: 'cancel',
        },
      ],
    });
  };

  const handlePressTagUser = () => {
    setIsSearchingPhotographerModalVisible(true);
  };

  const handleCloseSearchingPhotographerModal = () => {
    setIsSearchingPhotographerModalVisible(false);
    setSearchPhotographerKey('');
  };

  const handleSelectPhotographer = (photographerId: string, nickname: string) => {
    // Remove existing tag if present
    let newContent = content;
    if (taggedNickname) {
      const oldMentionText = `@${taggedNickname}`;
      newContent = newContent.replace(oldMentionText, '').trim();
    }

    setTaggedUserId(photographerId);
    setTaggedNickname(nickname);
    // Add new @nickname to the beginning of content
    setContent(`@${nickname} ${newContent}`);
    setIsSearchingPhotographerModalVisible(false);
    setSearchPhotographerKey('');
  };

  const handleLoadMoreSearchedPhotographers = () => {
    if (hasNextSearchUsers && !isFetchingNextSearchUsers) {
      fetchNextSearchUsers();
    }
  };

  // Watch content changes to detect if @nickname is deleted
  useEffect(() => {
    if (taggedUserId && taggedNickname) {
      const mentionText = `@${taggedNickname}`;
      if (!content.includes(mentionText)) {
        // Tag removed
        setTaggedUserId('');
        setTaggedNickname('');
      }
    }
  }, [content, taggedUserId, taggedNickname]);

  const handleSubmit = () => {
    if (!selectedCategory || !content.trim()) {
      // Show validation error
      return;
    }

    // Remove @nickname from content before submitting
    let submitContent = content.trim();
    if (taggedNickname) {
      const mentionText = `@${taggedNickname}`;
      submitContent = submitContent.replace(mentionText, '').trim();
    }

    onSubmit({
      category: selectedCategory,
      content: submitContent,
      taggedUserIds: taggedUserId === '' ? [] : [taggedUserId],
      images,
      deletePhotoIds: initialPost ? deletedImageIndices : undefined,
    });
  };

  const canSubmit = selectedCategory !== null && content.trim().length > 0;

  if (!visible) return null;

  return (
    <>
      <Overlay>
        <AnimatedContainer
          style={{
            transform: [{ translateY: slideAnim }],
          }}
        >
          <KeyboardAvoidingContainer
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          >
            <Header>
              <IconButton width={18} height={18} Svg={CancelIcon} onPress={handlePressClose} />
              <Typography fontSize={16} fontWeight="bold" letterSpacing="-2.5%" color="#000">
                {initialPost ? '게시글 수정' : '커뮤니티 글쓰기'}
              </Typography>
              <ConfirmButton onPress={handleSubmit} disabled={!canSubmit}>
                <Typography
                  fontSize={16}
                  letterSpacing="-2.5%"
                  color={canSubmit ? theme.colors.primary : '#C8C8C8'}
                >
                  완료
                </Typography>
              </ConfirmButton>
            </Header>
            <ScrollContainer
              contentContainerStyle={{ flexGrow: 1, paddingBottom: 80 }}
              keyboardShouldPersistTaps="handled"
              nestedScrollEnabled
            >
              <TopicSelector>
                <TopicWrapper onPress={handlePressTopicSelector}>
                  <Typography fontSize={16} letterSpacing="-2.5%">
                    {selectedCategory ? COMMUNITY_CATEGORIES[selectedCategory] : '주제를 선택해주세요.'}
                  </Typography>
                  <Icon width={24} height={24} Svg={ArrowDownIcon} />
                </TopicWrapper>
                {isTopicListVisible && (
                  <TopicList>
                    {CATEGORY_KEYS.filter((v) => v !== 'NEWS').map((category) => (
                      <TopicItem key={category} onPress={() => handleSelectCategory(category)}>
                        <Typography fontSize={16} letterSpacing="-2.5%">
                          {COMMUNITY_CATEGORIES[category]}
                        </Typography>
                      </TopicItem>
                    ))}
                  </TopicList>
                )}
              </TopicSelector>
              <ContentInput
                placeholder="스냅 사진과 관련된 이야기를 나눠보세요!"
                placeholderTextColor="#A4A4A4"
                multiline={true}
                value={content}
                onChangeText={setContent}
              />
            </ScrollContainer>
            {/* 이미지 미리보기 - 가로 스크롤 */}
            {(images.length > 0 || (initialPost?.images && initialPost.images.filter(img => !deletedImageIndices.includes(img.Id)).length > 0)) && (
              <ImagePreviewScrollContainer horizontal showsHorizontalScrollIndicator={false}>
                {/* Server images */}
                {initialPost?.images &&
                  initialPost.images.map((image, _) => {
                    // 삭제된 이미지는 렌더링하지 않음
                    if (deletedImageIndices.includes(image.Id)) return null;

                    return (
                      <ThumbnailImageView
                        key={`server-${image.Id}`}
                        uri={image.urls}
                        onDelete={() => {
                          setDeletedImageIndices([...deletedImageIndices, image.Id]);
                        }}
                        isServerImage={true}
                      />
                    );
                  })
                }
                {/* New uploaded images */}
                {images.map((image, index) => (
                  <ThumbnailImageView
                    key={`new-${index}`}
                    uri={image.uri}
                    onDelete={() => setImages(images.filter((_, i) => i !== index))}
                    isServerImage={false}
                  />
                ))}
                <ImagePreviewScrollSpacer/>
              </ImagePreviewScrollContainer>
            )}
            <ToolWrapper paddingBottom={inset.bottom + 10}>
              <ToolButton onPress={handlePressImage}>
                <Icon width={24} height={24} Svg={ImageIcon} />
                <Typography fontSize={12} lineHeight={20} marginLeft={3}>
                  사진
                </Typography>
              </ToolButton>
              <ToolButton onPress={handlePressTagUser}>
                <Icon width={24} height={24} Svg={AddUserIcon} />
                <Typography fontSize={12} lineHeight={20} marginLeft={3}>
                  태그하기
                </Typography>
              </ToolButton>
            </ToolWrapper>
          </KeyboardAvoidingContainer>
          <KeyboardAvodingSpacer />
        </AnimatedContainer>
      </Overlay>
      <LoadingSpinner visible={isLoading} />
      <SlideModal
        visible={isSearchingPhotographerModalVisible}
        onClose={handleCloseSearchingPhotographerModal}
        showHeader={false}
        scrollable={false}
        minHeight={SCREEN_HEIGHT * 0.8}
      >
        <SearchHeaderWrapper>
          <SearchInputWrapper>
            <SearchInput
              value={searchPhotographerKey}
              onChangeText={setSearchPhotographerKey}
              placeholder="작가 검색"
              placeholderTextColor="#A4A4A4"
            />
            <Icon width={24} height={24} Svg={SearchIcon} />
          </SearchInputWrapper>
          <CancelSearchButton onPress={handleCloseSearchingPhotographerModal}>
            <Typography fontSize={18}>취소</Typography>
          </CancelSearchButton>
        </SearchHeaderWrapper>
        <FlatList
          data={searchedPhotographers}
          keyExtractor={(item) => item.userId}
          renderItem={({ item }) => (
            <TaggedPhotographerButton onPress={() => handleSelectPhotographer(item.userId, item.nickname)}>
              <TaggedPhotographerInfo>
                <TaggedPhotographerProfileImageWrapper>
                  <TaggedPhotographerProfileImage uri={item.profileImageUrl} />
                </TaggedPhotographerProfileImageWrapper>
                <Typography fontSize={14} fontWeight="semiBold" marginLeft={4}>
                  {item.nickname}
                </Typography>
              </TaggedPhotographerInfo>
            </TaggedPhotographerButton>
          )}
          onEndReached={handleLoadMoreSearchedPhotographers}
          onEndReachedThreshold={0.5}
          ListEmptyComponent={
            searchPhotographerKey.trim().length > 0 ? (
              <View style={{ padding: 20, alignItems: 'center' }}>
                <Typography fontSize={14} color="#A4A4A4">
                  검색 결과가 없습니다
                </Typography>
              </View>
            ) : null
          }
        />
      </SlideModal>
    </>
  );
}

const Overlay = styled.View`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 1000;
`;

const AnimatedContainer = styled(Animated.View)`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 100%;
  background-color: #fff;
  ${Platform.OS === 'ios' ? `padding-top: 50px;` : ''}
`;

const KeyboardAvoidingContainer = styled.KeyboardAvoidingView`
  flex: 1;
  width: 100%;
  height: 100%;
`

const ScrollContainer = styled.ScrollView`
  flex: 1;
  width: 100%;
  height: 100%;
`

const Header = styled.View`
  width: 100%;
  height: 57px;
  align-items: center;
  flex-direction: row;
  padding-horizontal: 20px;
  justify-content: space-between;
  position: relative;
  z-index: 999;
`

const ConfirmButton = styled.TouchableOpacity<{ disabled?: boolean }>`
  opacity: ${({ disabled }) => (disabled ? 0.5 : 1)};
`

const TopicSelector = styled.View`
  width: 100%;
  height: 62px;
  border-bottom-width: 1px;
  border-bottom-style: solid;
  border-bottom-color: #C8C8C8;
  position: relative;
  z-index: 999;
`

const TopicWrapper = styled.TouchableOpacity`
  width: 100%;
  height: 100%;
  padding-left: 28px;
  padding-right: 22px;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
`

const TopicList = styled.View`
  flex: 1;
  width: 100%;
  position: absolute;
  left: 0;
  top: 62px;
  z-index: 1001;
  background-color: #FAFAFA;
`

const TopicItem = styled.TouchableOpacity`
  flex: 1;
  width: 100%;
  height: 62px;
  justify-content: center;
  padding-left: 28px;
  border-bottom-width: 1px;
  border-bottom-style: solid;
  border-bottom-color: #C8C8C8;
  background-color: #FAFAFA;
  position: relative;
  z-index: 1001;
`

const ContentInput = styled.TextInput`
  margin-top: 20px;
  width: 100%;
  padding: 0 28px;
  min-height: 100px;
  text-align-vertical: top;
  font-size: 16px;
  font-family: Pretendard-Regular;
  color: ${theme.colors.textPrimary};
`

const ToolWrapper = styled.View<{ paddingBottom: number }>`
  width: 100%;
  padding-left: 28px;
  flex-direction: row;
  align-items: center;
  padding-bottom: ${({ paddingBottom }) => paddingBottom}px;
  padding-top: 20px;
`

const ToolButton = styled.TouchableOpacity`
  flex-direction: row;
  align-items: center;
  margin-right: 20px;
`

const KeyboardAvodingSpacer = styled.View`
  height: 20px;
`

// 이미지 썸네일 미리보기 스타일
const ImagePreviewScrollContainer = styled.ScrollView`
  padding: 10px 28px;
  max-height: 120px;
`

const ImagePreviewScrollSpacer = styled.View`
  width: 50px;
`

const ThumbnailContainer = styled.View`
  width: 90px;
  height: 90px;
  margin-right: 5px;
  position: relative;
`

const ThumbnailImageWrapper = styled.View`
  width: 100%;
  height: 100%;
  border-radius: 5px;
  overflow: hidden;
`

const ThumbnailImage = styled.Image`
  width: 100%;
  height: 100%;
`

const ThumbnailServerImage = styled(ServerImage)`
  width: 100%;
  height: 100%;
`

const ThumbnailDeleteButton = styled.Pressable`
  position: absolute;
  top: -10px;
  right: -10px;
  width: 24px;
  height: 24px;
  align-items: center;
  justify-content: center;
  z-index: 10;
`

interface ThumbnailImageViewProps {
  uri: string;
  onDelete: () => void;
  isServerImage: boolean;
}

const ThumbnailImageView = ({
  uri,
  onDelete,
  isServerImage,
}: ThumbnailImageViewProps) => {
  return (
    <ThumbnailContainer>
      <ThumbnailDeleteButton onPress={onDelete}>
        <Icon width={20} height={20} Svg={IcCancelIcon} />
      </ThumbnailDeleteButton>
      <ThumbnailImageWrapper>
        {isServerImage ? (
          <ThumbnailServerImage uri={uri} />
        ) : (
          <ThumbnailImage source={{ uri }} />
        )}
      </ThumbnailImageWrapper>
    </ThumbnailContainer>
  )
}

// Search Modal Styles
const SearchHeaderWrapper = styled.View`
  flex-direction: row;
  align-items: center;
`

const SearchInputWrapper = styled.View`
  flex: 1;
  flex-direction: row;
  padding-horizontal: 12px;
  border: 1px solid ${theme.colors.disabled};
  border-radius: 8px;
  height: 41px;
  margin-left: 13px;
  align-items: center;
  margin-right: 15px;
`;

const SearchInput = styled.TextInput`
  flex: 1;
  font-size: 16px;
  color: #000;
  font-family: Pretendard-Regular;
`;

const CancelSearchButton = styled.TouchableOpacity`
  padding: 5px;
`;

const TaggedPhotographerButton = styled.TouchableOpacity`
  width: 100%;
  padding: 15px 20px;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  height: 80px;
`;

const TaggedPhotographerInfo = styled.View`
  flex-direction: row;
  align-items: center;
`;

const TaggedPhotographerProfileImageWrapper = styled.View`
  width: 50px;
  height: 50px;
  border-radius: 50px;
  overflow: hidden;
  background-color: #aaa;
`;

const TaggedPhotographerProfileImage = styled(ServerImage)`
  width: 100%;
  height: 100%;
`;