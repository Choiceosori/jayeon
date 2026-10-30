import { experiments, normalizeSettings, topicList } from '../data/experiments';
import { buildChecklist, usabilityCriteria } from '../data/uiCopy';
import { situations } from '../data/situations';
import type {
  CheckState,
  DesignTopic,
  Evaluation,
  Idea,
  MediaKey,
  Project12,
} from '../models/Project12';
import { MEDIA_KEYS, makeId } from '../models/Project12';

const PREFIX = 'ud12';
const INDEX_KEY = `${PREFIX}:index`;
const CURRENT_KEY = `${PREFIX}:current`;
const projectKey = (id: string) => `${PREFIX}:project:${id}`;

const MAX_TEXT = 5000;
const MAX_LIST = 30;
const MAX_IMAGE_CHARS = 8_000_000;

export interface ProjectMeta {
  id: string;
  title: string;
  nickname: string;
  updatedAt: string;
  currentStep: number;
}

export function newIdea(): Idea {
  return { id: makeId('idea'), title: '', newFunction: '', usabilityFeatures: '', emotionalFeatures: '', feasibility: '' };
}

export function createEmptyProject(): Project12 {
  const now = new Date().toISOString();
  return {
    schemaVersion: 1,
    app: 'universal-design-lab-12',
    id: makeId('p'),
    createdAt: now,
    updatedAt: now,
    teamName: '',
    nickname: '',
    currentStep: 0,
    discoverInconvenience: '',
    discoverSameForAll: '',
    selectedSituationIds: [],
    customSituation: '',
    userTask: '',
    difficulty: '',
    assumedNeed: '',
    needsEvidence: 'not_specified',
    topic: null,
    labSettings: {
      sign: { ...experiments.sign.initial },
      button: { ...experiments.button.initial },
      storage: { ...experiments.storage.initial },
    },
    labNotes: { sign: '', button: '', storage: '' },
    designTopic: null,
    beforeDesign: null,
    afterDesign: null,
    changeSummary: [],
    comparisonNotes: {
      whatChanged: '',
      whoBenefits: '',
      usabilityReason: '',
      emotionalImpression: '',
      unverifiedPoints: '',
      evidence: null,
    },
    comparisonRecordedAt: null,
    observation: { before: 'not_tried', after: 'not_tried', note: '' },
    targetObjectChoice: '',
    targetObject: '',
    affectedUsersAndSituations: [],
    problemParts: { object: '', difficulty: '', goal: '' },
    problemDefinition: '',
    ideas: [newIdea(), newIdea()],
    selectedIdeaId: null,
    selectionReason: '',
    inventionName: '',
    existingProblem: '',
    coreFunctions: [''],
    appearanceAndIndicators: '',
    emotionalDesign: '',
    usageSteps: [''],
    materials: [],
    sketchDataUrl: null,
    sketchText: '',
    buildStatus: 'not_started',
    buildMaterials: '',
    buildNotes: '',
    changedDuringBuild: '',
    buildDifficulty: '',
    buildChecklist: Object.fromEntries(buildChecklist.map((c) => [c.id, 'not_checked' as CheckState])),
    photoDataUrl: null,
    evaluationMethod: null,
    evaluations: usabilityCriteria.map((c) => ({ criterionId: c.id, outcome: 'not_checked', reason: '' })),
    peerPositive: '',
    peerDifficulty: '',
    improvementPlan: '',
    improvementDone: '',
    afterImprovement: '',
    perfectReflection: '',
    helpReason: '',
    reflection: '',
  };
}

export function projectTitle(p: Project12): string {
  return p.inventionName.trim() || p.targetObject.trim() || (p.topic ? `${experiments[p.topic].title} 실험` : '새 디자인 탐험');
}

/* ------------------------------------------------------------------ */
/* 검증·정리: 가져온 파일이나 손상된 저장값을 안전한 프로젝트로 바꾼다 */
/* ------------------------------------------------------------------ */

const str = (v: unknown, fallback = '', max = MAX_TEXT) => (typeof v === 'string' ? v.slice(0, max) : fallback);
const oneOf = <T extends string>(v: unknown, allowed: readonly T[], fallback: T): T =>
  typeof v === 'string' && (allowed as readonly string[]).includes(v) ? (v as T) : fallback;
const strList = (v: unknown, max = MAX_LIST) =>
  Array.isArray(v) ? v.filter((x): x is string => typeof x === 'string').slice(0, max).map((x) => x.slice(0, MAX_TEXT)) : null;
