import type { MediaKey, Project12 } from '../models/Project12';

export interface ScreenProps {
  p: Project12;
  update: (patch: Partial<Project12> | ((p: Project12) => Partial<Project12>)) => void;
  go: (step: number) => void;
  setMedia: (key: MediaKey, dataUrl: string | null) => void;
  requestPrint: (kind: PrintKind) => void;
}

export type PrintKind = 'report' | 'ideaCard' | 'peerSheet' | 'worksheet';

const blank = (v: string | null | undefined) => !v || !v.trim();

/** 단계별로 아직 쓰지 않은 칸의 이름. 이동을 막지 않고 알림·보고서 표시에만 쓴다. */
export function missingFor(step: number, p: Project12): string[] {
  const m: string[] = [];
  const need = (cond: boolean, name: string) => cond && m.push(name);
  switch (step) {
    case 1:
      need(blank(p.discoverInconvenience), '어떤 점이 불편할까요?');
      need(blank(p.discoverSameForAll), '모든 사람이 똑같이 느낄까요?');
      break;
    case 2:
      need(p.selectedSituationIds.length === 0 && blank(p.customSituation), '사용자 상황 카드 선택');
      need(blank(p.userTask), '무엇을 하려고 하나요?');
      need(blank(p.difficulty), '무엇이 불편할 수 있나요?');
      need(blank(p.assumedNeed), '어떤 변화가 도움이 될까요?');
      break;
    case 3:
      need(!p.topic, '실험 주제 선택');
      need(!p.beforeDesign, '처음 디자인 저장');
      need(!p.afterDesign, '개선 디자인 저장');
      break;
    case 4:
      need(blank(p.comparisonNotes.whatChanged), '무엇을 바꾸었나요?');
      need(blank(p.comparisonNotes.whoBenefits), '어떤 상황에서 도움이 될까요?');
      need(blank(p.comparisonNotes.usabilityReason), '왜 더 편리하다고 생각하나요?');
      need(blank(p.comparisonNotes.emotionalImpression), '친근하거나 보기 좋은 점');
      need(blank(p.comparisonNotes.unverifiedPoints), '직접 확인하지 못한 점');
      need(!p.comparisonNotes.evidence, '생각의 근거');
      break;
    case 5:
      need(blank(p.targetObject), '바꾸고 싶은 물건');
      need(blank(p.problemDefinition), '문제 정의 문장');
      need(!p.ideas.some((i) => !blank(i.title)), '아이디어 이름');
      need(!p.selectedIdeaId, '최종 아이디어 선택');
      need(blank(p.selectionReason), '고른 이유');
      break;
    case 6:
      need(blank(p.inventionName), '발명품 이름');
      need(!p.coreFunctions.some((f) => !blank(f)), '새롭게 개선할 기능');
      need(blank(p.appearanceAndIndicators), '주요 디자인 요소');
      need(blank(p.emotionalDesign), '심미성과 친근함');
      need(!p.usageSteps.some((s) => !blank(s)), '사용 방법');
      need(p.materials.length === 0, '재료 및 도구');
      need(!p.sketchDataUrl && blank(p.sketchText), '설계도 그림 또는 글 설명');
      break;
    case 7:
      need(blank(p.buildNotes), '어떻게 만들었나요?');
      need(blank(p.changedDuringBuild), '계획과 달라진 점');
      need(blank(p.buildDifficulty), '어려웠던 점');
      break;
    case 8:
      need(!p.evaluationMethod, '평가 방법');
      need(blank(p.peerPositive) && blank(p.peerDifficulty), '친구 의견');
      need(blank(p.improvementPlan), '내가 개선할 점');
      break;
    case 9:
      need(blank(p.helpReason), '여러 사람에게 도움이 될 수 있는 이유');
      need(blank(p.reflection), '최종 소감');
      break;
  }
  return m;
}
