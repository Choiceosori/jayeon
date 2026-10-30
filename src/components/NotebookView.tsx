import { useEffect, useState, type ReactNode } from 'react';
import { caseById, matchingCases } from '../data/biomimicryCases';
import { householdObjects, objectById } from '../data/householdObjects';
import { natureById, natureItems } from '../data/natureItems';
import { hasObservationText, hasSketchContent, type Combination, type Notebook } from '../storage/model';
import { exportNotebook } from '../storage/storage';
import { comboTitle, ObjectArt } from './CombinationDesk';
import { SOURCE_LABEL } from './NatureAtlas';
import { StrokeImage } from './SketchCanvas';
import { BlobImage, EmptyText, LinedField, NatureArt, Note, PageHead, Text, useApp, useMedia } from './ui';

export const REPORT_TITLE = '자연의 비밀을 발견한 나의 탐험 수첩';

/* ───────────────────────── 화면·인쇄가 함께 쓰는 기록 블록 ───────────────────────── */

function ObsBlock({ nb, natureId }: { nb: Notebook; natureId: string }) {
  const n = natureById(natureId)!;
  const o = nb.observations[natureId];
  return (
    <section className="rec-block avoid-break">
      <h3 className="rec-title">
        <NatureArt item={n} size={44} decorative /> {n.code} {n.name}
      </h3>
      <p className="rec-source">관찰 방법: {o?.source.length ? o.source.map((s) => SOURCE_LABEL[s]).join(', ') : <EmptyText>고르지 않았어요</EmptyText>}</p>
      <dl className="rec-dl">
        <dt>보이는 모양</dt>
        <dd><Text v={o?.shape} /></dd>
        <dt>표면 · 무늬</dt>
        <dd><Text v={o?.texture} /></dd>
        <dt>특별한 점</dt>
        <dd><Text v={o?.noticeableFeature} /></dd>
        <dt>궁금한 점</dt>
        <dd><Text v={o?.curiosity} /></dd>
      </dl>
      {(o?.confirmedFact || o?.hypothesis || o?.learned) && (
        <dl className="rec-dl evidence-print">
          <dt>① 확인한 내용 (보았어요)</dt>
          <dd><Text v={o?.confirmedFact} /></dd>
          <dt>② 나의 예상 (이렇게 생각해요)</dt>
          <dd><Text v={o?.hypothesis} /></dd>
          <dt>③ 새로 안 것 (설명을 보고 알았어요)</dt>
          <dd><Text v={o?.learned} /></dd>
        </dl>
      )}
      {o?.photoId && <BlobImage blobKey={o.photoId} alt={`내가 관찰한 ${n.name} 사진`} className="rec-photo" />}
    </section>
  );
}

