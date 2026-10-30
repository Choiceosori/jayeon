import type { DesignSettings, DesignTopic } from '../models/Project12';

export interface ControlOption {
  value: string;
  label: string;
  /** 설정 요약에 쓰는 짧은 말 (예: '큰 글씨') */
  short: string;
  /** 비교 학습용 예시임을 알리는 표시 */
  compareOnly?: boolean;
}

export interface ControlDef {
  key: string;
  label: string;
  help?: string;
  options: ControlOption[];
}

export interface ObservationTask {
  prompt: string;
}

export interface ExperimentDef {
  id: DesignTopic;
  title: string;
  emoji: string;
  sampleUse: string;
  headline: string;
  originalProblem: string;
  initial: DesignSettings;
  controls: ControlDef[];
  observeQuestions: string[];
  observationTask: string;
  recommendedSituations: string[];
  notice?: string;
}

export const experiments: Record<DesignTopic, ExperimentDef> = {
  sign: {
    id: 'sign',
    title: '학교 안내판',
    emoji: '🪧',
    sampleUse: '도서관·보건실·급식실을 찾아가는 교내 길 안내판',
    headline: '글씨와 그림을 바꾸면 안내가 어떻게 달라질까요?',
    originalProblem: '글씨가 작고 흐리며 문장이 길어서 어디로 가야 하는지 한눈에 알기 어려워요.',
    initial: { fontSize: 'small', contrast: 'low', icon: 'textOnly', spacing: 'tight', wording: 'long' },
    controls: [
      {
        key: 'fontSize',
        label: '글씨 크기',
        options: [
          { value: 'small', label: '작게', short: '작은 글씨' },
          { value: 'medium', label: '보통', short: '보통 글씨' },
          { value: 'large', label: '크게', short: '큰 글씨' },
          { value: 'xlarge', label: '아주 크게', short: '아주 큰 글씨' },
        ],
      },
      {
        key: 'contrast',
        label: '글자와 배경의 색',
        help: '흐린 회색 조합은 비교해 보기 위한 예시예요.',
        options: [
          { value: 'low', label: '흐린 회색', short: '낮은 대비', compareOnly: true },
          { value: 'darkOnLight', label: '밝은 바탕 + 검은 글자', short: '높은 대비(밝은 바탕)' },
          { value: 'lightOnDark', label: '남색 바탕 + 흰 글자', short: '높은 대비(어두운 바탕)' },
          { value: 'blueOnWhite', label: '흰 바탕 + 파란 글자', short: '높은 대비(파란 글자)' },
        ],
      },
      {
        key: 'icon',
        label: '안내 그림',
        help: '그림만 있는 안내는 비교해 보기 위한 선택지예요. 모두에게 정답은 아니에요.',
        options: [
          { value: 'textOnly', label: '글자만', short: '글자만' },
          { value: 'iconAndText', label: '그림 + 글자', short: '그림과 글자 함께' },
          { value: 'iconOnly', label: '그림만', short: '그림만', compareOnly: true },
        ],
      },
      {
        key: 'spacing',
        label: '줄 간격·정보 간격',
        options: [
          { value: 'tight', label: '좁게', short: '좁은 간격' },
          { value: 'comfortable', label: '넉넉하게', short: '넉넉한 간격' },
        ],
      },
      {
        key: 'wording',
        label: '안내 문구',
        options: [
          { value: 'long', label: '긴 표현', short: '긴 문구' },
          { value: 'simple', label: '짧고 쉬운 표현', short: '짧고 쉬운 문구' },
        ],
      },
    ],
    observeQuestions: [
      '멀리서도 무엇을 안내하는지 쉽게 알아볼 수 있을까요?',
      '색깔을 구별하기 어려워도 글이나 모양으로 뜻을 알 수 있을까요?',
      '그림과 글을 함께 보여주는 것이 어떤 상황에서 도움이 되나요?',
      '읽기 쉬우면서도 보기 좋은 안내판을 만들려면 무엇을 조절해야 할까요?',
    ],
    observationTask: '안내판에서 보건실이 어느 쪽인지 찾아보세요.',
    recommendedSituations: ['first_visitor', 'small_text', 'language_diff', 'dim_place'],
  },
  button: {
    id: 'button',
    title: '공용 버튼·스위치',
    emoji: '🔘',
    sampleUse: '교실 전등을 켜고 끄는 벽 스위치 (실물과 연결되지 않은 가상 디자인)',
    headline: '누구에게나 알아보기 쉬운 버튼일까요?',
    originalProblem: '버튼이 작고 벽과 색이 비슷해서 눈에 잘 띄지 않고, 켜졌는지 색으로만 알 수 있어요.',
    initial: { visualSize: 'small', shape: 'circle', label: 'icon', statusCue: 'color', contrast: 'low' },
    controls: [
      {
        key: 'visualSize',
        label: '버튼 모형 크기',
        help: '화면 속 모형의 상대적인 크기예요. 실제 손으로 누르기 쉬운지는 실물로 확인해야 해요.',
        options: [
          { value: 'small', label: '작은 모형', short: '작은 버튼' },
          { value: 'medium', label: '보통 모형', short: '보통 버튼' },
          { value: 'large', label: '큰 모형', short: '큰 버튼' },
        ],
      },
      {
        key: 'shape',
        label: '버튼 모양',
        options: [
          { value: 'circle', label: '원형', short: '원형' },
          { value: 'square', label: '사각형', short: '사각형' },
          { value: 'rounded', label: '모서리 둥근 사각형', short: '둥근 사각형' },
        ],
      },
      {
        key: 'label',
        label: '안내 표시',
        options: [
          { value: 'icon', label: '아이콘만', short: '아이콘만' },
          { value: 'text', label: '글자만', short: '글자만' },
          { value: 'iconAndText', label: '아이콘 + 글자', short: '아이콘과 글자 함께' },
        ],
      },
      {
        key: 'statusCue',
        label: '켜짐·꺼짐 표시',
        options: [
          { value: 'color', label: '색으로만', short: '색으로만 상태 표시' },
          { value: 'colorTextAndShape', label: '색 + 글씨 + 모양 변화', short: '색·글씨·모양으로 상태 표시' },
        ],
      },
      {
        key: 'contrast',
        label: '버튼과 벽의 구분',
        help: '약한 대비는 비교해 보기 위한 예시예요.',
        options: [
          { value: 'low', label: '약한 대비', short: '약한 대비', compareOnly: true },
          { value: 'high', label: '뚜렷한 대비', short: '뚜렷한 대비' },
        ],
      },
    ],
    observeQuestions: [
      '어떤 버튼이 눌러야 하는 곳인지 알아보기 쉬운가요?',
      '색을 구별하지 않아도 켜짐과 꺼짐을 확인할 수 있나요?',
      '손에 물건을 들었거나 장갑을 끼면 어떤 점을 고려해야 할까요?',
      '실물로 만들 때 반드시 실제로 확인해야 할 것은 무엇인가요?',
    ],
    observationTask: '두 스위치 중 어느 쪽이 켜져 있는지 찾아보세요.',
    recommendedSituations: ['hands_full', 'gloves', 'noisy_room'],
    notice: '화면으로는 손의 힘, 촉감, 누르는 느낌을 알 수 없어요. 실물 모형으로 꼭 직접 확인해요.',
  },
  storage: {
    id: 'storage',
    title: '공용 수납함',
    emoji: '🗃️',
    sampleUse: '풀·가위·색연필·테이프를 넣어 두는 학급 공용 준비물 보관함',
    headline: '이 물건이 어디 있는지 한눈에 찾을 수 있을까요?',
    originalProblem: '칸이 색으로만 구분되어 있고 이름이 모호해서 어디에 무엇을 넣는지 헷갈려요.',
    initial: { categories: 'colorOnly', labelSize: 'small', labelPosition: 'top', wording: 'vague', theme: 'neutral' },
    controls: [
      {
        key: 'categories',
        label: '구분 방식',
        options: [
          { value: 'colorOnly', label: '색만', short: '색으로만 구분' },
          { value: 'textOnly', label: '글자만', short: '글자로만 구분' },
          { value: 'colorTextIcon', label: '색 + 글자 + 그림', short: '색·글자·그림 함께' },
        ],
      },
      {
        key: 'labelSize',
        label: '라벨 크기',
        options: [
          { value: 'small', label: '작게', short: '작은 라벨' },
          { value: 'medium', label: '보통', short: '보통 라벨' },
          { value: 'large', label: '크게', short: '큰 라벨' },
        ],
      },
      {
        key: 'labelPosition',
        label: '라벨 위치',
        options: [
          { value: 'top', label: '위쪽', short: '라벨 위쪽' },
          { value: 'front', label: '앞면', short: '라벨 앞면' },
          { value: 'both', label: '앞면과 위쪽 함께', short: '라벨 앞면·위쪽' },
        ],
      },
      {
        key: 'wording',
        label: '분류 이름',
        options: [
          { value: 'vague', label: '모호한 이름', short: '모호한 이름' },
          { value: 'specific', label: '구체적인 이름', short: '구체적인 이름' },
        ],
      },
      {
        key: 'theme',
        label: '느낌(테마)',
        help: '어떤 테마든 글자는 잘 읽히도록 만들었어요. 어떤 느낌이 드는지 비교해 보세요.',
        options: [
          { value: 'neutral', label: '차분한 회색', short: '차분한 테마' },
          { value: 'warm', label: '따뜻한 나무색', short: '따뜻한 테마' },
          { value: 'fresh', label: '산뜻한 하늘색', short: '산뜻한 테마' },
        ],
      },
    ],
    observeQuestions: [
      '이 물건이 어디 있는지 쉽게 찾을 수 있나요?',
      '처음 사용하는 사람도 정리 장소를 알 수 있나요?',
      '글씨와 그림을 함께 쓰면 무엇이 달라지나요?',
      '어떤 디자인이 편리하면서 기분 좋게 느껴지나요?',
    ],
    observationTask: '수납함에서 가위가 들어 있는 칸을 찾아보세요.',
    recommendedSituations: ['short_height', 'one_hand', 'rushed'],
    notice: '위쪽 라벨은 키가 작은 사람에게 잘 안 보일 수 있고, 앞면 라벨은 높은 곳에서 내려다볼 때 안 보일 수 있어요.',
  },
};

