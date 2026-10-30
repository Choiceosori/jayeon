export type DesignTopic = 'sign' | 'button' | 'storage';
export type EvidenceType = 'preview_comparison' | 'peer_opinion' | 'prediction';
export type TestResult = 'good' | 'needs_improvement' | 'not_checked';
export type NeedsEvidence = 'observed' | 'predicted' | 'asked' | 'not_specified';
export type BuildStatus = 'not_started' | 'in_progress' | 'completed';
export type EvaluationMethod = 'self_test' | 'peer_test' | 'not_tested';
export type CheckState = 'yes' | 'needs' | 'not_checked';
export type ObservationEase = 'easy' | 'bit_hard' | 'hard' | 'not_tried';

export type DesignSettings = Record<string, string>;

export interface Idea {
  id: string;
  title: string;
  newFunction: string;
  usabilityFeatures: string;
  emotionalFeatures: string;
  feasibility: string;
}

export interface Evaluation {
  criterionId: string;
  outcome: TestResult;
  reason: string;
}

export interface Project12 {
  schemaVersion: 1;
  app: 'universal-design-lab-12';
  id: string;
  createdAt: string;
  updatedAt: string;
  teamName: string;
  nickname: string;
  currentStep: number;

  // 1. 디자인 발견
  discoverInconvenience: string;
  discoverSameForAll: string;

  // 2. 사용자 이해
  selectedSituationIds: string[];
  customSituation: string;
  userTask: string;
  difficulty: string;
  assumedNeed: string;
  needsEvidence: NeedsEvidence;

  // 3~4. 디자인 실험
  topic: DesignTopic | null;
  labSettings: Record<DesignTopic, DesignSettings>;
  labNotes: Record<DesignTopic, string>;
  designTopic: DesignTopic | null; // 저장한 처음/개선 디자인이 속한 실험 주제
  beforeDesign: DesignSettings | null;
  afterDesign: DesignSettings | null;
  changeSummary: string[];
  comparisonNotes: {
    whatChanged: string;
    whoBenefits: string;
    usabilityReason: string;
    emotionalImpression: string;
    unverifiedPoints: string;
    evidence: EvidenceType | null;
  };
  comparisonRecordedAt: string | null;
  observation: { before: ObservationEase; after: ObservationEase; note: string };

  // 5. 발명 아이디어
  targetObjectChoice: string;
  targetObject: string;
  affectedUsersAndSituations: string[];
  problemParts: { object: string; difficulty: string; goal: string };
  problemDefinition: string;
  ideas: Idea[];
  selectedIdeaId: string | null;
  selectionReason: string;

  // 6. 설계
  inventionName: string;
  existingProblem: string;
  coreFunctions: string[];
  appearanceAndIndicators: string;
  emotionalDesign: string;
  usageSteps: string[];
  materials: string[];
  sketchDataUrl: string | null; // IndexedDB에 따로 보관
  sketchText: string;

  // 7. 제작
  buildStatus: BuildStatus;
  buildMaterials: string;
  buildNotes: string;
  changedDuringBuild: string;
  buildDifficulty: string;
  buildChecklist: Record<string, CheckState>;
  photoDataUrl: string | null; // IndexedDB에 따로 보관

  // 8. 사용성 평가
  evaluationMethod: EvaluationMethod | null;
  evaluations: Evaluation[];
  peerPositive: string;
  peerDifficulty: string;
  improvementPlan: string;
  improvementDone: string;
  afterImprovement: string;
  perfectReflection: string;

  // 9. 마무리
  helpReason: string;
  reflection: string;
}

export const MEDIA_KEYS = ['sketchDataUrl', 'photoDataUrl'] as const;
export type MediaKey = (typeof MEDIA_KEYS)[number];

export function makeId(prefix = 'p'): string {
  const rand =
    typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID().slice(0, 8)
      : Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}
