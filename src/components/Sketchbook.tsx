import { useState } from 'react';
import { objectById } from '../data/householdObjects';
import { natureById } from '../data/natureItems';
import { emptySketch, type Sketch } from '../storage/model';
import { deleteBlob, processPhoto, putBlob } from '../storage/storage';
import { comboTitle, ObjectArt } from './CombinationDesk';
import { SketchCanvas } from './SketchCanvas';
import { BlobImage, LinedField, NatureArt, Note, PageHead, useApp } from './ui';

/** 표현 07: 최종 산출물은 시제품이 아니라 아이디어 그림과 짧은 설명이다. */
export function Sketchbook() {
  const { nb, update, go, toast } = useApp();
  const combo = nb.combinations.find((c) => c.id === nb.currentCombinationId) ?? nb.combinations[nb.combinations.length - 1];
  const [textMode, setTextMode] = useState(false);
  const [err, setErr] = useState('');

  if (!combo) {
    return (
      <div>
        <PageHead code="표현 07" title="나의 상상 스케치북" />
        <Note>
          아직 고른 조합이 없어요. 조합실에서 자연 카드와 생활용품 카드를 한 장씩 골라 보세요.
          <div className="btn-row">
            <button type="button" className="btn-primary" onClick={() => go('combine')}>
              ◀ 조합실로 가기
            </button>
          </div>
        </Note>
        <p className="soft-msg">관찰과 사례 탐구만 해도 충분해요. 스케치는 하고 싶은 만큼만 해요.</p>
      </div>
    );
  }

  const n = natureById(combo.natureId);
  const o = objectById(combo.objectId);
  const sk: Sketch = nb.sketches[combo.id] ?? { ...emptySketch(combo.id), feature: combo.chosenFeature, title: `${n?.name ?? ''} ${o?.name ?? ''}`.trim() };
  const set = (patch: Partial<Sketch>) =>
    update((d) => {
      d.sketches[combo.id] = { ...(d.sketches[combo.id] ?? sk), ...patch, updatedAt: new Date().toISOString() };
      if (d.currentCombinationId !== combo.id) d.currentCombinationId = combo.id;
    });
  const showText = textMode || !!sk.textAlternative.trim();

  return (
    <div>
      <PageHead code="표현 07" title="나의 상상 스케치북" lead="자연의 특징을 더한 물건의 모습을 그림이나 글로 자유롭게 표현해 보세요. 실제로 만들 필요는 없어요." />

      {nb.combinations.length > 1 && (
        <div className="filter-row" role="group" aria-label="스케치할 조합 고르기">
          {nb.combinations.map((c) => (
            <button
              key={c.id}
              type="button"
              aria-pressed={c.id === combo.id}
              onClick={() =>
                update((d) => {
                  d.currentCombinationId = c.id;
                })
              }
            >
              {c.isFavorite ? '★ ' : ''}
              {comboTitle(c)}
            </button>
          ))}
        </div>
      )}

      <div className="sketch-head">
        {n && <NatureArt item={n} size={64} />}
        <span className="desk-plus" aria-hidden="true">+</span>
        {o && <ObjectArt obj={o} size={58} />}
        <p className="tape-label">{comboTitle(combo)}</p>
      </div>

      <div className="spread sketch-spread">
        <div className="sheet-left wide">
          <SketchCanvas
            storeKey={`draw:${combo.id}`}
            title={sk.title || comboTitle(combo)}
            onHasDrawing={(has) => set({ hasDrawing: has })}
          />
          <div className="btn-row">
            <button type="button" className="btn" aria-expanded={showText} onClick={() => setTextMode((x) => !x)}>
              ✎ 그림 없이 글로 설명하기
            </button>
          </div>
          {showText && (
            <LinedField
              label="그림 대신 글로 설명하기"
              value={sk.textAlternative}
              onChange={(v) => set({ textAlternative: v })}
              rows={5}
              hint="글로 설명한 아이디어도 그림과 똑같이 소중해요."
              placeholder="모양, 색깔, 어떻게 쓰는지 등을 말하듯이 적어 보세요."
            />
          )}
          <div className="photo-attach">
            <p className="mini-head">종이에 그린 스케치 사진 붙이기 (선택)</p>
            {sk.photoId ? (
              <figure>
                <BlobImage blobKey={sk.photoId} alt={`${comboTitle(combo)} 종이 스케치 사진`} className="attached-photo" />
                <button
                  type="button"
                  className="btn-quiet"
                  onClick={() => {
                    if (sk.photoId) deleteBlob(sk.photoId);
                    set({ photoId: undefined });
                  }}
                >
                  사진 떼기
                </button>
              </figure>
            ) : (
              <label className="file-label">
                <span>사진 파일 고르기</span>
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  onChange={async (e) => {
                    const f = e.target.files?.[0];
                    e.target.value = '';
                    if (!f) return;
                    try {
                      setErr('');
                      const blob = await processPhoto(f);
                      const key = `photo:sketch:${combo.id}:${Date.now()}`;
                      await putBlob(key, blob);
                      set({ photoId: key });
                    } catch (x) {
                      setErr((x as Error).message);
                    }
                  }}
                />
              </label>
            )}
            {err && <p className="error" role="alert">{err}</p>}
          </div>
        </div>

        <div className="sheet-right memo">
          <LinedField label="물건 이름" value={sk.title} onChange={(v) => set({ title: v })} rows={1} placeholder="예: 연잎 우산" />
          <LinedField label="자연에서 가져온 특징" value={sk.feature} onChange={(v) => set({ feature: v })} rows={2} />
          <LinedField label="기존 물건과 달라진 모습" value={sk.whatChanged} onChange={(v) => set({ whatChanged: v })} rows={3} />
          <LinedField label="재미있다고 생각한 이유" value={sk.whyInteresting} onChange={(v) => set({ whyInteresting: v })} rows={3} />
          <div className="btn-row">
            <button
              type="button"
              className="btn-primary"
              onClick={() => {
                set({});
                toast(`「${sk.title || comboTitle(combo)}」 스케치를 수첩에 끼워 넣었어요.`);
              }}
            >
              수첩에 끼워 넣기
            </button>
            <button type="button" className="btn" onClick={() => go('notebook')}>
              수첩 모아보기 ▶
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
