import { useState } from 'react';
import { describeSettings, diffSettings, experiments, topicList } from '../data/experiments';
import { situationById } from '../data/situations';
import DesignControls from '../components/DesignExperiment/DesignControls';
import DesignPreview from '../components/DesignExperiment/DesignPreview';
import { Card, ChoiceGroup, Field, Notice } from '../components/common';
import type { DesignTopic, EvidenceType, ObservationEase } from '../models/Project12';
import type { ScreenProps } from './progress';

const sameSettings = (a: Record<string, string>, b: Record<string, string>) => Object.keys(a).every((k) => a[k] === b[k]);

/* 화면 3 — 모두의 디자인 실험실 */
export function LabStep({ p, update, go }: ScreenProps) {
  const [flash, setFlash] = useState('');
  const topic = p.topic;
  const recommended = new Set(
    p.selectedSituationIds.flatMap((id) => situationById(id)?.recommendedFor ?? []),
  );

  const chooseTopic = (t: DesignTopic) => {
    if (t === p.topic) return;
    if (p.designTopic && p.designTopic !== t && (p.beforeDesign || p.afterDesign)) {
      const ok = window.confirm(
        `실험 주제를 「${experiments[t].title}」(으)로 바꾸면 「${experiments[p.designTopic].title}」에서 저장한 처음/개선 디자인이 지워져요.\n(비교 화면에 적은 글은 남아 있어요.) 바꿀까요?`,
      );
      if (!ok) return;
      update({ topic: t, designTopic: null, beforeDesign: null, afterDesign: null, changeSummary: [], comparisonRecordedAt: null });
    } else {
      update({ topic: t });
    }
    setFlash('');
  };

  if (!topic) {
    return (
      <div className="stack">
        <TopicPicker current={null} recommended={recommended} onPick={chooseTopic} />
        <Notice kind="tip">실험할 대상을 하나 고르면 조절 패널과 미리 보기가 나타나요.</Notice>
      </div>
    );
  }

  const exp = experiments[topic];
  const settings = p.labSettings[topic];
  const savedForThis = p.designTopic === topic;
  const before = savedForThis ? p.beforeDesign : null;
  const after = savedForThis ? p.afterDesign : null;
  const liveDiff = before ? diffSettings(topic, before, settings) : [];

  const setSetting = (key: string, value: string) =>
    update((cur) => ({ labSettings: { ...cur.labSettings, [topic]: { ...cur.labSettings[topic], [key]: value } } }));

  const resetToInitial = () => {
    update((cur) => ({ labSettings: { ...cur.labSettings, [topic]: { ...exp.initial } } }));
    setFlash('처음 모습으로 되돌렸어요.');
  };

  const saveBefore = () => {
    if (before && !window.confirm('이미 저장한 처음 디자인이 있어요. 지금 모습으로 바꿀까요?')) return;
    update((cur) => {
      const nextAfter = cur.designTopic === topic ? cur.afterDesign : null;
      return {
        designTopic: topic,
        beforeDesign: { ...settings },
        afterDesign: nextAfter,
        changeSummary: nextAfter ? diffSettings(topic, settings, nextAfter) : [],
      };
    });
    setFlash('처음 디자인을 저장했어요. 이제 요소를 바꿔 개선해 보세요.');
  };

  const saveAfter = () => {
    if (before && sameSettings(before, settings)) {
      setFlash('지금 모습이 처음 디자인과 같아요. 조절 항목을 바꾼 뒤 저장해 보세요.');
      return;
    }
    if (after && !window.confirm('이미 저장한 개선 디자인이 있어요. 지금 모습으로 바꿀까요?')) return;
    update((cur) => {
      const nextBefore = cur.designTopic === topic ? cur.beforeDesign : null;
      return {
        designTopic: topic,
        afterDesign: { ...settings },
        beforeDesign: nextBefore,
        changeSummary: nextBefore ? diffSettings(topic, nextBefore, settings) : [],
      };
    });
    setFlash(before ? '개선 디자인을 저장했어요. [비교하기]로 나란히 볼 수 있어요.' : '개선 디자인을 저장했어요. 비교하려면 처음 디자인도 저장해 주세요.');
  };

  return (
    <div className="stack">
      <TopicPicker current={topic} recommended={recommended} onPick={chooseTopic} />
      <p className="lab-headline">
        {exp.emoji} {exp.headline} <span className="hint">— {exp.sampleUse}</span>
      </p>
      <div className="lab">
        <div className="lab-preview">
          <DesignPreview topic={topic} settings={settings} caption="지금 디자인 미리 보기" />
          {before && (
            <p className="diff-live" aria-live="polite">
              <span className="tag">처음 디자인과 달라진 점</span> {liveDiff.length ? liveDiff.join(' / ') : '아직 없어요'}
            </p>
          )}
        </div>
        <div className="lab-controls card">
          <h3 className="card-title">🎛️ 조절해 보세요</h3>
          <DesignControls topic={topic} settings={settings} onChange={setSetting} />
          <div className="lab-actions">
            <button type="button" className="btn" onClick={resetToInitial}>
              ↺ 처음 모습으로 돌아가기
            </button>
            <button type="button" className="btn" onClick={saveBefore}>
              📌 처음 디자인 저장
            </button>
            <button type="button" className="btn" onClick={saveAfter}>
              ⭐ 개선 디자인 저장
            </button>
            <button type="button" className="btn primary" onClick={() => go(4)}>
              ⇄ 비교하기
            </button>
          </div>
          <p className="flash" role="status">
            {flash}
          </p>
          <ul className="saved-state">
            <li>
              <span className={`state-dot ${before ? 'ok' : ''}`} aria-hidden="true">
                {before ? '✔' : '○'}
              </span>
              처음 디자인: {before ? describeSettings(topic, before) : '아직 저장하지 않음'}
            </li>
            <li>
              <span className={`state-dot ${after ? 'ok' : ''}`} aria-hidden="true">
                {after ? '✔' : '○'}
              </span>
              개선 디자인: {after ? describeSettings(topic, after) : '아직 저장하지 않음'}
            </li>
          </ul>
          <p className="hint">순서 예시: 원래 모습 그대로 [처음 디자인 저장] → 요소 조절 → [개선 디자인 저장] → [비교하기]</p>
        </div>
      </div>
      {exp.notice && <Notice kind="warn">{exp.notice}</Notice>}
      <Card title="👀 관찰 질문">
        <ul className="question-list">
          {exp.observeQuestions.map((q) => (
            <li key={q}>{q}</li>
          ))}
        </ul>
        <Field
          multiline
          label="실험하면서 발견한 점을 적어요"
          optional
          value={p.labNotes[topic]}
          onChange={(v) => update((cur) => ({ labNotes: { ...cur.labNotes, [topic]: v } }))}
          placeholder="예: 그림과 글자를 함께 보여 주니 처음 온 사람도 쉽게 찾을 것 같아요."
        />
      </Card>
    </div>
  );
}

