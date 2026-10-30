import { useState } from 'react';
import { situationById } from '../data/situations';
import { materialPresets, targetObjects } from '../data/uiCopy';
import SketchCanvas from '../components/SketchCanvas';
import { Card, Field, ListEditor, Notice, isBlank } from '../components/common';
import { newIdea } from '../storage/projectStorage';
import type { Idea } from '../models/Project12';
import type { ScreenProps } from './progress';

export function composeProblem(parts: { object: string; difficulty: string; goal: string }) {
  const o = parts.object.trim() || '○○';
  const d = parts.difficulty.trim() || '○○';
  const g = parts.goal.trim() || '○○';
  return `${o}을(를) 사용할 때 ${d}이(가) 어려우므로, ${g} 디자인으로 개선하고 싶다.`;
}

/* 화면 5 — 모두를 위한 발명 아이디어 */
export function IdeasStep({ p, update, requestPrint }: ScreenProps) {
  const [newUser, setNewUser] = useState('');
  const situationTitles = [
    ...p.selectedSituationIds.map((id) => situationById(id)?.title ?? ''),
    ...(isBlank(p.customSituation) ? [] : [p.customSituation.trim().slice(0, 60)]),
  ].filter(Boolean);
  const users = p.affectedUsersAndSituations;

  const chooseTarget = (choice: string) =>
    update((cur) => ({
      targetObjectChoice: choice,
      targetObject: choice === '직접 입력' ? (targetObjects.includes(cur.targetObject) ? '' : cur.targetObject) : choice,
      problemParts: { ...cur.problemParts, object: isBlank(cur.problemParts.object) || targetObjects.includes(cur.problemParts.object) ? (choice === '직접 입력' ? '' : choice) : cur.problemParts.object },
    }));

  const toggleUser = (u: string) =>
    update((cur) => ({
      affectedUsersAndSituations: cur.affectedUsersAndSituations.includes(u)
        ? cur.affectedUsersAndSituations.filter((x) => x !== u)
        : [...cur.affectedUsersAndSituations, u],
    }));

  const addUser = () => {
    const u = newUser.trim();
    if (!u) return;
    if (!users.includes(u)) update({ affectedUsersAndSituations: [...users, u].slice(0, 20) });
    setNewUser('');
  };

  const setPart = (k: 'object' | 'difficulty' | 'goal', v: string) => update((cur) => ({ problemParts: { ...cur.problemParts, [k]: v } }));

  const buildSentence = () => {
    const sentence = composeProblem(p.problemParts);
    if (!isBlank(p.problemDefinition) && p.problemDefinition !== sentence && !window.confirm('이미 적은 문제 정의 문장을 새 문장으로 바꿀까요?')) return;
    update({ problemDefinition: sentence });
  };

  const setIdea = (id: string, patch: Partial<Idea>) => update((cur) => ({ ideas: cur.ideas.map((i) => (i.id === id ? { ...i, ...patch } : i)) }));
  const removeIdea = (id: string) => {
    if (!window.confirm('이 아이디어 카드를 지울까요?')) return;
    update((cur) => {
      const ideas = cur.ideas.filter((i) => i.id !== id);
      return { ideas: ideas.length ? ideas : [newIdea()], selectedIdeaId: cur.selectedIdeaId === id ? null : cur.selectedIdeaId };
    });
  };

  return (
    <div className="stack">
      <Card title="🏫 우리 학교에서 바꾸고 싶은 물건">
        <div className="chip-row" role="radiogroup" aria-label="바꾸고 싶은 물건">
          {targetObjects.map((t) => (
            <label key={t} className={`chip${p.targetObjectChoice === t ? ' checked' : ''}`}>
              <input type="radio" name="target-object" checked={p.targetObjectChoice === t} onChange={() => chooseTarget(t)} />
              <span>{t}</span>
            </label>
          ))}
        </div>
        {p.targetObjectChoice === '직접 입력' && (
          <Field label="바꾸고 싶은 물건 이름" value={p.targetObject} onChange={(v) => update({ targetObject: v })} placeholder="예: 신발장, 우산꽂이, 교실 문" />
        )}
      </Card>

      <Card title="👥 누구를, 어떤 상황을 위한 디자인인가요?">
        <p className="hint">한 집단만 정하지 않아도 돼요. 여러 사용자와 상황을 함께 골라 보세요.</p>
        {situationTitles.length > 0 && (
          <div className="chip-row" aria-label="내가 고른 상황에서 가져오기">
            {situationTitles.map((s) => (
              <button key={s} type="button" className={`chip as-btn${users.includes(s) ? ' checked' : ''}`} aria-pressed={users.includes(s)} onClick={() => toggleUser(s)}>
                {users.includes(s) ? '✔ ' : '+ '}
                {s}
              </button>
            ))}
          </div>
        )}
        <div className="inline-add">
          <label htmlFor="add-user" className="sr-only">
            사용자·상황 직접 추가
          </label>
          <input id="add-user" type="text" value={newUser} maxLength={80} placeholder="예: 비 오는 날 우산을 든 친구" onChange={(e) => setNewUser(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addUser())} />
          <button type="button" className="btn" onClick={addUser}>
            추가
          </button>
        </div>
        {users.filter((u) => !situationTitles.includes(u)).length > 0 && (
          <ul className="token-list">
            {users
              .filter((u) => !situationTitles.includes(u))
              .map((u) => (
                <li key={u}>
                  {u}
                  <button type="button" className="icon-btn" aria-label={`${u} 지우기`} onClick={() => toggleUser(u)}>
                    ✕
                  </button>
                </li>
              ))}
          </ul>
        )}
      </Card>

      <Card title="🎯 문제 정의 문장 만들기">
        <div className="grid-3">
          <Field label="물건" value={p.problemParts.object} onChange={(v) => setPart('object', v)} placeholder="예: 준비물 수납함" />
          <Field label="어려운 점" value={p.problemParts.difficulty} onChange={(v) => setPart('difficulty', v)} placeholder="예: 필요한 물건을 빨리 찾는 것" />
          <Field label="바라는 모습" value={p.problemParts.goal} onChange={(v) => setPart('goal', v)} placeholder="예: 누구나 한눈에 찾을 수 있는" />
        </div>
        <p className="sentence-preview">{composeProblem(p.problemParts)}</p>
        <button type="button" className="btn" onClick={buildSentence}>
          ⬇ 이 문장으로 쓰기
        </button>
        <Field multiline label="문제 정의 문장 (고쳐 써도 돼요)" value={p.problemDefinition} onChange={(v) => update({ problemDefinition: v })} />
      </Card>

      <section aria-labelledby="ideas-title" className="stack">
        <h3 id="ideas-title" className="section-title">
          💡 아이디어 카드 (2개 이상 써 보면 비교하기 좋아요)
        </h3>
        <div className="idea-grid">
          {p.ideas.map((idea, n) => (
            <article key={idea.id} className={`card idea-card${p.selectedIdeaId === idea.id ? ' selected' : ''}`}>
              <div className="idea-head">
                <h4>아이디어 {n + 1}</h4>
                <button type="button" className="icon-btn" aria-label={`아이디어 ${n + 1} 지우기`} onClick={() => removeIdea(idea.id)}>
                  ✕
                </button>
              </div>
              <Field label="아이디어 이름" value={idea.title} onChange={(v) => setIdea(idea.id, { title: v })} />
              <Field multiline rows={2} label="새로 바꿀 기능" value={idea.newFunction} onChange={(v) => setIdea(idea.id, { newFunction: v })} />
              <Field multiline rows={2} label="편리함" value={idea.usabilityFeatures} onChange={(v) => setIdea(idea.id, { usabilityFeatures: v })} />
              <Field multiline rows={2} label="보기 좋음 / 친근함" value={idea.emotionalFeatures} onChange={(v) => setIdea(idea.id, { emotionalFeatures: v })} />
              <Field multiline rows={2} label="제작 가능한 방법" value={idea.feasibility} onChange={(v) => setIdea(idea.id, { feasibility: v })} />
              <label className={`select-idea${p.selectedIdeaId === idea.id ? ' checked' : ''}`}>
                <input type="radio" name="selected-idea" checked={p.selectedIdeaId === idea.id} onChange={() => update({ selectedIdeaId: idea.id })} />
                {p.selectedIdeaId === idea.id ? '✔ 이 아이디어로 정했어요' : '이 아이디어로 정하기'}
              </label>
            </article>
          ))}
        </div>
        {p.ideas.length < 6 && (
          <button type="button" className="btn ghost" onClick={() => update((cur) => ({ ideas: [...cur.ideas, newIdea()] }))}>
            + 아이디어 카드 추가
          </button>
        )}
      </section>

      <Card title="✅ 최종 아이디어를 고른 이유">
        <Field multiline label="왜 이 아이디어를 골랐나요?" value={p.selectionReason} onChange={(v) => update({ selectionReason: v })} />
      </Card>

      <Notice kind="tip">
        <p>
          <strong>1~2차시 마무리</strong> — 오늘 쓴 내용은 이 기기에 자동 저장돼요. 다음 시간에 [저장한 활동 이어하기]로 6단계부터 이어 해요.
        </p>
        <button type="button" className="btn" onClick={() => requestPrint('ideaCard')}>
          🖨️ 1~2차시 디자인 아이디어 카드 인쇄
        </button>
      </Notice>
    </div>
  );
}

