import { forwardRef, useCallback, useEffect, useRef, useState } from 'react';
import { flushSync } from 'react-dom';
import { LAST_STEP, steps, studyProblems, teacherGuide } from '../data/uiCopy';
import type { MediaKey, Project12 } from '../models/Project12';
import {
  StorageError,
  createEmptyProject,
  deleteProject,
  getCurrentProjectId,
  listProjects,
  loadMedia,
  loadProjectText,
  parseProjectFile,
  saveMedia,
  saveProjectText,
  type ProjectMeta,
} from '../storage/projectStorage';
import { missingFor, type PrintKind, type ScreenProps } from '../features/progress';
import { DiscoverStep, EmpathizeStep, StartStep } from '../features/EmpathizeScreens';
import { CompareStep, LabStep } from '../features/LabScreens';
import { DesignStep, IdeasStep } from '../features/InventScreens';
import { EvaluateStep, PrototypeStep } from '../features/BuildScreens';
import { ExhibitStep, IdeaCardPrint, PeerSheetPrint, Report, WorksheetPrint } from '../features/ReportScreens';
import { Field, Notice } from '../components/common';

type SaveState = { kind: 'idle' | 'saving' | 'saved' | 'error'; message?: string; at?: string };

const timeText = (iso?: string) => (iso ? new Date(iso).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }) : '');

