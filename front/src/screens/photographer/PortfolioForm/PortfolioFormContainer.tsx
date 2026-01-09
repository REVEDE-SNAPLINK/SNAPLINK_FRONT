import { useState, useCallback, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import PortfolioFormView, { PortfolioFormData } from './PortfolioFormView';
import { MainNavigationProp, MainStackParamList } from '@/types/navigation';
import { useCreatePortfolioMutation, useUpdatePortfolioMutation } from '@/mutations/photographers';
import { Alert, requestPermission } from '@/components/theme';
import { launchImageLibrary, ImagePickerResponse } from 'react-native-image-picker';
import { Image as ImageCompressor } from 'react-native-compressor';
import { generateImageFilename } from '@/utils/format';
import { UploadImageFile } from '@/api/photographers';
import { hasForbiddenWords } from '@/utils/hasForbiddenWords';
import { usePortfolioPostQuery } from '@/queries/photographers';
import analytics from '@react-native-firebase/analytics';
import { useAuthStore } from '@/store/authStore';

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
    setPhotoURIs(prev => prev.filter((_, i) => i !== index));
  }, []);

  const handleAddImages = useCallback(() => {
    requestPermission('photo', async () => {
      try {
        const result: ImagePickerResponse = await launchImageLibrary({
          mediaType: 'photo',
          selectionLimit: 0,
          quality: 0.8,
        });

        if (result.didCancel) return;
        if (result.errorCode) {
          Alert.show({
            title: '갤러리 오류',
            message: result.errorMessage || '알 수 없는 오류',
          });
          return;
        }

        if (result.assets && result.assets.length > 0) {
          const newImages: UploadImageFile[] = [];

          for (const asset of result.assets) {
            if (!asset.uri) continue;

            try {
              const compressed = await ImageCompressor.compress(asset.uri, {
                compressionMethod: 'auto',
                maxWidth: 1920,
                maxHeight: 1920,
                quality: 0.8,
              });

              newImages.push({
                uri: compressed,
                type: asset.type || 'image/jpeg',
                name: generateImageFilename(),
              });
            } catch (err) {
              console.error('Image compression failed:', err);
              Alert.show({
                title: '이미지 처리 실패',
                message: '이미지 처리 중 오류가 발생했습니다.',
              });
            }
          }

          setPhotoURIs(prev => [...prev, ...newImages]);
        }
      } catch (err) {
        console.error('Image picker error:', err);
        Alert.show({
          title: '이미지 선택 실패',
          message: '이미지를 불러올 수 없습니다.',
        });
      }
    });
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

      // 3. Build photoOrders for existing photos (based on current order)
      const photoOrders = existingPhotos.map((photo, index) => ({
        photoId: photo.photoId!,
        sortOrder: index,
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
          onError: () => {
            Alert.show({
              title: '수정 실패',
              message: '포트폴리오 수정에 실패했습니다.',
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
        onError: () => {
          Alert.show({
            title: '등록 실패',
            message: '포트폴리오 등록에 실패했습니다.',
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
      onPressBack={handlePressBack}
      onPressSubmit={handleSubmitForm}
      isSubmitDisabled={!isValid || isPending}
      isEditMode={isEditMode}
      navigation={navigation}
    />
  );
}
