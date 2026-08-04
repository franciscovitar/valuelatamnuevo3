'use client';

import { Suspense, useCallback, useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { ensureGsapPlugins } from '@/lib/scroll/gsap';
import { prefersReducedMotion } from '@/lib/motion/tokens';
import {
  DEFAULT_PARAMS,
  KEYFRAMES,
  clearStoredKeyframes,
  createTrionnLinesEngine,
  destroyTrionnLinesEngine,
  enterEditMode,
  exitEditMode,
  hitTestEditHandle,
  jumpToKeyframeProgress,
  keyframeToJson,
  normFromClient,
  pauseScroll,
  restoreKeyframes,
  resumeScroll,
  saveStoredKeyframes,
  setEditControl,
  setEngineParams,
} from '@/lib/line-lab/trionnLinesEngine';

function LineLabDebugPanel({ engineRef, onRefresh }) {
  const [progress, setProgress] = useState(0);
  const [keyframeIndex, setKeyframeIndex] = useState(0);
  const [params, setParams] = useState({ ...DEFAULT_PARAMS, reveal: 1 });
  const [editMode, setEditMode] = useState(false);
  const [editKeyframe, setEditKeyframe] = useState(0);
  const [showBezierControls, setShowBezierControls] = useState(false);
  const [showTarget, setShowTarget] = useState(false);
  const [showCurrent, setShowCurrent] = useState(false);
  const [floatEnabled, setFloatEnabled] = useState(true);
  const [paused, setPaused] = useState(false);
  const [copyStatus, setCopyStatus] = useState('');
  const [refVisible, setRefVisible] = useState(false);
  const [refOpacity, setRefOpacity] = useState(0.45);
  const [refUrl, setRefUrl] = useState(null);

  const sync = useCallback(() => {
    const engine = engineRef.current;
    if (!engine) return;
    setProgress(engine.manualProgress ?? engine.scrollProgress);
    setKeyframeIndex(engine.keyframeIndex);
    setParams({ ...engine.params });
    setEditMode(engine.editMode);
    setEditKeyframe(engine.editKeyframeIndex);
    setShowBezierControls(engine.showBezierControls);
    setShowTarget(engine.showTarget);
    setShowCurrent(engine.showCurrent);
    setFloatEnabled(engine.floatEnabled);
    setPaused(engine.paused);
  }, [engineRef]);

  useEffect(() => {
    sync();
    const id = setInterval(sync, 200);
    return () => clearInterval(id);
  }, [sync]);

  useEffect(() => {
    return () => {
      if (refUrl) URL.revokeObjectURL(refUrl);
    };
  }, [refUrl]);

  const applyParams = (partial) => {
    const engine = engineRef.current;
    if (!engine) return;
    setEngineParams(engine, partial);
    setParams((p) => ({ ...p, ...partial }));
  };

  const copyText = async (text, label) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopyStatus(label);
      setTimeout(() => setCopyStatus(''), 1600);
    } catch {
      setCopyStatus('Error al copiar');
    }
  };

  const onRefFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (refUrl) URL.revokeObjectURL(refUrl);
    setRefUrl(URL.createObjectURL(file));
    setRefVisible(true);
  };

  const toggleEdit = () => {
    const engine = engineRef.current;
    if (!engine) return;
    if (engine.editMode) {
      exitEditMode(engine);
      setEditMode(false);
    } else {
      enterEditMode(engine, editKeyframe);
      setEditMode(true);
      setPaused(true);
    }
  };

  return (
    <>
      {refUrl && refVisible ? (
        <img
          src={refUrl}
          alt=""
          className="line-lab__ref-overlay"
          style={{ opacity: refOpacity }}
          aria-hidden="true"
        />
      ) : null}

      <aside className="line-lab__debug" aria-label="Bezier lab debug">
        <h2>Bézier Lab · K0–K5</h2>

        <div className="line-lab__debug-row">
          <label>Progreso secuencia</label>
          <span>{(progress * 100).toFixed(1)}%</span>
        </div>
        <div className="line-lab__debug-row">
          <label>Keyframe</label>
          <span>
            {keyframeIndex + 1} / {KEYFRAMES.length}
          </span>
        </div>

        <div className="line-lab__debug-row">
          <label htmlFor="ll-progress">Progreso manual</label>
          <input
            id="ll-progress"
            type="range"
            min="0"
            max="1"
            step="0.001"
            value={progress}
            onChange={(e) => {
              const v = Number(e.target.value);
              setProgress(v);
              jumpToKeyframeProgress(engineRef.current, v);
            }}
          />
        </div>

        <div className="line-lab__debug-row">
          <label htmlFor="ll-kf-edit">Editar keyframe</label>
          <select
            id="ll-kf-edit"
            value={editKeyframe}
            onChange={(e) => {
              const v = Number(e.target.value);
              setEditKeyframe(v);
              const engine = engineRef.current;
              if (engine) engine.editKeyframeIndex = v;
            }}
          >
            {KEYFRAMES.map((kf, i) => (
              <option key={kf.id} value={i}>
                {kf.name}
              </option>
            ))}
          </select>
        </div>

        <div className="line-lab__debug-row">
          <label htmlFor="ll-edit">Editor draggable</label>
          <input id="ll-edit" type="checkbox" checked={editMode} onChange={toggleEdit} />
        </div>

        <p className="line-lab__debug-hint">Easing por punto</p>
        {[
          ['easeP0', 'p0', 0.02, 0.06],
          ['easeCp1', 'cp1', 0.03, 0.08],
          ['easeCp2', 'cp2', 0.07, 0.16],
          ['easeP3', 'p3', 0.1, 0.2],
        ].map(([key, label, min, max]) => (
          <div key={key} className="line-lab__debug-row">
            <label htmlFor={key}>{label}</label>
            <input
              id={key}
              type="range"
              min={min}
              max={max}
              step="0.005"
              value={params[key]}
              onChange={(e) => applyParams({ [key]: Number(e.target.value) })}
            />
          </div>
        ))}

        <p className="line-lab__debug-hint">Flotación</p>
        {[
          ['floatP0', 'p0 amp', 1, 3],
          ['floatCp1X', 'cp1 X', 10, 20],
          ['floatCp1Y', 'cp1 Y', 7, 14],
          ['floatCp2X', 'cp2 X', 12, 24],
          ['floatCp2Y', 'cp2 Y', 8, 16],
          ['floatP3', 'p3 amp', 3, 7],
        ].map(([key, label, min, max]) => (
          <div key={key} className="line-lab__debug-row">
            <label htmlFor={key}>{label}</label>
            <input
              id={key}
              type="range"
              min={min}
              max={max}
              step="0.5"
              value={params[key]}
              onChange={(e) => applyParams({ [key]: Number(e.target.value) })}
            />
          </div>
        ))}

        <div className="line-lab__debug-row">
          <label htmlFor="ll-float-speed">Float speed</label>
          <input
            id="ll-float-speed"
            type="range"
            min="0.00015"
            max="0.0005"
            step="0.00001"
            value={params.floatSpeed}
            onChange={(e) => applyParams({ floatSpeed: Number(e.target.value) })}
          />
        </div>

        <div className="line-lab__debug-row">
          <label htmlFor="ll-float-on">Flotación</label>
          <input
            id="ll-float-on"
            type="checkbox"
            checked={floatEnabled}
            onChange={(e) => {
              const engine = engineRef.current;
              if (engine) engine.floatEnabled = e.target.checked;
              setFloatEnabled(e.target.checked);
            }}
          />
        </div>

        <div className="line-lab__debug-row">
          <label htmlFor="ll-bezier">Controles Bézier</label>
          <input
            id="ll-bezier"
            type="checkbox"
            checked={showBezierControls}
            onChange={(e) => {
              const engine = engineRef.current;
              if (engine) engine.showBezierControls = e.target.checked;
              setShowBezierControls(e.target.checked);
            }}
          />
        </div>

        <div className="line-lab__debug-row">
          <label htmlFor="ll-target">Target</label>
          <input
            id="ll-target"
            type="checkbox"
            checked={showTarget}
            onChange={(e) => {
              const engine = engineRef.current;
              if (engine) engine.showTarget = e.target.checked;
              setShowTarget(e.target.checked);
            }}
          />
        </div>

        <div className="line-lab__debug-row">
          <label htmlFor="ll-current">Current</label>
          <input
            id="ll-current"
            type="checkbox"
            checked={showCurrent}
            onChange={(e) => {
              const engine = engineRef.current;
              if (engine) engine.showCurrent = e.target.checked;
              setShowCurrent(e.target.checked);
            }}
          />
        </div>

        <p className="line-lab__debug-hint">Referencia visual</p>
        <div className="line-lab__debug-row">
          <label htmlFor="ll-ref-file">Cargar imagen</label>
          <input id="ll-ref-file" type="file" accept="image/*" onChange={onRefFile} />
        </div>
        <div className="line-lab__debug-row">
          <label htmlFor="ll-ref-op">Opacidad ref</label>
          <input
            id="ll-ref-op"
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={refOpacity}
            onChange={(e) => setRefOpacity(Number(e.target.value))}
          />
        </div>
        <div className="line-lab__debug-row">
          <label htmlFor="ll-ref-vis">Mostrar ref</label>
          <input
            id="ll-ref-vis"
            type="checkbox"
            checked={refVisible}
            onChange={(e) => setRefVisible(e.target.checked)}
          />
        </div>

        <div className="line-lab__debug-actions">
          <button type="button" onClick={() => resumeScroll(engineRef.current)}>
            Reanudar scroll
          </button>
          <button
            type="button"
            onClick={() => {
              if (engineRef.current?.paused) resumeScroll(engineRef.current);
              else pauseScroll(engineRef.current);
              sync();
            }}
          >
            {paused ? 'Scroll activo' : 'Pausar scroll'}
          </button>
          <button type="button" onClick={onRefresh}>
            Refresh ST
          </button>
        </div>

        <div className="line-lab__debug-actions">
          <button
            type="button"
            onClick={() =>
              copyText(
                JSON.stringify(keyframeToJson(engineRef.current?.keyframes[editKeyframe] ?? KEYFRAMES[editKeyframe]), null, 2),
                'Keyframe copiado',
              )
            }
          >
            Copiar keyframe
          </button>
          <button
            type="button"
            onClick={() =>
              copyText(
                JSON.stringify(engineRef.current?.keyframes.map(keyframeToJson) ?? KEYFRAMES.map(keyframeToJson), null, 2),
                'Todos copiados',
              )
            }
          >
            Copiar todos
          </button>
          <button type="button" onClick={() => restoreKeyframes(engineRef.current)}>
            Restaurar
          </button>
          <button
            type="button"
            onClick={() => {
              saveStoredKeyframes(engineRef.current?.keyframes ?? KEYFRAMES);
              setCopyStatus('Guardado local');
            }}
          >
            Guardar local
          </button>
          <button
            type="button"
            onClick={() => {
              clearStoredKeyframes();
              restoreKeyframes(engineRef.current);
              setCopyStatus('Local borrado');
            }}
          >
            Borrar local
          </button>
        </div>

        <p className="line-lab__debug-value">
          reveal {params.reveal.toFixed(2)} · sin undraw · sin path range
        </p>
        {copyStatus ? <p className="line-lab__debug-status">{copyStatus}</p> : null}
      </aside>
    </>
  );
}

