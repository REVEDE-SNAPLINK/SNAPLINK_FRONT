import styled from '@/utils/scale/CustomStyled.ts';
import Icon from '@/components/Icon.tsx';
import CrossIcon from '@/assets/icons/cross.svg';
import CrossWhiteIcon from '@/assets/icons/cross-white.svg';
import { useCallback } from 'react';
import { requestPermission } from '@/utils/permissions.ts';
import { ImageLibraryOptions, ImagePickerResponse, launchImageLibrary } from 'react-native-image-picker';
import { Alert, Typography } from '@/components/theme';
import { UploadImageFile } from '@/api/photographers.ts';
import { generateImageFilename, normalizeImageMime } from '@/utils/format.ts';
import ServerImage from '@/components/ServerImage.tsx';
import { FlatList } from 'react-native';

interface ImageUploadInputProps {
  images: UploadImageFile[]; // string for existing photo URLs
  onRemoveImage: (index: number) => void;
  onAddImages: (newImages: UploadImageFile[]) => void;
  maxLength?: number;
  width?: number;
}

export default function ImageUploadInput({
  images,
  onRemoveImage,
  onAddImages,
  maxLength = 0,
  width,
}: ImageUploadInputProps) {
  const handlePressUpload = useCallback(() => {
    if (maxLength > 0 && images.length >= maxLength) {
      Alert.show({
        title: '이미지 업로드 제한',
        message: `최대 ${maxLength}장까지 업로드 가능합니다.`,
      });
      return;
    }

    const selectionLimit =
      maxLength > 0 ? Math.max(0, maxLength - images.length) : 0;

    requestPermission(
      'photo',
      async () => {
        const options: ImageLibraryOptions = {
          mediaType: 'photo',
          selectionLimit,
          quality: 0.8,
          includeExtra: true,
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
              (asset): asset is UploadImageFile =>
                !!asset.uri && !!asset.fileName && !!asset.type,
            )
            .map((asset) => ({
              uri: asset.uri!,
              name: generateImageFilename(asset.type, 'image'),
              type: normalizeImageMime(asset.type!),
            }));

          onAddImages(newImages);
        }
      }
    );
  }, [maxLength, images.length, onAddImages]);

  const renderItem = ({ item, index }: { item: UploadImageFile; index: number }) => {
    console.log(index, item);

    return (
      <ImageWrapper>
        <Image uri={item.uri} />
        <DeleteButton onPress={() => onRemoveImage(index)}>
          <DeleteIconWrapper>
            <Icon width={12} height={12} Svg={CrossWhiteIcon} />
          </DeleteIconWrapper>
        </DeleteButton>
      </ImageWrapper>
    );
  };

  const renderUploadButton = () => {
    if (maxLength > 0 && images.length >= maxLength) return null;

    return (
      <UploadButton onPress={handlePressUpload}>
        <Icon width={20} height={20} Svg={CrossIcon} />
        {maxLength > 0 && (
          <Typography fontSize={12} color="#C8C8C8" marginTop={14}>
            {images.length} / {maxLength}
          </Typography>
        )}
      </UploadButton>
    );
  };

  const data = ['upload-button',...images];

  return (
    <Container width={width}>
      <FlatList
        data={data}
        renderItem={({ item, index }) => {
          if (typeof item === 'string' && item === 'upload-button') return renderUploadButton();

          const realIndex = index - 1;
          return renderItem({ item: item as UploadImageFile, index: realIndex });
        }}
        keyExtractor={(item, index) => {
          if (item === 'upload-button') return 'upload-button';

          const uri = typeof item === 'string' ? item : item.uri;
          return `image-${uri}-${index}`;
        }}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: 10 }}
      />
    </Container>
  );
}

const Container = styled.View<{ width?: number }>`
  width: ${({ width }) => (width !== undefined ? `${width}px` : '100%')};
`;

const ImageWrapper = styled.View`
  width: 100px;
  height: 100px;
  position: relative;
`;

const Image = styled(ServerImage)`
  width: 100%;
  height: 100%;
  border-radius: 8px;
  background-color: #e0e0e0;
`;

const DeleteButton = styled.TouchableOpacity`
  position: absolute;
  top: 5px;
  right: 5px;
  transform: rotate(45deg);
`;

const DeleteIconWrapper = styled.View`
  width: 20px;
  height: 20px;
  border-radius: 10px;
  background-color: rgba(128, 128, 128, 0.8);
  justify-content: center;
  align-items: center;
`;

const UploadButton = styled.TouchableOpacity`
  width: 100px;
  height: 100px;
  border: 1px dashed #C8C8C8;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
`;
