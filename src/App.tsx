import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { CaseMatching } from './components/CaseMatching';
import { CaseMuseum } from './components/CaseMuseum';
import { CombinationDesk } from './components/CombinationDesk';
import { FeatureExplorer } from './components/FeatureExplorer';
import { NatureAtlas, ObservationEditor } from './components/NatureAtlas';
import { Contents, NotebookCover } from './components/NotebookCover';
import { NotebookView, PrintView, type PrintMode } from './components/NotebookView';
import { Sketchbook } from './components/Sketchbook';
import { TeacherGuide } from './components/TeacherGuide';
import { Ctx, type AppCtx, type PageId } from './components/ui';
import { PAGES, PART_INFO, pageIndex } from './data/pages';
import { newNotebook, type Notebook } from './storage/model';
import { applyImport, canUseLocalStorage, clearBlobs, clearNotebook, loadNotebook, parseImport, saveNotebook } from './storage/storage';

type SaveState = 'idle' | 'saving' | 'saved' | 'error';

const SAVE_TEXT: Record<SaveState, string> = {
  idle: '',
  saving: '저장 중...',
  saved: '이 기기에 저장했어요',
  error: '저장할 수 없어요 — 기록 내보내기로 보관하세요',
};

export default function App() {
  const initial = useMemo(() => loadNotebook(), []);
  const [nb, setNb] = useState<Notebook>(() => initial ?? newNotebook());
  const [hasProgress, setHasProgress] = useState(() => !!initial && initial.visitedPageIds.some((p) => p !== 'cover'));
  const [page, setPage] = useState<PageId>('cover');
  const [save, setSave] = useState<SaveState>('idle');
  const [toastMsg, setToastMsg] = useState('');
  const [teacher, setTeacher] = useState(false);
  const storageOk = useMemo(() => canUseLocalStorage(), []);
  const mainRef = useRef<HTMLElement>(null);
  const first = useRef(true);

  // 창을 닫거나 새로 고칠 때 아직 기록하지 않은 입력도 바로 저장한다.
  const latest = useRef(nb);
  latest.current = nb;
  useEffect(() => {
    const flush = () => {
      if (!first.current) saveNotebook(latest.current);
    };
    const onVis = () => document.visibilityState === 'hidden' && flush();
    window.addEventListener('pagehide', flush);
    window.addEventListener('beforeunload', flush);
    document.addEventListener('visibilitychange', onVis);
    return () => {
      window.removeEventListener('pagehide', flush);
      window.removeEventListener('beforeunload', flush);
      document.removeEventListener('visibilitychange', onVis);
    };
  }, []);

  // 자동 저장: 입력이 멈추면 바로 기기에 기록한다.
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    setSave('saving');
    const t = setTimeout(() => setSave(saveNotebook(nb) ? 'saved' : 'error'), 350);
    return () => clearTimeout(t);
  }, [nb]);

  useEffect(() => {
    if (!toastMsg) return;
    const t = setTimeout(() => setToastMsg(''), 2600);
    return () => clearTimeout(t);
  }, [toastMsg]);

  const update = useCallback<AppCtx['update']>((fn) => {
    setNb((prev) => {
      const d = structuredClone(prev);
      fn(d);
      return d;
    });
  }, []);

  const go = useCallback(
    (id: PageId) => {
      setPage(id);
      update((d) => {
        d.lastPageId = id;
        if (!d.visitedPageIds.includes(id)) d.visitedPageIds.push(id);
      });
      if (id !== 'cover') setHasProgress(true);
      window.scrollTo({ top: 0 });
      requestAnimationFrame(() => {
        mainRef.current?.querySelector<HTMLElement>('h1')?.focus({ preventScroll: true });
        document.querySelector('.bookmark[aria-current="page"]')?.scrollIntoView({ block: 'nearest', inline: 'center' });
      });
    },
    [update],
  );

  const print = (mode: PrintMode) => {
    document.documentElement.dataset.print = mode;
    const done = () => {
      delete document.documentElement.dataset.print;
      window.removeEventListener('afterprint', done);
    };
    window.addEventListener('afterprint', done);
    // 그림이 그려질 시간을 조금 준다.
    setTimeout(() => window.print(), 250);
  };

  const startNew = async (nickname: string) => {
    await clearBlobs();
    clearNotebook();
    const fresh = newNotebook(nickname);
    setNb(fresh);
    setHasProgress(false);
    setPage('atlas');
    update((d) => {
      d.visitedPageIds = ['atlas'];
      d.lastPageId = 'atlas';
    });
  };

  const importFile = async (f: File) => {
    try {
      const data = await parseImport(f);
      if (!window.confirm(`「${data.notebook.nickname || '이름 없는 수첩'}」 기록을 불러올까요? 지금 이 기기의 기록은 불러온 기록으로 바뀌어요.`)) return;
      await applyImport(data);
      setNb(data.notebook);
      setHasProgress(true);
      setToastMsg('탐험 기록을 불러왔어요.');
    } catch (e) {
      window.alert(`불러오지 못했어요: ${(e as Error).message}\n지금 기록은 그대로 남아 있어요.`);
    }
  };

  const ctx: AppCtx = { nb, update, go, toast: setToastMsg, openTeacher: () => setTeacher(true) };
  const idx = pageIndex(page);
  const prev = PAGES[idx - 1];
  const next = PAGES[idx + 1];

  const body = (() => {
    switch (page) {
      case 'cover':
        return <NotebookCover hasProgress={hasProgress} onNew={startNew} onImport={importFile} />;
      case 'contents':
        return <Contents />;
      case 'atlas':
        return <NatureAtlas />;
      case 'observe':
        return <ObservationEditor />;
      case 'ability':
        return <FeatureExplorer />;
      case 'match':
        return <CaseMatching />;
      case 'museum':
        return <CaseMuseum />;
      case 'combine':
        return <CombinationDesk />;
      case 'sketch':
        return <Sketchbook />;
      case 'notebook':
        return <NotebookView onPrint={print} />;
    }
  })();

  return (
    <Ctx.Provider value={ctx}>
      <a className="skip" href="#main">본문으로 건너뛰기</a>
      {page === 'cover' ? (
        <main id="main" ref={mainRef} className="cover-main screen-only">
          {!storageOk && <StorageWarning />}
          {body}
        </main>
      ) : (
        <div className="field-notebook screen-only">
          <header className="topbar">
            <button type="button" className="brand" onClick={() => go('cover')}>
              <span aria-hidden="true">🌿</span> 자연 모방 발명 연구소
            </button>
            <div className="topbar-right">
              <button type="button" className="btn-quiet" onClick={() => go('contents')}>
                수첩 목차
              </button>
              <button type="button" className="btn-quiet" onClick={() => setTeacher(true)}>
                선생님 안내
              </button>
              <span className={`save-state save-${save}`} role="status" aria-live="polite">
                {save === 'idle' ? '자동 저장' : SAVE_TEXT[save]}
              </span>
            </div>
          </header>
          {!storageOk && <StorageWarning />}
          <div className="notebook-body">
            <nav className="bookmarks" aria-label="수첩 책갈피">
              {([1, 2, 3] as const).map((part) => (
                <div key={part} className={`bm-group part-${part}`}>
                  <p className="bm-part">{PART_INFO[part].title}</p>
                  {PAGES.filter((p) => p.part === part).map((p) => (
                    <button key={p.id} type="button" className="bookmark" aria-current={page === p.id ? 'page' : undefined} onClick={() => go(p.id)}>
                      <span className="bm-code">{p.code}</span>
                      <span className="bm-tab">{p.tab}</span>
                    </button>
                  ))}
                </div>
              ))}
            </nav>
            <main id="main" ref={mainRef} className="page" key={page}>
              {body}
              <nav className="page-nav" aria-label="쪽 넘기기">
                <button type="button" className="btn-quiet" onClick={() => go('contents')}>
                  목차로
                </button>
                <button type="button" className="btn" disabled={!prev || prev.id === 'cover'} onClick={() => prev && go(prev.id)}>
                  ◀ 이전 쪽{prev && prev.id !== 'cover' ? ` · ${prev.tab}` : ''}
                </button>
                <button type="button" className="btn" disabled={!next} onClick={() => next && go(next.id)}>
                  다음 쪽{next ? ` · ${next.tab}` : ''} ▶
                </button>
              </nav>
            </main>
          </div>
        </div>
      )}
      <PrintView nb={nb} />
      {toastMsg && (
        <div className="toast screen-only" role="status">
          {toastMsg}
        </div>
      )}
      {teacher && <TeacherGuide onClose={() => setTeacher(false)} />}
    </Ctx.Provider>
  );
}

function StorageWarning() {
  return (
    <p className="storage-warn" role="alert">
      이 브라우저에서는 기록을 저장할 수 없어요(개인정보 보호 모드일 수 있어요). 창을 닫기 전에 ‘모아보기 → 기록 내보내기’나 인쇄로 보관하세요.
    </p>
  );
}