const image = (v: unknown) =>
  typeof v === 'string' && /^data:image\/(png|jpeg|webp);base64,/.test(v) && v.length <= MAX_IMAGE_CHARS ? v : null;

export function sanitizeProject(raw: unknown): Project12 {
  const base = createEmptyProject();
  if (!raw || typeof raw !== 'object') return base;
  const r = raw as Record<string, unknown>;
  const p: Project12 = { ...base };

  p.id = typeof r.id === 'string' && /^[\w-]{1,80}$/.test(r.id) ? r.id : base.id;
  p.createdAt = str(r.createdAt, base.createdAt, 40);
  p.updatedAt = str(r.updatedAt, base.updatedAt, 40);
  p.teamName = str(r.teamName, '', 60);
  p.nickname = str(r.nickname, '', 60);
  p.currentStep = typeof r.currentStep === 'number' && r.currentStep >= 0 && r.currentStep <= 9 ? Math.floor(r.currentStep) : 0;

  const textKeys = [
    'discoverInconvenience', 'discoverSameForAll', 'customSituation', 'userTask', 'difficulty', 'assumedNeed',
    'targetObjectChoice', 'targetObject', 'problemDefinition', 'selectionReason', 'inventionName', 'existingProblem',
    'appearanceAndIndicators', 'emotionalDesign', 'sketchText', 'buildMaterials', 'buildNotes', 'changedDuringBuild',
    'buildDifficulty', 'peerPositive', 'peerDifficulty', 'improvementPlan', 'improvementDone', 'afterImprovement',
    'perfectReflection', 'helpReason', 'reflection',
  ] as const;
  for (const k of textKeys) p[k] = str(r[k]);

  const sitIds = situations.map((s) => s.id);
  p.selectedSituationIds = (strList(r.selectedSituationIds) ?? []).filter((id) => sitIds.includes(id));
  p.needsEvidence = oneOf(r.needsEvidence, ['observed', 'predicted', 'asked', 'not_specified'] as const, 'not_specified');

  p.topic = oneOf(r.topic, [...topicList, ''] as const, '') || null;
  const ls = (r.labSettings ?? {}) as Record<string, unknown>;
  const ln = (r.labNotes ?? {}) as Record<string, unknown>;
  p.labSettings = { ...base.labSettings };
  p.labNotes = { ...base.labNotes };
  for (const t of topicList) {
    p.labSettings[t] = normalizeSettings(t, ls[t]);
    p.labNotes[t] = str(ln[t]);
  }
  p.designTopic = (oneOf(r.designTopic, [...topicList, ''] as const, '') || null) as DesignTopic | null;
  p.beforeDesign = p.designTopic && r.beforeDesign ? normalizeSettings(p.designTopic, r.beforeDesign) : null;
  p.afterDesign = p.designTopic && r.afterDesign ? normalizeSettings(p.designTopic, r.afterDesign) : null;
  p.changeSummary = strList(r.changeSummary) ?? [];

  const cn = (r.comparisonNotes ?? {}) as Record<string, unknown>;
  p.comparisonNotes = {
    whatChanged: str(cn.whatChanged),
    whoBenefits: str(cn.whoBenefits),
    usabilityReason: str(cn.usabilityReason),
    emotionalImpression: str(cn.emotionalImpression),
    unverifiedPoints: str(cn.unverifiedPoints),
    evidence: (oneOf(cn.evidence, ['preview_comparison', 'peer_opinion', 'prediction', ''] as const, '') || null) as Project12['comparisonNotes']['evidence'],
  };
  p.comparisonRecordedAt = typeof r.comparisonRecordedAt === 'string' ? r.comparisonRecordedAt.slice(0, 40) : null;
  const ob = (r.observation ?? {}) as Record<string, unknown>;
  const eases = ['easy', 'bit_hard', 'hard', 'not_tried'] as const;
  p.observation = { before: oneOf(ob.before, eases, 'not_tried'), after: oneOf(ob.after, eases, 'not_tried'), note: str(ob.note) };

  p.affectedUsersAndSituations = strList(r.affectedUsersAndSituations) ?? [];
  const pp = (r.problemParts ?? {}) as Record<string, unknown>;
  p.problemParts = { object: str(pp.object, '', 200), difficulty: str(pp.difficulty, '', 500), goal: str(pp.goal, '', 500) };
  if (Array.isArray(r.ideas)) {
    p.ideas = r.ideas.slice(0, 8).map((x) => {
      const i = (x ?? {}) as Record<string, unknown>;
      return {
        id: typeof i.id === 'string' ? i.id.slice(0, 80) : makeId('idea'),
        title: str(i.title, '', 200),
        newFunction: str(i.newFunction),
        usabilityFeatures: str(i.usabilityFeatures),
        emotionalFeatures: str(i.emotionalFeatures),
        feasibility: str(i.feasibility),
      };
    });
    if (p.ideas.length === 0) p.ideas = [newIdea()];
  }
  p.selectedIdeaId =
    typeof r.selectedIdeaId === 'string' && p.ideas.some((i) => i.id === r.selectedIdeaId) ? r.selectedIdeaId : null;

  p.coreFunctions = strList(r.coreFunctions, 3) ?? base.coreFunctions;
  if (p.coreFunctions.length === 0) p.coreFunctions = [''];
  p.usageSteps = strList(r.usageSteps, 12) ?? base.usageSteps;
  if (p.usageSteps.length === 0) p.usageSteps = [''];
  p.materials = strList(r.materials, 40) ?? [];
  p.sketchDataUrl = image(r.sketchDataUrl);
  p.photoDataUrl = image(r.photoDataUrl);

  p.buildStatus = oneOf(r.buildStatus, ['not_started', 'in_progress', 'completed'] as const, 'not_started');
  const bc = (r.buildChecklist ?? {}) as Record<string, unknown>;
  p.buildChecklist = Object.fromEntries(
    buildChecklist.map((c) => [c.id, oneOf(bc[c.id], ['yes', 'needs', 'not_checked'] as const, 'not_checked')]),
  );

  p.evaluationMethod = (oneOf(r.evaluationMethod, ['self_test', 'peer_test', 'not_tested', ''] as const, '') ||
    null) as Project12['evaluationMethod'];
  const evs = Array.isArray(r.evaluations) ? (r.evaluations as Record<string, unknown>[]) : [];
  p.evaluations = usabilityCriteria.map((c): Evaluation => {
    const e = evs.find((x) => x && x.criterionId === c.id) ?? {};
    return {
      criterionId: c.id,
      outcome: oneOf(e.outcome, ['good', 'needs_improvement', 'not_checked'] as const, 'not_checked'),
      reason: str(e.reason),
    };
  });
  return p;
}

