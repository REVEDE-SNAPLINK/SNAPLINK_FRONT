import { useState, useEffect, useRef } from 'react';
import { Platform, Animated, Dimensions } from 'react-native';
import styled from '@/utils/scale/CustomStyled.ts';
import IconButton from '@/components/IconButton.tsx';
import CancelIcon from '@/assets/icons/cancel.svg';
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
import CrossIcon from '@/assets/icons/cross-white.svg';
import LoadingSpinner from '@/components/LoadingSpinner.tsx';
import ServerImage from '@/components/ServerImage.tsx';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface CommunityPostModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (params: CreateCommunityPostParams & { deletePhotoIds?: string[] }) => void;
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
  const [selectedCategory, setSelectedCategory] =
    useState<COMMUNITY_CATEGORY_ENUM | null>(
      getCategoryEnumByValue(initialPost?.categoryLabel)
    );
  const [title, setTitle] = useState(initialPost?.title || '');
  const [content, setContent] = useState(initialPost?.content || '');
  const [images, setImages] = useState<UploadImageParams[]>([]);
  const [serverImages, setServerImages] = useState<string[]>(initialPost?.imageUrls || []);
  const [deletePhotoIds, setDeletePhotoIds] = useState<string[]>([]);
  const [isTopicListVisible, setIsTopicListVisible] = useState(false);

  const isDirty = selectedCategory !== null || title !== '' || content !== '' || images.length > 0 || serverImages.length > 0;

  // Sliding animation
  const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;

  const resetModal = () => {
    setSelectedCategory(null);
    setTitle('');
    setContent('');
    setImages([]);
    setServerImages([]);
    setDeletePhotoIds([]);
  }

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

  const hanedlePressClose = () => {
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
  }

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

  const handleSubmit = () => {
    if (!selectedCategory || !title.trim()) {
      // Show validation error
      return;
    }

    onSubmit({
      category: selectedCategory,
      title: title.trim(),
      content: content.trim(),
      images,
      deletePhotoIds: initialPost ? deletePhotoIds : undefined,
    });
  };

  const canSubmit = selectedCategory !== null && title.trim().length > 0;

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
              <IconButton width={18} height={18} Svg={CancelIcon} onPress={hanedlePressClose} />
              <Typography fontSize={18} fontWeight="bold" letterSpacing="-2.5%" color="#000">
                {initialPost ? '게시글 수정' : '커뮤니티 글쓰기'}
              </Typography>
              <ConfirmButton onPress={handleSubmit} disabled={!canSubmit}>
                <Typography
                  fontSize={18}
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
                  <TopicList length={CATEGORY_KEYS.length}>
                    {CATEGORY_KEYS.map((category) => (
                      <TopicItem key={category} onPress={() => handleSelectCategory(category)}>
                        <Typography fontSize={16} letterSpacing="-2.5%">
                          {COMMUNITY_CATEGORIES[category]}
                        </Typography>
                      </TopicItem>
                    ))}
                  </TopicList>
                )}
              </TopicSelector>
              <TitleInput
                placeholder="제목을 입력해주세요."
                placeholderTextColor="#A4A4A4"
                value={title}
                onChangeText={setTitle}
              />
              <ContentInput
                placeholder="스냅 사진과 관련된 이야기를 나눠보세요!"
                placeholderTextColor="#A4A4A4"
                multiline={true}
                value={content}
                onChangeText={setContent}
              />
              <PostImageList>
                {/* Server images */}
                {serverImages.length > 0 &&
                  serverImages.map((imageUrl, index) => (
                    <ServerPostImageView
                      key={`server-${index}`}
                      uri={imageUrl}
                      onDelete={() => {
                        // TODO: 실제로는 photoId를 받아야 하지만 현재 API에는 없어서 임시로 URL 사용
                        setDeletePhotoIds([...deletePhotoIds, imageUrl]);
                        setServerImages(serverImages.filter((_, i) => i !== index));
                      }}
                    />
                  ))
                }
                {/* New uploaded images */}
                {images.length > 0 &&
                  images.map((image, index) => (
                    <PostImageView
                      key={`new-${index}`}
                      uri={image.uri}
                      onDelete={() => setImages(images.filter((_, i) => i !== index))}
                    />
                  ))
                }
              </PostImageList>
            </ScrollContainer>
            <ToolWrapper>
              <ToolButton onPress={handlePressImage}>
                <Icon width={24} height={24} Svg={ImageIcon} />
                <Typography fontSize={12} lineHeight={20} marginLeft={3}>
                  사진
                </Typography>
              </ToolButton>
            </ToolWrapper>
          </KeyboardAvoidingContainer>
          <KeyboardAvodingSpacer />
        </AnimatedContainer>
      </Overlay>
      <LoadingSpinner visible={isLoading} />
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
  ${Platform.OS === 'ios' ? `padding-top: 50px;` : ''};
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
  padding-left: 15px;
  padding-right: 20px;
  justify-content: space-between;
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

