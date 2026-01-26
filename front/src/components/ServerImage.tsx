import { Image, ImageProps } from 'react-native';
import FastImage, { FastImageProps, Priority, ResizeMode } from 'react-native-fast-image';
import { CLOUDFRONT_BASE_URL } from '@/config/api.ts';

interface ServerImageProps extends Omit<ImageProps, 'source' | 'resizeMode'> {
  uri?: string;
  priority?: Priority;
  resizeMode?: ResizeMode;
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
  ...rest
}: ServerImageProps) {
  // uri가 string이 아니면 placeholder
  if (typeof uri !== 'string' || uri.trim() === '') {
    return <Image {...rest} />;
  }

  // 로컬 파일은 기본 Image 사용 (FastImage는 로컬 파일 지원 제한적)
  if (isLocalUri(uri)) {
    return <Image {...rest} source={{ uri }} />;
  }

  const imageUri = isFullUrl(uri) ? uri : CLOUDFRONT_BASE_URL + uri;

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