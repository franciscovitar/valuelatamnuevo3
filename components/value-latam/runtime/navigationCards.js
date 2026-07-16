export function initNavigationCards() {
  const cleanups = [];
  const mobileQuery = window.matchMedia('(max-width: 980px)');

  const menuButton = document.querySelector('.menu-btn');
  const nav = document.querySelector('.nav');
  const navLinks = document.querySelector('.nav-links');
  const backdrop = document.querySelector('[data-menu-backdrop]');

  const closeAllDropdowns = () => {
    document.querySelectorAll('[data-nav-dropdown]').forEach((dropdown) => {
      dropdown.classList.remove('is-open');
      dropdown.querySelector('.nav-dropdown__trigger')?.setAttribute('aria-expanded', 'false');
    });
  };

  const getOpenDropdown = () => document.querySelector('[data-nav-dropdown].is-open');

  if (menuButton && nav && navLinks) {
    let menuOpen = false;

    const setNavInertState = () => {
      if (mobileQuery.matches && !menuOpen) {
        navLinks.setAttribute('inert', '');
      } else {
        navLinks.removeAttribute('inert');
      }
    };

    const setMenu = (open) => {
      menuOpen = Boolean(open) && mobileQuery.matches;

      nav.classList.toggle('menu-open', menuOpen);
      document.body.classList.toggle('menu-open', menuOpen);

      menuButton.setAttribute('aria-expanded', menuOpen ? 'true' : 'false');
      menuButton.setAttribute('aria-label', menuOpen ? 'Cerrar menú' : 'Abrir menú');

      if (!menuOpen) {
        closeAllDropdowns();
      }

      setNavInertState();
    };

    const onMenuClick = (event) => {
      event.preventDefault();
      setMenu(!menuOpen);
    };

    const onBackdropClick = () => {
      setMenu(false);
    };

    const onKeyDown = (event) => {
      if (event.key !== 'Escape') return;

      const openDropdown = getOpenDropdown();
      if (mobileQuery.matches && openDropdown) {
        const trigger = openDropdown.querySelector('.nav-dropdown__trigger');
        closeAllDropdowns();
        trigger?.focus();
        return;
      }

      if (menuOpen) {
        setMenu(false);
        menuButton.focus();
        return;
      }

      closeAllDropdowns();
    };

    const onLinkClick = () => {
      setMenu(false);
    };

    const onDocumentPointerDown = (event) => {
      if (!menuOpen) return;
      if (nav.contains(event.target)) return;
      setMenu(false);
    };

    const onMediaChange = () => {
      if (!mobileQuery.matches) {
        setMenu(false);
        closeAllDropdowns();
        navLinks.removeAttribute('inert');
        return;
      }

      setNavInertState();
    };

    menuButton.addEventListener('click', onMenuClick);
    backdrop?.addEventListener('click', onBackdropClick);
    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('pointerdown', onDocumentPointerDown);

    navLinks.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', onLinkClick);
    });

    if (typeof mobileQuery.addEventListener === 'function') {
      mobileQuery.addEventListener('change', onMediaChange);
    } else {
      mobileQuery.addListener(onMediaChange);
    }

    setNavInertState();

    cleanups.push(() => {
      menuButton.removeEventListener('click', onMenuClick);
      backdrop?.removeEventListener('click', onBackdropClick);
      document.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('pointerdown', onDocumentPointerDown);

      navLinks.querySelectorAll('a').forEach((link) => {
        link.removeEventListener('click', onLinkClick);
      });

      if (typeof mobileQuery.removeEventListener === 'function') {
        mobileQuery.removeEventListener('change', onMediaChange);
      } else {
        mobileQuery.removeListener(onMediaChange);
      }

      setMenu(false);
    });
  }

  document.querySelectorAll('[data-nav-dropdown]').forEach((dropdown) => {
    const trigger = dropdown.querySelector('.nav-dropdown__trigger');
    const menu = dropdown.querySelector('.nav-dropdown__menu');
    if (!trigger || !menu) return;

    const setDropdownOpen = (open) => {
      dropdown.classList.toggle('is-open', open);
      trigger.setAttribute('aria-expanded', open ? 'true' : 'false');
    };

    const onTriggerClick = (event) => {
      event.preventDefault();
      event.stopPropagation();

      if (mobileQuery.matches) {
        const willOpen = !dropdown.classList.contains('is-open');
        closeAllDropdowns();
        if (willOpen) {
          setDropdownOpen(true);
        }
        return;
      }

      setDropdownOpen(!dropdown.classList.contains('is-open'));
    };

    const onDropdownPointerDown = (event) => {
      if (mobileQuery.matches || !dropdown.classList.contains('is-open')) return;
      if (dropdown.contains(event.target)) return;
      setDropdownOpen(false);
    };

    const onDropdownKeyDown = (event) => {
      if (event.key !== 'Escape' || !dropdown.classList.contains('is-open')) return;

      if (mobileQuery.matches) {
        event.stopPropagation();
        setDropdownOpen(false);
        trigger.focus();
        return;
      }

      setDropdownOpen(false);
      trigger.focus();
    };

    const onSubmenuLinkClick = () => {
      if (!mobileQuery.matches) return;
      closeAllDropdowns();
      const mobileNav = document.querySelector('.nav');
      const mobileMenuBtn = document.querySelector('.menu-btn');
      const mobileNavLinks = document.querySelector('.nav-links');
      mobileNav?.classList.remove('menu-open');
      document.body.classList.remove('menu-open');
      mobileMenuBtn?.setAttribute('aria-expanded', 'false');
      mobileMenuBtn?.setAttribute('aria-label', 'Abrir menú');
      mobileNavLinks?.setAttribute('inert', '');
    };

    const onMediaChange = () => {
      setDropdownOpen(false);
    };

    trigger.addEventListener('click', onTriggerClick);
    document.addEventListener('pointerdown', onDropdownPointerDown);
    document.addEventListener('keydown', onDropdownKeyDown);

    menu.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', onSubmenuLinkClick);
    });

    if (typeof mobileQuery.addEventListener === 'function') {
      mobileQuery.addEventListener('change', onMediaChange);
    } else {
      mobileQuery.addListener(onMediaChange);
    }

    cleanups.push(() => {
      trigger.removeEventListener('click', onTriggerClick);
      document.removeEventListener('pointerdown', onDropdownPointerDown);
      document.removeEventListener('keydown', onDropdownKeyDown);

      menu.querySelectorAll('a').forEach((link) => {
        link.removeEventListener('click', onSubmenuLinkClick);
      });

      if (typeof mobileQuery.removeEventListener === 'function') {
        mobileQuery.removeEventListener('change', onMediaChange);
      } else {
        mobileQuery.removeListener(onMediaChange);
      }

      setDropdownOpen(false);
    });
  });

  document.querySelectorAll('.sol-card[data-expand] .sol-head').forEach((head) => {
    const onClick = () => {
      const card = head.closest('.sol-card');
      if (!card) return;

      const open = card.classList.toggle('open');
      head.setAttribute('aria-expanded', open ? 'true' : 'false');
    };

    head.addEventListener('click', onClick);
    cleanups.push(() => head.removeEventListener('click', onClick));
  });

  document.querySelectorAll('.trust .logos img, .partner-logo img, .reg .seal img, .liquidity-operators__logo img').forEach((image) => {
    const applyFallback = () => {
      const parent = image.parentNode;
      if (!parent || parent.querySelector('.logo-fallback')) return;

      const name = image.getAttribute('alt') || image.closest('[aria-label]')?.getAttribute('aria-label') || '';
      const fallback = document.createElement('span');
      fallback.className = 'logo-fallback';
      fallback.textContent = name;
      image.remove();
      parent.appendChild(fallback);
    };

    if (image.complete && image.naturalWidth === 0) {
      applyFallback();
    }

    image.addEventListener('error', applyFallback);
    cleanups.push(() => image.removeEventListener('error', applyFallback));
  });

  return () => cleanups.forEach((cleanup) => cleanup());
}
