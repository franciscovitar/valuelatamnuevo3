'use client';

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { ensureGsapPlugins } from '@/lib/scroll/gsap';
import {
  LINE_KEYS,
  WORLD_WIDTH,
  VIEWPORT_HEIGHT,
  CHECKPOINTS,
  GESTURE_WINDOWS,
  resolveGestureState,
  resolveLineState,
  getGestureRouteSamples,
  sliceRoute,
  routesToJson,
  createLabScrollController,
} from '@/lib/line-lab/trionnLinesEngine';
import { validateRoutes } from '@/lib/line-lab/poseValidation';

const CHECKPOINT_EPSILON = 0.0005;

export default function TrionnLinesLab() {
  const [mode, setMode] = useState('manual');
  const [progress, setProgress] = useState(0);
  const [panelCollapsed, setPanelCollapsed] = useState(false);
  const [copyStatus, setCopyStatus] = useState(null);
  const scrollRootRef = useRef(null);

  const gestureState = useMemo(
    () => resolveGestureState(progress),
    [progress]
  );

  const lineStates = useMemo(() => {
    const result = {};

    LINE_KEYS.forEach((lineKey) => {
      result[lineKey] = resolveLineState(
        progress,
        lineKey,
        { profileKey: 'desktop' }
      );
    });

    return result;
  }, [progress]);

  useEffect(() => {
    if (process.env.NODE_ENV === 'production') return;

    const warnings = validateRoutes();

    if (warnings.length) {
      console.warn(
        '[line-lab] route validation:',
        warnings
      );
    }
  }, []);

  useEffect(() => {
    if (mode !== 'scroll') return undefined;

    ensureGsapPlugins();

    const trigger = createLabScrollController(
      scrollRootRef.current,
      setProgress
    );

    return () => {
      trigger?.kill();
    };
  }, [mode]);

  const handleSliderChange = useCallback((event) => {
    setMode('manual');
    setProgress(Number(event.target.value));
  }, []);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(routesToJson());
      setCopyStatus('Copiado');
    } catch {
      setCopyStatus('Error al copiar');
    }
  }, []);

  return (
    <div className="line-lab">
      <svg
        className="line-lab__svg"
        viewBox={`0 0 ${WORLD_WIDTH} ${VIEWPORT_HEIGHT}`}
        preserveAspectRatio="none"
        aria-hidden="true"
        style={{ opacity: gestureState.opacity }}
      >
        {LINE_KEYS.map((lineKey) => {
          const state = lineStates[lineKey];
          const samples = getGestureRouteSamples(
            'desktop',
            state.gestureIndex,
            lineKey
          );

          return (
            <g
              key={lineKey}
              className={
                `line-lab__line-group `
                + `line-lab__line-group--${lineKey}`
              }
            >
              <path
                d={sliceRoute(
                  samples,
                  state.tailU,
                  state.activeStartU
                )}
                className={
                  `line-lab__path `
                  + `line-lab__path--${lineKey}`
                }
              />
              <path
                d={sliceRoute(
                  samples,
                  state.activeStartU,
                  state.headU
                )}
                className={
                  `line-lab__path `
                  + `line-lab__path--active `
                  + `line-lab__path--${lineKey}`
                }
              />
            </g>
          );
        })}
      </svg>

      {mode === 'scroll' && (
        <div
          ref={scrollRootRef}
          className="line-lab__scroll-root"
        />
      )}

      <aside className="line-lab__panel">
        <button
          type="button"
          className="line-lab__panel-toggle"
          onClick={() => {
            setPanelCollapsed((value) => !value);
          }}
        >
          Trionn Motion {panelCollapsed ? '>' : 'v'}
        </button>

        {!panelCollapsed && (
          <div className="line-lab__panel-body">
            <div className="line-lab__row">
              <span>Progreso</span>
              <strong>
                {(progress * 100).toFixed(1)}%
              </strong>
            </div>

            <input
              type="range"
              min={0}
              max={1}
              step={0.001}
              value={progress}
              onChange={handleSliderChange}
              aria-label="Progreso"
            />

            <div className="line-lab__row">
              <span>Gesto</span>
              <strong>{gestureState.gestureId}</strong>
            </div>

            <div className="line-lab__row">
              <span>Opacidad</span>
              <strong>
                {gestureState.opacity.toFixed(3)}
              </strong>
            </div>

            <div className="line-lab__checkpoint-buttons">
              {CHECKPOINTS.map((checkpoint) => (
                <button
                  key={checkpoint.id}
                  type="button"
                  aria-pressed={
                    Math.abs(
                      progress - checkpoint.progress
                    ) < CHECKPOINT_EPSILON
                  }
                  onClick={() => {
                    setMode('manual');
                    setProgress(checkpoint.progress);
                  }}
                >
                  {checkpoint.id}
                </button>
              ))}
            </div>

            <div className="line-lab__uvalues">
              {GESTURE_WINDOWS.map((gesture) => (
                <p
                  key={gesture.id}
                  className="line-lab__uvalue-row"
                >
                  {gesture.id}: {gesture.start.toFixed(3)}
                  {' - '}
                  {gesture.end.toFixed(3)}
                </p>
              ))}
            </div>

            <button
              type="button"
              className="line-lab__copy"
              onClick={handleCopy}
            >
              Copiar configuracion
            </button>

            {copyStatus && (
              <p className="line-lab__copy-status">
                {copyStatus}
              </p>
            )}
          </div>
        )}
      </aside>
    </div>
  );
}
