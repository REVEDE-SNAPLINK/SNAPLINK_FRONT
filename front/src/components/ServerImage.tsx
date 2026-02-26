import { Image as ExpoImage, ImageProps as ExpoImageProps, ImageContentFit } from 'expo-image';
import { CLOUDFRONT_BASE_URL } from '@/config/api.ts';

const DefaultProfileImage = require('@/assets/imgs/default_profile.png');

interface ServerImageProps extends Omit<ExpoImageProps, 'source'> {
  uri?: string;
  priority?: 'low' | 'normal' | 'high';
  /** legacy react-native-fast-image prop mapping */
  resizeMode?: 'contain' | 'cover' | 'stretch' | 'center' | 'repeat';
  /**
   * CloudFront 이미지 리사이저 요청용 width 파라미터
   * 예) width가 400이면 ?w=400 파라미터를 추가하여 썸네일로 가져옴
   */
  requestWidth?: number;
  type?: 'profile' | 'default';
  recyclingKey?: string;
}

/**
 * 로컬 파일 URI인지 판단
 * - file://, content://, ph:// 등으로 시작하면 로컬 파일
 * - 절대 경로(/)로 시작하면 로컬 파일
 */
export const isLocalUri = (uri: unknown): boolean => {
  if (typeof uri !== 'string') return false;

  return (
    uri.startsWith('file://') ||
    uri.startsWith('content://') ||
    uri.startsWith('ph://') ||
    uri.startsWith('/')
  );
};

const isFullUrl = (uri: unknown): boolean => {
  if (typeof uri !== 'string') return false;

  return uri.startsWith('http://') || uri.startsWith('https://');
};

const mapResizeModeToContentFit = (resizeMode?: string): ImageContentFit => {
  if (resizeMode === 'contain') return 'contain';
  if (resizeMode === 'stretch') return 'fill';
  if (resizeMode === 'center') return 'none';
  return 'cover';
};

export default function ServerImage({
  uri,
  priority = 'normal',
  resizeMode = 'cover',
  requestWidth,
  type = 'default',
  recyclingKey,
  ...rest
}: ServerImageProps) {
  const contentFit = rest.contentFit || mapResizeModeToContentFit(resizeMode);

  // uri가 string이 아니면 placeholder
  if (typeof uri !== 'string' || uri.trim() === '') {
    if (type === 'profile') {
      return <ExpoImage {...rest} source={DefaultProfileImage} contentFit={contentFit} recyclingKey={recyclingKey} />;
    }
    return <ExpoImage {...rest} contentFit={contentFit} recyclingKey={recyclingKey} />;
  }

  // 로컬 파일 (expo-image 지원)
  if (isLocalUri(uri)) {
    return <ExpoImage {...rest} source={{ uri }} contentFit={contentFit} recyclingKey={recyclingKey} />;
  }

  let imageUri = isFullUrl(uri) ? uri : CLOUDFRONT_BASE_URL + uri;

  // CloudFront 리사이징 쿼리 파라미터가 필요한 경우 추가 (requestWidth)
  if (requestWidth && requestWidth > 0 && !isFullUrl(uri)) {
    // 픽셀 비율(PixelRatio)을 고려하거나 정수로 올림 처리
    const w = Math.ceil(requestWidth);
    const separator = imageUri.includes('?') ? '&' : '?';
    imageUri = `${imageUri}${separator}w=${w}`;
  }

  return (
    <ExpoImage
      {...rest}
      source={{ uri: imageUri }}
      priority={priority}
      cachePolicy="memory-disk"
      contentFit={contentFit}
      transition={200}
      recyclingKey={recyclingKey}
    />
  );
}