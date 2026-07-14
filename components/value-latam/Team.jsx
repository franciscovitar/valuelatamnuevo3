import SectionHeading from './SectionHeading';

export default function Team() {
  return (
    <section className="team" id="equipo">
      <div className="wrap">
        <SectionHeading eyebrow="Nuestro equipo" title="Experiencia a tu servicio." />
        <div className="team-grid">
          <div className="person reveal"><span className="role">Jefe de Estrategia · Socio</span><h4>Mauricio Maggio</h4><p>Profesional con amplia experiencia en estructuración de financiamiento para empresas PyME, asesoría en inversiones y optimización de liquidez, integrando herramientas del sistema financiero y del mercado de capitales.</p><a className="li" href="https://www.linkedin.com/in/mauricio-maggio-41b46534a" target="_blank" rel="noopener noreferrer">Ver LinkedIn →</a></div>
          <div className="person reveal"><span className="role">Relaciones de Banca Corporativa · Socia</span><h4>Claudia Abeti</h4><p>Más de 30 años de experiencia en banca, con trayectoria como Tesorera, Oficial CRM y RBB, Gerente de Sucursal y especialista en financiamiento PyME a través de banca tradicional y préstamos sindicados.</p><a className="li" href="https://www.linkedin.com/in/claudiaabeti/" target="_blank" rel="noopener noreferrer">Ver LinkedIn →</a></div>
        </div>
      </div>
    </section>
  );
}
