import { useId, useState } from 'react';
import { biomimicryCases, CATEGORY_LABEL, KIND_LABEL, type BioMimicryCase, type ImitationKind } from '../data/biomimicryCases';
import { natureById } from '../data/natureItems';
import { DiagramSvg, PrincipleDiagram } from './Diagrams';
import { PinButton } from './CaseMatching';
import { LinedField, NatureArt, Note, PageHead, useApp } from './ui';

/** 사례 그림: 자연물 삽화 + 응용 원리 그림 */
export function CaseIllustration({ c, small }: { c: BioMimicryCase; small?: boolean }) {
  const n = natureById(c.natureId);
  if (small) {
    return (
      <span className="case-mini" aria-hidden="true">
        <DiagramSvg natureId={c.natureId} />
      </span>
    );
  }
  return (
    <div className="case-visual">
      {n && (
        <div className="case-nature">
          <NatureArt item={n} size={96} />
          <span>{n.name}</span>
        </div>
      )}
      <span className="case-arrow" aria-hidden="true">→</span>
      <PrincipleDiagram natureId={c.natureId} alt={`${c.applicationName}의 원리를 단순하게 나타낸 그림`} />
    </div>
  );
}

/** 탐구 05: 박물관 전시 라벨처럼 사례를 천천히 둘러본다. */
export function CaseMuseum() {
  const { nb, update } = useApp();
  const [kind, setKind] = useState<ImitationKind | 'all'>('all');
  const selId = useId();
  const shown = biomimicryCases.filter((c) => kind === 'all' || c.kinds.includes(kind));

  return (
    <div>
      <PageHead
        code="탐구 05"
        title="자연 모방 사례 전시 코너"
        lead="사례를 천천히 둘러보며 자연의 생김새를 닮았는지, 움직임을 닮았는지, 기능이나 구조를 응용했는지 살펴보세요."
      />
      <div className="filter-row" role="group" aria-label="닮은 방식으로 살펴보기">
        <button type="button" aria-pressed={kind === 'all'} onClick={() => setKind('all')}>
          모두 보기
        </button>
        {(Object.keys(KIND_LABEL) as ImitationKind[]).map((k) => (
          <button key={k} type="button" aria-pressed={kind === k} onClick={() => setKind(k)}>
            {KIND_LABEL[k]}
          </button>
        ))}
      </div>
      <p className="field-hint">실제 기술에서는 생김새·움직임·기능 중 여러 가지가 함께 해당할 수 있어요.</p>

      <div className="museum">
        {shown.map((c) => (
          <article key={c.id} className={`exhibit ${c.category === 'analogy' ? 'is-analogy' : ''}`} aria-labelledby={`ex-${c.id}`}>
            <p className={`cat-label cat-${c.category}`}>{c.category === 'analogy' ? '◇ ' : '■ '}{CATEGORY_LABEL[c.category]}</p>
            <h2 id={`ex-${c.id}`} className="exhibit-title">{c.title}</h2>
            <CaseIllustration c={c} />
            <dl className="three-part">
              <div>
                <dt>자연에서 찾은 특징</dt>
                <dd>{c.naturalFeature}</dd>
              </div>
              <div>
                <dt>사람이 응용한 방법</dt>
                <dd>{c.application}</dd>
              </div>
              <div>
                <dt>닮은 점</dt>
                <dd>{c.connection}</dd>
              </div>
            </dl>
            <p className="kind-tags">
              {c.kinds.map((k) => (
                <span key={k} className="tag">{KIND_LABEL[k]}</span>
              ))}
            </p>
            <p className="field-hint">⚠ {c.caution}</p>
            <p className="source-label">출처: {c.sourceLabel}{c.sourceUrl ? ` (${c.sourceUrl})` : ''}</p>
            <PinButton caseId={c.id} />
          </article>
        ))}
      </div>

      <section className="paper museum-memo">
        <h2 className="half-title">기억에 남는 사례</h2>
        <div className="lined-field small">
          <label htmlFor={selId}>가장 기억에 남는 사례를 골라 보세요</label>
          <select
            id={selId}
            value={nb.museumFavoriteId}
            onChange={(e) =>
              update((d) => {
                d.museumFavoriteId = e.target.value;
              })
            }
          >
            <option value="">고르지 않음</option>
            {biomimicryCases.map((c) => (
              <option key={c.id} value={c.id}>
                {c.title}
              </option>
            ))}
          </select>
        </div>
        <LinedField
          label="왜 흥미로웠나요?"
          value={nb.museumWhy}
          onChange={(v) =>
            update((d) => {
              d.museumWhy = v;
            })
          }
        />
        <Note>👥 짝에게 설명해 보기: “이 사례는 자연의 ___을(를) 닮았어. 왜냐하면 ___이기 때문이야.” 짝은 고개를 끄덕이거나 궁금한 점을 물어봐 주세요.</Note>
      </section>
    </div>
  );
}
