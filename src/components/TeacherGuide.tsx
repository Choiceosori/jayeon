import { useEffect, useRef } from 'react';
import { biomimicryCases, CATEGORY_LABEL } from '../data/biomimicryCases';
import { natureItems } from '../data/natureItems';

const SESSION_12 = [
  ['도입', '10분', '자연물 사진·실물 비교, 공부할 문제 확인', '표지, 관찰 01 일부'],
  ['활동1', '25분', '실물 자연물 관찰, 확대 관찰, 모양·구조 기록', '관찰 01 · 관찰 02'],
  ['활동2', '20분', '자연의 특별한 능력 추리, 관찰과 설명 비교', '탐구 03'],
  ['활동3', '15분', '자연물과 실제 응용 사례 연결', '탐구 04'],
  ['정리', '10분', '흥미로운 자연물과 사례 공유', '모아보기 일부'],
];
const SESSION_34 = [
  ['도입', '10분', '지난 시간 관찰 결과 회상, 공부할 문제 확인', '모아보기 · 탐구 05'],
  ['활동1', '20분', '자연 모방 사례 추가 탐구, 형태/기능 구분', '탐구 05'],
  ['활동2', '20분', '자연물+생활용품 카드 자유 조합, 조합 비교', '조합 06'],
  ['활동3', '20분', '마음에 드는 조합 스케치·설명', '표현 07'],
  ['정리', '10분', '상상 갤러리 공유, 탐험 수첩 정리·인쇄', '모아보기'],
];