/* ------------------------------------------------------------------ */
/* localStorage: 글과 선택값                                            */
/* ------------------------------------------------------------------ */

export class StorageError extends Error {
  constructor(message: string, public readonly quota = false) {
    super(message);
  }
}

function isQuotaError(e: unknown) {
  return e instanceof DOMException && (e.name === 'QuotaExceededError' || e.code === 22 || e.code === 1014);
}

function readIndex(): ProjectMeta[] {
  try {
    const raw = localStorage.getItem(INDEX_KEY);
    const list = raw ? JSON.parse(raw) : [];
    return Array.isArray(list) ? list.filter((m) => m && typeof m.id === 'string') : [];
  } catch {
    return [];
  }
}

export function listProjects(): ProjectMeta[] {
  return readIndex().sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1));
}

export function getCurrentProjectId(): string | null {
  try {
    return localStorage.getItem(CURRENT_KEY);
  } catch {
    return null;
  }
}

export function setCurrentProjectId(id: string | null) {
  try {
    if (id) localStorage.setItem(CURRENT_KEY, id);
    else localStorage.removeItem(CURRENT_KEY);
  } catch {
    /* 무시: 다음 저장 때 다시 시도 */
  }
}

/** 그림 데이터를 뺀 프로젝트를 저장한다. 실패하면 StorageError를 던진다. */
export function saveProjectText(p: Project12) {
  const slim: Record<string, unknown> = { ...p };
  for (const k of MEDIA_KEYS) slim[k] = null;
  try {
    localStorage.setItem(projectKey(p.id), JSON.stringify(slim));
    const index = readIndex().filter((m) => m.id !== p.id);
    index.push({ id: p.id, title: projectTitle(p), nickname: p.nickname, updatedAt: p.updatedAt, currentStep: p.currentStep });
    localStorage.setItem(INDEX_KEY, JSON.stringify(index));
    localStorage.setItem(CURRENT_KEY, p.id);
  } catch (e) {
    if (isQuotaError(e)) throw new StorageError('저장 공간이 부족해요. 활동 파일로 내보낸 뒤 오래된 활동을 지워 주세요.', true);
    throw new StorageError('저장이 되지 않았어요. 파일로 내보내세요.');
  }
}

