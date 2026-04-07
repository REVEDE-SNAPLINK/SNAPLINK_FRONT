import ScreenContainer from '@/components/layout/ScreenContainer';
import styled from '@/utils/scale/CustomStyled.ts';
import { Typography } from '@/components/ui';
import MoreIcon from '@/assets/icons/more.svg'
import IconButton from '@/components/ui/IconButton.tsx';
import { formatNumber } from '@/utils/format.ts';
import { useState } from 'react';
import SlideModal from '@/components/ui/SlideModal.tsx';
import { theme } from '@/theme';
import Icon from '@/components/ui/Icon.tsx';
import CrossIcon from '@/assets/icons/cross-white.svg'
import {
  EditingDeadline,
  EditingType,
  GetShootingOptionResponse,
  GetShootingResponse,
  SelectionAuthority,
} from '@/api/shootings.ts';
import { GetWeeklyScheduleRespnose } from '@/api/schedules.ts';
import { DayOfWeek } from '@/api/photographers.ts';

interface ShootingWithOptions extends GetShootingResponse {
  optionalOptions?: GetShootingOptionResponse[];
}

interface ShootingManageViewProps {
  onPressBack: () => void;
  onPressCreateProduct: () => void;
  onPressEditProduct: (productId: number) => void;
  onPressDeleteProduct: (productId: number) => void;
  onPressEditSchedule: () => void;
  onChangeDefault: (productId: number) => void;
  shootings: ShootingWithOptions[];
  hasDefault: boolean;
  weeklySchedule: GetWeeklyScheduleRespnose[];
  navigation?: any;
}

const DAY_OF_WEEK_MAP: Record<DayOfWeek, string> = {
  MONDAY: '월요일',
  TUESDAY: '화요일',
  WEDNESDAY: '수요일',
  THURSDAY: '목요일',
  FRIDAY: '금요일',
  SATURDAY: '토요일',
  SUNDAY: '일요일',
};

const formatLocalTime = (time: string) => {
  const arr = time.split(':');
  return `${arr[0]}:${arr[1]}`;
}

