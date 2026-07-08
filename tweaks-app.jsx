// Tweaks panel for PROJECT ＃001 LP
const { useEffect } = React;

function LPTweaks() {
  const [t, setTweak] = useTweaks(window.__tweakState);

  // Sync to DOM whenever tweaks change
  useEffect(() => {
    window.__applyState(t);
  }, [t.palette, t.accent, t.lang, t.flowStyle]);

  return (
    <TweaksPanel title="Tweaks">
      <TweakSection label="Palette" />
      <TweakRadio
        label="Surface"
        value={t.palette}
        options={['ivory', 'sumi', 'noir']}
        onChange={(v) => setTweak('palette', v)}
      />
      <TweakColor
        label="Accent"
        value={t.accent}
        options={['gold', 'vermilion', 'indigo', 'bronze']}
        onChange={(v) => setTweak('accent', v)}
        getSwatch={(v) => ({
          gold: '#b89465',
          vermilion: '#9a2a1f',
          indigo: '#2a3f6a',
          bronze: '#8a6038',
        })[v]}
      />

      <TweakSection label="Language" />
      <TweakRadio
        label="Display"
        value={t.lang}
        options={['ja', 'en']}
        onChange={(v) => setTweak('lang', v)}
      />
    </TweaksPanel>
  );
}

// Custom TweakColor that maps a label to a swatch via getSwatch.
// Falls back gracefully if the helper isn't recognized; we just remap below.
// (The default TweakColor expects hex values; we pass names + a swatch map.)
const _OrigTweakColor = window.TweakColor;
window.TweakColor = function PatchedTweakColor(props) {
  const { getSwatch, options, value, onChange, label } = props;
  if (!getSwatch) return _OrigTweakColor(props);
  // Render a simple swatch row ourselves
  return (
    <div className="twk-row">
      <div className="twk-lbl"><span>{label}</span><span className="twk-val">{value}</span></div>
      <div style={{ display: 'flex', gap: 8 }}>
        {options.map((opt) => (
          <button
            key={opt}
            onClick={() => onChange(opt)}
            title={opt}
            style={{
              width: 28, height: 28, borderRadius: '50%',
              border: value === opt ? '2px solid #111' : '1px solid rgba(0,0,0,.15)',
              background: getSwatch(opt),
              cursor: 'pointer', padding: 0,
            }}
          />
        ))}
      </div>
    </div>
  );
};

ReactDOM.createRoot(document.getElementById('tweaks-mount')).render(<LPTweaks />);
