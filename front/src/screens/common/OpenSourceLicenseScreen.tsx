import { FlatList, Text, View } from 'react-native';
import rawLicenses from '@/assets/licenses.json';
import ScreenContainer from '@/components/common/ScreenContainer.tsx';
import { useNavigation } from '@react-navigation/native';
import { MainNavigationProp } from '@/types/navigation.ts';

const licenses: LicenseItem[] = Object.entries(rawLicenses).map(
  ([key, value]: any) => {
    const [name, version] = key.split('@');

    return {
      id: key,
      name,
      version,
      licenses: value.licenses,
      repository: value.repository,
      licenseText: value.licenseText,
    };
  }
).sort((a, b) => a.name.localeCompare(b.name));

interface LicenseItem {
  id: string;              // react@18.2.0
  name: string;            // react
  version?: string;        // 18.2.0
  licenses: string;        // MIT
  repository?: string;
  licenseText?: string;
}

export default function OpenSourceLicensesScreen() {
  const navigation = useNavigation<MainNavigationProp>();


  return (
    <ScreenContainer
      headerShown
      headerTitle="오픈소스 라이선스 고지"
      onPressBack={() => navigation.goBack()}
    >
      <FlatList
        data={licenses}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16 }}
        ItemSeparatorComponent={() => (
          <View style={{ height: 1, backgroundColor: '#E5E5E5' }} />
        )}
        renderItem={({ item }) => (
          <View
            style={{ paddingVertical: 12 }}
          >
            <Text style={{ fontSize: 16, fontWeight: '600', color: '#000' }}>
              {item.name}
              {item.version ? ` (${item.version})` : ''}
            </Text>

            <Text style={{ fontSize: 13, color: '#666', marginTop: 4 }}>
              License: {item.licenses}
            </Text>
          </View>
        )}
      />

    </ScreenContainer>
  );
}