export default function ShootingManageView({
  onPressBack,
  onPressCreateProduct,
  onPressEditProduct,
  onPressDeleteProduct,
  onPressEditSchedule,
  onChangeDefault,
  shootings,
  hasDefault,
  weeklySchedule,
  navigation,}: ShootingManageViewProps) {
  const [productId, setProductId] = useState<number | null>(null);
  const [isDefaultSelectedProduct, setIsDefaultSelectedProduct] = useState<boolean>(false);
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [scheduleModalVisible, setScheduleModalVisible] = useState<boolean>(false);

  return (
    <>
      <ScreenContainer
        headerShown={true}
        headerTitle="촬영 판매 서비스 관리"
        onPressBack={onPressBack}
        navigation={navigation}
      >
        <ScrollContainer>
          <ShootingOptionContainer>
            <ShootingOptionHeader>
              <Typography fontSize={16} fontWeight="semiBold">
                촬영 일정
              </Typography>
              <IconButton
                width={24}
                height={24}
                Svg={MoreIcon}
                onPress={() => setScheduleModalVisible(true)}
              />
            </ShootingOptionHeader>
            <ShootingOptionContent>
              <Typography
                fontSize={12}
                lineHeight="140%"
                letterSpacing="-2.5%"
                color="#C8C8C8"
              >
                촬영 요일
              </Typography>
              <ShootingOptionValueWrapper>
                {weeklySchedule.length === 0 ? (
                  <Typography
                    fontSize={12}
                    lineHeight="140%"
                    letterSpacing="-2.5%"
                    color="textSecondary"
                  >
                    설정된 요일 없음
                  </Typography>
                ) : (
                  weeklySchedule.map((w, index) => (
                    <Typography
                      key={index}
                      fontSize={12}
                      lineHeight="140%"
                      letterSpacing="-2.5%"
                      color="textSecondary"
                    >
                      {DAY_OF_WEEK_MAP[w.dayOfWeek]} :{' '}
                      {formatLocalTime(w.startTime)} ~{' '}
                      {formatLocalTime(w.endTime)}
                    </Typography>
                  ))
                )}
              </ShootingOptionValueWrapper>
            </ShootingOptionContent>
          </ShootingOptionContainer>
          {shootings.length > 0 &&
            shootings.map((shooting, index) => (
              <ShootingOption
                key={shooting.id}
                id={shooting.id}
                isDefault={hasDefault ? shooting.isDefault : index === 0}
                onPressMore={() => {
                  setIsDefaultSelectedProduct(shooting.isDefault);
                  setProductId(shooting.id);
                  setModalVisible(true);
                }}
                name={shooting.shoootingName}
                // days={''}
                type={`${shooting.personnel}인 촬영`}
                photoTime={shooting.photoTime}
                basePrice={shooting.basePrice}
                providesRawFile={shooting.providesRawFile}
                editingType={shooting.editingType}
                editingDeadline={shooting.editingDeadline}
                selectionAuthority={shooting.selectionAuthority}
                providedEditCount={shooting.providedEditCount}
                options={
                  shooting.optionalOptions &&
                  shooting.optionalOptions.length > 0
                    ? shooting.optionalOptions
                    : []
                }
              />
            ))}
        </ScrollContainer>
        <FloatingButton onPress={onPressCreateProduct}>
          <Icon width={20} height={20} Svg={CrossIcon} />
        </FloatingButton>
      </ScreenContainer>
      <SlideModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        showHeader={false}
        height={isDefaultSelectedProduct ? 250 : 300}
        scrollable={false}
      >
        <EditModalWrapper>
          {!isDefaultSelectedProduct &&
            <>
              <EditModalButton
                onPress={() => {
                  if (productId !== null) {
                    onChangeDefault(productId);
                    setModalVisible(false);
                  }
                }}
              >
                <Typography fontSize={16} letterSpacing="-2.5%">
                  기본상품으로 변경
                </Typography>
              </EditModalButton>
              <EditModalDivider />
            </>
          }
          <EditModalButton
            onPress={() => {
              if (productId !== null) {
                onPressEditProduct(productId);
                setModalVisible(false);
              }
            }}
          >
            <Typography fontSize={16} letterSpacing="-2.5%">
              수정
            </Typography>
          </EditModalButton>
          <EditModalDivider />
          <EditModalButton
            onPress={() => {
              if (productId !== null) {
                onPressDeleteProduct(productId);
                setModalVisible(false);
              }
            }}
          >
            <Typography fontSize={16} letterSpacing="-2.5%" color="#FF0000">
              삭제
            </Typography>
          </EditModalButton>
          <EditModalDivider />
          <EditModalButton onPress={() => setModalVisible(false)}>
            <Typography fontSize={16} letterSpacing="-2.5%" color="#A4A4A4">
              닫기
            </Typography>
          </EditModalButton>
        </EditModalWrapper>
      </SlideModal>
      <SlideModal
        visible={scheduleModalVisible}
        onClose={() => setScheduleModalVisible(false)}
        showHeader={false}
        height={200}
        scrollable={false}
      >
        <EditModalWrapper>
          <EditModalButton
            onPress={() => {
              setScheduleModalVisible(false);
              onPressEditSchedule();
            }}
          >
            <Typography fontSize={16} letterSpacing="-2.5%">
              수정
            </Typography>
          </EditModalButton>
          <EditModalDivider />
          <EditModalButton onPress={() => setScheduleModalVisible(false)}>
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
`

const ShootingOptionContainer = styled.View`
  padding: 22px 25px;
  background-color: #fff;
  margin-top: 14px;
`

const ShootingOptionHeader = styled.View`
  width: 100%;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
`

const ShootingOptionHeaderTextWrapper = styled.View`
  flex-direction: row;
  align-items: center;
`

const ShootingOptionHeaderDefaultLabel = styled.View`
  border: 1px solid #737373;
  padding: 3px 5px;
  border-radius: 10px;
  margin-left: 10px;
`

const ShootingOptionContent = styled.View`
  width: 100%;
  flex-direction: row;
  margin-top: 12px;
`

const ShootingOptionValueWrapper = styled.View`
  margin-left: 16px;
`

export interface ShootingOptionResponse {
  id: number;
  name: string;
  isDefault: boolean;
  type: string;
  photoTime: number;
  basePrice: number;
  providesRawFile: boolean;
  editingType: EditingType;
  editingDeadline: EditingDeadline;
  selectionAuthority: SelectionAuthority;
  providedEditCount: number;
  options?: GetShootingOptionResponse[];
}

interface ShootingOptionProps extends ShootingOptionResponse{
  onPressMore: () => void;
}

const ShootingOption = ({
  onPressMore,
  name,
  isDefault,
  type,
  photoTime,
  basePrice,
  providesRawFile,
  editingType,
  editingDeadline,
  selectionAuthority,
  providedEditCount,
  options
}: ShootingOptionProps) => {
  const photoHour = ~~(photoTime / 60);
  const photoMinute = photoTime % 60;

  return (
    <ShootingOptionContainer>
      <ShootingOptionHeader>
        <ShootingOptionHeaderTextWrapper>
          <Typography fontSize={16} fontWeight="semiBold">
            {name}
          </Typography>
          {isDefault && (
            <ShootingOptionHeaderDefaultLabel>
              <Typography fontSize={12} color="#737373">기본상품</Typography>
            </ShootingOptionHeaderDefaultLabel>
          )}
        </ShootingOptionHeaderTextWrapper>
        <IconButton width={24} height={24} Svg={MoreIcon} onPress={onPressMore} />
      </ShootingOptionHeader>
      <ShootingOptionContent>
        <Typography
          fontSize={12}
          lineHeight="140%"
          letterSpacing="-2.5%"
          color="#C8C8C8"
        >
          촬영 항목
        </Typography>
        <ShootingOptionValueWrapper>
          <Typography
            fontSize={12}
            lineHeight="140%"
            letterSpacing="-2.5%"
            color="textSecondary"
          >
            {type}
          </Typography>
        </ShootingOptionValueWrapper>
      </ShootingOptionContent>
      <ShootingOptionContent>
        <Typography
          fontSize={12}
          lineHeight="140%"
          letterSpacing="-2.5%"
          color="#C8C8C8"
        >
          촬영 시간
        </Typography>
        <ShootingOptionValueWrapper>
          <Typography
            fontSize={12}
            lineHeight="140%"
            letterSpacing="-2.5%"
            color="textSecondary"
          >
            {`${photoHour}시간 ${photoMinute === 0 ? '' : photoMinute + '분'}`}
          </Typography>
        </ShootingOptionValueWrapper>
      </ShootingOptionContent>
      <ShootingOptionContent>
        <Typography
          fontSize={12}
          lineHeight="140%"
          letterSpacing="-2.5%"
          color="#C8C8C8"
        >
          촬영 비용
        </Typography>
        <ShootingOptionValueWrapper>
          <Typography
            fontSize={12}
            lineHeight="140%"
            letterSpacing="-2.5%"
            color="textSecondary"
          >
            {formatNumber(basePrice)}원
          </Typography>
        </ShootingOptionValueWrapper>
      </ShootingOptionContent>
      {(providesRawFile || editingType !== 'NONE') && (
        <ShootingOptionContent>
          <Typography
            fontSize={12}
            lineHeight="140%"
            letterSpacing="-2.5%"
            color="#C8C8C8"
          >
            제공 항목
          </Typography>
          <ShootingOptionValueWrapper>
            {providesRawFile && (
              <Typography
                fontSize={12}
                lineHeight="140%"
                letterSpacing="-2.5%"
                color="textSecondary"
              >
                원본 파일
              </Typography>
            )}
            <Typography
              fontSize={12}
              lineHeight="140%"
              letterSpacing="-2.5%"
              color="textSecondary"
            >
              {editingType === 'FACIAL' ? '얼굴 보정' : editingType === 'COLOR' ? '색감 보정' : '얼굴, 색감 보정'}
            </Typography>
            <Typography
              fontSize={12}
              lineHeight="140%"
              letterSpacing="-2.5%"
              color="textSecondary"
            >
              {editingDeadline === 'SAME_DAY' ? '당일 보정' : `${editingDeadline === 'WITHIN_2_DAYS' ? '2' : editingDeadline === 'WITHIN_3_DAYS' ? '3' : editingDeadline === 'WITHIN_4_DAYS' ? '4' : editingDeadline === 'WITHIN_5_DAYS' ? '5' : '7' }일 이내`}
            </Typography>
            <Typography
              fontSize={12}
              lineHeight="140%"
              letterSpacing="-2.5%"
              color="textSecondary"
            >
              {selectionAuthority === 'PHOTOGRAPHER' ? '보정 사진 작가만 선택 가능' : selectionAuthority === 'CUSTOMER' ? '보정 사진 고객만 선택 가능' : '보정 사진 작가, 고객 둘다 선택 가능'}
            </Typography>
            <Typography
              fontSize={12}
              lineHeight="140%"
              letterSpacing="-2.5%"
              color="textSecondary"
            >
              제공 사진 {providedEditCount}개
            </Typography>
          </ShootingOptionValueWrapper>
        </ShootingOptionContent>
      )}
      {options && options.length > 0 && (
        <ShootingOptionContent>
          <Typography
            fontSize={12}
            lineHeight="140%"
            letterSpacing="-2.5%"
            color="#C8C8C8"
          >
            부가 옵션
          </Typography>
          <ShootingOptionValueWrapper>
            {options.map((v, i) => (
              <Typography
                key={i}
                fontSize={12}
                lineHeight="140%"
                letterSpacing="-2.5%"
                color="textSecondary"
              >
                {v.name}{v.additionalTime === 0 ? '' : `(${v.additionalTime}분)`} @{formatNumber(v.price)}원
              </Typography>
            ))}
          </ShootingOptionValueWrapper>
        </ShootingOptionContent>
      )}
    </ShootingOptionContainer>
  );
}

const EditModalWrapper = styled.View`
  width: 100%;
  border: 1px solid #EAEAEA;
  border-radius: 4px;
`

const EditModalButton = styled.TouchableOpacity`
  padding: 18px;
  align-items: center;
`;

const EditModalDivider = styled.View`
  height: 1px;
  background-color: #EAEAEA;
`;

const FloatingButton = styled.TouchableOpacity`
  width: 38px;
  height: 38px;
  border-radius: 38px;
  background-color: ${theme.colors.primary};
  align-items: center;
  justify-content: center;
  position: absolute;
  bottom: 28px;
  right: 19px;
  z-index: 1000;
  box-shadow: 0 4px 4px rgba(0, 0, 0, 0.25);
`
