export type CaseCategory = 'known_application' | 'analogy';
export type ImitationKind = 'shape' | 'motion' | 'function';

export type BioMimicryCase = {
  id: string;
  natureId: string;
  title: string;
  applicationName: string; // 생활 속 응용(스크랩 카드 이름)
  naturalFeature: string; // 자연의 특징
  application: string; // 사람이 응용한 방법
  connection: string; // 공통된 원리
  explanation: string; // 맞게 연결했을 때 보여 줄 해설
  hint: string; // 다르게 연결했을 때 보여 줄 힌트
  caution: string; // 설명 시 주의
  kinds: ImitationKind[];
  category: CaseCategory;
  /** 교사 검수용 출처. 출처를 지어내지 않는다: 확인 전에는 null. */
  sourceLabel: string;
  sourceUrl: string | null;
  visualType: 'illustration';
  /** 탐구 04 연결 활동 기본 세트에 포함되는지 */
  inMatching: boolean;
};

export const KIND_LABEL: Record<ImitationKind, string> = {
  shape: '생김새를 닮았어요',
  motion: '움직임을 닮았어요',
  function: '기능이나 구조를 응용했어요',
};

export const CATEGORY_LABEL: Record<CaseCategory, string> = {
  known_application: '실제로 알려진 응용',
  analogy: '함께 상상해 보는 응용',
};

const UNVERIFIED = '교사용 검증 자료 출처 입력(검수 전)';

