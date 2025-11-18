import ViewPhotosView, { Photo } from '@/screens/user/ViewPhotos/ViewPhotosView.tsx';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { MainNavigationProp, MainStackParamList } from '@/types/navigation.ts';
import { useQuery } from '@tanstack/react-query';
import { Alert, Platform } from 'react-native';
// import RNFetchBlob from 'rn-fetch-blob';

/**
 * Response type for booking photos
 */
interface BookingPhotosResponse {
  bookingId: string;
  photos: Photo[];
  zipUrl?: string; // URL for downloading all photos as zip
}

/**
 * Get photos for a booking
 * TODO: Replace with actual API call when backend is ready
 *
 * API endpoint will be: GET /api/bookings/:bookingId/photos
 */
async function getBookingPhotos(bookingId: string): Promise<BookingPhotosResponse> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 800));

  // TODO: Replace with actual API call
  // const response = await fetch(`/api/bookings/${bookingId}/photos`);
  // const data = await response.json();
  // return data;

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

export default function ViewPhotosContainer() {
  const navigation = useNavigation<MainNavigationProp>();
  const route = useRoute<RouteProp<MainStackParamList, 'ViewPhotos'>>();
  const { id: bookingId } = route.params;

  // Fetch booking photos
  const { data, isLoading } = useQuery({
    queryKey: ['bookingPhotos', bookingId],
    queryFn: () => getBookingPhotos(bookingId),
  });

  const handlePressBack = () => navigation.goBack();

  const handleDownloadZip = async () => {
    if (!data?.zipUrl) {
      Alert.alert('다운로드 실패', 'ZIP 파일을 찾을 수 없습니다.');
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

    Alert.alert('다운로드 시작', '원본/보정본 모음.zip 다운로드를 시작합니다.');
  };

  const handleDownloadAll = async () => {
    if (!data?.photos || data.photos.length === 0) {
      Alert.alert('다운로드 실패', '다운로드할 사진이 없습니다.');
      return;
    }

    // TODO: Implement actual download functionality for all photos
    // const downloadPromises = data.photos.map(async (photo, index) => {
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

    Alert.alert(
      '다운로드 시작',
      `${data.photos.length}개의 사진 다운로드를 시작합니다.`
    );
  };

  return (
    <ViewPhotosView
      onPressBack={handlePressBack}
      photos={data?.photos || []}
      onDownloadZip={handleDownloadZip}
      onDownloadAll={handleDownloadAll}
      isLoading={isLoading}
    />
  );
}