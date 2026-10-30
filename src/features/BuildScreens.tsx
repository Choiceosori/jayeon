import { useState, type ChangeEvent } from 'react';
import { buildChecklist, usabilityCriteria } from '../data/uiCopy';
import { Card, ChoiceGroup, Field, Notice, isBlank } from '../components/common';
import type { BuildStatus, CheckState, EvaluationMethod, TestResult } from '../models/Project12';
import type { ScreenProps } from './progress';

export const buildStatusLabel: Record<BuildStatus, string> = {
  not_started: '아직 만들기 전',
  in_progress: '만드는 중',
  completed: '모형 완성',
};
export const checkLabel: Record<CheckState, string> = { yes: '그렇다', needs: '보완 필요', not_checked: '확인 못함' };
export const resultLabel: Record<TestResult, string> = { good: '잘됨', needs_improvement: '보완 필요', not_checked: '확인 못함' };
export const methodLabel: Record<EvaluationMethod, string> = {
  self_test: '내가 직접 사용해 봄',
  peer_test: '친구가 사용해 보고 의견을 줌',
  not_tested: '아직 확인하지 못함',
};

/** 사진을 적당한 크기로 줄여 JPEG 데이터로 만든다 */
async function shrinkImage(file: File, max = 1280): Promise<string> {
  const url = URL.createObjectURL(file);
  try {
    const img = new Image();
    await new Promise<void>((res, rej) => {
      img.onload = () => res();
      img.onerror = () => rej(new Error('사진을 열 수 없어요.'));
      img.src = url;
    });
    const scale = Math.min(1, max / Math.max(img.width, img.height));
    const c = document.createElement('canvas');
    c.width = Math.round(img.width * scale);
    c.height = Math.round(img.height * scale);
    const ctx = c.getContext('2d');
    if (!ctx) throw new Error('사진을 처리할 수 없어요.');
    ctx.drawImage(img, 0, 0, c.width, c.height);
    return c.toDataURL('image/jpeg', 0.82);
  } finally {
    URL.revokeObjectURL(url);
  }
}

/* 화면 7 — 실물 발명품 제작 기록 */
export function PrototypeStep({ p, update, setMedia }: ScreenProps) {
  const [photoMsg, setPhotoMsg] = useState('');
  const onPhoto = async (e: ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    e.target.value = '';
    if (!f) return;
    if (!f.type.startsWith('image/')) {
      setPhotoMsg('사진(그림) 파일만 올릴 수 있어요.');
      return;
    }
    try {
      setMedia('photoDataUrl', await shrinkImage(f));
      setPhotoMsg('사진을 붙였어요.');
    } catch (err) {
      setPhotoMsg(err instanceof Error ? err.message : '사진을 붙이지 못했어요.');
    }
  };
  return (
    <div className="stack">
      <Notice kind="tip">제작 시간에는 화면보다 손으로 만드는 활동이 먼저예요! 기록은 짧게 해도 괜찮아요.</Notice>
      <Card title="🛠️ 제작 상태">
        <ChoiceGroup<BuildStatus>
          legend="지금 내 발명품은?"
          name="buildStatus"
          value={p.buildStatus}
          onChange={(v) => update({ buildStatus: v })}
          hint="실제 상태대로 골라요. 앱이 저절로 '완성'으로 바꾸지 않아요."
          options={(Object.keys(buildStatusLabel) as BuildStatus[]).map((k) => ({ value: k, label: buildStatusLabel[k] }))}
        />
      </Card>
      <Card title="📝 제작 기록">
        <Field multiline label="사용한 재료" value={p.buildMaterials} onChange={(v) => update({ buildMaterials: v })} placeholder={p.materials.length ? `계획한 재료: ${p.materials.join(', ')}` : '예: 골판지, 색테이프'} />
        <Field multiline label="어떻게 만들었나요?" value={p.buildNotes} onChange={(v) => update({ buildNotes: v })} />
        <Field multiline label="계획과 달라진 점" value={p.changedDuringBuild} onChange={(v) => update({ changedDuringBuild: v })} />
        <Field multiline label="제작하면서 어려웠던 점" value={p.buildDifficulty} onChange={(v) => update({ buildDifficulty: v })} />
      </Card>
      <Card title="📷 발명품 사진 (선택)">
        <p className="hint">사람 얼굴이나 이름표가 나오지 않게, 발명품만 찍어 주세요. 사진은 이 기기에만 저장돼요.</p>
        <div className="row-actions">
          <label className="btn file-btn">
            사진 고르기
            <input type="file" accept="image/*" onChange={onPhoto} />
          </label>
          {p.photoDataUrl && (
            <button type="button" className="btn ghost" onClick={() => window.confirm('사진을 지울까요?') && setMedia('photoDataUrl', null)}>
              사진 지우기
            </button>
          )}
          <span role="status" className="flash">
            {photoMsg}
          </span>
        </div>
        {p.photoDataUrl && <img className="photo-preview" src={p.photoDataUrl} alt="내가 만든 발명품 모형 사진" />}
      </Card>
      <Card title="✅ 실물 제작 체크리스트">
        <p className="hint">만든 모형을 직접 보고 확인한 뒤 골라요.</p>
        {buildChecklist.map((c) => (
          <ChoiceGroup<CheckState>
            key={c.id}
            legend={c.label}
            name={`bc-${c.id}`}
            value={p.buildChecklist[c.id] ?? 'not_checked'}
            onChange={(v) => update((cur) => ({ buildChecklist: { ...cur.buildChecklist, [c.id]: v } }))}
            options={(Object.keys(checkLabel) as CheckState[]).map((k) => ({ value: k, label: checkLabel[k] }))}
          />
        ))}
      </Card>
    </div>
  );
}

