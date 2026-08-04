'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ensureGsapPlugins } from '@/lib/scroll/gsap';
import {
  LINE_KEYS,
  WORLD_WIDTH,
  VIEWPORT_HEIGHT,
  MASTER_PATH_D,
  MASTER_ROUTE_OPACITY,
  NODE_COLOR,
  CHECKPOINTS,
  resolveLineState,
  resolveCameraTop,
  routesToJson,
  createLabScrollController,
} from '@/lib/line-lab/trionnLinesEngine';
import { validateRoutes } from '@/lib/line-lab/poseValidation';

const CHECKPOINT_EPSILON = 0.0005;

export default function TrionnLinesLab() {
  const [mode, setMode] = useState('manual');
  const [progress, setProgress] = useState(0);
  const [showMasterRoute, setShowMasterRoute] = useState(false);
  const [showHeadTail, setShowHeadTail] = useState(false);
  const [panelCollapsed, setPanelCollapsed] = useState(false);
  const [viewport, setViewport] = useState({ width: 0, height: 0 });
  const [copyStatus, setCopyStatus] = useState(null);
  const scrollRootRef = useRef(null);

  const cameraTop = useMemo(() => resolveCameraTop(progress), [progress]);

  const lineStates = useMemo(() => {
    const result = {};
    LINE_KEYS.forEach((key) => {
      result[key] = resolveLineState(progress, key);
    });
    return result;
  }, [progress]);

  useEffect(() => {
    if (process.env.NODE_ENV === 'production') return;
    const warnings = validateRoutes();
    if (warnings.length) {
      console.warn('[line-lab] route validation:', warnings);
    }
  }, []);

  useEffect(() => {
    const update = () => setViewport({ width: window.innerWidth, height: window.innerHeight });
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  useEffect(() => {
    if (mode !== 'scroll') return undefined;
    ensureGsapPlugins();
    const trigger = createLabScrollController(scrollRootRef.current, setProgress);
    return () => {
      trigger?.kill();
    };
  }, [mode]);

  const handleSliderChange = useCallback((event) => {
    setMode('manual');
    setProgress(Number(event.target.value));
  }, []);

  const jumpToCheckpoint = useCallback((checkpoint) => {
    setMode('manual');
    setProgress(checkpoint.progress);
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
        viewBox={`0 ${cameraTop} ${WORLD_WIDTH} ${VIEWPORT_HEIGHT}`}
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        {LINE_KEYS.map((key) => (
          <path
            key={`master-${key}`}
            data-master-route={key}
            d={MASTER_PATH_D[key]}
            className="line-lab__master-path"
            style={{ opacity: showMasterRoute ? MASTER_ROUTE_OPACITY : 0 }}
          />
        ))}

        {LINE_KEYS.map((key) => (
          <path
            key={`trail-${key}`}
            data-visible-trail={key}
            d={lineStates[key].trailD}
            className={`line-lab__path line-lab__path--${key}`}
          />
        ))}

        {LINE_KEYS.map((key) => {
          const [cx, cy] = lineStates[key].headPoint;
          return (
            <g key={`node-${key}`} className="line-lab__node" style={{ '--node-color': NODE_COLOR[key] }}>
              <circle cx={cx} cy={cy} r={4.5} className="line-lab__node-halo" />
              <circle cx={cx} cy={cy} r={1.8} className="line-lab__node-core" />
            </g>
          );
        })}

        {showHeadTail &&
          LINE_KEYS.map((key) => {
            const [hx, hy] = lineStates[key].headPoint;
            const [tx, ty] = lineStates[key].tailPoint;
            return (
              <g key={`debug-${key}`}>
                <circle cx={hx} cy={hy} r={6} className="line-lab__debug-point line-lab__debug-point--head" />
                <circle cx={tx} cy={ty} r={6} className="line-lab__debug-point line-lab__debug-point--tail" />
              </g>
            );
          })}
      </svg>

      {mode === 'scroll' && <div ref={scrollRootRef} className="line-lab__scroll-root" />}

      <aside className="line-lab__panel">
        <button
          type="button"
          className="line-lab__panel-toggle"
          onClick={() => setPanelCollapsed((value) => !value)}
        >
          Line Lab · Gravity {panelCollapsed ? '▸' : '▾'}
        </button>

        {!panelCollapsed && (
          <div className="line-lab__panel-body">
            <div className="line-lab__row">
              <span>Progreso</span>
              <strong>{(progress * 100).toFixed(1)}%</strong>
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
              <span>Modo</span>
              <div className="line-lab__mode-toggle">
                <button type="button" aria-pressed={mode === 'manual'} onClick={() => setMode('manual')}>
                  Manual
                </button>
                <button type="button" aria-pressed={mode === 'scroll'} onClick={() => setMode('scroll')}>
                  Scroll
                </button>
              </div>
            </div>

            <div className="line-lab__checkpoint-buttons">
              {CHECKPOINTS.map((checkpoint) => (
                <button
                  key={checkpoint.id}
                  type="button"
                  aria-pressed={Math.abs(progress - checkpoint.progress) < CHECKPOINT_EPSILON}
                  onClick={() => jumpToCheckpoint(checkpoint)}
                >
                  {checkpoint.id}
                </button>
              ))}
            </div>

            <label className="line-lab__row">
              <span>Mostrar ruta completa</span>
              <input
                type="checkbox"
                checked={showMasterRoute}
                onChange={(event) => setShowMasterRoute(event.target.checked)}
              />
            </label>

            <label className="line-lab__row">
              <span>Mostrar head/tail</span>
              <input
                type="checkbox"
                checked={showHeadTail}
                onChange={(event) => setShowHeadTail(event.target.checked)}
              />
            </label>

            {showHeadTail && (
              <div className="line-lab__uvalues">
                <p className="line-lab__uvalue-row">cameraTop={cameraTop.toFixed(1)}</p>
                {LINE_KEYS.map((key) => {
                  const state = lineStates[key];
                  const headScreenY = state.headWorldY - cameraTop;
                  return (
                    <p key={key} className="line-lab__uvalue-row">
                      {key}: headWorldY={state.headWorldY.toFixed(1)} · tailWorldY={state.tailWorldY.toFixed(1)} · headU=
                      {state.headU.toFixed(3)} · tailU={state.tailU.toFixed(3)} · headScreenY={headScreenY.toFixed(1)}
                    </p>
                  );
                })}
              </div>
            )}

            <div className="line-lab__actions">
              <button type="button" onClick={handleCopy}>
                Copiar rutas JSON
              </button>
            </div>

            <p className="line-lab__viewport">
              {viewport.width} × {viewport.height}
            </p>
            {copyStatus && <p className="line-lab__status">{copyStatus}</p>}
          </div>
        )}
      </aside>
    </div>
  );
}