function Plan({ rows }: { rows: string[][] }) {
  return (
    <table className="rec-table">
      <thead>
        <tr>
          <th scope="col">단계</th>
          <th scope="col">시간</th>
          <th scope="col">교사·학생 활동</th>
          <th scope="col">웹앱 화면</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((r) => (
          <tr key={r[0]}>
            {r.map((c, i) => (i === 0 ? <th key={i} scope="row">{c}</th> : <td key={i}>{c}</td>))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export function TeacherGuide({ onClose }: { onClose: () => void }) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const d = ref.current;
    if (d && !d.open) d.showModal?.();
  }, []);
  return (
    <dialog ref={ref} className="teacher" aria-labelledby="tg-h" onClose={onClose} onCancel={onClose}>
      <div className="teacher-inner">
        <header className="teacher-head">
          <h1 id="tg-h">선생님 안내 · 13. 자연에서 발견하는 발명 아이디어</h1>
          <button type="button" className="btn" onClick={onClose}>
            닫기 ✕
          </button>
        </header>

        <section>
          <h2>학습 목표</h2>
          <ul>
            <li>1~2차시: 자연물의 다양한 특징을 관찰하고, 자연을 모방한 발명 사례를 탐구해 봅시다.</li>
            <li>3~4차시: 자연의 특징을 기존 물건과 결합하여 새로운 아이디어를 표현해 봅시다.</li>
          </ul>
          <p>결과물은 완성된 발명품이 아니라 <strong>자연 관찰 기록 + 자연 모방 사례 탐구 + 자유로운 조합 스케치</strong>입니다. 점수·순위·완성도 경고는 없습니다.</p>
        </section>

        <section>
          <h2>1~2차시 (80분) — 관찰과 사례 탐구</h2>
          <Plan rows={SESSION_12} />
          <p className="field-hint">첫 시간에는 조합·스케치 쪽으로 서두르지 않도록, 위쪽 책갈피에서 필요한 쪽만 펼쳐 진행할 수 있습니다.</p>
          <h2>3~4차시 (80분) — 조합과 표현</h2>
          <Plan rows={SESSION_34} />
        </section>

        <section>
          <h2>준비물</h2>
          <p><strong>1~2차시:</strong> 솔방울·나뭇잎·씨앗·조개껍데기 등 안전한 자연물(확보 가능한 범위), 돋보기, 태블릿, 자연물 사진·영상. 자연물을 억지로 채집하지 않습니다.</p>
          <p><strong>3~4차시:</strong> 자연물/생활용품 카드(앱 또는 인쇄본 — ‘모아보기 → 골라서 인쇄하기 → 카드 인쇄’), 색연필과 종이(선택), 태블릿. 실제 발명품 제작 재료는 필요하지 않습니다.</p>
        </section>

        <section>
          <h2>지도 시 유의할 점</h2>
          <ul>
            <li>“오늘 반드시 발명품을 하나 만들어야 한다”고 안내하지 않습니다.</li>
            <li>‘관찰한 사실’과 ‘추리한 사실’을 나누어 말하게 합니다(탐구 03의 ①확인 ②예상 ③새로 안 것).</li>
            <li>실제 기술 사례(■ 실제로 알려진 응용)와 학생의 상상(◇ 함께 상상해 보는 응용)을 구분합니다.</li>
            <li>설계도나 완성품이 없는 학생도 관찰 기록과 사례 설명만으로 학습 성과를 드러낼 수 있습니다. 그림 대신 글 설명도 동등하게 인정합니다.</li>
            <li>기기를 쓸 수 없을 때는 카드와 활동지 인쇄본으로 같은 학습을 이어갈 수 있습니다.</li>
            <li>살아 있는 식물을 꺾지 않기, 도꼬마리 가시·조개 조각 주의, 야생 조류 깃털은 장갑·지퍼백 사용.</li>
          </ul>
        </section>

        <section>
          <h2>자연물 교사용 참고</h2>
          <table className="rec-table">
            <tbody>
              {natureItems.map((n) => (
                <tr key={n.id}>
                  <th scope="row">{n.code} {n.name}</th>
                  <td>{n.teacherNote}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="field-hint">도감 그림은 모두 직접 제작한 개념 삽화이며 실제 현미경 사진이 아닙니다. 외부 사진은 포함하지 않았습니다.</p>
        </section>

        <section>
          <h2>콘텐츠 검수 목록 (정식 배포 전 확인)</h2>
          <p>아래 사례의 출처는 비워 두었습니다(지어내지 않음). 검증한 자료의 출처를 <code>src/data/biomimicryCases.ts</code>의 <code>sourceLabel</code>·<code>sourceUrl</code>에 입력해 주세요.</p>
          <table className="rec-table">
            <thead>
              <tr>
                <th scope="col">사례</th>
                <th scope="col">구분</th>
                <th scope="col">설명 시 주의</th>
                <th scope="col">출처 상태</th>
              </tr>
            </thead>
            <tbody>
              {biomimicryCases.map((c) => (
                <tr key={c.id}>
                  <th scope="row">{c.title}</th>
                  <td>{CATEGORY_LABEL[c.category]}</td>
                  <td>{c.caution}</td>
                  <td>{c.sourceUrl ? c.sourceLabel : '⚠ 출처 검수 필요'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <section>
          <h2>저장과 개인정보</h2>
          <p>로그인·서버·유료 API가 없습니다. 기록은 이 기기의 브라우저에만 저장됩니다(글: localStorage, 그림·사진: IndexedDB). 기기를 옮길 때는 ‘기록 내보내기(JSON)’ 파일을 사용하세요. 실명·학교명·위치는 수집하지 않으며, 첨부 사진은 다시 그려 저장하므로 촬영 위치 정보가 남지 않습니다.</p>
        </section>

        <section>
          <h2>마무리 질문</h2>
          <ul>
            <li>오늘 자연에서 새롭게 발견한 특징은 무엇인가요?</li>
            <li>자연의 모습이나 움직임 중 가장 신기했던 것은 무엇인가요?</li>
            <li>자연의 특징을 다른 물건과 연결하면 어떤 재미있는 생각이 떠오르나요?</li>
          </ul>
        </section>
      </div>
    </dialog>
  );
}
