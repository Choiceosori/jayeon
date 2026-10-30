import { downloadBlob } from '../../storage/projectStorage';

export const SVG_FONT = "'Pretendard', 'Apple SD Gothic Neo', 'Noto Sans KR', 'Malgun Gothic', sans-serif";

/** 한글은 글자 폭이 넓으므로 대략적인 폭으로 줄을 나눈다 */
function charWidth(ch: string, fs: number) {
  if (ch === ' ') return fs * 0.3;
  if (/[ㄱ-힝一-鿿]/.test(ch)) return fs * 0.98;
  if (/[A-Z0-9]/.test(ch)) return fs * 0.62;
  return fs * 0.52;
}

export function textWidth(text: string, fs: number) {
  let w = 0;
  for (const ch of text) w += charWidth(ch, fs);
  return w;
}

export function wrapText(text: string, maxWidth: number, fs: number): string[] {
  const words = text.split(' ');
  const lines: string[] = [];
  let line = '';
  const push = () => {
    if (line) lines.push(line);
    line = '';
  };
  for (const word of words) {
    const candidate = line ? `${line} ${word}` : word;
    if (textWidth(candidate, fs) <= maxWidth) {
      line = candidate;
      continue;
    }
    push();
    if (textWidth(word, fs) <= maxWidth) {
      line = word;
      continue;
    }
    // 한 낱말이 너무 길면 글자 단위로 자른다
    for (const ch of word) {
      if (textWidth(line + ch, fs) > maxWidth) push();
      line += ch;
    }
  }
  push();
  return lines.length ? lines : [''];
}

type IconName = 'book' | 'health' | 'food' | 'bulb' | 'glue' | 'scissors' | 'crayon' | 'tape';

/** 24×24 상자 기준의 단순한 그림 기호 */
export function Icon({ name, x, y, size, color }: { name: IconName; x: number; y: number; size: number; color: string }) {
  const s = size / 24;
  const common = { fill: 'none', stroke: color, strokeWidth: 2.2, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };
  let body: JSX.Element;
  switch (name) {
    case 'book':
      body = (
        <g {...common}>
          <path d="M3 5.5c3-1.5 6-1.5 9 .5v14c-3-2-6-2-9-.5z" />
          <path d="M21 5.5c-3-1.5-6-1.5-9 .5v14c3-2 6-2 9-.5z" />
        </g>
      );
      break;
    case 'health':
      body = (
        <g>
          <rect x="2.5" y="2.5" width="19" height="19" rx="4" fill="none" stroke={color} strokeWidth="2.2" />
          <path d="M10 6.5h4v3.5h3.5v4H14v3.5h-4V14H6.5v-4H10z" fill={color} />
        </g>
      );
      break;
    case 'food':
      body = (
        <g {...common}>
          <path d="M7 3v7M4.5 3v5a2.5 2.5 0 0 0 5 0V3M7 10v11" />
          <path d="M17 21V3c-2.5 1.5-3.5 4-3.5 7.5 0 2 1.2 3 3.5 3" />
        </g>
      );
      break;
    case 'bulb':
      body = (
        <g {...common}>
          <path d="M8.5 15.5c-1.8-1.3-3-3.4-3-5.8a6.5 6.5 0 0 1 13 0c0 2.4-1.2 4.5-3 5.8V18h-7z" />
          <path d="M9.5 21h5" />
        </g>
      );
      break;
    case 'glue':
      body = (
        <g {...common}>
          <rect x="7" y="9" width="10" height="12" rx="2" />
          <path d="M8.5 9V6.5h7V9M10 6.5V3.5h4v3" />
        </g>
      );
      break;
    case 'scissors':
      body = (
        <g {...common}>
          <circle cx="6.5" cy="17.5" r="3" />
          <circle cx="17.5" cy="17.5" r="3" />
          <path d="M8.5 15.5 19 3M15.5 15.5 5 3" />
        </g>
      );
      break;
    case 'crayon':
      body = (
        <g {...common}>
          <path d="M5 19 15.5 8.5l3 3L8 22H5z" />
          <path d="m15.5 8.5 2-2a2.1 2.1 0 0 1 3 3l-2 2" />
        </g>
      );
      break;
    case 'tape':
      body = (
        <g {...common}>
          <circle cx="10" cy="12" r="7.5" />
          <circle cx="10" cy="12" r="3" />
          <path d="M10 19.5h11" />
        </g>
      );
      break;
  }
  return <g transform={`translate(${x} ${y}) scale(${s})`}>{body}</g>;
}

/** 화면의 SVG 미리 보기를 고해상도 PNG 파일로 저장한다 */
export async function saveSvgAsPng(svg: SVGSVGElement, fileName: string, scale = 3) {
  const vb = svg.viewBox.baseVal;
  const width = vb && vb.width ? vb.width : svg.clientWidth;
  const height = vb && vb.height ? vb.height : svg.clientHeight;
  const clone = svg.cloneNode(true) as SVGSVGElement;
  clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
  clone.setAttribute('width', String(width));
  clone.setAttribute('height', String(height));
  const xml = new XMLSerializer().serializeToString(clone);
  const url = URL.createObjectURL(new Blob([xml], { type: 'image/svg+xml;charset=utf-8' }));
  try {
    const img = new Image();
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = () => reject(new Error('그림을 만들지 못했어요.'));
      img.src = url;
    });
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(width * scale);
    canvas.height = Math.round(height * scale);
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('그림을 만들지 못했어요.');
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    const blob = await new Promise<Blob | null>((r) => canvas.toBlob(r, 'image/png'));
    if (!blob) throw new Error('그림을 만들지 못했어요.');
    downloadBlob(blob, fileName);
  } finally {
    URL.revokeObjectURL(url);
  }
}
