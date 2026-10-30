import { useRef, useState } from 'react';
import { describeSettings, experiments } from '../../data/experiments';
import type { DesignSettings, DesignTopic } from '../../models/Project12';
import ButtonPreview, { buttonTextAlternative } from './ButtonPreview';
import SignPreview, { signTextAlternative } from './SignPreview';
import StoragePreview, { storageTextAlternative } from './StoragePreview';
import { saveSvgAsPng } from './svgUtils';

export function textAlternative(topic: DesignTopic, s: DesignSettings): string[] {
  if (topic === 'sign') return signTextAlternative(s);
  if (topic === 'button') return buttonTextAlternative(s);
  return storageTextAlternative(s);
}

export function PreviewGraphic({ topic, settings, label }: { topic: DesignTopic; settings: DesignSettings; label: string }) {
  if (topic === 'sign') return <SignPreview settings={settings} label={label} />;
  if (topic === 'button') return <ButtonPreview settings={settings} label={label} />;
  return <StoragePreview settings={settings} label={label} />;
}

interface Props {
  topic: DesignTopic;
  settings: DesignSettings;
  caption: string;
  /** PNG 저장 버튼 표시 */
  allowPng?: boolean;
  pngName?: string;
  compact?: boolean;
}

/** 미리 보기 그림 + '현재 선택된 설정' 글 + 글로 보는 내용을 함께 보여 준다 */
export default function DesignPreview({ topic, settings, caption, allowPng, pngName, compact }: Props) {
  const box = useRef<HTMLDivElement>(null);
  const [pngError, setPngError] = useState('');
  const summary = describeSettings(topic, settings);
  const alt = textAlternative(topic, settings);

  const savePng = async () => {
    const svg = box.current?.querySelector('svg');
    if (!svg) return;
    setPngError('');
    try {
      await saveSvgAsPng(svg, pngName ?? `${experiments[topic].title}_디자인.png`);
    } catch (e) {
      setPngError(e instanceof Error ? e.message : '그림을 저장하지 못했어요.');
    }
  };

  return (
    <figure className={`preview-figure${compact ? ' compact' : ''}`}>
      <figcaption className="preview-caption">{caption}</figcaption>
      <div className="preview-stage" ref={box}>
        <PreviewGraphic topic={topic} settings={settings} label={`${caption}: ${summary}`} />
      </div>
      <p className="settings-summary">
        <span className="tag">현재 설정</span> {summary}
      </p>
      <details className="text-alt">
        <summary>그림 내용을 글로 보기</summary>
        <ul>
          {alt.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
      </details>
      {allowPng && (
        <div className="row-actions">
          <button type="button" className="btn ghost small" onClick={savePng}>
            🖼️ 그림 파일(PNG)로 저장
          </button>
          {pngError && <span role="alert" className="error-text">{pngError}</span>}
        </div>
      )}
    </figure>
  );
}
