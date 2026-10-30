import { useState } from 'react';
import { natureById, natureItems } from '../data/natureItems';
import { PrincipleDiagram } from './Diagrams';
import { useObservation, SpecimenPicker } from './NatureAtlas';
import { LinedField, NatureArt, Note, PageHead, Text, useApp } from './ui';

/** 탐구 03: 관찰한 구조가 어떤 역할을 하는지 — 본 것 / 예상 / 새로 안 것을 나누어 적는다. */
export function FeatureExplorer() {
  const { nb, update, toast } = useApp();
  const item = natureById(nb.currentNatureId) ?? natureItems[0];
  const [obs, set] = useObservation(item.id);
  const [openFor, setOpenFor] = useState<Record<string, boolean>>({});
  const open = !!openFor[item.id];

  return (
    <div>
      <PageHead code="탐구 03" title="자연의 특별한 능력" lead="관찰한 모습이 자연물에게 어떤 도움이 될지 추리해 보세요. 먼저 내 생각을 적고, 그다음 설명을 살펴봐요." />
      <SpecimenPicker
        current={item.id}
        label="탐구할 자연물 고르기"
        onPick={(id) =>
          update((d) => {
            d.currentNatureId = id;
          })
        }
      />

      <article className="spread">
        <div className="sheet-left">
          <h2 className="half-title">관찰한 모습</h2>
          <div className="sheet-art small">
            <NatureArt item={item} />
          </div>
          <dl className="obs-recap">
            <dt>내가 적은 모양</dt>
            <dd><Text v={obs.shape} /></dd>
            <dt>표면 · 무늬</dt>
            <dd><Text v={obs.texture} /></dd>
            <dt>특별한 점</dt>
            <dd><Text v={obs.noticeableFeature} /></dd>
          </dl>
          <p className="question-line">{item.studentQuestion}</p>
        </div>

        <div className="sheet-right">
          <h2 className="half-title">왜 그럴까?</h2>
          <div className="evidence evidence-observed">
            <span className="evidence-tag">① 확인한 내용</span>
            <LinedField
              label="직접 보았거나 자료에서 확인한 내용"
              value={obs.confirmedFact}
              onChange={(v) => set({ confirmedFact: v })}
              placeholder="예: 가시 끝이 굽어 있는 것을 돋보기로 보았다."
            />
          </div>
          <div className="evidence evidence-inferred">
            <span className="evidence-tag">② 나의 예상</span>
            <LinedField
              label="나의 예상 (이렇게 생각해요)"
              value={obs.hypothesis}
              onChange={(v) => set({ hypothesis: v })}
              placeholder="예: 굽은 끝이 털에 걸려서 붙는 것 같다."
              hint="예상은 틀려도 괜찮아요. 왜 그렇게 생각했는지가 중요해요."
            />
          </div>

          <button type="button" className="btn" aria-expanded={open} aria-controls="principle" onClick={() => setOpenFor((o) => ({ ...o, [item.id]: !open }))}>
            {open ? '설명 접기' : '📖 설명 살펴보기'}
          </button>
          {open && !obs.hypothesis.trim() && <p className="field-hint">먼저 예상을 적어 보면 설명과 비교하기가 더 재미있어요. (적지 않아도 볼 수 있어요)</p>}
          {open && (
            <div id="principle" className="principle">
              {item.principle ? (
                <>
                  <h3>{item.principle.title}</h3>
                  <p>{item.principle.body}</p>
                  {item.principle.caution && <Note tone="amber">⚠ {item.principle.caution}</Note>}
                  <PrincipleDiagram natureId={item.id} alt={`${item.principle.title}을 나타낸 단순화된 그림`} />
                </>
              ) : (
                <>
                  <h3>함께 알아보기</h3>
                  <p>{item.name}의 설명 자료는 아직 이 수첩에 들어 있지 않아요. 선생님과 함께 책이나 영상 자료에서 찾아보세요.</p>
                  <p className="field-hint">교사용 참고: {item.teacherNote}</p>
                </>
              )}
            </div>
          )}

          <div className="evidence evidence-learned">
            <span className="evidence-tag">③ 새로 안 것</span>
            <LinedField
              label="설명 자료를 보고 새롭게 알게 된 점"
              value={obs.learned}
              onChange={(v) => set({ learned: v })}
              placeholder="내 예상과 같았던 점, 달랐던 점"
            />
          </div>
          <div className="btn-row">
            <button type="button" className="btn-primary" onClick={() => toast(`${item.name} 탐구 내용을 수첩에 남겼어요.`)}>
              수첩에 남기기
            </button>
          </div>
        </div>
      </article>
    </div>
  );
}