function CasesBlock({ nb }: { nb: Notebook }) {
  const fav = caseById(nb.museumFavoriteId);
  return (
    <section className="rec-block">
      <h3 className="rec-title">자연물 ↔ 응용 사례 연결</h3>
      <table className="rec-table">
        <thead>
          <tr>
            <th scope="col">자연물</th>
            <th scope="col">내가 연결한 사례</th>
            <th scope="col">결과</th>
            <th scope="col">닮은 점 / 그렇게 생각한 이유</th>
          </tr>
        </thead>
        <tbody>
          {matchingCases.map((tc) => {
            const n = natureById(tc.natureId)!;
            const mine = caseById(nb.matches[n.id]);
            return (
              <tr key={n.id}>
                <th scope="row">{n.name}</th>
                <td>{mine ? mine.applicationName : <EmptyText>연결 전</EmptyText>}</td>
                <td>{mine ? (mine.natureId === n.id ? '✓ 실제 알려진 사례' : '◇ 나의 다른 생각') : '—'}</td>
                <td><Text v={nb.matchReasons[n.id]} /></td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <h3 className="rec-title">수첩에 붙인 사례</h3>
      {nb.savedCaseIds.length ? (
        <ul className="rec-list">
          {nb.savedCaseIds.map((id) => {
            const c = caseById(id);
            return c ? (
              <li key={id}>
                <strong>{c.title}</strong> — {c.category === 'analogy' ? '함께 상상해 보는 응용' : '실제로 알려진 응용'}: {c.connection}
              </li>
            ) : null;
          })}
        </ul>
      ) : (
        <p><EmptyText>아직 붙인 사례가 없어요</EmptyText></p>
      )}
      <h3 className="rec-title">인상 깊었던 사례와 이유</h3>
      <p>{fav ? <strong>{fav.title}</strong> : <EmptyText>고르지 않았어요</EmptyText>}</p>
      <p><Text v={nb.museumWhy} /></p>
    </section>
  );
}

function CombosBlock({ nb }: { nb: Notebook }) {
  const list = [...nb.combinations].sort((a, b) => Number(b.isFavorite) - Number(a.isFavorite));
  if (!list.length) return <p><EmptyText>아직 탐험하지 않은 페이지예요. 조합은 하고 싶을 때 해도 괜찮아요.</EmptyText></p>;
  return (
    <section className="rec-block">
      {list.map((c) => (
        <div key={c.id} className="combo-rec avoid-break">
          <h3 className="rec-title">
            {c.isFavorite ? '★ ' : ''}
            {comboTitle(c)}
          </h3>
          <dl className="rec-dl">
            <dt>가져온 자연의 특징</dt>
            <dd><Text v={c.chosenFeature} /></dd>
            <dt>달라질 물건의 부분</dt>
            <dd><Text v={c.changedPart} /></dd>
            <dt>떠오른 모습</dt>
            <dd><Text v={c.imagination} /></dd>
          </dl>
        </div>
      ))}
    </section>
  );
}

function SketchBlock({ nb, combo }: { nb: Notebook; combo: Combination }) {
  const s = nb.sketches[combo.id];
  return (
    <section className="rec-block">
      <h3 className="rec-title">{s?.title?.trim() || comboTitle(combo)}</h3>
      <p className="rec-source">조합: {comboTitle(combo)}</p>
      {s?.hasDrawing && (
        <figure className="avoid-break sketch-fig">
          <StrokeImage blobKey={`draw:${combo.id}`} alt={`${comboTitle(combo)} 상상 스케치`} />
        </figure>
      )}
      {s?.photoId && <BlobImage blobKey={s.photoId} alt="종이 스케치 사진" className="rec-photo" />}
      {s?.textAlternative?.trim() && (
        <div className="avoid-break">
          <p className="mini-head">글로 설명한 아이디어</p>
          <p className="pre">{s.textAlternative}</p>
        </div>
      )}
      {!hasSketchContent(s) && <p><EmptyText>아직 그림이나 설명을 넣지 않았어요</EmptyText></p>}
      <dl className="rec-dl">
        <dt>자연에서 가져온 특징</dt>
        <dd><Text v={s?.feature || combo.chosenFeature} /></dd>
        <dt>기존 물건과 달라진 모습</dt>
        <dd><Text v={s?.whatChanged} /></dd>
        <dt>재미있다고 생각한 이유</dt>
        <dd><Text v={s?.whyInteresting} /></dd>
      </dl>
    </section>
  );
}

function ReflectionPrint({ nb }: { nb: Notebook }) {
  return (
    <section className="rec-block avoid-break">
      <h3 className="rec-title">오늘 새롭게 알게 된 점 · 느낀 점</h3>
      <p><Text v={nb.finalReflection} /></p>
      <h3 className="rec-title">친구에게 소개할 한 문장</h3>
      <p><Text v={nb.shareSentence} /></p>
    </section>
  );
}

function sketchCombos(nb: Notebook) {
  return nb.combinations.filter((c) => hasSketchContent(nb.sketches[c.id]));
}

function observedIds(nb: Notebook) {
  return natureItems.filter((n) => hasObservationText(nb.observations[n.id])).map((n) => n.id);
}

/* ───────────────────────── 화면 7: 한 권의 수첩 넘겨 보기 ───────────────────────── */

type Sheet = { key: string; head: string; body: ReactNode };

export function NotebookView({ onPrint }: { onPrint: (mode: PrintMode) => void }) {
  const { nb, update, go } = useApp();
  const wide = useMedia('(min-width: 980px)');
  const [at, setAt] = useState(0);
  const obsIds = observedIds(nb);
  const sketches = sketchCombos(nb);
  const featured = nb.combinations.find((c) => c.id === nb.currentCombinationId) ?? nb.combinations[0];

  const sheets: Sheet[] = [
    {
      key: 'cover',
      head: '표지',
      body: (
        <div className="book-cover">
          <p className="cover-kicker">NATURE FIELD NOTES</p>
          <h2>{REPORT_TITLE}</h2>
          <p>{nb.nickname ? `탐험대: ${nb.nickname}` : '탐험대 이름을 적지 않았어요'}</p>
          <p className="field-hint">탐험을 시작한 날: {new Date(nb.startedAt).toLocaleDateString('ko-KR')}</p>
          <ul className="rec-list">
            <li>관찰한 자연물 {obsIds.length}가지</li>
            <li>연결한 사례 {Object.keys(nb.matches).length}개 · 붙인 사례 {nb.savedCaseIds.length}개</li>
            <li>저장한 조합 {nb.combinations.length}개 · 스케치 {sketches.length}장</li>
          </ul>
        </div>
      ),
    },
    ...(obsIds.length
      ? obsIds.map((id) => ({ key: `obs-${id}`, head: '내가 관찰한 자연물 · 궁금증과 발견', body: <ObsBlock nb={nb} natureId={id} /> }))
      : [{ key: 'obs-empty', head: '내가 관찰한 자연물', body: <p><EmptyText>아직 탐험하지 않은 페이지예요.</EmptyText></p> }]),
    { key: 'cases', head: '자연 모방 사례', body: <CasesBlock nb={nb} /> },
    { key: 'combos', head: '조합한 물건', body: <CombosBlock nb={nb} /> },
    ...(sketches.length
      ? sketches.map((c) => ({ key: `sk-${c.id}`, head: '상상 스케치', body: <SketchBlock nb={nb} combo={c} /> }))
      : [{ key: 'sk-empty', head: '상상 스케치', body: <p><EmptyText>아직 탐험하지 않은 페이지예요. 그림이 없어도 수첩을 인쇄할 수 있어요.</EmptyText></p> }]),
    {
      key: 'reflect',
      head: '오늘 알게 된 점',
      body: (
        <div>
          <LinedField
            label="오늘 자연에서 새롭게 발견한 특징이나 알게 된 점"
            value={nb.finalReflection}
            onChange={(v) =>
              update((d) => {
                d.finalReflection = v;
              })
            }
            rows={4}
          />
          <LinedField
            label="친구에게 소개할 한 문장"
            value={nb.shareSentence}
            onChange={(v) =>
              update((d) => {
                d.shareSentence = v;
              })
            }
            rows={2}
            placeholder="나는 ___의 ___ 특징을 발견했어요. 이 특징을 ___에 연결해 보았어요."
          />
          <button
            type="button"
            className="btn-quiet"
            onClick={() =>
              update((d) => {
                const n = natureById(featured?.natureId);
                const o = objectById(featured?.objectId);
                d.shareSentence = `나는 ${n?.name ?? '___'}의 ${featured?.chosenFeature || '___'} 특징을 발견했어요. 이 특징을 ${o?.name ?? '___'}에 연결해 보았어요.`;
              })
            }
          >
            발표 문장 틀 넣기
          </button>
        </div>
      ),
    },
  ];

  const step = wide ? 2 : 1;
  const maxAt = Math.max(0, sheets.length - 1);
  useEffect(() => {
    setAt((a) => Math.min(a - (a % step), maxAt));
  }, [step, maxAt]);
  const shown = sheets.slice(at, at + step);

  return (
    <div>
      <PageHead code="책갈피" title={REPORT_TITLE} lead="지금까지 적은 기록을 한 권의 수첩으로 넘겨 보세요. 빈칸이 있어도 인쇄할 수 있어요." />
      <div className="btn-row">
        <button type="button" className="btn-primary" onClick={() => onPrint('all')}>
          🖨 A4 활동지로 인쇄
        </button>
        <button type="button" className="btn" onClick={() => onPrint('all')}>
          PDF로 저장 (인쇄 창에서 ‘PDF로 저장’ 선택)
        </button>
        <button type="button" className="btn" onClick={() => exportNotebook(nb)}>
          기록 내보내기 (JSON)
        </button>
        <button type="button" className="btn" onClick={() => go('contents')}>
          탐험 이어가기
        </button>
      </div>
      <details className="print-options">
        <summary>골라서 인쇄하기 (선생님용)</summary>
        <div className="btn-row">
          <button type="button" className="btn-quiet" onClick={() => onPrint('obs')}>관찰 기록지만</button>
          <button type="button" className="btn-quiet" onClick={() => onPrint('case')}>사례 탐구만</button>
          <button type="button" className="btn-quiet" onClick={() => onPrint('sketch')}>조합·스케치만</button>
          <button type="button" className="btn-quiet" onClick={() => onPrint('cards')}>자연물·생활용품 카드 인쇄</button>
        </div>
      </details>

      <div className={`book ${wide ? 'is-spread' : ''}`} aria-live="polite">
        {shown.map((s, i) => (
          <article key={s.key} className={`book-page ${i === 1 ? 'right' : 'left'}`} aria-label={`${at + i + 1}쪽: ${s.head}`}>
            <p className="book-head">{s.head}</p>
            {s.body}
            <p className="book-folio">{at + i + 1}</p>
          </article>
        ))}
      </div>
      <div className="btn-row center">
        <button type="button" className="btn" disabled={at === 0} onClick={() => setAt(Math.max(0, at - step))}>
          ◀ 앞 장
        </button>
        <span className="counter">
          {at + 1}
          {step === 2 && at + 1 < sheets.length ? `–${at + 2}` : ''} / {sheets.length}쪽
        </span>
        <button type="button" className="btn" disabled={at + step >= sheets.length} onClick={() => setAt(at + step)}>
          다음 장 ▶
        </button>
      </div>
      <Note>🎤 발표 카드: “나는 ___의 ___ 특징을 발견했어요. 이 특징을 ___에 연결해 보았어요.”</Note>
    </div>
  );
}

/* ───────────────────────── 인쇄 전용 화면(A4) ───────────────────────── */

export type PrintMode = 'all' | 'obs' | 'case' | 'sketch' | 'cards';

export function PrintView({ nb }: { nb: Notebook }) {
  const obsIds = observedIds(nb);
  const sketches = sketchCombos(nb);
  const featured = nb.combinations.find((c) => c.id === nb.currentCombinationId) ?? sketches[0];
  return (
    <div className="print-root" aria-hidden="true">
      <header className="print-header">
        <h1>{REPORT_TITLE}</h1>
        <p>
          {nb.nickname ? `탐험대: ${nb.nickname} · ` : ''}
          {new Date().toLocaleDateString('ko-KR')} · 자연 모방 발명 연구소
        </p>
      </header>

      <section className="print-sec" data-sec="obs">
        <h2>1. 관찰 수첩</h2>
        {obsIds.length ? obsIds.map((id) => <ObsBlock key={id} nb={nb} natureId={id} />) : <p><EmptyText>아직 관찰 기록이 없어요.</EmptyText></p>}
      </section>

      <section className="print-sec" data-sec="case">
        <h2>2. 자연 모방 사례 탐구</h2>
        <CasesBlock nb={nb} />
      </section>

      <section className="print-sec" data-sec="sketch">
        <h2>3. 자연물 × 물건 조합</h2>
        <CombosBlock nb={nb} />
      </section>

      <section className="print-sec" data-sec="sketch">
        <h2>4. 나의 상상 스케치</h2>
        {featured && !sketches.includes(featured) && <SketchBlock nb={nb} combo={featured} />}
        {sketches.length ? sketches.map((c) => <SketchBlock key={c.id} nb={nb} combo={c} />) : !featured && <p><EmptyText>아직 스케치가 없어요.</EmptyText></p>}
        <ReflectionPrint nb={nb} />
      </section>

      <section className="print-sec" data-sec="cards">
        <h2>자연 표본 카드</h2>
        <div className="print-cards">
          {natureItems.map((n) => (
            <div key={n.id} className="print-card">
              <NatureArt item={n} size={90} decorative />
              <strong>
                {n.code} {n.name}
              </strong>
              <span>{n.featureSummary}</span>
              <span className="pc-q">질문: {n.studentQuestion}</span>
            </div>
          ))}
        </div>
        <h2 className="page-break-before">생활용품 카드</h2>
        <div className="print-cards">
          {householdObjects.map((o) => (
            <div key={o.id} className="print-card">
              <ObjectArt obj={o} size={70} />
              <strong>{o.name}</strong>
              <span>여러 부분: {o.parts}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
