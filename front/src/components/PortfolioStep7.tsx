import { Control, Controller } from 'react-hook-form';
import { ScrollView } from 'react-native';
import styled from '@/utils/scale/CustomStyled.ts';
import { Typography } from '@/components/theme';
import DropDownInput from '@/components/form/DropDownInput.tsx';

export interface Step7FormData {
  retouchingType: string | null;
  retouchingDuration: string | null;
  retouchingSelectionRight: string | null;
}

interface PortfolioStep7Props<T extends Step7FormData> {
  control: Control<T>;
}

export default function PortfolioStep7<T extends Step7FormData>({
  control
}: PortfolioStep7Props<T>) {
  const retouchingType = control._formValues.retouchingType;
  const showRetouchingDetails = retouchingType && retouchingType !== '제공하지 않음';

  return (
    <>
      <Typography fontSize={18} lineHeight="140%" marginBottom={24}>
        <Typography fontSize={18} fontWeight="semiBold" lineHeight="140%">
          보정 정보
        </Typography>
        를 자세히 알려주세요.
      </Typography>
      <ScrollView>
        <Typography
          fontSize={16}
          letterSpacing="-2.5%"
          marginBottom={10}
        >
          보정 작업 제공
        </Typography>
        <Controller
          control={control}
          name="retouchingType"
          render={({ field: { onChange, value } }) => (
            <DropDownInput
              placeholder="선택해주세요 *"
              options={['얼굴 보정', '색감 보정', '얼굴, 색감 보정', '제공하지 않음']}
              value={value || undefined}
              onChange={onChange}
            />
          )}
        />
        {showRetouchingDetails && (
          <>
            <Typography
              fontSize={16}
              letterSpacing="-2.5%"
              marginBottom={10}
              marginTop={25}
            >
              보정 작업 소요 기간
            </Typography>
            <Controller
              control={control}
              name="retouchingDuration"
              render={({ field: { onChange, value } }) => (
                <DropDownInput
                  placeholder="선택해주세요 *"
                  options={['당일 보정', '2일 이내', '3일 이내', '4일 이내', '5일 이내', '7일 이내']}
                  value={value || undefined}
                  onChange={onChange}
                />
              )}
            />
            <Typography
              fontSize={16}
              letterSpacing="-2.5%"
              marginBottom={10}
              marginTop={25}
            >
              보정 사진 선택 권한
            </Typography>
            <Controller
              control={control}
              name="retouchingSelectionRight"
              render={({ field: { onChange, value } }) => (
                <DropDownInput
                  placeholder="선택해주세요 *"
                  options={['작가 선택', '고객 선택', '작가와 고객 함께 선택']}
                  value={value || undefined}
                  onChange={onChange}
                />
              )}
            />
          </>
        )}
        <ScrollViewSpacer />
      </ScrollView>
    </>
  );
}

const ScrollViewSpacer = styled.View`
  height: 100px;
`;
