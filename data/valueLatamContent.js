import { siteConfig } from './siteConfig';

export const contact = {
  email: siteConfig.email,
  whatsappLabel: siteConfig.whatsappLabel,
  whatsappUrl: siteConfig.whatsappUrl,
  address: siteConfig.address,
};

export const solutionPages = {
  financiamiento: {
    path: '/financiamiento',
    title: 'Financiamiento empresarial',
    description:
      'Benchmark entre banca, SGRs y mercado de capitales. Estructuración de capital de trabajo e inversión con ejecución end-to-end.',
  },
  liquidez: {
    path: '/liquidez',
    title: 'Inversión y liquidez',
    description:
      'Gestión de liquidez empresarial y portfolio manager para socios, con acceso como Agente Productor CNV.',
  },
  mediosDePago: {
    path: '/medios-de-pago',
    title: 'Medios de pago',
    description:
      'Infraestructura de cobros, pagos, tarjetas e inversión del excedente con meta costo cero.',
  },
  procesosIa: {
    path: '/procesos-ia',
    title: 'Automatización con IA',
    description:
      'Agentes de IA para automatizar procesos administrativos y de gestión empresarial.',
  },
  referenciadores: {
    path: '/referenciadores',
    title: 'Referenciadores',
    description: 'Sumate como referenciador bajo la estructura de Agente Productor CNV de Value Latam.',
  },
  comoTrabajamos: {
    path: '/como-trabajamos',
    title: 'Cómo trabajamos',
    description: 'Diagnóstico, calificación en 48 horas y ejecución end-to-end de financiamiento, inversión, pagos e IA.',
  },
};

export const navSolutionLinks = [
  [solutionPages.financiamiento.path, 'Financiamiento'],
  [solutionPages.liquidez.path, 'Liquidez'],
  [solutionPages.mediosDePago.path, 'Medios de pago'],
  [solutionPages.procesosIa.path, 'Procesos IA'],
];

export const navLinks = [
  ['/', 'Inicio'],
  [solutionPages.comoTrabajamos.path, 'Cómo trabajamos'],
  [solutionPages.referenciadores.path, 'Referenciadores'],
];

export const introHome = {
  eyebrow: 'Consultoría financiera integral para empresas',
  title: 'El centro financiero de tu empresa.',
  lead: 'Financiamiento, liquidez, pagos e IA. Un solo socio para toda la operación.',
};

export const whyUsHome = {
  title: 'El brazo financiero y operativo de tu empresa.',
  body: 'Integramos financiamiento, inversión, medios de pago e IA en un solo interlocutor. Sin cobrar por adelantado: cobramos por resultados.',
  bullets: [
    'Experiencia senior en financiamiento, inversión, pagos y procesos.',
    'Gestión gratuita; honorarios por resultados en cada área.',
    'Articulamos con tu contador y estudio jurídico, sin pisar su rol.',
  ],
};

export const metrics = [
  { prefix: '+', value: 45, suffix: '%', caption: 'mejora de tasa promedio frente a la primera oferta del cliente' },
  { prefix: '+', value: 30, suffix: 'años', caption: 'de trayectoria senior en banca y mercado de capitales' },
  { value: 48, suffix: 'h', caption: 'para una precalificación con documentación mínima' },
  { value: 5, suffix: '+', caption: 'convenios activos con ALyCs y SGRs de primera línea' },
];

export const solutions = [
  {
    index: '01 / Financiamiento',
    title: 'Financiamiento empresarial',
    text: 'Benchmark entre banca, SGRs y mercado. La menor tasa efectiva y la estructura alineada a tus flujos.',
    href: solutionPages.financiamiento.path,
    ficha: [['Canales', 'Bancos · SGRs · Mercado'], ['Instrumentos', 'Avales · Leasing · ON · Descuento'], ['Foco', 'Capital de trabajo e inversión']],
  },
  {
    index: '02 / Inversiones',
    title: 'Inversiones & gestión de liquidez',
    text: 'Liquidez de la empresa y patrimonio de los socios, con las principales sociedades de bolsa.',
    href: solutionPages.liquidez.path,
    ficha: [['Para', 'Empresa y dueño'], ['Instrumentos', 'FCI · ON · CEDEARs · Bonos · LECAP'], ['Acceso', 'Agente Productor CNV']],
  },
  {
    index: '03 / Medios de Pago',
    title: 'Medios de pago',
    text: 'Cobros, pagos, tarjetas e inversión del excedente. Meta: costo cero en la operatoria local.',
    href: solutionPages.mediosDePago.path,
    ficha: [['Locales', 'Cobros y pagos · Costo 0 como meta'], ['Exterior', 'Giros · Factoring · Subrogación'], ['Extra', 'Saldo remunerado diario']],
  },
  {
    index: '04 / Agentic AI',
    title: 'Agentic Process Automation',
    text: 'Agentes de IA que automatizan la gestión administrativa. Menos tareas manuales, más capacidad operativa.',
    href: solutionPages.procesosIa.path,
    ficha: [['Hace', 'Datos · Correo · Tareas · Reportes'], ['Opera', '24/7 · A medida'], ['Resultado', 'Menos carga manual']],
  },
];

