import type { DesignTopic } from '../models/Project12';

export interface Situation {
  id: string;
  title: string;
  task: string;
  condition: string;
  question: string;
  elements: string;
  emoji: string;
  recommendedFor: DesignTopic[];
}

// 수업용 가상 상황 예시. 사람의 정체성이 아니라 '하려는 일'과 '환경'을 중심으로 적는다.
export const situations: Situation[] = [
  {
    id: 'hands_full',
    title: '양손에 책이 가득해요',
    task: '문을 열거나 스위치를 누르기',
    condition: '두 손이 모두 물건을 들고 있어요.',
    question: '물건을 내려놓지 않고 조작할 수 있을까?',
    elements: '조작부 크기, 누르는 방법, 설치 높이',
    emoji: '📚',
    recommendedFor: ['button'],
  },
  {
    id: 'short_height',
    title: '키가 작은 친구도 이용해요',
    task: '높은 곳의 안내·물건 보기',
    condition: '눈높이보다 높은 곳은 잘 보이지 않아요.',
    question: '눈높이와 위치를 바꾸면 어떨까?',
    elements: '라벨 위치, 설치 높이, 보는 방향',
    emoji: '📏',
    recommendedFor: ['storage'],
  },
  {
    id: 'first_visitor',
    title: '처음 온 사람이 길을 찾아요',
    task: '교내 보건실·도서관 찾기',
    condition: '학교 구조를 잘 몰라요.',
    question: '간단한 글과 그림으로 안내할 수 있을까?',
    elements: '그림 표시, 짧은 문구, 화살표',
    emoji: '🧭',
    recommendedFor: ['sign'],
  },
  {
    id: 'noisy_room',
    title: '주변이 시끄러워요',
    task: '안내나 알림 확인하기',
    condition: '소리로 알려 주는 신호가 잘 들리지 않아요.',
    question: '소리 외에 눈으로 확인할 방법이 있을까?',
    elements: '상태 표시 문구, 불빛, 모양 변화',
    emoji: '🔊',
    recommendedFor: ['button'],
  },
  {
    id: 'dim_place',
    title: '주변이 어두워요',
    task: '안내표지 읽기',
    condition: '빛이 부족해서 색과 글씨가 흐리게 보여요.',
    question: '색과 크기, 설치 위치를 어떻게 고려할까?',
    elements: '색 대비, 글씨 크기, 설치 위치',
    emoji: '🌙',
    recommendedFor: ['sign'],
  },
  {
    id: 'gloves',
    title: '장갑을 끼고 있어요',
    task: '버튼 누르기·물건 잡기',
    condition: '손끝의 느낌이 둔하고 손가락이 두꺼워져요.',
    question: '조작부 모양과 크기는 적절할까?',
    elements: '버튼 크기, 모양, 버튼 사이 간격',
    emoji: '🧤',
    recommendedFor: ['button'],
  },
  {
    id: 'small_text',
    title: '작은 글씨가 읽기 어려워요',
    task: '안내를 읽고 행동하기',
    condition: '글씨가 작거나 빽빽하면 읽는 데 오래 걸려요.',
    question: '글씨 크기·줄 간격·대비를 바꾸면?',
    elements: '글씨 크기, 줄 간격, 색 대비',
    emoji: '🔎',
    recommendedFor: ['sign'],
  },
  {
    id: 'language_diff',
    title: '안내문에 낯선 말이 많아요',
    task: '안내 내용을 이해하기',
    condition: '어려운 낱말이나 익숙하지 않은 언어가 섞여 있어요.',
    question: '쉬운 단어와 그림을 함께 쓰면 어떨까?',
    elements: '쉬운 문구, 그림 기호, 문장 길이',
    emoji: '💬',
    recommendedFor: ['sign'],
  },
  {
    id: 'one_hand',
    title: '한 손으로 물건을 들고 있어요',
    task: '수납함 열기·물건 꺼내기',
    condition: '한 손만 자유롭게 쓸 수 있어요.',
    question: '한 손으로도 이용하기 쉬운 구조일까?',
    elements: '여는 방법, 손잡이 모양, 칸의 깊이',
    emoji: '✋',
    recommendedFor: ['storage'],
  },
  {
    id: 'rushed',
    title: '서둘러 준비물을 찾아요',
    task: '공용 수납함에서 물건 찾기',
    condition: '시간이 부족해서 하나하나 열어 볼 여유가 없어요.',
    question: '물건 이름과 위치가 한눈에 보일까?',
    elements: '라벨 크기, 구체적인 이름, 그림 표시',
    emoji: '⏰',
    recommendedFor: ['storage'],
  },
];

export const situationById = (id: string) => situations.find((s) => s.id === id);
