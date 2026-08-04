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
  CONVERGENCE_BEATS,
  resolveLineState,
  resolveCameraTop,
  resolveConvergenceState,
  routesToJson,
  createLabScrollController,
} from '@/lib/line-lab/trionnLinesEngine';
import { validateRoutes } from '@/lib/line-lab/poseValidation';

const CHECKPOINT_EPSILON = 0.0005;

const LOCAL_FLOAT_BASE = {
  outer: { fx1: 4.2, fy1: -1.6, fx2: -3.4, fy2: 2.1, fx3: 1.7, fy3: 0.8, fx4: -1.89, fy4: 0.735 },
  middle: { fx1: -3.1, fy1: 1.9, fx2: 3.6, fy2: -2.4, fx3: -1.2, fy3: -0.7, fx4: 1.45, fy4: 0.6 },
  inner: { fx1: 4.5, fy1: 0.9, fx2: -3.2, fy2: -1.9, fx3: 1.6, fy3: -1.2, fx4: -1.8, fy4: 0.85 },
};

function buildLocalFloatVars(lineKey, localFloatStrength) {
  const base = LOCAL_FLOAT_BASE[lineKey];
  const s = Math.max(0, Math.min(1, localFloatStrength));
  return {
    '--fx1': `${base.fx1 * s}px`,
    '--fy1': `${base.fy1 * s}px`,
    '--fx2': `${base.fx2 * s}px`,
    '--fy2': `${base.fy2 * s}px`,
    '--fx3': `${base.fx3 * s}px`,
    '--fy3': `${base.fy3 * s}px`,
    '--fx4': `${base.fx4 * s}px`,
    '--fy4': `${base.fy4 * s}px`,
  };
}

