import { useState } from 'react';
import UserViewPhotosView from '@/screens/user/ViewPhotos/UserViewPhotosView.tsx';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { UserMainNavigationProp, UserMainStackParamList } from '@/types/userNavigation.ts';
import { useQuery } from '@tanstack/react-query';
import { Alert } from '@/components/theme';
import { Photo, BookingPhotosResponse } from '@/types/booking';

/**
 * Get photos for a booking
 * TODO: Replace with actual API call when backend is ready
 *
 * API endpoint will be: GET /api/bookings/:bookingId/photos
 */
async function getBookingPhotos(bookingId: string): Promise<BookingPhotosResponse> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 800));

  // Dummy data - Generate 12 photos (6 original + 6 edited)
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

export default function UserViewPhotosContainer() {
  const navigation = useNavigation<UserMainNavigationProp>();
  const route = useRoute<RouteProp<UserMainStackParamList, 'ViewPhotos'>>();
  const { id: bookingId } = route.params;

  const [selectedPhotoIds, setSelectedPhotoIds] = useState<string[]>([]);

  // Fetch booking photos
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

  const handleDownloadZip = async () => {
    if (!data?.zipUrl) {
      Alert.show({
        title: '다운로드 실패',
        message: 'ZIP 파일을 찾을 수 없습니다.',
      });
      return;
    }

    // TODO: Implement actual download functionality
    // if (Platform.OS === 'ios') {
    //   RNFetchBlob.ios.openDocument(data.zipUrl);
    // } else {
    //   const { config, fs } = RNFetchBlob;
    //   const downloads = fs.dirs.DownloadDir;
    //   config({
    //     fileCache: true,
    //     addAndroidDownloads: {
    //       useDownloadManager: true,
    //       notification: true,
    //       path: `${downloads}/photos_${bookingId}.zip`,
    //     },
    //   }).fetch('GET', data.zipUrl);
    // }

    Alert.show({
      title: '다운로드 시작',
      message: '원본/보정본 모음.zip 다운로드를 시작합니다.',
    });
  };

  const handleDownloadPhotos = async () => {
    if (!data?.photos || data.photos.length === 0) {
      Alert.show({
        title: '다운로드 실패',
        message: '다운로드할 사진이 없습니다.',
      });
      return;
    }

    const photosToDownload = selectedPhotoIds.length === 0 || selectedPhotoIds.length === data.photos.length
      ? data.photos
      : data.photos.filter((photo) => selectedPhotoIds.includes(photo.id));

    // TODO: Implement actual download functionality for selected photos
    // const downloadPromises = photosToDownload.map(async (photo, index) => {
    //   const { config, fs } = RNFetchBlob;
    //   const downloads = fs.dirs.DownloadDir;
    //   return config({
    //     fileCache: true,
    //     addAndroidDownloads: {
    //       useDownloadManager: true,
    //       notification: true,
    //       path: `${downloads}/photo_${bookingId}_${index + 1}.jpg`,
    //     },
    //   }).fetch('GET', photo.url);
    // });
    // await Promise.all(downloadPromises);

    Alert.show({
      title: '다운로드 시작',
      message: `${photosToDownload.length}개의 사진 다운로드를 시작합니다.`,
    });
  };

  return (
    <UserViewPhotosView
      onPressBack={handlePressBack}
      photos={data?.photos || []}
      selectedPhotoIds={selectedPhotoIds}
      onTogglePhotoSelection={handleTogglePhotoSelection}
      onDownloadZip={handleDownloadZip}
      onDownloadPhotos={handleDownloadPhotos}
      isLoading={isLoading}
    />
  );
}