const TopicList = styled.View<{ length: number }>`
  flex: 1;
  width: 100%;
  position: absolute;
  left: 0;
  top: 62px;
  z-index: 10;
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
`

const TitleInput = styled.TextInput`
  width: 100%;
  margin-top: 9px;
  height: 60px;
  font-size: 20px;
  font-family: Pretendard-Bold;
  font-weight: bold;
  color: ${theme.colors.textPrimary};
  padding:0 28px;
`

const ContentInput = styled.TextInput`
  width: 100%;
  padding: 0 28px;
  min-height: 100px;
  text-align-vertical: top;
  font-size: 16px;
  font-family: Pretendard-Regular;
  color: ${theme.colors.textPrimary};
`

const ToolWrapper = styled.View`
  width: 100%;
  height: 60px;
  padding-left: 28px;
  flex-direction: row;
  align-items: center;
`

const ToolButton = styled.TouchableOpacity`
  flex-direction: row;
  align-items: center;
  margin-right: 20px;
`

const KeyboardAvodingSpacer = styled.View`
  height: 20px;
`

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const IMAGE_PADDING = 20;
const IMAGE_SIZE = SCREEN_WIDTH - IMAGE_PADDING * 2;

const PostImageList = styled.View`
  padding: 0 ${IMAGE_PADDING}px;
`

const PostImageContainer = styled.View`
  width: ${IMAGE_SIZE}px;
  height: ${IMAGE_SIZE}px;
  margin-bottom: 10px;
`

const PostImageWrapper = styled.View`
  width: 100%;
  height: 100%;
  overflow: hidden;
`

const PostImage = styled.Image`
  width: 100%;
  height: 100%;
`

const PostImageDeleteButton = styled.Pressable`
  width: 30px;
  height: 30px;
  background-color: #aaa;
  border-radius: 30px;
  align-items: center;
  justify-content: center;
  transform: rotate(45deg);
  position: absolute;
  top: -15px;
  right: -15px;
  z-index: 99;
`

interface PostImageViewProps {
  uri: string;
  onDelete: () => void;
}

const PostImageView = ({
  uri,
  onDelete,
}: PostImageViewProps) => {
  return (
    <PostImageContainer>
      <PostImageDeleteButton onPress={onDelete}>
        <Icon width={15} height={15} Svg={CrossIcon} />
      </PostImageDeleteButton>
      <PostImageWrapper>
        <PostImage source={{ uri }} />
      </PostImageWrapper>
    </PostImageContainer>
  )
}

interface ServerPostImageViewProps {
  uri: string;
  onDelete: () => void;
}

const ServerPostImageView = ({
  uri,
  onDelete,
}: ServerPostImageViewProps) => {
  return (
    <PostImageContainer>
      <PostImageDeleteButton onPress={onDelete}>
        <Icon width={15} height={15} Svg={CrossIcon} />
      </PostImageDeleteButton>
      <PostImageWrapper>
        <StyledServerImage uri={uri} />
      </PostImageWrapper>
    </PostImageContainer>
  )
}

const StyledServerImage = styled(ServerImage)`
  width: 100%;
  height: 100%;
`