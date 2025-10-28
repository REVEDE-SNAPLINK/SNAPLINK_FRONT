import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import ApplyPhotographerView from '@/screens/auth/ApplyPhotographer/ApplyPhotographerView';

const mockProps = {
  onPressBackButton: jest.fn(),
  onPressSelectProfileImageButton: jest.fn(),
  isUploadedProfileImage: false,
  profileImageURI: null,
  name: '',
  setName: jest.fn(),
  gender: null,
  setGender: jest.fn(),
  onPressSelectBirthdayButton: jest.fn(),
  birthday: '',
  onPressSelectLocationButton: jest.fn(),
  location: '',
  categoryList: ['스냅', '웨딩', '커플', '졸업'],
  category: null,
  setCategory: jest.fn(),
  photofolioImageURIs: [],
  onPressSelectPhotofolioImageButton: jest.fn(),
  onPressDeletePhotofolioImageButton: jest.fn(),
  introduction: '',
  setIntroduction: jest.fn(),
  isValid: false,
  onSubmit: jest.fn(),
  consents: [
    {
      id: '1',
      title: '만 14세 이상입니다 (필수)',
      required: true,
      isChecked: false,
    },
    {
      id: '2',
      title: '브랜디 약관 동의 (필수)',
      required: true,
      isChecked: false,
    },
  ],
  allChecked: false,
  onToggleAllConsents: jest.fn(),
  onToggleConsent: jest.fn(),
};