function TrionnLinesLabInner() {
  const searchParams = useSearchParams();
  const debug = searchParams.get('debug') === '1';
  const canvasRef = useRef(null);
  const scrollRef = useRef(null);
  const engineRef = useRef(null);
  const initRef = useRef(false);
  const dragRef = useRef(null);

  const refreshScrollTrigger = useCallback(() => {
    ensureGsapPlugins();
    import('@/lib/scroll/gsap').then(({ ScrollTrigger }) => ScrollTrigger.refresh());
  }, []);

  useEffect(() => {
    if (initRef.current) return;
    const canvas = canvasRef.current;
    const scrollRoot = scrollRef.current;
    if (!canvas || !scrollRoot) return;

    initRef.current = true;
    ensureGsapPlugins();
    engineRef.current = createTrionnLinesEngine(canvas, scrollRoot, {
      reduced: prefersReducedMotion(),
      debug,
    });

    return () => {
      destroyTrionnLinesEngine(engineRef.current);
      engineRef.current = null;
      initRef.current = false;
    };
  }, [debug]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !debug) return undefined;

    const onPointerDown = (e) => {
      const engine = engineRef.current;
      if (!engine?.editMode) return;
      const hit = hitTestEditHandle(engine, e.clientX, e.clientY);
      if (!hit) return;
      dragRef.current = hit;
      canvas.setPointerCapture(e.pointerId);
    };

    const onPointerMove = (e) => {
      const engine = engineRef.current;
      const drag = dragRef.current;
      if (!engine?.editMode || !drag) return;
      const [nx, ny] = normFromClient(engine, e.clientX, e.clientY);
      setEditControl(engine, drag.keyframeIndex, drag.lineKey, drag.controlKey, nx, ny);
      engine.render();
    };

    const onPointerUp = (e) => {
      dragRef.current = null;
      canvas.releasePointerCapture(e.pointerId);
    };

    canvas.addEventListener('pointerdown', onPointerDown);
    canvas.addEventListener('pointermove', onPointerMove);
    canvas.addEventListener('pointerup', onPointerUp);
    canvas.addEventListener('pointercancel', onPointerUp);

    return () => {
      canvas.removeEventListener('pointerdown', onPointerDown);
      canvas.removeEventListener('pointermove', onPointerMove);
      canvas.removeEventListener('pointerup', onPointerUp);
      canvas.removeEventListener('pointercancel', onPointerUp);
    };
  }, [debug]);

  return (
    <div className="line-lab">
      <canvas
        ref={canvasRef}
        className={`line-lab__canvas${debug ? ' line-lab__canvas--debug' : ''}`}
        aria-hidden="true"
      />

      <div ref={scrollRef} className="line-lab__scroll line-lab__scroll--sequence" id="line-lab-scroll-root">
        <div className="line-lab__sequence-spacer" aria-hidden="true" />
        <section className="line-lab__section line-lab__section--sticky">
          <div className="line-lab__panel">
            <span className="line-lab__index">Secuencia K0–K5</span>
            <h1 className="line-lab__title">Convergencia 4.0–6.0 s</h1>
            <p className="line-lab__hint">
              Tres Bézier completas siempre visibles. La punta conduce; sin borrado de cola.
            </p>
          </div>
        </section>
        <div className="line-lab__sequence-spacer" aria-hidden="true" />
      </div>

      {debug ? <LineLabDebugPanel engineRef={engineRef} onRefresh={refreshScrollTrigger} /> : null}
    </div>
  );
}

export default function TrionnLinesLab() {
  return (
    <Suspense fallback={<div className="line-lab" style={{ minHeight: '100vh' }} />}>
      <TrionnLinesLabInner />
    </Suspense>
  );
}
