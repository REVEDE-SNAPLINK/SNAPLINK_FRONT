import { Image, ImageProps } from 'react-native';
import FastImage, { FastImageProps, Priority, ResizeMode } from 'react-native-fast-image';
import { CLOUDFRONT_BASE_URL } from '@/config/api.ts';

const DefaultProfileImage = require('@/assets/imgs/default_profile.png');

interface ServerImageProps extends Omit<ImageProps, 'source' | 'resizeMode'> {
  uri?: string;
  priority?: Priority;
  resizeMode?: ResizeMode;
  /**
   * CloudFront 이미지 리사이저 요청용 width 파라미터
   * 예) width가 400이면 ?w=400 파라미터를 추가하여 썸네일로 가져옴
   */
  requestWidth?: number;
  type?: 'profile' | 'default';
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

export default function ServerImage({
  uri,
  priority = FastImage.priority.normal,
  resizeMode = FastImage.resizeMode.cover,
  requestWidth,
  type = 'default',
  ...rest
}: ServerImageProps) {
  // uri가 string이 아니면 placeholder
  if (typeof uri !== 'string' || uri.trim() === '') {
    if (type === 'profile') {
      return <Image {...rest} source={DefaultProfileImage} />;
    }
    return <Image {...rest} />;
  }

  // 로컬 파일은 기본 Image 사용 (FastImage는 로컬 파일 지원 제한적)
  if (isLocalUri(uri)) {
    return <Image {...rest} source={{ uri }} />;
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
    <FastImage
      {...(rest as Omit<FastImageProps, 'source'>)}
      source={{
        uri: imageUri,
        priority,
        cache: FastImage.cacheControl.immutable,
      }}
      resizeMode={resizeMode}
    />
  );
}