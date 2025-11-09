import React, { useState } from 'react';
import { ScrollView } from 'react-native';
import { styled } from '@/utils/CustomStyled';
import BottomModal from '@/components/BottomModal';
import Typography from '@/components/theme/Typography';

type LocationPickerProps = {
  visible: boolean;
  onClose: () => void;
  onConfirm: (locations: string[]) => void;
  initialLocations?: string[];
};

// 더미 데이터 - 추후 useQuery로 DB에서 가져올 예정
const DUMMY_LOCATIONS = [
  '전체 선택',
  '서울',
  '경기',
  '인천',
  '대전',
  '세종',
  '충남',
  '부산',
  '울산',
  '경남',
  '경북',
  '전남',
  '전북',
  '제주',
  '광주',
  '대구',
  '강원',
];

export default function LocationPicker({
                                         visible,
                                         onClose,
                                         onConfirm,
                                         initialLocations = [],
                                       }: LocationPickerProps) {
  const [selectedLocations, setSelectedLocations] = useState<string[]>(
    initialLocations
  );

  const handleConfirm = () => {
    onConfirm(selectedLocations);
    onClose();
  };

  const handleLocationPress = (location: string) => {
    if (location === '전체 선택') {
      // 전체 선택을 누르면 모든 지역 선택/해제
      setSelectedLocations(
        selectedLocations.includes('전체 선택') ? [] : [...DUMMY_LOCATIONS]
      );
      return;
    }

    // 개별 지역 선택/해제
    const isCurrentlySelected = selectedLocations.includes(location);
    const hasAllSelect = selectedLocations.includes('전체 선택');

    if (isCurrentlySelected) {
      // 이미 선택된 경우: 해당 위치와 '전체 선택' 제거
      setSelectedLocations(
        selectedLocations.filter((loc) => loc !== location && loc !== '전체 선택')
      );
    } else {
      // 선택되지 않은 경우: 추가
      const newLocations = hasAllSelect
        ? [...selectedLocations.filter(loc => loc !== '전체 선택'), location]
        : [...selectedLocations, location];

      // 모든 개별 지역(16개)이 선택되었는지 확인
      const individualCount = newLocations.filter(loc => loc !== '전체 선택').length;
      const totalIndividualLocations = DUMMY_LOCATIONS.length - 1; // '전체 선택' 제외

      setSelectedLocations(
        individualCount === totalIndividualLocations ? [...DUMMY_LOCATIONS] : newLocations
      );
    }
  };

  return (
    <BottomModal
      visible={visible}
      onClose={onClose}
      onConfirm={handleConfirm}
      title="활동 지역"
      confirmDisabled={selectedLocations.length === 0}
    >
      <ScrollContainer showsVerticalScrollIndicator={false}>
        <LocationGrid>
          {DUMMY_LOCATIONS.map((location, index) => {
            const isSelected = selectedLocations.includes(location);

            return (
              <LocationButton
                key={`${location}-${index}`}
                onPress={() => handleLocationPress(location)}
                $selected={isSelected}
              >
                <Typography
                  fontSize={14}
                  fontWeight="medium"
                  color={isSelected ? '#000000' : '#C8C8C8'}
                >
                  {location}
                </Typography>
              </LocationButton>
            );
          })}
        </LocationGrid>
      </ScrollContainer>
    </BottomModal>
  );
}

const ScrollContainer = styled(ScrollView)`
  width: 100%;
  max-height: 300px;
`;

const LocationGrid = styled.View`
  flex-direction: row;
  flex-wrap: wrap;
  gap: 8px;
  row-gap: 8px;
`;

const LocationButton = styled.TouchableOpacity<{ $selected: boolean }>`
  padding-vertical: 10px;
  padding-horizontal: 16px;
  border-radius: 20px;
  border-width: 1px;
  border-color: ${({ $selected }) =>
  $selected ? '#00A980' : '#C8C8C8'};
  background-color: ${({ $selected }) =>
  $selected ? '#E6F7F3' : 'transparent'};
  align-items: center;
  justify-content: center;
  min-height: 36px;
`;
