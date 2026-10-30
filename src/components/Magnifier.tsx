import { useRef, type KeyboardEvent, type PointerEvent } from 'react';
import type { NatureItem } from '../data/natureItems';

type Zoom = { z: number; x: number; y: number }; // z배 확대, (x,y) = 보고 있는 중심(0~1)

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));
const ZOOMS = [1, 2, 3, 4];

function fix(zm: Zoom): Zoom {
  const half = 0.5 / zm.z;
  return { z: zm.z, x: clamp(zm.x, half, 1 - half), y: clamp(zm.y, half, 1 - half) };
}

/**
 * 확대경: SVG viewBox를 바꿔 확대하므로 몇 배로 키워도 선명하다.
 * 드래그·한 손가락 끌기·두 손가락 벌리기·버튼·키보드(화살표, +, -, 0) 모두 지원.
 */
export function Magnifier({ item, zoom, onZoom }: { item: NatureItem; zoom: Zoom | undefined; onZoom: (z: Zoom) => void }) {
  const zm = fix(zoom ?? { z: 1, x: 0.5, y: 0.5 });
  const box = useRef<HTMLDivElement>(null);
  const pointers = useRef(new Map<number, { x: number; y: number }>());
  const pinchStart = useRef<{ d: number; z: number } | null>(null);

  const size = 200 / zm.z;
  const vb = `${zm.x * 200 - size / 2} ${zm.y * 200 - size / 2} ${size} ${size}`;
  const set = (n: Partial<Zoom>) => onZoom(fix({ ...zm, ...n }));
  const pan = (dx: number, dy: number) => set({ x: zm.x + dx / zm.z, y: zm.y + dy / zm.z });

  const onDown = (e: PointerEvent) => {
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pointers.current.size === 2) {
      const [a, b] = [...pointers.current.values()];
      pinchStart.current = { d: Math.hypot(a.x - b.x, a.y - b.y), z: zm.z };
    }
  };
  const onMove = (e: PointerEvent) => {
    const prev = pointers.current.get(e.pointerId);
    if (!prev || !box.current) return;
    const w = box.current.clientWidth || 1;
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pointers.current.size === 2 && pinchStart.current) {
      const [a, b] = [...pointers.current.values()];
      const d = Math.hypot(a.x - b.x, a.y - b.y);
      set({ z: clamp(pinchStart.current.z * (d / (pinchStart.current.d || 1)), 1, 4) });
    } else if (zm.z > 1) {
      set({ x: zm.x - (e.clientX - prev.x) / w / zm.z, y: zm.y - (e.clientY - prev.y) / w / zm.z });
    }
  };
  const onUp = (e: PointerEvent) => {
    pointers.current.delete(e.pointerId);
    if (pointers.current.size < 2) pinchStart.current = null;
  };
  const onKey = (e: KeyboardEvent) => {
    const step = 0.08;
    const map: Record<string, () => void> = {
      ArrowLeft: () => pan(-step, 0),
      ArrowRight: () => pan(step, 0),
      ArrowUp: () => pan(0, -step),
      ArrowDown: () => pan(0, step),
      '+': () => set({ z: clamp(Math.round(zm.z) + 1, 1, 4) }),
      '=': () => set({ z: clamp(Math.round(zm.z) + 1, 1, 4) }),
      '-': () => set({ z: clamp(Math.round(zm.z) - 1, 1, 4) }),
      '0': () => onZoom({ z: 1, x: 0.5, y: 0.5 }),
    };
    const f = map[e.key];
    if (f) {
      e.preventDefault();
      f();
    }
  };
  const { Illustration } = item;
  const zLabel = Number.isInteger(zm.z) ? `${zm.z}` : zm.z.toFixed(1);

  return (
    <div className="magnifier">
      <div
        ref={box}
        className={`mag-view ${zm.z > 1 ? 'is-zoomed' : ''}`}
        tabIndex={0}
        role="group"
        aria-label={`${item.name} 확대 삽화, 현재 ${zLabel}배. 화살표 키로 이동, +와 - 키로 확대·축소, 0 키로 확대 전으로.`}
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerCancel={onUp}
        onKeyDown={onKey}
      >
        <svg viewBox={vb} role="img" aria-label={item.alt} preserveAspectRatio="xMidYMid meet">
          <rect x="-50" y="-50" width="300" height="300" fill="#FFFCF4" />
          <Illustration />
        </svg>
        <span className="mag-badge">확대 삽화 · 직접 제작한 개념 그림 · {zLabel}배</span>
      </div>
      <div className="mag-tools" role="toolbar" aria-label="확대경 도구">
        <div className="seg" role="group" aria-label="확대 배율">
          {ZOOMS.map((z) => (
            <button key={z} type="button" aria-pressed={Math.round(zm.z) === z && Math.abs(zm.z - z) < 0.05} onClick={() => set({ z })}>
              {z === 1 ? '원래 크기' : `${z}배`}
            </button>
          ))}
        </div>
        <div className="seg pad" role="group" aria-label="보는 위치 옮기기">
          <button type="button" onClick={() => pan(-0.15, 0)} disabled={zm.z === 1} aria-label="왼쪽으로">◀</button>
          <button type="button" onClick={() => pan(0, -0.15)} disabled={zm.z === 1} aria-label="위로">▲</button>
          <button type="button" onClick={() => pan(0, 0.15)} disabled={zm.z === 1} aria-label="아래로">▼</button>
          <button type="button" onClick={() => pan(0.15, 0)} disabled={zm.z === 1} aria-label="오른쪽으로">▶</button>
        </div>
        <button type="button" className="btn-quiet" onClick={() => onZoom({ z: 1, x: 0.5, y: 0.5 })} disabled={zm.z === 1}>
          확대 전으로
        </button>
      </div>
      <p className="mag-help">
        🔎 <strong>찾아보기:</strong> {item.zoomHint}. 확대한 뒤 그림을 끌거나 화살표 버튼으로 옮겨 보세요. 이 그림은 실제 현미경 사진이 아니라 이해를 돕기 위해 그린 삽화예요.
      </p>
    </div>
  );
}
