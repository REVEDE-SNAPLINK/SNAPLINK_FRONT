import AIRecommdationFormView from '@/screens/common/AIRecommdationForm/AIRecommdationFormView.tsx';
import { useState, useCallback, useEffect } from 'react';
import { UploadImageFile } from '@/api/photographers.ts';
import { useNavigation } from '@react-navigation/native';
import { MainNavigationProp } from '@/types/navigation.ts';
import { safeLogEvent } from '@/utils/analytics.ts';
import { Alert } from '@/components/ui';
import { requestPermission } from '@/utils/permissions.ts';
import { ImageLibraryOptions, ImagePickerResponse, launchImageLibrary } from 'react-native-image-picker';
import { generateImageFilename, normalizeImageMime } from '@/utils/format.ts';

export default function AIRecommdationFormContainer() {
  const navigation = useNavigation<MainNavigationProp>();

  const [image, setImage] = useState<UploadImageFile | null>(null);
  const [prompt, setPrompt] = useState<string>('');

  useEffect(() => {
    // Log ai_recommendation_start when the form is opened
    safeLogEvent('ai_recommendation_start');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleRemoveImage = useCallback(() => {
    setImage(null);
  }, []);

  const handlePressSubmit = () => {
    navigation.navigate('AIRecommdationResult', {
      prompt,
      resultCount: 3,
      ...(image ? { imageUri: image.uri, imageName: image.name, imageType: image.type } : {})
    });
  };

  const handleUploadImage = useCallback(() => {
    requestPermission(
      'photo',
      async () => {
        const options: ImageLibraryOptions = {
          mediaType: 'photo',
          selectionLimit: 1,
          quality: 0.8,
          includeExtra: true,
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
        if (response.assets && response.assets[0] && response.assets[0].uri && response.assets[0].fileName && response.assets[0].type) {
          setImage({
            uri: response.assets[0].uri!,
            name: generateImageFilename(response.assets[0].type, 'image'),
            type: normalizeImageMime(response.assets[0].type!),
          })
        }
      }
    );
  }, []);

  const isFormValid = image !== null;

  return (
    <AIRecommdationFormView
      image={image}
      onRemoveImage={handleRemoveImage}
      onUploadImage={handleUploadImage}
      prompt={prompt}
      setPrompt={setPrompt}
      onPressSubmit={handlePressSubmit}
      isFormValid={isFormValid}
      navigation={navigation}
    />
  );
}