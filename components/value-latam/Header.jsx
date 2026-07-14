'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { navLinks, navSolutionLinks } from '@/data/valueLatamContent';

function isNavActive(href, pathname) {
  if (href.startsWith('/#')) {
    return pathname === '/';
  }

  return pathname === href;
}

function isSolutionActive(pathname) {
  return navSolutionLinks.some(([href]) => pathname === href);
}

function NavLink({ href, children, pathname }) {
  const active = isNavActive(href, pathname);
  const className = active ? 'is-active' : undefined;

  if (href.startsWith('/')) {
    return (
      <Link href={href} className={className} aria-current={active ? 'page' : undefined}>
        {children}
      </Link>
    );
  }

  return (
    <a href={href} className={className} aria-current={active ? 'page' : undefined}>
      {children}
    </a>
  );
}

export default function Header() {
  const pathname = usePathname();
  const solutionsActive = isSolutionActive(pathname);

  return (
    <header className="nav" data-site-header>
      <div className="wrap nav-inner">
        <Link className="brand" href="/" aria-label="Value Latam - inicio">
          <img src="/value-latam-logo.png" alt="Value Latam" width={900} height={327} />
        </Link>

        <nav className="nav-links" id="main-menu" aria-label="Navegación principal">
          {navLinks.slice(0, 1).map(([href, label]) => (
            <NavLink href={href} key={href} pathname={pathname}>
              {label}
            </NavLink>
          ))}

          <div
            className={`nav-dropdown${solutionsActive ? ' is-active-group' : ''}`}
            data-nav-dropdown
          >
            <button
              type="button"
              className={`nav-dropdown__trigger${solutionsActive ? ' is-active' : ''}`}
              aria-expanded="false"
              aria-haspopup="true"
              aria-controls="nav-solutions-menu"
              id="nav-solutions-trigger"
              aria-current={solutionsActive ? 'true' : undefined}
            >
              Soluciones
            </button>

            <span className="nav-dropdown__label">Soluciones</span>

            <ul
              id="nav-solutions-menu"
              className="nav-dropdown__menu"
              role="menu"
              aria-labelledby="nav-solutions-trigger"
            >
              {navSolutionLinks.map(([href, label]) => {
                const active = pathname === href;

                return (
                  <li key={href} role="none">
                    <Link
                      href={href}
                      role="menuitem"
                      className={active ? 'is-active' : undefined}
                      aria-current={active ? 'page' : undefined}
                    >
                      {label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>

          {navLinks.slice(1).map(([href, label]) => (
            <NavLink href={href} key={href} pathname={pathname}>
              {label}
            </NavLink>
          ))}

          <Link className="btn btn-primary nav-mobile-cta" href="/#contacto">
            Agendar una reunión
          </Link>
        </nav>

        <div className="nav-cta">
          <Link className="btn btn-primary" href="/#contacto">
            Agendar una reunión
          </Link>
        </div>

        <button
          className="menu-btn"
          type="button"
          aria-label="Abrir menú"
          aria-controls="main-menu"
          aria-expanded="false"
        >
          <span className="menu-btn-line" aria-hidden="true" />
          <span className="menu-btn-line" aria-hidden="true" />
          <span className="menu-btn-line" aria-hidden="true" />
        </button>
      </div>

      <button
        className="nav-backdrop"
        type="button"
        aria-label="Cerrar menú"
        data-menu-backdrop
        tabIndex={-1}
      />
    </header>
  );
}
