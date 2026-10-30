import type { ReactElement } from 'react';

export type NatureItem = {
  id: string;
  code: string; // 표본 번호
  name: string;
  observationPrompts: string[];
  studentQuestion: string;
  featureSummary: string; // 학생에게 보이는 기본 특징 안내
  teacherNote: string;
  /** 탐구 03에서 쓰는 단순화된 원리 설명(없으면 탐구 03 목록에서 '설명 준비 중') */
  principle?: { title: string; body: string; caution?: string };
  zoomHint: string;
  alt: string;
  Illustration: () => ReactElement;
};

const INK = '#29342D';
const MOSS = '#DCE4D0';
const LEAF = '#7C9A6B';
const BARK = '#806B57';
const AMBER = '#C47743';

/* ───────────────────────── 직접 제작한 개념 삽화(SVG) ───────────────────────── */

function PineCone() {
  // 겹겹이 포개진 비늘을 행마다 엇갈리게 배치한다.
  const scales: ReactElement[] = [];
  const rows = 9;
  for (let r = 0; r < rows; r++) {
    const t = r / (rows - 1);
    const y = 40 + t * 120;
    const half = 18 + Math.sin(t * Math.PI) * 42;
    const count = 3 + Math.round(Math.sin(t * Math.PI) * 3);
    for (let c = 0; c < count; c++) {
      const u = count === 1 ? 0.5 : c / (count - 1);
      const x = 100 - half + u * half * 2 + (r % 2 ? 6 : -6);
      const w = 15 + Math.sin(t * Math.PI) * 6;
      const h = 13 + Math.sin(t * Math.PI) * 4;
      scales.push(
        <g key={`${r}-${c}`}>
          <path
            d={`M${x - w} ${y} Q${x} ${y - h * 1.1} ${x + w} ${y} Q${x} ${y + h} ${x - w} ${y}Z`}
            fill={r % 2 ? '#B8875C' : '#A97B52'}
            stroke={INK}
            strokeWidth="1.2"
          />
          {/* 비늘 끝의 작은 돌기와 결 — 확대하면 보인다 */}
          <path d={`M${x - w * 0.5} ${y + 1} Q${x} ${y + h * 0.55} ${x + w * 0.5} ${y + 1}`} stroke={INK} strokeWidth="0.5" fill="none" />
          <circle cx={x} cy={y + h * 0.35} r="1.1" fill={INK} />
          <path d={`M${x - 2} ${y - 3} L${x - 4} ${y - 7} M${x + 2} ${y - 3} L${x + 4} ${y - 7}`} stroke={INK} strokeWidth="0.35" />
        </g>,
      );
    }
  }
  return (
    <g>
      <path d="M100 20 C98 30 101 34 100 40" stroke={BARK} strokeWidth="5" fill="none" strokeLinecap="round" />
      {scales}
    </g>
  );
}

function Leaf() {
  const veins: ReactElement[] = [];
  for (let i = 0; i < 7; i++) {
    const y = 50 + i * 17;
    const len = 52 - Math.abs(i - 2.5) * 9;
    for (const s of [-1, 1]) {
      const ex = 100 + s * len;
      const ey = y - 18;
      veins.push(<path key={`v${i}${s}`} d={`M100 ${y} Q${100 + s * len * 0.5} ${y - 4} ${ex} ${ey}`} stroke="#3F6B4A" strokeWidth="1.6" fill="none" />);
      // 가는 그물맥: 확대해야 잘 보인다
      for (let k = 1; k < 4; k++) {
        const px = 100 + s * len * (k / 4);
        const py = y - 2 - k * 3.5;
        veins.push(
          <path key={`t${i}${s}${k}`} d={`M${px} ${py} l${s * 4} 6 l${s * 5} -3`} stroke="#4E7A57" strokeWidth="0.45" fill="none" />,
        );
      }
    }
  }
  // 톱니 가장자리
  const teeth: string[] = [];
  for (let i = 0; i <= 24; i++) {
    const t = i / 24;
    const y = 22 + t * 150;
    const w = Math.sin(t * Math.PI) * 62 * (1 - t * 0.15);
    teeth.push(`${100 + w + (i % 2 ? 4 : 0)},${y}`);
  }
  const right = teeth.join(' ');
  const left = teeth
    .map((p) => {
      const [x, y] = p.split(',').map(Number);
      return `${200 - x},${y}`;
    })
    .reverse()
    .join(' ');
  return (
    <g>
      <polygon points={`${right} ${left}`} fill="#8DB07A" stroke={INK} strokeWidth="1.4" strokeLinejoin="round" />
      {veins}
      <path d="M100 22 L100 172 L100 192" stroke="#3F6B4A" strokeWidth="2.6" fill="none" strokeLinecap="round" />
    </g>
  );
}