export default function TrionnLinesLab() {
  const [mode, setMode] = useState('manual');
  const [progress, setProgress] = useState(0);
  const [showMasterRoute, setShowMasterRoute] = useState(false);
  const [showHeadTail, setShowHeadTail] = useState(false);
  const [showConvergences, setShowConvergences] = useState(false);
  const [floatingEnabled, setFloatingEnabled] = useState(true);
  const [panelCollapsed, setPanelCollapsed] = useState(false);
  const [viewport, setViewport] = useState({ width: 0, height: 0 });
  const [copyStatus, setCopyStatus] = useState(null);
  const scrollRootRef = useRef(null);

  const cameraTop = useMemo(() => resolveCameraTop(progress), [progress]);
  const convergenceState = useMemo(() => resolveConvergenceState(progress), [progress]);
  const localFloatStrength = 1 - convergenceState.mergeAmount;

  const worldUnitsPerPixelX = WORLD_WIDTH / Math.max(viewport.width, 1);
  const worldUnitsPerPixelY = VIEWPORT_HEIGHT / Math.max(viewport.height, 1);
  const coreRx = 1.05 * worldUnitsPerPixelX;
  const coreRy = 1.05 * worldUnitsPerPixelY;
  const haloRx = 2.5 * worldUnitsPerPixelX;
  const haloRy = 2.5 * worldUnitsPerPixelY;
  const convergenceMarkerRx = 2 * worldUnitsPerPixelX;
  const convergenceMarkerRy = 2 * worldUnitsPerPixelY;

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

  const sharedNodePoint = lineStates.outer.headPoint;

  return (
    <div className="line-lab">
      <svg
        className="line-lab__svg"
        viewBox={`0 ${cameraTop} ${WORLD_WIDTH} ${VIEWPORT_HEIGHT}`}
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        {showConvergences &&
          CONVERGENCE_BEATS.map((beat) => {
            const beatState = resolveLineState(beat.progress, 'outer');
            const [cx, cy] = beatState.headPoint;
            return (
              <ellipse
                key={`conv-${beat.progress}`}
                cx={cx}
                cy={cy}
                rx={convergenceMarkerRx}
                ry={convergenceMarkerRy}
                className="line-lab__convergence-marker"
              />
            );
          })}

        <g className={`line-lab__lines-world${floatingEnabled ? ' is-floating' : ''}`}>
          <g className="line-lab__shared-float">
            {LINE_KEYS.map((key) => {
              const state = lineStates[key];
              const [hx, hy] = state.headPoint;
              const [tx, ty] = state.tailPoint;
              const showNode = state.headU > 0.002;
              const nodeOpacity = Math.max(0, 1 - convergenceState.mergeAmount);

              return (
                <g
                  key={`line-group-${key}`}
                  data-line-group={key}
                  className={`line-lab__line-group line-lab__line-group--${key}${floatingEnabled ? ' is-floating' : ''}`}
                  style={{ '--node-color': NODE_COLOR, ...buildLocalFloatVars(key, floatingEnabled ? localFloatStrength : 0) }}
                >
                  <path
                    data-master-route={key}
                    d={MASTER_PATH_D[key]}
                    className="line-lab__master-path"
                    style={{ opacity: showMasterRoute ? MASTER_ROUTE_OPACITY : 0 }}
                  />

                  <path data-visible-trail={key} d={state.trailD} className={`line-lab__path line-lab__path--${key}`} />

                  {showNode && (
                    <g className="line-lab__node" style={{ opacity: nodeOpacity }}>
                      <ellipse cx={hx} cy={hy} rx={haloRx} ry={haloRy} className="line-lab__node-halo" />
                      <ellipse cx={hx} cy={hy} rx={coreRx} ry={coreRy} className="line-lab__node-core" />
                    </g>
                  )}

                  {showHeadTail && (
                    <g>
                      <ellipse cx={hx} cy={hy} rx={6 * worldUnitsPerPixelX} ry={6 * worldUnitsPerPixelY} className="line-lab__debug-point line-lab__debug-point--head" />
                      <ellipse cx={tx} cy={ty} rx={6 * worldUnitsPerPixelX} ry={6 * worldUnitsPerPixelY} className="line-lab__debug-point line-lab__debug-point--tail" />
                    </g>
                  )}
                </g>
              );
            })}

            {convergenceState.mergeAmount > 0.001 && (
              <g className="line-lab__shared-node" style={{ opacity: convergenceState.mergeAmount }}>
                <ellipse cx={sharedNodePoint[0]} cy={sharedNodePoint[1]} rx={haloRx} ry={haloRy} className="line-lab__node-halo" />
                <ellipse cx={sharedNodePoint[0]} cy={sharedNodePoint[1]} rx={coreRx} ry={coreRy} className="line-lab__node-core" />
              </g>
            )}
          </g>
        </g>
      </svg>

      {mode === 'scroll' && <div ref={scrollRootRef} className="line-lab__scroll-root" />}

      <aside className="line-lab__panel">
        <button type="button" className="line-lab__panel-toggle" onClick={() => setPanelCollapsed((value) => !value)}>
          Line Lab · Gravity {panelCollapsed ? '▸' : '▾'}
        </button>

        {!panelCollapsed && (
          <div className="line-lab__panel-body">
            <div className="line-lab__row">
              <span>Progreso</span>
              <strong>{(progress * 100).toFixed(1)}%</strong>
            </div>
            <input type="range" min={0} max={1} step={0.001} value={progress} onChange={handleSliderChange} aria-label="Progreso" />

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
              <input type="checkbox" checked={showMasterRoute} onChange={(event) => setShowMasterRoute(event.target.checked)} />
            </label>

            <label className="line-lab__row">
              <span>Mostrar head/tail</span>
              <input type="checkbox" checked={showHeadTail} onChange={(event) => setShowHeadTail(event.target.checked)} />
            </label>

            <label className="line-lab__row">
              <span>Mostrar convergencias</span>
              <input type="checkbox" checked={showConvergences} onChange={(event) => setShowConvergences(event.target.checked)} />
            </label>

            <label className="line-lab__row">
              <span>Flotación sutil</span>
              <input type="checkbox" checked={floatingEnabled} onChange={(event) => setFloatingEnabled(event.target.checked)} />
            </label>

            <div className="line-lab__uvalues">
              <p className="line-lab__uvalue-row">nearestConvergence={convergenceState.nearestProgress.toFixed(3)}</p>
              <p className="line-lab__uvalue-row">mergeAmount={convergenceState.mergeAmount.toFixed(3)}</p>
              <p className="line-lab__uvalue-row">localFloatStrength={localFloatStrength.toFixed(3)}</p>
              <p className="line-lab__uvalue-row">cameraTop={cameraTop.toFixed(1)}</p>
              {showHeadTail &&
                LINE_KEYS.map((key) => {
                  const state = lineStates[key];
                  const headScreenY = state.headWorldY - cameraTop;
                  return (
                    <p key={key} className="line-lab__uvalue-row">
                      {key}: headWorldY={state.headWorldY.toFixed(1)} · tailWorldY={state.tailWorldY.toFixed(1)} · headU={state.headU.toFixed(3)} · tailU={state.tailU.toFixed(3)} · headScreenY={headScreenY.toFixed(1)} · trailPointCount={state.trailPointCount}
                    </p>
                  );
                })}
            </div>

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
