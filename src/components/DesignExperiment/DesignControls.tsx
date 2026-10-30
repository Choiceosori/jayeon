import { experiments } from '../../data/experiments';
import type { DesignSettings, DesignTopic } from '../../models/Project12';

interface Props {
  topic: DesignTopic;
  settings: DesignSettings;
  onChange: (key: string, value: string) => void;
}

/** 실험 주제별 조작 패널. 모두 실제 라디오 입력이라 키보드(방향키)로도 조작된다. */
export default function DesignControls({ topic, settings, onChange }: Props) {
  const exp = experiments[topic];
  return (
    <div className="controls">
      {exp.controls.map((c) => (
        <fieldset key={c.key} className="control-group">
          <legend>{c.label}</legend>
          {c.help && <p className="hint">{c.help}</p>}
          <div className="chip-row">
            {c.options.map((o) => {
              const id = `ctl-${topic}-${c.key}-${o.value}`;
              return (
                <label key={o.value} htmlFor={id} className={`chip${settings[c.key] === o.value ? ' checked' : ''}`}>
                  <input
                    id={id}
                    type="radio"
                    name={`ctl-${topic}-${c.key}`}
                    value={o.value}
                    checked={settings[c.key] === o.value}
                    onChange={() => onChange(c.key, o.value)}
                  />
                  <span>{o.label}</span>
                  {o.compareOnly && <span className="badge-compare">비교용</span>}
                </label>
              );
            })}
          </div>
        </fieldset>
      ))}
    </div>
  );
}
