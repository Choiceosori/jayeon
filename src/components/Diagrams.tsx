import type { ReactElement } from 'react';

/* 원리를 이해하기 위한 단순화된 그림. 실제 현상을 정확히 재현한 것이 아니다. */

const ink = { stroke: '#29342D', strokeWidth: 1.6, fill: 'none', strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };
const label = { fontSize: 11, fill: '#29342D', fontFamily: 'inherit' };

function Bilayer() {
  return (
    <g>
      <text x="10" y="16" {...label}>마를 때</text>
      <path d="M20 70 Q60 30 110 28" stroke="#A97B52" strokeWidth="9" fill="none" strokeLinecap="round" />
      <path d="M20 76 Q60 38 110 36" stroke="#6E5038" strokeWidth="4" fill="none" strokeLinecap="round" />
      <text x="150" y="16" {...label}>젖을 때</text>
      <path d="M160 70 Q210 62 270 64" stroke="#A97B52" strokeWidth="9" fill="none" strokeLinecap="round" />
      <path d="M160 76 Q210 70 270 72" stroke="#6E5038" strokeWidth="4" fill="none" strokeLinecap="round" />
      <path d="M126 50 h18 m-6 -5 l6 5 l-6 5" {...ink} />
      <text x="10" y="104" {...label}>두 층이 물기에 늘어나는 정도가 달라 휘어져요</text>
    </g>
  );
}

function Droplet() {
  return (
    <g>
      <text x="10" y="16" {...label}>보통 표면</text>
      <path d="M10 70 H130" {...ink} />
      <path d="M30 70 Q70 52 110 70" fill="#D6EAF0" stroke="#2F5D6E" strokeWidth="1.4" />
      <text x="150" y="16" {...label}>연잎 같은 표면(개념)</text>
      <path d="M150 70 H280" {...ink} />
      {Array.from({ length: 16 }, (_, i) => (
        <path key={i} d={`M${152 + i * 8} 70 q4 -6 8 0`} stroke="#4E7A57" strokeWidth="1" fill="none" />
      ))}
      <circle cx="214" cy="52" r="16" fill="#D6EAF0" stroke="#2F5D6E" strokeWidth="1.4" />
      <path d="M236 44 q14 0 20 8" {...ink} strokeDasharray="3 3" />
      <text x="10" y="104" {...label}>물이 퍼지지 않고 동그랗게 맺혀 굴러가요</text>
    </g>
  );
}

function HookLoop() {
  return (
    <g>
      <rect x="20" y="20" width="250" height="12" fill="#DCE4D0" stroke="#29342D" />
      {Array.from({ length: 10 }, (_, i) => (
        <path key={`h${i}`} d={`M${34 + i * 24} 32 v18 q0 6 6 6 q6 0 6 -6`} {...ink} />
      ))}
      <rect x="20" y="78" width="250" height="12" fill="#F3E3D3" stroke="#29342D" />
      {Array.from({ length: 12 }, (_, i) => (
        <path key={`l${i}`} d={`M${28 + i * 20} 78 q4 -20 10 -14 q6 6 -2 14`} stroke="#C47743" strokeWidth="1.4" fill="none" />
      ))}
      <text x="20" y="108" {...label}>위: 작은 갈고리 · 아래: 고리 — 서로 걸려서 붙어요</text>
    </g>
  );
}

function Panel() {
  const cells: ReactElement[] = [];
  for (let i = 0; i < 9; i++) {
    const x = 34 + i * 26;
    cells.push(<path key={i} d={`M${x} 34 l8 0 l6 14 l-6 14 l-8 0 l-6 -14z`} fill="#F3D9A0" stroke="#8A5A2B" strokeWidth="1.2" />);
  }
  return (
    <g>
      <rect x="20" y="24" width="250" height="8" fill="#EDE6D6" stroke="#29342D" />
      {cells}
      <rect x="20" y="64" width="250" height="8" fill="#EDE6D6" stroke="#29342D" />
      <text x="20" y="98" {...label}>두 판 사이에 육각형 칸을 넣으면</text>
      <text x="20" y="112" {...label}>속이 비어 가볍지만 잘 휘지 않아요</text>
    </g>
  );
}

function Parachute() {
  return (
    <g>
      <path d="M40 60 Q80 10 120 60" {...ink} fill="#FFFCF4" />
      <path d="M40 60 L80 96 L120 60 M66 56 L80 96 L94 56" {...ink} strokeWidth={0.9} />
      <rect x="74" y="96" width="12" height="10" fill="#806B57" />
      <path d="M180 60 L220 30 M200 60 L220 30 M220 60 L220 30 M240 60 L220 30 M260 60 L220 30" {...ink} strokeWidth={0.9} />
      <path d="M220 30 V92" {...ink} strokeWidth={1} />
      <ellipse cx="220" cy="98" rx="4" ry="8" fill="#8F6B45" />
      <path d="M150 20 v80 m-5 -8 l5 8 l5 -8" stroke="#806B57" strokeWidth="1.2" fill="none" />
    </g>
  );
}

function Zipper() {
  return (
    <g>
      {Array.from({ length: 9 }, (_, i) => (
        <g key={i}>
          <rect x={30 + i * 26} y="40" width="12" height="14" rx="3" fill="#DCE4D0" stroke="#29342D" />
          <rect x={43 + i * 26} y="52" width="12" height="14" rx="3" fill="#F3E3D3" stroke="#29342D" />
        </g>
      ))}
      <path d="M20 40 H270 M20 66 H270" {...ink} strokeWidth={1} />
      <text x="20" y="98" {...label}>작은 이가 서로 맞물려 두 면을 이어요</text>
    </g>
  );
}

const MAP: Record<string, () => ReactElement> = {
  n01: Bilayer,
  n03: Droplet,
  n04: HookLoop,
  n05: Panel,
  n07: Parachute,
  n08: Zipper,
};

export function hasDiagram(natureId: string) {
  return natureId in MAP;
}

export function DiagramSvg({ natureId }: { natureId: string }) {
  const D = MAP[natureId];
  if (!D) return null;
  return (
    <svg viewBox="0 0 290 120" aria-hidden="true" focusable="false">
      <D />
    </svg>
  );
}

export function PrincipleDiagram({ natureId, alt }: { natureId: string; alt: string }) {
  const D = MAP[natureId];
  if (!D) return null;
  return (
    <figure className="diagram">
      <svg viewBox="0 0 290 120" role="img" aria-label={alt}>
        <D />
      </svg>
      <figcaption>원리를 이해하기 위한 단순화된 그림이에요.</figcaption>
    </figure>
  );
}
