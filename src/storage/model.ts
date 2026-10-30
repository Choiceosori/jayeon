export type ObservationSource = 'real_object' | 'photo' | 'video';

export type Observation = {
  natureId: string;
  source: ObservationSource[];
  shape: string; // 보이는 모양
  texture: string; // 표면·무늬
  noticeableFeature: string; // 특별한 점
  curiosity: string; // 궁금한 점
  confirmedFact: string; // 직접 보았거나 자료에서 확인한 내용
  hypothesis: string; // 나의 예상
  learned: string; // 설명 자료를 보고 새롭게 알게 된 점
  photoId?: string; // IndexedDB 사진 키
  updatedAt: string;
};

export type Combination = {
  id: string;
  natureId: string;
  objectId: string;
  chosenFeature: string;
  changedPart: string;
  imagination: string;
  isFavorite: boolean;
  createdAt: string;
};

export type Sketch = {
  combinationId: string;
  title: string; // 물건 이름
  feature: string; // 자연에서 가져온 특징
  whatChanged: string; // 기존 물건과 달라진 모습
  whyInteresting: string; // 재미있다고 생각한 이유
  textAlternative: string; // 그림 없이 글로 설명하기
  hasDrawing: boolean; // 선 데이터는 IndexedDB `draw:<combinationId>`
  photoId?: string; // 종이 스케치 사진
  updatedAt: string;
};

export type Notebook = {
  schemaVersion: 1;
  notebookId: string;
  nickname: string;
  startedAt: string;
  observations: Record<string, Observation>;
  currentNatureId: string;
  /** 자연물 id → 학생이 연결한 사례 id */
  matches: Record<string, string>;
  /** 자연물 id → 연결 이유(닮은 점 또는 다르게 생각한 이유) */
  matchReasons: Record<string, string>;
  savedCaseIds: string[];
  museumFavoriteId: string;
  museumWhy: string;
  desk: { natureId: string; objectId: string; chosenFeature: string; changedPart: string; imagination: string };
  combinations: Combination[];
  currentCombinationId: string;
  sketches: Record<string, Sketch>;
  finalReflection: string;
  shareSentence: string;
  zoom: Record<string, { z: number; x: number; y: number }>;
  visitedPageIds: string[];
  lastPageId: string;
  savedAt: string;
};

export const uid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);

export function emptyObservation(natureId: string): Observation {
  return {
    natureId,
    source: [],
    shape: '',
    texture: '',
    noticeableFeature: '',
    curiosity: '',
    confirmedFact: '',
    hypothesis: '',
    learned: '',
    updatedAt: new Date().toISOString(),
  };
}

export function emptySketch(combinationId: string): Sketch {
  return { combinationId, title: '', feature: '', whatChanged: '', whyInteresting: '', textAlternative: '', hasDrawing: false, updatedAt: new Date().toISOString() };
}

export function newNotebook(nickname = ''): Notebook {
  const now = new Date().toISOString();
  return {
    schemaVersion: 1,
    notebookId: uid(),
    nickname,
    startedAt: now,
    observations: {},
    currentNatureId: 'n01',
    matches: {},
    matchReasons: {},
    savedCaseIds: [],
    museumFavoriteId: '',
    museumWhy: '',
    desk: { natureId: '', objectId: '', chosenFeature: '', changedPart: '', imagination: '' },
    combinations: [],
    currentCombinationId: '',
    sketches: {},
    finalReflection: '',
    shareSentence: '',
    zoom: {},
    visitedPageIds: [],
    lastPageId: 'cover',
    savedAt: now,
  };
}

/** 관찰 기록에 한 글자라도 적었는지 */
export function hasObservationText(o: Observation | undefined) {
  if (!o) return false;
  return [o.shape, o.texture, o.noticeableFeature, o.curiosity, o.confirmedFact, o.hypothesis, o.learned].some((v) => v.trim()) || o.source.length > 0 || !!o.photoId;
}

export function hasSketchContent(s: Sketch | undefined) {
  if (!s) return false;
  return s.hasDrawing || !!s.photoId || [s.title, s.feature, s.whatChanged, s.whyInteresting, s.textAlternative].some((v) => v.trim());
}

