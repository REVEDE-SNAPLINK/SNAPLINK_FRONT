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
import JSZip from 'jszip';
import RNFS from 'react-native-fs';
import { Platform } from 'react-native';

export default function PhotographerViewPhotosContainer() {
  const navigation = useNavigation<MainNavigationProp>();
  const route = useRoute<RouteProp<MainStackParamList, 'ViewPhotos'>>();
  const { bookingId } = route.params;

  const [checkedImages, setCheckedImages] = useState<boolean[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const { data, isLoading, refetch } = useBookingPhotosQuery(bookingId);
  const { mutateAsync: uploadZip, isPending: isUploadPending } = useUploadBookingZipMutation();
  const { mutateAsync: updatePhotos, isPending: isUpdatePending } = useUpdateBookingPhotosMutation(bookingId);

  useEffect(() => {
    if (data?.photos) {
      setCheckedImages(new Array(data.photos.length).fill(false));
    }
  }, [data?.photos, data?.photos.length]);

  const handlePressBack = () => navigation.goBack();

  const handleCheckedImages = (index: number) => {
    setCheckedImages(prev => {
      const newChecked = [...prev];
      newChecked[index] = !newChecked[index];
      return newChecked;
    });
  }

  /**
   * 1. ZIP 선택 -> 압축 해제 -> 개별 이미지 업로드 (추가 업로드용)
   */
  /**
   * 1. ZIP 선택 -> JSZip으로 메모리 로드 -> 실제 이미지만 추출 -> 개별 이미지 업로드
   */
  const handleZipAndUnzipUpload = async () => {
    try {
      const results = await pick({ type: [types.zip, 'application/zip'] });
      const file = results[0];
      if (!file?.uri) return;

      setIsProcessing(true);

      // 1. ZIP 파일을 base64로 읽기
      const zipBase64 = await RNFS.readFile(file.uri, 'base64');
      const jszip = new JSZip();
      const contents = await jszip.loadAsync(zipBase64, { base64: true });

      const newPhotos = [];
      const imageExtensions = ['jpg', 'jpeg', 'png', 'heic'];

      // 2. 내부 파일들을 순회하며 이미지 추출
      for (const filename of Object.keys(contents.files)) {
        const zipEntry = contents.files[filename];
        const ext = filename.toLowerCase().split('.').pop() || '';

        // [핵심 필터링]
        // 1. 디렉토리가 아니어야 함
        // 2. 이미지 확장자여야 함
        // 3. __MACOSX 폴더 안에 있거나 ._ 로 시작하는 메타데이터 파일 제외
        const isImage = imageExtensions.includes(ext);
        const isMetaFile = filename.includes('__MACOSX') || filename.split('/').pop()?.startsWith('._');

        if (!zipEntry.dir && isImage && !isMetaFile) {
          const imgData = await zipEntry.async('base64');

          // 파일명에 경로(/)가 포함된 경우 파일 시스템 에러 방지를 위해 파일명만 추출
          const safeFileName = filename.split('/').pop() || `img_${Date.now()}.${ext}`;
          const tempPath = `${RNFS.TemporaryDirectoryPath}/${safeFileName}`;

          await RNFS.writeFile(tempPath, imgData, 'base64');

          newPhotos.push({
            uri: Platform.OS === 'android' ? `file://${tempPath}` : tempPath,
            name: safeFileName,
            type: `image/${ext === 'png' ? 'png' : 'jpeg'}`,
          });
        }
      }

      if (newPhotos.length === 0) {
        Alert.show({ title: '오류', message: '압축 파일 내에 유효한 이미지가 없습니다.' });
        return;
      }


      // 3. 서버 전송 (개별 이미지 업로드 mutation)
      await updatePhotos({ deletePhotoIds: [], newPhotos });

      // 임시 파일들 정리
      for (const photo of newPhotos) {
        const path = photo.uri.replace('file://', '');
        await RNFS.unlink(path).catch(() => {});
      }

      analytics().logEvent('photographer_photos_added_zip', {
        user_type: 'photographer',
        bookingId,
        count: newPhotos.length,
      });

      refetch().finally(() => {
        setIsProcessing(false);
        Alert.show({ title: '업로드 완료', message: `${newPhotos.length}개의 사진이 추가되었습니다.` });
      });
    } catch (err) {
      console.error(err);
      Alert.show({ title: '오류', message: '압축 해제 중 문제가 발생했습니다.' });
    }
  };

  /**
   * 2. 갤러리 선택 -> 개별 이미지 업로드 (추가 업로드용)
   */
  const handleGalleryUpload = async () => {
    try {
      const result = await launchImageLibrary({ mediaType: 'photo', selectionLimit: 0, quality: 1 });
      if (result.didCancel || !result.assets) return;

      setIsProcessing(true);

      const newPhotos = result.assets
        .filter(asset => asset.uri && asset.fileName)
        .map(asset => ({
          uri: asset.uri!,
          name: asset.fileName!,
          type: asset.type!,
        }));

      if (newPhotos.length === 0) return;

      await updatePhotos({ deletePhotoIds: [], newPhotos });

      // ✅ Analytics 복구
      analytics().logEvent('photographer_booking_photos_added', {
        user_type: 'photographer',
        bookingId,
        count: newPhotos.length,
      });

      refetch().finally(() => {
        setIsProcessing(false);
        Alert.show({ title: '업로드 완료', message: `${newPhotos.length}개의 사진이 추가되었습니다.` });
      })
    } catch (err) {
      Alert.show({ title: '오류', message: '이미지 선택에 실패했습니다.' });
    }
  };

  /**
   * 3. (최초 업로드용) 갤러리 선택 -> 원본 ZIP 압축 -> 통째로 업로드
   */
  const handleGalleryToOriginalZipUpload = async () => {
    try {
      const result = await launchImageLibrary({ mediaType: 'photo', selectionLimit: 0, quality: 1 });
      if (result.didCancel || !result.assets || result.assets.length === 0) return;

      setIsProcessing(true);

      const zip = new JSZip();
      const uniqueId = Date.now();

      // 1. 모든 이미지를 바이트(base64)로 읽어서 JSZip 객체에 추가
      for (let i = 0; i < result.assets.length; i++) {
        const asset = result.assets[i];
        if (!asset.uri) continue;

        // 파일 경로 최적화 (Android의 content:// 대응)
        const filePath = asset.uri;
        const base64Data = await RNFS.readFile(filePath, 'base64');

        const extension = asset.fileName?.split('.').pop() || 'jpg';
        const fileName = `image_${i}.${extension}`;

        // ZIP 구조 안에 파일 추가
        zip.file(fileName, base64Data, { base64: true });
      }

      // 2. [핵심] ZIP 생성 (여기서 모든 헤더와 사이즈를 표준으로 계산함)
      // 'blob'이나 'uint8array' 타입으로 생성하여 스트리밍 오류 차단
      const zipContent = await zip.generateAsync({
        type: 'base64',
        compression: 'STORE', // 압축하지 않고 묶기만 함 (가장 안전)
      });

      // 3. 생성된 ZIP 데이터를 임시 파일로 저장
      const finalZipPath = `${RNFS.TemporaryDirectoryPath}/standard_photos_${uniqueId}.zip`;
      await RNFS.writeFile(finalZipPath, zipContent, 'base64');

      // 4. 서버로 전송
      const zipFile = {
        uri: Platform.OS === 'android' ? `file://${finalZipPath}` : finalZipPath,
        name: `original_photos_${bookingId}.zip`,
        type: 'application/zip',
      };


      await uploadZip({ bookingId, zipFile });

      // 정리 작업
      await RNFS.unlink(finalZipPath).catch(() => {});

      refetch().finally(() => {
        setIsProcessing(false);
        Alert.show({ title: '업로드 완료', message: '사진 업로드를 완료했습니다.' });
      });

    } catch (err) {
      console.error('JSZip Error:', err);
      Alert.show({ title: '오류', message: '네트워크를 확인해보세요.' });
    }
  };

  /**
   * 4. ZIP 파일 직접 선택 업로드 (최초 업로드용)
   */
  const handleDirectZipUpload = async () => {
    try {
      const results = await pick({ type: [types.zip, 'application/zip'] });
      const file = results[0];
      if (!file?.uri) return;

      setIsProcessing(true);

      const zipFile = { uri: file.uri, name: file.name!, type: file.type! };

      await uploadZip({ bookingId, zipFile });

      // ✅ Analytics 복구
      analytics().logEvent('photographer_booking_photos_uploaded', {
        user_type: 'photographer',
        bookingId,
        file_name: zipFile.name,
      });

      refetch().finally(() => {
        setIsProcessing(false);
        Alert.show({ title: '업로드 완료', message: 'ZIP 파일 업로드가 완료되었습니다.' });
      });
    } catch (err) {
      Alert.show({ title: '오류', message: '파일 선택 실패' });
    }
  }

  const handleAddImages = async () => {
    const hasPhotos = data?.photos && data.photos.length > 0;

    if (hasPhotos) {
      Alert.show({
        title: '사진 추가 업로드',
        message: '이미지들이 압축된 ZIP 파일 또는 개별 이미지들을 선택하여 업로드 할 수 있습니다.',
        buttons: [
          { text: '이미지 선택', onPress: handleGalleryUpload },
          { text: 'ZIP 파일', onPress: handleZipAndUnzipUpload },
          { text: '취소', type: 'cancel', onPress: () => {} },
        ],
      });
    } else {
      Alert.show({
        title: '업로드 방식을 선택해주세요.',
        message: '이미지들이 압축된 ZIP 파일 또는 개별 이미지들을 선택하여 업로드 할 수 있습니다.',
        buttons: [
          { text: '이미지 선택', onPress: handleGalleryToOriginalZipUpload },
          { text: 'ZIP 파일', onPress: handleDirectZipUpload },
          { text: '취소', type: 'cancel', onPress: () => {} },
        ],
      });
    }
  };

  const handleDeletePhotos = async () => {
    const deletePhotoIds = data?.photos.filter((_, i) => checkedImages[i]).map((v) => v.id) || [];
    if (deletePhotoIds.length === 0) {
      Alert.show({ title: '알림', message: '삭제할 사진을 선택해주세요.' });
      return;
    }

    Alert.show({
      title: '사진 삭제',
      message: `${deletePhotoIds.length}개의 사진을 삭제하시겠습니까?`,
      buttons: [
        { text: '취소', type: 'cancel', onPress: () => {} },
        {
          text: '삭제',
          onPress: async () => {
            try {
              await updatePhotos({ deletePhotoIds, newPhotos: [] });
              await refetch();

              // ✅ Analytics 복구
              analytics().logEvent('photographer_booking_photos_deleted', {
                user_type: 'photographer',
                bookingId,
                count: deletePhotoIds.length,
              });

              Alert.show({ title: '삭제 완료', message: '선택한 사진이 삭제되었습니다.' });
            } catch (error) {
              Alert.show({ title: '삭제 실패', message: '사진 삭제에 실패했습니다.' });
            }
          },
        },
      ],
    });
  };

  return (
    <PhotographerViewPhotosView
      onPressBack={handlePressBack}
      imageURIs={data?.photos.map((v) => v.url) || []}
      checkedImages={checkedImages}
      setCheckedImages={handleCheckedImages}
      onCheckAllPhotos={() => setCheckedImages(Array(checkedImages.length).fill(true))}
      onDeletePhotos={handleDeletePhotos}
      onAddImages={handleAddImages}
      isLoading={isLoading || isUploadPending || isUpdatePending || isProcessing}
      navigation={navigation}
    />
  );
}