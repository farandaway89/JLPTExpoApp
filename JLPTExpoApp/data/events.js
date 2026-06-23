export const upcomingEvents = [
  {
    id: '1',
    region: '서울',
    date: '2026-07-15',
    venue: '코엑스 Hall C',
    levels: 'N3 ~ N1',
    description: 'JLPT 고급 레벨 집중 설명회 및 현장 단어 학습',
    recommendedLevel: 3,
  },
  {
    id: '2',
    region: '부산',
    date: '2026-08-10',
    venue: '벡스코 제1전시장',
    levels: 'N5 ~ N2',
    description: '초·중급 수험생을 위한 JLPT 박람회 및 체험 학습',
    recommendedLevel: 4,
  },
  {
    id: '3',
    region: '대구',
    date: '2026-09-05',
    venue: 'EXCO 동관',
    levels: '전 레벨',
    description: '영남권 JLPT 오프라인 행사 — 레벨별 부스 운영',
    recommendedLevel: 5,
  },
  {
    id: '4',
    region: '광주',
    date: '2026-09-20',
    venue: '김대중컨벤션센터',
    levels: 'N4 ~ N2',
    description: '호남권 수험생 대상 현장 모의테스트 및 단어 학습',
    recommendedLevel: 4,
  },
  {
    id: '5',
    region: '대전',
    date: '2026-10-12',
    venue: '대전컨벤션센터',
    levels: 'N5 ~ N1',
    description: '충청권 통합 JLPT 설명회 — 오프라인 학습존 운영',
    recommendedLevel: 5,
  },
];

export const formatEventDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'short',
  });
};