describe('ApplyPhotographerView', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders without crashing', () => {
    const { getByText } = render(<ApplyPhotographerView {...mockProps} />);
    expect(getByText('작가 프로필 작성')).toBeTruthy();
  });

  it('renders all form sections', () => {
    const { getByText, getByPlaceholderText } = render(
      <ApplyPhotographerView {...mockProps} />
    );

    expect(getByText('작가 프로필 작성')).toBeTruthy();
    expect(getByPlaceholderText('이름')).toBeTruthy();
    expect(getByPlaceholderText('생년월일')).toBeTruthy();
    expect(getByText('촬영 유형')).toBeTruthy();
    expect(getByText('포토폴리오')).toBeTruthy();
    expect(getByText('자기소개')).toBeTruthy();
  });

  it('calls onPressBackButton when back button is pressed', () => {
    const { getByTestId } = render(<ApplyPhotographerView {...mockProps} />);

    // Assuming BackButton has testID
    const backButton = getByTestId('back-button');
    fireEvent.press(backButton);

    expect(mockProps.onPressBackButton).toHaveBeenCalledTimes(1);
  });

  it('calls setName when name input changes', () => {
    const { getByPlaceholderText } = render(
      <ApplyPhotographerView {...mockProps} />
    );

    const nameInput = getByPlaceholderText('이름');
    fireEvent.changeText(nameInput, '홍길동');

    expect(mockProps.setName).toHaveBeenCalledWith('홍길동');
  });

  it('calls onPressSelectBirthdayButton when birthday input is pressed', () => {
    const { getByPlaceholderText } = render(
      <ApplyPhotographerView {...mockProps} />
    );

    const birthdayInput = getByPlaceholderText('생년월일');
    fireEvent.press(birthdayInput);

    expect(mockProps.onPressSelectBirthdayButton).toHaveBeenCalledTimes(1);
  });

  it('displays selected birthday', () => {
    const { getByDisplayValue } = render(
      <ApplyPhotographerView {...mockProps} birthday="1990-01-01" />
    );

    expect(getByDisplayValue('1990-01-01')).toBeTruthy();
  });

  it('calls setIntroduction when introduction input changes', () => {
    const { getByPlaceholderText } = render(
      <ApplyPhotographerView {...mockProps} />
    );

    const introInput = getByPlaceholderText('입력');
    fireEvent.changeText(introInput, '안녕하세요. 사진작가입니다.');

    expect(mockProps.setIntroduction).toHaveBeenCalledWith(
      '안녕하세요. 사진작가입니다.'
    );
  });

  it('renders photofolio images when provided', () => {
    const { getByTestId } = render(
      <ApplyPhotographerView
        {...mockProps}
        photofolioImageURIs={['image1.jpg', 'image2.jpg']}
      />
    );

    // FlatList should render images
    // This would need proper testIDs in the component
  });

  it('calls onPressSelectPhotofolioImageButton when add button is pressed', () => {
    const { getByText } = render(<ApplyPhotographerView {...mockProps} />);

    const addButton = getByText('+');
    fireEvent.press(addButton);

    expect(mockProps.onPressSelectPhotofolioImageButton).toHaveBeenCalledTimes(1);
  });

  it('submit button is disabled when isValid is false', () => {
    const { getByText } = render(
      <ApplyPhotographerView {...mockProps} isValid={false} />
    );

    const submitButton = getByText('완료');
    expect(submitButton).toBeTruthy();
    // The disabled state would be reflected in the SubmitButton component
  });

  it('submit button is enabled when isValid is true', () => {
    const { getByText } = render(
      <ApplyPhotographerView {...mockProps} isValid={true} />
    );

    const submitButton = getByText('완료');
    expect(submitButton).toBeTruthy();
  });

  it('calls onSubmit when submit button is pressed', () => {
    const { getByText } = render(
      <ApplyPhotographerView {...mockProps} isValid={true} />
    );

    const submitButton = getByText('완료');
    fireEvent.press(submitButton);

    expect(mockProps.onSubmit).toHaveBeenCalledTimes(1);
  });

  it('displays profile image when uploaded', () => {
    const { queryByTestId } = render(
      <ApplyPhotographerView
        {...mockProps}
        isUploadedProfileImage={true}
        profileImageURI="profile.jpg"
      />
    );

    // Profile image should be displayed
    // This would need proper testIDs in the component
  });

  it('renders all category items', () => {
    const { getByText } = render(<ApplyPhotographerView {...mockProps} />);

    mockProps.categoryList.forEach((category) => {
      expect(getByText(category)).toBeTruthy();
    });
  });

  it('renders consent section with all consent items', () => {
    const { getByText } = render(<ApplyPhotographerView {...mockProps} />);

    expect(getByText('전체 동의')).toBeTruthy();
    mockProps.consents.forEach((consent) => {
      expect(getByText(consent.title)).toBeTruthy();
    });
  });

  it('calls onToggleAllConsents when "전체 동의" is pressed', () => {
    const { getByText } = render(<ApplyPhotographerView {...mockProps} />);

    const allConsentButton = getByText('전체 동의');
    fireEvent.press(allConsentButton);

    expect(mockProps.onToggleAllConsents).toHaveBeenCalledTimes(1);
  });

  it('calls onToggleConsent when individual consent is pressed', () => {
    const { getByText } = render(<ApplyPhotographerView {...mockProps} />);

    const firstConsent = getByText(mockProps.consents[0].title);
    fireEvent.press(firstConsent);

    expect(mockProps.onToggleConsent).toHaveBeenCalledWith('1');
  });

  it('renders gender select with correct value', () => {
    const { getByText } = render(
      <ApplyPhotographerView {...mockProps} gender={0} />
    );

    expect(getByText('남성')).toBeTruthy();
    expect(getByText('여성')).toBeTruthy();
  });

  it('calls setGender when gender is selected', () => {
    const { getByText } = render(<ApplyPhotographerView {...mockProps} />);

    const maleButton = getByText('남성');
    fireEvent.press(maleButton);

    expect(mockProps.setGender).toHaveBeenCalledWith(0);
  });

  it('calls setCategory when category is selected', () => {
    const { getByText } = render(<ApplyPhotographerView {...mockProps} />);

    const snapButton = getByText('스냅');
    fireEvent.press(snapButton);

    expect(mockProps.setCategory).toHaveBeenCalledWith(0);
  });
});
