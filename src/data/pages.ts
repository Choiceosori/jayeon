import type { PageId } from '../components/ui';

export type PageInfo = { id: PageId; code: string; tab: string; title: string; desc: string; part: 0 | 1 | 2 | 3 };

export const PART_INFO = {
  0: { title: '표지', question: '' },
  1: { title: '1~2차시 · 자연 속으로', question: '자연물의 다양한 특징을 관찰하고, 자연을 모방한 발명 사례를 탐구해 봅시다.' },
  2: { title: '3~4차시 · 상상 속으로', question: '자연의 특징을 기존 물건과 결합하여 새로운 아이디어를 표현해 봅시다.' },
  3: { title: '책갈피', question: '' },
} as const;

export const PAGES: PageInfo[] = [
  { id: 'cover', code: '표지', tab: '표지', title: '탐험 수첩 표지', desc: '', part: 0 },
  { id: 'contents', code: '목차', tab: '목차', title: '탐험 수첩 차례', desc: '', part: 0 },
  { id: 'atlas', code: '관찰 01', tab: '도감', title: '자연 관찰 도감', desc: '여덟 가지 자연 표본을 넘겨 보며 생김새를 비교해요.', part: 1 },
  { id: 'observe', code: '관찰 02', tab: '관찰', title: '자세히 보기 · 관찰 수첩', desc: '확대경으로 살펴보고 모양·표면·궁금증을 적어요.', part: 1 },
  { id: 'ability', code: '탐구 03', tab: '능력', title: '자연의 특별한 능력', desc: '본 것과 예상, 새로 안 것을 나누어 적어요.', part: 1 },
  { id: 'match', code: '탐구 04', tab: '사례', title: '자연을 따라 만든 물건 찾기', desc: '자연물과 생활 속 응용 사례를 연결해요.', part: 1 },
  { id: 'museum', code: '탐구 05', tab: '전시', title: '자연 모방 사례 전시 코너', desc: '생김새·움직임·기능 중 무엇을 닮았는지 살펴요.', part: 2 },
  { id: 'combine', code: '조합 06', tab: '조합', title: '자연물 × 생활용품 조합실', desc: '자연 카드와 물건 카드를 자유롭게 겹쳐 봐요.', part: 2 },
  { id: 'sketch', code: '표현 07', tab: '스케치', title: '나의 상상 스케치북', desc: '그림이나 글로 상상한 모습을 표현해요.', part: 2 },
  { id: 'notebook', code: '책갈피', tab: '모아보기', title: '나의 자연 탐험 수첩', desc: '기록을 한 권으로 넘겨 보고 인쇄해요.', part: 3 },
];

export const pageIndex = (id: PageId) => PAGES.findIndex((p) => p.id === id);
