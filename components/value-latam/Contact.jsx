export default function Contact() {
  return (
    <section className="cta" id="contacto">
      <div className="wrap cta-grid">
        <div className="reveal">
          <span className="eyebrow">Empecemos hoy</span>
          <h2 className="serif">Sea cual sea tu próximo paso, lo damos con vos.</h2>
          <p className="sub">Financiamiento, inversión y liquidez, medios de pago o automatización con IA: en cualquiera de las cuatro, la gestión es gratuita y solo cobramos por resultados. Empezá sin riesgo.</p>
          <div className="reassure">
            <div><span className="tick">✓</span> Primer diagnóstico sin cargo, en cualquier área</div>
            <div><span className="tick">✓</span> Gestión gratuita: solo pagás por resultados</div>
            <div><span className="tick">✓</span> Un solo interlocutor para las cuatro unidades</div>
          </div>
        </div>
        <form noValidate>
          <div className="field"><label htmlFor="n">Nombre *</label><input id="n" name="nombre" autoComplete="name" maxLength={90} required /></div>
          <div className="row2">
            <div className="field"><label htmlFor="e">Email *</label><input id="e" name="email" type="email" autoComplete="email" maxLength={120} required /></div>
            <div className="field"><label htmlFor="t">Teléfono *</label><input id="t" name="telefono" type="tel" autoComplete="tel" maxLength={40} required /></div>
          </div>
          <div className="field"><label htmlFor="emp">Empresa *</label><input id="emp" name="empresa" autoComplete="organization" maxLength={120} required /></div>
          <div className="field"><label htmlFor="obj">¿En qué te podemos ayudar? *</label><select id="obj" name="objetivo" required><option value="">Seleccionar objetivo</option><option>Financiamiento</option><option>Inversión y liquidez de la empresa</option><option>Portfolio personal (socios)</option><option>Medios de pago</option><option>Automatización con IA</option><option>Quiero ser referenciador (Agente Productor)</option><option>Consulta general</option></select></div>
          <div className="field"><label htmlFor="m">Mensaje (opcional)</label><textarea id="m" name="mensaje" maxLength={1500} /></div>
          <div className="field hp-field" aria-hidden="true">
            <label htmlFor="website">Sitio web</label>
            <input id="website" name="website" tabIndex={-1} autoComplete="off" />
          </div>
          <button className="btn btn-primary" type="submit">Agendar una llamada</button>
          <p className="legal">Al enviar este formulario, aceptás nuestra <a href="/privacidad">Política de Privacidad</a>. ¿Preferís WhatsApp? Respondemos dentro de 1 día hábil.</p>
        </form>
      </div>
    </section>
  );
}
