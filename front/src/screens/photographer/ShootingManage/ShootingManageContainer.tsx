import { useNavigation } from '@react-navigation/native';
import { MainNavigationProp } from '@/types/navigation.ts';
import ShootingManageView, {
  ShootingOptionResponse,
} from '@/screens/photographer/ShootingManage/ShootingManageView.tsx';

export default function ShootingManageContainer() {
  const navigation = useNavigation<MainNavigationProp>();

  const handlePressBack = () => navigation.goBack();

  const handlePressCreateOption = () => {
    navigation.navigate('ServiceForm', {});
  };

  const handlePressEditOption = (optionId: number) => {
    navigation.navigate('ServiceForm', { serviceId: optionId });
  };

  const handlePressDeleteOption = () => {
    // TODO: API 연결 후 구현
  };

  const dummyOptions: ShootingOptionResponse[] = [
    {
      id: 1,
      name: '베이직 스냅 촬영',
      days: ['월요일', '화요일', '수요일', '목요일', '금요일'],
      type: 'BASIC',
      baseTime: 1, // 시간 단위 (1시간)
      basePrice: 150000,
      isEnhanced: '제공하지 않음',
      isOriginal: false,
      enhancedPermission: '보정 제공 없음',
      optionalOptions: [
        { name: '인원 추가 (1인)', price: 30000 },
        { name: '촬영 시간 추가 (30분)', price: 50000 },
        { name: '원본 사진 요청', price: 40000 },
      ],
    },
    {
      id: 2,
      name: '프리미엄 스냅 촬영',
      days: ['금요일', '토요일', '일요일'],
      type: 'PREMIUM',
      baseTime: 2,
      basePrice: 280000,
      isEnhanced: '일부 제공',
      isOriginal: true,
      enhancedPermission: '색감 보정',
      optionalOptions: [
        { name: '인원 추가 (1인)', price: 40000 },
        { name: '촬영 시간 추가 (1시간)', price: 90000 },
        { name: '원본 사진 전체 제공', price: 60000 },
      ],
    },
    {
      id: 3,
      name: '커플 데이트 스냅',
      days: ['토요일', '일요일'],
      type: 'COUPLE',
      baseTime: 3,
      basePrice: 360000,
      isEnhanced: '제공',
      isOriginal: true,
      enhancedPermission: '얼굴 색감 보정',
      optionalOptions: [
        { name: '인원 추가 (1인)', price: 50000 },
        { name: '촬영 시간 추가 (30분)', price: 60000 },
        { name: '원본 사진 요청', price: 50000 },
      ],
    },
    {
      id: 4,
      name: '프로필 촬영',
      days: ['월요일', '화요일', '수요일', '목요일'],
      type: 'PROFILE',
      baseTime: 1,
      basePrice: 120000,
      isEnhanced: '일부 제공',
      isOriginal: false,
      enhancedPermission: '얼굴 보정',
      optionalOptions: [
        { name: '촬영 시간 추가 (30분)', price: 40000 },
        { name: '배경 변경 보정', price: 50000 },
        { name: '원본 사진 요청', price: 30000 },
      ],
    },
    {
      id: 5,
      name: '장시간 스냅 패키지',
      days: ['금요일', '토요일', '일요일'],
      type: 'LONG',
      baseTime: 6,
      basePrice: 650000,
      isEnhanced: '제공',
      isOriginal: true,
      enhancedPermission: '얼굴 보정 + 얼굴 색감 보정 + 색감 보정',
      optionalOptions: [
        { name: '인원 추가 (1인)', price: 60000 },
        { name: '촬영 시간 추가 (1시간)', price: 100000 },
        { name: '원본 사진 전체 제공', price: 0 }, // 포함 옵션 느낌
      ],
    },
  ];

  return (
    <ShootingManageView
      onPressBack={handlePressBack}
      onPressCreateOption={handlePressCreateOption}
      onPressEditOption={handlePressEditOption}
      onPressDeleteOption={handlePressDeleteOption}
      shootingOptions={dummyOptions}
    />
  )
}