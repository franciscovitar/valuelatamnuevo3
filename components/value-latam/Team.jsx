import SectionHeading from './SectionHeading';

const teamMembers = [
  {
    key: 'mauricio',
    role: 'Dirección de Estrategia',
    name: 'Mauricio Maggio',
    bio: 'Define el rumbo estratégico de la firma. Lidera la estructuración de financiamiento para empresas PyME y el diseño y seguimiento de portafolios de inversión de clientes individuales y corporativos, integrando banca, SGRs y mercado de capitales. Más de 15 años en el sistema financiero argentino.',
    href: 'https://www.linkedin.com/in/mauricio-maggio-41b46534a',
  },
  {
    key: 'gabriela',
    role: 'Dirección Comercial y de Operaciones',
    name: 'Gabriela Guerrecagoitya',
    bio: 'Contadora Pública. Conduce la cartera comercial de la firma y el diseño de sus procesos internos, con foco en automatización e inteligencia artificial aplicada a la operación. Especialista en comercio exterior y valuación de empresas.',
    href: 'https://www.linkedin.com/in/gabriela-guerrecagoitya-850216428/?skipRedirect=true',
  },
  {
    key: 'claudia',
    role: 'Responsable de Onboarding y Experiencia del Cliente',
    name: 'Claudia Abeti',
    bio: 'Más de 30 años de trayectoria en banca, con desempeño como Tesorera, Oficial CRM y RBB, Gerente de Sucursal y especialista en financiamiento PyME a través de banca tradicional y préstamos sindicados. En Value Latam conduce el onboarding de clientes y la relación operativa con las entidades, y es responsable de la experiencia del cliente a lo largo de toda la operación.',
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
              <span className={`role${member.key === 'claudia' ? ' role--compact' : ''}`}>
                {member.role}
              </span>
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
