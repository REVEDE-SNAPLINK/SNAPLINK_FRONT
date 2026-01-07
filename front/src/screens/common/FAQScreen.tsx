import React, { useState, useMemo } from 'react';
import ScreenContainer from '@/components/common/ScreenContainer';
import styled from '@/utils/scale/CustomStyled';
import { Typography } from '@/components/theme';
import Icon from '@/components/Icon.tsx';
import ArrowDownIcon from '@/assets/icons/arrow-down.svg';
import { useNavigation } from '@react-navigation/native';
import { MainNavigationProp } from '@/types/navigation.ts';
import { theme } from '@/theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// ✅ 고정 FAQ 타입
type FAQItem = {
  question: string;
  answer: string;
};

type FAQSection = {
  title: string;
  items: FAQItem[];
};

// ✅ 고정 FAQ 데이터 (웹 코드 그대로)
const FAQ_SECTIONS: FAQSection[] = [
  {
    title: "[공통] 서비스 이용 안내",
    items: [
      {
        question: "스냅링크는 어떤 서비스인가요?",
        answer:
          "스냅링크는 나에게 딱 맞는 사진작가님을 찾고, 간편하게 예약과 일정 관리까지 할 수 있는 스냅 촬영 통합 플랫폼입니다. 인스타그램이나 블로그에서 헤맬 필요 없이, 검증된 작가님의 포트폴리오를 확인하고 직접 소통해 보세요.",
      },
    ],
  },
  {
    title: "[작가 전용] 활동 및 일정 관리",
    items: [
      {
        question: "서비스 이용 수수료가 있나요?",
        answer:
          "현재 개인 고객과 진행하는 일반 스냅 촬영에 대해서는 중개 수수료가 전혀 없습니다. 작가님의 수익을 100% 보장하며 자유로운 활동을 지원합니다. 다만, 추후 서비스 운영 정책에 따라 수수료가 적용될 수 있으며, 이 경우 적용 최소 한 달 전에 미리 상세히 안내해 드릴 예정입니다. (기업/행사 촬영은 별도의 정산 체계가 적용됩니다.)",
      },
      {
        question: "촬영 예약과 개인 일정을 어떻게 관리하나요?",
        answer:
          "스냅링크는 작가님의 편의를 위해 두 가지 방식의 일정 비활성화 기능을 제공합니다.\n\n1. 휴가 설정 (날짜 전체 막기): 특정 날짜를 선택해 통째로 휴무일로 지정할 수 있습니다. 해당 날짜는 예약이 불가능한 상태로 전환됩니다.\n2. 일정 추가 (특정 날짜ㆍ시간 막기): [+ 일정 추가] 버튼을 통해 특정 날짜의 특정 시간대만 선택하여 막을 수 있습니다. 타 플랫폼 예약이나 개인 용무가 있을 때 유용합니다.",
      },
      {
        question: "당분간 촬영을 쉬고 싶을 땐 어떻게 하나요?",
        answer:
          "서비스 탈퇴 없이도 '프로필 비공개' 기능을 통해 잠시 휴식기를 가질 수 있습니다. 프로필을 비공개로 전환하면 서비스 내에서 작가님의 정보가 노출되지 않으며, 새로운 예약 요청도 들어오지 않습니다. 언제든 원하실 때 다시 활성화하여 활동을 재개하실 수 있습니다.",
      },
      {
        question: "예약 요청을 여러 명에게 동시에 받을 수 있나요?",
        answer:
          "네, 가능합니다. 특정 시간대에 여러 건의 예약 요청이 들어올 경우 작가님이 직접 원하는 촬영 건을 선택하여 수락하실 수 있습니다. 작가님이 한 건을 '확정'하는 순간 동일 시간대의 다른 요청들은 자동으로 마감 안내가 전송됩니다.",
      },
    ],
  },
  {
    title: "[고객 전용] 예약 및 결제",
    items: [
      {
        question: "촬영 예약은 어떻게 진행되나요?",
        answer:
          "맘에 드는 작가님의 프로필에서 [예약하기]를 눌러 원하는 날짜와 시간을 선택해 보세요. 작가님이 요청을 확인하고 앱 내 채팅을 통해 상담을 진행한 후 최종 확정됩니다.",
      },
      {
        question: "촬영 대금은 앱에서 결제하나요?",
        answer:
          "현재는 작가님과 채팅을 통해 협의하신 후, 안내받으신 계좌로 직접 송금하는 방식을 사용하고 있습니다. 이는 작가님의 수수료 부담을 없애기 위한 정책입니다. 다만, 이용자 편의를 위해 추후 앱 내 결제 시스템 도입을 검토 중에 있습니다. (기업/행사 촬영은 별도의 정산 절차에 따라 진행됩니다.)",
      },
    ],
  },
  {
    title: "[특별] 기업 및 행사촬영",
    items: [
      {
        question: "기업 및 행사 촬영의 계약은 어떻게 이루어지나요? (계약의 주체)",
        answer:
          "스냅링크가 클라이언트-작가님 양쪽 모두와 정식 계약을 체결합니다. 스냅링크는 클라이언트와 계약하여 대금 지급을 보장받고, 동시에 작가님과도 계약을 체결하여 촬영 권익을 보호합니다. 양방향 계약 구조를 통해 계약 불이행이나 법적 분쟁 리스크로부터 작가님을 안전하게 지켜드립니다.",
      },
      {
        question: "클라이언트와 직접 소통해야 하나요? (소통 방식)",
        answer:
          "원활한 계약 이행과 작가님의 업무 효율을 위해, 스냅링크 전담 매니저가 클라이언트의 요청 사항을 조율하여 전달해 드립니다. 불필요한 감정 소모나 무리한 요구로부터 작가님을 보호하며, 확정된 기획안에 따라 최상의 퀄리티를 낼 수 있도록 돕습니다.",
      },
      {
        question: "행사 촬영의 신청과 정산은 어떻게 진행되나요?",
        answer:
          "행사 촬영은 개별 등록 상품이 아닙니다. 스냅링크 웹사이트를 통해 들어온 기업 고객의 신청서를 검토한 후, 적합한 작가님께 저희가 직접 배정 제안을 드립니다. 작가님이 수락하시면 정식 계약서를 작성하며, 촬영 완료 후 스냅링크가 약속된 기일에 정산금을 직접 지급합니다.",
      },
      {
        question: "노쇼 시에도 보호받을 수 있나요? (정산 및 보장)",
        answer:
          "대금 지급의 안정성을 100% 보장합니다. 클라이언트의 갑작스러운 취소(노쇼)가 발생하더라도 사전에 약정된 위약금을 작가님께 보장해 드립니다. 정산 걱정 없이 안심하고 촬영에만 집중하세요.",
      },
    ],
  },
  {
    title: "[기타] 취소 및 분쟁 해결",
    items: [
      {
        question: "예약 후 취소하고 싶을 때는 어떻게 하나요?",
        answer:
          "예약의 취소 및 환불 규정은 개별 작가님의 정책에 따릅니다. 채팅을 통해 작가님께 직접 의사를 전달해 주세요. 단, 노쇼나 부당한 거래 거절이 반복될 경우 서비스 이용이 제한될 수 있습니다.",
      },
    ],
  },
];

