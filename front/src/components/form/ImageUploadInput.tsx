import styled from '@/utils/scale/CustomStyled.ts';
import Icon from '@/components/Icon.tsx';
import CrossIcon from '@/assets/icons/cross.svg';
import { useCallback } from 'react';
import { requestPermission } from '@/utils/permissions.ts';
import { ImageLibraryOptions, ImagePickerResponse, launchImageLibrary } from 'react-native-image-picker';
import { Alert, Typography } from '@/components/theme';
import { UploadImageFile } from '@/api/photographers.ts';
import PhotoGrid from '@/components/PhotoGrid.tsx';
import { generateImageFilename } from '@/utils/format.ts';
import { UploadImageParams } from '@/types/image.ts';

interface ImageUploadInputProps {
  images: UploadImageFile[];
  setImages: (images: UploadImageFile[]) => void;
  maxLength?: number;
  width?: number;
  checkedImages: boolean[];
  setCheckedImages: (checkedImages: boolean[]) => void;
  gridColumns?: number;
  scrollable?: boolean;
}

export default function ImageUploadInput({
  images,
  setImages,
  maxLength = 3,
  width,
  checkedImages,
  setCheckedImages,
  gridColumns = 2,
  scrollable = false,
}: ImageUploadInputProps) {
  const handlePressUpload = useCallback(() => {
    requestPermission(
      'photo',
      async () => {
        // 권한 허용됨 - 갤러리 열기
        const options: ImageLibraryOptions = {
          mediaType: 'photo',
          selectionLimit: maxLength - images.length,
          quality: 0.8,
        };

        const response: ImagePickerResponse = await launchImageLibrary(options);

        if (response.didCancel) return;
        if (response.errorCode) {
          Alert.show({
            title: '갤러리 오류',
            message: response.errorMessage || '알 수 없는 오류',
          });
          return;
        }
        if (response.assets && response.assets.length > 0) {
          const newImages = response.assets
            .filter(
              (asset): asset is UploadImageParams =>
                !!asset.uri && !!asset.fileName && !!asset.type,
            )
            .map((asset) => ({
              uri: asset.uri!,
              name: generateImageFilename(asset.type, 'photographer_portfolio'),
              type: asset.type!,
            }));
          setImages([...images, ...newImages]);
          setCheckedImages([...checkedImages, ...Array(newImages.length)].fill(false));
        }
      }
    );
  }, [maxLength, images, setImages, setCheckedImages, checkedImages]);

  if (images.length >= 1) {
    return (
      <PhotoGrid
        {...(width !== undefined ? { width } : undefined)}
        imageURIs={images.map((v) => v.uri)}
        gridColumns={gridColumns}
        checkedImages={checkedImages}
        setCheckedImage={(index: number) => {
          setCheckedImages([...checkedImages.slice(0, index), !checkedImages[index], ...checkedImages.slice(index + 1)]);
        }}
        addable={images.length < maxLength}
        onPressAddImage={handlePressUpload}
        scrollable={scrollable}
      />
    )
  }

  return (
    <Wrapper onPress={handlePressUpload}>
      <Icon width={20} height={20} Svg={CrossIcon} />
      <Typography
        fontSize={12}
        color="#C8C8C8"
        marginTop={14}
      >
        0 / {maxLength}
      </Typography>
    </Wrapper>
  )
}

const Wrapper = styled.TouchableOpacity<{ width?: number }>`
  width: ${({ width }) => width !== undefined ? `${width}px` : '100%'};
  height: 170px;
  border: 1px dashed #C8C8C8;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
`

