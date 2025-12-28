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
const isLocalUri = (uri: string): boolean => {
  return (
    uri.startsWith('file://') ||
    uri.startsWith('content://') ||
    uri.startsWith('ph://') ||
    uri.startsWith('/')
  );
};

/**
 * 이미 전체 URL인지 판단 (http:// 또는 https://)
 */
const isFullUrl = (uri: string): boolean => {
  return uri.startsWith('http://') || uri.startsWith('https://');
};

export default function ServerImage({ uri, ...rest }: ServerImageProps) {
  if (!uri) {
    return <Image {...rest} />;
  }

  // 로컬 파일 URI면 그대로 사용
  if (isLocalUri(uri)) {
    return <Image {...rest} source={{ uri }} />;
  }

  // 이미 전체 URL이면 그대로 사용
  if (isFullUrl(uri)) {
    return <Image {...rest} source={{ uri }} />;
  }

  // 서버에서 받은 상대 경로면 CloudFront 도메인 붙이기
  const imageUri = CLOUDFRONT_BASE_URL + uri;

  return (
    <Image {...rest} source={{ uri: imageUri }} />
  );
}