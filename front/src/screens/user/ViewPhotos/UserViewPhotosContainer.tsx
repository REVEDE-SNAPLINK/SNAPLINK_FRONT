import { useState, useMemo, useEffect } from 'react';
import UserViewPhotosView from '@/screens/user/ViewPhotos/UserViewPhotosView.tsx';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { Alert } from '@/components/ui';
import { MainNavigationProp, MainStackParamList } from '@/types/navigation.ts';
import { useBookingPhotosQuery } from '@/queries/bookings.ts';
import { BookingPhoto } from '@/api/bookings.ts';
import RNBlobUtil from 'react-native-blob-util';
import { Platform } from 'react-native';
import { CLOUDFRONT_BASE_URL } from '@/config/api.ts';
import { CameraRoll } from '@react-native-camera-roll/camera-roll';
import { safeLogEvent } from '@/utils/analytics.ts';
import JSZip from 'jszip';
import RNFS from 'react-native-fs';
import { showErrorAlert } from '@/utils/error';

export default function UserViewPhotosContainer() {
  const navigation = useNavigation<MainNavigationProp>();
  const route = useRoute<RouteProp<MainStackParamList, 'ViewPhotos'>>();
  const { bookingId } = route.params;

  const { data, isLoading } = useBookingPhotosQuery(bookingId);

  const [checkedImages, setCheckedImages] = useState<boolean[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

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

  const handleCheckAllPhotos = () => {
    const allChecked = checkedImages.every(v => v);
    setCheckedImages(Array(checkedImages.length).fill(!allChecked));
  };

  // 체크된 사진들의 인덱스
  const selectedIndices = useMemo(() => {
    return checkedImages.map((checked, index) => (checked ? index : -1)).filter((i) => i !== -1);
  }, [checkedImages]);

  const selectedCount = checkedImages.filter(v => v).length;

  /**
   * 원본/보정본.zip 다운로드 (방식 선택)
   */
  const handleDownloadZip = async () => {
    const zip = data?.zip;
    if (!zip) {
      Alert.show({
        title: '다운로드 실패',
        message: '원본/보정본.zip 파일이 없습니다.',
      });
      return;
    }

    Alert.show({
      title: '다운로드 방식 선택',
      message: '원본/보정본.zip을 어떻게 다운로드 하시겠습니까?',
      buttons: [
        { text: 'ZIP 파일', onPress: () => handleDownloadZipAsIs(zip.url) },
        { text: '압축 해제', onPress: () => handleDownloadZipExtracted(zip.url) },
        { text: '취소', type: 'cancel', onPress: () => { } },
      ],
    });
  };

  /**
   * 원본/보정본.zip을 ZIP 파일 그대로 다운로드
   */
  const handleDownloadZipAsIs = async (zipUrl: string) => {
    safeLogEvent('photo_zip_download_as_is', { booking_id: bookingId });
    setIsProcessing(true);

    try {
      const { fs } = RNBlobUtil;
      const downloads = Platform.OS === 'ios' ? fs.dirs.DocumentDir : fs.dirs.DownloadDir;
      const fileName = `reservation_${bookingId}_original.zip`;
      const filePath = `${downloads}/${fileName}`;
      const url = CLOUDFRONT_BASE_URL + zipUrl;

      if (Platform.OS === 'ios') {
        const response = await RNBlobUtil.config({
          fileCache: true,
          path: filePath,
        }).fetch('GET', url);

        await RNBlobUtil.ios.openDocument(response.path());
      } else {
        await RNBlobUtil.config({
          fileCache: true,
          addAndroidDownloads: {
            useDownloadManager: true,
            notification: true,
            title: fileName,
            description: '원본/보정본 ZIP 파일 다운로드',
            path: filePath,
          },
        }).fetch('GET', url);
        Alert.show({
          title: '다운로드 완료',
          message: `${fileName} 파일이 다운로드 폴더에 저장되었습니다.`,
        });
      }
    } catch (error) {
      console.error('ZIP download error:', error);
      showErrorAlert({
        title: '다운로드 실패',
        action: 'ZIP 파일 다운로드',
        error,
      });
    } finally {
      setIsProcessing(false);
    }
  };

  /**
   * 원본/보정본.zip을 압축 해제하여 개별 이미지로 다운로드
   */
  const handleDownloadZipExtracted = async (zipUrl: string) => {
    safeLogEvent('photo_zip_download_extracted', { booking_id: bookingId });
    setIsProcessing(true);

    try {
      const url = CLOUDFRONT_BASE_URL + zipUrl;
      const { fs } = RNBlobUtil;
      const tempDir = fs.dirs.CacheDir;

      // ZIP 파일 다운로드
      const response = await RNBlobUtil.config({ fileCache: true }).fetch('GET', url);
      const zipBase64 = await RNFS.readFile(response.path(), 'base64');

      // ZIP 압축 해제
      const jszip = new JSZip();
      const contents = await jszip.loadAsync(zipBase64, { base64: true });

      const imageExtensions = ['jpg', 'jpeg', 'png', 'heic', 'webp'];
      let savedCount = 0;

      for (const filename of Object.keys(contents.files)) {
        const zipEntry = contents.files[filename];
        const ext = filename.toLowerCase().split('.').pop() || '';

        const isImage = imageExtensions.includes(ext);
        const isMetaFile = filename.includes('__MACOSX') || filename.split('/').pop()?.startsWith('._');

        if (!zipEntry.dir && isImage && !isMetaFile) {
          const imgData = await zipEntry.async('base64');
          const safeFileName = filename.split('/').pop() || `img_${Date.now()}.${ext}`;
          const tempPath = `${tempDir}/original_${bookingId}_${safeFileName}`;

          await RNFS.writeFile(tempPath, imgData, 'base64');

          if (Platform.OS === 'ios') {
            // iOS: Photos 앱에 저장
            const fileUri = tempPath.startsWith('file://') ? tempPath : `file://${tempPath}`;
            await CameraRoll.save(fileUri, { type: 'photo' });
            // 임시 파일 삭제
            await RNFS.unlink(tempPath).catch(() => { });
          } else {
            // Android: 갤러리에서 인식되도록
            await RNBlobUtil.fs.scanFile([{ path: tempPath }]);
          }

          savedCount++;
        }
      }

      // 캐시 파일 삭제
      await RNFS.unlink(response.path()).catch(() => { });

      if (savedCount === 0) {
        Alert.show({
          title: '오류',
          message: 'ZIP 파일 내에 유효한 이미지가 없습니다.',
        });
        return;
      }

      Alert.show({
        title: '다운로드 완료',
        message: `${savedCount}개의 이미지가 사진 앨범에 저장되었습니다.`,
      });
    } catch (error) {
      console.error('ZIP extract error:', error);
      showErrorAlert({
        title: '다운로드 실패',
        action: 'ZIP 압축 해제',
        error,
      });
    } finally {
      setIsProcessing(false);
    }
  };

  /**
   * 보여지는 이미지 다운로드 (방식 선택)
   */
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
      title: '다운로드 방식 선택',
      message: `${photosToDownload.length}개의 사진을 어떻게 다운로드 하시겠습니까?`,
      buttons: [
        { text: 'ZIP으로 압축', onPress: () => handleDownloadPhotosAsZip(photosToDownload) },
        { text: '개별 이미지', onPress: () => handleDownloadPhotosIndividually(photosToDownload) },
        { text: '취소', type: 'cancel', onPress: () => { } },
      ],
    });
  };

  /**
   * 보여지는 이미지를 ZIP으로 압축하여 다운로드
   */
  const handleDownloadPhotosAsZip = async (photos: BookingPhoto[]) => {
    safeLogEvent('photo_download_as_zip', { booking_id: bookingId, count: photos.length });
    setIsProcessing(true);

    try {
      const zip = new JSZip();

      // 각 이미지를 다운로드하여 ZIP에 추가
      for (let i = 0; i < photos.length; i++) {
        const photo = photos[i];
        const url = CLOUDFRONT_BASE_URL + photo.url;
        const ext = photo.url.split('.').pop() || 'jpg';
        const fileName = `photo_${photo.sortOrder}.${ext}`;

        const response = await RNBlobUtil.config({ fileCache: true }).fetch('GET', url);
        const base64Data = await RNFS.readFile(response.path(), 'base64');
        zip.file(fileName, base64Data, { base64: true });

        // 캐시 파일 삭제
        await RNFS.unlink(response.path()).catch(() => { });
      }

      const zipContent = await zip.generateAsync({
        type: 'base64',
        compression: 'DEFLATE',
        compressionOptions: { level: 6 },
      });

      const uniqueId = Date.now();
      const { fs } = RNBlobUtil;
      const downloads = Platform.OS === 'ios' ? fs.dirs.DocumentDir : fs.dirs.DownloadDir;
      const zipFileName = `reservation_${bookingId}_photos_${uniqueId}.zip`;
      const zipPath = `${downloads}/${zipFileName}`;

      await RNFS.writeFile(zipPath, zipContent, 'base64');

      if (Platform.OS === 'ios') {
        await RNBlobUtil.ios.openDocument(zipPath);
      } else {
        // Android: 파일이 이미 다운로드 폴더에 있으므로 알림만
        Alert.show({
          title: '다운로드 완료',
          message: `${zipFileName} 파일이 다운로드 폴더에 저장되었습니다.`,
        });
      }
    } catch (error) {
      console.error('ZIP creation error:', error);
      showErrorAlert({
        title: '다운로드 실패',
        action: 'ZIP 파일 생성',
        error,
      });
    } finally {
      setIsProcessing(false);
    }
  };

  /**
   * 보여지는 이미지를 개별로 다운로드
   */
  const handleDownloadPhotosIndividually = async (photos: BookingPhoto[]) => {
    safeLogEvent('photo_download_individual', { booking_id: bookingId, count: photos.length });
    setIsProcessing(true);

    try {
      const { fs } = RNBlobUtil;
      const tempDir = fs.dirs.CacheDir;

      if (Platform.OS === 'ios') {
        // iOS: Photos 앱에 저장
        for (const photo of photos) {
          const ext = photo.url.split('.').pop() || 'jpg';
          const fileName = `reservation_${bookingId}_photo_${photo.sortOrder}.${ext}`;
          const tempPath = `${tempDir}/${fileName}`;

          const response = await RNBlobUtil.config({
            fileCache: true,
            path: tempPath,
          }).fetch('GET', CLOUDFRONT_BASE_URL + photo.url);

          const savedPath = response.path();
          const fileUri = savedPath.startsWith('file://') ? savedPath : `file://${savedPath}`;
          await CameraRoll.save(fileUri, { type: 'photo' });

          // 임시 파일 삭제
          await RNFS.unlink(savedPath).catch(() => { });
        }

        Alert.show({
          title: '다운로드 완료',
          message: `${photos.length}개의 이미지가 사진 앨범에 저장되었습니다.`,
        });
      } else {
        // Android: 다운로드 매니저로 개별 다운로드
        const downloads = fs.dirs.DownloadDir;
        const downloadPromises = photos.map(async (photo) => {
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
          }).fetch('GET', CLOUDFRONT_BASE_URL + photo.url);
        });

        await Promise.all(downloadPromises);

        Alert.show({
          title: '다운로드 완료',
          message: `${photos.length}개의 이미지가 다운로드 폴더에 저장되었습니다.`,
        });
      }
    } catch (error) {
      console.error('Photos download error:', error);
      showErrorAlert({
        title: '다운로드 실패',
        action: '사진 다운로드',
        error,
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const imageURIs = useMemo(() => {
    if (!data?.photos) return [];
    return data.photos.map((photo) => photo.url);
  }, [data?.photos]);

  const hasPhotos = imageURIs.length > 0;
  const allChecked = checkedImages.length > 0 && checkedImages.every(v => v);

  return (
    <UserViewPhotosView
      onPressBack={handlePressBack}
      imageURIs={imageURIs}
      checkedImages={checkedImages}
      setCheckedImages={handleCheckedImages}
      onCheckAllPhotos={handleCheckAllPhotos}
      onDownloadZip={handleDownloadZip}
      onDownloadPhotos={handleDownloadPhotos}
      isLoading={isLoading || isProcessing}
      isExpired={data?.expired ?? false}
      zipData={data?.zip || null}
      hasPhotos={hasPhotos}
      allChecked={allChecked}
      selectedCount={selectedCount}
      navigation={navigation}
    />
  );
}
