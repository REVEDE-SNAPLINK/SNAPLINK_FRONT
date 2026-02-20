import { useState, useCallback, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import PortfolioFormView, { PortfolioFormData } from './PortfolioFormView';
import { MainNavigationProp, MainStackParamList } from '@/types/navigation';
import { useCreatePortfolioMutation, useUpdatePortfolioMutation } from '@/mutations/photographers';
import { Alert } from '@/components/theme';
import { UploadImageFile } from '@/api/photographers';
import { hasForbiddenWords } from '@/utils/hasForbiddenWords';
import { usePortfolioPostQuery } from '@/queries/photographers';
import analytics from '@react-native-firebase/analytics';
import { useAuthStore } from '@/store/authStore';
import { showErrorAlert } from '@/utils/error';

type PortfolioFormRouteProp = RouteProp<MainStackParamList, 'PortfolioForm'>;

// Extended UploadImageFile to track photoId for existing photos
interface ExtendedUploadImageFile extends UploadImageFile {
  photoId?: number; // If exists, it's an existing photo from server
}

export default function PortfolioFormContainer() {
  const navigation = useNavigation<MainNavigationProp>();
  const route = useRoute<PortfolioFormRouteProp>();
  const { postId } = route.params || {};
  const { userId } = useAuthStore();
  const { mutate: uploadPortfolio, isPending: isCreating } = useCreatePortfolioMutation();

  const isEditMode = !!postId;
  const { data: existingPost } = usePortfolioPostQuery(postId);
  const { mutate: updatePortfolio, isPending: isUpdating } = useUpdatePortfolioMutation(
    postId || 0,
    existingPost?.photographerId
  );

  const isPending = isCreating || isUpdating;

  const [photoURIs, setPhotoURIs] = useState<ExtendedUploadImageFile[]>([]);
  const [originalPhotoIds, setOriginalPhotoIds] = useState<number[]>([]); // Track original photo IDs

  const { control, handleSubmit, reset, watch } = useForm<PortfolioFormData>({
    defaultValues: {
      portfolioDescription: '',
      portfolioIsLinked: false,
    },
    mode: 'onChange',
  });

  // 수정 모드일 때 기존 데이터로 초기화
  useEffect(() => {
    if (isEditMode && existingPost) {
      reset({
        portfolioDescription: existingPost.content || '',
        portfolioIsLinked: false,
      });

      // 기존 이미지를 photoURIs로 설정 (서버 URL을 ExtendedUploadImageFile 형식으로 변환)
      // sortOrder 순서대로 정렬
      const sortedPhotos = [...existingPost.photos].sort((a, b) => a.sortOrder - b.sortOrder);
      const existingPhotos: ExtendedUploadImageFile[] = sortedPhotos.map((photo) => ({
        uri: photo.imageUrl,
        type: 'image/jpeg',
        name: photo.imageUrl.split('/').pop() || 'image.jpg',
        photoId: photo.photoId, // Track photoId
      }));
      setPhotoURIs(existingPhotos);

      // Track original photo IDs
      setOriginalPhotoIds(sortedPhotos.map(photo => photo.photoId));
    }
  }, [isEditMode, existingPost, reset]);

  const isValid = photoURIs.length > 0 && watch('portfolioDescription').trim().length > 0;

  const handlePressBack = () => navigation.goBack();

  const handleRemoveImage = useCallback((index: number) => {
    const newPhotoURIs = photoURIs.filter((_, i) => i !== index);
    setPhotoURIs(newPhotoURIs);
  }, [photoURIs]);

  const handleAddImages = useCallback(async (newImages: UploadImageFile[]) => {
    setPhotoURIs([...photoURIs, ...newImages]);
  }, [photoURIs]);

  const handleReorderImages = useCallback((reorderedImages: UploadImageFile[]) => {
    setPhotoURIs(reorderedImages as ExtendedUploadImageFile[]);
  }, []);

  const handleSubmitForm = handleSubmit(async (data) => {
    if (photoURIs.length === 0) {
      Alert.show({
        title: '사진 필요',
        message: '포트폴리오 사진을 1장 이상 등록해주세요.',
      });
      return;
    }

    if (hasForbiddenWords(data.portfolioDescription)) {
      Alert.show({
        title: '부적절한 단어 포함',
        message: '제목 또는 내용에 부적절한 단어가 포함되어 있습니다.',
      });
      return;
    }

    if (isEditMode) {
      // Build update request
      // 1. Separate existing photos (have photoId) from new photos (no photoId)
      const existingPhotos = photoURIs.filter(photo => photo.photoId !== undefined);
      const newPhotos = photoURIs.filter(photo => photo.photoId === undefined);

      // 2. Calculate deleted photo IDs
      const currentPhotoIds = existingPhotos.map(photo => photo.photoId!);
      const deletePhotoIds = originalPhotoIds.filter(id => !currentPhotoIds.includes(id));

      // 3. Build photoOrders for existing photos (based on current order in full array)
      const photoOrders = existingPhotos.map((photo) => ({
        photoId: photo.photoId!,
        sortOrder: photoURIs.indexOf(photo),
      }));

      // 4. Build UpdatePortfolioPostRequest
      updatePortfolio(
        {
          request: {
            content: data.portfolioDescription || '',
            deletePhotoIds,
            photoOrders,
          },
          newImages: newPhotos,
        },
        {
          onSuccess: () => {
            analytics().logEvent('portfolio_post_updated', {
              user_id: userId || '',
              post_id: postId,
              deleted_count: deletePhotoIds.length,
              new_count: newPhotos.length,
            });

            Alert.show({
              title: '수정 완료',
              message: '포트폴리오가 성공적으로 수정되었습니다.',
              buttons: [
                {
                  text: '확인',
                  onPress: () => navigation.goBack(),
                },
              ],
            });
          },
          onError: (error) => {
            showErrorAlert({
              title: '수정 실패',
              action: '포트폴리오 수정',
              error,
            });
          },
        }
      );
      return;
    }

    uploadPortfolio(
      {
        content: data.portfolioDescription || '',
        images: photoURIs,
        isLinked: data.portfolioIsLinked,
      },
      {
        onSuccess: () => {
          analytics().logEvent('portfolio_post_created', {
            user_id: userId || '',
            photo_count: photoURIs.length,
            is_linked: data.portfolioIsLinked,
          });

          Alert.show({
            title: '등록 완료',
            message: '포트폴리오가 성공적으로 등록되었습니다.',
            buttons: [
              {
                text: '확인',
                onPress: () => navigation.goBack(),
              },
            ],
          });
        },
        onError: (error) => {
          showErrorAlert({
            title: '등록 실패',
            action: '포트폴리오 등록',
            error,
          });
        },
      }
    );
  });

  return (
    <PortfolioFormView
      control={control}
      photoURIs={photoURIs}
      onRemoveImage={handleRemoveImage}
      onAddImages={handleAddImages}
      onReorderImages={handleReorderImages}
      onPressBack={handlePressBack}
      onPressSubmit={handleSubmitForm}
      isSubmitDisabled={!isValid || isPending}
      isEditMode={isEditMode}
      navigation={navigation}
    />
  );
}
