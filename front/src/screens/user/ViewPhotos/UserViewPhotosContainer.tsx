import { useState, useMemo, useEffect } from 'react';
import UserViewPhotosView from '@/screens/user/ViewPhotos/UserViewPhotosView.tsx';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { Alert } from '@/components/theme';
import { MainNavigationProp, MainStackParamList } from '@/types/navigation.ts';
import { useBookingPhotosQuery } from '@/queries/bookings.ts';
import RNBlobUtil from 'react-native-blob-util';
import { Platform } from 'react-native';
import { CLOUDFRONT_BASE_URL } from '@/config/api.ts';

export default function UserViewPhotosContainer() {
  const navigation = useNavigation<MainNavigationProp>();
  const route = useRoute<RouteProp<MainStackParamList, 'ViewPhotos'>>();
  const { bookingId } = route.params;

  const { data, isLoading } = useBookingPhotosQuery(bookingId);

  const [checkedImages, setCheckedImages] = useState<boolean[]>([]);

  // Initialize checkedImages when data loads
  useEffect(() => {
    if (data?.photos) {
      setCheckedImages(new Array(data.photos.length).fill(false));
    }
  }, [data?.photos, data?.photos?.length]);

  const handlePressBack = () => navigation.goBack();

  const handleCheckedImages = (index: number) => {
    setCheckedImages(prev => {
      const newChecked = [...prev];
      newChecked[index] = !newChecked[index];
      return newChecked;
    });
  };

  // 체크된 사진들의 인덱스
  const selectedIndices = useMemo(() => {
    return checkedImages.map((checked, index) => (checked ? index : -1)).filter((i) => i !== -1);
  }, [checkedImages]);

  const handleDownloadZip = async () => {
    const zip = data?.zip;
    if (!zip) {
      Alert.show({
        title: '다운로드 실패',
        message: 'ZIP 파일을 찾을 수 없습니다.',
      });
      return;
    }

    Alert.show({
      title: '다운로드 시작',
      message: '원본/보정본 모음.zip 다운로드를 시작하시겠습니까?',
      buttons: [
        {
          text: '취소',
          onPress: () => {},
        },
        {
          text: '확인',
          onPress: async () => {
            try {
              const { fs } = RNBlobUtil;
              const downloads = Platform.OS === 'ios' ? fs.dirs.DocumentDir : fs.dirs.DownloadDir;
              const fileName = `reservation_${bookingId}_photos.zip`;
              const filePath = `${downloads}/${fileName}`;

              const url = CLOUDFRONT_BASE_URL + zip.url;

              if (Platform.OS === 'ios') {
                // iOS: 다운로드 후 파일 공유
                const response = await RNBlobUtil.config({
                  fileCache: true,
                  path: filePath,
                }).fetch('GET', url);

                const res = await RNBlobUtil
                  .config({ fileCache: true, path: filePath })
                  .fetch('GET', url);

                console.log('status', res.info().status);
                console.log('headers', res.info().headers);
                console.log('path', res.path());

                await RNBlobUtil.ios.openDocument(response.path());

              } else {
                // Android: 다운로드 매니저 사용
                await RNBlobUtil.config({
                  fileCache: true,
                  addAndroidDownloads: {
                    useDownloadManager: true,
                    notification: true,
                    title: fileName,
                    description: '사진 ZIP 파일 다운로드',
                    path: filePath,
                  },
                }).fetch('GET', url);

              }
            } catch (error) {
              console.error('ZIP download error:', error);
              Alert.show({
                title: '다운로드 실패',
                message: 'ZIP 파일 다운로드 중 오류가 발생했습니다.',
              });
            }
          },
        },
      ],
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

    // 선택된 사진이 없으면 전체 다운로드
    const photosToDownload =
      selectedIndices.length === 0
        ? data.photos
        : selectedIndices.map((index) => data.photos[index]);

    Alert.show({
      title: '다운로드 시작',
      message: `${photosToDownload.length}개의 사진 다운로드를 시작하시겠습니까?`,
      buttons: [
        {
          text: '취소',
          onPress: () => {},
        },
        {
          text: '확인',
          onPress: async () => {
            try {
              const { fs } = RNBlobUtil;
              const downloads = Platform.OS === 'ios' ? fs.dirs.DocumentDir : fs.dirs.DownloadDir;

              if (Platform.OS === 'ios') {
                // iOS: 개별 다운로드 후 공유
                const downloadPromises = photosToDownload.map(async (photo) => {
                  const ext = photo.url.split('.').pop() || 'jpg';
                  const fileName = `reservation_${bookingId}_photo_${photo.sortOrder}.${ext}`;
                  const filePath = `${downloads}/${fileName}`;

                  const response = await RNBlobUtil.config({
                    fileCache: true,
                    path: filePath,
                  }).fetch('GET', CLOUDFRONT_BASE_URL+photo.url);

                  return response.path();
                });

                const paths = await Promise.all(downloadPromises);

                // 첫 번째 사진만 공유 다이얼로그 열기 (여러 개는 복잡함)
                if (paths.length > 0) {
                  await RNBlobUtil.ios.openDocument(paths[0]);
                }

              } else {
                // Android: 다운로드 매니저로 개별 다운로드
                const downloadPromises = photosToDownload.map(async (photo) => {
                  const ext = photo.url.split('.').pop() || 'jpg';
                  const fileName = `reservation_${bookingId}_photo_${photo.sortOrder}.${ext}`;
                  const filePath = `${downloads}/${fileName}`;

                  return RNBlobUtil.config({
                    fileCache: true,
                    addAndroidDownloads: {
                      useDownloadManager: true,
                      notification: true,
                      title: fileName,
                      description: '사진 다운로드',
                      path: filePath,
                    },
                  }).fetch('GET', CLOUDFRONT_BASE_URL+photo.url);
                });

                await Promise.all(downloadPromises);

              }
            } catch (error) {
              console.error('Photos download error:', error);
              Alert.show({
                title: '다운로드 실패',
                message: '사진 다운로드 중 오류가 발생했습니다.',
              });
            }
          },
        },
      ],
    });
  };

  const imageURIs = useMemo(() => {
    if (!data?.photos) return [];
    return data.photos.map((photo) => photo.url);
  }, [data?.photos]);

  return (
    <UserViewPhotosView
      onPressBack={handlePressBack}
      imageURIs={imageURIs}
      checkedImages={checkedImages}
      setCheckedImages={handleCheckedImages}
      onDownloadZip={handleDownloadZip}
      onDownloadPhotos={handleDownloadPhotos}
      isLoading={isLoading}
      navigation={navigation}
    />
  );
}