function LotusLeaf() {
  const bumps: ReactElement[] = [];
  // 표면의 아주 작은 돌기(개념 표현) — 확대하면 점무늬로 보인다
  for (let x = 30; x <= 170; x += 7) {
    for (let y = 30; y <= 170; y += 7) {
      if ((x - 100) ** 2 + (y - 100) ** 2 < 66 ** 2) bumps.push(<circle key={`${x}-${y}`} cx={x + ((y / 7) % 2) * 3} cy={y} r="0.9" fill="#4E7A57" opacity="0.7" />);
    }
  }
  const ribs: ReactElement[] = [];
  for (let i = 0; i < 14; i++) {
    const a = (i / 14) * Math.PI * 2;
    ribs.push(<line key={i} x1="100" y1="100" x2={100 + Math.cos(a) * 70} y2={100 + Math.sin(a) * 70} stroke="#4E7A57" strokeWidth="1.2" />);
  }
  const drop = (cx: number, cy: number, r: number, k: string) => (
    <g key={k}>
      <ellipse cx={cx} cy={cy + r * 0.85} rx={r * 0.9} ry={r * 0.25} fill="#3F6B4A" opacity="0.35" />
      <circle cx={cx} cy={cy} r={r} fill="#E6F1F4" stroke="#2F5D6E" strokeWidth="1.2" />
      <path d={`M${cx - r * 0.5} ${cy - r * 0.2} q${r * 0.2} ${-r * 0.45} ${r * 0.6} ${-r * 0.5}`} stroke="#fff" strokeWidth={Math.max(1, r * 0.18)} fill="none" strokeLinecap="round" />
    </g>
  );
  return (
    <g>
      <circle cx="100" cy="100" r="74" fill="#7FA36E" stroke={INK} strokeWidth="1.6" />
      <path d="M100 100 L100 26 Q108 30 112 27" stroke={INK} strokeWidth="1.2" fill="none" />
      {ribs}
      {bumps}
      <circle cx="100" cy="100" r="6" fill="#B9CFA9" stroke={INK} />
      {drop(70, 72, 11, 'a')}
      {drop(132, 120, 8, 'b')}
      {drop(118, 64, 5, 'c')}
      {drop(78, 136, 6, 'd')}
      <path d="M150 140 q8 6 14 4" stroke="#2F5D6E" strokeWidth="1" fill="none" strokeDasharray="2 3" />
    </g>
  );
}

function Burdock() {
  const hooks: ReactElement[] = [];
  const n = 46;
  for (let i = 0; i < n; i++) {
    // 타원 표면 위의 가시 — 끝이 작은 갈고리로 굽어 있다
    const a = (i / n) * Math.PI * 2;
    const bx = 100 + Math.cos(a) * 34;
    const by = 105 + Math.sin(a) * 52;
    const ex = 100 + Math.cos(a) * 52;
    const ey = 105 + Math.sin(a) * 74;
    const nx = Math.cos(a + Math.PI / 2) * 4;
    const ny = Math.sin(a + Math.PI / 2) * 4;
    hooks.push(
      <g key={i}>
        <line x1={bx} y1={by} x2={ex} y2={ey} stroke={BARK} strokeWidth="1.4" />
        <path d={`M${ex} ${ey} q${nx + (ex - bx) * 0.06} ${ny + (ey - by) * 0.06} ${nx * 1.2} ${ny * 1.2}`} stroke={INK} strokeWidth="0.9" fill="none" strokeLinecap="round" />
      </g>,
    );
  }
  // 안쪽 줄의 가시
  for (let i = 0; i < 18; i++) {
    const a = (i / 18) * Math.PI * 2 + 0.2;
    const bx = 100 + Math.cos(a) * 14;
    const by = 105 + Math.sin(a) * 26;
    const ex = 100 + Math.cos(a) * 26;
    const ey = 105 + Math.sin(a) * 42;
    hooks.push(
      <g key={`in${i}`}>
        <line x1={bx} y1={by} x2={ex} y2={ey} stroke={BARK} strokeWidth="1.1" />
        <path d={`M${ex} ${ey} q3 1 2 4`} stroke={INK} strokeWidth="0.7" fill="none" />
      </g>,
    );
  }
  return (
    <g>
      <ellipse cx="100" cy="105" rx="38" ry="56" fill="#9C8A55" stroke={INK} strokeWidth="1.4" />
      {hooks}
      <path d="M88 52 L80 22 M112 52 L120 22" stroke={BARK} strokeWidth="4" strokeLinecap="round" />
      <path d="M80 22 q-4 -2 -6 2 M120 22 q4 -2 6 2" stroke={INK} strokeWidth="1.4" fill="none" />
    </g>
  );
}

