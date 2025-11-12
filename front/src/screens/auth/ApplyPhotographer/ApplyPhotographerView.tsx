import { FlatList, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import styled from '@/utils/scale/CustomStyled';
import Typography from '@/components/theme/Typography';
import BackButton from '@/components/BackButton';
import SubmitButton from '@/components/theme/SubmitButton';
import TextInput from '@/components/theme/TextInput';
import ProfileIcon from '@/assets/imgs/profile.svg';
import ConsentIcon from '@/assets/icons/consent.svg';
import { Consent } from '@/types/auth';

const GENDER = ['남성', '여성'];

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
          <Typography
            fontSize={18}
            fontWeight="semiBold"
            lineHeight={25.2}
            letterSpacing={-0.45}
          >
            작가 프로필 작성
          </Typography>
          <Typography
            color="#8E8E93"
            fontSize={14}
            fontWeight="regular"
            lineHeight={19.6}
            letterSpacing={-0.35}
          >
            사용자들에게 작가님을 소개해 주세요
          </Typography>
        </HeaderTextWrapper>
      </Header>

      <StyledKeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <StyledScrollView
          persistentScrollbar={false}
          nestedScrollEnabled
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <DefaultInfoFormWrapper>
            <ProfileImageWrapper>
              <SelectProfileImageButton onPress={onPressSelectProfileImageButton}>
                {isUploadedProfileImage && profileImageURI !== null ? (
                  <SelectProfileImage source={{ uri: profileImageURI }} />
                ) : (
                  <StyledProfileIcon />
                )}
              </SelectProfileImageButton>
              {isUploadedProfileImage && <PlusIcon />}
            </ProfileImageWrapper>

            <DefaultInfoInputWrapper>
              <InputWrapper>
                <TextInput
                  placeholder="이름"
                  value={name}
                  onChangeText={setName}
                  width="100%"
                />
              </InputWrapper>
              <Select items={GENDER} value={gender} setValue={setGender} itemWidth={80} />
            </DefaultInfoInputWrapper>
          </DefaultInfoFormWrapper>

          <IconInput
            placeholder="생년월일"
            value={birthday}
            onPress={onPressSelectBirthdayButton}
            iconSource={require('@/assets/icons/calendar.png')}
          />

          <IconInput
            placeholder="활동 지역을 선택해주세요"
            value={location}
            onPress={onPressSelectLocationButton}
            iconSource={require('@/assets/icons/location.png')}
          />

          <SectionTitle>촬영 유형</SectionTitle>
          <Select items={categoryList} value={category} setValue={setCategory} itemWidth="24%" />

          <SectionTitleBold>포토폴리오</SectionTitleBold>
          <SectionDescription>
            사용자들에게 작가님을 대표 작품을 소개해주세요
          </SectionDescription>

          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={['add', ...photofolioImageURIs]}
            keyExtractor={(item, index) => item + index}
            style={{ overflow: 'visible' }}
            contentContainerStyle={{ paddingVertical: 8 }}
            renderItem={({ item, index }) =>
              item === 'add' ? (
                <UploadPhotofolioButton onPress={onPressSelectPhotofolioImageButton}>
                  <Typography fontSize={30} fontWeight="regular">
                    +
                  </Typography>
                </UploadPhotofolioButton>
              ) : (
                <PhotofolioImageWrapper>
                  <PhotographerImage source={{ uri: item }} />
                  <DeletePhotofolioButton
                    onPress={() => onPressDeletePhotofolioImageButton(index - 1)}
                  >
                    <Typography fontSize={18} fontWeight="regular" lineHeight={18}>
                      ×
                    </Typography>
                  </DeletePhotofolioButton>
                </PhotofolioImageWrapper>
              )
            }
          />

          <SectionTitleBold style={{ marginTop: 20.04 }}>자기소개</SectionTitleBold>
          <SectionDescription>
            사용자들에게 작가님에 대해 이야기해 주세요
          </SectionDescription>

          <TextInput
            placeholder="입력"
            value={introduction}
            onChangeText={setIntroduction}
            multiline
            height={100}
            maxLength={500}
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

          <SubmitButtonWrapper>
            <SubmitButton text="완료" disabled={!isValid} onPress={onSubmit} />
          </SubmitButtonWrapper>
        </StyledScrollView>
      </StyledKeyboardAvoidingView>
    </Container>
  );
}

// ===== Select Component (임시) =====
interface SelectProps {
  items: string[];
  value: number | null;
  setValue: (index: number) => void;
  itemWidth: number | string;
}

const Select = ({ items, value, setValue, itemWidth }: SelectProps) => {
  return (
    <SelectContainer>
      {items.map((item, index) => (
        <SelectItem
          key={index}
          onPress={() => setValue(index)}
          $selected={value === index}
          $itemWidth={itemWidth}
        >
          <Typography
            fontSize={14}
            fontWeight="medium"
            color={value === index ? '#FFFFFF' : '#000000'}
          >
            {item}
          </Typography>
        </SelectItem>
      ))}
    </SelectContainer>
  );
};

const SelectContainer = styled.View`
  flex-direction: row;
  flex-wrap: wrap;
  gap: 8px;
`;

const SelectItem = styled.TouchableOpacity<{ $selected: boolean; $itemWidth: number | string }>`
  width: ${({ $itemWidth }) => typeof $itemWidth === 'string' ? $itemWidth : `${$itemWidth}px`};
  height: 40px;
  justify-content: center;
  align-items: center;
  border-radius: 8px;
  background-color: ${({ $selected }) => $selected ? '#00A980' : '#F0F0F0'};
`;

// ===== IconInput Component (임시) =====
interface IconInputProps {
  placeholder: string;
  value: string;
  onPress: () => void;
  iconSource: any;
}

