import { useState, useMemo } from 'react';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import EditConceptTagView from '@/screens/photographer/EditConceptTag/EditConceptTagView.tsx';
import { MainNavigationProp, MainStackParamList } from '@/types/navigation.ts';
import { useConceptsQuery, useTagsQuery } from '@/queries/meta.ts';
import { Alert } from '@/components/ui';

type EditConceptTagRouteProp = RouteProp<MainStackParamList, 'EditConceptTag'>;

const TOTAL_STEPS = 2;

export default function EditConceptTagContainer() {
  const navigation = useNavigation<MainNavigationProp>();
  const route = useRoute<EditConceptTagRouteProp>();
  const { tagIds: initialTagIds, conceptIds: initialConceptIds, onSubmit } = route.params;

  const { data: tags } = useTagsQuery();
  const { data: concepts } = useConceptsQuery();

  const [currentStep, setCurrentStep] = useState(0);
  const [tagIds, setTagIds] = useState<number[]>(initialTagIds ?? []);
  const [conceptIds, setConceptIds] = useState<number[]>(initialConceptIds ?? []);

  const isStepValid = useMemo(() => {
    switch (currentStep) {
      case 0:
        return tagIds.length >= 1;
      case 1:
        return conceptIds.length >= 1;
      default:
        return false;
    }
  }, [currentStep, tagIds, conceptIds]);

  const handlePressBack = () => {
    if (currentStep === 0) {
      navigation.goBack();
    } else {
      setCurrentStep(currentStep - 1);
    }
  };

  const handlePressSubmit = () => {
    if (!isStepValid) return;

    if (currentStep < TOTAL_STEPS - 1) {
      setCurrentStep((prev) => prev + 1);
    } else {
      if (onSubmit) {
        onSubmit(tagIds, conceptIds);
        navigation.goBack();
      } else {
        Alert.show({
          title: '촬영 컨셉 및 키워드 수정',
          message: '촬영 컨셉 및 키워드가 수정되었습니다.',
          buttons: [
            {
              text: '확인',
              onPress: () => {
                navigation.goBack();
              },
            },
          ],
        });
      }
    }
  };

  const handleToggleTag = (id: number) => {
    setTagIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleToggleConcept = (id: number) => {
    setConceptIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };


  const submitButtonText = currentStep === TOTAL_STEPS - 1 ? '완료하기' : '다음';

  return (
    <EditConceptTagView
      currentStep={currentStep}
      tagIds={tagIds}
      conceptIds={conceptIds}
      tags={tags ?? []}
      concepts={concepts ?? []}
      onToggleTag={handleToggleTag}
      onToggleConcept={handleToggleConcept}
      onPressBack={handlePressBack}
      onPressSubmit={handlePressSubmit}
      isSubmitDisabled={!isStepValid}
      submitButtonText={submitButtonText}
      navigation={navigation}
    />
  );
}
