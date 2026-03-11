import styled from '@/utils/scale/CustomStyled.ts';
import { Typography } from '@/components/ui';
import Icon from '@/components/ui/Icon.tsx';
import DocumentIcon from '@/assets/icons/document.svg';
import DownloadIcon from '@/assets/icons/download.svg';
import { ActivityIndicator } from 'react-native';
import { theme } from '@/theme';

interface FileDownloadButtonProps {
  fileName: string;
  fileSize?: string;
  isDownloaded: boolean;
  isDownloading?: boolean;
  onPress: () => void;
}

export default function FileDownloadButton({
  fileName,
  fileSize,
  isDownloaded,
  isDownloading = false,
  onPress,
}: FileDownloadButtonProps) {
  return (
    <Container onPress={onPress} disabled={isDownloading}>
      <IconWrapper>
        <Icon width={24} height={24} Svg={DocumentIcon} />
      </IconWrapper>
      <TextWrapper>
        <Typography fontSize={14} fontWeight="semiBold" numberOfLines={1}>
          {fileName}
        </Typography>
        {fileSize && (
          <Typography fontSize={12} color="#767676">
            {fileSize}
          </Typography>
        )}
      </TextWrapper>
      <ActionWrapper>
        {isDownloading ? (
          <ActivityIndicator size="small" color={theme.colors.primary} />
        ) : isDownloaded ? (
          <Typography fontSize={12} color={theme.colors.primary}>
            열기
          </Typography>
        ) : (
          <Icon width={20} height={20} Svg={DownloadIcon} />
        )}
      </ActionWrapper>
    </Container>
  );
}

const Container = styled.TouchableOpacity`
  flex-direction: row;
  align-items: center;
  padding: 12px 16px;
  background-color: #F5F5F5;
  border-radius: 8px;
  min-width: 250px;
  max-width: 300px;
`;

const IconWrapper = styled.View`
  margin-right: 12px;
`;

const TextWrapper = styled.View`
  flex: 1;
  margin-right: 12px;
`;

const ActionWrapper = styled.View`
  justify-content: center;
  align-items: center;
  min-width: 40px;
`;
