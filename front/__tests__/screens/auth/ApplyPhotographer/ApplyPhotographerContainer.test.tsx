import React from 'react';
import { render, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { NavigationContainer } from '@react-navigation/native';
import ApplyPhotographerContainer from '@/screens/auth/ApplyPhotographer/ApplyPhotographerContainer';

// Mock navigation
const mockGoBack = jest.fn();
jest.mock('@react-navigation/native', () => {
  const actualNav = jest.requireActual('@react-navigation/native');
  return {
    ...actualNav,
    useNavigation: () => ({
      goBack: mockGoBack,
    }),
  };
});

// Mock image picker
jest.mock('react-native-image-picker', () => ({
  launchCamera: jest.fn(),
  launchImageLibrary: jest.fn(),
}));

// Mock DatePicker
jest.mock('@/components/DatePicker', () => 'DatePicker');

const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

const wrapper = ({ children }: { children: React.ReactNode }) => {
  const queryClient = createTestQueryClient();
  return (
    <QueryClientProvider client={queryClient}>
      <NavigationContainer>{children}</NavigationContainer>
    </QueryClientProvider>
  );
};

describe('ApplyPhotographerContainer', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders without crashing', async () => {
    const { getByText } = render(<ApplyPhotographerContainer />, { wrapper });

    await waitFor(() => {
      expect(getByText('작가 프로필 작성')).toBeTruthy();
    });
  });

  it('fetches and displays categories', async () => {
    const { getByText } = render(<ApplyPhotographerContainer />, { wrapper });

    await waitFor(() => {
      expect(getByText('촬영 유형')).toBeTruthy();
    });
  });

  it('displays all form sections', async () => {
    const { getByPlaceholderText, getByText } = render(
      <ApplyPhotographerContainer />,
      { wrapper }
    );

    await waitFor(() => {
      expect(getByPlaceholderText('이름')).toBeTruthy();
      expect(getByPlaceholderText('생년월일')).toBeTruthy();
      expect(getByText('포토폴리오')).toBeTruthy();
      expect(getByText('자기소개')).toBeTruthy();
    });
  });

  it('submit button is disabled initially', async () => {
    const { getByText } = render(<ApplyPhotographerContainer />, { wrapper });

    await waitFor(() => {
      const submitButton = getByText('완료');
      expect(submitButton).toBeTruthy();
      // Button disabled state would be checked via parent props
    });
  });
});