/** 가져온 JSON이 이 앱의 수첩 형식인지 검사하고, 빠진 필드는 기본값으로 채운다. */
export function validateNotebook(raw: unknown): Notebook | null {
  if (!raw || typeof raw !== 'object') return null;
  const r = raw as Record<string, unknown>;
  if (r.schemaVersion !== 1) return null;
  const base = newNotebook();
  const isObj = (v: unknown) => !!v && typeof v === 'object' && !Array.isArray(v);
  if (r.observations !== undefined && !isObj(r.observations)) return null;
  if (r.combinations !== undefined && !Array.isArray(r.combinations)) return null;
  if (r.sketches !== undefined && !isObj(r.sketches)) return null;
  const str = (v: unknown, d: string) => (typeof v === 'string' ? v : d);
  const nb: Notebook = {
    ...base,
    notebookId: str(r.notebookId, base.notebookId),
    nickname: str(r.nickname, ''),
    startedAt: str(r.startedAt, base.startedAt),
    currentNatureId: str(r.currentNatureId, 'n01'),
    museumFavoriteId: str(r.museumFavoriteId, ''),
    museumWhy: str(r.museumWhy, ''),
    currentCombinationId: str(r.currentCombinationId, ''),
    finalReflection: str(r.finalReflection, ''),
    shareSentence: str(r.shareSentence, ''),
    lastPageId: str(r.lastPageId, 'cover'),
  };
  for (const [k, v] of Object.entries((r.observations as Record<string, unknown>) ?? {})) {
    if (!isObj(v)) continue;
    const o = v as Record<string, unknown>;
    nb.observations[k] = {
      ...emptyObservation(k),
      ...Object.fromEntries(Object.entries(o).filter(([, val]) => typeof val === 'string')),
      source: Array.isArray(o.source) ? (o.source.filter((x) => x === 'real_object' || x === 'photo' || x === 'video') as ObservationSource[]) : [],
      natureId: k,
    };
  }
  for (const c of (r.combinations as unknown[]) ?? []) {
    if (!isObj(c)) continue;
    const o = c as Record<string, unknown>;
    if (typeof o.id !== 'string' || typeof o.natureId !== 'string' || typeof o.objectId !== 'string') continue;
    nb.combinations.push({
      id: o.id,
      natureId: o.natureId,
      objectId: o.objectId,
      chosenFeature: str(o.chosenFeature, ''),
      changedPart: str(o.changedPart, ''),
      imagination: str(o.imagination, ''),
      isFavorite: o.isFavorite === true,
      createdAt: str(o.createdAt, base.startedAt),
    });
  }
  for (const [k, v] of Object.entries((r.sketches as Record<string, unknown>) ?? {})) {
    if (!isObj(v)) continue;
    const o = v as Record<string, unknown>;
    nb.sketches[k] = {
      ...emptySketch(k),
      title: str(o.title, ''),
      feature: str(o.feature, ''),
      whatChanged: str(o.whatChanged, ''),
      whyInteresting: str(o.whyInteresting, ''),
      textAlternative: str(o.textAlternative, ''),
      hasDrawing: o.hasDrawing === true,
      photoId: typeof o.photoId === 'string' ? o.photoId : undefined,
    };
  }
  const strRecord = (v: unknown) => (isObj(v) ? Object.fromEntries(Object.entries(v as object).filter(([, x]) => typeof x === 'string')) : {});
  nb.matches = strRecord(r.matches);
  nb.matchReasons = strRecord(r.matchReasons);
  nb.savedCaseIds = Array.isArray(r.savedCaseIds) ? r.savedCaseIds.filter((x): x is string => typeof x === 'string') : [];
  nb.visitedPageIds = Array.isArray(r.visitedPageIds) ? r.visitedPageIds.filter((x): x is string => typeof x === 'string') : [];
  if (isObj(r.desk)) {
    const d = r.desk as Record<string, unknown>;
    nb.desk = { natureId: str(d.natureId, ''), objectId: str(d.objectId, ''), chosenFeature: str(d.chosenFeature, ''), changedPart: str(d.changedPart, ''), imagination: str(d.imagination, '') };
  }
  if (isObj(r.zoom)) {
    for (const [k, v] of Object.entries(r.zoom as object)) {
      const z = v as Record<string, unknown>;
      if (typeof z?.z === 'number' && typeof z?.x === 'number' && typeof z?.y === 'number') nb.zoom[k] = { z: z.z, x: z.x, y: z.y };
    }
  }
  return nb;
}
