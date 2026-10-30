import { useLayoutEffect, useRef, useState } from 'react';
import { caseById, matchingCases, type BioMimicryCase } from '../data/biomimicryCases';
import { natureById } from '../data/natureItems';
import { CaseIllustration } from './CaseMuseum';
import { LinedField, NatureArt, Note, PageHead, useApp } from './ui';

// 오른쪽 스크랩은 왼쪽과 순서를 다르게 섞어 둔다(무작위가 아니라 늘 같은 순서).
const NATURE_ORDER = ['n04', 'n03', 'n05', 'n01'];
const CASE_ORDER = ['case-honeycomb-panel', 'case-pinecone-humidity', 'case-burdock-hook-loop', 'case-lotus-water-repellent'];
const LETTERS = ['가', '나', '다', '라'];

type Line = { d: string; ok: boolean; key: string };

/** 탐구 04: 자연 표본 서랍 ↔ 생활 속 발명 스크랩. 두 항목을 차례로 누르면 연결된다(드래그 불필요). */
export function CaseMatching() {
  const { nb, update, toast } = useApp();
  const [picked, setPicked] = useState<string>(''); // 고른 자연물 id
  const [focusNature, setFocusNature] = useState<string>('n04');
  const wrap = useRef<HTMLDivElement>(null);
  const [lines, setLines] = useState<Line[]>([]);
  const cases = CASE_ORDER.map((id) => caseById(id)!).filter(Boolean);

  const caseLetter = (caseId: string) => LETTERS[CASE_ORDER.indexOf(caseId)];
  const natureFor = (caseId: string) => Object.entries(nb.matches).find(([, c]) => c === caseId)?.[0];

  const connect = (natureId: string, caseId: string) => {
    update((d) => {
      // 한 사례에는 하나의 자연물만 연결한다.
      for (const [n, c] of Object.entries(d.matches)) if (c === caseId && n !== natureId) delete d.matches[n];
      d.matches[natureId] = caseId;
    });
    setFocusNature(natureId);
    setPicked('');
  };

  // 넓은 화면에서는 손그림 느낌의 연결선을 그린다(기능은 버튼만으로도 충분).
  useLayoutEffect(() => {
    const el = wrap.current;
    if (!el) return;
    const draw = () => {
      const box = el.getBoundingClientRect();
      const out: Line[] = [];
      for (const [n, c] of Object.entries(nb.matches)) {
        const a = el.querySelector<HTMLElement>(`[data-nature="${n}"]`);
        const b = el.querySelector<HTMLElement>(`[data-case="${c}"]`);
        if (!a || !b) continue;
        const ra = a.getBoundingClientRect();
        const rb = b.getBoundingClientRect();
        const x1 = ra.right - box.left;
        const y1 = ra.top + ra.height / 2 - box.top;
        const x2 = rb.left - box.left;
        const y2 = rb.top + rb.height / 2 - box.top;
        if (x2 < x1) continue; // 세로로 쌓인 좁은 화면
        const mx = (x1 + x2) / 2;
        out.push({ key: n, ok: caseById(c)?.natureId === n, d: `M${x1} ${y1} C${mx} ${y1 + 8} ${mx} ${y2 - 8} ${x2} ${y2}` });
      }
      setLines(out);
    };
    draw();
    const ro = new ResizeObserver(draw);
    ro.observe(el);
    return () => ro.disconnect();
  }, [nb.matches]);

  const focus = natureById(focusNature);
  const focusCase = caseById(nb.matches[focusNature]);
  const correct = focusCase && focusCase.natureId === focusNature;
  const trueCase = matchingCases.find((c) => c.natureId === focusNature);
  const doneCount = Object.keys(nb.matches).filter((n) => NATURE_ORDER.includes(n)).length;

  return (
    <div>
      <PageHead
        code="탐구 04"
        title="자연을 따라 만든 물건 찾기"
        lead="왼쪽 자연 표본을 누른 다음, 닮았다고 생각하는 오른쪽 스크랩을 누르세요. 점수나 순위는 없어요. 다르게 연결해도 다시 해 볼 수 있어요."
      />
      <p className="sr-status" aria-live="polite">
        {picked ? `${natureById(picked)?.name}을(를) 골랐어요. 이제 오른쪽에서 닮은 사례를 고르세요.` : `${doneCount}개 연결했어요.`}
      </p>

      <div className="match-board" ref={wrap}>
        <svg className="match-lines" aria-hidden="true">
          {lines.map((l) => (
            <path key={l.key} d={l.d} className={l.ok ? 'line-ok' : 'line-diff'} />
          ))}
        </svg>
        <section className="drawer" aria-labelledby="drawer-h">
          <h2 id="drawer-h" className="drawer-title">자연 표본 서랍</h2>
          {NATURE_ORDER.map((id) => {
            const n = natureById(id)!;
            const linked = nb.matches[id];
            return (
              <button
                key={id}
                type="button"
                data-nature={id}
                className={`drawer-item ${picked === id ? 'is-picked' : ''}`}
                aria-pressed={picked === id}
                onClick={() => {
                  setFocusNature(id);
                  setPicked(picked === id ? '' : id);
                }}
              >
                <NatureArt item={n} size={56} decorative />
                <span className="di-name">{n.name}</span>
                <span className="di-link">{linked ? `→ ${caseLetter(linked)} 스크랩과 연결` : picked === id ? '고름: 오른쪽에서 짝을 고르세요' : '아직 연결 전'}</span>
              </button>
            );
          })}
        </section>

        <section className="scraps" aria-labelledby="scrap-h">
          <h2 id="scrap-h" className="scrap-title">생활 속 발명 사례 스크랩</h2>
          {cases.map((c, i) => {
            const n = natureFor(c.id);
            return (
              <button
                key={c.id}
                type="button"
                data-case={c.id}
                className="scrap-item"
                onClick={() => (picked ? connect(picked, c.id) : n ? setFocusNature(n) : toast('먼저 왼쪽에서 자연 표본을 골라 주세요.'))}
              >
                <span className="scrap-letter">{LETTERS[i]}</span>
                <CaseIllustration c={c} small />
                <span className="scrap-name">{c.applicationName}</span>
                <span className="di-link">{n ? `← ${natureById(n)?.name}와(과) 연결` : ''}</span>
              </button>
            );
          })}
        </section>
      </div>

      {focus && (
        <section className="match-feedback paper" aria-live="polite" aria-labelledby="fb-h">
          <h2 id="fb-h" className="half-title">
            {focus.name} {focusCase ? `↔ ${focusCase.applicationName}` : ''}
          </h2>
          {!focusCase && <p>아직 연결하지 않았어요. 위에서 {focus.name}을(를) 누른 뒤 닮은 사례를 골라 보세요.</p>}
          {focusCase && correct && <CaseBreakdown c={focusCase} />}
          {focusCase && !correct && (
            <>
              <p className="verdict verdict-diff">
                <span aria-hidden="true">◇</span> 실제 알려진 사례와는 다르게 연결했어요.
              </p>
              <p>재미있는 연결이에요! 그렇게 생각한 이유를 써 보세요. 실제 사례와는 구별해서 수첩에 남겨 둘게요.</p>
              {trueCase && <Note tone="amber">힌트: {trueCase.hint}</Note>}
            </>
          )}
          {focusCase && (
            <LinedField
              label={correct ? '어떤 점이 닮았을까요?' : '그렇게 생각한 이유'}
              value={nb.matchReasons[focusNature] ?? ''}
              onChange={(v) =>
                update((d) => {
                  d.matchReasons[focusNature] = v;
                })
              }
            />
          )}
          <div className="btn-row">
            {focusCase && (
              <button
                type="button"
                className="btn"
                onClick={() => {
                  update((d) => {
                    delete d.matches[focusNature];
                  });
                  setPicked(focusNature);
                }}
              >
                다시 연결하기
              </button>
            )}
            {focusCase && correct && <PinButton caseId={focusCase.id} />}
          </div>
        </section>
      )}
    </div>
  );
}

