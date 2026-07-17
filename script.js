const pageTransitionOverlay = document.querySelector('.page-transition-overlay');

function hidePageTransitionOverlay() {
  if (!pageTransitionOverlay) {
    return;
  }

  requestAnimationFrame(() => {
    pageTransitionOverlay.classList.add('is-leaving');
    window.setTimeout(() => {
      pageTransitionOverlay.classList.remove('is-visible');
    }, 620);
  });
}

if (document.body.dataset.page === 'home') {
  window.addEventListener('pageshow', hidePageTransitionOverlay);
  window.addEventListener('load', hidePageTransitionOverlay);
} else if (pageTransitionOverlay) {
  pageTransitionOverlay.remove();
}

const heroSlides = Array.from(document.querySelectorAll('.hero-slide'));
let activeHeroIndex = 0;

if (heroSlides.length > 1) {
  window.setInterval(() => {
    heroSlides[activeHeroIndex].classList.remove('is-active');
    activeHeroIndex = (activeHeroIndex + 1) % heroSlides.length;
    heroSlides[activeHeroIndex].classList.add('is-active');
  }, 5000);
}

const revealTargets = Array.from(document.querySelectorAll('[data-reveal]'));
const menuToggle = document.querySelector('.menu-toggle');
const siteHeader = document.querySelector('.site-header');
const siteNavPanel = document.querySelector('.site-nav-panel');
const navGroups = Array.from(document.querySelectorAll('.nav-group'));
const heroSection = document.querySelector('.hero');
const mobileNavLinks = Array.from(document.querySelectorAll('.site-nav-panel a'));
const compactNavBreakpoint = 1180;
let lastScrollY = window.scrollY;

const youtubeEmbeds = Array.from(document.querySelectorAll('[data-youtube-embed]'));
const youtubePlaylists = Array.from(document.querySelectorAll('[data-youtube-playlist]'));

if (window.location.protocol === 'http:' || window.location.protocol === 'https:') {
  youtubeEmbeds.forEach((container) => {
    const videoId = container.dataset.youtubeEmbed;
    if (!videoId) {
      return;
    }

    const iframe = document.createElement('iframe');
    const origin = encodeURIComponent(window.location.origin);
    iframe.src = `https://www.youtube.com/embed/${videoId}?rel=0&origin=${origin}`;
    iframe.title = container.dataset.youtubeTitle || 'YouTube動画';
    iframe.loading = 'lazy';
    iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';
    iframe.referrerPolicy = 'strict-origin-when-cross-origin';
    iframe.allowFullscreen = true;
    container.replaceChildren(iframe);
  });

  youtubePlaylists.forEach((container) => {
    const playlistId = container.dataset.youtubePlaylist;
    if (!playlistId) {
      return;
    }

    const iframe = document.createElement('iframe');
    const origin = encodeURIComponent(window.location.origin);
    iframe.src = `https://www.youtube.com/embed/videoseries?list=${playlistId}&origin=${origin}`;
    iframe.title = container.dataset.youtubeTitle || 'YouTube再生リスト';
    iframe.loading = 'lazy';
    iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';
    iframe.referrerPolicy = 'strict-origin-when-cross-origin';
    iframe.allowFullscreen = true;
    container.replaceChildren(iframe);
  });
}

function closeMenu() {
  if (!menuToggle || !siteHeader) {
    return;
  }

  siteHeader.classList.remove('menu-open');
  siteHeader.classList.remove('is-hidden');
  menuToggle.setAttribute('aria-expanded', 'false');
  menuToggle.setAttribute('aria-label', 'メニューを開く');
  navGroups.forEach((group) => {
    group.open = false;
  });
}

