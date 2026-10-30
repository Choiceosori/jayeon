import { useCallback, useEffect, useRef, useState, type PointerEvent } from 'react';
import { getBlob, putBlob } from '../storage/storage';

/** 선 하나: 좌표와 굵기는 도화지 너비 기준 0~1 비율이라 화면 크기·회전이 바뀌어도 그대로 다시 그려진다. */
export type Stroke = { c: string; w: number; eraser?: boolean; p: number[] };

export const ASPECT = 3 / 4; // 높이 / 너비
const PAPER = '#FFFFFF';

export const PEN_COLORS = [
  { v: '#29342D', name: '검정' },
  { v: '#355B45', name: '숲 초록' },
  { v: '#7FA36E', name: '연두' },
  { v: '#2F6E9E', name: '파랑' },
  { v: '#C47743', name: '주황' },
  { v: '#B83B3B', name: '빨강' },
  { v: '#806B57', name: '갈색' },
];
export const PEN_WIDTHS = [
  { v: 0.004, name: '가늘게' },
  { v: 0.009, name: '보통' },
  { v: 0.018, name: '굵게' },
];

export function renderStrokes(ctx: CanvasRenderingContext2D, strokes: Stroke[], w: number, h: number) {
  ctx.fillStyle = PAPER;
  ctx.fillRect(0, 0, w, h);
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  for (const s of strokes) {
    ctx.strokeStyle = s.eraser ? PAPER : s.c;
    ctx.fillStyle = ctx.strokeStyle;
    ctx.lineWidth = Math.max(1, s.w * w * (s.eraser ? 2.2 : 1));
    const p = s.p;
    if (p.length === 2) {
      ctx.beginPath();
      ctx.arc(p[0] * w, p[1] * w, ctx.lineWidth / 2, 0, Math.PI * 2);
      ctx.fill();
      continue;
    }
    ctx.beginPath();
    ctx.moveTo(p[0] * w, p[1] * w);
    for (let i = 2; i < p.length; i += 2) ctx.lineTo(p[i] * w, p[i + 1] * w);
    ctx.stroke();
  }
}

export function strokesToDataUrl(strokes: Stroke[], width = 1200) {
  const c = document.createElement('canvas');
  c.width = width;
  c.height = Math.round(width * ASPECT);
  const ctx = c.getContext('2d');
  if (!ctx) return '';
  renderStrokes(ctx, strokes, c.width, c.height);
  return c.toDataURL('image/png');
}

/** 인쇄·모아보기용: 저장된 선 데이터를 그림으로 보여 준다. */
export function StrokeImage({ blobKey, alt }: { blobKey: string; alt: string }) {
  const [url, setUrl] = useState('');
  useEffect(() => {
    let alive = true;
    getBlob<Stroke[]>(blobKey).then((s) => {
      if (alive && Array.isArray(s) && s.length) setUrl(strokesToDataUrl(s, 900));
    });
    return () => {
      alive = false;
    };
  }, [blobKey]);
  if (!url) return <span className="empty-text">(그림을 불러오지 못했어요)</span>;
  return <img src={url} alt={alt} className="stroke-img" />;
}

