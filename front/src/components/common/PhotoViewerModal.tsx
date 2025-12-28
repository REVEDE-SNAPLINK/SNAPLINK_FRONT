import React, { useRef, useEffect } from 'react';
import { Modal, FlatList, Dimensions, TouchableOpacity } from 'react-native';
import styled from '@/utils/scale/CustomStyled';
import ServerImage from '@/components/ServerImage';
import Icon from '@/components/Icon';
import CrossIcon from '@/assets/icons/cross.svg';
import ArrowLeftIcon from '@/assets/icons/arrow-left-black.svg';
import ArrowRightIcon from '@/assets/icons/arrow-right2.svg';
import LoadingSpinner from '@/components/LoadingSpinner';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface PhotoViewerModalProps {
  visible: boolean;
  photos: string[];
  initialIndex: number;
  onClose: () => void;
  onLoadMore?: () => void;
  isLoading?: boolean;
}

export default function PhotoViewerModal({
  visible,
  photos,
  initialIndex,
  onClose,
  onLoadMore,
  isLoading = false,
}: PhotoViewerModalProps) {
  const flatListRef = useRef<FlatList>(null);
  const [currentIndex, setCurrentIndex] = React.useState(initialIndex);

  useEffect(() => {
    if (visible && flatListRef.current && photos.length > 0) {
      // Scroll to initial index when modal opens
      setTimeout(() => {
        flatListRef.current?.scrollToIndex({
          index: initialIndex,
          animated: false,
        });
      }, 100);
    }
  }, [visible, initialIndex, photos.length]);

  const handlePrevious = () => {
    if (currentIndex > 0) {
      flatListRef.current?.scrollToIndex({
        index: currentIndex - 1,
        animated: true,
      });
    }
  };

  const handleNext = () => {
    if (currentIndex < photos.length - 1) {
      flatListRef.current?.scrollToIndex({
        index: currentIndex + 1,
        animated: true,
      });
    }
  };

  const handleScroll = (event: any) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(offsetX / SCREEN_WIDTH);
    setCurrentIndex(index);

    // Load more when approaching the end
    if (onLoadMore && index >= photos.length - 3) {
      onLoadMore();
    }
  };

  const renderItem = ({ item }: { item: string }) => (
    <PhotoContainer>
      <FullScreenImage uri={item} />
    </PhotoContainer>
  );

  if (!visible || photos.length === 0) {
    return null;
  }

  return (
    <Modal
      visible={visible}
      transparent={false}
      animationType="fade"
      onRequestClose={onClose}
    >
      <Container>
        <CloseButton onPress={onClose}>
          <RotatedIcon width={24} height={24} Svg={CrossIcon} />
        </CloseButton>

        <FlatList
          ref={flatListRef}
          data={photos}
          keyExtractor={(item, index) => `${item}-${index}`}
          renderItem={renderItem}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          getItemLayout={(data, index) => ({
            length: SCREEN_WIDTH,
            offset: SCREEN_WIDTH * index,
            index,
          })}
          onScrollToIndexFailed={(info) => {
            const wait = new Promise((resolve) => setTimeout(resolve, 500));
            wait.then(() => {
              flatListRef.current?.scrollToIndex({ index: info.index, animated: false });
            });
          }}
        />

        {currentIndex > 0 && (
          <LeftArrowButton onPress={handlePrevious}>
            <Icon width={24} height={24} Svg={ArrowLeftIcon} />
          </LeftArrowButton>
        )}

        {currentIndex < photos.length - 1 && (
          <RightArrowButton onPress={handleNext}>
            <Icon width={24} height={24} Svg={ArrowRightIcon} />
          </RightArrowButton>
        )}

        <LoadingSpinner visible={isLoading} />
      </Container>
    </Modal>
  );
}

const Container = styled.View`
  flex: 1;
  background-color: #000;
  justify-content: center;
  align-items: center;
`;

const CloseButton = styled.TouchableOpacity`
  position: absolute;
  top: 50px;
  right: 20px;
  z-index: 10;
  width: 44px;
  height: 44px;
  justify-content: center;
  align-items: center;
`;

const RotatedIcon = styled(Icon)`
  transform: rotate(45deg);
`;

const PhotoContainer = styled.View`
  width: ${SCREEN_WIDTH}px;
  height: ${SCREEN_HEIGHT}px;
  justify-content: center;
  align-items: center;
`;

const FullScreenImage = styled(ServerImage)`
  width: 100%;
  height: 100%;
`;

const LeftArrowButton = styled.TouchableOpacity`
  position: absolute;
  left: 20px;
  top: 50%;
  z-index: 10;
  width: 44px;
  height: 44px;
  justify-content: center;
  align-items: center;
  background-color: rgba(255, 255, 255, 0.3);
  border-radius: 22px;
`;

const RightArrowButton = styled.TouchableOpacity`
  position: absolute;
  right: 20px;
  top: 50%;
  z-index: 10;
  width: 44px;
  height: 44px;
  justify-content: center;
  align-items: center;
  background-color: rgba(255, 255, 255, 0.3);
  border-radius: 22px;
`;