type OpenState = Record<string, boolean>;

export default function FAQScreen() {
  const navigation = useNavigation<MainNavigationProp>();

  const [openSections, setOpenSections] = useState<OpenState>(() => {
    const init: OpenState = {};
    FAQ_SECTIONS.forEach((sec) => (init[sec.title] = true)); // 기본 섹션 열림
    return init;
  });

  const [openItems, setOpenItems] = useState<OpenState>({});

  const toggleSection = (title: string) => {
    setOpenSections((prev) => ({ ...prev, [title]: !prev[title] }));
  };

  const toggleItem = (key: string) => {
    setOpenItems((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const sectionList = useMemo(() => FAQ_SECTIONS, []);

  return (
    <ScreenContainer
      headerShown
      headerTitle="자주 묻는 질문"
      navigation={navigation}>
      <ScrollCotainer showsVerticalScrollIndicator={false}>
        <FAQWrapper>
          {sectionList.map((section) => {
            const sectionOpen = !!openSections[section.title];
            return (
              <Section key={section.title}>
                <SectionHeader onPress={() => toggleSection(section.title)}>
                  <Typography fontSize={16} fontWeight="bold">
                    {section.title}
                  </Typography>
                  <Icon
                    width={15}
                    height={15}
                    Svg={ArrowDownIcon}
                  />
                </SectionHeader>

                {sectionOpen && (
                  <SectionBody>
                    {section.items.map((item, idx) => {
                      const key = `${section.title}__${idx}`;
                      const itemOpen = !!openItems[key];

                      return (
                        <FAQRow key={key} onPress={() => toggleItem(key)}>
                          <FAQContent>
                            <Typography fontSize={14} fontWeight="semiBold">
                              Q. {item.question}
                            </Typography>
                            {itemOpen && (
                              <Typography fontSize={13} lineHeight={20} color="text" marginTop={20}>
                                {item.answer}
                              </Typography>
                            )}
                          </FAQContent>
                          <Icon
                            width={15}
                            height={15}
                            Svg={ArrowDownIcon}
                          />
                        </FAQRow>
                      );
                    })}
                  </SectionBody>
                )}
              </Section>
            );
          })}
        </FAQWrapper>
        <ScrollSpacer />
      </ScrollCotainer>
    </ScreenContainer>
  );
}

// ----------------- Styled -----------------
const ScrollCotainer = styled.ScrollView`
  flex: 1;
  width: 100%;
  padding-bottom: 50px;
`

const ScrollSpacer = styled.View`
  height: 50px;
`

const FAQWrapper = styled.View`
  flex-direction: column;
  gap: 20px;
  width: 100%;
  padding-horizontal: 20px;
`;

const Section = styled.View`
  flex-direction: column;
`;

const SectionHeader = styled.TouchableOpacity`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  padding-vertical: 12px;
`;

const SectionBody = styled.View`
  margin-top: 10px;
`;

const FAQRow = styled.TouchableOpacity`
  flex-direction: row;
  justify-content: space-between;
  align-items: flex-start;
  margin-vertical: 10px;
  padding-bottom: 10px;
  border-bottom-width: 1px;
  border-bottom-style: solid;
  border-bottom-color: ${theme.colors.textPrimary};
`;

const FAQContent = styled.View`
  flex: 1;
`;