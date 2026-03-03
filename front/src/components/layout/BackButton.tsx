import IconButton from '@/components/ui/IconButton.tsx';
import ArrowLeftIcon from '@/assets/icons/arrow-left-black.svg'

interface BackButtonProps {
  onPress: () => void;
}

/**
 * 뒤로가기 버튼 컴포넌트
 *
 * @example
 * ```tsx
 * <BackButton onPress={() => navigation.goBack()} />
 * ```
 */
export default function BackButton({ onPress }: BackButtonProps) {
  return (
    <IconButton
      width={24}
      height={24}
      Svg={ArrowLeftIcon}
      onPress={onPress}
    />
  );
}
