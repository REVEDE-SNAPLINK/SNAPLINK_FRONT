import AIRecommdationFormView from '@/screens/common/AIRecommdationForm/AIRecommdationFormView.tsx';
import { useState, useCallback } from 'react';
import { UploadImageFile } from '@/api/photographers.ts';
import { useNavigation } from '@react-navigation/native';
import { MainNavigationProp } from '@/types/navigation.ts';

export default function AIRecommdationFormContainer() {
  const navigation = useNavigation<MainNavigationProp>();

  const [images, setImages] = useState<UploadImageFile[]>([]);
  const [prompt, setPrompt] = useState<string>('');

  const handlePressBack = () => navigation.goBack();

  const handleRemoveImage = useCallback((index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const handleAddImages = useCallback((newImages: UploadImageFile[]) => {
    setImages((prev) => [...prev, ...newImages]);
  }, []);

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
    />
  );
}