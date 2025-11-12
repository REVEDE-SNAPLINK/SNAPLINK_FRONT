import { View } from 'react-native';
import styled from '@/utils/scale/CustomStyled';
import Typography from '@/components/theme/Typography';

export default function MoreScreen() {
  return (
    <Container>
      <Typography fontSize={24} fontWeight="bold">
        More
      </Typography>
      <Typography fontSize={16} color="#666">
        Coming soon...
      </Typography>
    </Container>
  );
}

const Container = styled(View)`
  flex: 1;
  justify-content: center;
  align-items: center;
  background-color: #FFFFFF;
`;
