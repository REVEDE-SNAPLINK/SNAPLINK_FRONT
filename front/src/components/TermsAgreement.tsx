import { memo, useMemo } from 'react';
import { TouchableOpacity } from 'react-native';
import styled from '@/utils/scale/CustomStyled.ts';
import Typography from '@/components/theme/Typography.tsx';
import Checkbox from '@/components/theme/Checkbox';
import { openTermUrl } from '@/utils/link.ts';

export interface TermItem {
  id: string;
  label: string;
  required: boolean;
  link?: string;
}

interface TermsAgreementProps {
  terms: TermItem[];
  agreedTerms: string[];
  onToggleTerm: (termId: string) => void;
  onToggleAll: () => void;
}

const TermWrapper = styled.View`
  flex-direction: row;
  align-items: center;
  margin-bottom: 25px;
`;

function TermsAgreement({
  terms,
  agreedTerms,
  onToggleTerm,
  onToggleAll,
}: TermsAgreementProps) {
  const allAgreed = useMemo(
    () => terms.every((term) => agreedTerms.includes(term.id)),
    [terms, agreedTerms]
  );

  return (
    <>
      <TermWrapper>
        <Checkbox isChecked={allAgreed} onPress={onToggleAll} />
        <Typography
          fontSize={12}
          fontWeight="semiBold"
          lineHeight="140%"
          marginLeft={12}
        >
          약관 전체 동의
        </Typography>
      </TermWrapper>

      {terms.map((term) => {
        const isChecked = agreedTerms.includes(term.id);

        return (
          <TermWrapper key={term.id}>
            <Checkbox
              isChecked={isChecked}
              onPress={() => onToggleTerm(term.id)}
            />
            {term.link ? (
              <TouchableOpacity onPress={() => term.link !== undefined && openTermUrl(term.link)}>
                <Typography
                  fontSize={12}
                  lineHeight="140%"
                  color="#737373"
                  marginLeft={12}
                  style={{ textDecorationLine: 'underline' }}
                >
                  {term.label}
                  <Typography
                    fontSize={12}
                    color="disabled"
                    style={{ textDecorationLine: 'none' }}
                  >
                    {' '}
                    ({term.required ? '필수' : '선택'})
                  </Typography>
                </Typography>
              </TouchableOpacity>
            ) : (
              <Typography
                fontSize={12}
                lineHeight="140%"
                color="#737373"
                marginLeft={12}
              >
                {term.label}
                <Typography fontSize={12} color="disabled">
                  {' '}
                  ({term.required ? '필수' : '선택'})
                </Typography>
              </Typography>
            )}
          </TermWrapper>
        );
      })}
    </>
  );
}

export default memo(TermsAgreement);