export const biomimicryCases: BioMimicryCase[] = [
  {
    id: 'case-burdock-hook-loop',
    natureId: 'n04',
    title: '도꼬마리와 찍찍이',
    applicationName: '갈고리·고리 방식의 찍찍이',
    naturalFeature: '열매의 작은 갈고리가 옷감이나 털에 걸린다.',
    application: '한쪽 면의 작은 갈고리가 다른 쪽 면의 고리에 걸려 반복해서 붙이고 뗄 수 있는 체결 방식',
    connection: '작은 갈고리가 고리에 걸리는 연결 원리',
    explanation: '도꼬마리의 굽은 가시 끝처럼, 찍찍이 한쪽 면에도 작은 갈고리가 촘촘해요. 갈고리가 다른 면의 고리에 걸려 붙고, 힘을 주면 떨어져요.',
    hint: '옷이나 털에 "걸려서" 붙는 자연물을 떠올려 보세요. 가시 끝 모양이 힌트예요.',
    caution: '실제 제품의 구조가 자연물과 완전히 같은 것은 아니에요.',
    kinds: ['shape', 'function'],
    category: 'known_application',
    sourceLabel: UNVERIFIED,
    sourceUrl: null,
    visualType: 'illustration',
    inMatching: true,
  },
  {
    id: 'case-lotus-water-repellent',
    natureId: 'n03',
    title: '연잎과 물을 튕기는 표면',
    applicationName: '물방울을 잘 튕기는 표면 처리 기술',
    naturalFeature: '표면에서 물방울이 동그랗게 맺히고 굴러간다.',
    application: '물이 표면에 퍼지거나 달라붙는 성질을 줄이는 표면 연구(발수·자기 세정 표면 등)',
    connection: '표면의 작은 구조와 성질 때문에 물이 퍼지지 않고 굴러가는 원리',
    explanation: '연잎 위 물방울처럼, 물방울이 동그랗게 맺혀 굴러가도록 표면을 만드는 연구가 있어요. 물방울이 굴러가며 먼지를 함께 쓸어 가는 점도 참고해요.',
    hint: '물이 묻어도 젖지 않고 또르르 굴러가는 잎을 떠올려 보세요.',
    caution: '모든 방수 제품이 연잎에서 직접 발명된 것은 아니에요.',
    kinds: ['function'],
    category: 'known_application',
    sourceLabel: UNVERIFIED,
    sourceUrl: null,
    visualType: 'illustration',
    inMatching: true,
  },
  {
    id: 'case-honeycomb-panel',
    natureId: 'n05',
    title: '벌집과 가벼운 패널',
    applicationName: '육각형 벌집 구조를 응용한 경량 패널',
    naturalFeature: '육각형 칸이 빈틈없이 연속된다.',
    application: '반복된 육각형 칸(셀) 구조를 판 사이에 넣어 가볍지만 잘 버티는 재료·패널 설계',
    connection: '반복된 칸 구조가 적은 재료로 넓은 면을 받쳐 주는 원리',
    explanation: '벌집처럼 육각형 칸을 반복한 구조를 두 판 사이에 끼우면, 속이 비어 가볍지만 잘 휘지 않는 패널을 만들 수 있어요. 이런 구조를 "허니컴 구조"라고 불러요.',
    hint: '같은 모양의 칸이 빈틈없이 반복되는 자연물은 무엇일까요?',
    caution: '"모양이 비슷하다"와 "원리를 응용했다"는 달라요. 둘을 구분해 보세요.',
    kinds: ['shape', 'function'],
    category: 'known_application',
    sourceLabel: UNVERIFIED,
    sourceUrl: null,
    visualType: 'illustration',
    inMatching: true,
  },
  {
    id: 'case-pinecone-humidity',
    natureId: 'n01',
    title: '솔방울과 습도에 반응하는 구조',
    applicationName: '습도에 반응해 움직이는 소재·구조 설계 연구',
    naturalFeature: '습도에 따라 비늘이 오므라들거나 벌어진다.',
    application: '주변의 습도 같은 환경 변화에 따라 스스로 휘거나 열리고 닫히는 소재·구조를 설계하는 연구 아이디어',
    connection: '두 층이 물기에 다르게 반응해 휘어지는 원리',
    explanation: '솔방울 비늘처럼 물기에 따라 스스로 움직이는 구조를 만들려는 연구가 있어요. 전기 없이 환경에 반응하는 재료를 상상하는 데 참고가 돼요.',
    hint: '젖으면 오므라들고 마르면 벌어지는 자연물을 떠올려 보세요.',
    caution: '널리 판매되는 특정 생활 제품이 솔방울에서 발명되었다고 단정하지 않아요. "원리를 응용한 연구"로 이해해요.',
    kinds: ['motion', 'function'],
    category: 'known_application',
    sourceLabel: UNVERIFIED,
    sourceUrl: null,
    visualType: 'illustration',
    inMatching: true,
  },
  {
    id: 'analogy-dandelion-parachute',
    natureId: 'n07',
    title: '민들레 씨앗과 낙하산 (비교해 보기)',
    applicationName: '공기를 받아 천천히 내려오는 낙하산',
    naturalFeature: '가는 털이 우산처럼 퍼져 공기를 받으며 천천히 떨어진다.',
    application: '넓게 펼친 천이 공기를 받아 떨어지는 속도를 늦춘다.',
    connection: '넓게 펼쳐 공기를 받으면 천천히 내려오는 점이 닮았어요.',
    explanation: '민들레 씨앗과 낙하산은 "공기를 받아 천천히 내려온다"는 점이 닮았어요.',
    hint: '',
    caution: '낙하산이 민들레 씨앗을 보고 발명되었다는 뜻이 아니에요. 닮은 점을 비교해 보는 상상 활동이에요.',
    kinds: ['shape', 'function'],
    category: 'analogy',
    sourceLabel: '수업용 비교 예시(실제 발명 기원 아님)',
    sourceUrl: null,
    visualType: 'illustration',
    inMatching: false,
  },
  {
    id: 'analogy-feather-zipper',
    natureId: 'n08',
    title: '새의 깃털과 지퍼 (비교해 보기)',
    applicationName: '이가 맞물려 닫히는 지퍼',
    naturalFeature: '깃가지에 붙은 작은 깃가지들이 서로 걸려 깃털 모양이 유지된다고 알려져 있다.',
    application: '작은 이가 서로 맞물려 두 면을 단단히 이어 준다.',
    connection: '작은 부분들이 서로 맞물려 하나의 면을 만드는 점이 닮았어요.',
    explanation: '깃털과 지퍼는 "작은 부분이 서로 걸려 면을 이어 준다"는 점이 닮았어요.',
    hint: '',
    caution: '지퍼가 깃털에서 발명되었다는 뜻이 아니에요. 닮은 점을 비교해 보는 상상 활동이에요.',
    kinds: ['function'],
    category: 'analogy',
    sourceLabel: '수업용 비교 예시(실제 발명 기원 아님)',
    sourceUrl: null,
    visualType: 'illustration',
    inMatching: false,
  },
];

export const caseById = (id: string | undefined) => biomimicryCases.find((c) => c.id === id);
export const matchingCases = biomimicryCases.filter((c) => c.inMatching);