function Honeycomb() {
  const cells: ReactElement[] = [];
  const r = 17;
  const w = Math.sqrt(3) * r;
  for (let row = 0; row < 7; row++) {
    for (let col = 0; col < 7; col++) {
      const cx = 22 + col * w + (row % 2 ? w / 2 : 0);
      const cy = 22 + row * r * 1.5;
      const pts = Array.from({ length: 6 }, (_, k) => {
        const a = (Math.PI / 3) * k + Math.PI / 6;
        return `${cx + Math.cos(a) * r},${cy + Math.sin(a) * r}`;
      }).join(' ');
      const filled = (row * 7 + col) % 5 === 0;
      cells.push(
        <g key={`${row}-${col}`}>
          <polygon points={pts} fill={filled ? '#E3A857' : '#F3D9A0'} stroke="#8A5A2B" strokeWidth="2.2" strokeLinejoin="round" />
          {/* 칸 안쪽 벽(깊이감) */}
          <polygon
            points={Array.from({ length: 6 }, (_, k) => {
              const a = (Math.PI / 3) * k + Math.PI / 6;
              return `${cx + Math.cos(a) * r * 0.62},${cy + Math.sin(a) * r * 0.62}`;
            }).join(' ')}
            fill="none"
            stroke="#B9814A"
            strokeWidth="0.6"
          />
        </g>,
      );
    }
  }
  return <g>{cells}</g>;
}

