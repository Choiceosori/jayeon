import { useState } from 'react';
import { natureById, natureItems, type NatureItem } from '../data/natureItems';
import { emptyObservation, hasObservationText, type Observation, type ObservationSource } from '../storage/model';
import { deleteBlob, processPhoto, putBlob } from '../storage/storage';
import { Magnifier } from './Magnifier';
import { BlobImage, LinedField, NatureArt, Note, PageHead, useApp } from './ui';

export const SOURCE_LABEL: Record<ObservationSource, string> = {
  real_object: '실물로 관찰했어요',
  photo: '사진으로 관찰했어요',
  video: '선생님이 보여 준 영상을 보았어요',
};

/** 현재 자연물의 관찰 기록을 읽고 고치는 도우미 */
export function useObservation(natureId: string) {
  const { nb, update } = useApp();
  const obs = nb.observations[natureId] ?? emptyObservation(natureId);
  const set = (patch: Partial<Observation>) =>
    update((d) => {
      d.observations[natureId] = { ...(d.observations[natureId] ?? emptyObservation(natureId)), ...patch, updatedAt: new Date().toISOString() };
    });
  return [obs, set] as const;
}

/** 자연물 표본 고르기 — 책장의 작은 표본 라벨 */
export function SpecimenPicker({ current, onPick, label = '자연 표본 고르기' }: { current: string; onPick: (id: string) => void; label?: string }) {
  const { nb } = useApp();
  return (
    <div className="specimen-picker" role="group" aria-label={label}>
      {natureItems.map((n) => {
        const done = hasObservationText(nb.observations[n.id]);
        return (
          <button key={n.id} type="button" className="specimen-tab" aria-pressed={current === n.id} onClick={() => onPick(n.id)}>
            <NatureArt item={n} size={38} decorative />
            <span className="sp-code">{n.code}</span>
            <span className="sp-name">{n.name}</span>
            {done && <span className="sp-done">✎ 기록 있음</span>}
          </button>
        );
      })}
    </div>
  );
}

function SourceChecks({ obs, set }: { obs: Observation; set: (p: Partial<Observation>) => void }) {
  return (
    <fieldset className="source-checks">
      <legend>어떻게 관찰했나요? (여러 개 골라도 돼요)</legend>
      {(Object.keys(SOURCE_LABEL) as ObservationSource[]).map((k) => (
        <label key={k} className="check">
          <input
            type="checkbox"
            checked={obs.source.includes(k)}
            onChange={(e) => set({ source: e.target.checked ? [...obs.source, k] : obs.source.filter((x) => x !== k) })}
          />
          <span>{SOURCE_LABEL[k]}</span>
        </label>
      ))}
    </fieldset>
  );
}

/* ────────────────────────────── 관찰 01: 자연 관찰 도감 ────────────────────────────── */

export function NatureAtlas() {
  const { nb, update, go } = useApp();
  const item = natureById(nb.currentNatureId) ?? natureItems[0];
  const [obs, set] = useObservation(item.id);
  const idx = natureItems.indexOf(item);
  const pick = (id: string) =>
    update((d) => {
      d.currentNatureId = id;
    });

  return (
    <div>
      <PageHead code="관찰 01" title="자연 관찰 도감" lead="여러 자연물의 생김새, 표면, 반복되는 구조를 천천히 비교해 보세요." />
      <SpecimenPicker current={item.id} onPick={pick} />

      <article className="specimen-sheet spread" aria-labelledby="sheet-name">
        <div className="sheet-left">
          <p className="specimen-no">표본 {item.code}</p>
          <div className="sheet-art">
            <NatureArt item={item} />
          </div>
          <p className="art-caption">직접 제작한 개념 삽화 — 실제 자연물과 함께 보면 더 좋아요.</p>
          <button type="button" className="btn" onClick={() => go('observe')}>
            🔎 그림 확대해서 자세히 보기
          </button>
        </div>
        <div className="sheet-right">
          <h2 id="sheet-name" className="specimen-name">{item.name}</h2>
          <p className="specimen-summary">{item.featureSummary}</p>
          <h3 className="mini-head">관찰 포인트</h3>
          <ol className="prompt-list">
            {item.observationPrompts.map((p) => (
              <li key={p}>{p}</li>
            ))}
          </ol>
          <h3 className="mini-head">관찰 질문</h3>
          <p className="question-line">{item.studentQuestion}</p>
          <Note>잠깐 화면에서 눈을 떼고, 준비한 자연물을 직접 보세요.</Note>
          <SourceChecks obs={obs} set={set} />
          <LinedField label="첫인상 메모 (보이는 모양)" value={obs.shape} onChange={(v) => set({ shape: v })} rows={2} placeholder="처음 보았을 때 어떤 모양이었나요?" />
        </div>
      </article>

      <div className="btn-row center">
        <button type="button" className="btn" disabled={idx === 0} onClick={() => pick(natureItems[idx - 1].id)}>
          ◀ 이전 표본
        </button>
        <span className="counter">
          {idx + 1} / {natureItems.length}
        </span>
        <button type="button" className="btn" disabled={idx === natureItems.length - 1} onClick={() => pick(natureItems[idx + 1].id)}>
          다음 표본 ▶
        </button>
      </div>
    </div>
  );
}