export default function App() {
  const [project, setProject] = useState<Project12 | null>(null);
  const [saved, setSaved] = useState<ProjectMeta[]>(() => listProjects());
  const [save, setSave] = useState<SaveState>({ kind: 'idle' });
  const [printKind, setPrintKind] = useState<PrintKind | null>(null);
  const [landingMsg, setLandingMsg] = useState('');
  const teacherRef = useRef<HTMLDialogElement>(null);
  const mainRef = useRef<HTMLElement>(null);
  const latest = useRef<Project12 | null>(null);
  const dirty = useRef(false);
  latest.current = project;

  /* ---------- 저장 ---------- */
  const flush = useCallback(() => {
    const p = latest.current;
    if (!p || !dirty.current) return true;
    try {
      saveProjectText(p);
      dirty.current = false;
      setSave({ kind: 'saved', at: p.updatedAt });
      return true;
    } catch (e) {
      setSave({ kind: 'error', message: e instanceof StorageError ? e.message : '저장이 되지 않았어요. 파일로 내보내세요.' });
      return false;
    }
  }, []);

  useEffect(() => {
    if (!project || !dirty.current) return;
    setSave((s) => (s.kind === 'error' ? s : { kind: 'saving' }));
    const t = window.setTimeout(flush, 400);
    return () => window.clearTimeout(t);
  }, [project, flush]);

  // 새로고침·창 닫기 직전에 바로 저장
  useEffect(() => {
    const onHide = () => flush();
    window.addEventListener('beforeunload', onHide);
    window.addEventListener('pagehide', onHide);
    const onVis = () => document.visibilityState === 'hidden' && flush();
    document.addEventListener('visibilitychange', onVis);
    return () => {
      window.removeEventListener('beforeunload', onHide);
      window.removeEventListener('pagehide', onHide);
      document.removeEventListener('visibilitychange', onVis);
    };
  }, [flush]);

  const update: ScreenProps['update'] = useCallback((patch) => {
    setProject((cur) => {
      if (!cur) return cur;
      const delta = typeof patch === 'function' ? patch(cur) : patch;
      dirty.current = true;
      return { ...cur, ...delta, updatedAt: new Date().toISOString() };
    });
  }, []);

  const setMedia = useCallback(
    (key: MediaKey, dataUrl: string | null) => {
      const p = latest.current;
      if (!p) return;
      update({ [key]: dataUrl } as Partial<Project12>);
      saveMedia(p.id, key, dataUrl).catch((e: unknown) =>
        setSave({ kind: 'error', message: e instanceof StorageError ? e.message : '그림이 저장되지 않았어요. 파일로 내보내세요.' }),
      );
    },
    [update],
  );

  /* ---------- 프로젝트 열기·만들기 ---------- */
  const openProject = useCallback(async (id: string) => {
    const p = loadProjectText(id);
    if (!p) {
      setLandingMsg('저장된 활동을 찾을 수 없어요. 다른 브라우저나 기기에서 만든 활동은 파일로 옮겨 와야 해요.');
      return;
    }
    const media = await loadMedia(id);
    dirty.current = false;
    setProject({ ...p, ...media });
    setSave({ kind: 'saved', at: p.updatedAt });
  }, []);

  const startNew = (teamName: string, nickname: string) => {
    const p = { ...createEmptyProject(), teamName, nickname, currentStep: 1 };
    dirty.current = true;
    setProject(p);
  };

  const goHome = () => {
    flush();
    setProject(null);
    setSaved(listProjects());
    setLandingMsg('');
  };

  const importFile = async (file: File) => {
    const incoming = await parseProjectFile(file);
    const exists = listProjects().some((m) => m.id === incoming.id);
    if (exists && !window.confirm('이 기기에 같은 활동이 이미 있어요. 파일 내용으로 덮어쓸까요?\n(취소하면 지금 내용이 그대로 남아요)')) return;
    if (!exists && latest.current && !window.confirm('파일의 활동을 열까요? 지금 활동은 저장된 채로 목록에 남아요.')) return;
    flush();
    saveProjectText(incoming);
    for (const k of ['sketchDataUrl', 'photoDataUrl'] as const) await saveMedia(incoming.id, k, incoming[k]).catch(() => undefined);
    dirty.current = false;
    setProject(incoming);
    setSaved(listProjects());
    setSave({ kind: 'saved', at: incoming.updatedAt });
  };

  /* ---------- 단계 이동 ---------- */
  const go = useCallback(
    (step: number) => {
      const s = Math.max(0, Math.min(LAST_STEP, step));
      update({ currentStep: s });
      requestAnimationFrame(() => {
        window.scrollTo({ top: 0 });
        mainRef.current?.focus({ preventScroll: true });
      });
    },
    [update],
  );

  /* ---------- 인쇄 ---------- */
  const requestPrint = useCallback((kind: PrintKind) => {
    flushSync(() => setPrintKind(kind));
    window.print();
  }, []);
  useEffect(() => {
    // 브라우저 메뉴(Ctrl+P)로 인쇄해도 보고서가 나오도록 한다
    const before = () => flushSync(() => setPrintKind((k) => k ?? 'report'));
    const after = () => setPrintKind(null);
    window.addEventListener('beforeprint', before);
    window.addEventListener('afterprint', after);
    return () => {
      window.removeEventListener('beforeprint', before);
      window.removeEventListener('afterprint', after);
    };
  }, []);

  const openTeacher = () => teacherRef.current?.showModal();

  const newProjectFromExhibit = () => {
    if (!window.confirm('새 디자인을 시작할까요?\n지금 활동은 저장된 채로 [처음 화면]의 목록에 남아요.')) return;
    flush();
    startNew('', '');
    setSaved(listProjects());
  };

  if (!project) {
    return (
      <>
        <Landing
          saved={saved}
          message={landingMsg}
          onStart={startNew}
          onOpen={openProject}
          onDelete={(id) => {
            deleteProject(id);
            setSaved(listProjects());
          }}
          onImport={async (f) => {
            try {
              await importFile(f);
            } catch (e) {
              setLandingMsg(e instanceof Error ? e.message : '파일을 불러오지 못했어요.');
            }
          }}
          onTeacher={openTeacher}
        />
        <TeacherDialog ref={teacherRef} />
      </>
    );
  }

  const step = steps[project.currentStep] ?? steps[0];
  const props: ScreenProps = { p: project, update, go, setMedia, requestPrint };
  const missing = missingFor(step.index, project);

  return (
    <>
      <div className="app" data-printing={printKind ?? undefined}>
        <a className="skip-link" href="#main">
          본문으로 건너뛰기
        </a>
        <header className="topbar">
          <button type="button" className="brand" onClick={goHome} aria-label="처음 화면으로 (활동은 저장돼요)">
            <span className="logo" aria-hidden="true">
              💡
            </span>
            모두의 디자인 실험실
          </button>
          <span className="step-count">
            {step.index} / {LAST_STEP} 단계
          </span>
          <SaveBadge save={save} />
          <button type="button" className="btn ghost small" onClick={openTeacher}>
            선생님 안내
          </button>
        </header>
        <StepNavigator current={step.index} onGo={go} />
        <main id="main" ref={mainRef} tabIndex={-1} className="main">
          <div className="screen-head">
            <div className="pills">
              <span className={`pill ${step.session === '3~4차시' ? 'second' : 'first'}`}>{step.session}</span>
              {step.activity && <span className="pill activity">{step.activity}</span>}
            </div>
            <h2>
              {step.index > 0 && <span className="step-no">{step.index}. </span>}
              {step.title}
            </h2>
            <p className="lead">{step.lead}</p>
            {step.index === 6 && (
              <Notice kind="info">
                <strong>3~4차시 공부할 문제:</strong> {studyProblems.second}
              </Notice>
            )}
          </div>
          {save.kind === 'error' && (
            <Notice kind="warn">
              <strong>{save.message}</strong> 9단계에서 [활동 내용 파일로 저장하기]를 눌러 파일로 보관해 주세요.
            </Notice>
          )}
          {step.index === 0 && <StartStep {...props} />}
          {step.index === 1 && <DiscoverStep {...props} />}
          {step.index === 2 && <EmpathizeStep {...props} />}
          {step.index === 3 && <LabStep {...props} />}
          {step.index === 4 && <CompareStep {...props} />}
          {step.index === 5 && <IdeasStep {...props} />}
          {step.index === 6 && <DesignStep {...props} />}
          {step.index === 7 && <PrototypeStep {...props} />}
          {step.index === 8 && <EvaluateStep {...props} />}
          {step.index === 9 && <ExhibitStep {...props} onNewProject={newProjectFromExhibit} onImport={importFile} />}
        </main>
        <footer className="step-footer">
          {missing.length > 0 && step.index !== 9 && (
            <p className="missing-hint">
              ✏️ 이 단계에 아직 쓰지 않은 칸 {missing.length}개 ({missing.slice(0, 3).join(', ')}
              {missing.length > 3 ? ' 등' : ''}) — 나중에 써도 괜찮아요.
            </p>
          )}
          <div className="footer-buttons">
            <button type="button" className="btn" onClick={() => go(step.index - 1)} disabled={step.index === 0}>
              ← 이전 단계
            </button>
            <button
              type="button"
              className="btn ghost"
              onClick={() => {
                dirty.current = true;
                flush();
              }}
            >
              💾 이 단계 저장
            </button>
            {step.index < LAST_STEP ? (
              <button type="button" className="btn primary" onClick={() => go(step.index + 1)}>
                {step.index === 5 ? '3~4차시로 →' : '다음 단계 →'}
              </button>
            ) : (
              <button type="button" className="btn primary" onClick={() => requestPrint('report')}>
                🖨️ 보고서 인쇄
              </button>
            )}
          </div>
        </footer>
      </div>
      <div className="print-host" aria-hidden="true">
        {printKind === 'report' && <Report p={project} />}
        {printKind === 'ideaCard' && <IdeaCardPrint p={project} />}
        {printKind === 'peerSheet' && <PeerSheetPrint />}
        {printKind === 'worksheet' && <WorksheetPrint />}
      </div>
      <TeacherDialog ref={teacherRef} />
    </>
  );
}

