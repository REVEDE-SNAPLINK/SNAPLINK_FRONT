import { useState, useEffect, useMemo } from 'react';
import { Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery } from '@tanstack/react-query';
import { AuthNavigationProp } from '@/types/navigation.ts';
import ApplyPhotographerView from '@/screens/auth/ApplyPhotographer/ApplyPhotographerView.tsx';
import {
  launchCamera,
  launchImageLibrary,
  Asset,
  ImageLibraryOptions,
  CameraOptions,
  ImagePickerResponse,
} from 'react-native-image-picker';
import DatePicker from '@/components/DatePicker';
import LocationPicker from '@/components/LocationPicker';
import { applyPhotographerSchema, ApplyPhotographerFormData } from '@/schemas/applyPhotographerSchema';

// Mock API function - 실제로는 API 호출로 대체
const fetchCategories = async (): Promise<string[]> => {
  // TODO: Replace with actual API call
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(['스냅', '웨딩', '커플', '졸업']);
    }, 500);
  });
};

// Mock API function for consent list - 실제로는 API 호출로 대체
const fetchConsentList = async () => {
  // TODO: Replace with actual API call
  return new Promise<Array<{ id: string; title: string; required: boolean }>>((resolve) => {
    setTimeout(() => {
      resolve([
        {
          id: '1',
          title: '만 14세 이상입니다 (필수)',
          required: true,
        },
        {
          id: '2',
          title: '브랜디 약관 동의 (필수)',
          required: true,
        },
        {
          id: '3',
          title: '개인정보수집 및 이용에 대한 안내 (필수)',
          required: true,
        },
        {
          id: '4',
          title: '이벤트/마케팅 수신 동의 (선택)',
          required: false,
        },
      ]);
    }, 500);
  });
};

