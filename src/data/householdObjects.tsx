import type { ReactElement } from 'react';

export type HouseholdObject = { id: string; name: string; parts: string; Icon: () => ReactElement };

const s = { stroke: '#29342D', strokeWidth: 2.2, fill: 'none', strokeLinejoin: 'round' as const, strokeLinecap: 'round' as const };
const paper = '#FFFCF4';

export const householdObjects: HouseholdObject[] = [
  {
    id: 'o01', name: '필통', parts: '뚜껑, 칸막이, 겉면, 여닫는 부분',
    Icon: () => (<g><rect x="6" y="22" width="52" height="22" rx="6" {...s} fill={paper} /><path d="M6 31 H58" {...s} /><path d="M44 26 v-2" {...s} /></g>),
  },
  {
    id: 'o02', name: '물병', parts: '뚜껑, 몸통, 손잡이, 바닥',
    Icon: () => (<g><rect x="24" y="6" width="16" height="8" rx="2" {...s} fill={paper} /><path d="M22 14 h20 l2 6 v34 a4 4 0 0 1 -4 4 h-16 a4 4 0 0 1 -4 -4 v-34z" {...s} fill={paper} /><path d="M22 30 h22" {...s} /></g>),
  },
  {
    id: 'o03', name: '책가방', parts: '어깨끈, 앞주머니, 지퍼, 등판',
    Icon: () => (<g><path d="M14 20 a18 18 0 0 1 36 0 v32 a4 4 0 0 1 -4 4 h-28 a4 4 0 0 1 -4 -4z" {...s} fill={paper} /><rect x="20" y="34" width="24" height="14" rx="3" {...s} /><path d="M26 10 a6 6 0 0 1 12 0" {...s} /></g>),
  },
  {
    id: 'o04', name: '우산', parts: '우산 천, 살, 손잡이, 끝부분',
    Icon: () => (<g><path d="M6 32 Q32 2 58 32 Q51 27 45 32 Q38 27 32 32 Q26 27 19 32 Q13 27 6 32Z" {...s} fill={paper} /><path d="M32 32 V52 a5 5 0 0 1 -10 0" {...s} /></g>),
  },
  {
    id: 'o05', name: '신발', parts: '밑창, 끈, 발등, 뒤꿈치',
    Icon: () => (<g><path d="M6 42 V26 h14 q4 8 16 8 q14 0 20 8 v4 H6z" {...s} fill={paper} /><path d="M6 46 h50" {...s} /><path d="M24 30 l3 -4 M30 32 l3 -4" {...s} /></g>),
  },
  {
    id: 'o06', name: '연필꽂이', parts: '통, 칸, 바닥, 겉면',
    Icon: () => (<g><path d="M18 26 h28 l-3 30 h-22z" {...s} fill={paper} /><path d="M24 26 l-4 -18 M32 26 v-20 M40 26 l5 -16" {...s} /></g>),
  },
  {
    id: 'o07', name: '휴지통', parts: '뚜껑, 통, 안쪽 면, 바닥',
    Icon: () => (<g><path d="M14 18 h36" {...s} /><path d="M26 18 v-5 h12 v5" {...s} /><path d="M18 18 l3 38 h22 l3 -38" {...s} fill={paper} /><path d="M27 26 v24 M37 26 v24" {...s} /></g>),
  },
  {
    id: 'o08', name: '자', parts: '눈금, 가장자리, 표면, 끝부분',
    Icon: () => (<g><rect x="4" y="24" width="56" height="16" rx="2" {...s} fill={paper} /><path d="M12 24 v6 M20 24 v4 M28 24 v6 M36 24 v4 M44 24 v6 M52 24 v4" {...s} /></g>),
  },
  {
    id: 'o09', name: '의자', parts: '등받이, 앉는 판, 다리, 바닥에 닿는 부분',
    Icon: () => (<g><path d="M20 8 v26 h26" {...s} /><rect x="18" y="32" width="30" height="6" rx="2" {...s} fill={paper} /><path d="M22 38 v18 M44 38 v18" {...s} /></g>),
  },
  {
    id: 'o10', name: '장갑', parts: '손가락, 손바닥 면, 손목, 겉감',
    Icon: () => (<g><path d="M18 56 V30 l-6 -8 a3 3 0 0 1 5 -3 l5 6 V12 a3 3 0 0 1 6 0 v14 V8 a3 3 0 0 1 6 0 v18 V10 a3 3 0 0 1 6 0 v18 V16 a3 3 0 0 1 6 0 v24 q0 16 -12 16z" {...s} fill={paper} /></g>),
  },
  {
    id: 'o11', name: '도시락통', parts: '뚜껑, 칸막이, 잠금 부분, 바닥',
    Icon: () => (<g><rect x="8" y="20" width="48" height="32" rx="5" {...s} fill={paper} /><path d="M8 28 h48 M30 28 v24" {...s} /><path d="M28 16 h8" {...s} /></g>),
  },
  {
    id: 'o12', name: '책갈피', parts: '끝부분, 표면, 끈, 책에 꽂히는 부분',
    Icon: () => (<g><path d="M22 6 h20 v50 l-10 -8 l-10 8z" {...s} fill={paper} /><circle cx="32" cy="16" r="3" {...s} /></g>),
  },
];

export const objectById = (id: string | undefined) => householdObjects.find((o) => o.id === id);