function TopicPicker({ current, recommended, onPick }: { current: DesignTopic | null; recommended: Set<DesignTopic>; onPick: (t: DesignTopic) => void }) {
  return (
    <fieldset className="control-group">
      <legend>실험 대상 선택</legend>
      <div className="topic-row">
        {topicList.map((t) => (
          <label key={t} className={`topic-card${current === t ? ' checked' : ''}`}>
            <input type="radio" name="lab-topic" checked={current === t} onChange={() => onPick(t)} />
            <span className="topic-emoji" aria-hidden="true">
              {experiments[t].emoji}
            </span>
            <span>
              <strong>{experiments[t].title}</strong>
              {recommended.has(t) && <span className="tag soft">내가 고른 상황과 연결</span>}
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}

const easeOptions: { value: ObservationEase; label: string }[] = [
  { value: 'easy', label: '쉬웠어요' },
  { value: 'bit_hard', label: '조금 어려웠어요' },
  { value: 'hard', label: '어려웠어요' },
  { value: 'not_tried', label: '아직 해 보지 않았어요' },
];
export const easeLabel = (v: ObservationEase) => easeOptions.find((o) => o.value === v)?.label ?? '';

/* 화면 4 — 처음 디자인과 개선 디자인 비교 */
export function CompareStep({ p, update, go }: ScreenProps) {
  const [flash, setFlash] = useState('');
  const topic = p.designTopic;
  const notes = p.comparisonNotes;
  const setNote = (k: keyof typeof notes, v: string | EvidenceType) => update((cur) => ({ comparisonNotes: { ...cur.comparisonNotes, [k]: v } }));

  if (!topic || !p.beforeDesign || !p.afterDesign) {
    return (
      <div className="stack">
        <Notice kind="info">
          <p>
            <strong>비교하려면 두 디자인이 모두 필요해요.</strong>
          </p>
          <ul>
            <li>처음 디자인: {p.beforeDesign ? '저장됨 ✔' : '아직 저장하지 않았어요'}</li>
            <li>개선 디자인: {p.afterDesign ? '저장됨 ✔' : '아직 저장하지 않았어요'}</li>
          </ul>
          <p>실험실에서 [처음 디자인 저장]과 [개선 디자인 저장]을 눌러 주세요.</p>
        </Notice>
        <button type="button" className="btn primary" onClick={() => go(3)}>
          ← 디자인 실험실로 가기
        </button>
      </div>
    );
  }
  const exp = experiments[topic];
  const diff = diffSettings(topic, p.beforeDesign, p.afterDesign);

  const record = () => {
    update({ changeSummary: diff, comparisonRecordedAt: new Date().toISOString() });
    setFlash('비교 결과를 기록했어요. 보고서에 들어가요.');
  };

  return (
    <div className="stack">
      <p className="lab-headline">
        {exp.emoji} {exp.title} — 같은 내용을 디자인만 바꿔 비교해요.
      </p>
      <div className="compare">
        <DesignPreview topic={topic} settings={p.beforeDesign} caption="처음 디자인" compact />
        <DesignPreview topic={topic} settings={p.afterDesign} caption="내가 개선한 디자인" compact allowPng pngName={`개선디자인_${exp.title}.png`} />
      </div>
      <Card title="🔁 달라진 요소">
        {diff.length ? (
          <ul className="diff-list">
            {diff.map((d) => (
              <li key={d}>{d}</li>
            ))}
          </ul>
        ) : (
          <p>두 디자인의 설정이 같아요. 실험실에서 요소를 바꿔 다시 저장해 보세요.</p>
        )}
        <p className="hint">앱은 어느 쪽이 더 좋은지 점수를 매기지 않아요. 여러분이 근거를 들어 설명해 주세요.</p>
      </Card>
      <Card title="🕵️ 관찰 활동">
        <p className="task-text">과제: {exp.observationTask}</p>
        <p className="hint">직접 해 본 뒤에 골라요. 하지 않았다면 '아직 해 보지 않았어요'를 그대로 두세요.</p>
        <div className="grid-2">
          <ChoiceGroup<ObservationEase> legend="처음 디자인에서 찾기" name="obs-before" value={p.observation.before} options={easeOptions} onChange={(v) => update((cur) => ({ observation: { ...cur.observation, before: v } }))} />
          <ChoiceGroup<ObservationEase> legend="개선 디자인에서 찾기" name="obs-after" value={p.observation.after} options={easeOptions} onChange={(v) => update((cur) => ({ observation: { ...cur.observation, after: v } }))} />
        </div>
        <Field label="관찰하면서 느낀 점" optional value={p.observation.note} onChange={(v) => update((cur) => ({ observation: { ...cur.observation, note: v } }))} />
      </Card>
      <Card title="✍️ 비교 기록">
        <Field multiline label="무엇을 바꾸었나요?" value={notes.whatChanged} onChange={(v) => setNote('whatChanged', v)} placeholder={diff[0] ? `예: ${diff[0]}` : ''} />
        <Field multiline label="어떤 상황에서 도움이 될까요?" value={notes.whoBenefits} onChange={(v) => setNote('whoBenefits', v)} placeholder="예: 처음 학교에 온 사람이 보건실을 찾을 때" />
        <Field multiline label="왜 더 알아보기 쉽거나 사용하기 편리하다고 생각하나요?" value={notes.usabilityReason} onChange={(v) => setNote('usabilityReason', v)} />
        <Field multiline label="어떤 점이 친근하거나 보기 좋게 느껴지나요?" value={notes.emotionalImpression} onChange={(v) => setNote('emotionalImpression', v)} hint="이 물건은 어떤 느낌을 주나요? 친근한가요, 낯선가요?" />
        <Field multiline label="직접 확인하지 못한 점은 무엇인가요?" value={notes.unverifiedPoints} onChange={(v) => setNote('unverifiedPoints', v)} placeholder="예: 실제로 멀리서 보면 어떨지는 아직 확인하지 못했어요." />
        <ChoiceGroup<EvidenceType>
          legend="내 생각의 근거는?"
          name="evidence"
          value={notes.evidence}
          onChange={(v) => setNote('evidence', v)}
          options={[
            { value: 'preview_comparison', label: '직접 실험에서 비교함' },
            { value: 'peer_opinion', label: '친구의 의견을 들음' },
            { value: 'prediction', label: '아직 예상함' },
          ]}
        />
        <div className="row-actions">
          <button type="button" className="btn primary" onClick={record}>
            📝 비교 결과 기록하기
          </button>
          <span role="status" className="flash">
            {flash || (p.comparisonRecordedAt ? `기록됨: ${new Date(p.comparisonRecordedAt).toLocaleString('ko-KR')}` : '')}
          </span>
        </div>
      </Card>
    </div>
  );
}