export function CaseBreakdown({ c }: { c: BioMimicryCase }) {
  return (
    <>
      <p className="verdict verdict-ok">
        <span aria-hidden="true">✓</span> 실제로 알려진 응용 사례와 같아요.
      </p>
      <p>{c.explanation}</p>
      <dl className="three-part">
        <div>
          <dt>자연의 특징</dt>
          <dd>{c.naturalFeature}</dd>
        </div>
        <div>
          <dt>생활 속 응용</dt>
          <dd>{c.application}</dd>
        </div>
        <div>
          <dt>공통된 원리</dt>
          <dd>{c.connection}</dd>
        </div>
      </dl>
      <p className="field-hint">⚠ {c.caution}</p>
    </>
  );
}

export function PinButton({ caseId }: { caseId: string }) {
  const { nb, update, toast } = useApp();
  const pinned = nb.savedCaseIds.includes(caseId);
  return (
    <button
      type="button"
      className={pinned ? 'btn' : 'btn-primary'}
      aria-pressed={pinned}
      onClick={() => {
        update((d) => {
          d.savedCaseIds = pinned ? d.savedCaseIds.filter((x) => x !== caseId) : [...d.savedCaseIds, caseId];
        });
        toast(pinned ? '수첩에서 떼어 냈어요.' : '마음에 든 사례를 탐구 수첩에 붙였어요.');
      }}
    >
      {pinned ? '📌 수첩에 붙였어요 (떼기)' : '📌 탐구 수첩에 붙이기'}
    </button>
  );
}
