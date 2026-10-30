import { newNotebook, validateNotebook, type Notebook } from './model';

const KEY = 'nature13-notebook-v1';

/* ─────────────── 글·선택값: localStorage ─────────────── */

export function canUseLocalStorage() {
  try {
    const k = '__nature13_test';
    localStorage.setItem(k, '1');
    localStorage.removeItem(k);
    return true;
  } catch {
    return false;
  }
}

export function loadNotebook(): Notebook | null {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    return validateNotebook(JSON.parse(raw));
  } catch {
    return null;
  }
}

export function saveNotebook(nb: Notebook): boolean {
  try {
    localStorage.setItem(KEY, JSON.stringify({ ...nb, savedAt: new Date().toISOString() }));
    return true;
  } catch {
    return false;
  }
}

export function clearNotebook() {
  try {
    localStorage.removeItem(KEY);
  } catch {
    /* 저장소를 쓸 수 없으면 지울 것도 없다 */
  }
}

/* ─────────────── 그림 선·사진: IndexedDB ─────────────── */

const DB_NAME = 'nature13-blobs';
const STORE = 'blobs';
const memory = new Map<string, unknown>(); // IndexedDB를 쓸 수 없을 때의 임시 보관

let dbPromise: Promise<IDBDatabase | null> | null = null;
function db(): Promise<IDBDatabase | null> {
  if (!dbPromise) {
    dbPromise = new Promise((resolve) => {
      try {
        const req = indexedDB.open(DB_NAME, 1);
        req.onupgradeneeded = () => req.result.createObjectStore(STORE);
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => resolve(null);
      } catch {
        resolve(null);
      }
    });
  }
  return dbPromise;
}

export async function putBlob(key: string, value: unknown): Promise<boolean> {
  const d = await db();
  if (!d) {
    memory.set(key, value);
    return false;
  }
  return new Promise((resolve) => {
    try {
      const tx = d.transaction(STORE, 'readwrite');
      tx.objectStore(STORE).put(value, key);
      tx.oncomplete = () => resolve(true);
      tx.onerror = () => {
        memory.set(key, value);
        resolve(false);
      };
    } catch {
      memory.set(key, value);
      resolve(false);
    }
  });
}

export async function getBlob<T>(key: string): Promise<T | undefined> {
  if (memory.has(key)) return memory.get(key) as T;
  const d = await db();
  if (!d) return undefined;
  return new Promise((resolve) => {
    try {
      const req = d.transaction(STORE, 'readonly').objectStore(STORE).get(key);
      req.onsuccess = () => resolve(req.result as T | undefined);
      req.onerror = () => resolve(undefined);
    } catch {
      resolve(undefined);
    }
  });
}

export async function deleteBlob(key: string) {
  memory.delete(key);
  const d = await db();
  if (!d) return;
  try {
    d.transaction(STORE, 'readwrite').objectStore(STORE).delete(key);
  } catch {
    /* 무시 */
  }
}

export async function clearBlobs() {
  memory.clear();
  const d = await db();
  if (!d) return;
  await new Promise<void>((resolve) => {
    try {
      const tx = d.transaction(STORE, 'readwrite');
      tx.objectStore(STORE).clear();
      tx.oncomplete = () => resolve();
      tx.onerror = () => resolve();
    } catch {
      resolve();
    }
  });
}

/* ─────────────── 사진 첨부: 형식·크기 검사 + 다시 그려서 위치 정보(EXIF) 제거 ─────────────── */

export const MAX_PHOTO_BYTES = 15 * 1024 * 1024;

