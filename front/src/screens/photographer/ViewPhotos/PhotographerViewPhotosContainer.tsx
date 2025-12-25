import { useState } from 'react';
import PhotographerViewPhotosView from '@/screens/photographer/ViewPhotos/PhotographerViewPhotosView.tsx';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { PhotographerMainNavigationProp, PhotographerMainStackParamList } from '@/types/photographerNavigation.ts';
import { useQuery } from '@tanstack/react-query';
import { Alert } from '@/components/theme';
import { Photo, BookingPhotosResponse } from '@/types/booking';
import { launchImageLibrary, ImageLibraryOptions } from 'react-native-image-picker';

async function getBookingPhotos(bookingId: string): Promise<BookingPhotosResponse> {
  await new Promise((resolve) => setTimeout(resolve, 800));

  const photos: Photo[] = [];
  for (let i = 1; i <= 12; i++) {
    photos.push({
      id: `photo-${i}`,
      url: `https://picsum.photos/400/400?random=${i + 100}`,
      type: i % 2 === 0 ? 'edited' : 'original',
    });
  }

  return {
    bookingId,
    photos,
    zipUrl: `https://example.com/bookings/${bookingId}/photos.zip`,
  };
}

export default function PhotographerViewPhotosContainer() {
  const navigation = useNavigation<PhotographerMainNavigationProp>();
  const route = useRoute<RouteProp<PhotographerMainStackParamList, 'ViewPhotos'>>();
  const { id: bookingId } = route.params;

  const [selectedPhotoIds, setSelectedPhotoIds] = useState<string[]>([]);

  const { data, isLoading } = useQuery({
    queryKey: ['bookingPhotos', bookingId],
    queryFn: () => getBookingPhotos(bookingId),
  });

  const handlePressBack = () => navigation.goBack();

  const handleTogglePhotoSelection = (photoId: string) => {
    setSelectedPhotoIds((prev) => {
      if (prev.includes(photoId)) {
        return prev.filter((id) => id !== photoId);
      } else {
        return [...prev, photoId];
      }
    });
  };

  const handleUploadPhotos = async () => {
    const options: ImageLibraryOptions = {
      mediaType: 'photo',
      selectionLimit: 0, // 0 = unlimited
      quality: 0.8,
    };

    const result = await launchImageLibrary(options);

    if (result.didCancel) return;
    if (result.errorCode) {
      Alert.show({
        title: '오류',
        message: result.errorMessage || '사진 선택에 실패했습니다.',
      });
      return;
    }

    if (result.assets) {
      // TODO: Implement actual upload functionality
      Alert.show({
        title: '업로드 시작',
        message: `${result.assets.length}개의 사진 업로드를 시작합니다.`,
      });
    }
  };

  const handleDeletePhotos = async () => {
    if (selectedPhotoIds.length === 0) {
      Alert.show({
        title: '삭제 실패',
        message: '삭제할 사진을 선택해주세요.',
      });
      return;
    }

    Alert.show({
      title: '사진 삭제',
      message: `선택한 ${selectedPhotoIds.length}개의 사진을 삭제하시겠습니까?`,
      buttons: [
        { text: '취소', type: 'cancel', onPress: () => {} },
        {
          text: '삭제',
          onPress: async () => {
            // TODO: Implement actual delete functionality
            setSelectedPhotoIds([]);
            Alert.show({
              title: '삭제 완료',
              message: '선택한 사진이 삭제되었습니다.',
            });
          },
        },
      ],
    });
  };

  return (
    <PhotographerViewPhotosView
      onPressBack={handlePressBack}
      photos={data?.photos || []}
      selectedPhotoIds={selectedPhotoIds}
      onTogglePhotoSelection={handleTogglePhotoSelection}
      onUploadPhotos={handleUploadPhotos}
      onDeletePhotos={handleDeletePhotos}
      isLoading={isLoading}
    />
  );
}
