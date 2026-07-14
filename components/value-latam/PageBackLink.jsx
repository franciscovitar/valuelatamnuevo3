import Link from 'next/link';

export default function PageBackLink() {
  return (
    <div className="page-back wrap">
      <Link href="/" className="page-back__link">
        ← Volver al inicio
      </Link>
    </div>
  );
}
