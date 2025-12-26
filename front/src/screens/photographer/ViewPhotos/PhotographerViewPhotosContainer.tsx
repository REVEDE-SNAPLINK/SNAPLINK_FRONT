import { useState } from 'react';
import { pick, types } from '@react-native-documents/picker';
import PhotographerViewPhotosView from '@/screens/photographer/ViewPhotos/PhotographerViewPhotosView.tsx';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { Alert } from '@/components/theme';
import { useReservationPhotosQuery } from '@/queries/reservations.ts';
import { useUploadReservationZipMutation, useDeleteReservationPhotosMutation } from '@/mutations/reservations.ts';
import { MainNavigationProp, MainStackParamList } from '@/types/navigation.ts';

export default function PhotographerViewPhotosContainer() {
  const navigation = useNavigation<MainNavigationProp>();
  const route = useRoute<RouteProp<MainStackParamList, 'ViewPhotos'>>();
  const { reservationId } = route.params;

  const [selectedPhotoIds, setSelectedPhotoIds] = useState<number[]>([]);

  const { data, isLoading } = useReservationPhotosQuery(reservationId);
  const { mutateAsync: uploadZip } = useUploadReservationZipMutation();
  const { mutateAsync: deletePhotos } = useDeleteReservationPhotosMutation();

  const handlePressBack = () => navigation.goBack();

  const handleTogglePhotoSelection = (photoId: number) => {
    setSelectedPhotoIds((prev) => {
      if (prev.includes(photoId)) {
        return prev.filter((id) => id !== photoId);
      } else {
        return [...prev, photoId];
      }
    });
  };

  const handleUploadPhotos = async () => {
    try {
      const results = await pick({
        type: [types.zip, 'application/zip'],
        allowMultiSelection: false,
      });
      const file = results[0];

      if (!file || !file.uri || !file.name || !file.type) return;

      const zipFile = {
        uri: file.uri,
        name: file.name,
        type: file.type,
      };

      await uploadZip({ reservationId, zipFile });
    } catch (err) {
      Alert.show({ title: '오류', message: '파일 선택에 실패했습니다.' });
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
            await deletePhotos({ reservationId, photoIds: selectedPhotoIds });
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
