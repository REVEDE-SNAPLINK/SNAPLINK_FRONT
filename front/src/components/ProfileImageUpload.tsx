import styled from '@/utils/scale/CustomStyled.ts';
import { theme } from '@/theme';
import Icon from '@/components/Icon.tsx';
import CameraIcon from '@/assets/icons/camera-white.svg';

interface ProfileImageUploadProps {
  imageURI?: string;
  onPress: () => void;
  size?: number;
  marginTop?: number;
  marginBottom?: number;
}

const UploadProfileButtonWrapper = styled.View<{
  marginTop?: number;
  marginBottom?: number;
}>`
  width: 100%;
  align-items: center;
  ${({ marginTop }) => marginTop !== undefined && `margin-top: ${marginTop}px;`}
  ${({ marginBottom }) => marginBottom !== undefined && `margin-bottom: ${marginBottom}px;`}
`;

const UploadProfileButton = styled.TouchableOpacity<{ size: number }>`
  width: ${({ size }) => size}px;
  height: ${({ size }) => size}px;
`;

const ProfileImageWrapper = styled.View<{ size: number }>`
  width: 100%;
  height: 100%;
  border-radius: ${({ size }) => size}px;
  overflow: hidden;
  background-color: ${theme.colors.disabled};
`;

const ProfileImage = styled.Image`
  width: 100%;
  height: 100%;
  resize-mode: cover;
`;

const UploadProfileIconWrapper = styled.View`
  width: 30px;
  height: 30px;
  background-color: ${theme.colors.disabled};
  border-radius: 30px;
  border: 2px solid #fff;
  justify-content: center;
  align-items: center;
  position: absolute;
  bottom: -1px;
  right: 4px;
`;

export default function ProfileImageUpload({
  imageURI,
  onPress,
  size = 110,
  marginTop,
  marginBottom,
}: ProfileImageUploadProps) {
  return (
    <UploadProfileButtonWrapper marginTop={marginTop} marginBottom={marginBottom}>
      <UploadProfileButton size={size} onPress={onPress}>
        <ProfileImageWrapper size={size}>
          {imageURI && <ProfileImage source={{ uri: imageURI }} />}
        </ProfileImageWrapper>
        <UploadProfileIconWrapper>
          <Icon width={18} height={18} Svg={CameraIcon} />
        </UploadProfileIconWrapper>
      </UploadProfileButton>
    </UploadProfileButtonWrapper>
  );
}
