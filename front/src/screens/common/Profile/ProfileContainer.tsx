import { useNavigation } from '@react-navigation/native';
import {
  launchCamera,
  launchImageLibrary,
  ImageLibraryOptions,
  CameraOptions,
  ImagePickerResponse,
} from 'react-native-image-picker';
import { MainNavigationProp } from '@/types/navigation.ts';
import ProfileView from '@/screens/common/Profile/ProfileView.tsx';
import { useAuthStore } from '@/store/authStore.ts';
import { requestPermission } from '@/utils/permissions.ts';
import { Alert } from '@/components/theme';
import { usePatchUserProfileImageMutation } from '@/mutations/user.ts';
import { usePatchPhotographerProfileImageMutation } from '@/mutations/photographers.ts';
import { generateImageFilename } from '@/utils/format.ts';
import { useMeQuery } from '@/queries/user.ts';
import { useEffect, useState } from 'react';

export default function ProfileContainer () {
  const navigation = useNavigation<MainNavigationProp>();
  const { userType, isExpertMode, toggleExpertMode: toggleExpertModeAction } = useAuthStore();

  const [ profileImageURI, setProfileImageURI ] = useState<string | null>(null);

  const isPhotographer = userType === 'photographer';

  const { data: userProfile, isSuccess } = useMeQuery();

  useEffect(() => {
    if (isSuccess && userProfile?.profileImageURI) {
      setProfileImageURI(userProfile.profileImageURI);
    }
  }, [isSuccess, userProfile?.profileImageURI]);

  // Upload profile image mutation
  const updateUserProfileImageMutation = usePatchUserProfileImageMutation();
  const updatePhotographerProfileMutation = usePatchPhotographerProfileImageMutation();

  const uploadProfileImageMutation = isPhotographer
    ? updatePhotographerProfileMutation
    : updateUserProfileImageMutation;

  const handleToggleExpertMode = () => toggleExpertModeAction()

  const handleCamera = async () => {
    requestPermission(
      'camera',
      async () => {
        // 권한 허용됨 - 카메라 열기
        const options: CameraOptions = {
          mediaType: 'photo',
          saveToPhotos: true,
          quality: 0.8,
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
          uploadProfileImageMutation.mutate({
            image: {
              uri: response.assets[0].uri,
              name: generateImageFilename(response.assets[0].type, 'photographer_profile'),
              type: response.assets[0].type || 'image/jpeg',
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
          setProfileImageURI(response.assets[0].uri);
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
          quality: 0.8,
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
          uploadProfileImageMutation.mutate({
            image: {
              uri: response.assets[0].uri,
              name: generateImageFilename(response.assets[0].type, 'photographer_profile'),
              type: response.assets[0].type || 'image/jpeg',
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
                title: '업데이터 실패',
                message: '프로필 사진 업데이트에 실패했습니다.',
              });
            },
          });
          setProfileImageURI(response.assets[0].uri);
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

  const handlePressNotificationSettings = () => {
    // TODO: Navigate to NotificationSettings screen
    Alert.show({
      title: '준비중',
      message: '알림 설정 페이지를 준비중입니다.',
    });
  };

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
    navigation.navigate('BookingCalendar');
  }

  const handlePressManagePortfolio = () => {
    if (!isPhotographer) {
      Alert.show({
        title: '권한 없음',
        message: '작가만 사용 가능한 기능입니다.'
      });
      return;
    }
    navigation.navigate('PortfolioOnboarding');
  }

  const handlePressShootService = () => {
    if (!isPhotographer) {
      Alert.show({
        title: '권한 없음',
        message: '작가만 사용 가능한 기능입니다.'
      });
      return;
    }
    navigation.navigate('ShootingManage');
  }

  const handlePressCustomerCenter = () => {
    // TODO: Navigate to CustomerCenter screen
    Alert.show({
      title: '준비중',
      message: '고객센터 페이지를 준비중입니다.',
    });
  };

  const handlePressNotice = () => {
    // TODO: Navigate to Notice screen
    Alert.show({
      title: '준비중',
      message: '공지사항 페이지를 준비중입니다.',
    });
  };

  const handlePressFAQ = () => {
    // TODO: Navigate to FAQ screen
    Alert.show({
      title: '준비중',
      message: 'FAQ 페이지를 준비중입니다.',
    });
  };

  const handlePressTerms = () => {
    // TODO: Navigate to Terms screen
    Alert.show({
      title: '준비중',
      message: '약관 및 정책 페이지를 준비중입니다.',
    });
  };

  const handlePressOpenSource = () => {
    // TODO: Navigate to Terms screen
    Alert.show({
      title: '준비중',
      message: '약관 및 정책 페이지를 준비중입니다.',
    });
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