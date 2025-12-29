import styled from '@/utils/scale/CustomStyled.ts';
import { Dimensions } from 'react-native';
import ServerImage from '@/components/ServerImage.tsx';
import { theme } from '@/theme';
import Checkbox from '@/components/theme/Checkbox';
import CrossIcon from '@/assets/icons/cross.svg';
import Icon from '@/components/Icon.tsx';
import { useMemo } from 'react';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const PHOTO_MARGIN = 5;

// Helper function to check if URI contains protocol (local file or http/https URL)
// If it contains '://', use react-native Image
// Otherwise, it's a CloudFront Key, use ServerImage
const hasProtocol = (uri: string): boolean => {
  return uri.includes('://');
};

interface PhotoGridProps {
  imageURIs: string[];
  checkedImages: boolean[];
  setCheckedImage: (index: number) => void;
  isServerImage?: boolean;
  addable?: boolean;
  onPressAddImage?: () => void;
  width?: number;
  gridColumns?: number;
  scrollable?: boolean;
}

export default function PhotoGrid({
  imageURIs,
  checkedImages,
  setCheckedImage,
  addable = false,
  onPressAddImage,
  width = SCREEN_WIDTH,
  gridColumns = 2,
  scrollable = true,
}: PhotoGridProps) {
  const PHOTO_SIZE = (width - PHOTO_MARGIN * (gridColumns - 1)) / gridColumns;

  const renderGrid = useMemo(() => (
    <GridWrapper>
      {addable && onPressAddImage !== undefined && (
        <AddImageButton size={PHOTO_SIZE} onPress={onPressAddImage}>
          <Icon width={20} height={20} Svg={CrossIcon} />
        </AddImageButton>
      )}
      {imageURIs.map((uri, index) => {
        // Auto-detect: if URI has protocol (://), use native Image, otherwise use ServerImage
        const useNativeImage = hasProtocol(uri);

        return (
          <ImageWrapper
            key={index}
            size={PHOTO_SIZE}
            marginRight={addable ? (index % gridColumns + 2) !== gridColumns : (index % gridColumns + 1) !== gridColumns}
          >
            <CheckboxWrapper
              onPress={() => setCheckedImage(index)}
              isChecked={checkedImages[index]}
            >
              <Checkbox
                isChecked={checkedImages[index]}
                onPress={() => setCheckedImage(index)}
              />
            </CheckboxWrapper>
            {useNativeImage ? (
              <Photo source={{ uri }} />
            ) : (
              <ServerPhoto uri={uri} />
            )}
          </ImageWrapper>
        );
      })}
    </GridWrapper>
  ), [PHOTO_SIZE, addable, imageURIs, checkedImages, onPressAddImage, setCheckedImage, gridColumns]);

  return (
    <RootContainer>
      <Container width={width}>
        {scrollable ? (
          <ScrollContainer contentContainerStyle={{ flexGrow: 1 }} nestedScrollEnabled={false}>
            {renderGrid}
          </ScrollContainer>
        ) :
          renderGrid
        }
      </Container>
    </RootContainer>
  )
}

const RootContainer = styled.View`
  flex: 1;
  width: 100%;
  align-items: center;
`

const Container = styled.View<{ width: number }>`
  flex: 1;
  width: ${({ width }) => `${width}px`}; 
`

const ScrollContainer = styled.ScrollView`
  width: 100%;
`

const GridWrapper = styled.View`
  width: 100%;
  flex-wrap: wrap;
  flex-direction: row;
`

const ImageWrapper = styled.Pressable<{ size: number, marginRight?: boolean; }>`
  overflow: hidden;
  margin-bottom: ${PHOTO_MARGIN}px;
  ${({ marginRight }) => marginRight && `margin-right: ${PHOTO_MARGIN}px;`}
  ${({ size }) => `
    width: ${size}px;
    height: ${size}px;
  `}
`

const AddImageButton = styled.TouchableOpacity<{ size: number }>`
  border-radius: 8px;
  align-items: center;
  justify-content: center;
  border: 2px dashed #C8C8C8;
  margin-bottom: ${PHOTO_MARGIN}px;
  margin-right: ${PHOTO_MARGIN}px;
  ${({ size }) => `
    width: ${size}px;
    height: ${size}px;
  `}
`

const CheckboxWrapper = styled.Pressable<{ isChecked: boolean }>`
  position: absolute;
  top: 0;
  left: 0;
  z-index: 1000;
  background-color: rgba(0, 0, 0, 0.1);
  width: 100%;
  height: 100%;
  padding-top: 8px;
  padding-left: 8px;
  ${({ isChecked }) => isChecked ? `border: 2px solid ${theme.colors.primary}` : null};
`

const ServerPhoto = styled(ServerImage)`
  width: 100%;
  height: 100%;
`

const Photo = styled.Image`
  width: 100%;
  height: 100%;
`