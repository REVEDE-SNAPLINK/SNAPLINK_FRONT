import { useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigation } from '@react-navigation/native';
import PortfolioFormView, { PortfolioFormData } from './PortfolioFormView';
import { MainNavigationProp } from '@/types/navigation';
import { useCreatePortfolioMutation } from '@/mutations/photographers';
import { Alert, requestPermission } from '@/components/theme';
import { launchImageLibrary, ImagePickerResponse } from 'react-native-image-picker';
import { Image as ImageCompressor } from 'react-native-compressor';
import { generateImageFilename } from '@/utils/format';
import { UploadImageFile } from '@/api/photographers';
import { hasForbiddenWords } from '@/utils/hasForbiddenWords';

export default function PortfolioFormContainer() {
  const navigation = useNavigation<MainNavigationProp>();
  const { mutate: uploadPortfolio, isPending } = useCreatePortfolioMutation();

  const [photoURIs, setPhotoURIs] = useState<UploadImageFile[]>([]);

  const { control, handleSubmit, watch } = useForm<PortfolioFormData>({
    defaultValues: {
      portfolioTitle: '',
      portfolioDescription: '',
      portfolioIsLinked: false,
    },
    mode: 'onChange',
  });

  const watchedTitle = watch('portfolioTitle');
  const watchedDescription = watch('portfolioDescription');

  const isValid = photoURIs.length > 0 && watchedTitle.trim().length > 0;

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

    if (hasForbiddenWords(data.portfolioTitle) || hasForbiddenWords(data.portfolioDescription)) {
      Alert.show({
        title: '부적절한 단어 포함',
        message: '제목 또는 내용에 부적절한 단어가 포함되어 있습니다.',
      });
      return;
    }

    uploadPortfolio(
      {
        title: data.portfolioTitle,
        content: data.portfolioDescription || '',
        images: photoURIs,
        isLinked: data.portfolioIsLinked,
      },
      {
        onSuccess: () => {
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
    />
  );
}
