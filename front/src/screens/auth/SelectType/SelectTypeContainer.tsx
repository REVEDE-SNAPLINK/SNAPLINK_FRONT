import React, { useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import SelectTypeView from './SelectTypeView';
import { AuthNavigationProp } from '@/types/navigation.ts';

export default function SelectTypeContainer() {
  const [type, setType] = useState<'user' | 'photographer' | null>(null);
  const navigation = useNavigation<AuthNavigationProp>();

  const onPressBackButton = () => navigation.goBack();

  const onSubmit = async () => {
    if (type === 'user') {}
    if (type === 'photographer') {
      navigation.navigate('ApplyPhotographer');
    }
  }

  return (
    <SelectTypeView
      onPressBackButton={onPressBackButton}
      isSelectedUser={type === 'user'}
      isSelectedPhotographer={type === 'photographer'}
      onPressUser={() => setType('user')}
      onPressPhotographer={() => setType('photographer')}
      isValid={type !== null}
      onSubmit={onSubmit}
    />
  );
}
