import { useNavigation } from '@react-navigation/native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  launchCamera,
  launchImageLibrary,
  ImageLibraryOptions,
  CameraOptions,
  ImagePickerResponse,
} from 'react-native-image-picker';
import ProfileView from '@/screens/user/Profile/ProfileView.tsx';
import { MainNavigationProp } from '@/types/navigation.ts';
import { getUserProfile, toggleExpertMode, uploadProfileImage } from '@/api/profile';
import { Alert } from '@/components/theme';
import { requestPermission } from '@/utils/permissions';

export default function ProfileContainer () {
  const navigation = useNavigation<MainNavigationProp>();
  const queryClient = useQueryClient();

  // TODO: Get actual user ID from auth context
  const userId = '1';

  // Fetch user profile data
  const { data: userProfile, isLoading } = useQuery({
    queryKey: ['userProfile', userId],
    queryFn: () => getUserProfile(userId),
  });

  // Toggle expert mode mutation
  const toggleExpertModeMutation = useMutation({
    mutationFn: (isExpertMode: boolean) => toggleExpertMode(userId, isExpertMode),
    onSuccess: (data) => {
      // Update cache
      queryClient.setQueryData(['userProfile', userId], data);
      Alert.show({
        title: '모드 전환',
        message: data.isExpertMode ? '전문가 모드로 전환되었습니다.' : '일반 사용자 모드로 전환되었습니다.',
      });
    },
    onError: () => {
      Alert.show({
        title: '오류',
        message: '모드 전환에 실패했습니다.',
      });
    },
  });

  // Upload profile image mutation
  const uploadProfileImageMutation = useMutation({
    mutationFn: (imageUri: string) => uploadProfileImage(userId, imageUri),
    onSuccess: (imageUrl) => {
      // Update cache
      queryClient.setQueryData(['userProfile', userId], (old: any) => ({
        ...old,
        profileImage: imageUrl,
      }));
      Alert.show({
        title: '성공',
        message: '프로필 사진이 업데이트되었습니다.',
      });
    },
    onError: () => {
      Alert.show({
        title: '오류',
        message: '프로필 사진 업데이트에 실패했습니다.',
      });
    },
  });

  const handlePressBack = () => navigation.goBack();

  const handleToggleExpertMode = () => {
    toggleExpertModeMutation.mutate(!userProfile?.isExpertMode);
  };

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
        if (response.assets && response.assets[0]?.uri) {
          console.log('Uploading image:', response.assets[0].uri);
          uploadProfileImageMutation.mutate(response.assets[0].uri);
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
        if (response.assets && response.assets[0].uri) {
          uploadProfileImageMutation.mutate(response.assets[0].uri);
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
          text: '카메라로 촬영',
          onPress: handleCamera,
          type: 'destructive',
        },
        {
          text: '갤러리에서 선택',
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
    // TODO: Navigate to MyReviews screen
    Alert.show({
      title: '준비중',
      message: '내가 쓴 리뷰 페이지를 준비중입니다.',
    });
  };

  const handlePressLikedPhotographers = () => {
    // TODO: Navigate to LikedPhotographers screen
    Alert.show({
      title: '준비중',
      message: '찜한 작가 페이지를 준비중입니다.',
    });
  };

  const handlePressNotificationSettings = () => {
    // TODO: Navigate to NotificationSettings screen
    Alert.show({
      title: '준비중',
      message: '알림 설정 페이지를 준비중입니다.',
    });
  };

  const handlePressEditNickname = () => {
    // TODO: Navigate to EditNickname screen
    Alert.show({
      title: '준비중',
      message: '닉네임 수정 페이지를 준비중입니다.',
    });
  };

  const handlePressEditName = () => {
    // TODO: Navigate to EditName screen
    Alert.show({
      title: '준비중',
      message: '이름 수정 페이지를 준비중입니다.',
    });
  };

  const handlePressEditEmail = () => {
    // TODO: Navigate to EditEmail screen
    Alert.show({
      title: '준비중',
      message: '이메일 수정 페이지를 준비중입니다.',
    });
  };

  const handlePressEditPassword = () => {
    // TODO: Navigate to EditPassword screen
    Alert.show({
      title: '준비중',
      message: '비밀번호 변경 페이지를 준비중입니다.',
    });
  };

  const handlePressBookingHistory = () => {
    // TODO: Navigate to BookingHistory screen (already exists)
    navigation.navigate('BookingHistory');
  };

  const handlePressRecentPhotographers = () => {
    // TODO: Navigate to RecentPhotographers screen
    Alert.show({
      title: '준비중',
      message: '최근 본 작가 페이지를 준비중입니다.',
    });
  };

  const handlePressSnaplinkGuide = () => {
    // TODO: Navigate to SnaplinkGuide screen
    Alert.show({
      title: '준비중',
      message: '스냅링크 의뢰 가이드 페이지를 준비중입니다.',
    });
  };

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

  // Show loading state or return null while loading
  if (isLoading || !userProfile) {
    // TODO: Add proper loading component
    return null;
  }

  return (
    <ProfileView
      onPressBack={handlePressBack}
      onToggleExpertMode={handleToggleExpertMode}
      onPressProfile={handlePressProfile}
      onPressMyReviews={handlePressMyReviews}
      onPressLikedPhotographers={handlePressLikedPhotographers}
      onPressNotificationSettings={handlePressNotificationSettings}
      onPressEditNickname={handlePressEditNickname}
      onPressEditName={handlePressEditName}
      onPressEditEmail={handlePressEditEmail}
      onPressEditPassword={handlePressEditPassword}
      onPressBookingHistory={handlePressBookingHistory}
      onPressRecentPhotographers={handlePressRecentPhotographers}
      onPressSnaplinkGuide={handlePressSnaplinkGuide}
      onPressCustomerCenter={handlePressCustomerCenter}
      onPressNotice={handlePressNotice}
      onPressFAQ={handlePressFAQ}
      onPressTerms={handlePressTerms}
      isExpertMode={userProfile.isExpertMode}
      profileImageURI={userProfile.profileImage || ''}
      nickname={userProfile.nickname}
      name={userProfile.name}
      email={userProfile.email}
    />
  );
}