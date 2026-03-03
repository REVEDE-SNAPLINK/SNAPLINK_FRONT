import React, { useEffect } from 'react';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import styled from '@/utils/scale/CustomStyled.ts';
import { SubmitButton, Typography } from '@/components/ui';
import ScreenContainer from '@/components/layout/ScreenContainer';
import { Platform } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import Checkbox from '@/components/ui/Checkbox';
import { GetConceptsResponse } from '@/api/concepts.ts';

export interface Tag {
  id: number;
  name: string;
}

interface EditConceptTagViewProps {
  currentStep: number;
  tagIds: number[];
  conceptIds: number[];
  tags: Tag[];
  concepts: GetConceptsResponse[];
  onToggleTag: (id: number) => void;
  onToggleConcept: (id: number) => void;
  onPressBack: () => void;
  onPressSubmit: () => void;
  isSubmitDisabled: boolean;
  submitButtonText: string;
  navigation?: any;
}

const TITLE_FONT_SIZE = 16;

export default function EditConceptTagView({
  currentStep,
  tagIds,
  conceptIds,
  tags,
  concepts,
  onToggleTag,
  onToggleConcept,
  onPressBack,
  onPressSubmit,
  isSubmitDisabled,
  submitButtonText,
  navigation,
}: EditConceptTagViewProps) {
  const opacity = useSharedValue(1);
  const scrollRef = React.useRef<any>(null);

  useEffect(() => {
    requestAnimationFrame(() => {
      scrollRef.current?.scrollToPosition(0, 0, false);
    });
  }, [currentStep]);

  useEffect(() => {
    opacity.value = 0;
    opacity.value = withTiming(1, {
      duration: 300,
      easing: Easing.out(Easing.ease),
    });
  }, [currentStep, opacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <>
            <Typography fontSize={TITLE_FONT_SIZE} lineHeight="140%" marginBottom={20}>
              <Typography fontSize={TITLE_FONT_SIZE} fontWeight="semiBold" lineHeight="140%">
                촬영 관련 키워드
              </Typography>
              를 알려주세요.
            </Typography>
            <Typography fontSize={12} marginBottom={10} color="#767676">
              *중복 선택 가능
            </Typography>
            {tags.map((tag) => (
              <CheckOptionWrapper key={tag.id}>
                <Checkbox
                  isChecked={tagIds.includes(tag.id)}
                  onPress={() => onToggleTag(tag.id)}
                />
                <Typography fontSize={12} color="#767676" marginLeft={12}>
                  {tag.name}
                </Typography>
              </CheckOptionWrapper>
            ))}
          </>
        );
      case 1:
        return (
          <>
            <Typography fontSize={16} lineHeight="140%" marginBottom={20}>
              <Typography fontSize={16} fontWeight="semiBold" lineHeight="140%">
                주로 활동하는 컨셉
              </Typography>
              을 선택해 주세요.
            </Typography>
            <Typography fontSize={12} marginBottom={10} color="#767676">
              *중복 선택 가능
            </Typography>
            {concepts.map((concept) => (
              <CheckOptionWrapper key={concept.id}>
                <Checkbox
                  isChecked={conceptIds.includes(concept.id)}
                  onPress={() => onToggleConcept(concept.id)}
                />
                <Typography fontSize={12} color="#767676" marginLeft={12}>
                  {concept.conceptName}
                </Typography>
              </CheckOptionWrapper>
            ))}
          </>
        );
      default:
        return null;
    }
  };

  return (
    <ScreenContainer
      headerShown
      headerTitle="촬영 컨셉 및 키워드 수정"
      onPressBack={onPressBack}
      paddingHorizontal={16}
      alignItemsCenter={false}
      navigation={navigation}
    >
      <KeyboardFormView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={0}
      >
        <KeyboardAwareScrollView
          ref={scrollRef}
          enableOnAndroid
          keyboardShouldPersistTaps="handled"
          extraScrollHeight={20}
          contentContainerStyle={{ alignItems: 'stretch' }}
        >
          <AnimatedFormContainer style={animatedStyle}>
            {renderStep()}
          </AnimatedFormContainer>
        </KeyboardAwareScrollView>
      </KeyboardFormView>
      <Footer>
        <SubmitButton
          onPress={onPressSubmit}
          width="100%"
          disabled={isSubmitDisabled}
          text={submitButtonText}
          marginBottom={10}
        />
      </Footer>
    </ScreenContainer>
  );
}

const KeyboardFormView = styled.KeyboardAvoidingView`
  flex: 1;
  width: 100%;
`

const AnimatedFormContainer = styled(Animated.View)`
  width: 100%;
  align-self: stretch;
`;

const Footer = styled.View`
  width: 100%;
  padding-top: 20px;
  padding-bottom: 20px;
  align-items: center;
  justify-content: center;
`

const CheckOptionWrapper = styled.View`
  width: 100%;
  align-self: stretch;
  flex-direction: row;
  align-items: center;
  margin-bottom: 15px;
`;
