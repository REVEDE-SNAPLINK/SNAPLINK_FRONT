import { ReactElement, useMemo } from 'react';
import { Image, StyleSheet, Text, TouchableOpacityProps } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context'
import { useNavigation } from '@react-navigation/native';
import { AuthNavigationProp } from '@/types/navigation';
import styled from 'styled-components/native';
import { theme, boxShadow } from '@/constants/theme';
import AppText from '@/components/AppText.tsx';
import BackButton from '@/components/BackButton.tsx';
import Type1 from '@/assets/imgs/type1.svg';
import SubmitButton from '@/components/SubmitButton.tsx';

interface SelectTypeViewProps {
  isSelectedUser: boolean;
  isSelectedPhotographer: boolean;
  onPressUser: () => void;
  onPressPhotographer: () => void;
  isValid: boolean;
  onSubmit: () => void;
}

export default function SelectTypeView({
  isSelectedUser,
  isSelectedPhotographer,
  onPressUser,
  onPressPhotographer,
  isValid,
  onSubmit
}:  SelectTypeViewProps) {
  const navigation = useNavigation<AuthNavigationProp>();

  const UserImg = useMemo(() =>
    <Type1 width={theme.horizontalScale(100)} height={theme.verticalScale(100)} />,
    []);
  const PhotographerImg = useMemo(() =>
    <StyledImage source={require('@/assets/imgs/type2_2.png')} />, []);

  return (
    <Container>
      <Header>
        <StyledBackButton
          onPress={() => navigation.goBack()}
        />
        <AppText
          color="primary"
          fontWeight={800}
          fontSize={27}
          lineHeight={40}
          letterSpacing={-1.08}
        >Snaplink</AppText>
      </Header>
      <AppText
        color="textPrimary"
        fontSize={22}
        fontWeight={700}
        lineHeight={30}
        marginTop={42}
        marginBottom={38.98}
      >
        <Text style={{ color: theme.colors.primary }}>Snaplink</Text>
        에서 어떻게 서비스를{'\n'}이용하고 싶으신가요?
      </AppText>
      <SelectButton
        selected={isSelectedUser}
        Img={UserImg}
        title="의뢰인으로 이용"
        description={'내가 원하는 작가님을 찾아서\n사진 촬영을 하고 싶어요.'}
        onPress={onPressUser}
      />
      <Margin />
      <SelectButton
        selected={isSelectedPhotographer}
        Img={PhotographerImg}
        title="작가로 활동"
        description={'스냅 사진작가로 활동하고\n사진 촬영을 하고 싶어요.'}
        onPress={onPressPhotographer}
      />
      <InfoTextContainer>
        <AppText
          color="#959595"
          fontSize={14}
          fontWeight={500}
          lineHeight={19.6}
          letterSpacing={-0.35}
        >가입 이후에도 언제든 원하는 상태로 전환할 수 있어요!</AppText>
      </InfoTextContainer>
      <SubmitButton
        text="완료"
        marginTop={49.98}
        disabled={!isValid}
        onPress={onSubmit}
      />
    </Container>
  );
}

const Container = styled(SafeAreaView)`
  padding-left: ${theme.horizontalScale(20)};
  padding-right: ${theme.horizontalScale(20)};
`

const Header = styled.View`
  margin-top: ${theme.verticalScale(11.98)}px;
  flex-direction: row;
  justify-content: center;
  align-items: center;
`;

const StyledBackButton = styled(BackButton)`
  position: absolute;
  left: 0;
`;

const StyledImage = styled(Image)`
  width: ${theme.horizontalScale(79)}px;
  height: ${theme.verticalScale(58)}px;
`;

const InfoTextContainer = styled.View`
  align-items: center;
  margin-top: ${theme.verticalScale(25.96)}px;
`;

const Margin = styled.View`
  height: ${theme.verticalScale(20)}px;
`

/*-------*/

type SelectButtonProps = TouchableOpacityProps & {
  selected: boolean;
  Img: ReactElement;
  title: string;
  description: string;
  marginBottom?: number;
}

/** Select Type Button */
const SelectButton = ({
  selected,
  Img,
  title,
  description,
  ...rest
}: SelectButtonProps) => {
  return (
    <StyledSelectButton selected={selected} {...rest}>
      <ImgContainer>{Img}</ImgContainer>
      <TextContainer>
        <AppText
          color={selected ? 'white' : '#111'}
          fontSize={16}
          fontWeight={600}
          lineHeight={14}
          letterSpacing={-0.4}
          marginBottom={6.99}
        >{title}</AppText>
        <AppText
          color={selected ? 'white' : '#767676'}
          fontSize={12}
          fontWeight={500}
          lineHeight={16.8}
          letterSpacing={-0.3}
        >{description}</AppText>
      </TextContainer>
    </StyledSelectButton>
  );
}

const StyledSelectButton = styled.TouchableOpacity<{ selected: boolean; marginBottom?: number }>`
  width: 100%;
  height: ${theme.verticalScale(124)}px;
  padding-left: ${theme.horizontalScale(24)}px;
  flex-direction: row;
  align-items: center;
  background-color: ${({ selected }) => selected ? '#9E9E9E' : theme.colors.white };
  border-radius: ${theme.moderateScale(16)}px;
  ${StyleSheet.flatten(boxShadow.default)};
`

const ImgContainer = styled.View`
  width: ${theme.horizontalScale(100)}px;
`;

const TextContainer = styled.View`
  margin-left: ${theme.horizontalScale(15)}px;
`;

