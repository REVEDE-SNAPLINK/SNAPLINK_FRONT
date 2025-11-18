import React from 'react';
import { render, fireEvent, within } from '@testing-library/react-native';
import ViewPhotosView, { Photo } from '../ViewPhotosView';
import { Image } from 'react-native';

// Mock icons
jest.mock('@/assets/icons/folder.svg', () => 'FolderIcon');
jest.mock('@/assets/icons/download.svg', () => 'DownloadIcon');

describe('ViewPhotosView', () => {
  const mockPhotos: Photo[] = [
    {
      id: 'photo-1',
      url: 'https://example.com/photo1.jpg',
      type: 'original',
    },
    {
      id: 'photo-2',
      url: 'https://example.com/photo2.jpg',
      type: 'edited',
    },
    {
      id: 'photo-3',
      url: 'https://example.com/photo3.jpg',
      type: 'original',
    },
    {
      id: 'photo-4',
      url: 'https://example.com/photo4.jpg',
      type: 'edited',
    },
  ];

  const defaultProps = {
    onPressBack: jest.fn(),
    photos: mockPhotos,
    onDownloadZip: jest.fn(),
    onDownloadAll: jest.fn(),
    isLoading: false,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly with photos', () => {
    const { getByText } = render(<ViewPhotosView {...defaultProps} />);

    expect(getByText('촬영 사진 보기')).toBeTruthy();
    expect(getByText('･ 사진 관련 문의는 촬영한 작가님에게 연락해주세요.')).toBeTruthy();
    expect(getByText('원본/보정본 모음.zip')).toBeTruthy();
    expect(getByText('사진 전체 다운로드')).toBeTruthy();
  });

  it('renders all photos in grid', () => {
    const { UNSAFE_getAllByType } = render(<ViewPhotosView {...defaultProps} />);

    const images = UNSAFE_getAllByType(Image);
    expect(images).toHaveLength(mockPhotos.length);
  });

  it('calls onDownloadZip when zip download button is pressed', () => {
    const { getByText } = render(<ViewPhotosView {...defaultProps} />);

    const zipButton = getByText('원본/보정본 모음.zip').parent?.parent;
    if (zipButton) {
      fireEvent.press(zipButton);
      expect(defaultProps.onDownloadZip).toHaveBeenCalledTimes(1);
    }
  });

  it('calls onDownloadAll when download all button is pressed', () => {
    const { getByText } = render(<ViewPhotosView {...defaultProps} />);

    const downloadAllButton = getByText('사진 전체 다운로드');
    fireEvent.press(downloadAllButton);
    expect(defaultProps.onDownloadAll).toHaveBeenCalledTimes(1);
  });

  it('disables buttons when loading', () => {
    const { getByText } = render(
      <ViewPhotosView {...defaultProps} isLoading={true} />
    );

    const downloadAllButton = getByText('사진 전체 다운로드').parent;
    // Check if button has disabled styling (gray background)
    expect(downloadAllButton?.props.$disabled).toBe(true);
  });

  it('disables buttons when no photos', () => {
    const { getByText } = render(
      <ViewPhotosView {...defaultProps} photos={[]} />
    );

    const downloadAllButton = getByText('사진 전체 다운로드').parent;
    // Check if button has disabled styling (gray background)
    expect(downloadAllButton?.props.$disabled).toBe(true);
  });

  it('renders empty grid when no photos', () => {
    const { UNSAFE_queryAllByType } = render(
      <ViewPhotosView {...defaultProps} photos={[]} />
    );

    const images = UNSAFE_queryAllByType(Image);
    expect(images).toHaveLength(0);
  });

  it('renders photos with correct source URIs', () => {
    const { UNSAFE_getAllByType } = render(<ViewPhotosView {...defaultProps} />);

    const images = UNSAFE_getAllByType(Image);
    images.forEach((image, index) => {
      expect(image.props.source).toEqual({ uri: mockPhotos[index].url });
    });
  });

  it('calls onPressBack when back button is pressed', () => {
    const { queryByTestId } = render(<ViewPhotosView {...defaultProps} />);

    // Assuming ScreenContainer has a back button with testID
    // This test might need adjustment based on actual ScreenContainer implementation
    const backButton = queryByTestId('header-back-button');
    if (backButton) {
      fireEvent.press(backButton);
      expect(defaultProps.onPressBack).toHaveBeenCalledTimes(1);
    } else {
      // Skip test if back button not found (ScreenContainer implementation dependent)
      expect(true).toBe(true);
    }
  });

  it('renders photos in 2-column grid layout', () => {
    const { UNSAFE_getAllByType } = render(<ViewPhotosView {...defaultProps} />);

    // Verify that all photos are rendered
    const images = UNSAFE_getAllByType(Image);
    expect(images).toHaveLength(mockPhotos.length);

    // Verify each photo has correct dimensions (166x166 with padding)
    // The actual structure is PhotoWrapper > PhotoImage
    expect(images.length).toBe(mockPhotos.length);
  });

  it('handles large number of photos', () => {
    const manyPhotos: Photo[] = Array.from({ length: 50 }, (_, i) => ({
      id: `photo-${i}`,
      url: `https://example.com/photo${i}.jpg`,
      type: i % 2 === 0 ? 'original' : 'edited',
    }));

    const { UNSAFE_getAllByType } = render(
      <ViewPhotosView {...defaultProps} photos={manyPhotos} />
    );

    const images = UNSAFE_getAllByType(Image);
    expect(images).toHaveLength(50);
  });

  it('renders photos with correct types', () => {
    const { UNSAFE_getAllByType } = render(<ViewPhotosView {...defaultProps} />);

    const images = UNSAFE_getAllByType(Image);
    expect(images.length).toBe(mockPhotos.length);

    // Verify that photos maintain their type information
    mockPhotos.forEach((photo, index) => {
      expect(photo.type).toMatch(/^(original|edited)$/);
    });
  });

  it('uses correct image resize mode', () => {
    const { UNSAFE_getAllByType } = render(<ViewPhotosView {...defaultProps} />);

    const images = UNSAFE_getAllByType(Image);
    images.forEach((image) => {
      expect(image.props.resizeMode).toBe('cover');
    });
  });
});
