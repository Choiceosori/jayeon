import { experiments, topicList } from '../data/experiments';
import { situations } from '../data/situations';
import { definitions, studyProblems } from '../data/uiCopy';
import { PreviewGraphic } from '../components/DesignExperiment/DesignPreview';
import { Card, ChoiceGroup, Field, Notice } from '../components/common';
import type { NeedsEvidence } from '../models/Project12';
import type { ScreenProps } from './progress';

/* 화면 0 — 프로젝트 안의 시작 화면 */
export function StartStep({ p, update, go }: ScreenProps) {
  return (
    <div className="stack">
      <div className="hero small">
        <p className="hero-q">내가 쓰기 편한 물건이 다른 사람에게도 편리할까요?</p>
        <ol className="flow-line" aria-label="활동 흐름">
          <li>사람을 이해해요</li>
          <li>디자인을 비교해요</li>
          <li>새로운 물건을 만들어요</li>
          <li>직접 확인하고 고쳐요</li>
        </ol>
      </div>
      <div className="grid-2">
        <Card title="📘 1~2차시 공부할 문제">
          <p className="study-problem">{studyProblems.first}</p>
          <p className="hint">화면 1~5: 사용자 이해 → 디자인 실험 → 비교 → 발명 아이디어</p>
          <button type="button" className="btn primary" onClick={() => go(1)}>
            1단계부터 시작하기
          </button>
        </Card>
        <Card title="📗 3~4차시 공부할 문제">
          <p className="study-problem">{studyProblems.second}</p>
          <p className="hint">화면 6~9: 설계 → 실물 제작 → 사용성 평가·개선 → 전시회</p>
          <button type="button" className="btn" onClick={() => go(6)}>
            6단계(설계)로 이어 하기
          </button>
        </Card>
      </div>
      <Card title="우리 모둠 이름표">
        <p className="hint">실명은 적지 않아도 돼요. 별명이나 모둠 이름이면 충분해요.</p>
        <div className="grid-2">
          <Field label="모둠 이름" optional value={p.teamName} onChange={(v) => update({ teamName: v })} placeholder="예: 햇살 모둠" maxLength={40} />
          <Field label="발명가 별명" optional value={p.nickname} onChange={(v) => update({ nickname: v })} placeholder="예: 반짝 발명가" maxLength={40} />
        </div>
      </Card>
    </div>
  );
}

/* 화면 1 — 디자인 발견하기 */
export function DiscoverStep({ p, update }: ScreenProps) {
  return (
    <div className="stack">
      <Notice kind="info">
        <strong>1~2차시 공부할 문제:</strong> {studyProblems.first}
      </Notice>
      <div className="grid-2">
        <Card title="🌍 유니버설 디자인이란?">
          <p>{definitions.universal}</p>
        </Card>
        <Card title="💛 감성을 담은 디자인이란?">
          <p>{definitions.emotional}</p>
        </Card>
      </div>
      <h3 className="section-title">원래 디자인 예시 살펴보기</h3>
      <p className="hint">아래 그림은 수업을 위해 만든 가상의 예시예요. 실제 회사나 특정 사람의 이야기가 아니에요.</p>
      <div className="gallery">
        {topicList.map((t) => (
          <figure key={t} className="card gallery-item">
            <div className="preview-stage">
              <PreviewGraphic topic={t} settings={experiments[t].initial} label={`원래 디자인 예시: ${experiments[t].title}`} />
            </div>
            <figcaption>
              <strong>
                {experiments[t].emoji} {experiments[t].title}
              </strong>
              <span className="tag soft">수업용 가상 예시</span>
              <p>{experiments[t].originalProblem}</p>
            </figcaption>
          </figure>
        ))}
      </div>
      <Card title="✍️ 생각 메모">
        <Field multiline label="어떤 점이 불편할까요?" value={p.discoverInconvenience} onChange={(v) => update({ discoverInconvenience: v })} placeholder="예: 안내판 글씨가 작아서 멀리서는 읽기 어려울 것 같아요." />
        <Field multiline label="모든 사람이 똑같이 느낄까요?" value={p.discoverSameForAll} onChange={(v) => update({ discoverSameForAll: v })} placeholder="예: 키가 큰 사람과 작은 사람은 다르게 느낄 수 있어요." />
      </Card>
    </div>
  );
}

/* 화면 2 — 사용자 상황 알아보기 */
export function EmpathizeStep({ p, update }: ScreenProps) {
  const toggle = (id: string) =>
    update((cur) => ({
      selectedSituationIds: cur.selectedSituationIds.includes(id)
        ? cur.selectedSituationIds.filter((x) => x !== id)
        : [...cur.selectedSituationIds, id],
    }));
  return (
    <div className="stack">
      <Notice kind="tip">필요한 도움은 사람마다 다를 수 있어요. 직접 묻고 확인해 봅시다.</Notice>
      <fieldset className="control-group">
        <legend>사용자 상황 카드를 골라요 (여러 개 골라도 돼요)</legend>
        <div className="situation-grid">
          {situations.map((s) => {
            const on = p.selectedSituationIds.includes(s.id);
            return (
              <label key={s.id} className={`situation-card${on ? ' checked' : ''}`}>
                <input type="checkbox" checked={on} onChange={() => toggle(s.id)} />
                <span className="sc-head">
                  <span className="sc-emoji" aria-hidden="true">
                    {s.emoji}
                  </span>
                  <strong>{s.title}</strong>
                  <span className="sc-check" aria-hidden="true">
                    {on ? '✔ 선택됨' : '선택'}
                  </span>
                </span>
                <span className="sc-row">
                  <b>해야 하는 일</b> {s.task}
                </span>
                <span className="sc-row">
                  <b>어려운 조건</b> {s.condition}
                </span>
                <span className="sc-row">
                  <b>살펴볼 디자인 요소</b> {s.elements}
                </span>
                <span className="sc-q">🤔 {s.question}</span>
              </label>
            );
          })}
        </div>
      </fieldset>
      <Card title="내가 직접 관찰하거나 경험한 상황">
        <Field
          multiline
          optional
          label="카드에 없는 상황이 있다면 적어 보세요."
          value={p.customSituation}
          onChange={(v) => update({ customSituation: v })}
          placeholder="예: 비 오는 날 우산을 들고 교실 문을 열 때"
        />
      </Card>
      <Card title="🔍 핵심 질문 3가지">
        <Field multiline label="1. 이 사람은 무엇을 하려고 하나요?" value={p.userTask} onChange={(v) => update({ userTask: v })} />
        <Field multiline label="2. 현재 디자인에서 무엇이 불편할 수 있나요?" value={p.difficulty} onChange={(v) => update({ difficulty: v })} />
        <Field multiline label="3. 어떤 변화가 도움이 될지 확인해 보고 싶나요?" value={p.assumedNeed} onChange={(v) => update({ assumedNeed: v })} />
        <ChoiceGroup<NeedsEvidence>
          legend="위 내용은 어떻게 알게 되었나요?"
          name="needsEvidence"
          value={p.needsEvidence === 'not_specified' ? null : p.needsEvidence}
          onChange={(v) => update({ needsEvidence: v })}
          hint="직접 보지 않은 내용을 '직접 확인했어요'로 고르지 않아요."
          options={[
            { value: 'predicted', label: '이럴 수 있다고 예상해요' },
            { value: 'observed', label: '직접 확인했어요' },
            { value: 'asked', label: '사용하는 사람에게 물어봤어요' },
          ]}
        />
      </Card>
    </div>
  );
}
