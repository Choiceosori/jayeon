import { createContext, useContext, useEffect, useId, useState, type ReactNode } from 'react';
import type { Notebook } from '../storage/model';
import { getBlob } from '../storage/storage';
import type { NatureItem } from '../data/natureItems';

export type PageId = 'cover' | 'contents' | 'atlas' | 'observe' | 'ability' | 'match' | 'museum' | 'combine' | 'sketch' | 'notebook';

export type AppCtx = {
  nb: Notebook;
  update: (fn: (draft: Notebook) => void) => void;
  go: (id: PageId) => void;
  toast: (msg: string) => void;
  openTeacher: () => void;
};

export const Ctx = createContext<AppCtx | null>(null);
export function useApp() {
  const c = useContext(Ctx);
  if (!c) throw new Error('AppCtx missing');
  return c;
}

/** 쪽 머리: 도감의 장 번호 + 제목 + 공부할 질문 */
export function PageHead({ code, title, lead, children }: { code: string; title: string; lead?: string; children?: ReactNode }) {
  return (
    <header className="page-head">
      <p className="chapter-code">{code}</p>
      <h1 className="page-title" tabIndex={-1}>{title}</h1>
      {lead && <p className="page-lead">{lead}</p>}
      {children}
    </header>
  );
}

/** 공책 줄 모양의 실제 textarea */
export function LinedField({
  label,
  value,
  onChange,
  placeholder,
  rows = 3,
  hint,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  rows?: number;
  hint?: string;
}) {
  const id = useId();
  return (
    <div className="lined-field">
      <label htmlFor={id}>{label}</label>
      {hint && <p className="field-hint" id={`${id}-h`}>{hint}</p>}
      <textarea
        id={id}
        rows={rows}
        value={value}
        placeholder={placeholder}
        aria-describedby={hint ? `${id}-h` : undefined}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}

export function Note({ children, tone = 'moss' }: { children: ReactNode; tone?: 'moss' | 'amber' | 'paper' }) {
  return <div className={`note note-${tone}`}>{children}</div>;
}

/** 자연물 삽화 — 정보 전달용 대체 텍스트 포함 */
export function NatureArt({ item, size, decorative }: { item: NatureItem; size?: number; decorative?: boolean }) {
  const { Illustration } = item;
  return (
    <svg
      viewBox="0 0 200 200"
      width={size}
      height={size}
      className="nature-art"
      role={decorative ? undefined : 'img'}
      aria-hidden={decorative || undefined}
      aria-label={decorative ? undefined : item.alt}
    >
      <Illustration />
    </svg>
  );
}

export function EmptyText({ children = '아직 기록하지 않았어요' }: { children?: ReactNode }) {
  return <span className="empty-text">{children}</span>;
}

export function Text({ v }: { v: string | undefined }) {
  return v && v.trim() ? <span className="pre">{v}</span> : <EmptyText />;
}

/** IndexedDB에 저장된 Blob을 화면에 보여 줄 수 있는 URL로 바꾼다. */
export function useBlobUrl(key: string | undefined) {
  const [url, setUrl] = useState<string>('');
  useEffect(() => {
    let alive = true;
    let made = '';
    setUrl('');
    if (!key) return;
    getBlob<Blob>(key).then((b) => {
      if (!alive || !(b instanceof Blob)) return;
      made = URL.createObjectURL(b);
      setUrl(made);
    });
    return () => {
      alive = false;
      if (made) URL.revokeObjectURL(made);
    };
  }, [key]);
  return url;
}

export function BlobImage({ blobKey, alt, className }: { blobKey: string | undefined; alt: string; className?: string }) {
  const url = useBlobUrl(blobKey);
  if (!blobKey) return null;
  if (!url) return <span className="empty-text">(사진을 불러오는 중이거나 찾을 수 없어요)</span>;
  return <img src={url} alt={alt} className={className} />;
}

export function useMedia(query: string) {
  const [m, setM] = useState(() => (typeof matchMedia === 'function' ? matchMedia(query).matches : false));
  useEffect(() => {
    if (typeof matchMedia !== 'function') return;
    const mq = matchMedia(query);
    const on = () => setM(mq.matches);
    mq.addEventListener('change', on);
    on();
    return () => mq.removeEventListener('change', on);
  }, [query]);
  return m;
}

export function LeafSprig({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 24" className={`sprig ${className ?? ''}`} aria-hidden="true">
      <path d="M2 12 H118" stroke="currentColor" strokeWidth="1.2" />
      {[18, 40, 62, 84, 104].map((x, i) => (
        <path key={x} d={`M${x} 12 q6 ${i % 2 ? 9 : -9} 14 ${i % 2 ? 2 : -2} q-8 -1 -14 -2z`} fill="currentColor" opacity="0.8" />
      ))}
    </svg>
  );
}
