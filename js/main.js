/* =====================================================================
   GUTAUSSCHANK STASSEN — Main JavaScript
   ===================================================================== */

(function () {
  'use strict';

  /* ── Navigation: Sticky behaviour ── */
  const nav        = document.getElementById('nav');
  const hamburger  = document.querySelector('.nav-hamburger');
  const mobileMenu = document.getElementById('nav-mobile');
  const mobileClose = document.querySelector('.nav-mobile-close');

  function updateNav() {
    if (!nav) return;
    const scrolled = window.scrollY > 60;
    nav.classList.toggle('nav--scrolled', scrolled);
    nav.classList.toggle('nav--transparent', !scrolled);
  }

  if (nav) {
    nav.classList.add('nav--transparent');
    window.addEventListener('scroll', updateNav, { passive: true });
    updateNav();
  }

  /* ── Mobile menu ── */
  function openMenu() {
    if (!mobileMenu) return;
    mobileMenu.classList.add('open');
    mobileMenu.setAttribute('aria-hidden', 'false');
    hamburger?.classList.add('active');
    hamburger?.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
  }

  function closeMenu() {
    if (!mobileMenu) return;
    mobileMenu.classList.remove('open');
    mobileMenu.setAttribute('aria-hidden', 'true');
    hamburger?.classList.remove('active');
    hamburger?.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }

  hamburger?.addEventListener('click', () => {
    mobileMenu?.classList.contains('open') ? closeMenu() : openMenu();
  });

  mobileClose?.addEventListener('click', closeMenu);

  mobileMenu?.querySelectorAll('.nav-mobile-link').forEach(link => {
    link.addEventListener('click', closeMenu);
  });

  /* Close on Escape */
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && mobileMenu?.classList.contains('open')) closeMenu();
  });

  /* ── Scroll Reveal (IntersectionObserver) ── */
  const revealObserver = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const delay = Number(entry.target.dataset.revealDelay || 0);
        setTimeout(() => entry.target.classList.add('visible'), delay);
        revealObserver.unobserve(entry.target);
      });
    },
    { threshold: 0.10, rootMargin: '0px 0px -55px 0px' }
  );

  /* Stagger cards that share a grid parent */
  const STAGGER_PARENTS = ['.menu-cards', '.visit-cards', '.atmo-pillars'];
  STAGGER_PARENTS.forEach(selector => {
    document.querySelectorAll(selector).forEach(parent => {
      parent.querySelectorAll('.reveal').forEach((el, i) => {
        el.dataset.revealDelay = i * 120;
      });
    });
  });

  document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

  /* ── Parallax on image-break (active only when a real photo is present) ── */
  const imgBreakPhoto = document.querySelector('.img-break-photo');
  if (imgBreakPhoto) {
    const parent = imgBreakPhoto.parentElement;
    window.addEventListener('scroll', () => {
      const rect = parent.getBoundingClientRect();
      if (rect.bottom < 0 || rect.top > window.innerHeight) return;
      const pct = rect.top / window.innerHeight;
      imgBreakPhoto.style.transform = `scale(1.08) translateY(${pct * -25}px)`;
    }, { passive: true });
  }

  /* ── Smooth scroll for anchor links ── */
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', e => {
      const id = link.getAttribute('href');
      if (id === '#') return;
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      const navH = parseInt(
        getComputedStyle(document.documentElement).getPropertyValue('--nav-h')
      ) || 76;
      const top = target.getBoundingClientRect().top + window.scrollY - navH - 12;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });

  /* ── Contact form ── */
  const contactForm = document.getElementById('contact-form');
  if (contactForm) {
    contactForm.addEventListener('submit', e => {
      e.preventDefault();
      const btn   = contactForm.querySelector('[type="submit"]');
      const label = btn.querySelector('.btn-label') || btn;
      const orig  = label.textContent;

      label.textContent = 'Nachricht gesendet ✓';
      btn.disabled      = true;
      btn.style.background = '#3a6645';

      setTimeout(() => {
        label.textContent   = orig;
        btn.disabled        = false;
        btn.style.background = '';
        contactForm.reset();
      }, 4000);
    });
  }

  /* ── Gallery: keyboard navigation ── */
  document.querySelectorAll('.gm-item').forEach(item => {
    item.setAttribute('tabindex', '0');
    item.setAttribute('role', 'img');
    const alt = item.querySelector('img')?.alt || '';
    item.setAttribute('aria-label', alt);
  });

  /* ── Active nav link on scroll ── */
  const sections = document.querySelectorAll('section[id]');
  const navLinks  = document.querySelectorAll('.nav-links .nav-link:not(.nav-cta-pill)');

  if (sections.length && navLinks.length) {
    const sectionObserver = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (!entry.isIntersecting) return;
          navLinks.forEach(link => {
            link.classList.toggle(
              'active',
              link.getAttribute('href') === `#${entry.target.id}`
            );
          });
        });
      },
      { threshold: 0.35 }
    );
    sections.forEach(s => sectionObserver.observe(s));
  }

  /* ── Menü-Tabs (Speisekarte / Getränke / Wochenkarte) ── */
  const menuTabBtns   = document.querySelectorAll('.menu-tab-btn');
  const menuTabPanels = document.querySelectorAll('.menu-tab-panel');

  menuTabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const target = btn.dataset.tab;
      menuTabBtns.forEach(b => { b.classList.remove('active'); b.setAttribute('aria-selected', 'false'); });
      menuTabPanels.forEach(p => { p.classList.remove('active'); p.hidden = true; });
      btn.classList.add('active');
      btn.setAttribute('aria-selected', 'true');
      const panel = document.getElementById(`tab-${target}`);
      if (panel) { panel.classList.add('active'); panel.hidden = false; }
    });
  });

  /* ── Kategorie-Tabs (innerhalb Speisekarte) ── */
  document.querySelectorAll('.menu-cat-nav').forEach(nav => {
    const catBtns   = nav.querySelectorAll('.menu-cat-btn');
    const content   = nav.nextElementSibling;
    const catPanels = content ? content.querySelectorAll('.menu-cat-panel') : [];

    catBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const target = btn.dataset.cat;
        catBtns.forEach(b => { b.classList.remove('active'); b.setAttribute('aria-selected', 'false'); });
        catPanels.forEach(p => { p.classList.remove('active'); p.hidden = true; });
        btn.classList.add('active');
        btn.setAttribute('aria-selected', 'true');
        const panel = document.getElementById(`cat-${target}`);
        if (panel) { panel.classList.add('active'); panel.hidden = false; }
      });
    });
  });

  /* ── Subtle card tilt on mouse move ── */
  document.querySelectorAll('.menu-card, .visit-card').forEach(card => {
    card.addEventListener('mousemove', e => {
      const rect = card.getBoundingClientRect();
      const cx   = rect.left + rect.width  / 2;
      const cy   = rect.top  + rect.height / 2;
      const dx   = (e.clientX - cx) / (rect.width  / 2);
      const dy   = (e.clientY - cy) / (rect.height / 2);
      card.style.transform = `translateY(-8px) rotateX(${dy * -3}deg) rotateY(${dx * 3}deg)`;
      card.style.transition = 'transform 0.1s ease';
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform  = '';
      card.style.transition = 'transform 0.45s cubic-bezier(0.34,1.56,0.64,1)';
    });
  });

})();
