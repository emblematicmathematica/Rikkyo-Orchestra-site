const pageTransitionOverlay = document.querySelector('.page-transition-overlay');
const homeIntroStorageKey = 'ruso-home-intro-seen';
let overlayDismissalScheduled = false;

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

function isFirstHomeVisitInSession() {
  try {
    const hasSeenIntro = window.sessionStorage.getItem(homeIntroStorageKey) === 'true';
    window.sessionStorage.setItem(homeIntroStorageKey, 'true');
    return !hasSeenIntro;
  } catch {
    return true;
  }
}

function schedulePageTransitionOverlay() {
  if (!pageTransitionOverlay || overlayDismissalScheduled) return;

  overlayDismissalScheduled = true;
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const firstVisit = isFirstHomeVisitInSession();
  const displayDuration = prefersReducedMotion ? 0 : (firstVisit ? 2000 : 250);
  window.setTimeout(hidePageTransitionOverlay, displayDuration);
}

if (document.body.dataset.page === 'home') {
  schedulePageTransitionOverlay();
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
const navCloseTimers = new WeakMap();
const headerTriggerSection = document.querySelector('.hero, .subpage-hero');
const mobileNavLinks = Array.from(document.querySelectorAll('.site-nav-panel a'));
const compactNavBreakpoint = 1180;
let lastScrollY = window.scrollY;

const archiveBrowser = document.querySelector('[data-archive-browser]');
if (archiveBrowser) {
  const searchInput = archiveBrowser.querySelector('[data-archive-search]');
  const searchStatus = archiveBrowser.querySelector('[data-archive-search-status]');
  const noResults = archiveBrowser.querySelector('[data-archive-no-results]');
  const yearSections = Array.from(archiveBrowser.querySelectorAll('[data-archive-year]'));
  const concertCards = Array.from(archiveBrowser.querySelectorAll('.archive-concert-card'));
  const normalizeText = (value) => value.normalize('NFKC').toLocaleLowerCase('ja');

  searchInput?.addEventListener('input', () => {
    const query = normalizeText(searchInput.value.trim());
    let visibleCount = 0;

    concertCards.forEach((card) => {
      const isMatch = !query || normalizeText(card.textContent).includes(query);
      card.hidden = !isMatch;
      if (isMatch) visibleCount += 1;
    });

    yearSections.forEach((section) => {
      section.hidden = !section.querySelector('.archive-concert-card:not([hidden])');
    });

    if (searchStatus) searchStatus.textContent = query ? `${visibleCount}件見つかりました` : `${concertCards.length}件の公演`;
    if (noResults) noResults.hidden = visibleCount !== 0;
  });
}

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
    window.clearTimeout(navCloseTimers.get(group));
    group.open = false;
    group.classList.remove('is-hover-open');
  });
}

function syncHeaderMode() {
  if (!siteHeader) {
    return;
  }

  const isMobile = window.innerWidth <= compactNavBreakpoint;
  const currentScrollY = window.scrollY;
  const triggerHeight = headerTriggerSection?.offsetHeight || 360;
  const shouldCompact = !isMobile && currentScrollY > Math.max(triggerHeight - 120, 120);
  siteHeader.classList.toggle('is-compact', shouldCompact);
  siteHeader.classList.toggle('is-scrolled', isMobile || shouldCompact);

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
      navGroups.forEach((otherGroup) => {
        if (otherGroup === group) {
          return;
        }
        window.clearTimeout(navCloseTimers.get(otherGroup));
        otherGroup.open = false;
        otherGroup.classList.remove('is-hover-open');
      });
      window.clearTimeout(navCloseTimers.get(group));
      group.open = true;
      group.classList.add('is-hover-open');
    });

    group.addEventListener('mouseleave', () => {
      if (window.innerWidth <= compactNavBreakpoint || siteHeader?.classList.contains('is-compact')) {
        return;
      }
      const closeTimer = window.setTimeout(() => {
        group.open = false;
        group.classList.remove('is-hover-open');
      }, 420);
      navCloseTimers.set(group, closeTimer);
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
        threshold: 0.01,
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
