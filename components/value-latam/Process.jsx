import Link from 'next/link';
import { processCloserHome, processSteps, processStepsHome, solutionPages } from '@/data/valueLatamContent';
import SectionHeading from './SectionHeading';

export default function Process({ compact = false }) {
  const steps = compact ? processStepsHome : processSteps;

  return (
    <section className="process" id="proceso">
      <div className="wrap">
        <SectionHeading
          eyebrow="Nuestro proceso"
          title={compact ? 'Cómo empezamos a trabajar juntos.' : 'Cómo trabajamos con tu empresa, paso a paso.'}
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
