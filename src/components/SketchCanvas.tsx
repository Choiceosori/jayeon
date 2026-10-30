import { useCallback, useEffect, useRef, useState, type PointerEvent as RPointerEvent } from 'react';

const CW = 900;
const CH = 560;
const MAX_UNDO = 25;

type Tool = 'pen' | 'eraser' | 'rect' | 'circle' | 'text';

interface Props {
  value: string | null;
  onChange: (dataUrl: string | null) => void;
}

const widths = [
  { label: '가늘게', value: 3 },
  { label: '보통', value: 6 },
  { label: '굵게', value: 12 },
];
const colors = [
  { label: '검정', value: '#1b1b1b' },
  { label: '파랑', value: '#1d5fbf' },
  { label: '빨강', value: '#c2362b' },
  { label: '초록', value: '#1e8e4f' },
];

/** 마우스·손가락·펜으로 그리는 설계도 그림판 */
export default function SketchCanvas({ value, onChange }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const undo = useRef<ImageData[]>([]);
  const drawing = useRef<{ id: number; x: number; y: number; snap: ImageData | null; startX: number; startY: number } | null>(null);
  const loadedValue = useRef<string | null | undefined>(undefined);
  const [tool, setTool] = useState<Tool>('pen');
  const [width, setWidth] = useState(6);
  const [color, setColor] = useState(colors[0].value);
  const [labelText, setLabelText] = useState('');
  const [undoCount, setUndoCount] = useState(0);
  const [msg, setMsg] = useState('');

  const ctx = () => canvasRef.current?.getContext('2d') ?? null;

  const clearWhite = useCallback(() => {
    const c = ctx();
    if (!c) return;
    c.fillStyle = '#ffffff';
    c.fillRect(0, 0, CW, CH);
  }, []);

  // 저장된 그림을 불러온다 (내가 방금 저장한 값이면 다시 그리지 않는다)
  useEffect(() => {
    if (loadedValue.current === value) return;
    loadedValue.current = value;
    clearWhite();
    if (!value) return;
    const img = new Image();
    img.onload = () => ctx()?.drawImage(img, 0, 0, CW, CH);
    img.onerror = () => setMsg('저장된 설계도를 불러오지 못했어요.');
    img.src = value;
  }, [value, clearWhite]);

  const pushUndo = () => {
    const c = ctx();
    if (!c) return;
    undo.current.push(c.getImageData(0, 0, CW, CH));
    if (undo.current.length > MAX_UNDO) undo.current.shift();
    setUndoCount(undo.current.length);
  };

  const commit = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    try {
      const url = canvas.toDataURL('image/png');
      loadedValue.current = url;
      onChange(url);
    } catch {
      setMsg('설계도를 저장하지 못했어요. 활동 파일로 내보내 주세요.');
    }
  };

  const pos = (e: RPointerEvent<HTMLCanvasElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    return { x: ((e.clientX - r.left) / r.width) * CW, y: ((e.clientY - r.top) / r.height) * CH };
  };

  const style = (c: CanvasRenderingContext2D) => {
    c.lineCap = 'round';
    c.lineJoin = 'round';
    c.lineWidth = tool === 'eraser' ? width * 3 : width;
    c.strokeStyle = tool === 'eraser' ? '#ffffff' : color;
    c.fillStyle = color;
  };

  const onDown = (e: RPointerEvent<HTMLCanvasElement>) => {
    if (drawing.current) return;
    const c = ctx();
    if (!c) return;
    const p = pos(e);
    if (tool === 'text') {
      const t = labelText.trim();
      if (!t) {
        setMsg('먼저 아래 칸에 붙일 이름(예: 손잡이)을 적고 그림을 눌러 주세요.');
        return;
      }
      pushUndo();
      c.font = `bold ${Math.max(18, width * 4)}px 'Pretendard','Apple SD Gothic Neo','Noto Sans KR','Malgun Gothic',sans-serif`;
      c.fillStyle = color;
      c.textBaseline = 'middle';
      c.fillText(t, p.x, p.y);
      setMsg(`"${t}" 이름표를 붙였어요.`);
      commit();
      return;
    }
    e.currentTarget.setPointerCapture(e.pointerId);
    pushUndo();
    drawing.current = { id: e.pointerId, x: p.x, y: p.y, startX: p.x, startY: p.y, snap: tool === 'rect' || tool === 'circle' ? c.getImageData(0, 0, CW, CH) : null };
    style(c);
    if (tool === 'pen' || tool === 'eraser') {
      c.beginPath();
      c.arc(p.x, p.y, c.lineWidth / 2, 0, Math.PI * 2);
      c.fillStyle = c.strokeStyle as string;
      c.fill();
    }
  };

  const onMove = (e: RPointerEvent<HTMLCanvasElement>) => {
    const d = drawing.current;
    const c = ctx();
    if (!d || !c || d.id !== e.pointerId) return;
    const p = pos(e);
    style(c);
    if (tool === 'pen' || tool === 'eraser') {
      c.beginPath();
      c.moveTo(d.x, d.y);
      c.lineTo(p.x, p.y);
      c.stroke();
      d.x = p.x;
      d.y = p.y;
    } else if (d.snap) {
      c.putImageData(d.snap, 0, 0);
      c.beginPath();
      if (tool === 'rect') c.rect(d.startX, d.startY, p.x - d.startX, p.y - d.startY);
      else c.ellipse((d.startX + p.x) / 2, (d.startY + p.y) / 2, Math.abs(p.x - d.startX) / 2, Math.abs(p.y - d.startY) / 2, 0, 0, Math.PI * 2);
      c.stroke();
    }
  };

  const onUp = (e: RPointerEvent<HTMLCanvasElement>) => {
    const d = drawing.current;
    if (!d || d.id !== e.pointerId) return;
    drawing.current = null;
    setMsg('');
    commit();
  };

  const doUndo = () => {
    const c = ctx();
    const last = undo.current.pop();
    if (!c || !last) return;
    c.putImageData(last, 0, 0);
    setUndoCount(undo.current.length);
    commit();
  };

  const clearAll = () => {
    if (!window.confirm('설계도를 모두 지울까요? (되돌리기로 다시 살릴 수 있어요)')) return;
    pushUndo();
    clearWhite();
    loadedValue.current = null;
    onChange(null);
  };

  const tools: { id: Tool; label: string }[] = [
    { id: 'pen', label: '✏️ 펜' },
    { id: 'eraser', label: '🧽 지우개' },
    { id: 'rect', label: '▭ 사각형' },
    { id: 'circle', label: '◯ 원' },
    { id: 'text', label: '🏷️ 이름표' },
  ];

  return (
    <div className="sketch">
      <div className="sketch-toolbar" role="toolbar" aria-label="설계도 그리기 도구">
        <div className="tool-set" role="radiogroup" aria-label="도구">
          {tools.map((t) => (
            <button key={t.id} type="button" role="radio" aria-checked={tool === t.id} className={`tool${tool === t.id ? ' on' : ''}`} onClick={() => setTool(t.id)}>
              {t.label}
            </button>
          ))}
        </div>
        <div className="tool-set" role="radiogroup" aria-label="선 굵기">
          {widths.map((w) => (
            <button key={w.value} type="button" role="radio" aria-checked={width === w.value} className={`tool${width === w.value ? ' on' : ''}`} onClick={() => setWidth(w.value)}>
              <span className="line-sample" style={{ height: Math.max(2, w.value / 2) }} aria-hidden="true" />
              {w.label}
            </button>
          ))}
        </div>
        <div className="tool-set" role="radiogroup" aria-label="색">
          {colors.map((c) => (
            <button key={c.value} type="button" role="radio" aria-checked={color === c.value} className={`tool${color === c.value ? ' on' : ''}`} onClick={() => setColor(c.value)}>
              <span className="swatch" style={{ background: c.value }} aria-hidden="true" />
              {c.label}
            </button>
          ))}
        </div>
        <div className="tool-set">
          <button type="button" className="tool" onClick={doUndo} disabled={undoCount === 0}>
            ↶ 되돌리기
          </button>
          <button type="button" className="tool" onClick={clearAll}>
            🗑️ 전체 지우기
          </button>
        </div>
      </div>
      {tool === 'text' && (
        <div className="field inline">
          <label htmlFor="sketch-label">붙일 이름(부품 이름)</label>
          <input id="sketch-label" type="text" maxLength={20} value={labelText} placeholder="예: 큰 손잡이" onChange={(e) => setLabelText(e.target.value)} />
          <span className="hint">적은 뒤 그림에서 붙일 곳을 눌러요.</span>
        </div>
      )}
      <canvas
        ref={canvasRef}
        width={CW}
        height={CH}
        className="sketch-canvas"
        aria-label="발명품 설계도 그림판. 그림을 그리기 어렵다면 아래 글 설명 칸을 사용하세요."
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerCancel={onUp}
      />
      <p className="hint" aria-live="polite">
        {msg || '그린 그림은 자동으로 저장돼요.'}
      </p>
    </div>
  );
}
