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
const marqueeTracks = Array.from(document.querySelectorAll('.gallery-track'));
const parallaxImages = Array.from(document.querySelectorAll('.hero-slide, .about-visual img, .feature-concert-image img, .gallery-card img'));

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

  const aboutVisual = document.querySelector('.about-visual img');
  if (aboutVisual) {
    window.gsap.fromTo(
      aboutVisual,
      { scale: 1.18, yPercent: -6 },
      {
        scale: 1.04,
        yPercent: 8,
        ease: 'none',
        scrollTrigger: {
          trigger: '.about',
          scrub: 1.4,
          start: 'top bottom',
          end: 'bottom top',
        },
      },
    );
  }

  const featureImage = document.querySelector('.feature-concert-image img');
  if (featureImage) {
    window.gsap.fromTo(
      featureImage,
      { scale: 1.16, yPercent: -10 },
      {
        scale: 1.02,
        yPercent: 10,
        ease: 'none',
        scrollTrigger: {
          trigger: '.feature-concert',
          scrub: 1.2,
          start: 'top bottom',
          end: 'bottom top',
        },
      },
    );
  }

  marqueeTracks.forEach((track, index) => {
    const direction = index % 2 === 0 ? -160 : 160;
    window.gsap.to(track, {
      x: direction,
      ease: 'none',
      scrollTrigger: {
        trigger: '.gallery',
        scrub: 1,
        start: 'top bottom',
        end: 'bottom top',
      },
    });
  });

  document.querySelectorAll('.gallery-card').forEach((card, index) => {
    const image = card.querySelector('img');
    if (!image) {
      return;
    }

    window.gsap.fromTo(
      image,
      {
        scale: 1.22,
        yPercent: index % 2 === 0 ? -12 : 12,
      },
      {
        scale: 1.06,
        yPercent: index % 2 === 0 ? 12 : -12,
        ease: 'none',
        scrollTrigger: {
          trigger: card,
          scrub: 1.1,
          start: 'top bottom',
          end: 'bottom top',
        },
      },
    );
  });

  heroSlides.forEach((slide, index) => {
    window.gsap.fromTo(
      slide,
      { scale: 1.18, yPercent: -4 },
      {
        scale: 1.04,
        yPercent: index % 2 === 0 ? 4 : -4,
        ease: 'none',
        scrollTrigger: {
          trigger: '.hero',
          scrub: 1,
          start: 'top top',
          end: 'bottom top',
        },
      },
    );
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
