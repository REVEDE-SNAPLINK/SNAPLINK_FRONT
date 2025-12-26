import { Image, ImageProps } from 'react-native';
import { CLOUDFRONT_BASE_URL } from '@/config/api.ts';

interface ServerImageProps extends Omit<ImageProps, 'source'> {
  uri?: string;
}

export default function ServerImage({ uri, ...rest }: ServerImageProps) {
  if (!uri) {
    return <Image {...rest} />;
  }

  const imageUri = CLOUDFRONT_BASE_URL + uri;

  return (
    <Image {...rest} source={{ uri: imageUri }} />
  )
}