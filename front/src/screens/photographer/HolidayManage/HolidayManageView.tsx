import { useState, useEffect } from 'react';
import ScreenContainer from '@/components/common/ScreenContainer';
import styled from '@/utils/scale/CustomStyled.ts';
import { Typography } from '@/components/theme';
import MoreIcon from '@/assets/icons/more.svg';
import IconButton from '@/components/IconButton.tsx';
import SlideModal from '@/components/theme/SlideModal.tsx';
import Icon from '@/components/Icon.tsx';
import CrossIcon from '@/assets/icons/cross-white.svg';
import SubmitButton from '@/components/theme/SubmitButton';
import FormInput from '@/components/form/FormInput';
import DateInput from '@/components/form/DateInput';
import { HolidayGroup } from './HolidayManageContainer';
import { theme } from '@/theme';

interface HolidayManageViewProps {
  onPressBack: () => void;
  onPressAdd: () => void;
  onPressMore: (group: HolidayGroup) => void;
  holidays: HolidayGroup[];
  isModalVisible: boolean;
  onCloseModal: () => void;
  onSubmitHoliday: (startDate: string, endDate: string, reason: string) => void;
  isActionModalVisible: boolean;
  onCloseActionModal: () => void;
  onPressEdit: () => void;
  onPressDelete: () => void;
  editMode: 'create' | 'edit';
  selectedGroup: HolidayGroup | null;

  navigation?: any;
}

export default function HolidayManageView({
  onPressBack,
  onPressAdd,
  onPressMore,
  holidays,
  isModalVisible,
  onCloseModal,
  onSubmitHoliday,
  isActionModalVisible,
  onCloseActionModal,
  onPressEdit,
  onPressDelete,
  editMode,
  selectedGroup,
  navigation,}: HolidayManageViewProps) {
  const [startDate, setStartDate] = useState<Date>(new Date());
  const [endDate, setEndDate] = useState<Date>(new Date());

  const handleChangeStartDate = (date: Date) => {
    setStartDate(date);

    // If startDate exceeds endDate, align endDate to startDate
    if (endDate && date > endDate) {
      setEndDate(date);
    }
  };
  const [reason, setReason] = useState<string>('');

  // Calculate maximum booking date (3 months from today)
  const maxHolidayDate = new Date();
  maxHolidayDate.setMonth(maxHolidayDate.getMonth() + 3);

  // Helper function to convert YYYY-MM-DD string to Date
  const stringToDate = (dateString: string): Date => {
    const [year, month, day] = dateString.split('-').map(Number);
    return new Date(year, month - 1, day);
  };

  // Helper function to convert Date to YYYY-MM-DD string
  const dateToString = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Sync selectedGroup to local state when modal opens in edit mode
  useEffect(() => {
    if (isModalVisible && editMode === 'edit' && selectedGroup) {
      setStartDate(stringToDate(selectedGroup.startDate));
      setEndDate(stringToDate(selectedGroup.endDate));
      setReason(selectedGroup.reason);
    } else if (isModalVisible && editMode === 'create') {
      const today = new Date();
      setStartDate(today);
      setEndDate(today);
      setReason('');
    }
  }, [isModalVisible, editMode, selectedGroup]);

  const handleSubmit = () => {
    if (!startDate || !endDate || !reason.trim()) {
      return;
    }
    // Validate that end date is not before start date
    if (endDate < startDate) {
      return;
    }
    onSubmitHoliday(dateToString(startDate), dateToString(endDate), reason);
  };

  const formatDateRange = (start: string, end: string) => {
    const startFormatted = start.replace(/-/g, '.');
    const endFormatted = end.replace(/-/g, '.');
    if (start === end) {
      return startFormatted;
    }
    return `${startFormatted} ~ ${endFormatted}`;
  };

  return (
    <>
      <ScreenContainer
        headerShown={true}
        headerTitle="휴가 관리"
        onPressBack={onPressBack}
      
      navigation={navigation}>
        <ScrollContainer>
          {holidays.length === 0 ? (
            <EmptyWrapper>
              <Typography fontSize={14} color="#A4A4A4">
                등록된 휴가가 없습니다.
              </Typography>
            </EmptyWrapper>
          ) : (
            holidays.map((holiday, index) => (
              <HolidayItem key={index}>
                <HolidayItemHeader>
                  <Typography fontSize={16} fontWeight="semiBold">
                    {formatDateRange(holiday.startDate, holiday.endDate)}
                  </Typography>
                  <IconButton
                    width={24}
                    height={24}
                    Svg={MoreIcon}
                    onPress={() => onPressMore(holiday)}
                  />
                </HolidayItemHeader>
                <HolidayItemContent>
                  <Typography fontSize={14} lineHeight="140%" letterSpacing="-2.5%" color="#767676">
                    {holiday.reason}
                  </Typography>
                </HolidayItemContent>
              </HolidayItem>
            ))
          )}
        </ScrollContainer>
        <FloatingButton onPress={onPressAdd}>
          <Icon width={20} height={20} Svg={CrossIcon} />
        </FloatingButton>
      </ScreenContainer>

      {/* 추가/수정 모달 */}
      <SlideModal
        visible={isModalVisible}
        onClose={onCloseModal}
        showHeader={false}
        title={editMode === 'create' ? '휴가 추가' : '휴가 수정'}
        minHeight={500}
        scrollable={false}
      >
        <ModalContent>
          <Typography fontSize={16} fontWeight="semiBold" marginBottom={10}>
            시작 날짜
          </Typography>
          <DateInput
            value={startDate}
            onChange={handleChangeStartDate}
            placeholder="시작 날짜"
            minimumDate={new Date()}
            maximumDate={maxHolidayDate}
          />

          <Typography fontSize={16} fontWeight="semiBold" marginBottom={10} marginTop={20}>
            종료 날짜
          </Typography>
          <DateInput
            value={endDate}
            onChange={setEndDate}
            placeholder="종료 날짜"
            minimumDate={startDate}
            maximumDate={maxHolidayDate}
          />

          <SelectedDateRangeWrapper>
            <Typography fontSize={14} color="#767676">
              선택된 기간: {formatDateRange(dateToString(startDate), dateToString(endDate))}
            </Typography>
          </SelectedDateRangeWrapper>

          <Typography fontSize={16} fontWeight="semiBold" marginBottom={10} marginTop={24}>
            휴가 사유
          </Typography>
          <FormInput
            placeholder="휴가 사유를 입력해주세요"
            value={reason}
            onChangeText={setReason}
            multiline
            height={100}
          />

          <SubmitButton
            text={editMode === 'create' ? '등록' : '수정'}
            onPress={handleSubmit}
            disabled={!startDate || !endDate || !reason.trim() || endDate < startDate}
            marginTop={24}
          />
        </ModalContent>
      </SlideModal>

      {/* 수정/삭제 액션 모달 */}
      <SlideModal
        visible={isActionModalVisible}
        onClose={onCloseActionModal}
        showHeader={false}
        minHeight={200}
      >
        <EditModalWrapper>
          <EditModalButton onPress={onPressEdit}>
            <Typography fontSize={16} letterSpacing="-2.5%">
              수정
            </Typography>
          </EditModalButton>
          <EditModalDivider />
          <EditModalButton onPress={onPressDelete}>
            <Typography fontSize={16} letterSpacing="-2.5%" color="#FF0000">
              삭제
            </Typography>
          </EditModalButton>
          <EditModalDivider />
          <EditModalButton onPress={onCloseActionModal}>
            <Typography fontSize={16} letterSpacing="-2.5%" color="#A4A4A4">
              닫기
            </Typography>
          </EditModalButton>
        </EditModalWrapper>
      </SlideModal>
    </>
  );
}

