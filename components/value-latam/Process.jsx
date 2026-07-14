'use client';

import Link from 'next/link';
import { processCloserHome, processSteps, processStepsHome, solutionPages } from '@/data/valueLatamContent';
import SectionHeading from './SectionHeading';

function ProcessStep({ title, text, index, showConnector }) {
  const formatted = String(index + 1).padStart(2, '0');

  return (
    <div className="step">
      {showConnector ? (
        <>
          <span aria-hidden="true" className="step-connector step-connector--vertical" />
          <span aria-hidden="true" className="step-connector step-connector--horizontal" />
        </>
      ) : null}
      <div className="n">{formatted}</div>
      <h4>{title}</h4>
      <p>{text}</p>
    </div>
  );
}

function ProcessHome({ steps }) {
  return (
    <section
      className="process"
      data-vl-gsap-root="process"
      data-vl-home-section="process"
      id="proceso"
    >
      <div className="process-story">
        <div className="process-pin">
          <div className="wrap">
            <div className="sec-head">
              <span className="eyebrow">Nuestro proceso</span>
              <h2 className="serif">Cómo empezamos a trabajar juntos.</h2>
            </div>

            <div aria-hidden="true" className="process-story-progress">
              <span className="process-story-progress__fill" />
            </div>

            <div className="steps">
              {steps.map(([title, text], index) => (
                <ProcessStep
                  index={index}
                  key={title}
                  showConnector={index > 0}
                  text={text}
                  title={title}
                />
              ))}
            </div>

            <div className="closer">
              <p>{processCloserHome}</p>
              <Link className="btn btn-ghost" href={solutionPages.comoTrabajamos.path} style={{ marginRight: 12 }}>
                Ver las seis etapas
              </Link>
              <Link className="btn btn-primary" href="/#contacto">
                Empezá tu diagnóstico
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function ProcessStatic({ compact }) {
  const steps = compact ? processStepsHome : processSteps;

  return (
    <section className="process" id="proceso">
      <div className="wrap">
        <SectionHeading
          eyebrow="Nuestro proceso"
          title={
            compact
              ? 'Cómo empezamos a trabajar juntos.'
              : 'Cómo trabajamos con tu empresa, paso a paso.'
          }
        />
        <div className="steps reveal">
          {steps.map(([title, text], index) => (
            <div className="step" key={title}>
              <div className="n">{String(index + 1).padStart(2, '0')}</div>
              <h4>{title}</h4>
              <p>{text}</p>
            </div>
          ))}
        </div>
        <div className="closer reveal">
          <p>
            {compact ? (
              processCloserHome
            ) : (
              <>
                Trabajás con un solo interlocutor para toda tu operación.{' '}
                <b>En financiamiento, los honorarios se definen sobre la línea efectivamente disponible.</b>
              </>
            )}
          </p>
          {compact ? (
            <Link className="btn btn-ghost" href={solutionPages.comoTrabajamos.path} style={{ marginRight: 12 }}>
              Ver las seis etapas
            </Link>
          ) : null}
          <Link className="btn btn-primary" href="/#contacto">
            Empezá tu diagnóstico
          </Link>
        </div>
      </div>
    </section>
  );
}

function ProcessRoute({ steps }) {
  return (
    <section
      className="process process--route"
      data-vl-gsap-root="process-route"
      data-vl-internal-page="como-trabajamos"
      id="proceso"
    >
      <div className="process-route__desktop">
        <div className="process-route-pin">
          <div className="wrap">
            <div className="sec-head">
              <span className="eyebrow">Nuestro proceso</span>
              <h2 className="serif">Cómo trabajamos con tu empresa, paso a paso.</h2>
            </div>

            <div aria-live="polite" className="process-route-stage">
              <span className="process-route-stage__current">01</span>
              <span className="process-route-stage__sep">/</span>
              <span className="process-route-stage__total">{String(steps.length).padStart(2, '0')}</span>
            </div>

            <div aria-hidden="true" className="process-route-segments">
              {steps.map(([title], index) => (
                <span className="process-route-segments__item" data-route-segment={index} key={title} />
              ))}
            </div>

            <div className="process-route-viewport">
              <div className="process-route-track">
                {steps.map(([title, text], index) => (
                  <article className="process-route-panel" data-route-panel={index} key={title}>
                    <div className="n">{String(index + 1).padStart(2, '0')}</div>
                    <h4>{title}</h4>
                    <p>{text}</p>
                  </article>
                ))}
              </div>
            </div>

            <div className="closer">
              <p>
                Trabajás con un solo interlocutor para toda tu operación.{' '}
                <b>En financiamiento, los honorarios se definen sobre la línea efectivamente disponible.</b>
              </p>
              <Link className="btn btn-primary" href="/#contacto">
                Empezá tu diagnóstico
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="process-route__mobile wrap">
        <SectionHeading
          eyebrow="Nuestro proceso"
          title="Cómo trabajamos con tu empresa, paso a paso."
        />
        <div aria-hidden="true" className="process-route-progress-mobile">
          <span className="process-route-progress-mobile__fill" />
        </div>
        <div aria-live="polite" className="process-route-stage process-route-stage--mobile">
          <span className="process-route-stage__current">01</span>
          <span className="process-route-stage__sep">/</span>
          <span className="process-route-stage__total">{String(steps.length).padStart(2, '0')}</span>
        </div>
        <div className="steps">
          {steps.map(([title, text], index) => (
            <div className="step" data-route-step={index} key={title}>
              <div className="n">{String(index + 1).padStart(2, '0')}</div>
              <h4>{title}</h4>
              <p>{text}</p>
            </div>
          ))}
        </div>
        <div className="closer">
          <p>
            Trabajás con un solo interlocutor para toda tu operación.{' '}
            <b>En financiamiento, los honorarios se definen sobre la línea efectivamente disponible.</b>
          </p>
          <Link className="btn btn-primary" href="/#contacto">
            Empezá tu diagnóstico
          </Link>
        </div>
      </div>
    </section>
  );
}

export default function Process({ compact = false, internal = false }) {
  if (compact) {
    return <ProcessHome steps={processStepsHome} />;
  }

  if (internal) {
    return <ProcessRoute steps={processSteps} />;
  }

  return <ProcessStatic compact={compact} />;
}
