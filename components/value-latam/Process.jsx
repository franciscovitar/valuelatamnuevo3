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
            <SectionHeading
              eyebrow="Nuestro proceso"
              title="Cómo empezamos a trabajar juntos"
            />

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

function ProcessRoute({ steps }) {
  return (
    <section
      className="process process--route"
      data-vl-gsap-root="process-route"
      data-vl-internal-page="como-trabajamos"
      id="proceso"
    >
      <div className="wrap">
        <SectionHeading
          eyebrow="Nuestro proceso"
          title="Cómo trabajamos con tu empresa, paso a paso"
        />

        <div className="process-route-grid">
          {steps.map(([title, text], index) => (
            <article className="process-route-panel" key={title}>
              <div className="n">{String(index + 1).padStart(2, '0')}</div>
              <h4>{title}</h4>
              <p>{text}</p>
            </article>
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

export default function Process({ internal = false }) {
  if (internal) {
    return <ProcessRoute steps={processSteps} />;
  }

  return <ProcessHome steps={processStepsHome} />;
}
