import styled from 'styled-components/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '@/constants/theme.ts';
import BackButton from '@/components/BackButton.tsx';
import AppText from '@/components/AppText.tsx';
import ProfileIcon from '@/assets/imgs/profile.svg';
import Select from '@/components/form/Select';
import { Input, IconInput } from '@/components/form/Input';
import { FlatList, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import SubmitButton from '@/components/SubmitButton.tsx';
import ConsentIcon from '@/assets/icons/consent.svg';
import { Consent } from '@/types/auth';

const GENDER = ['남성', '여성']

interface ApplyPhotographerProps {
  onPressBackButton: () => void;
  onPressSelectProfileImageButton: () => void;
  isUploadedProfileImage: boolean;
  profileImageURI: string | null;
  name: string;
  setName: (name: string) => void;
  gender: number | null;
  setGender: (idx: number) => void;
  onPressSelectBirthdayButton: () => void;
  birthday: string;
  onPressSelectLocationButton: () => void;
  location: string;
  categoryList: string[];
  category: number | null;
  setCategory: (idx: number) => void;
  photofolioImageURIs: string[];
  onPressSelectPhotofolioImageButton: () => void;
  onPressDeletePhotofolioImageButton: (index: number) => void;
  introduction: string;
  setIntroduction: (introduction: string) => void;
  isValid: boolean;
  onSubmit: () => void;
  consents: Consent[];
  allChecked: boolean;
  onToggleAllConsents: () => void;
  onToggleConsent: (consentId: string) => void;
}

export default function ApplyPhotographerView({
  onPressBackButton,
  onPressSelectProfileImageButton,
  isUploadedProfileImage,
  profileImageURI,
  name,
  setName,
  gender,
  setGender,
  onPressSelectBirthdayButton,
  birthday,
  onPressSelectLocationButton,
  location,
  categoryList,
  category,
  setCategory,
  photofolioImageURIs,
  onPressSelectPhotofolioImageButton,
  onPressDeletePhotofolioImageButton,
  introduction,
  setIntroduction,
  isValid,
  onSubmit,
  consents,
  allChecked,
  onToggleAllConsents,
  onToggleConsent,
}: ApplyPhotographerProps) {
  return (
    <Container edges={['top']}>
      <Header>
        <StyledBackButton onPress={onPressBackButton} />
        <HeaderTextWrapper>
          <AppText
            color="black"
            fontSize={18}
            fontWeight={600}
            lineHeight={25.2}
            letterSpacing={-0.45}
          >
            작가 프로필 작성
          </AppText>
          <AppText
            color="textSecondary"
            fontSize={14}
            fontWeight={400}
            lineHeight={19.6}
            letterSpacing={-0.35}
          >
            사용자들에게 작가님을 소개해 주세요
          </AppText>
        </HeaderTextWrapper>
      </Header>
      <StyledKeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <ScrollView
          persistentScrollbar={false}
          nestedScrollEnabled
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: theme.verticalScale(40) }}
        >
          <DefaultInfoFormWrapper>
            <ProfileImageWrapper>
              <SelectProfileImageButton
                onPress={onPressSelectProfileImageButton}
              >
                {isUploadedProfileImage && profileImageURI !== null ? (
                  <SelectProfileImage source={{ uri: profileImageURI }} />
                ) : (
                  <StyledProfileIcon />
                )}
              </SelectProfileImageButton>
              {isUploadedProfileImage && <PlusIcon />}
            </ProfileImageWrapper>
            <DefaultInfoInputWrapper>
              <Input
                placeholder="이름"
                marginBottom={10}
                value={name}
                onChangeText={setName}
              />
              <Select itemWidth={80} items={GENDER} value={gender} setValue={setGender} />
            </DefaultInfoInputWrapper>
          </DefaultInfoFormWrapper>
          <IconInput
            width="100%"
            marginBottom={11.99}
            Icon={<InputIcon source={require('@/assets/icons/calendar.png')} />}
            placeholder="생년월일"
            value={birthday}
            onPress={onPressSelectBirthdayButton}
          />
          <IconInput
            width="100%"
            marginBottom={13.98}
            Icon={<InputIcon source={require('@/assets/icons/location.png')} />}
            placeholder="활동 지역을 선택해주세요"
            value={location}
            onPress={onPressSelectLocationButton}
          />
          <AppText
            color="black"
            fontSize={16}
            fontWeight={500}
            lineHeight={20}
            marginLeft={2.98}
            marginBottom={9.01}
          >
            촬영 유형
          </AppText>
          <Select itemWidth="24%" items={categoryList} value={category} setValue={setCategory} />
          <AppText
            color="black"
            fontSize={16}
            fontWeight={600}
            lineHeight={22.4}
            letterSpacing={-0.4}
            marginTop={30.03}
            marginLeft={2.98}
            marginBottom={3.99}
          >
            포토폴리오
          </AppText>
          <AppText
            color="textSecondary"
            fontSize={16}
            fontWeight={400}
            lineHeight={22.4}
            letterSpacing={-0.4}
            marginLeft={2.98}
            marginBottom={12.99}
          >
            사용자들에게 작가님을 대표 작품을 소개해주세요
          </AppText>
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={['add', ...photofolioImageURIs]}
            keyExtractor={(item, index) => item + index}
            style={{ overflow: 'visible' }}
            contentContainerStyle={{ paddingVertical: theme.verticalScale(8) }}
            renderItem={({ item, index }) =>
              item === 'add' ? (
                <UploadPhotofolioButton
                  onPress={onPressSelectPhotofolioImageButton}
                >
                  <AppText color="black" fontSize={30} fontWeight={400}>
                    +
                  </AppText>
                </UploadPhotofolioButton>
              ) : (
                <PhotofolioImageWrapper>
                  <PhotographerImage source={{ uri: item }} />
                  <DeletePhotofolioButton
                    onPress={() =>
                      onPressDeletePhotofolioImageButton(index - 1)
                    }
                  >
                    <AppText
                      color="black"
                      fontSize={18}
                      fontWeight={400}
                      lineHeight={18}
                    >
                      ×
                    </AppText>
                  </DeletePhotofolioButton>
                </PhotofolioImageWrapper>
              )
            }
          />
          <AppText
            color="black"
            fontSize={16}
            fontWeight={600}
            lineHeight={22.4}
            letterSpacing={-0.4}
            marginLeft={2.98}
            marginTop={20.04}
            marginBottom={3.99}
          >
            자기소개
          </AppText>
          <AppText
            color="textSecondary"
            fontSize={16}
            fontWeight={400}
            lineHeight={22.4}
            letterSpacing={-0.4}
            marginLeft={2.98}
            marginBottom={11.98}
          >
            사용자들에게 작가님에 대해 이야기해 주세요
          </AppText>
          <Input
            placeholder="입력"
            value={introduction}
            onChangeText={setIntroduction}
            multiline
            height={100}
            marginBottom={30}
          />
          <ConsentInput
            isChecked={allChecked}
            onPress={onToggleAllConsents}
            title="전체 동의"
          />
          <Divider />
          {consents.map((consent) => (
            <ConsentInput
              key={consent.id}
              isChecked={consent.isChecked}
              onPress={() => onToggleConsent(consent.id)}
              title={consent.title}
              marginBottom={5}
            />
          ))}
          <SubmitButton
            text="완료"
            disabled={!isValid}
            onPress={onSubmit}
            marginTop={30}
          />
        </ScrollView>
      </StyledKeyboardAvoidingView>
    </Container>
  );
}