/* ────────────────────────────── 관찰 02: 자세히 보기 · 관찰 수첩 ────────────────────────────── */

export function ObservationEditor() {
  const { nb, update, toast } = useApp();
  const item = natureById(nb.currentNatureId) ?? natureItems[0];
  const [obs, set] = useObservation(item.id);
  const recorded = natureItems.filter((n) => hasObservationText(nb.observations[n.id]));

  return (
    <div>
      <PageHead code="관찰 02" title="자세히 보기 · 관찰 수첩" lead="확대경으로 살펴본 뒤, 보고 느낀 것을 자유롭게 적어 보세요. 빈칸이 있어도 다음 쪽으로 넘어갈 수 있어요." />
      <SpecimenPicker
        current={item.id}
        onPick={(id) =>
          update((d) => {
            d.currentNatureId = id;
          })
        }
      />
      {recorded.length > 0 && (
        <nav className="record-index" aria-label="관찰 기록 색인">
          {recorded.map((n, i) => (
            <button
              key={n.id}
              type="button"
              aria-current={n.id === item.id ? 'true' : undefined}
              onClick={() =>
                update((d) => {
                  d.currentNatureId = n.id;
                })
              }
            >
              관찰 기록 {i + 1} · {n.name}
            </button>
          ))}
        </nav>
      )}
      <p className="soft-msg">최소 세 가지 자연물을 관찰해 보면 서로 비교하기 좋아요. (지금 {recorded.length}가지)</p>

      <article className="spread observe-spread">
        <div className="sheet-left">
          <p className="specimen-no">
            표본 {item.code} · {item.name}
          </p>
          <Magnifier
            item={item}
            zoom={nb.zoom[item.id]}
            onZoom={(z) =>
              update((d) => {
                d.zoom[item.id] = z;
              })
            }
          />
          <ul className="prompt-list compact">
            {item.observationPrompts.map((p) => (
              <li key={p}>{p}</li>
            ))}
          </ul>
        </div>
        <div className="sheet-right memo">
          <h2 className="memo-title">〈관찰 메모〉 {item.name}</h2>
          <SourceChecks obs={obs} set={set} />
          <LinedField label="보이는 모양" value={obs.shape} onChange={(v) => set({ shape: v })} placeholder="전체 모양, 크기, 반복되는 모양" />
          <LinedField label="표면 · 무늬" value={obs.texture} onChange={(v) => set({ texture: v })} placeholder="매끈함, 울퉁불퉁함, 줄무늬, 색깔" />
          <LinedField label="특별한 점" value={obs.noticeableFeature} onChange={(v) => set({ noticeableFeature: v })} placeholder="다른 자연물과 다른 점, 새로 발견한 점" />
          <LinedField label="궁금한 점" value={obs.curiosity} onChange={(v) => set({ curiosity: v })} placeholder={item.studentQuestion} />
          <PhotoAttach item={item} obs={obs} set={set} />
          <div className="btn-row">
            <button type="button" className="btn-primary" onClick={() => toast(`${item.name} 관찰 기록을 수첩에 남겼어요.`)}>
              수첩에 남기기
            </button>
          </div>
        </div>
      </article>
    </div>
  );
}

function PhotoAttach({ item, obs, set }: { item: NatureItem; obs: Observation; set: (p: Partial<Observation>) => void }) {
  const [err, setErr] = useState('');
  return (
    <div className="photo-attach">
      <p className="mini-head">내가 찍은 사진 붙이기 (선택)</p>
      {obs.photoId ? (
        <figure>
          <BlobImage blobKey={obs.photoId} alt={`내가 관찰한 ${item.name} 사진`} className="attached-photo" />
          <button
            type="button"
            className="btn-quiet"
            onClick={() => {
              if (obs.photoId) deleteBlob(obs.photoId);
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
                const key = `photo:obs:${item.id}:${Date.now()}`;
                await putBlob(key, blob);
                set({ photoId: key });
              } catch (x) {
                setErr((x as Error).message);
              }
            }}
          />
        </label>
      )}
      <p className="field-hint">카메라를 꼭 쓰지 않아도 돼요. 사진의 촬영 위치 정보는 저장하지 않아요.</p>
      {err && <p className="error" role="alert">{err}</p>}
    </div>
  );
}
