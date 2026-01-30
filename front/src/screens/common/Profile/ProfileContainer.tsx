import { useNavigation } from '@react-navigation/native';
import {
  launchCamera,
  launchImageLibrary,
  ImageLibraryOptions,
  CameraOptions,
  ImagePickerResponse,
} from 'react-native-image-picker';
import { Image as ImageCompressor } from 'react-native-compressor';
import { MainNavigationProp } from '@/types/navigation.ts';
import ProfileView from '@/screens/common/Profile/ProfileView.tsx';
import { useAuthStore } from '@/store/authStore.ts';
import { requestPermission } from '@/utils/permissions.ts';
import { Alert } from '@/components/theme';
import { usePatchUserProfileImageMutation } from '@/mutations/user.ts';
import { generateImageFilename } from '@/utils/format.ts';
import { useMeQuery } from '@/queries/user.ts';
import { useEffect, useState } from 'react';
import { usePhotographerStatusQuery } from '@/queries/photographers.ts';
import { openUrl } from '@/utils/link.ts';

export default function ProfileContainer () {
  const navigation = useNavigation<MainNavigationProp>();
  const { userType, isExpertMode, userId, toggleExpertMode: toggleExpertModeAction } = useAuthStore();

  const [ profileImageURI, setProfileImageURI ] = useState<string | null>(null);

  const isPhotographer = userType === 'photographer';

  const { data: userProfile, isSuccess } = useMeQuery();
  const { data: photographerStatus } = usePhotographerStatusQuery({
    enabled: isPhotographer && isExpertMode,
  });

  useEffect(() => {
    if (isSuccess && userProfile?.profileImageURI) {
      setProfileImageURI(userProfile.profileImageURI);
    }
  }, [isSuccess, userProfile?.profileImageURI]);

  // Upload profile image mutation (unified for all user types)
  const uploadProfileImageMutation = usePatchUserProfileImageMutation();

  const handleToggleExpertMode = () => toggleExpertModeAction()

  const handleCamera = async () => {
    requestPermission(
      'camera',
      async () => {
        // 권한 허용됨 - 카메라 열기
        const options: CameraOptions = {
          mediaType: 'photo',
          saveToPhotos: true,
        };

        const response: ImagePickerResponse = await launchCamera(options);

        console.log('Camera response:', {
          didCancel: response.didCancel,
          errorCode: response.errorCode,
          errorMessage: response.errorMessage,
          assetsLength: response.assets?.length,
          firstAssetUri: response.assets?.[0]?.uri,
        });

        if (response.didCancel) {
          console.log('User cancelled camera');
          return;
        }
        if (response.errorCode) {
          console.log('Camera error:', response.errorCode, response.errorMessage);
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
            uploadProfileImageMutation.mutate({
              image: {
                uri: compressedUri,
                name: generateImageFilename('image/jpeg', 'photographer_profile'),
                type: 'image/jpeg',
              }
            }, {
              onSuccess: () => {
                Alert.show({
                  title: '업데이트 완료',
                  message: '프로필 사진이 업데이트되었습니다.',
                });
              },
              onError: () => {
                Alert.show({
                  title: '업데이트 실패',
                  message: '프로필 사진 업데이트에 실패했습니다.',
                });
              },
            });
            setProfileImageURI(compressedUri);
          } catch (error) {
            console.error('Profile image compression failed:', error);
            Alert.show({
              title: '이미지 압축 실패',
              message: '이미지 압축 중 오류가 발생했습니다.',
            });
          }
        } else {
          console.log('No image URI found in response');
        }
      }
      // onDenied 콜백 제거 - requestPermission 내부에서 적절한 안내 처리
    );
  };

  const handleGallery = async () => {
    requestPermission(
      'photo',
      async () => {
        // 권한 허용됨 - 갤러리 열기
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
            uploadProfileImageMutation.mutate({
              image: {
                uri: compressedUri,
                name: generateImageFilename('image/jpeg', 'photographer_profile'),
                type: 'image/jpeg',
              }
            }, {
              onSuccess: () => {
                Alert.show({
                  title: '업데이트 완료',
                  message: '프로필 사진이 업데이트되었습니다.',
                });
              },
              onError: () => {
                Alert.show({
                  title: '업데이트 실패',
                  message: '프로필 사진 업데이트에 실패했습니다.',
                });
              },
            });
            setProfileImageURI(compressedUri);
          } catch (error) {
            console.error('Profile gallery image compression failed:', error);
            Alert.show({
              title: '이미지 압축 실패',
              message: '이미지 압축 중 오류가 발생했습니다.',
            });
          }
        }
      }
      // onDenied 콜백 제거 - requestPermission 내부에서 적절한 안내 처리
    );
  };

  const handlePressProfile = () => {
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
          onPress: handleGallery,
          type: 'destructive',
        },
        {
          text: '취소',
          onPress: () => console.log('취소됨'),
          type: 'cancel',
        },
      ],
    });
  };

  const handlePressMyReviews = () => {
    navigation.navigate('MyReviews');
  };

  const handlePressMyPosts = () => navigation.navigate('MyPosts');

  const handlePressNotificationSettings = () => navigation.navigate('NotificationSetting')

  const handlePressEditNickname = () => navigation.navigate('NicknameEdit');

  const handlePressEditEmail = () => navigation.navigate('EmailEdit');

  const handlePressManageAccount = () => navigation.navigate('AccountManage');

  const handlePressBookingHistory = () => {
    navigation.navigate('BookingHistory');
  };

  const handlePressManageBooking = () => {
    if (!isPhotographer) {
      Alert.show({
        title: '권한 없음',
        message: '작가만 사용 가능한 기능입니다.'
      });
      return;
    }
    const isPending = photographerStatus === 'PENDING';
    if (isPending) {
      Alert.show({
        title: '포트폴리오 등록을 완료하세요',
        message: '아직 포트폴리오를 등록하지 않으셨어요.\n등록 이후에 예약을 받을 수 있어요.',
        buttons: [
          { text: '뒤로', type: 'cancel', onPress: () => {} },
          { text: '등록하러가기', onPress: () => navigation.navigate('PortfolioOnboarding') },
        ]
      });
      return;
    }
    navigation.navigate('BookingManage');
  }

  const handlePressManagePortfolio = () => {
    const isPending = photographerStatus === 'PENDING';
    if (!isPhotographer) {
      Alert.show({
        title: '권한 없음',
        message: '작가만 사용 가능한 기능입니다.'
      });
      return;
    }
    if (isPending) {
      navigation.navigate('PortfolioOnboarding');
    } else {
      navigation.navigate('PhotographerDetails', { photographerId: userId, source: 'my_profile' })
    }
  }

  const handlePressShootService = () => {
    if (!isPhotographer) {
      Alert.show({
        title: '권한 없음',
        message: '작가만 사용 가능한 기능입니다.'
      });
      return;
    }
    const isPending = photographerStatus === 'PENDING';
    if (isPending) {
      Alert.show({
        title: '포트폴리오 등록을 완료하세요',
        message: '아직 포트폴리오를 등록하지 않으셨어요.\n등록 이후에 촬영 상품을 관리해보세요',
        buttons: [
          { text: '뒤로', type: 'cancel', onPress: () => {} },
          { text: '등록하러가기', onPress: () => navigation.navigate('PortfolioOnboarding') },
        ]
      });
      return;
    }
    navigation.navigate('ShootingManage');
  }

  const handlePressCustomerCenter = () => {
    openUrl("http://pf.kakao.com/_KasSn");
  };

  const handlePressNotice = () => navigation.navigate('Notice');

  const handlePressFAQ = () => navigation.navigate('FAQ');

  const handlePressTerms = () => navigation.navigate('Legal');

  const handlePressOpenSource = () => {
    navigation.navigate('OpenSourceLicense');
  };

  const handlePressManageBlock = () => {
    navigation.navigate('BlockManage');
  };

  return (
    <ProfileView
      onToggleExpertMode={handleToggleExpertMode}
      onPressProfile={handlePressProfile}
      onPressMyReviews={handlePressMyReviews}
      onPressMyPosts={handlePressMyPosts}
      onPressNotificationSettings={handlePressNotificationSettings}
      onPressEditNickname={handlePressEditNickname}
      onPressEditEmail={handlePressEditEmail}
      onPressManageAccount={handlePressManageAccount}
      onPressBookingHistory={handlePressBookingHistory}
      onPressCustomerCenter={handlePressCustomerCenter}
      onPressManageBooking={handlePressManageBooking}
      onPressManageShootService={handlePressShootService}
      onPressManagePortfolio={handlePressManagePortfolio}
      onPressManageBlock={handlePressManageBlock}
      onPressNotice={handlePressNotice}
      onPressFAQ={handlePressFAQ}
      onPressTerms={handlePressTerms}
      onPressOpenSource={handlePressOpenSource}
      isExpertMode={isExpertMode}
      isPhotographer={isPhotographer}
      profileImageURI={profileImageURI !== null ? profileImageURI : ''}
      nickname={userProfile?.nickname || ''}
      name={userProfile?.name || ''}
      email={userProfile?.email || ''}
    />
  );
}