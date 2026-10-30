import { useRef, useState } from 'react';
import { householdObjects, objectById, type HouseholdObject } from '../data/householdObjects';
import { natureById, natureItems, type NatureItem } from '../data/natureItems';
import { hasObservationText, uid, type Combination, type Notebook } from '../storage/model';
import { deleteBlob } from '../storage/storage';
import { LinedField, NatureArt, Note, PageHead, useApp } from './ui';

export function ObjectArt({ obj, size }: { obj: HouseholdObject; size?: number }) {
  const { Icon } = obj;
  return (
    <svg viewBox="0 0 64 64" width={size} height={size} className="object-art" aria-hidden="true" focusable="false">
      <Icon />
    </svg>
  );
}

export const comboTitle = (c: { natureId: string; objectId: string }) => `${natureById(c.natureId)?.name ?? '?'} + ${objectById(c.objectId)?.name ?? '?'}`;

/** 학생이 관찰 수첩에 적은 특징이 있으면 그것을, 없으면 기본 특징 안내를 보여 준다. */
export function featureFor(nb: Notebook, n: NatureItem) {
  const o = nb.observations[n.id];
  const mine = o && hasObservationText(o) ? [o.noticeableFeature, o.shape, o.texture, o.learned].map((s) => s.trim()).filter(Boolean) : [];
  return mine.length ? { mine: true, text: mine.join(' / ') } : { mine: false, text: n.featureSummary };
}

/** 저장할 때: 같은 짝이 이미 있으면 글만 고친다. */
export function saveDeskCombination(d: Notebook): string {
  const { natureId, objectId, chosenFeature, changedPart, imagination } = d.desk;
  const found = d.combinations.find((c) => c.natureId === natureId && c.objectId === objectId);
  if (found) {
    Object.assign(found, { chosenFeature, changedPart, imagination });
    d.currentCombinationId = found.id;
    return found.id;
  }
  const c: Combination = { id: uid(), natureId, objectId, chosenFeature, changedPart, imagination, isFavorite: true, createdAt: new Date().toISOString() };
  d.combinations.push(c);
  d.currentCombinationId = c.id;
  return c.id;
}

