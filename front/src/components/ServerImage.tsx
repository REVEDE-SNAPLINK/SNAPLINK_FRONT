import { Image, ImageProps } from 'react-native';
import { CLOUDFRONT_BASE_URL } from '@/config/api.ts';

interface ServerImageProps extends Omit<ImageProps, 'source'> {
  uri?: string;
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

export default function ServerImage({ uri, ...rest }: ServerImageProps) {
  // uri가 string이 아니면 이미지 자체를 렌더링하지 않거나 placeholder
  if (typeof uri !== 'string' || uri.trim() === '') {
    return <Image {...rest} />;
  }

  if (isLocalUri(uri)) {
    return <Image {...rest} source={{ uri }} />;
  }

  if (isFullUrl(uri)) {
    return <Image {...rest} source={{ uri }} />;
  }

  const imageUri = CLOUDFRONT_BASE_URL + uri;

  return <Image {...rest} source={{ uri: imageUri }} />;
}