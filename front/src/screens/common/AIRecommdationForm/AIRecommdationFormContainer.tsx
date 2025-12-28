import AIRecommdationFormView from '@/screens/common/AIRecommdationForm/AIRecommdationFormView.tsx';
import { useState } from 'react';
import { UploadImageFile } from '@/api/photographers.ts';
import { useNavigation } from '@react-navigation/native';
import { MainNavigationProp } from '@/types/navigation.ts';

export default function AIRecommdationFormContainer() {
  const navigation = useNavigation<MainNavigationProp>();

  const [images, setImages] = useState<UploadImageFile[]>([]);
  const [checkedImages, setCheckedImages] = useState<boolean[]>([]);
  const [prompt, setPrompt] = useState<string>('');

  const handlePressBack = () => navigation.goBack();

  const handlePressDeleteImages = () => {
    const newImages = [];
    for (let i = 0; i < checkedImages.length; i++) {
      if (!checkedImages[i]) {
        newImages.push(images[i]);
      }
    }
    setImages(newImages);
    setCheckedImages([...Array(newImages.length).fill(false)]);
  }

  const handlePressSubmit = () => {
    navigation.navigate('AIRecommdationResult', { prompt, resultCount: 3 });
  }

  return (
    <AIRecommdationFormView
      onPressBack={handlePressBack}
      images={images}
      setImages={setImages}
      checkedImages={checkedImages}
      setCheckedImages={setCheckedImages}
      prompt={prompt}
      setPrompt={setPrompt}
      onPressDeleteImages={handlePressDeleteImages}
      onPressSubmit={handlePressSubmit}
    />
  )
}