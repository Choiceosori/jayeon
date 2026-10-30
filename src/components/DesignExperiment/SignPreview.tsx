import type { DesignSettings } from '../../models/Project12';
import { Icon, SVG_FONT, wrapText } from './svgUtils';

const W = 480;
const PAD = 22;

const fontSizes: Record<string, number> = { small: 13, medium: 19, large: 26, xlarge: 34 };

export const signPalettes: Record<string, { bg: string; text: string; line: string; frame: string }> = {
  low: { bg: '#d4cfc3', text: '#aaa395', line: '#c2bcaf', frame: '#b6b0a3' },
  darkOnLight: { bg: '#fffdf5', text: '#16181d', line: '#16181d', frame: '#5b4636' },
  lightOnDark: { bg: '#17324d', text: '#ffffff', line: '#8fb3d4', frame: '#0d1e2e' },
  blueOnWhite: { bg: '#ffffff', text: '#0b4f9c', line: '#0b4f9c', frame: '#0b4f9c' },
};

export const signRows = [
  {
    name: '도서관',
    icon: 'book' as const,
    dir: 'right' as const,
    long: '도서관은 본관 2층 복도 끝 오른쪽에 위치하고 있으며 도서 대출 및 반납이 가능하오니 이용 바랍니다',
    simple: '도서관 · 2층 →',
  },
  {
    name: '보건실',
    icon: 'health' as const,
    dir: 'left' as const,
    long: '몸이 불편한 학생은 담임 선생님께 말씀드린 후 1층 중앙 현관 기준 왼편에 있는 보건실을 방문하십시오',
    simple: '보건실 · 1층 ←',
  },
  {
    name: '급식실',
    icon: 'food' as const,
    dir: 'up' as const,
    long: '급식실은 별관 건물에 있으므로 중앙 현관을 지나 복도를 따라 계속 직진하여 이동하시기 바랍니다',
    simple: '급식실 · 별관 ↑',
  },
];

const dirWord = { right: '오른쪽', left: '왼쪽', up: '앞쪽' };

function Arrow({ dir, x, y, size, color }: { dir: 'left' | 'right' | 'up'; x: number; y: number; size: number; color: string }) {
  const rot = dir === 'right' ? 0 : dir === 'left' ? 180 : -90;
  const s = size / 24;
  return (
    <g transform={`translate(${x + size / 2} ${y + size / 2}) rotate(${rot}) scale(${s}) translate(-12 -12)`}>
      <path d="M3 12h15M12 5l7 7-7 7" fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
    </g>
  );
}

export function signTextAlternative(s: DesignSettings): string[] {
  return signRows.map((r) => {
    const text = s.icon === 'iconOnly' ? `(글자 없음) ${r.name} 그림` : s.wording === 'simple' ? r.simple.replace(/[→←↑]/, '').trim() : r.long;
    return `${text} — 화살표: ${dirWord[r.dir]}`;
  });
}

export default function SignPreview({ settings, label }: { settings: DesignSettings; label: string }) {
  const fs = fontSizes[settings.fontSize] ?? 13;
  const pal = signPalettes[settings.contrast] ?? signPalettes.low;
  const comfortable = settings.spacing === 'comfortable';
  const lineH = fs * (comfortable ? 1.5 : 1.12);
  const rowGap = comfortable ? Math.max(14, fs * 0.9) : 4;
  const showIcon = settings.icon !== 'textOnly';
  const showText = settings.icon !== 'iconOnly';
  const iconSize = Math.max(28, Math.round(fs * 1.7));
  const arrowSize = Math.max(22, Math.round(fs * 1.3));
  const gap = comfortable ? 14 : 8;
  const textX = PAD + (showIcon ? iconSize + gap : 0);
  const textMax = W - textX - PAD - arrowSize - gap;

  const titleFs = Math.round(fs * 1.15);
  let y = PAD + titleFs;
  const titleY = y;
  y += comfortable ? fs * 0.9 + 8 : 8;

  const rows = signRows.map((r) => {
    const text = settings.wording === 'simple' ? r.simple.replace(/\s?[→←↑]$/, '') : r.long;
    const lines = showText ? wrapText(text, textMax, fs) : [];
    const textH = lines.length * lineH;
    const h = Math.max(textH, iconSize, arrowSize) + (comfortable ? 10 : 4);
    const top = y;
    y += h + rowGap;
    return { ...r, lines, top, h };
  });
  const H = Math.round(y - rowGap + PAD);
  const postH = 26;

  return (
    <svg viewBox={`0 0 ${W} ${H + postH}`} role="img" aria-label={label} className="preview-svg" style={{ fontFamily: SVG_FONT }}>
      <rect x={W / 2 - 8} y={H - 2} width={16} height={postH + 2} fill={pal.frame} />
      <rect x="2" y="2" width={W - 4} height={H - 4} rx="10" fill={pal.bg} stroke={pal.frame} strokeWidth="4" />
      <text x={PAD} y={titleY} fontSize={titleFs} fontWeight={700} fill={pal.text}>
        본관 1층 안내
      </text>
      {rows.map((r, i) => {
        const cy = r.top + r.h / 2;
        const textTop = cy - (r.lines.length * lineH) / 2;
        return (
          <g key={r.name}>
            <line x1={PAD} x2={W - PAD} y1={r.top - rowGap / 2 - (i === 0 ? 0 : 0)} y2={r.top - rowGap / 2} stroke={pal.line} strokeWidth={1.5} opacity={0.7} />
            {showIcon && <Icon name={r.icon} x={PAD} y={cy - iconSize / 2} size={iconSize} color={pal.text} />}
            {r.lines.map((ln, j) => (
              <text key={j} x={textX} y={textTop + lineH * j + fs * 0.92 + (lineH - fs) / 2} fontSize={fs} fontWeight={settings.wording === 'simple' ? 700 : 500} fill={pal.text}>
                {ln}
              </text>
            ))}
            <Arrow dir={r.dir} x={W - PAD - arrowSize} y={cy - arrowSize / 2} size={arrowSize} color={pal.text} />
          </g>
        );
      })}
    </svg>
  );
}