export function loadProjectText(id: string): Project12 | null {
  try {
    const raw = localStorage.getItem(projectKey(id));
    if (!raw) return null;
    return sanitizeProject(JSON.parse(raw));
  } catch {
    return null;
  }
}

export function deleteProject(id: string) {
  try {
    localStorage.removeItem(projectKey(id));
    localStorage.setItem(INDEX_KEY, JSON.stringify(readIndex().filter((m) => m.id !== id)));
    if (getCurrentProjectId() === id) setCurrentProjectId(null);
  } catch {
    /* 무시 */
  }
  void deleteMedia(id);
}

/* ------------------------------------------------------------------ */
/* IndexedDB: 설계도·사진처럼 큰 그림 데이터                             */
/* ------------------------------------------------------------------ */

const DB_NAME = 'ud12-media';
const STORE = 'media';

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') return reject(new Error('IndexedDB 없음'));
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => req.result.createObjectStore(STORE);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function tx<T>(mode: IDBTransactionMode, fn: (s: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const t = db.transaction(STORE, mode);
    const req = fn(t.objectStore(STORE));
    t.oncomplete = () => {
      db.close();
      resolve(req.result);
    };
    t.onerror = () => {
      db.close();
      reject(t.error);
    };
    t.onabort = () => {
      db.close();
      reject(t.error);
    };
  });
}

export async function saveMedia(projectId: string, key: MediaKey, dataUrl: string | null) {
  const id = `${projectId}:${key}`;
  try {
    if (dataUrl) await tx('readwrite', (s) => s.put(dataUrl, id));
    else await tx('readwrite', (s) => s.delete(id));
  } catch (e) {
    const quota = e instanceof DOMException && e.name === 'QuotaExceededError';
    throw new StorageError(
      quota ? '그림을 저장할 공간이 부족해요. 활동 파일로 내보내 주세요.' : '그림이 저장되지 않았어요. 활동 파일로 내보내 주세요.',
      quota,
    );
  }
}

export async function loadMedia(projectId: string): Promise<Partial<Record<MediaKey, string | null>>> {
  const out: Partial<Record<MediaKey, string | null>> = {};
  for (const k of MEDIA_KEYS) {
    try {
      const v = await tx<unknown>('readonly', (s) => s.get(`${projectId}:${k}`));
      out[k] = image(v);
    } catch {
      out[k] = null;
    }
  }
  return out;
}

async function deleteMedia(projectId: string) {
  for (const k of MEDIA_KEYS) {
    try {
      await tx('readwrite', (s) => s.delete(`${projectId}:${k}`));
    } catch {
      /* 무시 */
    }
  }
}

/* ------------------------------------------------------------------ */
/* JSON 파일 내보내기·가져오기                                           */
/* ------------------------------------------------------------------ */

export function exportProjectFile(p: Project12) {
  const blob = new Blob([JSON.stringify(p, null, 2)], { type: 'application/json' });
  const date = new Date().toISOString().slice(0, 10);
  const name = `모두의디자인_${(p.nickname || projectTitle(p)).replace(/[\\/:*?"<>|\s]+/g, '_').slice(0, 30)}_${date}.json`;
  downloadBlob(blob, name);
}

export function downloadBlob(blob: Blob, name: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

export async function parseProjectFile(file: File): Promise<Project12> {
  if (file.size > 20 * 1024 * 1024) throw new Error('파일이 너무 커요(20MB 초과). 이 앱에서 저장한 활동 파일인지 확인해 주세요.');
  let data: unknown;
  try {
    data = JSON.parse(await file.text());
  } catch {
    throw new Error('파일을 읽을 수 없어요. 이 앱에서 저장한 .json 활동 파일인지 확인해 주세요.');
  }
  if (!data || typeof data !== 'object') throw new Error('활동 파일의 내용이 올바르지 않아요.');
  const d = data as Record<string, unknown>;
  if (d.app !== 'universal-design-lab-12') {
    throw new Error('「모두의 디자인 실험실」에서 저장한 파일이 아니에요. 다른 앱의 파일일 수 있어요.');
  }
  if (d.schemaVersion !== 1) {
    throw new Error(`이 파일은 다른 버전(${String(d.schemaVersion)})으로 저장되어 열 수 없어요. 선생님께 알려 주세요.`);
  }
  if (typeof d.id !== 'string') throw new Error('활동 파일이 손상되었어요(프로젝트 번호 없음).');
  return sanitizeProject(d);
}
