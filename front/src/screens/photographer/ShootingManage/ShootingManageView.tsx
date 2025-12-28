import ScreenContainer from '@/components/common/ScreenContainer';
import styled from '@/utils/scale/CustomStyled.ts';
import { Typography } from '@/components/theme';
import MoreIcon from '@/assets/icons/more.svg'
import IconButton from '@/components/IconButton.tsx';
import { formatNumber } from '@/utils/format.ts';
import { useState } from 'react';
import SlideModal from '@/components/theme/SlideModal.tsx';
import { theme } from '@/theme';
import Icon from '@/components/Icon.tsx';
import CrossIcon from '@/assets/icons/cross-white.svg'

interface ShootingManageViewProps {
  onPressBack: () => void;
  onPressCreateOption: () => void;
  onPressEditOption: (optionId: number) => void;
  onPressDeleteOption: (optionId: number) => void;
  shootingOptions: ShootingOptionResponse[];
}

export default function ShootingManageView({
  onPressBack,
  onPressCreateOption,
  onPressEditOption,
  onPressDeleteOption,
  shootingOptions
}: ShootingManageViewProps) {
  const [optionId, setOptionId] = useState<number | null>(null);
  const [modalVisible, setModalVisible] = useState<boolean>(false);

  return (
    <>
      <ScreenContainer
        headerShown={true}
        headerTitle="촬영 판매 서비스 관리"
        onPressBack={onPressBack}
      >
        <ScrollContainer>
          {shootingOptions.length > 0 &&
            shootingOptions.map(option => (
              <ShootingOption
                key={option.id}
                id={option.id}
                onPressMore={() => {
                  setOptionId(option.id);
                  setModalVisible(true);
                }}
                name={option.name}
                days={option.days}
                type={option.type}
                baseTime={option.baseTime}
                basePrice={option.basePrice}
                isEnhanced={option.isEnhanced}
                isOriginal={option.isOriginal}
                enhancedPermission={option.enhancedPermission}
                optionalOptions={
                  option.optionalOptions && option.optionalOptions.length > 0
                    ? option.optionalOptions
                    : []
                }
              />
            ))}
        </ScrollContainer>
        <FloatingButton onPress={onPressCreateOption}>
          <Icon width={20} height={20} Svg={CrossIcon} />
        </FloatingButton>
      </ScreenContainer>
      <SlideModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        showHeader={false}
        minHeight={200}
      >
        <EditModalWrapper>
          <EditModalButton
            onPress={() => {
              if (optionId !== null) {
                onPressEditOption(optionId);
              }
            }}
          >
            <Typography fontSize={16} letterSpacing="-2.5%">
              수정
            </Typography>
          </EditModalButton>
          <EditModalDivider />
          <EditModalButton onPress={() => {
            if (optionId !== null) {
              onPressDeleteOption(optionId)
            }
          }}>
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

const ShootingOptionContent = styled.View`
  width: 100%;
  flex-direction: row;
  align-items: center;
  margin-top: 12px;
`

const ShootingOptionValueWrapper = styled.View`
  margin-left: 16px;
`

export interface ShootingOptionResponse {
  id: number;
  name: string;
  days: string[];
  type: string;
  baseTime: number;
  basePrice: number;
  isEnhanced: string;
  isOriginal: boolean;
  enhancedPermission: string;
  optionalOptions?: OptionalOption[];
}

interface ShootingOptionProps extends ShootingOptionResponse{
  onPressMore: () => void;
}

interface OptionalOption {
  name: string;
  price: number;
}

const ShootingOption = ({
  onPressMore,
  name,
  days,
  type,
  baseTime,
  basePrice,
  isEnhanced,
  isOriginal,
  enhancedPermission,
  optionalOptions
}: ShootingOptionProps) => {
  return (
    <ShootingOptionContainer>
      <ShootingOptionHeader>
        <Typography fontSize={16} fontWeight="semiBold">
          {name}
        </Typography>
        <IconButton width={24} height={24} Svg={MoreIcon} onPress={onPressMore} />
      </ShootingOptionHeader>
      <ShootingOptionContent>
        <Typography
          fontSize={12}
          lineHeight="140%"
          letterSpacing="-2.5%"
          color="#C8C8C8"
        >
          촬영 일정
        </Typography>
        <ShootingOptionValueWrapper>
          <Typography
            fontSize={12}
            lineHeight="140%"
            letterSpacing="-2.5%"
            color="textSecondary"
          >
            {days.length > 0 ? days.join(',') : ''}
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
            {baseTime}시간
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
      {(isOriginal || isEnhanced !== '제공하지 않음') && (
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
            <Typography
              fontSize={12}
              lineHeight="140%"
              letterSpacing="-2.5%"
              color="textSecondary"
            >
              {enhancedPermission}
            </Typography>
            {isOriginal && (
              <Typography
                fontSize={12}
                lineHeight="140%"
                letterSpacing="-2.5%"
                color="textSecondary"
              >
                원본 파일
              </Typography>
            )}
            {/*  TODO: 보정 사진 선택 권한 옵션 입력 추가 */}
          </ShootingOptionValueWrapper>
        </ShootingOptionContent>
      )}
      {optionalOptions && optionalOptions.length > 0 && (
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
            {optionalOptions.map((v, i) => (
              <Typography
                key={i}
                fontSize={12}
                lineHeight="140%"
                letterSpacing="-2.5%"
                color="textSecondary"
              >
                {v.name} @{formatNumber(v.price)}원
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