/* 화면 6 — 발명품 설계하기 */
export function DesignStep({ p, update, setMedia, go }: ScreenProps) {
  const [newMat, setNewMat] = useState('');
  const idea = p.ideas.find((i) => i.id === p.selectedIdeaId);
  const situationsUsed = [
    ...p.selectedSituationIds.map((id) => situationById(id)?.title ?? ''),
    ...p.affectedUsersAndSituations,
  ].filter((v, i, a) => v && a.indexOf(v) === i);

  const importIdea = () => {
    if (!idea) return;
    update((cur) => ({
      inventionName: isBlank(cur.inventionName) ? idea.title : cur.inventionName,
      coreFunctions: cur.coreFunctions.some((f) => !isBlank(f)) ? cur.coreFunctions : [idea.newFunction.slice(0, 200) || ''],
      emotionalDesign: isBlank(cur.emotionalDesign) ? idea.emotionalFeatures : cur.emotionalDesign,
      existingProblem: isBlank(cur.existingProblem) ? cur.problemDefinition : cur.existingProblem,
    }));
  };

  const toggleMat = (m: string) => update((cur) => ({ materials: cur.materials.includes(m) ? cur.materials.filter((x) => x !== m) : [...cur.materials, m] }));
  const addMat = () => {
    const m = newMat.trim();
    if (m && !p.materials.includes(m)) update({ materials: [...p.materials, m].slice(0, 40) });
    setNewMat('');
  };

  return (
    <div className="stack">
      <Card title="📎 지난 시간에 고른 아이디어">
        {idea ? (
          <div className="linked">
            <p>
              <strong>{idea.title || '(이름 없는 아이디어)'}</strong> — {idea.newFunction || '기능 미작성'}
            </p>
            <button type="button" className="btn" onClick={importIdea}>
              ⬇ 빈칸에 아이디어 내용 가져오기
            </button>
          </div>
        ) : (
          <p>
            아직 최종 아이디어를 고르지 않았어요.{' '}
            <button type="button" className="link-btn" onClick={() => go(5)}>
              5단계에서 고르기
            </button>
          </p>
        )}
      </Card>

      <Card title="📝 설계 내용">
        <Field label="1. 발명품 이름" value={p.inventionName} onChange={(v) => update({ inventionName: v })} placeholder="예: 한눈에 찾는 준비물 정리함" />
        <div className="linked-box">
          <p>
            <b>2. 기존 물건:</b> {p.targetObject || '(5단계에서 고르지 않음)'}
          </p>
          <Field multiline rows={2} label="불편함" value={p.existingProblem} onChange={(v) => update({ existingProblem: v })} placeholder={p.problemDefinition || '어떤 점이 불편한가요?'} />
          <p>
            <b>3. 고려한 사용자의 상황:</b> {situationsUsed.length ? situationsUsed.join(', ') : '(2·5단계에서 고르지 않음)'}
          </p>
        </div>
        <ListEditor label="4. 새롭게 개선할 기능 (1~3개)" items={p.coreFunctions} max={3} itemLabel={(i) => `기능 ${i + 1}`} onChange={(v) => update({ coreFunctions: v })} placeholder="예: 칸마다 큰 그림 라벨" />
        <Field multiline label="5. 글씨, 색, 그림, 크기, 형태 등 주요 디자인 요소" value={p.appearanceAndIndicators} onChange={(v) => update({ appearanceAndIndicators: v })} />
        <Field multiline label="6. 심미성과 친근함을 고려한 부분" value={p.emotionalDesign} onChange={(v) => update({ emotionalDesign: v })} />
        <ListEditor label="7. 사용 방법 (순서대로)" numbered items={p.usageSteps} max={8} itemLabel={(i) => `${i + 1}번째 순서`} onChange={(v) => update({ usageSteps: v })} placeholder="예: 그림 라벨을 보고 칸을 찾아요" />
        <fieldset className="control-group">
          <legend>8. 필요한 재료 및 도구</legend>
          <div className="chip-row">
            {[...materialPresets, ...p.materials.filter((m) => !materialPresets.includes(m))].map((m) => (
              <button key={m} type="button" className={`chip as-btn${p.materials.includes(m) ? ' checked' : ''}`} aria-pressed={p.materials.includes(m)} onClick={() => toggleMat(m)}>
                {p.materials.includes(m) ? '✔ ' : ''}
                {m}
              </button>
            ))}
          </div>
          <div className="inline-add">
            <label htmlFor="add-mat" className="sr-only">
              재료 직접 추가
            </label>
            <input id="add-mat" type="text" value={newMat} maxLength={40} placeholder="다른 재료 직접 입력" onChange={(e) => setNewMat(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addMat())} />
            <button type="button" className="btn" onClick={addMat}>
              추가
            </button>
          </div>
        </fieldset>
      </Card>

      <Card title="✏️ 9. 발명품 설계도">
        <p className="hint">그림으로 그려도 되고, 그리기 어렵다면 아래에 글로 설명해도 돼요. 둘 중 하나만 있어도 충분해요.</p>
        <SketchCanvas value={p.sketchDataUrl} onChange={(url) => setMedia('sketchDataUrl', url)} />
        <Field multiline rows={4} label="설계도 글 설명" value={p.sketchText} onChange={(v) => update({ sketchText: v })} placeholder="예: 상자 4칸, 앞면에 큰 그림 라벨, 위쪽에도 작은 라벨, 손잡이는 둥글게..." />
      </Card>
    </div>
  );
}