function Shell() {
  const ribs: ReactElement[] = [];
  for (let i = 0; i <= 16; i++) {
    const a = Math.PI * (0.08 + (i / 16) * 0.84);
    ribs.push(<line key={i} x1="100" y1="168" x2={100 - Math.cos(a) * 86} y2={168 - Math.sin(a) * 120} stroke={BARK} strokeWidth="1.3" />);
  }
  const growth: ReactElement[] = [];
  for (let k = 1; k <= 8; k++) {
    const s = k / 8;
    growth.push(
      <path
        key={k}
        d={`M${100 - 80 * s} ${168 - 30 * s} Q100 ${168 - 150 * s} ${100 + 80 * s} ${168 - 30 * s}`}
        stroke={INK}
        strokeWidth={k % 2 ? 0.5 : 0.9}
        fill="none"
        opacity="0.8"
      />,
    );
  }
  return (
    <g>
      <path d="M100 168 L18 136 Q100 -10 182 136 Z" fill="#EBD9C1" stroke={INK} strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M100 168 L18 136 Q100 -10 182 136 Z" fill="url(#shellBands)" opacity="0.6" />
      {ribs}
      {growth}
      <path d="M80 168 L72 186 L128 186 L120 168 Z" fill="#D8BE9C" stroke={INK} strokeWidth="1.2" />
      <defs>
        <linearGradient id="shellBands" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor={AMBER} stopOpacity="0.1" />
          <stop offset="0.5" stopColor={AMBER} stopOpacity="0.45" />
          <stop offset="1" stopColor={AMBER} stopOpacity="0.1" />
        </linearGradient>
      </defs>
    </g>
  );
}

function DandelionSeed() {
  const hairs: ReactElement[] = [];
  const n = 36;
  for (let i = 0; i < n; i++) {
    const a = Math.PI + (i / (n - 1)) * Math.PI;
    const ex = 100 + Math.cos(a) * 70;
    const ey = 62 + Math.sin(a) * 42;
    hairs.push(<line key={i} x1="100" y1="62" x2={ex} y2={ey} stroke={INK} strokeWidth="0.7" />);
    // 털에서 갈라지는 더 가는 잔털 — 확대해서 보기
    for (let k = 1; k <= 3; k++) {
      const px = 100 + Math.cos(a) * 70 * (0.45 + k * 0.17);
      const py = 62 + Math.sin(a) * 42 * (0.45 + k * 0.17);
      hairs.push(<line key={`${i}-${k}`} x1={px} y1={py} x2={px + Math.cos(a - 0.6) * 5} y2={py + Math.sin(a - 0.6) * 5} stroke={INK} strokeWidth="0.3" />);
    }
  }
  return (
    <g>
      {hairs}
      <line x1="100" y1="62" x2="100" y2="150" stroke={BARK} strokeWidth="1.2" />
      <path d="M100 150 C94 156 94 176 100 186 C106 176 106 156 100 150Z" fill="#8F6B45" stroke={INK} strokeWidth="1" />
      <path d="M97 160 L103 162 M97 168 L103 170 M97 176 L103 178" stroke={INK} strokeWidth="0.5" />
      <path d="M20 120 q20 -8 40 0 M140 130 q20 -8 40 0" stroke="#806B57" strokeWidth="1" fill="none" strokeDasharray="3 4" />
    </g>
  );
}

function Feather() {
  const barbs: ReactElement[] = [];
  for (let i = 0; i < 30; i++) {
    const t = i / 29;
    const x = 52 + t * 100;
    const y = 170 - t * 140 + Math.sin(t * Math.PI) * -6;
    const len = Math.sin(t * Math.PI) * 34 + 6;
    barbs.push(
      <path key={`l${i}`} d={`M${x} ${y} q${-len * 0.6} ${-len * 0.1} ${-len} ${-len * 0.55}`} stroke="#4A5D73" strokeWidth="0.9" fill="none" />,
      <path key={`r${i}`} d={`M${x} ${y} q${len * 0.35} ${len * 0.15} ${len * 0.75} ${len * 0.75}`} stroke="#4A5D73" strokeWidth="0.9" fill="none" />,
    );
    // 깃가지에 붙은 작은 깃가지(개념)
    for (let k = 1; k < 4; k++) {
      const px = x - len * 0.3 * k * 0.75;
      const py = y - len * 0.15 * k * 0.75;
      barbs.push(<path key={`b${i}-${k}`} d={`M${px} ${py} l-2 -3`} stroke="#4A5D73" strokeWidth="0.3" />);
    }
  }
  return (
    <g>
      <path d="M52 170 C90 120 118 80 156 26 C130 40 70 70 40 120 C48 140 50 158 52 170Z" fill="#C9D3DE" opacity="0.65" />
      {barbs}
      <path d="M40 190 L52 170 C90 120 118 80 156 26" stroke={INK} strokeWidth="2.4" fill="none" strokeLinecap="round" />
      <path d="M58 160 q-10 -6 -14 2 M64 154 q-12 -4 -16 4" stroke="#4A5D73" strokeWidth="1" fill="none" />
    </g>
  );
}

/* ─────────────────────────────── 자연물 데이터 ─────────────────────────────── */

export const natureItems: NatureItem[] = [
  {
    id: 'n01',
    code: 'N-01',
    name: '솔방울',
    observationPrompts: ['겹겹이 포개진 비늘이 어떻게 놓여 있는지 보세요.', '비늘이 벌어진 정도를 살펴보세요. 젖었을 때와 말랐을 때를 비교할 수 있나요?'],
    studentQuestion: '비늘은 왜 겹쳐 있을까요? 습도에 따라 무엇이 달라지나요?',
    featureSummary: '비늘이 겹겹이 포개져 있고, 비늘이 벌어지거나 오므라든 모습이 보여요.',
    teacherNote: '습도 조건에 반응하는 비늘의 움직임. 실제 관찰은 물에 적신 뒤 수십 분~몇 시간이 걸릴 수 있음.',
    principle: {
      title: '습도에 따라 움직이는 비늘',
      body: '솔방울 비늘은 물기를 만나면 오므라들고, 마르면 다시 벌어지는 모습이 관찰돼요. 비늘 안쪽과 바깥쪽이 물기를 만났을 때 늘어나는 정도가 서로 달라서 휘어진다고 설명해요.',
      caution: '물에 적신 솔방울이 오므라드는 데에는 시간이 걸려요. 수업 시간 안에 다 보지 못할 수도 있어요.',
    },
    zoomHint: '비늘 끝의 작은 점과 결',
    alt: '겹겹이 포개진 갈색 비늘로 이루어진 솔방울 삽화',
    Illustration: PineCone,
  },
  {
    id: 'n02',
    code: 'N-02',
    name: '나뭇잎',
    observationPrompts: ['잎맥이 어떤 모양으로 갈라지는지 따라가 보세요.', '가장자리 모양(매끈함, 톱니)과 표면을 만져 보거나 살펴보세요.'],
    studentQuestion: '잎맥은 어떤 모양으로 퍼져 있나요?',
    featureSummary: '가운데 굵은 잎맥에서 가는 잎맥이 갈라져 그물처럼 퍼져 있어요.',
    teacherNote: '여러 종류의 잎맥(그물맥·나란히맥)·형태 비교. 살아 있는 나무에서 잎을 함부로 따지 않도록 지도.',
    zoomHint: '가는 그물맥과 톱니 가장자리',
    alt: '가운데 잎맥에서 가는 잎맥이 갈라지는 초록 나뭇잎 삽화',
    Illustration: Leaf,
  },
  {
    id: 'n03',
    code: 'N-03',
    name: '연잎',
    observationPrompts: ['잎 위의 물방울이 어떤 모양인지 보세요.', '잎을 기울이면 물방울이 어떻게 움직일지 생각해 보세요.'],
    studentQuestion: '왜 물방울이 맺히고 잘 굴러갈까요?',
    featureSummary: '물방울이 동그랗게 맺히고, 잎 위에서 잘 굴러가요.',
    teacherNote: '미세 구조·표면 특성에 따른 발수 현상(연잎 효과). 삽화의 점무늬는 미세 구조를 개념적으로 표현한 것.',
    principle: {
      title: '물방울이 굴러가는 표면(연잎 효과)',
      body: '연잎 표면에는 눈으로 보기 어려운 아주 작은 돌기와 물을 밀어내는 성질의 물질이 있다고 알려져 있어요. 그래서 물방울이 잎에 넓게 퍼지지 않고 동그랗게 맺혀 굴러가며, 굴러가면서 먼지도 함께 쓸려 나가요.',
      caution: '삽화의 작은 점은 실제 크기가 아니라 이해를 돕기 위해 크게 그린 것이에요.',
    },
    zoomHint: '물방울과 표면의 작은 점무늬(개념 표현)',
    alt: '둥근 초록 연잎 위에 동그란 물방울이 맺혀 있는 삽화',
    Illustration: LotusLeaf,
  },
  {
    id: 'n04',
    code: 'N-04',
    name: '도꼬마리',
    observationPrompts: ['열매 겉면의 가시 끝을 자세히 보세요. 어떤 모양으로 굽어 있나요?', '옷감이나 털실에 대 보면 어떻게 될지 예상해 보세요.'],
    studentQuestion: '왜 옷감이나 털에 달라붙을까요?',
    featureSummary: '열매 겉에 가시가 많고, 가시 끝이 작은 갈고리처럼 굽어 있어요.',
    teacherNote: '갈고리 형태의 부착 구조. 동물 털에 붙어 씨앗이 퍼짐. 가시에 찔리지 않도록 주의.',
    principle: {
      title: '작은 갈고리가 걸리는 구조',
      body: '도꼬마리 열매의 가시 끝은 작은 갈고리처럼 굽어 있어요. 이 갈고리가 털이나 옷감의 고리 모양 실에 걸려서 잘 떨어지지 않아요. 동물 털에 붙어 멀리 옮겨지면 씨앗이 새로운 곳에 퍼질 수 있어요.',
    },
    zoomHint: '가시 끝의 굽은 갈고리',
    alt: '갈고리 모양 가시가 촘촘한 타원형 도꼬마리 열매 삽화',
    Illustration: Burdock,
  },
  {
    id: 'n05',
    code: 'N-05',
    name: '벌집',
    observationPrompts: ['칸 하나의 변이 몇 개인지 세어 보세요.', '칸과 칸이 어떻게 맞닿아 있는지, 빈틈이 있는지 보세요.'],
    studentQuestion: '왜 비슷한 모양이 반복될까요?',
    featureSummary: '육각형 칸이 빈틈없이 반복해서 이어져 있어요.',
    teacherNote: '반복되는 육각형 구조와 공간 구획. 실제 벌집은 벌이 있을 수 있으므로 사진·빈 벌집 모형으로 관찰.',
    principle: {
      title: '빈틈없이 이어지는 육각형',
      body: '육각형은 서로 빈틈없이 이어 붙일 수 있는 모양이에요. 이웃한 칸이 벽을 함께 쓰기 때문에 적은 재료로 많은 칸을 만들 수 있고, 반복된 구조가 전체를 튼튼하게 받쳐 준다고 설명해요.',
    },
    zoomHint: '칸 안쪽 벽과 맞닿은 변',
    alt: '노란 육각형 칸이 빈틈없이 반복되는 벌집 삽화',
    Illustration: Honeycomb,
  },
  {
    id: 'n06',
    code: 'N-06',
    name: '조개껍데기',
    observationPrompts: ['껍데기의 줄무늬가 어느 방향으로 나 있는지 보세요.', '곡선과 표면 질감(울퉁불퉁함, 매끈함)을 비교해 보세요.'],
    studentQuestion: '껍데기는 어떤 무늬와 형태를 가졌나요?',
    featureSummary: '부채처럼 퍼지는 골과 둥글게 겹친 성장선이 보여요.',
    teacherNote: '구조·곡면에 따른 형태 차이. 깨진 조각의 날카로운 부분 주의.',
    zoomHint: '부채꼴 골과 둥근 성장선',
    alt: '부채꼴 골과 둥근 줄무늬가 있는 조개껍데기 삽화',
    Illustration: Shell,
  },
  {
    id: 'n07',
    code: 'N-07',
    name: '민들레 씨앗',
    observationPrompts: ['가는 털이 어떤 모양으로 퍼져 있는지 보세요.', '씨앗과 털 사이의 가는 줄기를 찾아보세요.'],
    studentQuestion: '바람이 불면 어떻게 움직일까요?',
    featureSummary: '씨앗 위에 가는 털이 우산처럼 퍼져 있어요.',
    teacherNote: '바람을 이용한 씨앗 퍼뜨리기. 털이 공기를 받아 천천히 떨어짐.',
    zoomHint: '털에서 갈라진 가는 잔털',
    alt: '씨앗 위에 가는 털이 우산처럼 퍼진 민들레 씨앗 삽화',
    Illustration: DandelionSeed,
  },
  {
    id: 'n08',
    code: 'N-08',
    name: '새의 깃털',
    observationPrompts: ['가운데 깃대와 양옆의 깃가지를 찾아보세요.', '깃가지가 서로 어떻게 붙어 있는지 자세히 보세요.'],
    studentQuestion: '가벼우면서도 모양을 유지하는 이유는 무엇일까요?',
    featureSummary: '가운데 깃대 양옆으로 가는 깃가지가 촘촘히 나란히 나 있어요.',
    teacherNote: '깃털의 세부 구조(깃대·깃가지·작은 깃가지)와 기능. 야생 조류 깃털은 위생상 장갑·지퍼백 사용 권장.',
    zoomHint: '깃가지에 붙은 작은 깃가지(개념 표현)',
    alt: '가운데 깃대 양옆으로 깃가지가 촘촘한 새 깃털 삽화',
    Illustration: Feather,
  },
];

export const natureById = (id: string | undefined) => natureItems.find((n) => n.id === id);

export const COLORS = { INK, MOSS, LEAF };