export const topicList: DesignTopic[] = ['sign', 'button', 'storage'];

export function optionOf(topic: DesignTopic, key: string, value: string): ControlOption | undefined {
  return experiments[topic].controls.find((c) => c.key === key)?.options.find((o) => o.value === value);
}

/** '큰 글씨 · 높은 대비 · 그림과 글자 함께' 같은 설정 요약 */
export function describeSettings(topic: DesignTopic, settings: DesignSettings): string {
  return experiments[topic].controls
    .map((c) => optionOf(topic, c.key, settings[c.key])?.short ?? '')
    .filter(Boolean)
    .join(' · ');
}

/** 처음 디자인과 개선 디자인 사이에 달라진 요소 목록 */
export function diffSettings(topic: DesignTopic, before: DesignSettings, after: DesignSettings): string[] {
  return experiments[topic].controls
    .filter((c) => before[c.key] !== after[c.key])
    .map((c) => {
      const b = optionOf(topic, c.key, before[c.key])?.label ?? '-';
      const a = optionOf(topic, c.key, after[c.key])?.label ?? '-';
      return `${c.label}: ${b} → ${a}`;
    });
}

/** 저장된 값이 손상되었을 때 사용 가능한 값만 남긴다 */
export function normalizeSettings(topic: DesignTopic, raw: unknown): DesignSettings {
  const exp = experiments[topic];
  const out: DesignSettings = { ...exp.initial };
  if (raw && typeof raw === 'object') {
    for (const c of exp.controls) {
      const v = (raw as Record<string, unknown>)[c.key];
      if (typeof v === 'string' && c.options.some((o) => o.value === v)) out[c.key] = v;
    }
  }
  return out;
}
