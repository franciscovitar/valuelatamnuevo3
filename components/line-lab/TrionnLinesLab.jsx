'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ensureGsapPlugins } from '@/lib/scroll/gsap';
import {
  CONTROL_KEYS,
  KEYFRAMES,
  LINE_KEYS,
  NODE_COLOR,
  VIEWBOX_SIZE,
  buildPathD,
  clearStoredKeyframes,
  cloneKeyframes,
  createLabScrollController,
  keyframesToJson,
  loadStoredKeyframes,
  normFromViewport,
  resolveOpacity,
  resolvePoseAtProgress,
  saveStoredKeyframes,
} from '@/lib/line-lab/trionnLinesEngine';
import { validateKeyframes } from '@/lib/line-lab/poseValidation';

const HANDLE_COLOR = { p0: '#6b8fb8', cp1: '#8fb2d6', cp2: '#c49a3a', p3: '#e8dcc8' };
const STATUS_TIMEOUT_MS = 1500;

export default function TrionnLinesLab() {
  const scrollRootRef = useRef(null);
  const dragRef = useRef(null);
  const statusTimeoutRef = useRef(null);

  const [keyframes, setKeyframes] = useState(() => loadStoredKeyframes() || cloneKeyframes(KEYFRAMES));
  const [mode, setMode] = useState('manual');
  const [progress, setProgress] = useState(0);
  const [editKeyframeIndex, setEditKeyframeIndex] = useState(0);
  const [showControlPoints, setShowControlPoints] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [panelCollapsed, setPanelCollapsed] = useState(false);
  const [viewport, setViewport] = useState({ width: 0, height: 0 });
  const [copyStatus, setCopyStatus] = useState('');

  const pose = useMemo(() => resolvePoseAtProgress(progress, keyframes), [progress, keyframes]);
  const opacity = useMemo(() => resolveOpacity(progress), [progress]);

  const showStatus = useCallback((text) => {
    setCopyStatus(text);
    clearTimeout(statusTimeoutRef.current);
    statusTimeoutRef.current = setTimeout(() => setCopyStatus(''), STATUS_TIMEOUT_MS);
  }, []);

  useEffect(() => () => clearTimeout(statusTimeoutRef.current), []);

  // Dev-only pose validation — never runs in production, never blocks rendering.
  useEffect(() => {
    if (process.env.NODE_ENV === 'production') return;
    const warnings = validateKeyframes(keyframes);
    if (warnings.length) {
      console.warn('[line-lab] pose validation:', warnings);
    }
  }, [keyframes]);

  useEffect(() => {
    const update = () => setViewport({ width: window.innerWidth, height: window.innerHeight });
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  // Exactly one ScrollTrigger, only while in scroll mode; slider and scroll never drive progress at once.
  useEffect(() => {
    if (mode !== 'scroll') return undefined;
    const scrollRoot = scrollRootRef.current;
    if (!scrollRoot) return undefined;
    ensureGsapPlugins();
    const trigger = createLabScrollController(scrollRoot, setProgress);
    return () => trigger.kill();
  }, [mode]);

  const handlePointerDown = useCallback(
    (lineKey, controlKey) => (e) => {
      e.currentTarget.setPointerCapture(e.pointerId);
      dragRef.current = { lineKey, controlKey };
    },
    [],
  );

  const handlePointerMove = useCallback(
    (e) => {
      const drag = dragRef.current;
      if (!drag) return;
      const [nx, ny] = normFromViewport(e.clientX, e.clientY);
      setKeyframes((prev) => {
        const next = cloneKeyframes(prev);
        next[editKeyframeIndex][drag.lineKey][drag.controlKey] = [nx, ny];
        saveStoredKeyframes(next);
        return next;
      });
    },
    [editKeyframeIndex],
  );

  const handlePointerUp = useCallback((e) => {
    dragRef.current = null;
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      /* noop */
    }
  }, []);

  const handleRestore = useCallback(() => {
    clearStoredKeyframes();
    setKeyframes(cloneKeyframes(KEYFRAMES));
    showStatus('Restaurado');
  }, [showStatus]);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(keyframesToJson(keyframes));
      showStatus('Copiado');
    } catch {
      showStatus('Error al copiar');
    }
  }, [keyframes, showStatus]);

  const jumpToProgress = useCallback((value) => {
    setMode('manual');
    setProgress(value);
  }, []);

  return (
    <div className="line-lab" data-mode={mode}>
      <svg
        className="line-lab__svg"
        viewBox={`0 0 ${VIEWBOX_SIZE} ${VIEWBOX_SIZE}`}
        preserveAspectRatio="none"
        style={{ opacity }}
        aria-hidden="true"
      >
        {LINE_KEYS.map((lineKey) => (
          <path key={lineKey} className={`line-lab__path line-lab__path--${lineKey}`} d={buildPathD(pose[lineKey])} />
        ))}

        {editMode && showControlPoints
          ? LINE_KEYS.map((lineKey) => {
              const curve = keyframes[editKeyframeIndex][lineKey];
              return (
                <g key={`guides-${lineKey}`} className="line-lab__guides">
                  <line
                    x1={curve.p0[0] * VIEWBOX_SIZE}
                    y1={curve.p0[1] * VIEWBOX_SIZE}
                    x2={curve.cp1[0] * VIEWBOX_SIZE}
                    y2={curve.cp1[1] * VIEWBOX_SIZE}
                  />
                  <line
                    x1={curve.cp2[0] * VIEWBOX_SIZE}
                    y1={curve.cp2[1] * VIEWBOX_SIZE}
                    x2={curve.p3[0] * VIEWBOX_SIZE}
                    y2={curve.p3[1] * VIEWBOX_SIZE}
                  />
                </g>
              );
            })
          : null}
      </svg>

      <div className="line-lab__nodes" aria-hidden="true">
        {LINE_KEYS.map((lineKey) => (
          <span
            key={lineKey}
            className="line-lab__node"
            style={{
              left: `${pose[lineKey].p3[0] * 100}%`,
              top: `${pose[lineKey].p3[1] * 100}%`,
              opacity,
              '--node-color': NODE_COLOR[lineKey],
            }}
          >
            <span className="line-lab__node-halo" />
            <span className="line-lab__node-core" />
          </span>
        ))}
      </div>

      {editMode ? (
        <div className="line-lab__handles">
          {LINE_KEYS.flatMap((lineKey) =>
            CONTROL_KEYS.map((controlKey) => {
              const point = keyframes[editKeyframeIndex][lineKey][controlKey];
              return (
                <button
                  key={`${lineKey}-${controlKey}`}
                  type="button"
                  className="line-lab__handle"
                  style={{
                    left: `${point[0] * 100}%`,
                    top: `${point[1] * 100}%`,
                    '--handle-color': HANDLE_COLOR[controlKey],
                  }}
                  onPointerDown={handlePointerDown(lineKey, controlKey)}
                  onPointerMove={handlePointerMove}
                  onPointerUp={handlePointerUp}
                  onPointerCancel={handlePointerUp}
                  aria-label={`${lineKey} ${controlKey}`}
                />
              );
            }),
          )}
        </div>
      ) : null}

      {mode === 'scroll' ? <div ref={scrollRootRef} className="line-lab__scroll-root" aria-hidden="true" /> : null}

      <aside className={`line-lab__panel${panelCollapsed ? ' is-collapsed' : ''}`}>
        <button type="button" className="line-lab__panel-toggle" onClick={() => setPanelCollapsed((v) => !v)}>
          {panelCollapsed ? 'Line Lab ▸' : 'Line Lab · K0–K8 ▾'}
        </button>

        {panelCollapsed ? null : (
          <div className="line-lab__panel-body">
            <div className="line-lab__row">
              <span>Progreso</span>
              <strong>{(progress * 100).toFixed(1)}%</strong>
            </div>

            <input
              type="range"
              min="0"
              max="1"
              step="0.001"
              value={progress}
              onChange={(e) => jumpToProgress(Number(e.target.value))}
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

            <div className="line-lab__keyframe-buttons">
              {keyframes.map((kf) => (
                <button
                  key={kf.id}
                  type="button"
                  aria-pressed={mode === 'manual' && Math.abs(progress - kf.progress) < 0.001}
                  onClick={() => jumpToProgress(kf.progress)}
                  title={kf.name}
                >
                  {kf.id}
                </button>
              ))}
            </div>

            <label className="line-lab__row">
              <span>Editar keyframe</span>
              <select
                value={editKeyframeIndex}
                onChange={(e) => {
                  const index = Number(e.target.value);
                  setEditKeyframeIndex(index);
                  jumpToProgress(keyframes[index].progress);
                }}
              >
                {keyframes.map((kf, index) => (
                  <option key={kf.id} value={index}>
                    {kf.id}
                  </option>
                ))}
              </select>
            </label>

            <label className="line-lab__row">
              <span>Mostrar puntos de control</span>
              <input
                type="checkbox"
                checked={showControlPoints}
                onChange={(e) => setShowControlPoints(e.target.checked)}
              />
            </label>

            <label className="line-lab__row">
              <span>Modo edición</span>
              <input type="checkbox" checked={editMode} onChange={(e) => setEditMode(e.target.checked)} />
            </label>

            <div className="line-lab__actions">
              <button type="button" onClick={handleRestore}>
                Restaurar valores originales
              </button>
              <button type="button" onClick={handleCopy}>
                Copiar keyframes JSON
              </button>
            </div>

            <p className="line-lab__viewport">
              {viewport.width} × {viewport.height}
            </p>
            {copyStatus ? <p className="line-lab__status">{copyStatus}</p> : null}
          </div>
        )}
      </aside>
    </div>
  );
}
