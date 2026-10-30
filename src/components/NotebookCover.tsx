import { useId, useState } from 'react';
import { natureItems } from '../data/natureItems';
import { PAGES, PART_INFO } from '../data/pages';
import { hasObservationText } from '../storage/model';
import { exportNotebook } from '../storage/storage';
import { LeafSprig, NatureArt, useApp, type PageId } from './ui';

export function NotebookCover({ hasProgress, onNew, onImport }: { hasProgress: boolean; onNew: (nickname: string) => void; onImport: (f: File) => void }) {
  const { nb, update, go, openTeacher } = useApp();
  const nameId = useId();
  const [confirming, setConfirming] = useState(false);
  const [nick, setNick] = useState(nb.nickname);

  const start = () => {
    if (hasProgress) {
      setConfirming(true);
      return;
    }
    update((d) => {
      d.nickname = nick.trim();
    });
    go('atlas');
  };

  return (
    <div className="cover-wrap">
      <section className="cover" aria-labelledby="cover-title">
        <div className="cover-spine" aria-hidden="true" />
        <div className="cover-label">
          <p className="cover-kicker">NATURE FIELD NOTES · 13</p>
          <h1 id="cover-title">자연 모방 발명 연구소</h1>
          <p className="cover-sub">자세히 보면, 자연 속에 새로운 생각이 보여요.</p>
          <LeafSprig />
        </div>
        <div className="cover-art" aria-hidden="true">
          <NatureArt item={natureItems[1]} decorative />
          <NatureArt item={natureItems[0]} decorative />
          <NatureArt item={natureItems[6]} decorative />
        </div>
        <div className="stamp" aria-hidden="true">
          관찰
          <br />
          스탬프
        </div>
      </section>

      <section className="cover-panel paper">
        <p className="cover-question">솔방울은 왜 벌어질까요? 도꼬마리는 왜 달라붙을까요?</p>
        <p className="cover-flow">관찰하고 → 궁금해하고 → 실제 사례를 살펴보고 → 자유롭게 결합해 봐요.</p>
        <div className="lined-field small">
          <label htmlFor={nameId}>탐험 수첩 이름 (별명이나 모둠 이름, 선택)</label>
          <input id={nameId} type="text" maxLength={30} value={nick} placeholder="예: 숲속 탐험대 3모둠" onChange={(e) => setNick(e.target.value)} autoComplete="off" />
          <p className="field-hint">실명은 적지 않아도 돼요.</p>
        </div>
        <div className="btn-row">
          <button type="button" className="btn-primary" onClick={start}>
            새 탐험 시작
          </button>
          <button
            type="button"
            className="btn"
            disabled={!hasProgress}
            onClick={() => go((nb.lastPageId && nb.lastPageId !== 'cover' ? nb.lastPageId : 'contents') as PageId)}
          >
            이어 탐험하기
          </button>
          <button type="button" className="btn" onClick={openTeacher}>
            선생님 안내
          </button>
        </div>
        {hasProgress && (
          <p className="field-hint">
            이 기기에 「{nb.nickname || '이름 없는 수첩'}」 탐험 기록이 있어요 (관찰 {Object.values(nb.observations).filter(hasObservationText).length}개, 조합 {nb.combinations.length}개).
          </p>
        )}
        {confirming && (
          <div className="confirm" role="alertdialog" aria-labelledby="cf-t" aria-describedby="cf-d">
            <p id="cf-t"><strong>처음부터 새로 시작할까요?</strong></p>
            <p id="cf-d">이 기기에 저장된 지금까지의 탐험 기록이 모두 지워져요. 먼저 기록 파일로 보관해 둘 수 있어요.</p>
            <div className="btn-row">
              <button type="button" className="btn" onClick={() => exportNotebook(nb)}>
                기록 파일로 보관하기
              </button>
              <button
                type="button"
                className="btn-danger"
                onClick={() => {
                  setConfirming(false);
                  onNew(nick.trim());
                }}
              >
                지우고 새로 시작
              </button>
              <button type="button" className="btn-quiet" onClick={() => setConfirming(false)}>
                취소
              </button>
            </div>
          </div>
        )}
        <details className="cover-more">
          <summary>다른 기기에서 만든 기록 불러오기</summary>
          <p className="field-hint">「기록 내보내기」로 저장한 JSON 파일을 고르세요. 파일이 올바르지 않으면 지금 기록은 그대로 남아요.</p>
          <input
            type="file"
            accept="application/json,.json"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) onImport(f);
              e.target.value = '';
            }}
          />
        </details>
      </section>
    </div>
  );
}

/** 수첩 목차 */
export function Contents() {
  const { nb, go } = useApp();
  return (
    <div className="contents">
      <header className="page-head">
        <p className="chapter-code">목차</p>
        <h1 className="page-title" tabIndex={-1}>탐험 수첩 차례</h1>
        <p className="page-lead">순서대로 넘겨도 되고, 선생님 안내에 따라 원하는 쪽을 바로 펼쳐도 돼요.</p>
      </header>
      {([1, 2, 3] as const).map((part) => (
        <section key={part} className="toc-part">
          <h2>{PART_INFO[part].title}</h2>
          {PART_INFO[part].question && <p className="toc-q">공부할 문제: {PART_INFO[part].question}</p>}
          <ol className="toc-list">
            {PAGES.filter((p) => p.part === part).map((p) => (
              <li key={p.id}>
                <button type="button" onClick={() => go(p.id)}>
                  <span className="toc-code">{p.code}</span>
                  <span className="toc-title">{p.title}</span>
                  <span className="toc-desc">{p.desc}</span>
                  <span className="toc-state">{nb.visitedPageIds.includes(p.id) ? '펼쳐 봤어요' : '아직 탐험 전'}</span>
                </button>
              </li>
            ))}
          </ol>
        </section>
      ))}
      <p className="soft-msg">멋진 발명품을 꼭 만들 필요는 없어요. 자연을 오래 바라보고 새롭게 발견한 사실만으로도 훌륭한 탐구예요.</p>
    </div>
  );
}
