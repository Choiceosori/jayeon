import { useRef, useState, type ChangeEvent, type ReactNode } from 'react';
import { describeSettings, diffSettings, experiments } from '../data/experiments';
import { situationById } from '../data/situations';
import { buildChecklist, steps, studyProblems, usabilityCriteria } from '../data/uiCopy';
import { PreviewGraphic, textAlternative } from '../components/DesignExperiment/DesignPreview';
import { Card, Field, Notice, isBlank } from '../components/common';
import type { Project12 } from '../models/Project12';
import { exportProjectFile } from '../storage/projectStorage';
import { buildStatusLabel, checkLabel, methodLabel, resultLabel } from './BuildScreens';
import { easeLabel } from './LabScreens';
import { missingFor, type ScreenProps } from './progress';

const EMPTY = '작성하지 않음';

function V({ children }: { children: string | null | undefined }) {
  return isBlank(children) ? <span className="empty">{EMPTY}</span> : <span className="pre">{children!.trim()}</span>;
}

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="r-row">
      <div className="r-label">{label}</div>
      <div className="r-value">{children}</div>
    </div>
  );
}

const evidenceLabel = { preview_comparison: '직접 실험에서 비교함', peer_opinion: '친구의 의견을 들음', prediction: '아직 예상함' };
const needsLabel = { observed: '직접 확인함', predicted: '예상함', asked: '사용자에게 물어봄', not_specified: '표시하지 않음' };

