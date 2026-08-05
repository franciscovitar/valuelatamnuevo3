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

export default function TrionnLinesLab() {
  const [mode, setMode] = useState('manual');
  const [progress, setProgress] = useState(0);
  const [showMasterRoute, setShowMasterRoute] = useState(false);
  const [showHeadTail, setShowHeadTail] = useState(false);
  const [showConvergences, setShowConvergences] = useState(false);
  const [panelCollapsed, setPanelCollapsed] = useState(false);
  const [viewport, setViewport] = useState({
    width: 0,
    height: 0,
  });
  const [copyStatus, setCopyStatus] = useState(null);
  const scrollRootRef = useRef(null);

  const cameraTop = useMemo(
    () => resolveCameraTop(progress),
    [progress]
  );
  const convergenceState = useMemo(
    () => resolveConvergenceState(progress),
    [progress]
  );

  const worldUnitsPerPixelX = (
    WORLD_WIDTH / Math.max(viewport.width, 1)
  );
  const worldUnitsPerPixelY = (
    VIEWPORT_HEIGHT / Math.max(viewport.height, 1)
  );
  const coreRx = 0.85 * worldUnitsPerPixelX;
  const coreRy = 0.85 * worldUnitsPerPixelY;
  const haloRx = 2.05 * worldUnitsPerPixelX;
  const haloRy = 2.05 * worldUnitsPerPixelY;
  const convergenceMarkerRx = 2 * worldUnitsPerPixelX;
  const convergenceMarkerRy = 2 * worldUnitsPerPixelY;

  const lineStates = useMemo(() => {
    const result = {};

    LINE_KEYS.forEach((lineKey) => {
      result[lineKey] = resolveLineState(
        progress,
        lineKey
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
    const update = () => {
      setViewport({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    update();
    window.addEventListener('resize', update);

    return () => {
      window.removeEventListener('resize', update);
    };
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

  const sharedNodePoint = lineStates.middle.headPoint;
  const showSharedNode = lineStates.middle.headU > 0.002;

  return (
    <div className="line-lab">
      <svg
        className="line-lab__svg"
        viewBox={
          `0 ${cameraTop} ${WORLD_WIDTH} ${VIEWPORT_HEIGHT}`
        }
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        {showConvergences
          && CONVERGENCE_BEATS.map((beat) => {
            const beatState = resolveLineState(
              beat.progress,
              'middle'
            );
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

        <g className="line-lab__lines-world">
          <g className="line-lab__shared-float">
            {LINE_KEYS.map((lineKey) => {
              const state = lineStates[lineKey];
              const [hx, hy] = state.headPoint;
              const [tx, ty] = state.tailPoint;

              return (
                <g
                  key={`line-group-${lineKey}`}
                  data-line-group={lineKey}
                  className={
                    `line-lab__line-group `
                    + `line-lab__line-group--${lineKey}`
                  }
                  style={{ '--node-color': NODE_COLOR }}
                >
                  <path
                    data-master-route={lineKey}
                    d={MASTER_PATH_D[lineKey]}
                    className="line-lab__master-path"
                    style={{
                      opacity: showMasterRoute
                        ? MASTER_ROUTE_OPACITY
                        : 0,
                    }}
                  />

                  <path
                    data-visible-trail={lineKey}
                    d={state.trailD}
                    className={
                      `line-lab__path `
                      + `line-lab__path--${lineKey}`
                    }
                  />

                  {showHeadTail && (
                    <g>
                      <ellipse
                        cx={hx}
                        cy={hy}
                        rx={6 * worldUnitsPerPixelX}
                        ry={6 * worldUnitsPerPixelY}
                        className={
                          'line-lab__debug-point '
                          + 'line-lab__debug-point--head'
                        }
                      />
                      <ellipse
                        cx={tx}
                        cy={ty}
                        rx={6 * worldUnitsPerPixelX}
                        ry={6 * worldUnitsPerPixelY}
                        className={
                          'line-lab__debug-point '
                          + 'line-lab__debug-point--tail'
                        }
                      />
                    </g>
                  )}
                </g>
              );
            })}

            {showSharedNode && (
              <g
                className="line-lab__shared-node"
                style={{ '--node-color': NODE_COLOR }}
              >
                <ellipse
                  cx={sharedNodePoint[0]}
                  cy={sharedNodePoint[1]}
                  rx={haloRx}
                  ry={haloRy}
                  className="line-lab__node-halo"
                />
                <ellipse
                  cx={sharedNodePoint[0]}
                  cy={sharedNodePoint[1]}
                  rx={coreRx}
                  ry={coreRy}
                  className="line-lab__node-core"
                />
              </g>
            )}
          </g>
        </g>
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
          Line Lab - Normal Bundle {panelCollapsed ? '>' : 'v'}
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
              <span>Modo</span>
              <div className="line-lab__mode-toggle">
                <button
                  type="button"
                  aria-pressed={mode === 'manual'}
                  onClick={() => setMode('manual')}
                >
                  Manual
                </button>
                <button
                  type="button"
                  aria-pressed={mode === 'scroll'}
                  onClick={() => setMode('scroll')}
                >
                  Scroll
                </button>
              </div>
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
                    jumpToCheckpoint(checkpoint);
                  }}
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
                onChange={(event) => {
                  setShowMasterRoute(event.target.checked);
                }}
              />
            </label>

            <label className="line-lab__row">
              <span>Mostrar head/tail</span>
              <input
                type="checkbox"
                checked={showHeadTail}
                onChange={(event) => {
                  setShowHeadTail(event.target.checked);
                }}
              />
            </label>

            <label className="line-lab__row">
              <span>Mostrar convergencias</span>
              <input
                type="checkbox"
                checked={showConvergences}
                onChange={(event) => {
                  setShowConvergences(event.target.checked);
                }}
              />
            </label>

            <div className="line-lab__uvalues">
              <p className="line-lab__uvalue-row">
                nearestConvergence=
                {convergenceState.nearestProgress.toFixed(3)}
              </p>
              <p className="line-lab__uvalue-row">
                mergeAmount=
                {convergenceState.mergeAmount.toFixed(3)}
              </p>
              {LINE_KEYS.map((lineKey) => (
                <p
                  key={`u-${lineKey}`}
                  className="line-lab__uvalue-row"
                >
                  {lineKey}: headU=
                  {lineStates[lineKey].headU.toFixed(4)}
                  {' '}activeStartU=
                  {lineStates[lineKey].activeStartU.toFixed(4)}
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
