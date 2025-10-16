import React, { useState } from 'react';
import SelectTypeView from './SelectTypeView';

export default function SelectTypeContainer() {
  const [type, setType] = useState<'user' | 'photographer' | null>(null);

  const onSubmit = async () => {

  }

  return (
    <SelectTypeView
      isSelectedUser={type === 'user'}
      isSelectedPhotographer={type === 'photographer'}
      onPressUser={() => setType('user')}
      onPressPhotographer={() => setType('photographer')}
      isValid={type !== null}
      onSubmit={onSubmit}
    />
  );
}