/* 화면 8 — 사용성 평가하고 개선하기 */
export function EvaluateStep({ p, update }: ScreenProps) {
  const untested = p.evaluationMethod === 'not_tested' || !p.evaluationMethod;
  const setEval = (id: string, patch: Partial<{ outcome: TestResult; reason: string }>) =>
    update((cur) => ({ evaluations: cur.evaluations.map((e) => (e.criterionId === id ? { ...e, ...patch } : e)) }));
  const checkedCount = p.evaluations.filter((e) => e.outcome !== 'not_checked').length;

  return (
    <div className="stack">
      <Card title="🧪 평가 방법">
        <ChoiceGroup<EvaluationMethod>
          legend="어떻게 확인했나요?"
          name="evalMethod"
          value={p.evaluationMethod}
          onChange={(v) => update({ evaluationMethod: v })}
          options={(Object.keys(methodLabel) as EvaluationMethod[]).map((k) => ({ value: k, label: methodLabel[k] }))}
        />
        {p.evaluationMethod === 'not_tested' && (
          <Notice kind="info">아직 확인하지 못했다면 아래 점검표는 '확인 못함'으로 두고, 확인할 계획만 적어도 괜찮아요.</Notice>
        )}
      </Card>
      <Card title="📋 사용성 점검표">
        <p className="hint">직접 확인한 결과만 '잘됨' 또는 '보완 필요'로 골라요. 이유도 짧게 적어요.</p>
        {untested && checkedCount > 0 && (
          <Notice kind="warn">평가 방법이 '아직 확인하지 못함'(또는 미선택)인데 결과가 표시된 항목이 있어요. 실제로 확인했다면 평가 방법을 골라 주세요.</Notice>
        )}
        <div className="criteria">
          {usabilityCriteria.map((c, i) => {
            const ev = p.evaluations.find((e) => e.criterionId === c.id)!;
            return (
              <div key={c.id} className="criterion">
                <ChoiceGroup<TestResult>
                  legend={
                    <>
                      {i + 1}. {c.label} <span className="tag soft">{c.aspect}</span>
                    </>
                  }
                  name={`ev-${c.id}`}
                  value={ev.outcome}
                  onChange={(v) => setEval(c.id, { outcome: v })}
                  options={(Object.keys(resultLabel) as TestResult[]).map((k) => ({ value: k, label: resultLabel[k] }))}
                />
                <Field label="이유" value={ev.reason} onChange={(v) => setEval(c.id, { reason: v })} />
              </div>
            );
          })}
        </div>
      </Card>
      <Card title="💬 친구 의견과 개선">
        <div className="grid-2">
          <Field multiline label="친구가 좋다고 한 점" value={p.peerPositive} onChange={(v) => update({ peerPositive: v })} />
          <Field multiline label="친구가 불편하다고 한 점" value={p.peerDifficulty} onChange={(v) => update({ peerDifficulty: v })} placeholder="예: 그림이 작아요" />
        </div>
        <Field multiline label="내가 개선할 점" value={p.improvementPlan} onChange={(v) => update({ improvementPlan: v })} placeholder="예: 그림을 더 크게 변경" />
        <Field multiline label="실제로 바꾼 점" value={p.improvementDone} onChange={(v) => update({ improvementDone: v })} hint="아직 바꾸지 못했다면 비워 두세요." />
        <Field multiline label="바꾸고 난 뒤의 결과" value={p.afterImprovement} onChange={(v) => update({ afterImprovement: v })} hint="바꾼 뒤 다시 확인한 내용만 적어요." />
      </Card>
      <ImprovementCard p={p} />
      <Card title="🤔 더 생각해 보기 (선택)">
        <Field multiline optional label="이 디자인이 모든 사람에게 완벽하다고 단정하기 어려운 이유는 무엇일까요?" value={p.perfectReflection} onChange={(v) => update({ perfectReflection: v })} />
      </Card>
    </div>
  );
}

export function ImprovementCard({ p }: { p: ScreenProps['p'] }) {
  const plan = [p.inventionName, ...p.coreFunctions.filter((f) => !isBlank(f))].filter((x) => !isBlank(x)).join(' / ');
  const checked = p.evaluations
    .filter((e) => e.outcome !== 'not_checked')
    .map((e) => `${usabilityCriteria.find((c) => c.id === e.criterionId)?.aspect}: ${resultLabel[e.outcome]}`);
  const found = [...checked, ...(isBlank(p.peerDifficulty) ? [] : [`친구 의견: ${p.peerDifficulty.trim()}`])];
  const improved = [p.improvementDone, p.afterImprovement].filter((x) => !isBlank(x)).join(' → ');
  return (
    <section className="card flow-card" aria-label="처음 계획에서 개선한 디자인까지">
      <div>
        <h4>처음 계획</h4>
        <p>{plan || '작성하지 않음'}</p>
      </div>
      <span className="flow-arrow" aria-hidden="true">
        →
      </span>
      <div>
        <h4>직접 확인한 점</h4>
        <p>{found.length ? found.join(' · ') : '아직 확인하지 않음'}</p>
      </div>
      <span className="flow-arrow" aria-hidden="true">
        →
      </span>
      <div>
        <h4>개선한 디자인</h4>
        <p>{improved || (isBlank(p.improvementPlan) ? '작성하지 않음' : `계획: ${p.improvementPlan.trim()} (아직 바꾸지 않음)`)}</p>
      </div>
    </section>
  );
}