function syncHeaderMode() {
  if (!siteHeader) {
    return;
  }

  const isMobile = window.innerWidth <= compactNavBreakpoint;
  const currentScrollY = window.scrollY;
  const shouldCompact = !isMobile && heroSection && currentScrollY > Math.max(heroSection.offsetHeight - 120, 120);
  siteHeader.classList.toggle('is-compact', Boolean(shouldCompact));
  siteHeader.classList.toggle('is-scrolled', isMobile || Boolean(shouldCompact));

  const shouldHide = !isMobile && shouldCompact && currentScrollY > lastScrollY && currentScrollY > 240 && !siteHeader.classList.contains('menu-open');
  siteHeader.classList.toggle('is-hidden', shouldHide);
  lastScrollY = currentScrollY;

  if (!isMobile && !shouldCompact) {
    closeMenu();
  }

  if (isMobile) {
    siteHeader.classList.remove('is-compact');
    siteHeader.classList.remove('is-hidden');
  }
}

if (menuToggle && siteHeader && siteNavPanel) {
  menuToggle.addEventListener('click', () => {
    const isCompact = siteHeader.classList.contains('is-compact') || window.innerWidth <= compactNavBreakpoint;
    if (!isCompact) {
      return;
    }

    const isOpen = siteHeader.classList.toggle('menu-open');
    menuToggle.setAttribute('aria-expanded', String(isOpen));
    menuToggle.setAttribute('aria-label', isOpen ? 'メニューを閉じる' : 'メニューを開く');
    if (isOpen) {
      navGroups.forEach((group) => {
        group.open = true;
      });
    }
  });

  mobileNavLinks.forEach((link) => {
    link.addEventListener('click', () => {
      if (window.innerWidth <= compactNavBreakpoint || siteHeader.classList.contains('is-compact')) {
        closeMenu();
      }
    });
  });

  window.addEventListener('resize', syncHeaderMode);
  window.addEventListener('scroll', syncHeaderMode, { passive: true });
  syncHeaderMode();
}

if (navGroups.length > 0) {
  navGroups.forEach((group) => {
    const summary = group.querySelector('summary');
    if (!summary) {
      return;
    }

    group.addEventListener('mouseenter', () => {
      if (window.innerWidth <= compactNavBreakpoint || siteHeader?.classList.contains('is-compact')) {
        return;
      }
      group.open = true;
    });

    group.addEventListener('mouseleave', () => {
      if (window.innerWidth <= compactNavBreakpoint || siteHeader?.classList.contains('is-compact')) {
        return;
      }
      group.open = false;
    });

    summary.addEventListener('click', (event) => {
      const isCompactMenu = window.innerWidth <= compactNavBreakpoint || siteHeader?.classList.contains('is-compact');
      if (isCompactMenu) {
        event.preventDefault();
        group.open = true;
        return;
      }

      event.preventDefault();
    });
  });
}

function runFallbackReveal() {
  if ('IntersectionObserver' in window && revealTargets.length > 0) {
    const revealObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) {
            return;
          }

          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        });
      },
      {
        threshold: 0.16,
        rootMargin: '0px 0px -10% 0px',
      },
    );

    revealTargets.forEach((target) => revealObserver.observe(target));
  } else {
    revealTargets.forEach((target) => target.classList.add('is-visible'));
  }
}

if (window.gsap && window.ScrollTrigger) {
  window.gsap.registerPlugin(window.ScrollTrigger);

  window.gsap.set(revealTargets, { autoAlpha: 0, y: 36 });

  revealTargets.forEach((target, index) => {
    window.gsap.to(target, {
      autoAlpha: 1,
      duration: 1,
      ease: 'power3.out',
      y: 0,
      delay: Math.min(index * 0.03, 0.18),
      scrollTrigger: {
        trigger: target,
        start: 'top 82%',
        toggleActions: 'play none none none',
      },
    });
  });

  const heroCopy = document.querySelector('.hero-copy');
  const heroPanel = document.querySelector('.hero-panel');

  if (heroCopy && heroPanel) {
    const heroTimeline = window.gsap.timeline({ defaults: { ease: 'power3.out' } });
    heroTimeline
      .fromTo(heroCopy, { autoAlpha: 0, y: 28 }, { autoAlpha: 1, y: 0, duration: 1.1 })
      .fromTo(heroPanel, { autoAlpha: 0, y: 36 }, { autoAlpha: 1, y: 0, duration: 1 }, '-=0.7');
  }
} else {
  runFallbackReveal();
}