/** 인쇄용 A4 보고서. 화면 9에서도 미리 보기로 같은 컴포넌트를 쓴다. */
export function Report({ p }: { p: Project12 }) {
  const topic = p.designTopic;
  const diff = topic && p.beforeDesign && p.afterDesign ? diffSettings(topic, p.beforeDesign, p.afterDesign) : [];
  const sits = [...p.selectedSituationIds.map((id) => situationById(id)?.title ?? ''), ...(isBlank(p.customSituation) ? [] : [p.customSituation.trim()])].filter(Boolean);
  const idea = p.ideas.find((i) => i.id === p.selectedIdeaId);
  const funcs = p.coreFunctions.filter((f) => !isBlank(f));
  const usage = p.usageSteps.filter((s) => !isBlank(s));
  const today = new Date().toLocaleDateString('ko-KR');
  const anyEval = p.evaluations.some((e) => e.outcome !== 'not_checked' || !isBlank(e.reason));

  return (
    <article className="report">
      <header className="r-header">
        <h1>모두의 마음을 담은 디자인 발명 보고서</h1>
        <p className="r-meta">
          <span>모둠: {p.teamName.trim() || '-'}</span>
          <span>발명가: {p.nickname.trim() || '-'}</span>
          <span>날짜: {today}</span>
        </p>
        <p className="r-title">
          작품명: <strong>{p.inventionName.trim() || EMPTY}</strong>
        </p>
      </header>

      <section className="r-section">
        <h2>1쪽 · 사람을 이해하고 디자인 구상하기</h2>
        <p className="r-problem">공부할 문제: {studyProblems.first}</p>
        <Row label="살펴본 사용자 상황">{sits.length ? sits.join(', ') : <span className="empty">{EMPTY}</span>}</Row>
        <Row label="하려는 일">
          <V>{p.userTask}</V>
        </Row>
        <Row label="불편할 수 있는 점">
          <V>{p.difficulty}</V>
        </Row>
        <Row label="도움이 될 변화">
          <V>{p.assumedNeed}</V> <small>({needsLabel[p.needsEvidence]})</small>
        </Row>
        <h3>디자인 실험: {topic ? `${experiments[topic].emoji} ${experiments[topic].title}` : <span className="empty">실험 디자인을 저장하지 않음</span>}</h3>
        {topic && (
          <div className="r-compare">
            {(['beforeDesign', 'afterDesign'] as const).map((k) => {
              const s = p[k];
              const cap = k === 'beforeDesign' ? '처음 디자인' : '개선 디자인';
              return (
                <figure key={k} className="r-figure">
                  <figcaption>{cap}</figcaption>
                  {s ? (
                    <>
                      <PreviewGraphic topic={topic} settings={s} label={`${cap}: ${describeSettings(topic, s)}`} />
                      <p className="r-small">{describeSettings(topic, s)}</p>
                      <p className="r-small sr-print">글 설명: {textAlternative(topic, s).join(' / ')}</p>
                    </>
                  ) : (
                    <p className="empty">저장하지 않음</p>
                  )}
                </figure>
              );
            })}
          </div>
        )}
        <Row label="달라진 요소">{diff.length ? diff.join(' / ') : <span className="empty">비교 기록 없음</span>}</Row>
        <Row label="무엇을 바꾸었나요">
          <V>{p.comparisonNotes.whatChanged}</V>
        </Row>
        <Row label="도움이 되는 상황">
          <V>{p.comparisonNotes.whoBenefits}</V>
        </Row>
        <Row label="개선 이유(사용성)">
          <V>{p.comparisonNotes.usabilityReason}</V>
        </Row>
        <Row label="감성적 고려">
          <V>{p.comparisonNotes.emotionalImpression}</V>
        </Row>
        <Row label="직접 확인하지 못한 점">
          <V>{p.comparisonNotes.unverifiedPoints}</V>
        </Row>
        <Row label="생각의 근거">{p.comparisonNotes.evidence ? evidenceLabel[p.comparisonNotes.evidence] : <span className="empty">선택하지 않음</span>}</Row>
        {topic && (
          <Row label="관찰 활동">
            {experiments[topic].observationTask} — 처음: {easeLabel(p.observation.before)}, 개선: {easeLabel(p.observation.after)}
            {!isBlank(p.observation.note) && <> ({p.observation.note.trim()})</>}
          </Row>
        )}
        <Row label="다시 디자인할 물건">
          <V>{p.targetObject}</V>
        </Row>
        <Row label="함께 고려한 사용자·상황">{p.affectedUsersAndSituations.length ? p.affectedUsersAndSituations.join(', ') : <span className="empty">{EMPTY}</span>}</Row>
        <Row label="문제 정의">
          <V>{p.problemDefinition}</V>
        </Row>
        <Row label="최종 아이디어">{idea ? <>{idea.title || '(이름 없음)'} — {idea.newFunction || EMPTY}</> : <span className="empty">선택하지 않음</span>}</Row>
        <Row label="고른 이유">
          <V>{p.selectionReason}</V>
        </Row>
      </section>

      <section className="r-section r-page2">
        <h2>2쪽 · 발명품을 만들고 개선하기</h2>
        <p className="r-problem">공부할 문제: {studyProblems.second}</p>
        <Row label="발명품 이름">
          <V>{p.inventionName}</V>
        </Row>
        <Row label="기존 물건의 불편함">
          <V>{p.existingProblem || p.problemDefinition}</V>
        </Row>
        <Row label="핵심 기능">{funcs.length ? <ol>{funcs.map((f, i) => <li key={i}>{f}</li>)}</ol> : <span className="empty">{EMPTY}</span>}</Row>
        <Row label="주요 디자인 요소">
          <V>{p.appearanceAndIndicators}</V>
        </Row>
        <Row label="심미성·친근함">
          <V>{p.emotionalDesign}</V>
        </Row>
        <Row label="사용 방법">{usage.length ? <ol>{usage.map((s, i) => <li key={i}>{s}</li>)}</ol> : <span className="empty">{EMPTY}</span>}</Row>
        <Row label="재료 및 도구">{p.materials.length ? p.materials.join(', ') : <span className="empty">{EMPTY}</span>}</Row>
        <div className="r-sketch">
          <h3>발명품 설계도</h3>
          {p.sketchDataUrl ? <img src={p.sketchDataUrl} alt={p.sketchText.trim() ? `설계도 그림. 설명: ${p.sketchText.trim()}` : '학생이 그린 발명품 설계도'} /> : <p className="empty">설계도 그림 없음 (아래 글 설명 참고)</p>}
          <Row label="설계도 글 설명">
            <V>{p.sketchText}</V>
          </Row>
        </div>
        <Row label="제작 상태">
          <strong>{buildStatusLabel[p.buildStatus]}</strong>
          {p.buildStatus === 'not_started' && ' (실물 제작 미실시)'}
        </Row>
        <Row label="사용한 재료">
          <V>{p.buildMaterials}</V>
        </Row>
        <Row label="제작 과정">
          <V>{p.buildNotes}</V>
        </Row>
        <Row label="계획과 달라진 점">
          <V>{p.changedDuringBuild}</V>
        </Row>
        <Row label="어려웠던 점">
          <V>{p.buildDifficulty}</V>
        </Row>
        <Row label="제작 체크리스트">{buildChecklist.map((c) => `${c.label.split(' (')[0]} ${checkLabel[p.buildChecklist[c.id] ?? 'not_checked']}`).join(' · ')}</Row>
        <Row label="발명품 사진">{p.photoDataUrl ? <img className="r-photo" src={p.photoDataUrl} alt="발명품 모형 사진" /> : <span className="empty">사진 미첨부</span>}</Row>
        <h3>사용성 평가</h3>
        <Row label="평가 방법">{p.evaluationMethod ? methodLabel[p.evaluationMethod] : <span className="empty">선택하지 않음 (평가 미실시)</span>}</Row>
        <table className="r-table">
          <thead>
            <tr>
              <th scope="col">점검 항목</th>
              <th scope="col">결과</th>
              <th scope="col">근거</th>
            </tr>
          </thead>
          <tbody>
            {usabilityCriteria.map((c) => {
              const e = p.evaluations.find((x) => x.criterionId === c.id);
              return (
                <tr key={c.id}>
                  <td>{c.label}</td>
                  <td>{resultLabel[e?.outcome ?? 'not_checked']}</td>
                  <td>{isBlank(e?.reason) ? <span className="empty">-</span> : e!.reason}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {!anyEval && <p className="r-small">※ 사용성 평가 결과가 기록되지 않았어요(미실시).</p>}
        <Row label="친구가 좋다고 한 점">
          <V>{p.peerPositive}</V>
        </Row>
        <Row label="친구가 불편하다고 한 점">
          <V>{p.peerDifficulty}</V>
        </Row>
        <Row label="내가 개선할 점">
          <V>{p.improvementPlan}</V>
        </Row>
        <Row label="실제로 바꾼 점">
          <V>{p.improvementDone}</V>
        </Row>
        <Row label="바꾼 뒤의 결과">
          <V>{p.afterImprovement}</V>
        </Row>
        {!isBlank(p.perfectReflection) && (
          <Row label="완벽하다고 단정하기 어려운 이유">
            <V>{p.perfectReflection}</V>
          </Row>
        )}
        <Row label="여러 사람에게 도움이 될 수 있는 이유">
          <V>{p.helpReason}</V>
        </Row>
        <Row label="최종 소감">
          <V>{p.reflection}</V>
        </Row>
      </section>
    </article>
  );
}

/* 화면 9 — 모두의 디자인 전시회 */
export function ExhibitStep({ p, update, go, requestPrint, onNewProject, onImport }: ScreenProps & { onNewProject: () => void; onImport: (f: File) => Promise<void> }) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [msg, setMsg] = useState('');
  const missing = steps.slice(1).map((s) => ({ s, m: missingFor(s.index, p) })).filter((x) => x.m.length);
  const pickFile = async (e: ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    e.target.value = '';
    if (!f) return;
    try {
      await onImport(f);
    } catch (err) {
      setMsg(err instanceof Error ? err.message : '파일을 불러오지 못했어요.');
    }
  };
  return (
    <div className="stack">
      <Card title="🌟 마지막으로 정리해요">
        <Field multiline label="이 디자인이 여러 사람에게 도움이 될 수 있는 이유" value={p.helpReason} onChange={(v) => update({ helpReason: v })} />
        <Field multiline label="최종 소감" value={p.reflection} onChange={(v) => update({ reflection: v })} placeholder="예: 작은 불편함을 발견하는 것이 디자인의 시작이라는 걸 알았어요." />
      </Card>
      {missing.length > 0 ? (
        <Notice kind="info">
          <p>
            <strong>아직 쓰지 않은 칸이 있어요.</strong> 보고서에는 '작성하지 않음'으로 표시돼요. 눌러서 해당 단계로 갈 수 있어요.
          </p>
          <ul className="missing-list">
            {missing.map(({ s, m }) => (
              <li key={s.index}>
                <button type="button" className="link-btn" onClick={() => go(s.index)}>
                  {s.index}. {s.title}
                </button>{' '}
                — {m.join(', ')}
              </li>
            ))}
          </ul>
        </Notice>
      ) : (
        <Notice kind="tip">모든 칸을 채웠어요! 보고서를 인쇄해 전시회에서 발표해 보세요.</Notice>
      )}
      <div className="action-bar">
        <button type="button" className="btn primary" onClick={() => requestPrint('report')}>
          🖨️ 발명 보고서 인쇄하기
        </button>
        <button type="button" className="btn" onClick={() => exportProjectFile(p)}>
          💾 활동 내용 파일로 저장하기(JSON)
        </button>
        <button type="button" className="btn" onClick={() => fileRef.current?.click()}>
          📂 활동 파일 불러오기
        </button>
        <input ref={fileRef} type="file" accept="application/json,.json" hidden onChange={pickFile} />
        <button type="button" className="btn" onClick={() => requestPrint('peerSheet')}>
          📄 친구 평가표 인쇄
        </button>
        <button type="button" className="btn" onClick={() => requestPrint('worksheet')}>
          📄 학생 활동지 인쇄
        </button>
        <button type="button" className="btn" onClick={() => go(1)}>
          ✏️ 다시 수정하기
        </button>
        <button type="button" className="btn danger" onClick={onNewProject}>
          ✨ 새 디자인 시작하기
        </button>
      </div>
      <p className="hint">PDF로 저장하려면 [발명 보고서 인쇄하기]에서 프린터 대신 'PDF로 저장'을 고르세요. 활동 파일에는 설계도·사진도 함께 들어가요.</p>
      {msg && (
        <p role="alert" className="error-text">
          {msg}
        </p>
      )}
      <h3 className="section-title">보고서 미리 보기</h3>
      <div className="report-preview">
        <Report p={p} />
      </div>
    </div>
  );
}

/* 1~2차시 디자인 아이디어 카드 (인쇄용) */
export function IdeaCardPrint({ p }: { p: Project12 }) {
  const idea = p.ideas.find((i) => i.id === p.selectedIdeaId);
  return (
    <article className="report">
      <header className="r-header">
        <h1>1~2차시 디자인 아이디어 카드</h1>
        <p className="r-meta">
          <span>모둠: {p.teamName.trim() || '-'}</span>
          <span>발명가: {p.nickname.trim() || '-'}</span>
        </p>
      </header>
      <Row label="바꾸고 싶은 물건">
        <V>{p.targetObject}</V>
      </Row>
      <Row label="고려한 사용자·상황">{p.affectedUsersAndSituations.join(', ') || <span className="empty">{EMPTY}</span>}</Row>
      <Row label="문제 정의">
        <V>{p.problemDefinition}</V>
      </Row>
      <h3>아이디어 비교</h3>
      <table className="r-table">
        <thead>
          <tr>
            <th scope="col">아이디어</th>
            <th scope="col">새로 바꿀 기능</th>
            <th scope="col">편리함</th>
            <th scope="col">보기 좋음·친근함</th>
            <th scope="col">제작 방법</th>
          </tr>
        </thead>
        <tbody>
          {p.ideas.map((i, n) => (
            <tr key={i.id}>
              <td>
                {i.id === p.selectedIdeaId ? '★ ' : ''}
                {i.title || `아이디어 ${n + 1}`}
              </td>
              <td>{i.newFunction || '-'}</td>
              <td>{i.usabilityFeatures || '-'}</td>
              <td>{i.emotionalFeatures || '-'}</td>
              <td>{i.feasibility || '-'}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <Row label="최종 아이디어">{idea ? idea.title || '(이름 없음)' : <span className="empty">선택하지 않음</span>}</Row>
      <Row label="고른 이유">
        <V>{p.selectionReason}</V>
      </Row>
    </article>
  );
}

/* 다른 학생 디자인을 평가하는 종이 평가표 */
export function PeerSheetPrint() {
  return (
    <article className="report sheet">
      <header className="r-header">
        <h1>친구 발명품 사용성 평가표</h1>
        <p className="r-meta">
          <span>평가한 작품: ____________________</span>
          <span>평가한 사람(별명): ____________</span>
        </p>
      </header>
      <p>직접 사용해 본 뒤 해당하는 칸에 ✔ 하고, 이유를 적어 주세요. 점수가 아니라 의견을 나누는 활동이에요.</p>
      <table className="r-table sheet-table">
        <thead>
          <tr>
            <th scope="col">점검 항목</th>
            <th scope="col">잘됨</th>
            <th scope="col">보완 필요</th>
            <th scope="col">확인 못함</th>
            <th scope="col">이유</th>
          </tr>
        </thead>
        <tbody>
          {usabilityCriteria.map((c) => (
            <tr key={c.id}>
              <td>{c.label}</td>
              <td>□</td>
              <td>□</td>
              <td>□</td>
              <td className="write-cell" />
            </tr>
          ))}
        </tbody>
      </table>
      <div className="write-box">
        <p>👍 좋았던 점</p>
      </div>
      <div className="write-box">
        <p>🔧 불편했던 점 / 이렇게 바꾸면 좋겠어요</p>
      </div>
    </article>
  );
}

/* 학생용 활동지 (9-2) */
export function WorksheetPrint() {
  const blocks: [string, string[]][] = [
    ['1. 사용자의 입장에서 불편함을 찾아봅시다.', ['관찰하거나 개선할 물건', '물건을 사용하는 사람과 상황', '사용하면서 겪는 불편함', '불편함이 생기는 까닭', '사용자가 원하는 기능']],
    ['2. 모두를 위한 디자인을 구상해 봅시다.', ['발명품의 이름', '새롭게 추가하거나 개선할 기능', '편리함을 위해 고려한 점', '친근하고 아름답게 느껴지도록 고려한 점', '발명품 예상 모습']],
    ['3. 발명품을 제작하고 평가해 봅시다.', ['준비한 재료 / 제작 방법', '사용해 보고 편리했던 점', '개선이 필요한 점 / 친구 의견', '수정하거나 보완한 내용']],
  ];
  return (
    <article className="report sheet">
      <header className="r-header">
        <h1>모두의 마음을 담은 디자인 발명가</h1>
        <p className="r-meta">
          <span>모둠: ____________</span>
          <span>별명: ____________</span>
        </p>
      </header>
      {blocks.map(([title, items]) => (
        <section key={title} className="ws-block">
          <h2>{title}</h2>
          {items.map((it) => (
            <div key={it} className={`ws-line${it === '발명품 예상 모습' ? ' tall' : ''}`}>
              <span>{it}:</span>
            </div>
          ))}
        </section>
      ))}
    </article>
  );
}
