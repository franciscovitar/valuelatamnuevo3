import SectionHeading from './SectionHeading';

const teamMembers = [
  {
    key: 'mauricio',
    role: 'Jefe de Estrategia',
    name: 'Mauricio Maggio',
    bio: 'Profesional con amplia experiencia en estructuración de financiamiento para empresas PyME, asesoría en inversiones y optimización de liquidez, integrando herramientas del sistema financiero y del mercado de capitales.',
    href: 'https://www.linkedin.com/in/mauricio-maggio-41b46534a',
  },
  {
    key: 'claudia',
    role: 'Relaciones de Banca Corporativa',
    name: 'Claudia Abeti',
    bio: 'Más de 30 años de experiencia en banca, con trayectoria como Tesorera, Oficial CRM y RBB, Gerente de Sucursal y especialista en financiamiento PyME a través de banca tradicional y préstamos sindicados.',
    href: 'https://www.linkedin.com/in/claudiaabeti/',
  },
];

export default function Team() {
  return (
    <section
      className="team vl-section--light"
      data-vl-gsap-root="team"
      data-vl-home-section="team"
      id="equipo"
    >
      <div className="wrap">
        <SectionHeading
          eyebrow="Nuestro equipo"
          title="Experiencia a tu servicio"
        />

        <div className="team-grid">
          {teamMembers.map((member) => (
            <div className="person" key={member.key}>
              <span className="role">{member.role}</span>
              <h4>{member.name}</h4>
              <p>{member.bio}</p>
              <a
                className="btn btn-primary person-linkedin"
                href={member.href}
                rel="noopener noreferrer"
                target="_blank"
              >
                Ver LinkedIn
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