const Container = styled(SafeAreaView)`
  flex: 1;
  padding-left: ${theme.horizontalScale(28)};
  padding-right: ${theme.horizontalScale(28)};
`

const Header = styled.View`
  margin-top: ${theme.verticalScale(11.98)}px;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  margin-bottom: ${theme.verticalScale(25)};
`;

const StyledBackButton = styled(BackButton)`
  position: absolute;
  left: 0;
`;

const HeaderTextWrapper = styled.View`
  align-items: center;
`;

const StyledKeyboardAvoidingView = styled(KeyboardAvoidingView)`
  flex: 1;
`;

const DefaultInfoFormWrapper = styled.View`
  margin-top: ${theme.verticalScale(25.98)};
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  margin-bottom: ${theme.verticalScale(32.01)};
`

const ProfileImageWrapper = styled.View`
  width: ${theme.moderateScale(100)};
  height: ${theme.moderateScale(100)};
`

const SelectProfileImageButton = styled.TouchableOpacity`
  width: 100%;
  height: 100%;
  border-radius: ${theme.moderateScale(50)}px;
  overflow: hidden;
`

const StyledPlusIcon = styled.View`
  width: ${theme.moderateScale(30)};
  height: ${theme.moderateScale(30)};
  background-color: ${theme.colors.white};
  border-radius: 50%;
  align-items: center;
  position: absolute;
  bottom: 5px;
  right: 0;
`

