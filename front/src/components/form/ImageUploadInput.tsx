import styled from '@/utils/scale/CustomStyled.ts';
import Icon from '@/components/ui/Icon.tsx';
import CrossIcon from '@/assets/icons/cross.svg';
import CrossWhiteIcon from '@/assets/icons/cross-white.svg';
import { useCallback, useState } from 'react';
import { requestPermission } from '@/utils/permissions.ts';
import { ImageLibraryOptions, ImagePickerResponse, launchImageLibrary } from 'react-native-image-picker';
import { Alert, Typography } from '@/components/ui';
import { UploadImageFile } from '@/api/photographers.ts';
import { generateImageFilename, normalizeImageMime } from '@/utils/format.ts';
import ServerImage from '@/components/ui/ServerImage.tsx';
import DraggableFlatList, {
  RenderItemParams,
  ScaleDecorator,
} from 'react-native-draggable-flatlist';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

type ListItem =
  | { type: 'upload-button' }
  | { type: 'image'; image: UploadImageFile; index: number };

interface ImageUploadInputProps {
  images: UploadImageFile[];
  onRemoveImage: (index: number) => void;
  onAddImages: (newImages: UploadImageFile[]) => void;
  onReorder?: (images: UploadImageFile[]) => void;
  maxLength?: number;
  width?: number;
}

export default function ImageUploadInput({
  images,
  onRemoveImage,
  onAddImages,
  onReorder,
  maxLength = 0,
  width,
}: ImageUploadInputProps) {
  const [listKey, setListKey] = useState(0);
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

  const showUploadButton = maxLength === 0 || images.length < maxLength;

  const data: ListItem[] = [
    ...(showUploadButton ? [{ type: 'upload-button' as const }] : []),
    ...images.map((image, index) => ({
      type: 'image' as const,
      image,
      index,
    })),
  ];

  const handleDragEnd = useCallback(
    ({ data: newData }: { data: ListItem[] }) => {
      if (!onReorder) return;

      // 업로드 버튼이 맨 앞이 아닌 경우 강제 리마운트하여 위치 복원
      const uploadIdx = newData.findIndex((item) => item.type === 'upload-button');
      if (uploadIdx > 0) {
        setListKey((prev) => prev + 1);
      }

      const reorderedImages = newData
        .filter((item): item is Extract<ListItem, { type: 'image' }> => item.type === 'image')
        .map((item) => item.image);
      onReorder(reorderedImages);
    },
    [onReorder],
  );

  const renderItem = useCallback(
    ({ item, drag, isActive }: RenderItemParams<ListItem>) => {
      if (item.type === 'upload-button') {
        // 업로드 버튼: drag를 호출하지 않아 드래그 불가
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
      }

      return (
        <ScaleDecorator>
          <ImageWrapper
            onLongPress={onReorder ? drag : undefined}
            disabled={isActive}
            style={isActive ? { opacity: 0.85 } : undefined}
          >
            <Image uri={item.image.uri} />
            <DeleteButton onPress={() => onRemoveImage(item.index)}>
              <DeleteIconWrapper>
                <Icon width={12} height={12} Svg={CrossWhiteIcon} />
              </DeleteIconWrapper>
            </DeleteButton>
          </ImageWrapper>
        </ScaleDecorator>
      );
    },
    [handlePressUpload, maxLength, images.length, onRemoveImage, onReorder],
  );

  return (
    <Container width={width}>
      <GestureHandlerRootView>
        <DraggableFlatList
          key={`draggable-list-${listKey}`}
          data={data}
          renderItem={renderItem}
          keyExtractor={(item, idx) => {
            if (item.type === 'upload-button') return 'upload-button';
            return `image-${item.image.uri}-${idx}`;
          }}
          onDragEnd={handleDragEnd}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 10 }}
          activationDistance={5}
        />
      </GestureHandlerRootView>
    </Container>
  );
}

const Container = styled.View<{ width?: number }>`
  width: ${({ width }) => (width !== undefined ? `${width}px` : '100%')};
`;

const ImageWrapper = styled.TouchableOpacity`
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