const IconInput = ({ placeholder, value, onPress, iconSource }: IconInputProps) => {
  return (
    <IconInputWrapper>
      <InputIcon source={iconSource} />
      <IconInputButton onPress={onPress}>
        <Typography
          fontSize={14}
          fontWeight="regular"
          color={value ? '#000000' : '#8E8E93'}
        >
          {value || placeholder}
        </Typography>
      </IconInputButton>
    </IconInputWrapper>
  );
};

const IconInputWrapper = styled.View`
  flex-direction: row;
  align-items: center;
  width: 100%;
  height: 43px;
  border: 1px solid #E5E5EA;
  border-radius: 8px;
  padding: 0px 15px;
  margin-bottom: 11.99px;
`;

const IconInputButton = styled.TouchableOpacity`
  flex: 1;
  justify-content: center;
  margin-left: 10px;
`;

// ===== Styled Components =====
const Container = styled(SafeAreaView)`
  flex: 1;
  padding: 0px 28px;
`;

const Header = styled.View`
  margin-top: 11.98px;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  margin-bottom: 25px;
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

const StyledScrollView = styled(ScrollView)`
  padding-bottom: 40px;
`;

const DefaultInfoFormWrapper = styled.View`
  margin-top: 25.98px;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 32.01px;
`;

const ProfileImageWrapper = styled.View`
  width: 100px;
  height: 100px;
`;

const SelectProfileImageButton = styled.TouchableOpacity`
  width: 100%;
  height: 100%;
  border-radius: 50px;
  overflow: hidden;
`;

const StyledPlusIcon = styled.View`
  width: 30px;
  height: 30px;
  background-color: #FFFFFF;
  border-radius: 50px;
  align-items: center;
  justify-content: center;
  position: absolute;
  bottom: 5px;
  right: 0;
`;

const PlusIcon = () => {
  return (
    <StyledPlusIcon>
      <Typography fontSize={30} fontWeight="regular" lineHeight={25}>
        +
      </Typography>
    </StyledPlusIcon>
  );
};

const SelectProfileImage = styled.Image`
  width: 100%;
  height: 100%;
`;

const StyledProfileIcon = styled(ProfileIcon)`
  width: 100%;
  height: 100%;
`;

const DefaultInfoInputWrapper = styled.View`
  width: 166px;
`;

const InputWrapper = styled.View`
  margin-bottom: 10px;
`;

const InputIcon = styled.Image`
  width: 20px;
  height: 20px;
`;

const SectionTitle = styled(Typography).attrs({
  fontSize: 16,
  fontWeight: 'medium',
  lineHeight: 20,
})`
  margin-left: 2.98px;
  margin-bottom: 9.01px;
`;

const SectionTitleBold = styled(Typography).attrs({
  fontSize: 16,
  fontWeight: 'semiBold',
  lineHeight: 22.4,
  letterSpacing: -0.4,
})`
  margin-left: 2.98px;
  margin-top: 30.03px;
  margin-bottom: 3.99px;
`;

const SectionDescription = styled(Typography).attrs({
  color: '#8E8E93',
  fontSize: 16,
  fontWeight: 'regular',
  lineHeight: 22.4,
  letterSpacing: -0.4,
})`
  margin-left: 2.98px;
  margin-bottom: 11.98px;
`;

const UploadPhotofolioButton = styled.TouchableOpacity`
  width: 80px;
  height: 80px;
  border-radius: 10px;
  background-color: #D9D9D9;
  justify-content: center;
  align-items: center;
`;

const PhotofolioImageWrapper = styled.View`
  width: 80px;
  height: 80px;
  margin-left: 7px;
  position: relative;
`;

const PhotographerImage = styled.Image`
  width: 100%;
  height: 100%;
  border-radius: 10px;
`;

const DeletePhotofolioButton = styled.TouchableOpacity`
  position: absolute;
  top: -6px;
  right: -6px;
  width: 24px;
  height: 24px;
  border-radius: 12px;
  background-color: #FFFFFF;
  justify-content: center;
  align-items: center;
  z-index: 10;
`;

const ConsentButton = styled.TouchableOpacity<{ $marginBottom?: number }>`
  flex-direction: row;
  width: 100%;
  align-items: center;
  height: 20px;
  ${({ $marginBottom }) => $marginBottom && `margin-bottom: ${$marginBottom}px;`}
`;

const ConsentIconWrapper = styled.View<{ $isChecked: boolean }>`
  justify-content: center;
  align-items: center;
  border-radius: 5px;
  width: 20px;
  height: 20px;
  border-width: 1px;
  border-color: ${({ $isChecked }) => ($isChecked ? 'transparent' : '#000000')};
  margin-right: 10px;
  background-color: ${({ $isChecked }) => ($isChecked ? '#00A980' : 'transparent')};
`;

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
    <ConsentButton onPress={onPress} $marginBottom={marginBottom}>
      <ConsentIconWrapper $isChecked={isChecked}>
        <ConsentIcon
          width={8}
          height={10}
          color={isChecked ? '#FFFFFF' : '#C8C8C8'}
        />
      </ConsentIconWrapper>
      <Typography
        fontSize={15}
        fontWeight="regular"
        lineHeight={15}
        letterSpacing={-0.375}
      >
        {title}
      </Typography>
    </ConsentButton>
  );
};

const Divider = styled.View`
  background-color: #C8C8C8;
  height: 1px;
  width: 100%;
  padding-right: 28px;
  margin-left: 28px;
  margin-top: 2px;
  margin-bottom: 15px;
`;

const SubmitButtonWrapper = styled.View`
  margin-top: 30px;
`;