const PlusIcon = () => {
  return (
    <StyledPlusIcon>
      <AppText
        color="black"
        fontSize={30}
        fontWeight={400}
        lineHeight={25}
      >+</AppText>
    </StyledPlusIcon>
  )
}

const SelectProfileImage = styled.Image`
  width: 100%;
  height: 100%;
`

const StyledProfileIcon = styled(ProfileIcon)`
  width: 100%;
  height: 100%;
`

const DefaultInfoInputWrapper = styled.View`
  width: ${theme.horizontalScale(166)};
`

const InputIcon = styled.Image`
  max-width: ${theme.moderateScale(20)};
  max-height: ${theme.moderateScale(20)};
`

const UploadPhotofolioButton = styled.TouchableOpacity`
  width: ${theme.moderateScale(80)};
  height: ${theme.moderateScale(80)};
  border-radius: ${theme.moderateScale(10)}px;
  background-color: #D9D9D9;
  justify-content: center;
  align-items: center;
`

const PhotofolioImageWrapper = styled.View`
  width: ${theme.moderateScale(80)};
  height: ${theme.moderateScale(80)};
  margin-left: ${theme.horizontalScale(7)};
  position: relative;
`

const PhotographerImage = styled.Image`
  width: 100%;
  height: 100%;
  border-radius: ${theme.moderateScale(10)}px;
`

const DeletePhotofolioButton = styled.TouchableOpacity`
  position: absolute;
  top: -${theme.moderateScale(6)}px;
  right: -${theme.moderateScale(6)}px;
  width: ${theme.moderateScale(24)};
  height: ${theme.moderateScale(24)};
  border-radius: ${theme.moderateScale(12)}px;
  background-color: ${theme.colors.white};
  justify-content: center;
  align-items: center;
  z-index: 10;
`

const ConsentButton = styled.TouchableOpacity<{ marginBottom?: number }>`
  flex-direction: row;
  width: 100%;
  align-items: center;
  height: ${theme.moderateScale(20)};
  ${({ marginBottom }) => marginBottom && `margin-bottom: ${theme.verticalScale(marginBottom)};`}
`

const ConsentIconWrapper = styled.View<{ isChecked: boolean }>`
  justify-content: center;
  align-items: center;
  border-radius: ${theme.moderateScale(5)}px;
  width: ${theme.moderateScale(20)};
  height: ${theme.moderateScale(20)};
  box-sizing: border-box;
  border: 1px solid ${({ isChecked }) => (isChecked ? 'transparent' : theme.colors.black)};
  margin-right: ${theme.horizontalScale(10)}px;
  background: ${({ isChecked }) => (isChecked ? theme.colors.primary: 'transparent')};
`

interface ConsentInputProps {
  isChecked: boolean;
  onPress: () => void;
  title: string;
  marginBottom?: number;
}

const ConsentInput = ({
  isChecked,
  onPress,
  title,
  marginBottom,
}: ConsentInputProps) => {
  return (
    <ConsentButton onPress={onPress} marginBottom={marginBottom}>
      <ConsentIconWrapper isChecked={isChecked}>
        <ConsentIcon
          width={theme.moderateScale(8)}
          height={theme.moderateScale(10)}
          color={isChecked ? theme.colors.white : theme.colors.disabled}
        />
      </ConsentIconWrapper>
      <AppText
        color="black"
        fontSize={15}
        fontWeight={400}
        lineHeight={15}
        letterSpacing={-0.375}
      >{title}</AppText>
    </ConsentButton>
  )
}

const Divider = styled.View`
  background-color: ${theme.colors.disabled};
  height: 1px;
  width: calc(100% - ${theme.horizontalScale(28)});
  margin-left: ${theme.horizontalScale(28)};
  margin-top: 2px;
  margin-bottom: ${theme.verticalScale(15)};
`