import { useState, useEffect } from 'react';
import analytics from '@react-native-firebase/analytics';
import { pick, types } from '@react-native-documents/picker';
import { launchImageLibrary } from 'react-native-image-picker';
import PhotographerViewPhotosView from '@/screens/photographer/ViewPhotos/PhotographerViewPhotosView.tsx';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { Alert } from '@/components/theme';
import { useBookingPhotosQuery } from '@/queries/bookings.ts';
import {
  useUploadBookingZipMutation,
  useUpdateBookingPhotosMutation,
} from '@/mutations/bookings.ts';
import { MainNavigationProp, MainStackParamList } from '@/types/navigation.ts';

export default function PhotographerViewPhotosContainer() {
  const navigation = useNavigation<MainNavigationProp>();
  const route = useRoute<RouteProp<MainStackParamList, 'ViewPhotos'>>();
  const { bookingId } = route.params;

  const [checkedImages, setCheckedImages] = useState<boolean[]>([]);

  const { data, isLoading, refetch } = useBookingPhotosQuery(bookingId);
  const { mutateAsync: uploadZip, isPending: isUploadPending } = useUploadBookingZipMutation();
  const { mutateAsync: updatePhotos, isPending: isUpdatePending } = useUpdateBookingPhotosMutation(bookingId);

  // Sync checkedImages with photos data
  useEffect(() => {
    if (data?.photos) {
      setCheckedImages(new Array(data.photos.length).fill(false));
    }
  }, [data?.photos, data?.photos.length]);

  const handlePressBack = () => navigation.goBack();

  const handleCheckedImages = (index: number) => {
    console.log(checkedImages, index);
    setCheckedImages(prev => {
      const newChecked = [...prev];
      newChecked[index] = !newChecked[index];
      return newChecked;
    });
  }

  const handleUploadPhotos = async () => {
    const hasPhotos = data?.photos && data.photos.length > 0;

    // 사진이 이미 있는 경우: 개별 이미지 추가
    if (hasPhotos) {
      try {
        const result = await launchImageLibrary({
          mediaType: 'photo',
          selectionLimit: 0, // 0 = unlimited
          quality: 1,
        });

        if (result.didCancel || !result.assets || result.assets.length === 0) return;

        const newPhotos = result.assets
          .filter(asset => asset.uri && asset.fileName && asset.type)
          .map(asset => ({
            uri: asset.uri!,
            name: asset.fileName!,
            type: asset.type!,
          }));

        if (newPhotos.length === 0) return;

        await updatePhotos({ deletePhotoIds: [], newPhotos });
        await refetch();
        analytics().logEvent('photographer_booking_photos_added', {
          user_type: 'photographer',
          bookingId,
          count: newPhotos.length,
        });
        Alert.show({
          title: '업로드 완료',
          message: `${newPhotos.length}개의 사진이 추가되었습니다.`
        });
      } catch (err) {
        Alert.show({ title: '오류', message: '이미지 선택에 실패했습니다.' });
      }
    }
    // 사진이 없는 경우: ZIP 업로드
    else {
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

        uploadZip({ bookingId: bookingId, zipFile }, {
          onSuccess: () => {
            analytics().logEvent('photographer_booking_photos_uploaded', {
              user_type: 'photographer',
              bookingId,
              file_name: zipFile.name,
            });
            refetch().finally(() => {
              Alert.show({ title: '업로드 완료', message: '촬영 사진 업로드가 완료되었습니다.' })
            });
          },
          onError: () => {
            Alert.show({ title: '업로드 실패', message: '네트워크를 확인해보세요.' })
          }
        });
      } catch (err) {
        Alert.show({ title: '오류', message: '파일 선택에 실패했습니다.' });
      }
    }
  };

  const handleDeletePhotos = async () => {
    // Check if any image is selected
    const hasSelectedImages = checkedImages.some(checked => checked);

    if (!hasSelectedImages) {
      Alert.show({
        title: '삭제 실패',
        message: '삭제할 사진을 선택해주세요.',
      });
      return;
    }

    const deletePhotoIds = data?.photos.filter((_, i) => checkedImages[i]).map((v) => v.id) || [];

    if (deletePhotoIds.length === 0) {
      Alert.show({
        title: '삭제 실패',
        message: '삭제할 사진을 선택해주세요.',
      });
      return;
    }

    Alert.show({
      title: '사진 삭제',
      message: `선택한 ${deletePhotoIds.length}개의 사진을 삭제하시겠습니까?`,
      buttons: [
        { text: '취소', type: 'cancel', onPress: () => {} },
        {
          text: '삭제',
          onPress: async () => {
            try {
              await updatePhotos({ deletePhotoIds, newPhotos: [] });
              await refetch();
              analytics().logEvent('photographer_booking_photos_deleted', {
                user_type: 'photographer',
                bookingId,
                count: deletePhotoIds.length,
                photo_ids: deletePhotoIds,
              });
              Alert.show({
                title: '삭제 완료',
                message: '선택한 사진이 삭제되었습니다.',
              });
            } catch (error) {
              Alert.show({
                title: '삭제 실패',
                message: '사진 삭제에 실패했습니다.',
              });
            }
          },
        },
      ],
    });
  };

  const handleAddImages = async () => {
    try {
      const result = await launchImageLibrary({
        mediaType: 'photo',
        selectionLimit: 0, // 0 = unlimited
        quality: 1,
      });

      if (result.didCancel || !result.assets || result.assets.length === 0) return;

      const newPhotos = result.assets
        .filter(asset => asset.uri && asset.fileName && asset.type)
        .map(asset => ({
          uri: asset.uri!,
          name: asset.fileName!,
          type: asset.type!,
        }));

      if (newPhotos.length === 0) return;

      await updatePhotos({ deletePhotoIds: [], newPhotos });
      await refetch();
      analytics().logEvent('photographer_booking_photos_added', {
        user_type: 'photographer',
        bookingId,
        count: newPhotos.length,
      });
      Alert.show({
        title: '업로드 완료',
        message: `${newPhotos.length}개의 사진이 추가되었습니다.`
      });
    } catch (err) {
      Alert.show({ title: '오류', message: '이미지 선택에 실패했습니다.' });
    }
  };

  return (
    <PhotographerViewPhotosView
      onPressBack={handlePressBack}
      imageURIs={data?.photos.map((v) => v.url) || []}
      checkedImages={checkedImages}
      setCheckedImages={handleCheckedImages}
      onUploadPhotos={handleUploadPhotos}
      onDeletePhotos={handleDeletePhotos}
      onAddImages={handleAddImages}
      isLoading={isLoading || isUploadPending || isUpdatePending}
      navigation={navigation}
    />
  );
}
