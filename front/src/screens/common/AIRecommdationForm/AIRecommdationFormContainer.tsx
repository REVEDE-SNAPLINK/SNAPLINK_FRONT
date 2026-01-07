import AIRecommdationFormView from '@/screens/common/AIRecommdationForm/AIRecommdationFormView.tsx';
import { useState, useCallback, useEffect } from 'react';
import { UploadImageFile } from '@/api/photographers.ts';
import { useNavigation } from '@react-navigation/native';
import { MainNavigationProp } from '@/types/navigation.ts';
import analytics from '@react-native-firebase/analytics';
import { useAuthStore } from '@/store/authStore.ts';

export default function AIRecommdationFormContainer() {
  const navigation = useNavigation<MainNavigationProp>();

  const [images, setImages] = useState<UploadImageFile[]>([]);
  const [prompt, setPrompt] = useState<string>('');

  const { userId, userType } = useAuthStore();

  useEffect(() => {
    // Log ai_recommendation_start when the form is opened
    analytics().logEvent('ai_recommendation_start', {
      user_id: userId,
      user_type: userType,
      screen: 'AIRecommdationForm',
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const handlePressBack = () => navigation.goBack();

  const handleRemoveImage = useCallback((index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const handleAddImages = useCallback((newImages: UploadImageFile[]) => {
    setImages((prev) => [...prev, ...newImages]);
    analytics().logEvent('ai_recommendation_input', {
      user_id: userId,
      user_type: userType,
      added_image_count: newImages.length,
      total_image_count: images.length + newImages.length,
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, userType, images.length]);

  const handlePressSubmit = () => {
    navigation.navigate('AIRecommdationResult', { prompt, resultCount: 3 });
  };

  return (
    <AIRecommdationFormView
      onPressBack={handlePressBack}
      images={images}
      onRemoveImage={handleRemoveImage}
      onAddImages={handleAddImages}
      prompt={prompt}
      setPrompt={setPrompt}
      onPressSubmit={handlePressSubmit}
      navigation={navigation}
    />
  );
}