export const financingFeatures = [
  ['Banca', 'Líneas de capital de trabajo, descuento de cheques y echeq, leasing e inversión productiva.'],
  ['SGRs', 'Avales de Sociedades de Garantía Recíproca para acceder a mejores tasas y plazos.'],
  ['Mercado de capitales', 'Obligaciones negociables, cheques y pagarés bursátiles, y prefinanciación de exportaciones.'],
  ['Foco', 'Capital de trabajo e inversión: la estructura correcta para cada necesidad.'],
  ['Ejecución', 'Calificaciones, agentes y documentación, gestionados por nosotros de punta a punta.'],
  ['Resultado', 'La menor tasa efectiva total y una estructura de pasivos alineada a tus flujos de fondos, no la primera oferta que aparezca.'],
];

export const paymentGroups = [
  ['01 · La cuenta', [
    ['Apertura y mantenimiento sin costo', 'Abrís y mantenés la cuenta sin cargos fijos de apertura ni mantenimiento. Onboarding 100% digital, sin trámites en sucursal.'],
    ['Saldo que rinde, todos los días', 'El dinero que queda en la cuenta se invierte automáticamente en un fondo money market: rinde a diario, lo ves crecer en tiempo real y queda disponible 24/7, sin plazos ni penalidades.'],
    ['Todo en un solo lugar', 'Cobrar, pagar, transferir, emitir tarjetas e invertir, sin saltar entre apps ni plataformas. Una sola operatoria, un solo interlocutor.'],
  ]],
  ['02 · Cobrá', [
    ['Links y botón de pago', 'Generás, modificás y publicás links de pago sin costo de creación. Solo se cobra una comisión por venta según el medio. Te pasamos el esquema de comisiones de cada medio antes de operar.'],
    ['QR y tarjeta sin terminal física', 'Cobrás con QR y con tarjeta sin necesidad de comprar ni alquilar una terminal/posnet. Menos costo fijo, más capilaridad.'],
    ['Cobro para agro', 'Integramos las tarjetas y plataformas del agro para cobrar online y de forma segura, sin terminales y sin abrir cuentas en cada banco operador.'],
    ['Acreditación inmediata', 'El dinero entra a tu cuenta al instante y queda disponible para pagar, transferir o para que empiece a rendir.'],
  ]],
  ['03 · Pagá y transferí', [
    ['Transferencias individuales, masivas y programadas', 'Pagás a un proveedor o a cientos de una sola vez, y programás pagos a futuro. Toda la operatoria desde la misma cuenta.'],
    ['Enviá y recibí sin costo', 'A cualquier cuenta bancaria o virtual (CBU, CVU o alias), rápido, seguro y sin comisiones de transferencia.'],
    ['Servicios, impuestos y VEP', 'Pagás servicios, recargas y VEP de ARCA (AFIP), AGIP y ARBA desde la misma cuenta.'],
    ['E-cheqs y pagarés', 'Emití, depositá y descontá e-cheqs y pagarés integrando cobros, pagos e inversión en un mismo circuito.'],
  ]],
  ['04 · Tu equipo', [
    ['Tarjetas corporativas físicas y digitales', 'Emití tarjetas para tus colaboradores, físicas o digitales, para que cada uno opere de forma independiente.'],
    ['Límites y control por usuario', 'Asignás límites por persona, seguís cada consumo en tiempo real y centralizás todos los movimientos del negocio en un solo tablero.'],
    ['Disponé del saldo invertido', 'Tu equipo gasta con la tarjeta mientras el excedente sigue rindiendo hasta el momento del consumo.'],
  ]],
  ['05 · Invertí y financiá', [
    ['Acceso al mercado de capitales', 'Conectás la cuenta de pagos con tu cuenta comitente y operás acciones, CEDEARs, bonos, LECAPs y ONs, con el asesoramiento de nuestro equipo de inversiones.'],
    ['Money market siempre disponible', 'El excedente diario trabaja en fondos de liquidez inmediata: rinde sin inmovilizar capital y lo retirás cuando lo necesites.'],
    ['Financiamiento integrado', 'Si necesitás capital de trabajo, lo conectamos con el resto de las unidades sin cambiar de interlocutor.'],
  ]],
];