export function SketchCanvas({ storeKey, title, onHasDrawing }: { storeKey: string; title: string; onHasDrawing: (has: boolean) => void }) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const strokes = useRef<Stroke[]>([]);
  const redo = useRef<Stroke[]>([]);
  const cur = useRef<Stroke | null>(null);
  const [, force] = useState(0);
  const [color, setColor] = useState(PEN_COLORS[0].v);
  const [width, setWidth] = useState(PEN_WIDTHS[1].v);
  const [eraser, setEraser] = useState(false);
  const [askClear, setAskClear] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [saveState, setSaveState] = useState('');

  const redraw = useCallback(() => {
    const c = canvas.current;
    const ctx = c?.getContext('2d');
    if (!c || !ctx) return;
    const all = cur.current ? [...strokes.current, cur.current] : strokes.current;
    renderStrokes(ctx, all, c.width, c.height);
  }, []);

  // 도화지 크기를 컨테이너에 맞춘다(회전·창 크기 변경 후에도 비율 유지).
  useEffect(() => {
    const c = canvas.current;
    if (!c) return;
    const fit = () => {
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      const w = c.clientWidth;
      if (!w) return;
      c.width = Math.round(w * dpr);
      c.height = Math.round(w * ASPECT * dpr);
      redraw();
    };
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(c);
    return () => ro.disconnect();
  }, [redraw]);

  useEffect(() => {
    let alive = true;
    setLoaded(false);
    strokes.current = [];
    redo.current = [];
    getBlob<Stroke[]>(storeKey).then((s) => {
      if (!alive) return;
      strokes.current = Array.isArray(s) ? s : [];
      setLoaded(true);
      redraw();
      force((x) => x + 1);
    });
    return () => {
      alive = false;
    };
  }, [storeKey, redraw]);

  const persist = async () => {
    setSaveState('그림 저장 중...');
    const ok = await putBlob(storeKey, strokes.current);
    onHasDrawing(strokes.current.some((s) => !s.eraser));
    setSaveState(ok ? '그림을 이 기기에 저장했어요' : '이 브라우저에서는 그림을 오래 저장할 수 없어요(창을 닫기 전에 PNG로 저장하세요)');
    force((x) => x + 1);
  };

  const point = (e: PointerEvent) => {
    const c = canvas.current!;
    const r = c.getBoundingClientRect();
    return [(e.clientX - r.left) / r.width, ((e.clientY - r.top) / r.width)];
  };

  const down = (e: PointerEvent<HTMLCanvasElement>) => {
    if (!loaded) return;
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    cur.current = { c: color, w: width, eraser: eraser || undefined, p: point(e) };
    redraw();
  };
  const move = (e: PointerEvent<HTMLCanvasElement>) => {
    if (!cur.current) return;
    const events = typeof e.nativeEvent.getCoalescedEvents === 'function' ? e.nativeEvent.getCoalescedEvents() : [];
    if (events.length > 1) {
      const r = canvas.current!.getBoundingClientRect();
      for (const ev of events) cur.current.p.push((ev.clientX - r.left) / r.width, (ev.clientY - r.top) / r.width);
    } else cur.current.p.push(...point(e));
    redraw();
  };
  const up = () => {
    if (!cur.current) return;
    cur.current.p = cur.current.p.map((v) => Math.round(v * 10000) / 10000);
    strokes.current = [...strokes.current, cur.current];
    cur.current = null;
    redo.current = [];
    redraw();
    persist();
  };

  const undo = () => {
    const s = strokes.current[strokes.current.length - 1];
    if (!s) return;
    strokes.current = strokes.current.slice(0, -1);
    redo.current = [...redo.current, s];
    redraw();
    persist();
  };
  const redoOne = () => {
    const s = redo.current[redo.current.length - 1];
    if (!s) return;
    redo.current = redo.current.slice(0, -1);
    strokes.current = [...strokes.current, s];
    redraw();
    persist();
  };
  const clear = () => {
    // 모두 지우기도 되돌릴 수 있게 지운 선을 다시 실행 목록에 넣는다.
    redo.current = [...redo.current, ...[...strokes.current].reverse()];
    strokes.current = [];
    setAskClear(false);
    redraw();
    persist();
  };
  const savePng = () => {
    const url = strokesToDataUrl(strokes.current, 1600);
    if (!url) return;
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title || '상상스케치'}.png`.replace(/[\\/:*?"<>|]/g, '');
    a.click();
  };

  return (
    <div className="sketch-area">
      <div className="sketch-paper">
        <canvas
          ref={canvas}
          className={`sketch-canvas ${eraser ? 'is-eraser' : ''}`}
          role="img"
          aria-label={`${title} 손그림 도화지. 펜, 손가락, 마우스로 그릴 수 있어요. 그리기가 어려우면 아래 '그림 없이 글로 설명하기'를 이용하세요.`}
          onPointerDown={down}
          onPointerMove={move}
          onPointerUp={up}
          onPointerCancel={up}
          onPointerLeave={(e) => e.buttons === 0 && up()}
        />
        {!loaded && <p className="sketch-loading">도화지를 펼치는 중...</p>}
      </div>
      <div className="sketch-tools" role="toolbar" aria-label="그리기 도구">
        <div className="tool-group" role="group" aria-label="펜 색">
          {PEN_COLORS.map((c) => (
            <button
              key={c.v}
              type="button"
              className="swatch"
              style={{ ['--sw' as string]: c.v }}
              aria-pressed={!eraser && color === c.v}
              aria-label={`${c.name} 색연필`}
              title={c.name}
              onClick={() => {
                setColor(c.v);
                setEraser(false);
              }}
            />
          ))}
        </div>
        <div className="tool-group" role="group" aria-label="선 굵기">
          {PEN_WIDTHS.map((w) => (
            <button key={w.v} type="button" className="width-btn" aria-pressed={width === w.v} onClick={() => setWidth(w.v)}>
              <span className="width-dot" style={{ height: `${Math.max(2, w.v * 400)}px` }} aria-hidden="true" />
              {w.name}
            </button>
          ))}
        </div>
        <div className="tool-group" role="group" aria-label="편집">
          <button type="button" aria-pressed={eraser} onClick={() => setEraser((x) => !x)}>
            🧽 지우개
          </button>
          <button type="button" onClick={undo} disabled={!strokes.current.length}>
            ↶ 실행 취소
          </button>
          <button type="button" onClick={redoOne} disabled={!redo.current.length}>
            ↷ 다시 실행
          </button>
          <button type="button" onClick={() => setAskClear(true)} disabled={!strokes.current.length}>
            모두 지우기
          </button>
          <button type="button" onClick={savePng} disabled={!strokes.current.length}>
            PNG로 저장
          </button>
        </div>
        {askClear && (
          <div className="confirm" role="alertdialog" aria-label="모두 지우기 확인">
            <p>그림을 모두 지울까요? (지운 뒤에도 ‘다시 실행’으로 되살릴 수 있어요)</p>
            <div className="btn-row">
              <button type="button" className="btn-danger" onClick={clear}>
                모두 지우기
              </button>
              <button type="button" className="btn-quiet" onClick={() => setAskClear(false)}>
                취소
              </button>
            </div>
          </div>
        )}
        <p className="field-hint" aria-live="polite">{saveState}</p>
      </div>
    </div>
  );
}
