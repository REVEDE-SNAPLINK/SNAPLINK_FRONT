import styled from '@/utils/scale/CustomStyled.ts';
import { Dimensions } from 'react-native';
import ServerImage from '@/components/ServerImage.tsx';
import { theme } from '@/theme';
import Checkbox from '@/components/Checkbox.tsx';
import CrossIcon from '@/assets/icons/cross.svg';
import Icon from '@/components/Icon.tsx';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const PHOTO_MARGIN = 5;
const GRID_COLUMNS = 2;

interface PhotoGridProps {
  imageURIs: string[];
  checkedImages: boolean[];
  setCheckedImage: (index: number) => void;
  isServerImage?: boolean;
  addable?: boolean;
  onPressAddImage?: () => void;
  width?: number;
}

export default function PhotoGrid({
  imageURIs,
  checkedImages,
  setCheckedImage,
  isServerImage = false,
  addable = false,
  onPressAddImage,
  width = SCREEN_WIDTH,
}: PhotoGridProps) {
  const PHOTO_SIZE = (width - PHOTO_MARGIN * (GRID_COLUMNS - 1)) / 2;

  return (
    <RootContainer>
      <Container width={width}>
        <ScrollContainer contentContainerStyle={{ flexGrow: 1 }}>
          <GridWrapper>
            {addable && onPressAddImage !== undefined && (
              <AddImageButton size={PHOTO_SIZE} onPress={onPressAddImage}>
                <Icon width={20} height={20} Svg={CrossIcon} />
              </AddImageButton>
            )}
            {imageURIs.map((uri, index) => (
              <ImageWrapper
                key={index}
                size={PHOTO_SIZE}
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
                {isServerImage ? (
                  <ServerPhoto uri={uri} />
                ) : (
                  <Photo source={{ uri }} />
                )}
              </ImageWrapper>
            ))}
          </GridWrapper>
        </ScrollContainer>
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
  justify-content: space-between;
`

const ImageWrapper = styled.Pressable<{ size: number }>`
  overflow: hidden;
  margin-bottom: ${PHOTO_MARGIN}px;
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