function SaveBadge({ save }: { save: SaveState }) {
  const text =
    save.kind === 'error'
      ? '⚠️ 저장 안 됨'
      : save.kind === 'saving'
        ? '저장하는 중…'
        : save.kind === 'saved'
          ? `✔ 자동 저장됨 ${timeText(save.at)}`
          : '자동 저장 준비';
  return (
    <span className={`save-badge ${save.kind}`} role="status" aria-live="polite">
      {text}
    </span>
  );
}

function StepNavigator({ current, onGo }: { current: number; onGo: (n: number) => void }) {
  return (
    <nav className="stepnav" aria-label="활동 단계">
      <ol>
        {steps.map((s) => (
          <li key={s.index} className={`${s.session === '3~4차시' ? 'second' : 'first'}${s.index === 6 ? ' session-start' : ''}`}>
            {s.index === 1 && <span className="session-label">1~2차시</span>}
            {s.index === 6 && <span className="session-label">3~4차시</span>}
            <button type="button" aria-current={s.index === current ? 'step' : undefined} className={s.index === current ? 'on' : s.index < current ? 'done' : ''} onClick={() => onGo(s.index)}>
              <span className="num">{s.index}</span>
              <span className="lbl">{s.short}</span>
            </button>
          </li>
        ))}
      </ol>
    </nav>
  );
}

