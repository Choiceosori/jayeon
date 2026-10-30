import type { DesignSettings } from '../../models/Project12';
import { Icon, SVG_FONT } from './svgUtils';

const W = 480;
const H = 300;
const half: Record<string, number> = { small: 17, medium: 32, large: 50 };

function palette(contrast: string, statusCue: string) {
  const high = contrast === 'high';
  return {
    wall: high ? '#f3efe6' : '#e6e2da',
    plate: high ? '#ffffff' : '#e1ddd5',
    plateStroke: high ? '#2b2b2b' : '#d6d2ca',
    caption: '#2b2b2b',
    // '색으로만'일 때는 빨강/초록처럼 색 차이에만 기대는 조합을 일부러 쓴다
    off: high ? (statusCue === 'color' ? '#c0392b' : '#4a5160') : '#d2c6c0',
    on: high ? '#1e8e4f' : '#c9d3c0',
    btnStroke: high ? '#111111' : '#cfcac1',
    mark: high ? '#ffffff' : '#bdb8ae',
    labelText: high ? '#111111' : '#b3ada2',
  };
}

export function buttonTextAlternative(s: DesignSettings): string[] {
  const cue =
    s.statusCue === 'color'
      ? '켜짐과 꺼짐을 버튼 색으로만 구분 (스위치 ㉡이 켜져 있음: 초록색)'
      : '켜짐은 초록색·"켜짐" 글씨·눌린 모양·채워진 표시등, 꺼짐은 "꺼짐" 글씨·튀어나온 모양·빈 표시등';
  const label = s.label === 'icon' ? '버튼에 전구 그림만 있음' : s.label === 'text' ? '버튼에 "전등" 글씨만 있음' : '전구 그림과 "전등" 글씨가 함께 있음';
  return ['교실 전등 스위치 두 개(㉠, ㉡)', label, cue];
}

function Switch({ x, s, on, name }: { x: number; s: DesignSettings; on: boolean; name: string }) {
  const p = palette(s.contrast, s.statusCue);
  const r = half[s.visualSize] ?? 17;
  const rich = s.statusCue === 'colorTextAndShape';
  const pw = 190;
  const ph = 228;
  const px = x;
  const py = 34;
  const cx = px + pw / 2;
  const cy = py + 100;
  const rx = s.shape === 'circle' ? r : s.shape === 'rounded' ? r * 0.38 : 3;
  const fill = on ? p.on : p.off;
  const strokeW = s.contrast === 'high' ? 3 : 1.2;
  // 모양 변화: 켜짐 = 눌려 들어간 모양(작고 안쪽 테두리), 꺼짐 = 튀어나온 모양(그림자)
  const pressed = rich && on;
  const shrink = pressed ? 0.9 : 1;
  const bw = r * 2 * shrink;
  const showIcon = s.label !== 'text';
  const showTextInside = s.label === 'text';
  const showTextBelow = s.label === 'iconAndText';
  return (
    <g>
      <rect x={px} y={py} width={pw} height={ph} rx="14" fill={p.plate} stroke={p.plateStroke} strokeWidth={s.contrast === 'high' ? 2 : 1} />
      <text x={cx} y={py - 10} textAnchor="middle" fontSize="15" fontWeight={700} fill={p.caption}>
        {name}
      </text>
      {rich && (
        <g>
          <circle cx={cx} cy={py + 28} r="8" fill={on ? '#f6c453' : 'none'} stroke="#555" strokeWidth="2" />
          {on &&
            [0, 60, 120, 180, 240, 300].map((a) => (
              <line
                key={a}
                x1={cx + Math.cos((a * Math.PI) / 180) * 11}
                y1={py + 28 + Math.sin((a * Math.PI) / 180) * 11}
                x2={cx + Math.cos((a * Math.PI) / 180) * 15}
                y2={py + 28 + Math.sin((a * Math.PI) / 180) * 15}
                stroke="#b07d00"
                strokeWidth="2"
                strokeLinecap="round"
              />
            ))}
        </g>
      )}
      {rich && !pressed && <rect x={cx - bw / 2 + 3} y={cy - bw / 2 + 5} width={bw} height={bw} rx={rx * shrink} fill="#000" opacity="0.18" />}
      <rect x={cx - bw / 2} y={cy - bw / 2} width={bw} height={bw} rx={rx * shrink} fill={fill} stroke={p.btnStroke} strokeWidth={strokeW} />
      {pressed && (
        <rect x={cx - bw / 2 + 4} y={cy - bw / 2 + 4} width={bw - 8} height={bw - 8} rx={Math.max(0, rx * shrink - 4)} fill="none" stroke="#000" strokeOpacity="0.3" strokeWidth="3" />
      )}
      {showIcon && <Icon name="bulb" x={cx - r * 0.6} y={cy - r * 0.6} size={r * 1.2} color={p.mark} />}
      {showTextInside && (
        <text x={cx} y={cy + r * 0.16} textAnchor="middle" dominantBaseline="middle" fontSize={Math.max(7, r * 0.55)} fontWeight={700} fill={p.mark}>
          전등
        </text>
      )}
      {showTextBelow && (
        <text x={cx} y={cy + r + 26} textAnchor="middle" fontSize="18" fontWeight={700} fill={p.labelText}>
          전등
        </text>
      )}
      {rich && (
        <g>
          <rect x={cx - 34} y={py + ph - 44} width="68" height="30" rx="15" fill={on ? '#1e8e4f' : '#ffffff'} stroke="#222" strokeWidth="2" />
          <text x={cx} y={py + ph - 23} textAnchor="middle" fontSize="16" fontWeight={800} fill={on ? '#ffffff' : '#222222'}>
            {on ? '● 켜짐' : '○ 꺼짐'}
          </text>
        </g>
      )}
    </g>
  );
}

export default function ButtonPreview({ settings, label }: { settings: DesignSettings; label: string }) {
  const p = palette(settings.contrast, settings.statusCue);
  return (
    <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={label} className="preview-svg" style={{ fontFamily: SVG_FONT }}>
      <rect width={W} height={H} rx="10" fill={p.wall} />
      <Switch x={30} s={settings} on={false} name="스위치 ㉠" />
      <Switch x={260} s={settings} on name="스위치 ㉡" />
    </svg>
  );
}