/** 조합 06: 자연 표본 카드 1장 + 생활용품 카드 1장을 책상 위에 겹쳐 본다. */
export function CombinationDesk() {
  const { nb, update, go, toast } = useApp();
  const recent = useRef<string[]>([]);
  const [confirmDel, setConfirmDel] = useState('');
  const desk = nb.desk;
  const n = natureById(desk.natureId);
  const o = objectById(desk.objectId);
  const ready = !!(n && o);

  const setDesk = (patch: Partial<Notebook['desk']>) =>
    update((d) => {
      d.desk = { ...d.desk, ...patch };
    });

  /** 카드를 바꿀 때 이미 저장한 짝이면 그 글을 다시 불러온다(저장한 조합은 지우지 않는다). */
  const pickPair = (natureId: string, objectId: string) =>
    update((d) => {
      const saved = d.combinations.find((c) => c.natureId === natureId && c.objectId === objectId);
      d.desk = saved
        ? { natureId, objectId, chosenFeature: saved.chosenFeature, changedPart: saved.changedPart, imagination: saved.imagination }
        : { ...d.desk, natureId, objectId, chosenFeature: d.desk.natureId === natureId ? d.desk.chosenFeature : '', changedPart: '', imagination: '' };
    });

  const cycle = <T extends { id: string }>(list: T[], cur: string) => list[(list.findIndex((x) => x.id === cur) + 1) % list.length].id;

  const surprise = () => {
    let pair = '';
    for (let tries = 0; tries < 30; tries++) {
      const nn = natureItems[Math.floor(Math.random() * natureItems.length)].id;
      const oo = householdObjects[Math.floor(Math.random() * householdObjects.length)].id;
      pair = `${nn}|${oo}`;
      if (!recent.current.includes(pair) && pair !== `${desk.natureId}|${desk.objectId}`) break;
    }
    recent.current = [pair, ...recent.current].slice(0, 12);
    const [nn, oo] = pair.split('|');
    pickPair(nn, oo);
  };

  const save = () => {
    if (!ready) return;
    update((d) => {
      saveDeskCombination(d);
    });
    toast(`「${comboTitle(desk)}」 조합을 수첩에 저장했어요.`);
  };

  const toSketch = () => {
    if (ready)
      update((d) => {
        saveDeskCombination(d);
      });
    go('sketch');
  };

  const feat = n ? featureFor(nb, n) : null;

  return (
    <div>
      <PageHead code="조합 06" title="자연물 × 생활용품 조합실" lead="자연 표본 카드와 생활용품 카드를 한 장씩 골라 책상 위에 겹쳐 보세요." />
      <p className="soft-msg">엉뚱한 조합도 괜찮아요. 자연을 새롭게 보는 눈이 중요해요.</p>

      <div className="desk-layout">
        <section className="deck deck-nature" aria-labelledby="deck-n">
          <h2 id="deck-n" className="deck-title">자연 표본 카드</h2>
          <div className="deck-cards" role="group" aria-label="자연 표본 카드 고르기">
            {natureItems.map((x) => (
              <button key={x.id} type="button" className="card card-nature" aria-pressed={desk.natureId === x.id} onClick={() => pickPair(x.id, desk.objectId)}>
                <NatureArt item={x} size={44} decorative />
                <span>{x.name}</span>
              </button>
            ))}
          </div>
        </section>

        <section className="desk" aria-labelledby="desk-h">
          <h2 id="desk-h" className="sr-only">책상 위 조합</h2>
          <div className="desk-cards">
            <div className={`desk-card nature ${n ? '' : 'is-empty'}`}>
              {n ? (
                <>
                  <NatureArt item={n} size={110} />
                  <strong>{n.name}</strong>
                </>
              ) : (
                <span>자연 카드를 골라요</span>
              )}
            </div>
            <span className="desk-plus" aria-hidden="true">+</span>
            <div className={`desk-card object ${o ? '' : 'is-empty'}`}>
              {o ? (
                <>
                  <ObjectArt obj={o} size={100} />
                  <strong>{o.name}</strong>
                </>
              ) : (
                <span>생활용품 카드를 골라요</span>
              )}
            </div>
          </div>
          <p className="tape-label" aria-live="polite">
            {ready ? comboTitle(desk) : '?  +  ?'}
          </p>
          <div className="btn-row center">
            <button type="button" className="btn" onClick={() => pickPair(cycle(natureItems, desk.natureId), desk.objectId || householdObjects[0].id)}>
              다른 자연물
            </button>
            <button type="button" className="btn" onClick={() => pickPair(desk.natureId || natureItems[0].id, cycle(householdObjects, desk.objectId))}>
              다른 생활용품
            </button>
            <button type="button" className="btn" onClick={surprise}>
              🍃 새로운 조합 펼치기
            </button>
          </div>

          {n && feat && (
            <Note>
              <strong>{feat.mine ? `내가 관찰한 ${n.name}의 특징` : `${n.name}의 특징 (도감 안내)`}:</strong> {feat.text}
            </Note>
          )}
          {o && <p className="field-hint">{o.name}의 여러 부분: {o.parts}</p>}

          <div className="desk-questions">
            <LinedField label="자연의 어떤 특징을 가져오고 싶나요?" value={desk.chosenFeature} onChange={(v) => setDesk({ chosenFeature: v })} placeholder="예: 물방울이 잘 굴러가는 특징" />
            <LinedField label="이 물건의 어떤 부분이 달라질까요?" value={desk.changedPart} onChange={(v) => setDesk({ changedPart: v })} placeholder="예: 우산 천의 표면" />
            <LinedField label="그 모습을 어떻게 표현하면 좋을까요? 어떤 모습이 떠오르나요?" value={desk.imagination} onChange={(v) => setDesk({ imagination: v })} />
          </div>
          <div className="btn-row center">
            <button type="button" className="btn-primary" disabled={!ready} onClick={save}>
              ★ 마음에 드는 조합 저장
            </button>
            <button type="button" className="btn-primary" onClick={toSketch}>
              다음 쪽: 스케치하기 ▶
            </button>
          </div>
          {!ready && <p className="field-hint">자연 카드와 생활용품 카드를 한 장씩 고르면 저장할 수 있어요.</p>}
        </section>

        <section className="deck deck-object" aria-labelledby="deck-o">
          <h2 id="deck-o" className="deck-title">생활용품 카드</h2>
          <div className="deck-cards" role="group" aria-label="생활용품 카드 고르기">
            {householdObjects.map((x) => (
              <button key={x.id} type="button" className="card card-object" aria-pressed={desk.objectId === x.id} onClick={() => pickPair(desk.natureId, x.id)}>
                <ObjectArt obj={x} size={40} />
                <span>{x.name}</span>
              </button>
            ))}
          </div>
        </section>
      </div>

      <section className="saved-combos paper" aria-labelledby="saved-h">
        <h2 id="saved-h" className="half-title">저장한 조합 ({nb.combinations.length})</h2>
        {nb.combinations.length === 0 && <p className="empty-text">아직 저장한 조합이 없어요. 하나만 저장해도 스케치할 수 있어요.</p>}
        <ul className="combo-list">
          {nb.combinations.map((c) => (
            <li key={c.id} className={c.id === nb.currentCombinationId ? 'is-current' : ''}>
              <button
                type="button"
                className="star"
                aria-pressed={c.isFavorite}
                aria-label={`${comboTitle(c)} 즐겨찾기${c.isFavorite ? ' 해제' : ''}`}
                onClick={() =>
                  update((d) => {
                    const t = d.combinations.find((x) => x.id === c.id);
                    if (t) t.isFavorite = !t.isFavorite;
                  })
                }
              >
                {c.isFavorite ? '★' : '☆'}
              </button>
              <span className="combo-name">{comboTitle(c)}</span>
              <span className="combo-feat">{c.chosenFeature || '특징을 아직 적지 않았어요'}</span>
              <span className="combo-actions">
                <button type="button" className="btn-quiet" onClick={() => pickPair(c.natureId, c.objectId)}>
                  책상에 다시 올리기
                </button>
                <button
                  type="button"
                  className="btn-quiet"
                  onClick={() => {
                    update((d) => {
                      d.currentCombinationId = c.id;
                    });
                    go('sketch');
                  }}
                >
                  이 조합 스케치하기
                </button>
                {confirmDel === c.id ? (
                  <>
                    <button
                      type="button"
                      className="btn-danger"
                      onClick={() => {
                        deleteBlob(`draw:${c.id}`);
                        const ph = nb.sketches[c.id]?.photoId;
                        if (ph) deleteBlob(ph);
                        update((d) => {
                          d.combinations = d.combinations.filter((x) => x.id !== c.id);
                          delete d.sketches[c.id];
                          if (d.currentCombinationId === c.id) d.currentCombinationId = '';
                        });
                        setConfirmDel('');
                      }}
                    >
                      정말 지우기
                    </button>
                    <button type="button" className="btn-quiet" onClick={() => setConfirmDel('')}>
                      취소
                    </button>
                  </>
                ) : (
                  <button type="button" className="btn-quiet" onClick={() => setConfirmDel(c.id)}>
                    지우기
                  </button>
                )}
              </span>
            </li>
          ))}
        </ul>
        {nb.combinations.length >= 2 && <p className="field-hint">저장한 조합을 나란히 보며 어떤 것이 가장 재미있는지 비교해 보세요.</p>}
      </section>
    </div>
  );
}