interface LandingProps {
  saved: ProjectMeta[];
  message: string;
  onStart: (team: string, nick: string) => void;
  onOpen: (id: string) => void;
  onDelete: (id: string) => void;
  onImport: (f: File) => void;
  onTeacher: () => void;
}

function Landing({ saved, message, onStart, onOpen, onDelete, onImport, onTeacher }: LandingProps) {
  const [team, setTeam] = useState('');
  const [nick, setNick] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);
  const recentId = getCurrentProjectId();
  const recent = saved.find((m) => m.id === recentId) ?? saved[0];
  return (
    <main className="landing" id="main">
      <section className="hero">
        <p className="eyebrow">Ⅲ. 발명과 융합교육 · 12. 감성을 담은 유니버설 디자인</p>
        <h1>모두의 디자인 실험실</h1>
        <p className="subtitle">작은 차이를 발견하면 모두가 편리한 디자인이 시작돼요.</p>
        <p className="hero-q">내가 쓰기 편한 물건이 다른 사람에게도 편리할까요?</p>
        <ol className="flow-line" aria-label="활동 흐름">
          <li>사람을 이해해요</li>
          <li>디자인을 비교해요</li>
          <li>새로운 물건을 만들어요</li>
          <li>직접 확인하고 고쳐요</li>
        </ol>
      </section>
      <div className="landing-grid">
        <section className="card">
          <h2 className="card-title">✨ 새 디자인 탐험</h2>
          <p className="hint">실명은 적지 않아요. 비워 두어도 시작할 수 있어요.</p>
          <Field label="모둠 이름" optional value={team} onChange={setTeam} maxLength={40} placeholder="예: 햇살 모둠" />
          <Field label="발명가 별명" optional value={nick} onChange={setNick} maxLength={40} placeholder="예: 반짝 발명가" />
          <button type="button" className="btn primary big" onClick={() => onStart(team.trim(), nick.trim())}>
            새 디자인 탐험 시작하기
          </button>
        </section>
        <section className="card">
          <h2 className="card-title">📂 저장한 활동 이어하기</h2>
          {recent ? (
            <button type="button" className="btn primary big" onClick={() => onOpen(recent.id)}>
              저장한 활동 이어하기
              <small>
                「{recent.title}」 · {recent.currentStep}단계 · {new Date(recent.updatedAt).toLocaleString('ko-KR')}
              </small>
            </button>
          ) : (
            <>
              <button type="button" className="btn big" disabled>
                저장한 활동 이어하기
              </button>
              <p className="hint">이 기기에 저장된 활동이 아직 없어요. 다른 기기에서 했다면 활동 파일을 불러오세요.</p>
            </>
          )}
          {saved.length > 1 && (
            <>
              <h3 className="sub-title">다른 저장 활동 ({saved.length}개)</h3>
              <ul className="slot-list">
                {saved.map((m) => (
                  <li key={m.id}>
                    <span>
                      <strong>{m.title}</strong>
                      {m.nickname && ` · ${m.nickname}`}
                      <small> · {m.currentStep}단계 · {new Date(m.updatedAt).toLocaleDateString('ko-KR')}</small>
                    </span>
                    <span className="slot-actions">
                      <button type="button" className="btn small" onClick={() => onOpen(m.id)}>
                        열기
                      </button>
                      <button
                        type="button"
                        className="btn small danger"
                        onClick={() => window.confirm(`「${m.title}」 활동을 이 기기에서 지울까요? 되돌릴 수 없어요.`) && onDelete(m.id)}
                      >
                        지우기
                      </button>
                    </span>
                  </li>
                ))}
              </ul>
            </>
          )}
          <button type="button" className="btn ghost" onClick={() => fileRef.current?.click()}>
            활동 파일(JSON) 불러오기
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="application/json,.json"
            hidden
            onChange={(e) => {
              const f = e.target.files?.[0];
              e.target.value = '';
              if (f) onImport(f);
            }}
          />
          {message && (
            <p role="alert" className="error-text">
              {message}
            </p>
          )}
          {saved.length === 1 && (
            <button type="button" className="link-btn small" onClick={() => recent && window.confirm(`「${recent.title}」 활동을 이 기기에서 지울까요? 되돌릴 수 없어요.`) && onDelete(recent.id)}>
              저장한 활동 지우기
            </button>
          )}
        </section>
      </div>
      <div className="grid-2 landing-problems">
        <section className="card">
          <h2 className="card-title">📘 1~2차시 공부할 문제</h2>
          <p className="study-problem">{studyProblems.first}</p>
        </section>
        <section className="card">
          <h2 className="card-title">📗 3~4차시 공부할 문제</h2>
          <p className="study-problem">{studyProblems.second}</p>
        </section>
      </div>
      <div className="landing-foot">
        <button type="button" className="btn" onClick={onTeacher}>
          선생님 안내
        </button>
        <p className="hint">로그인 없이 이 기기·이 브라우저에만 저장돼요. 다른 기기와 자동으로 연결되지 않으니, 옮길 때는 활동 파일로 저장해 주세요.</p>
      </div>
    </main>
  );
}