export default function ApplyPhotographerContainer() {
  const navigation = useNavigation<AuthNavigationProp>();
  const [isDatePickerVisible, setIsDatePickerVisible] = useState(false);
  const [isLocationPickerVisible, setIsLocationPickerVisible] = useState(false);

  // React Query for categories
  const { data: categoryList = [], isLoading: isCategoryLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: fetchCategories,
    staleTime: 1000 * 60 * 60, // 1 hour - 고정 데이터이므로 오래 캐싱
    gcTime: 1000 * 60 * 60 * 24, // 24 hours
  });

  // React Query for consent list
  const { data: consentListData = [], isLoading: isConsentLoading } = useQuery({
    queryKey: ['consentList'],
    queryFn: fetchConsentList,
    staleTime: 1000 * 60 * 60, // 1 hour - 고정 데이터이므로 오래 캐싱
    gcTime: 1000 * 60 * 60 * 24, // 24 hours
  });

  // React Hook Form
  const {
    handleSubmit,
    setValue,
    watch,
    formState: { isValid },
  } = useForm<ApplyPhotographerFormData>({
    resolver: zodResolver(applyPhotographerSchema),
    mode: 'onChange',
    defaultValues: {
      name: '',
      gender: null,
      birthday: undefined,
      location: '',
      category: null,
      photofolioImages: [],
      introduction: '',
      profileImage: null,
      consents: [],
    },
  });

  // Initialize consents when data is loaded
  useEffect(() => {
    if (consentListData.length > 0) {
      const initialConsents = consentListData.map((consent) => ({
        id: consent.id,
        title: consent.title,
        required: consent.required,
        isChecked: false,
      }));
      setValue('consents', initialConsents, { shouldValidate: true });
    }
  }, [consentListData, setValue]);

  // Watch form values
  const profileImage = watch('profileImage');
  const name = watch('name');
  const gender = watch('gender');
  const birthday = watch('birthday');
  const location = watch('location');
  const category = watch('category');
  const photofolioImages = watch('photofolioImages');
  const introduction = watch('introduction');
  const consents = watch('consents');

  const onPressBackButton = () => navigation.goBack();

  // Check if all consents are checked
  const allChecked = useMemo(() => {
    if (!consents || consents.length === 0) return false;
    return consents.every((consent) => consent.isChecked);
  }, [consents]);

  // Handle toggle all consents
  const handleToggleAllConsents = () => {
    const updatedConsents = consents.map((consent) => ({
      ...consent,
      isChecked: !allChecked,
    }));
    setValue('consents', updatedConsents, { shouldValidate: true });
  };

  // Handle toggle single consent
  const handleToggleConsent = (consentId: string) => {
    const updatedConsents = consents.map((consent) =>
      consent.id === consentId
        ? { ...consent, isChecked: !consent.isChecked }
        : consent
    );
    setValue('consents', updatedConsents, { shouldValidate: true });
  };

  const handleProfileUploadButton = () => {
    Alert.alert('사진 선택', '업로드할 이미지를 선택하세요.', [
      {
        text: '카메라로 촬영',
        onPress: handleCamera,
      },
      {
        text: '갤러리에서 선택',
        onPress: handleGalleryForProfileImage
      },
      {
        text: '취소',
        style: 'cancel',
      },
    ]);
  }

  const handleCamera = async () => {
    const options: CameraOptions = {
      mediaType: 'photo',
      saveToPhotos: true,
      quality: 0.8,
    }

    const response: ImagePickerResponse = await launchCamera(options);

    if (response.didCancel) return;
    if (response.errorCode) {
      Alert.alert('카메라 오류', response.errorMessage || '알 수 없는 오류');
      return;
    }
    if (response.assets) {
      setValue('profileImage', response.assets[0], { shouldValidate: true });
    }
  }

  const handleImagePicker = async (
    selectionLimit: number,
    onSuccess: (assets: Asset[]) => void
  ) => {
    const options: ImageLibraryOptions = {
      mediaType: 'photo',
      selectionLimit,
      quality: 0.8,
    };

    const response: ImagePickerResponse = await launchImageLibrary(options);

    if (response.didCancel) return;
    if (response.errorCode) {
      Alert.alert('갤러리 오류', response.errorMessage || '알 수 없는 오류');
      return;
    }
    if (response.assets) {
      onSuccess(response.assets);
    }
  };

  const handleGalleryForProfileImage = async () => {
    handleImagePicker(1, (assets) => {
      setValue('profileImage', assets[0], { shouldValidate: true });
    });
  }

  const handleOpenDatePicker = () => {
    setIsDatePickerVisible(true);
  }

  const handleCloseDatePicker = () => {
    setIsDatePickerVisible(false);
  }

  const handleSelectBirthday = (date: Date) => {
    setValue('birthday', date, { shouldValidate: true });
  }

  const handleOpenLocationPicker = () => {
    setIsLocationPickerVisible(true);
  }

  const handleCloseLocationPicker = () => {
    setIsLocationPickerVisible(false);
  }

  const handleSelectLocation = (locations: string[]) => {
    // '전체 선택'을 제외하고 저장
    const filteredLocations = locations.filter(loc => loc !== '전체 선택');
    const locationString = filteredLocations.join(', ');
    setValue('location', locationString, { shouldValidate: true });
  }

  // 활동 지역을 "외 N개" 형식으로 포맷
  const formatLocationDisplay = (locationString: string): string => {
    if (!locationString) return '';

    const locations = locationString.split(', ').filter(loc => loc.trim() !== '');

    if (locations.length === 0) return '';
    if (locations.length === 1) return locations[0];
    if (locations.length === 2) return `${locations[0]}, ${locations[1]}`;

    // 3개 이상일 때: "서울, 경기 외 N개"
    return `${locations[0]}, ${locations[1]} 외 ${locations.length - 2}개`;
  }

  const handleGalleryForPhotofolioImage = async () => {
    handleImagePicker(0, (assets) => {
      setValue('photofolioImages', [...photofolioImages, ...assets], { shouldValidate: true });
    });
  }

  const handleDeletePhotofolioImage = (index: number) => {
    setValue('photofolioImages', photofolioImages.filter((_, i) => i !== index), { shouldValidate: true });
  }

  const formatDate = (date: Date | undefined): string => {
    if (!date) return '';
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  const onSubmit = handleSubmit(async (
      // data: ApplyPhotographerFormData
  ) => {
    try {
      // TODO: API call to submit photographer application
      // Data structure:
      // - profileImage, name, gender, birthday, location, category
      // - photofolioImages, introduction, consents
      Alert.alert('성공', '작가 프로필이 등록되었습니다.');
      navigation.goBack();
    } catch (error) {
      Alert.alert('오류', '작가 프로필 등록에 실패했습니다.');
    }
  });

  if (isCategoryLoading || isConsentLoading) {
    // TODO: Add proper loading component
    return null;
  }

  return (
    <>
      <ApplyPhotographerView
        onPressBackButton={onPressBackButton}
        onPressSelectProfileImageButton={handleProfileUploadButton}
        isUploadedProfileImage={profileImage !== null}
        profileImageURI={profileImage?.uri ?? null}
        name={name}
        setName={(value: string) => setValue('name', value, { shouldValidate: true })}
        gender={gender}
        setGender={(value: number) => setValue('gender', value, { shouldValidate: true })}
        onPressSelectBirthdayButton={handleOpenDatePicker}
        birthday={formatDate(birthday)}
        onPressSelectLocationButton={handleOpenLocationPicker}
        location={formatLocationDisplay(location || '')}
        categoryList={categoryList}
        category={category}
        setCategory={(value: number) => setValue('category', value, { shouldValidate: true })}
        photofolioImageURIs={photofolioImages.map((item: Asset) => item.uri).filter((uri): uri is string => uri !== undefined)}
        onPressSelectPhotofolioImageButton={handleGalleryForPhotofolioImage}
        onPressDeletePhotofolioImageButton={handleDeletePhotofolioImage}
        introduction={introduction}
        setIntroduction={(value: string) => setValue('introduction', value, { shouldValidate: true })}
        isValid={isValid}
        onSubmit={onSubmit}
        consents={consents || []}
        allChecked={allChecked}
        onToggleAllConsents={handleToggleAllConsents}
        onToggleConsent={handleToggleConsent}
      />
      <DatePicker
        visible={isDatePickerVisible}
        onClose={handleCloseDatePicker}
        initialDate={birthday || new Date(2000, 0, 1)}
        onConfirm={handleSelectBirthday}
      />
      <LocationPicker
        visible={isLocationPickerVisible}
        onClose={handleCloseLocationPicker}
        initialLocations={location ? location.split(', ') : []}
        onConfirm={handleSelectLocation}
      />
    </>
  )
}