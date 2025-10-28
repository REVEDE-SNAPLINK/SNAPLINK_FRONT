import React, { useState } from 'react';
import styled from 'styled-components/native';
import { theme } from '@/constants/theme';
import BottomModal from '@/components/BottomModal';
import AppText from '@/components/AppText';

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
      <ScrollContainer>
        <LocationGrid>
          {DUMMY_LOCATIONS.map((location, index) => {
            const isSelected = selectedLocations.includes(location);

            return (
              <LocationButton
                key={`${location}-${index}`}
                onPress={() => handleLocationPress(location)}
                selected={isSelected}
              >
                <ButtonText
                  fontSize={14}
                  fontWeight={500}
                  color={isSelected ? 'black' : 'disabled'}
                >
                  {location}
                </ButtonText>
              </LocationButton>
            );
          })}
        </LocationGrid>
      </ScrollContainer>
    </BottomModal>
  );
}

const ScrollContainer = styled.ScrollView.attrs({
  showsVerticalScrollIndicator: false,
})`
  width: 100%;
  max-height: ${theme.verticalScale(300)}px;
`;

const LocationGrid = styled.View`
  flex-direction: row;
  flex-wrap: wrap;
  gap: ${theme.horizontalScale(8)}px;
  row-gap: ${theme.verticalScale(8)}px;
`;

const LocationButton = styled.TouchableOpacity<{ selected: boolean }>`
  padding-vertical: ${theme.verticalScale(10)}px;
  padding-horizontal: ${theme.horizontalScale(16)}px;
  border-radius: ${theme.moderateScale(20)}px;
  border-width: 1px;
  border-color: ${({ selected }) =>
    selected ? theme.colors.primary : theme.colors.disabled};
  background-color: ${({ selected }) =>
    selected ? theme.colors.selected : 'transparent'};
  align-items: center;
  justify-content: center;
  min-height: ${theme.verticalScale(36)}px;
`;

const ButtonText = styled(AppText)``;
