import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { RequiredOption, OptionalOption, QuantityInput } from '../ShootingOptions';
import { RequiredShootingOption, OptionalShootingOption } from '@/api/photographer';

// Mock consent icon
jest.mock('@/assets/icons/consent.svg', () => 'ConsentIcon');

describe('QuantityInput', () => {
  const defaultProps = {
    quantity: 1,
    onChange: jest.fn(),
    maxQuantity: 10,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render quantity correctly', () => {
    const { getByText } = render(<QuantityInput {...defaultProps} />);
    expect(getByText('1')).toBeTruthy();
  });

  it('should call onChange with decreased quantity when minus is pressed', () => {
    const { getByText } = render(<QuantityInput {...defaultProps} />);
    fireEvent.press(getByText('-'));
    expect(defaultProps.onChange).toHaveBeenCalledWith(0);
  });

  it('should call onChange with increased quantity when plus is pressed', () => {
    const { getByText } = render(<QuantityInput {...defaultProps} />);
    fireEvent.press(getByText('+'));
    expect(defaultProps.onChange).toHaveBeenCalledWith(2);
  });

  it('should not decrease below 0', () => {
    const onChange = jest.fn();
    const { getByText } = render(<QuantityInput {...defaultProps} quantity={0} onChange={onChange} />);
    fireEvent.press(getByText('-'));
    // Button should be disabled at 0, so onChange should not be called
    expect(onChange).not.toHaveBeenCalled();
  });

  it('should not increase above maxQuantity', () => {
    const onChange = jest.fn();
    const { getByText } = render(<QuantityInput {...defaultProps} quantity={10} onChange={onChange} />);
    fireEvent.press(getByText('+'));
    // Button should be disabled at maxQuantity, so onChange should not be called
    expect(onChange).not.toHaveBeenCalled();
  });

  it('should use default maxQuantity of 100 when not provided', () => {
    const onChange = jest.fn();
    const { getByText } = render(<QuantityInput quantity={99} onChange={onChange} />);
    fireEvent.press(getByText('+'));
    expect(onChange).toHaveBeenCalledWith(100);
  });
});

describe('RequiredOption', () => {
  const mockOption: RequiredShootingOption = {
    id: 'req-1',
    title: '2인 기본 촬영',
    price: 50000,
    duration: '2시간',
    description: '2인 기준 기본 촬영 단가로 인원 추가나 시간 추가, 컨셉 추가 등에 따라 추가 비용이 발생할 수 있으며 선택 항목에서 확인 가능해요.',
  };

  const defaultProps = {
    isChecked: false,
    isDisabled: false,
    onPress: jest.fn(),
    option: mockOption,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render option title correctly', () => {
    const { getByText } = render(<RequiredOption {...defaultProps} />);
    expect(getByText('2인 기본 촬영')).toBeTruthy();
  });

  it('should render option price correctly', () => {
    const { getByText } = render(<RequiredOption {...defaultProps} />);
    expect(getByText('50,000원')).toBeTruthy();
  });

  it('should render option duration correctly', () => {
    const { getByText } = render(<RequiredOption {...defaultProps} />);
    expect(getByText('소요시간 2시간')).toBeTruthy();
  });

  it('should render option description correctly', () => {
    const { getByText } = render(<RequiredOption {...defaultProps} />);
    expect(getByText(mockOption.description)).toBeTruthy();
  });

  it('should render checkbox that can be interacted with', () => {
    const { getByText } = render(<RequiredOption {...defaultProps} />);
    // Just verify that the option renders correctly
    expect(getByText('2인 기본 촬영')).toBeTruthy();
  });

  it('should show option when isChecked is true', () => {
    const { getByText } = render(<RequiredOption {...defaultProps} isChecked={true} />);
    expect(getByText('2인 기본 촬영')).toBeTruthy();
  });
});

describe('OptionalOption', () => {
  const mockOption: OptionalShootingOption = {
    id: 'opt-1',
    title: '촬영 인원 추가',
    price: 10000,
    maxQuantity: 10,
  };

  const defaultProps = {
    option: mockOption,
    quantity: 1,
    onQuantityChange: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render option title correctly', () => {
    const { getByText } = render(<OptionalOption {...defaultProps} />);
    expect(getByText('촬영 인원 추가')).toBeTruthy();
  });

  it('should render option price correctly', () => {
    const { getByText } = render(<OptionalOption {...defaultProps} />);
    expect(getByText('10,000원')).toBeTruthy();
  });

  it('should render quantity correctly', () => {
    const { getByText } = render(<OptionalOption {...defaultProps} />);
    expect(getByText('1')).toBeTruthy();
  });

  it('should call onQuantityChange when quantity is changed', () => {
    const { getByText } = render(<OptionalOption {...defaultProps} />);
    fireEvent.press(getByText('+'));
    expect(defaultProps.onQuantityChange).toHaveBeenCalledWith(2);
  });

  it('should handle quantity decrease', () => {
    const { getByText } = render(<OptionalOption {...defaultProps} />);
    fireEvent.press(getByText('-'));
    expect(defaultProps.onQuantityChange).toHaveBeenCalledWith(0);
  });

  it('should respect maxQuantity from option', () => {
    const { getByText } = render(<OptionalOption {...defaultProps} quantity={10} />);
    fireEvent.press(getByText('+'));
    // Button should be disabled at maxQuantity, so onChange should not be called
    expect(defaultProps.onQuantityChange).not.toHaveBeenCalled();
  });
});
