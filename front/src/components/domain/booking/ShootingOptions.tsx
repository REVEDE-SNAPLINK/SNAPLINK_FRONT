import styled from '@/utils/scale/CustomStyled.ts';
import { theme } from '@/theme';
import Typography from '@/components/ui/Typography.tsx';
import { formatNumber } from '@/utils/format.ts';
import { View } from 'react-native';
import Checkbox from '@/components/ui/Checkbox.tsx';
import { GetShootingOptionResponse, GetShootingResponse } from '@/api/shootings.ts';

/**
 * Required Option Component
 */
const ShootingProductWrapper = styled.View`
  margin-bottom: 13px;
  flex-direction: row;
`;

const ShootingProductInfo = styled.View`
  flex: 1;
  margin-left: 10px;
`;

interface ShootingProductProps {
  isChecked: boolean;
  isDisabled?: boolean;
  onPress: () => void;
  product: GetShootingResponse;
}

export const ShootingProduct = ({ isChecked, isDisabled = false, onPress, product }: ShootingProductProps) => {
  const photoHour = ~~(product.photoTime / 60)
  const photoMinute = ~~(product.photoTime % 60)

  return (
    <ShootingProductWrapper>
      <Checkbox isChecked={isChecked} isDisabled={isDisabled} onPress={onPress} />
      <ShootingProductInfo>
        <Typography fontSize={16} fontWeight="semiBold" lineHeight="140%" letterSpacing="-2.5%" color="#000">
          {product.shoootingName}
        </Typography>
        <Typography fontSize={14} fontWeight="semiBold" lineHeight="140%" letterSpacing="-2.5%" color="#000">
          {formatNumber(product.basePrice)}원
        </Typography>
        <Typography
          fontSize={12}
          fontWeight="semiBold"
          lineHeight="140%"
          letterSpacing="-2.5%"
          color={theme.colors.disabled}
          marginBottom={10}
        >
          소요시간 {photoHour}시간{`${photoMinute === 0 ? '' : ` ${photoMinute}분`}`}
        </Typography>
        <Typography fontSize={12} lineHeight="140%" letterSpacing="-2.5%" color={theme.colors.disabled}>
          {product.description}
        </Typography>
      </ShootingProductInfo>
    </ShootingProductWrapper>
  );
};

/**
 * Quantity Input Component
 */
const QuantityInputWrapper = styled.View`
  width: 90px;
  height: 35px;
  border-radius: 5px;
  flex-direction: row;
  align-items: center;
  padding: 7px 5px;
  justify-content: space-between;
  border: 1px solid ${theme.colors.disabled};
`;

const ChangeQuantityButton = styled.TouchableOpacity`
  justify-content: center;
  align-items: center;
  width: 30px;
  height: 100%;
`;

interface QuantityInputProps {
  quantity: number;
  onChange: (quantity: number) => void;
  maxQuantity?: number;
}

export const QuantityInput = ({ quantity, onChange, maxQuantity = 100 }: QuantityInputProps) => {
  return (
    <QuantityInputWrapper>
      <ChangeQuantityButton onPress={() => onChange(Math.max(0, quantity - 1))} disabled={quantity === 0}>
        <Typography
          fontSize={14}
          lineHeight="100%"
          fontWeight="bold"
          color={quantity === 0 ? theme.colors.disabled : theme.colors.textPrimary}
        >
          -
        </Typography>
      </ChangeQuantityButton>
      <Typography fontSize={12} color="#000">
        {quantity}
      </Typography>
      <ChangeQuantityButton onPress={() => onChange(Math.min(maxQuantity, quantity + 1))} disabled={quantity === maxQuantity}>
        <Typography
          fontSize={14}
          fontWeight="bold"
          lineHeight="100%"
          color={quantity === maxQuantity ? theme.colors.disabled : theme.colors.textPrimary}
        >
          +
        </Typography>
      </ChangeQuantityButton>
    </QuantityInputWrapper>
  );
};

/**
 * Optional Option Component
 */
const OptionalWrapper = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  margin-bottom: 15px;
`;

interface ShootingOptionProps {
  option: GetShootingOptionResponse;
  quantity: number;
  onQuantityChange: (quantity: number) => void;
}

export const ShootingOption = ({ option, quantity, onQuantityChange }: ShootingOptionProps) => {
  return (
    <OptionalWrapper>
      <View>
        <Typography fontSize={16} fontWeight="semiBold" lineHeight="140%" letterSpacing="-2.5%" color="#000" marginBottom={3}>
          {option.name}
        </Typography>
        <Typography fontSize={14} fontWeight="semiBold" lineHeight="140%" letterSpacing="-2.5%" color="#000">
          {formatNumber(option.price)}원
        </Typography>
      </View>
      <QuantityInput quantity={quantity} onChange={onQuantityChange} />
    </OptionalWrapper>
  );
};

/**
 * Option Label Component
 */
export const OptionLabel = styled.View`
  width: 75px;
  height: 28px;
  border-radius: 15px;
  background-color: ${theme.colors.primary};
  justify-content: center;
  align-items: center;
  margin-bottom: 20px;
  margin-top: 21px;
`;
