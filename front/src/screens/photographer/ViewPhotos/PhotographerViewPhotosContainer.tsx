import { useState, useEffect } from 'react';
import analytics from '@react-native-firebase/analytics';
import { pick, types } from '@react-native-documents/picker';
import { launchImageLibrary } from 'react-native-image-picker';
import PhotographerViewPhotosView from '@/screens/photographer/ViewPhotos/PhotographerViewPhotosView.tsx';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { Alert } from '@/components/theme';
import { useBookingDetailQuery, useBookingPhotosQuery } from '@/queries/bookings.ts';
import {
  useUploadBookingZipMutation,
  useUpdateBookingPhotosMutation,
} from '@/mutations/bookings.ts';
import { MainNavigationProp, MainStackParamList } from '@/types/navigation.ts';
import JSZip from 'jszip';
import RNFS from 'react-native-fs';
import { Platform } from 'react-native';
import { showErrorAlert } from '@/utils/error';

export default function PhotographerViewPhotosContainer() {
  const navigation = useNavigation<MainNavigationProp>();
  const route = useRoute<RouteProp<MainStackParamList, 'ViewPhotos'>>();
  const { bookingId } = route.params;

  const [checkedImages, setCheckedImages] = useState<boolean[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDelivered, setIsDelivered] = useState(false);

  const { data: bookingData } = useBookingDetailQuery(bookingId);
  const { data, isLoading, refetch } = useBookingPhotosQuery(bookingId);
  const { mutateAsync: uploadZip, isPending: isUploadPending } = useUploadBookingZipMutation();
  const { mutateAsync: updatePhotos, isPending: isUpdatePending } = useUpdateBookingPhotosMutation(bookingId);

  useEffect(() => {
    if (data?.photos) {
      setCheckedImages(new Array(data.photos.length).fill(false));
    }
  }, [data?.photos, data?.photos?.length]);

  useEffect(() => {
    if (bookingData?.status === 'PHOTOS_DELIVERED' || bookingData?.status === 'USER_PHOTO_CHECK') {
      setIsDelivered(true);
    }
  }, [bookingData?.status]);

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

  /**
   * 원본/보정본.zip 업로드 (zipFile 필드로 전송)
   */
  const handleUploadOriginalZip = async () => {
    Alert.show({
      title: '원본/보정본.zip 업로드',
      message: '이미지들이 압축된 ZIP 파일 또는 개별 이미지들을 선택하여 업로드 할 수 있습니다.\n\n※ 기존 파일이 있으면 새 파일로 대체됩니다.',
      buttons: [
        { text: 'ZIP 파일 선택', onPress: handleDirectOriginalZipUpload },
        { text: '이미지 선택', onPress: handleGalleryToOriginalZipUpload },
        { text: '취소', type: 'cancel', onPress: () => {} },
      ],
    });
  };

  /**
   * ZIP 파일 직접 선택 업로드 (원본/보정본.zip)
   */
  const handleDirectOriginalZipUpload = async () => {
    try {
      const results = await pick({ type: [types.zip, 'application/zip'] });
      const file = results[0];
      if (!file?.uri) return;

      setIsProcessing(true);

      const zipFile = { uri: file.uri, name: file.name!, type: file.type || 'application/zip' };

      if (isDelivered) {
        await updatePhotos({ zipFile });
      } else {
        await uploadZip({ bookingId, zipFile });
      }

      analytics().logEvent('photographer_original_zip_uploaded', {
        user_type: 'photographer',
        bookingId,
        file_name: zipFile.name,
      });

      refetch().finally(() => {
        setIsProcessing(false);
        Alert.show({ title: '업로드 완료', message: '원본/보정본.zip 업로드가 완료되었습니다.' });
      });
    } catch (err) {
      setIsProcessing(false);
      console.error('Upload Error:', err);
    }
  };

  /**
   * 갤러리 선택 -> 원본 ZIP 압축 -> 업로드 (원본/보정본.zip)
   */
  const handleGalleryToOriginalZipUpload = async () => {
    try {
      const result = await launchImageLibrary({ mediaType: 'photo', selectionLimit: 0, quality: 1 });
      if (result.didCancel || !result.assets || result.assets.length === 0) return;

      setIsProcessing(true);

      const zip = new JSZip();
      const uniqueId = Date.now();

      for (let i = 0; i < result.assets.length; i++) {
        const asset = result.assets[i];
        if (!asset.uri) continue;

        const base64Data = await RNFS.readFile(asset.uri, 'base64');
        const extension = asset.fileName?.split('.').pop() || 'jpg';
        const fileName = `image_${i}.${extension}`;
        zip.file(fileName, base64Data, { base64: true });
      }

      const zipContent = await zip.generateAsync({
        type: 'base64',
        compression: 'STORE',
      });

      const finalZipPath = `${RNFS.TemporaryDirectoryPath}/original_photos_${uniqueId}.zip`;
      await RNFS.writeFile(finalZipPath, zipContent, 'base64');

      const zipFile = {
        uri: Platform.OS === 'android' ? `file://${finalZipPath}` : finalZipPath,
        name: `original_photos_${bookingId}.zip`,
        type: 'application/zip',
      };

      if (isDelivered) {
        await updatePhotos({ zipFile });
      } else {
        await uploadZip({ bookingId, zipFile });
      }

      await RNFS.unlink(finalZipPath).catch(() => {});

      analytics().logEvent('photographer_original_zip_created', {
        user_type: 'photographer',
        bookingId,
        count: result.assets.length,
      });

      refetch().finally(() => {
        setIsProcessing(false);
        Alert.show({ title: '업로드 완료', message: '원본/보정본.zip 업로드가 완료되었습니다.' });
      });
    } catch (err) {
      setIsProcessing(false);
      console.error('JSZip Error:', err);
      showErrorAlert({
        title: '업로드 실패',
        action: '사진 압축',
        error: err,
      });
    }
  };

  /**
   * 원본/보정본.zip 삭제
   */
  const handleDeleteOriginalZip = async () => {
    if (!data?.zip?.id) return;

    Alert.show({
      title: '삭제 확인',
      message: '원본/보정본.zip을 삭제하시겠습니까?',
      buttons: [
        { text: '취소', type: 'cancel', onPress: () => {} },
        {
          text: '삭제',
          onPress: async () => {
            try {
              setIsProcessing(true);
              await updatePhotos({ deleteZipId: data.zip!.id });
              await refetch();

              analytics().logEvent('photographer_original_zip_deleted', {
                user_type: 'photographer',
                bookingId,
              });

              Alert.show({ title: '삭제 완료', message: '원본/보정본.zip이 삭제되었습니다.' });
            } catch (error) {
              showErrorAlert({
                title: '삭제 실패',
                action: '원본/보정본.zip 삭제',
                error,
              });
            } finally {
              setIsProcessing(false);
            }
          },
        },
      ],
    });
  };

  /**
   * 보여지는 이미지 추가 (photos 또는 newPhotos 필드로 전송)
   */
  const handleAddImages = async () => {
    Alert.show({
      title: '사진 추가 업로드',
      message: '이미지들이 압축된 ZIP 파일 또는 개별 이미지들을 선택하여 업로드 할 수 있습니다.',
      buttons: [
        { text: '이미지 선택', onPress: handleGalleryUpload },
        { text: 'ZIP 파일', onPress: handleZipAndUnzipUpload },
        { text: '취소', type: 'cancel', onPress: () => {} },
      ],
    });
  };

  /**
   * ZIP 선택 -> 압축 해제 -> 개별 이미지 업로드 (보여지는 이미지용)
   */
  const handleZipAndUnzipUpload = async () => {
    try {
      const results = await pick({ type: [types.zip, 'application/zip'] });
      const file = results[0];
      if (!file?.uri) return;

      setIsProcessing(true);

      const zipBase64 = await RNFS.readFile(file.uri, 'base64');
      const jszip = new JSZip();
      const contents = await jszip.loadAsync(zipBase64, { base64: true });

      const newPhotos = [];
      const imageExtensions = ['jpg', 'jpeg', 'png', 'heic'];

      for (const filename of Object.keys(contents.files)) {
        const zipEntry = contents.files[filename];
        const ext = filename.toLowerCase().split('.').pop() || '';

        const isImage = imageExtensions.includes(ext);
        const isMetaFile = filename.includes('__MACOSX') || filename.split('/').pop()?.startsWith('._');

        if (!zipEntry.dir && isImage && !isMetaFile) {
          const imgData = await zipEntry.async('base64');
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
        setIsProcessing(false);
        Alert.show({ title: '오류', message: '압축 파일 내에 유효한 이미지가 없습니다.' });
        return;
      }

      if (isDelivered) {
        await updatePhotos({ newPhotos });
      } else {
        await uploadZip({ bookingId, photos: newPhotos });
      }

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
      setIsProcessing(false);
      console.error(err);
      showErrorAlert({
        title: '업로드 실패',
        action: '사진 압축 해제',
        error: err,
      });
    }
  };

  /**
   * 갤러리 선택 -> 개별 이미지 업로드 (보여지는 이미지용)
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
          type: asset.type || 'image/jpeg',
        }));

      if (newPhotos.length === 0) {
        setIsProcessing(false);
        return;
      }

      if (isDelivered) {
        await updatePhotos({ newPhotos });
      } else {
        await uploadZip({ bookingId, photos: newPhotos });
      }

      analytics().logEvent('photographer_booking_photos_added', {
        user_type: 'photographer',
        bookingId,
        count: newPhotos.length,
      });

      refetch().finally(() => {
        setIsProcessing(false);
        Alert.show({ title: '업로드 완료', message: `${newPhotos.length}개의 사진이 추가되었습니다.` });
      });
    } catch (err) {
      setIsProcessing(false);
      showErrorAlert({
        title: '업로드 실패',
        action: '이미지 선택',
        error: err,
      });
    }
  };

  /**
   * 선택 사진 삭제
   */
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
              setIsProcessing(true);
              await updatePhotos({ deletePhotoIds });
              await refetch();

              analytics().logEvent('photographer_booking_photos_deleted', {
                user_type: 'photographer',
                bookingId,
                count: deletePhotoIds.length,
              });

              Alert.show({ title: '삭제 완료', message: '선택한 사진이 삭제되었습니다.' });
            } catch (error) {
              showErrorAlert({
                title: '삭제 실패',
                action: '사진 삭제',
                error,
              });
            } finally {
              setIsProcessing(false);
            }
          },
        },
      ],
    });
  };

  const selectedCount = checkedImages.filter(v => v).length;

  return (
    <PhotographerViewPhotosView
      onPressBack={handlePressBack}
      imageURIs={data?.photos.map((v) => v.url) || []}
      checkedImages={checkedImages}
      setCheckedImages={handleCheckedImages}
      onCheckAllPhotos={handleCheckAllPhotos}
      onDeletePhotos={handleDeletePhotos}
      onAddImages={handleAddImages}
      onUploadOriginalZip={handleUploadOriginalZip}
      onDeleteOriginalZip={handleDeleteOriginalZip}
      isLoading={isLoading || isUploadPending || isUpdatePending || isProcessing}
      isDelivered={isDelivered}
      zipData={data?.zip || null}
      selectedCount={selectedCount}
      navigation={navigation}
    />
  );
}
