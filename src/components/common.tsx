import { useId, type ReactNode } from 'react';

interface FieldProps {
  label: ReactNode;
  value: string;
  onChange: (v: string) => void;
  hint?: ReactNode;
  placeholder?: string;
  multiline?: boolean;
  rows?: number;
  maxLength?: number;
  optional?: boolean;
}

export function Field({ label, value, onChange, hint, placeholder, multiline, rows = 3, maxLength = 2000, optional }: FieldProps) {
  const id = useId();
  const hintId = `${id}-hint`;
  return (
    <div className="field">
      <label htmlFor={id}>
        {label}
        {optional && <span className="optional"> (선택)</span>}
      </label>
      {hint && (
        <p className="hint" id={hintId}>
          {hint}
        </p>
      )}
      {multiline ? (
        <textarea
          id={id}
          value={value}
          rows={rows}
          maxLength={maxLength}
          placeholder={placeholder}
          aria-describedby={hint ? hintId : undefined}
          onChange={(e) => onChange(e.target.value)}
        />
      ) : (
        <input
          id={id}
          type="text"
          value={value}
          maxLength={Math.min(maxLength, 200)}
          placeholder={placeholder}
          aria-describedby={hint ? hintId : undefined}
          onChange={(e) => onChange(e.target.value)}
        />
      )}
    </div>
  );
}

interface ChoiceProps<T extends string> {
  legend: ReactNode;
  name: string;
  value: T | null;
  options: { value: T; label: ReactNode; desc?: string }[];
  onChange: (v: T) => void;
  hint?: ReactNode;
  columns?: boolean;
}

export function ChoiceGroup<T extends string>({ legend, name, value, options, onChange, hint, columns }: ChoiceProps<T>) {
  const base = useId();
  return (
    <fieldset className="control-group">
      <legend>{legend}</legend>
      {hint && <p className="hint">{hint}</p>}
      <div className={columns ? 'chip-col' : 'chip-row'}>
        {options.map((o) => {
          const id = `${base}-${o.value}`;
          return (
            <label key={o.value} htmlFor={id} className={`chip${value === o.value ? ' checked' : ''}`}>
              <input id={id} type="radio" name={`${name}-${base}`} checked={value === o.value} onChange={() => onChange(o.value)} />
              <span>
                {o.label}
                {o.desc && <small className="chip-desc">{o.desc}</small>}
              </span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}

interface ListEditorProps {
  label: ReactNode;
  items: string[];
  onChange: (items: string[]) => void;
  max?: number;
  itemLabel: (i: number) => string;
  placeholder?: string;
  hint?: ReactNode;
  numbered?: boolean;
}

/** 여러 줄 항목(기능, 사용 순서 등)을 추가·삭제·순서 변경하는 입력 */
export function ListEditor({ label, items, onChange, max = 10, itemLabel, placeholder, hint, numbered }: ListEditorProps) {
  const base = useId();
  const set = (i: number, v: string) => onChange(items.map((x, j) => (j === i ? v : x)));
  const remove = (i: number) => onChange(items.length <= 1 ? [''] : items.filter((_, j) => j !== i));
  const move = (i: number, d: number) => {
    const j = i + d;
    if (j < 0 || j >= items.length) return;
    const next = [...items];
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next);
  };
  return (
    <fieldset className="control-group list-editor">
      <legend>{label}</legend>
      {hint && <p className="hint">{hint}</p>}
      <ol className={numbered ? 'numbered' : 'plain'}>
        {items.map((v, i) => (
          <li key={i}>
            <label htmlFor={`${base}-${i}`} className="sr-only">
              {itemLabel(i)}
            </label>
            <input id={`${base}-${i}`} type="text" value={v} maxLength={200} placeholder={placeholder} onChange={(e) => set(i, e.target.value)} />
            {numbered && (
              <>
                <button type="button" className="icon-btn" onClick={() => move(i, -1)} disabled={i === 0} aria-label={`${itemLabel(i)} 위로`}>
                  ▲
                </button>
                <button type="button" className="icon-btn" onClick={() => move(i, 1)} disabled={i === items.length - 1} aria-label={`${itemLabel(i)} 아래로`}>
                  ▼
                </button>
              </>
            )}
            <button type="button" className="icon-btn" onClick={() => remove(i)} aria-label={`${itemLabel(i)} 지우기`}>
              ✕
            </button>
          </li>
        ))}
      </ol>
      {items.length < max && (
        <button type="button" className="btn ghost small" onClick={() => onChange([...items, ''])}>
          + 항목 추가
        </button>
      )}
    </fieldset>
  );
}

export function Notice({ kind = 'info', children }: { kind?: 'info' | 'warn' | 'tip'; children: ReactNode }) {
  const icon = kind === 'warn' ? '⚠️' : kind === 'tip' ? '💡' : 'ℹ️';
  return (
    <div className={`notice ${kind}`} role={kind === 'warn' ? 'note' : undefined}>
      <span aria-hidden="true">{icon}</span>
      <div>{children}</div>
    </div>
  );
}

export function Card({ title, children, className = '' }: { title?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <section className={`card ${className}`}>
      {title && <h3 className="card-title">{title}</h3>}
      {children}
    </section>
  );
}

export const isBlank = (v: string | null | undefined) => !v || !v.trim();
