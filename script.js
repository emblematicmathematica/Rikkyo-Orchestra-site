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
