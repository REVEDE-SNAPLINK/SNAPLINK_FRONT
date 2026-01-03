const KEYWORDS = [
  '행사','스케치','기업','워크숍','세미나','컨퍼런스','단체','본식','비즈니스','개업','사업',
  '서포터즈','파티','공연','연주회','발표회','전시회','동호회','동창회','모임','연회','뒤풀이',
  '피로연','대규모','인원미정','전속','공공기관','지자체',
] as const;

// 기본: 부분 문자열 포함 여부(띄어쓰기/대소문자 영향 거의 없음, 한글 기준)
export function hasForbiddenWords(input: string, keywords: readonly string[] = KEYWORDS) {
  const text = (input ?? '').trim();
  if (!text) return { has: false, matches: [] as string[] };

  const matches = keywords.filter((k) => text.includes(k));
  return matches.length > 0;
}