export async function processPhoto(file: File): Promise<Blob> {
  if (!/^image\/(png|jpe?g|webp|gif)$/.test(file.type)) throw new Error('사진 파일(JPG, PNG, WEBP)만 넣을 수 있어요.');
  if (file.size > MAX_PHOTO_BYTES) throw new Error('사진이 너무 커요(15MB 이하).');
  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const i = new Image();
      i.onload = () => resolve(i);
      i.onerror = () => reject(new Error('사진을 열 수 없어요.'));
      i.src = url;
    });
    const max = 1400;
    const scale = Math.min(1, max / Math.max(img.naturalWidth, img.naturalHeight));
    const c = document.createElement('canvas');
    c.width = Math.round(img.naturalWidth * scale);
    c.height = Math.round(img.naturalHeight * scale);
    const ctx = c.getContext('2d');
    if (!ctx) throw new Error('사진을 처리할 수 없어요.');
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, c.width, c.height);
    ctx.drawImage(img, 0, 0, c.width, c.height);
    // 캔버스로 다시 그리면 촬영 위치 등 메타데이터가 남지 않는다.
    return await new Promise<Blob>((resolve, reject) => c.toBlob((b) => (b ? resolve(b) : reject(new Error('사진을 저장할 수 없어요.'))), 'image/jpeg', 0.85));
  } finally {
    URL.revokeObjectURL(url);
  }
}

/* ─────────────── JSON 내보내기/가져오기 ─────────────── */

type ExportFile = { app: 'nature-invention-lab'; schemaVersion: 1; exportedAt: string; notebook: Notebook; blobs: Record<string, unknown> };

const blobToDataUrl = (b: Blob) =>
  new Promise<string>((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result as string);
    r.onerror = () => reject(r.error);
    r.readAsDataURL(b);
  });

export function blobKeys(nb: Notebook): string[] {
  const keys: string[] = [];
  for (const o of Object.values(nb.observations)) if (o.photoId) keys.push(o.photoId);
  for (const s of Object.values(nb.sketches)) {
    if (s.hasDrawing) keys.push(`draw:${s.combinationId}`);
    if (s.photoId) keys.push(s.photoId);
  }
  return keys;
}

export async function exportNotebook(nb: Notebook) {
  const blobs: Record<string, unknown> = {};
  for (const k of blobKeys(nb)) {
    const v = await getBlob<unknown>(k);
    if (v === undefined) continue;
    blobs[k] = v instanceof Blob ? { dataUrl: await blobToDataUrl(v) } : v;
  }
  const file: ExportFile = { app: 'nature-invention-lab', schemaVersion: 1, exportedAt: new Date().toISOString(), notebook: nb, blobs };
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([JSON.stringify(file)], { type: 'application/json' }));
  const name = (nb.nickname || '탐험수첩').replace(/[\\/:*?"<>|]/g, '');
  a.download = `${name}-자연탐험수첩-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}

/** 검사에 통과해야만 값을 돌려준다. 실패하면 기존 자료는 그대로다. */
export async function parseImport(file: File): Promise<{ notebook: Notebook; blobs: Record<string, unknown> }> {
  if (file.size > 60 * 1024 * 1024) throw new Error('파일이 너무 커요.');
  let data: unknown;
  try {
    data = JSON.parse(await file.text());
  } catch {
    throw new Error('JSON 파일을 읽을 수 없어요.');
  }
  const d = data as Partial<ExportFile>;
  if (!d || d.app !== 'nature-invention-lab' || d.schemaVersion !== 1) throw new Error('「자연 모방 발명 연구소」에서 내보낸 파일이 아니에요.');
  const notebook = validateNotebook(d.notebook);
  if (!notebook) throw new Error('수첩 내용이 올바르지 않아요.');
  const blobs: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(d.blobs ?? {})) {
    if (k.startsWith('draw:') && Array.isArray(v)) blobs[k] = v;
    else if (v && typeof v === 'object' && typeof (v as { dataUrl?: unknown }).dataUrl === 'string') {
      const url = (v as { dataUrl: string }).dataUrl;
      if (!/^data:image\/(png|jpe?g|webp|gif);base64,/.test(url)) continue;
      blobs[k] = await (await fetch(url)).blob();
    }
  }
  return { notebook, blobs };
}

export async function applyImport(data: { notebook: Notebook; blobs: Record<string, unknown> }) {
  await clearBlobs();
  for (const [k, v] of Object.entries(data.blobs)) await putBlob(k, v);
  saveNotebook(data.notebook);
}

export { newNotebook };
