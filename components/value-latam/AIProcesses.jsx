import Link from 'next/link';
import { aiSteps } from '@/data/valueLatamContent';
import SectionHeading from './SectionHeading';

export default function AIProcesses() {
  return (
    <section
      className="ai"
      data-vl-gsap-root="ai-processes"
      data-vl-internal-page="procesos-ia"
      id="ia"
    >
      <div className="wrap">
        <SectionHeading eyebrow="Unidad 04 · Agentic AI" title="La gestión diaria de tu empresa, ejecutada por agentes de IA" />
        <p className="ai-lede">No es una herramienta más: es una capa de inteligencia que opera las tareas administrativas y de gestión de tu empresa de punta a punta. Diseñamos e implementamos agentes que trabajan sobre tus datos, tus procesos y tu operación diaria, para que tu equipo deje de hacer tareas repetitivas y se enfoque en lo importante. </p>

        <div className="ai-story">
          <div className="ai-grid">
              <div className="ai-do">
                <div className="ai-story-head">
                  <h3>Qué hacen los agentes</h3>
                </div>
                <div className="ai-steps-wrap">
                  <div aria-hidden="true" className="ai-story-rail">
                    <span className="ai-story-rail__track" />
                    <span className="ai-story-rail__fill" />
                  </div>
                  <ul className="ai-steps" data-initial="2">
                  {aiSteps.map(([title, text], index) => (
                    <li data-ai-step={index} key={title}>
                      <span className="n">{String(index + 1).padStart(2, '0')}</span>
                      <div>
                        <h4>{title}</h4>
                        <p>{text}</p>
                      </div>
                    </li>
                  ))}
                </ul>
                </div>
              </div>
              <div className="ai-gain">
                <div className="ai-story-head">
                  <h3>Qué mejora genera</h3>
                </div>
                <div className="gain-cards">
                  <div className="gain" data-ai-gain="0">
                    <div className="gnum">−<span className="cv" data-count="80">80</span>%</div>
                    <p>menos tiempo en tareas manuales y repetitivas</p>
                  </div>
                  <div className="gain" data-ai-gain="1">
                    <div className="gnum">×<span className="cv" data-count="10">10</span></div>
                    <p>más velocidad de respuesta operativa</p>
                  </div>
                  <div className="gain" data-ai-gain="2">
                    <div className="gnum">24/7</div>
                    <p>monitoreo y alertas sobre toda tu operación</p>
                  </div>
                  <div className="gain" data-ai-gain="3">
                    <div className="gnum"><span className="cv" data-count="99.9" data-dec="1">99.9</span>%</div>
                    <p>de precisión en la carga y el procesamiento de datos</p>
                  </div>
                </div>
              </div>
            </div>
        </div>

        <div className="join-section-sub ai-delivery">
          <span className="join-sub-eyebrow">Cómo lo entregamos</span>
          <h3 className="join-h3">Del diagnóstico al agente funcionando</h3>
          <p className="fin-lede" style={{ margin: '10px 0 0' }}>Antes de automatizar, mapeamos tu operación y te mostramos el plan. Estos entregables, con identidad Value Latam, hacen visible el valor antes de hablar de precio.</p>
          <div aria-hidden="true" className="ai-delivery-line">
            <span className="ai-delivery-line__fill" />
          </div>
          <div className="join-cards">
            <div className="jcard" data-ai-card="0"><h4>Diagnóstico operativo</h4><p>Documento consultivo: resumen ejecutivo, mapa del negocio e inventario de procesos, con los cuellos de botella priorizados y por dónde conviene arrancar.</p></div>
            <div className="jcard" data-ai-card="1" data-vl-gsap-tilt=""><h4>Mapa de procesos BPMN · AS-IS / TO-BE</h4><p>Tus procesos clave en dos flujos lado a lado: cómo funcionan hoy y cómo quedan automatizados, con nodos AUTO y revisión humana.</p></div>
            <div className="jcard" data-ai-card="2"><h4>Roadmap de implementación por fases</h4><p>Plan por fases priorizado por tu necesidad #1: validar manual primero, revisión humana en lo que sale al cliente y entrega incremental con resultados tempranos.</p></div>
          </div>
          <p className="ai-delivery-closer">El entregable final no es un PDF: es el agente funcionando en tu operación.</p>
        </div>
        <div className="ai-band"><p className="tagline">Tu equipo deja de cargar datos. <b>Empieza a tomar decisiones.</b></p><Link className="btn btn-primary" href="/#contacto">Automatizar procesos</Link></div>
      </div>
    </section>
  );
}