const ScrollContainer = styled.ScrollView`
  background-color: #EAEAEA;
  flex: 1;
  width: 100%;
  height: 100%;
  padding-bottom: 50px;
`;

const EmptyWrapper = styled.View`
  flex: 1;
  justify-content: center;
  align-items: center;
  padding: 60px 20px;
`;

const HolidayItem = styled.View`
  padding: 22px 25px;
  background-color: #fff;
  margin-top: 14px;
`;

const HolidayItemHeader = styled.View`
  width: 100%;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
`;

const HolidayItemContent = styled.View`
  width: 100%;
  margin-top: 12px;
`;

const FloatingButton = styled.TouchableOpacity`
  position: absolute;
  bottom: 30px;
  right: 20px;
  width: 30px;
  height: 30px;
  border-radius: 28px;
  background-color: ${theme.colors.primary};
  justify-content: center;
  align-items: center;
  shadow-color: #000;
  shadow-offset: 0px 4px;
  shadow-opacity: 0.3;
  shadow-radius: 8px;
`;

const ModalContent = styled.View`
  padding: 20px;
  width: 100%;
`;

const SelectedDateRangeWrapper = styled.View`
  margin-top: 16px;
  padding: 12px;
  background-color: #F5F5F5;
  border-radius: 8px;
`;

const EditModalWrapper = styled.View`
  width: 100%;
  margin-vertical: 20px;
  border-radius: 4px;
  border: 1px solid #E9E9E9;
`;

const EditModalButton = styled.TouchableOpacity`
  width: 100%;
  padding: 16px 20px;
  align-items: center;
`;

const EditModalDivider = styled.View`
  width: 100%;
  height: 1px;
  background-color: #E9E9E9;
`;
