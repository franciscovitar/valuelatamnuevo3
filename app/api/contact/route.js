import { Resend } from 'resend';
import { siteConfig } from '@/data/siteConfig';

const WINDOW_MS = 10 * 60 * 1000;
const MAX_REQUESTS = 5;
const buckets = new Map();

let resendClient;

function getResend() {
  if (!process.env.RESEND_API_KEY) {
    throw new Error('Missing RESEND_API_KEY');
  }
  if (!resendClient) {
    resendClient = new Resend(process.env.RESEND_API_KEY);
  }
  return resendClient;
}

function clean(value, max = 500) {
  if (typeof value !== 'string') return '';
  return value.trim().slice(0, max);
}

function isEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function getClientKey(request) {
  const forwarded = request.headers.get('x-forwarded-for') || '';
  const firstIp = forwarded.split(',')[0]?.trim();
  return firstIp || request.headers.get('x-real-ip') || 'anonymous';
}

function isRateLimited(key) {
  const now = Date.now();

  for (const [bucketKey, bucketValue] of buckets.entries()) {
    if (bucketValue.resetAt <= now) buckets.delete(bucketKey);
  }

  const bucket = buckets.get(key) || { count: 0, resetAt: now + WINDOW_MS };

  bucket.count += 1;
  buckets.set(key, bucket);

  return bucket.count > MAX_REQUESTS;
}

async function readJson(request) {
  try {
    return await request.json();
  } catch {
    return null;
  }
}

export async function POST(request) {
  try {
    const clientKey = getClientKey(request);
    if (isRateLimited(clientKey)) {
      return Response.json({ ok: false, error: 'Too many requests' }, { status: 429 });
    }

    const body = await readJson(request);
    if (!body || typeof body !== 'object') {
      return Response.json({ ok: false, error: 'Invalid payload' }, { status: 400 });
    }

    const honeypot = clean(body.website, 120);
    if (honeypot) {
      return Response.json({ ok: true });
    }

    const nombre = clean(body.nombre, 90);
    const email = clean(body.email, 120);
    const telefono = clean(body.telefono, 40);
    const empresa = clean(body.empresa, 120);
    const objetivo = clean(body.objetivo, 120);
    const mensaje = clean(body.mensaje, 1500);

    if (!nombre || !email || !telefono || !empresa || !objetivo || !isEmail(email)) {
      return Response.json({ ok: false, error: 'Missing or invalid fields' }, { status: 400 });
    }

    await getResend().emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'Value Latam <onboarding@resend.dev>',
      to: [process.env.CONTACT_TO_EMAIL || siteConfig.email],
      replyTo: email,
      subject: `Nuevo contacto (${objetivo}) - ${empresa}`,
      text: [
        `Nombre: ${nombre}`,
        `Email: ${email}`,
        `Teléfono: ${telefono}`,
        `Empresa: ${empresa}`,
        `Objetivo: ${objetivo}`,
        '',
        'Mensaje:',
        mensaje || '-',
      ].join('\n'),
    });

    return Response.json({ ok: true });
  } catch (error) {
    console.error(error);
    return Response.json({ ok: false, error: 'Server error' }, { status: 500 });
  }
}
