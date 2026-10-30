import type { DesignSettings } from '../../models/Project12';
import { Icon, SVG_FONT, textWidth } from './svgUtils';

const W = 520;
const H = 300;

const items = [
  { vague: '만들기 1', specific: '풀', icon: 'glue' as const, color: '#f2c94c' },
  { vague: '도구', specific: '가위', icon: 'scissors' as const, color: '#e05d5d' },
  { vague: '미술', specific: '색연필', icon: 'crayon' as const, color: '#4a90d9' },
  { vague: '기타', specific: '테이프', icon: 'tape' as const, color: '#5bb381' },
];

const themes: Record<string, { bg: string; shelf: string; bin: string; binTop: string; title: string; titleBg: string; round: number }> = {
  neutral: { bg: '#eef0f2', shelf: '#8d949b', bin: '#d3d7dc', binTop: '#e6e9ec', title: '#2a2f35', titleBg: '#ffffff', round: 2 },
  warm: { bg: '#fbf1e4', shelf: '#9b6a45', bin: '#e3c39a', binTop: '#efd8b8', title: '#4a2e17', titleBg: '#fff8ee', round: 10 },
  fresh: { bg: '#e8f5fb', shelf: '#3f8fb3', bin: '#c4e3f0', binTop: '#dcf0f8', title: '#0f3d52', titleBg: '#ffffff', round: 10 },
};

const labelFs: Record<string, number> = { small: 10, medium: 15, large: 21 };

export function storageTextAlternative(s: DesignSettings): string[] {
  const pos = s.labelPosition === 'top' ? '뚜껑 위쪽' : s.labelPosition === 'front' ? '앞면' : '앞면과 위쪽';
  return items.map((it, i) => {
    const name = s.wording === 'specific' ? it.specific : it.vague;
    const what =
      s.categories === 'colorOnly'
        ? `색 표시만 있음(글자 없음)`
        : s.categories === 'textOnly'
          ? `라벨 "${name}"`
          : `색 표시 + 그림 + 라벨 "${name}"`;
    return `${i + 1}번 칸(${it.specific} 보관): ${what}, 라벨 위치 ${pos}`;
  });
}

function Label({ x, y, w, s, it, fs }: { x: number; y: number; w: number; s: DesignSettings; it: (typeof items)[number]; fs: number }) {
  const name = s.wording === 'specific' ? it.specific : it.vague;
  const h = fs * 1.9;
  const colorOnly = s.categories === 'colorOnly';
  const withIcon = s.categories === 'colorTextIcon';
  const iconSize = fs * 1.3;
  const tw = textWidth(name, fs);
  const contentW = tw + (withIcon ? iconSize + 4 : 0);
  const lw = colorOnly ? Math.min(w, fs * 3.6) : Math.min(w, contentW + fs * 1.1);
  const lx = x + (w - lw) / 2;
  if (colorOnly) {
    return <rect x={lx} y={y} width={lw} height={h} rx={h / 4} fill={it.color} stroke="#00000033" />;
  }
  const startX = lx + (lw - contentW) / 2;
  return (
    <g>
      <rect x={lx} y={y} width={lw} height={h} rx={h / 4} fill="#ffffff" stroke={withIcon ? it.color : '#555'} strokeWidth={withIcon ? 3 : 1.2} />
      {withIcon && <Icon name={it.icon} x={startX} y={y + (h - iconSize) / 2} size={iconSize} color="#222" />}
      <text x={startX + (withIcon ? iconSize + 4 : 0)} y={y + h / 2 + fs * 0.36} fontSize={fs} fontWeight={700} fill="#1b1b1b">
        {name}
      </text>
    </g>
  );
}

export default function StoragePreview({ settings, label }: { settings: DesignSettings; label: string }) {
  const th = themes[settings.theme] ?? themes.neutral;
  const fs = labelFs[settings.labelSize] ?? 10;
  const top = settings.labelPosition !== 'front';
  const front = settings.labelPosition !== 'top';
  const bw = 112;
  const gap = 12;
  const depth = 46;
  const fh = 104;
  const x0 = (W - (bw * 4 + gap * 3)) / 2 - depth / 4;
  const baseY = 236;
  const colored = settings.categories !== 'textOnly';
  return (
    <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={label} className="preview-svg" style={{ fontFamily: SVG_FONT }}>
      <rect width={W} height={H} rx="10" fill={th.bg} />
      <rect x={W / 2 - 110} y={14} width={220} height={38} rx={th.round} fill={th.titleBg} stroke={th.shelf} strokeWidth="2" />
      <text x={W / 2} y={40} textAnchor="middle" fontSize="19" fontWeight={800} fill={th.title}>
        우리 반 공용 준비물
      </text>
      <rect x={14} y={baseY} width={W - 28} height={16} rx={th.round / 2} fill={th.shelf} />
      <rect x={30} y={baseY + 16} width={14} height={36} fill={th.shelf} />
      <rect x={W - 44} y={baseY + 16} width={14} height={36} fill={th.shelf} />
      {items.map((it, i) => {
        const x = x0 + i * (bw + gap);
        const fy = baseY - fh;
        const ty = fy - depth;
        const topPath = `M${x} ${fy} L${x + depth / 2} ${ty} L${x + bw + depth / 2} ${ty} L${x + bw} ${fy} Z`;
        return (
          <g key={it.specific}>
            <path d={topPath} fill={th.binTop} stroke="#00000040" />
            <rect x={x} y={fy} width={bw} height={fh} rx={th.round / 2} fill={th.bin} stroke="#00000040" />
            {colored && <rect x={x} y={fy + fh - 12} width={bw} height={12} fill={it.color} />}
            {top && <Label x={x + depth / 4 + 4} y={ty + (depth - Math.min(depth - 4, fs * 1.9)) / 2} w={bw - 8} s={settings} it={it} fs={Math.min(fs, (depth - 6) / 1.9)} />}
            {front && <Label x={x + 4} y={fy + 18} w={bw - 8} s={settings} it={it} fs={fs} />}
          </g>
        );
      })}
    </svg>
  );
}
