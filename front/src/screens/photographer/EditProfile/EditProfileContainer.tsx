import { useState, useCallback, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import EditProfileView, {
  EditProfileFormData,
} from '@/screens/photographer/EditProfile/EditProfileView.tsx';
import { MainNavigationProp, MainStackParamList } from '@/types/navigation.ts';
import { Alert, requestPermission } from '@/components/theme';
import {
  CameraOptions,
  ImageLibraryOptions,
  ImagePickerResponse,
  launchCamera,
  launchImageLibrary,
} from 'react-native-image-picker';
import { Image as ImageCompressor } from 'react-native-compressor';
import { UploadImageFile } from '@/api/photographers.ts';

type EditProfileRouteProp = RouteProp<MainStackParamList, 'EditProfile'>;

export default function EditProfileContainer() {
  const navigation = useNavigation<MainNavigationProp>();
  const route = useRoute<EditProfileRouteProp>();
  const { description, profileImageURI: initialProfileImageURI, onSubmit } = route.params;

  const [profileImageURI, setProfileImageURI] = useState<UploadImageFile | undefined>(
    initialProfileImageURI ? {
      uri: initialProfileImageURI,
      type: 'image/jpeg',
      name: 'profile.jpg',
    } : undefined
  );

  const {
    control,
    watch,
  } = useForm<EditProfileFormData>({
    defaultValues: {
      description: description || '',
    },
    mode: 'onChange',
  });

  const watchedDescription = watch('description');

  const isSubmitDisabled = useMemo(() => {
    return profileImageURI === undefined || (watchedDescription?.trim() ?? '') === '';
  }, [profileImageURI, watchedDescription]);

  const handlePressBack = () => {
    navigation.goBack();
  };

  const handlePressSubmit = () => {
    if (isSubmitDisabled) return;

    // onSubmit이 있으면 호출하고, 없으면 기본 동작 (뒤로 가기)
    if (onSubmit) {
      onSubmit(watchedDescription || '');
      navigation.goBack();
    } else {
      Alert.show({
        title: '프로필 수정',
        message: '프로필이 수정되었습니다.',
        buttons: [
          {
            text: '확인',
            onPress: () => {
              navigation.goBack();
            },
          },
        ],
      });
    }
  };

  const handleCamera = useCallback(async () => {
    requestPermission(
      'camera',
      async () => {
        const options: CameraOptions = {
          mediaType: 'photo',
          saveToPhotos: true,
        };

        const response: ImagePickerResponse = await launchCamera(options);

        if (response.didCancel) {
          return;
        }
        if (response.errorCode) {
          Alert.show({
            title: '카메라 오류',
            message: response.errorMessage || '알 수 없는 오류',
          });
          return;
        }
        if (response.assets && response.assets[0] &&  response.assets[0].uri && response.assets[0].fileName && response.assets[0].type) {
          try {
            const compressedUri = await ImageCompressor.compress(response.assets[0].uri, {
              compressionMethod: 'auto',
              maxWidth: 400,
              maxHeight: 400,
              quality: 0.6,
            });

            // 압축 후에는 JPEG로 변환되므로 type을 image/jpeg로 설정
            setProfileImageURI({
              uri: compressedUri,
              name: 'profile.jpg',
              type: 'image/jpeg',
            });
          } catch (error) {
            Alert.show({
              title: '이미지 압축 실패',
              message: '이미지 압축 중 오류가 발생했습니다.',
            });
          }
        }
      }
    );
  }, []);

  const handleGalleryForProfile = useCallback(async () => {
    requestPermission(
      'photo',
      async () => {
        const options: ImageLibraryOptions = {
          mediaType: 'photo',
          selectionLimit: 1,
        };

        const response: ImagePickerResponse = await launchImageLibrary(options);

        if (response.didCancel) return;
        if (response.errorCode) {
          Alert.show({
            title: '갤러리 오류',
            message: response.errorMessage || '알 수 없는 오류',
          });
          return;
        }
        if (response.assets && response.assets[0] &&  response.assets[0].uri && response.assets[0].fileName && response.assets[0].type) {
          try {
            const compressedUri = await ImageCompressor.compress(response.assets[0].uri, {
              compressionMethod: 'auto',
              maxWidth: 400,
              maxHeight: 400,
              quality: 0.6,
            });

            // 압축 후에는 JPEG로 변환되므로 type을 image/jpeg로 설정
            setProfileImageURI({
              uri: compressedUri,
              name: 'profile.jpg',
              type: 'image/jpeg',
            });
          } catch (error) {
            Alert.show({
              title: '이미지 압축 실패',
              message: '이미지 압축 중 오류가 발생했습니다.',
            });
          }
        }
      }
    );
  }, []);

  const handleProfileImageUpload = useCallback(() => {
    Alert.show({
      title: '프로필 사진 변경',
      message: '프로필 사진을 어떻게 업로드하시겠습니까?',
      buttons: [
        {
          text: '카메라',
          onPress: handleCamera,
          type: 'destructive',
        },
        {
          text: '갤러리',
          onPress: handleGalleryForProfile,
          type: 'destructive',
        },
        {
          text: '취소',
          onPress: () => {},
          type: 'cancel',
        },
      ],
    });
  }, [handleCamera, handleGalleryForProfile]);

  return (
    <EditProfileView
      control={control}
      onPressBack={handlePressBack}
      onPressSubmit={handlePressSubmit}
      isSubmitDisabled={isSubmitDisabled}
      profileImageURI={profileImageURI?.uri || ''}
      onProfileImageUpload={handleProfileImageUpload}
      navigation={navigation}
    />
  );
}
