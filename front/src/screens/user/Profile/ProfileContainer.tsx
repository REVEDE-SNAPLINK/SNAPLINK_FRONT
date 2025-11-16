import { Alert } from 'react-native';
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
      Alert.alert(
        '모드 전환',
        data.isExpertMode ? '전문가 모드로 전환되었습니다.' : '일반 사용자 모드로 전환되었습니다.'
      );
    },
    onError: () => {
      Alert.alert('오류', '모드 전환에 실패했습니다.');
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
      Alert.alert('성공', '프로필 사진이 업데이트되었습니다.');
    },
    onError: () => {
      Alert.alert('오류', '프로필 사진 업데이트에 실패했습니다.');
    },
  });

  const handlePressBack = () => navigation.goBack();

  const handleToggleExpertMode = () => {
    toggleExpertModeMutation.mutate(!userProfile?.isExpertMode);
  };

  const handleCamera = async () => {
    const options: CameraOptions = {
      mediaType: 'photo',
      saveToPhotos: true,
      quality: 0.8,
    };

    const response: ImagePickerResponse = await launchCamera(options);

    if (response.didCancel) return;
    if (response.errorCode) {
      Alert.alert('카메라 오류', response.errorMessage || '알 수 없는 오류');
      return;
    }
    if (response.assets && response.assets[0].uri) {
      uploadProfileImageMutation.mutate(response.assets[0].uri);
    }
  };

  const handleGallery = async () => {
    const options: ImageLibraryOptions = {
      mediaType: 'photo',
      selectionLimit: 1,
      quality: 0.8,
    };

    const response: ImagePickerResponse = await launchImageLibrary(options);

    if (response.didCancel) return;
    if (response.errorCode) {
      Alert.alert('갤러리 오류', response.errorMessage || '알 수 없는 오류');
      return;
    }
    if (response.assets && response.assets[0].uri) {
      uploadProfileImageMutation.mutate(response.assets[0].uri);
    }
  };

  const handlePressProfile = () => {
    Alert.alert('프로필 사진 변경', '프로필 사진을 어떻게 업로드하시겠습니까?', [
      {
        text: '카메라로 촬영',
        onPress: handleCamera,
      },
      {
        text: '갤러리에서 선택',
        onPress: handleGallery,
      },
      {
        text: '취소',
        style: 'cancel',
      },
    ]);
  };

  const handlePressMyReviews = () => {
    // TODO: Navigate to MyReviews screen
    Alert.alert('준비중', '내가 쓴 리뷰 페이지를 준비중입니다.');
  };

  const handlePressLikedPhotographers = () => {
    // TODO: Navigate to LikedPhotographers screen
    Alert.alert('준비중', '찜한 작가 페이지를 준비중입니다.');
  };

  const handlePressNotificationSettings = () => {
    // TODO: Navigate to NotificationSettings screen
    Alert.alert('준비중', '알림 설정 페이지를 준비중입니다.');
  };

  const handlePressEditNickname = () => {
    // TODO: Navigate to EditNickname screen
    Alert.alert('준비중', '닉네임 수정 페이지를 준비중입니다.');
  };

  const handlePressEditName = () => {
    // TODO: Navigate to EditName screen
    Alert.alert('준비중', '이름 수정 페이지를 준비중입니다.');
  };

  const handlePressEditEmail = () => {
    // TODO: Navigate to EditEmail screen
    Alert.alert('준비중', '이메일 수정 페이지를 준비중입니다.');
  };

  const handlePressEditPassword = () => {
    // TODO: Navigate to EditPassword screen
    Alert.alert('준비중', '비밀번호 변경 페이지를 준비중입니다.');
  };

  const handlePressBookingHistory = () => {
    // TODO: Navigate to BookingHistory screen (already exists)
    navigation.navigate('BookingHistory');
  };

  const handlePressRecentPhotographers = () => {
    // TODO: Navigate to RecentPhotographers screen
    Alert.alert('준비중', '최근 본 작가 페이지를 준비중입니다.');
  };

  const handlePressSnaplinkGuide = () => {
    // TODO: Navigate to SnaplinkGuide screen
    Alert.alert('준비중', '스냅링크 의뢰 가이드 페이지를 준비중입니다.');
  };

  const handlePressCustomerCenter = () => {
    // TODO: Navigate to CustomerCenter screen
    Alert.alert('준비중', '고객센터 페이지를 준비중입니다.');
  };

  const handlePressNotice = () => {
    // TODO: Navigate to Notice screen
    Alert.alert('준비중', '공지사항 페이지를 준비중입니다.');
  };

  const handlePressFAQ = () => {
    // TODO: Navigate to FAQ screen
    Alert.alert('준비중', 'FAQ 페이지를 준비중입니다.');
  };

  const handlePressTerms = () => {
    // TODO: Navigate to Terms screen
    Alert.alert('준비중', '약관 및 정책 페이지를 준비중입니다.');
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