export const aiSteps = [
  ['Carga y organización de datos', 'Procesan y ordenan información de documentos, planillas y sistemas, sin carga manual.'],
  ['Gestión de correo y seguimiento', 'Clasifican mails, redactan respuestas y siguen los pendientes hasta cerrarlos.'],
  ['Reportes y tableros automáticos', 'Arman informes y tableros de cualquier área, listos para tomar decisiones.'],
  ['Seguimiento de tareas y vencimientos', 'Controlan plazos, recordatorios y agenda, y avisan a tiempo.'],
  ['Atención de clientes y proveedores', 'Responden consultas frecuentes y mantienen tus registros siempre actualizados.'],
  ['Automatización de procesos a medida', 'Conectamos los agentes a los procesos y sistemas propios de tu empresa, sin cambiar tu forma de trabajar.'],
];

export const processSteps = [
  ['Diagnóstico de financiamiento', 'Arrancamos por tu necesidad de financiamiento: entendemos la operación y ordenamos el panorama, sin cargo.'],
  ['Calificación en 48 horas', 'Con documentación mínima, precalificamos tu operación en 48 horas.'],
  ['Estructuración end-to-end', 'Diseñamos y ejecutamos la operación de punta a punta: banca, SGR y mercado, calificaciones, agentes y documentación.'],
  ['Asesoramiento a los socios', 'Administramos el portfolio personal de los socios y los acompañamos como Agente Productor CNV.'],
  ['Mejora de medios de pago', 'Ordenamos y mejoramos los cobros y pagos de la empresa, locales e internacionales.'],
  ['Mejora de procesos con IA', 'Automatizamos la gestión diaria con agentes de IA para liberar a tu equipo.'],
];

export const processStepsHome = processSteps.slice(0, 3);

export const processCloserHome =
  'Un solo interlocutor para toda tu operación. En financiamiento, los honorarios se definen sobre la línea efectivamente disponible.';

export const workTeaser = {
  title: 'Referí operaciones bajo nuestra estructura CNV.',
  body: '¿Sos asesor, contador o consultor? Asociate como referenciador: vos ponés la relación, nosotros la ejecución y el respaldo regulatorio.',
  cta: 'Conocer el programa de referenciadores',
};

export const workFeatures = [
  ['Referí operaciones', 'Traés a tus clientes y nosotros estructuramos financiamiento, inversión, pagos y procesos.'],
  ['Gestioná tu cartera', 'Administrás tu propia cartera de clientes, con nuestro acompañamiento y herramientas.'],
  ['Bajo nuestra estructura', 'Operás respaldado por nuestra matrícula de Agente Productor CNV y nuestros convenios.', true],
  ['Ingresos por resultados', 'Un esquema de comisiones transparente, por cada operación que se cierra.'],
  ['Tecnología y soporte', 'Te damos análisis, materiales y backoffice para que te enfoques en la relación.'],
  ['Sin montar estructura propia', 'No necesitás tu propia ALyC ni matrícula: te sumás a la nuestra.'],
];

export const workFaqs = [
  ['¿Necesito matrícula o estructura propia?', 'No. Te sumás bajo nuestra matrícula de Agente Productor ante la CNV y nuestros convenios, sin montar tu propia ALyC.'],
  ['¿Cómo son los ingresos?', 'Trabajamos con un esquema de comisiones por resultados, transparente y por cada operación que se cierra. Lo definimos según tu perfil y tu cartera.'],
  ['¿Qué tipo de operaciones puedo referir?', 'Las cuatro unidades: financiamiento, inversión y liquidez, medios de pago y automatización con IA. Nosotros estructuramos y ejecutamos.'],
  ['¿Tengo que dejar mi actividad actual?', 'No. Muchos referenciadores son contadores, asesores o consultores que suman este servicio a su propia práctica.'],
  ['¿Qué soporte recibo?', 'Análisis, materiales, backoffice y acompañamiento del equipo, para que te enfoques en la relación con tu cliente.'],
];