const TeacherDialog = forwardRef<HTMLDialogElement>(function TeacherDialog(_, ref) {
  const g = teacherGuide;
  return (
    <dialog ref={ref} className="teacher-dialog" aria-labelledby="teacher-title">
      <div className="dialog-head">
        <h2 id="teacher-title">선생님 안내 — {g.title}</h2>
        <form method="dialog">
          <button type="submit" className="btn small" aria-label="선생님 안내 닫기">
            닫기 ✕
          </button>
        </form>
      </div>
      <p>
        <b>대상:</b> {g.target}
      </p>
      <p>
        <b>학습 목표:</b> {g.goal}
      </p>
      <p>
        <b>1~2차시:</b> {g.first}
      </p>
      <p>
        <b>3~4차시:</b> {g.second}
      </p>
      {g.sessions.map((s) => (
        <div key={s.name} className="table-wrap">
          <table className="r-table">
            <caption>{s.name}</caption>
            <thead>
              <tr>
                <th scope="col">시간</th>
                <th scope="col">수업 단계</th>
                <th scope="col">활동</th>
                <th scope="col">웹앱 화면</th>
              </tr>
            </thead>
            <tbody>
              {s.rows.map((r) => (
                <tr key={r[1] + r[0]}>
                  {r.map((c, i) => (
                    <td key={i}>{c}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}
      <ul className="tips">
        {g.tips.map((t) => (
          <li key={t}>{t}</li>
        ))}
      </ul>
      <p>
        <b>교사의 관찰 포인트:</b> {g.observe}
      </p>
      <p>
        <b>주의:</b> {g.caution}
      </p>
    </dialog>
  );
});
