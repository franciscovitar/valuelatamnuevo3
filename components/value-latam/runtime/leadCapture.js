import { siteConfig } from '@/data/siteConfig';

const WHATSAPP_URL = siteConfig.whatsappUrl;
const EMAIL = siteConfig.email;

function whatsappIcon() {
  return [
    '<svg class="wa-icon" viewBox="0 0 32 32" aria-hidden="true" focusable="false">',
    '<path fill="currentColor" d="M16.03 3.2c-7.04 0-12.77 5.67-12.77 12.64 0 2.24.6 4.42 1.74 6.33L3.2 28.8l6.8-1.76a12.87 12.87 0 0 0 6.03 1.52c7.04 0 12.77-5.67 12.77-12.64S23.07 3.2 16.03 3.2Zm0 23.22c-1.9 0-3.77-.5-5.4-1.45l-.39-.23-4.03 1.04 1.08-3.88-.25-.4a10.42 10.42 0 0 1-1.61-5.56c0-5.8 4.76-10.5 10.6-10.5s10.6 4.7 10.6 10.5-4.76 10.48-10.6 10.48Zm5.82-7.84c-.32-.16-1.88-.92-2.17-1.03-.29-.1-.5-.16-.72.16-.21.31-.82 1.03-1.01 1.24-.19.21-.37.24-.69.08-.32-.16-1.34-.49-2.55-1.56-.94-.84-1.58-1.87-1.76-2.18-.19-.32-.02-.49.14-.65.15-.14.32-.37.48-.56.16-.18.21-.31.32-.52.1-.21.05-.39-.03-.55-.08-.16-.72-1.72-.98-2.35-.26-.62-.52-.53-.72-.54h-.61c-.21 0-.55.08-.85.39-.29.32-1.11 1.08-1.11 2.63 0 1.55 1.14 3.05 1.3 3.26.16.21 2.24 3.4 5.43 4.76.76.33 1.35.52 1.81.67.76.24 1.46.21 2 .13.61-.09 1.88-.76 2.14-1.5.27-.74.27-1.38.19-1.51-.08-.14-.29-.21-.61-.37Z" />',
    '</svg>',
  ].join('');
}

function replaceFeedbackWithWhatsApp(feedback, payload) {
  const text = [
    'Hola Value Latam, quiero agendar una llamada.',
    'Nombre: ' + payload.nombre,
    'Email: ' + payload.email,
    'Teléfono: ' + payload.telefono,
    'Empresa: ' + payload.empresa,
    'Objetivo: ' + payload.objetivo,
    payload.mensaje ? 'Mensaje: ' + payload.mensaje : '',
  ].filter(Boolean).join('\n');

  const link = document.createElement('a');
  link.href = WHATSAPP_URL + '?text=' + encodeURIComponent(text);
  link.target = '_blank';
  link.rel = 'noopener noreferrer';
  link.textContent = 'Abrir WhatsApp';

  feedback.replaceChildren('No pudimos enviar el mail. ', link, '.');
}

export function initLeadCapture() {
  const cleanups = [];

  if (!document.querySelector('.vl2-wa')) {
    const link = document.createElement('a');
    link.className = 'vl2-wa';
    link.href = WHATSAPP_URL;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.setAttribute('aria-label', 'Abrir WhatsApp de Value Latam');
    link.innerHTML = whatsappIcon() + '<span>WhatsApp</span>';
    document.body.appendChild(link);
    cleanups.push(() => link.remove());
  }

  document.querySelectorAll('a[href="#"], a[href=""]').forEach((link) => {
    const text = (link.textContent || '').toLowerCase();
    if (text.includes('whatsapp')) {
      link.href = WHATSAPP_URL;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
    }
    if (text.includes(EMAIL)) {
      link.href = 'mailto:' + EMAIL;
    }
  });

  const form = document.querySelector('#contacto form');
  if (!form) return () => cleanups.forEach((cleanup) => cleanup());

  let feedback = form.querySelector('.vl2-form-feedback');
  if (!feedback) {
    feedback = document.createElement('p');
    feedback.className = 'vl2-form-feedback';
    feedback.setAttribute('aria-live', 'polite');
    form.appendChild(feedback);
  }

  const required = ['n', 'e', 't', 'emp', 'obj'];
  const setFieldState = (field, invalid) => {
    if (!field) return;
    field.toggleAttribute('aria-invalid', invalid);
    field.closest('.field')?.classList.toggle('field-error', invalid);
  };

  const values = () => ({
    nombre: document.getElementById('n')?.value.trim() || '',
    email: document.getElementById('e')?.value.trim() || '',
    telefono: document.getElementById('t')?.value.trim() || '',
    empresa: document.getElementById('emp')?.value.trim() || '',
    objetivo: document.getElementById('obj')?.value || '',
    mensaje: document.getElementById('m')?.value.trim() || '',
    website: document.getElementById('website')?.value.trim() || '',
  });

  const onSubmit = async (event) => {
    event.preventDefault();
    const payload = values();
    let valid = true;

    required.forEach((id) => {
      const field = document.getElementById(id);
      const invalid = !field?.value || (field.type === 'email' && !field.checkValidity());
      setFieldState(field, invalid);
      if (invalid) valid = false;
    });

    if (!valid) {
      feedback.className = 'vl2-form-feedback is-error';
      feedback.textContent = 'Revisá los campos obligatorios e intentá nuevamente.';
      form.querySelector('[aria-invalid="true"]')?.focus();
      return;
    }

    const submit = form.querySelector('button[type="submit"]');
    submit?.setAttribute('disabled', 'true');
    form.classList.add('is-sending');
    feedback.className = 'vl2-form-feedback';
    feedback.textContent = 'Enviando consulta...';

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error('Failed');

      feedback.className = 'vl2-form-feedback is-success';
      feedback.textContent = 'Gracias. Te contactamos a la brevedad.';
      form.reset();
    } catch {
      feedback.className = 'vl2-form-feedback is-error';
      replaceFeedbackWithWhatsApp(feedback, payload);
    } finally {
      submit?.removeAttribute('disabled');
      form.classList.remove('is-sending');
    }
  };

  const onInput = (event) => {
    const target = event.target;
    if (target instanceof HTMLInputElement || target instanceof HTMLSelectElement || target instanceof HTMLTextAreaElement) {
      setFieldState(target, false);
      if (feedback.classList.contains('is-error')) {
        feedback.className = 'vl2-form-feedback';
        feedback.textContent = '';
      }
    }
  };

  form.addEventListener('submit', onSubmit);
  form.addEventListener('input', onInput);
  form.addEventListener('change', onInput);
  cleanups.push(() => {
    form.removeEventListener('submit', onSubmit);
    form.removeEventListener('input', onInput);
    form.removeEventListener('change', onInput);
  });

  return () => cleanups.forEach((cleanup) => cleanup());
}
