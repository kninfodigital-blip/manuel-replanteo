/**
 * LASAR MANAGEMENT — Curso Replanteo
 * main.js — Interactividad de la landing page
 */

document.addEventListener('DOMContentLoaded', () => {

  // ============================================================
  // NAVEGACIÓN — scroll + hamburger
  // ============================================================
  const nav         = document.getElementById('nav');
  const hamburger   = document.getElementById('hamburger');
  const mobileMenu  = document.getElementById('mobileMenu');
  const mobileClose = document.getElementById('mobileClose');
  const mobileLinks = document.querySelectorAll('.mobile-link');

  // Añadir clase 'scrolled' al hacer scroll
  const handleNavScroll = () => {
    nav.classList.toggle('scrolled', window.scrollY > 60);
  };
  window.addEventListener('scroll', handleNavScroll, { passive: true });
  handleNavScroll(); // estado inicial

  // Abrir menú móvil
  hamburger.addEventListener('click', () => {
    const isOpen = mobileMenu.classList.toggle('open');
    hamburger.classList.toggle('open', isOpen);
    hamburger.setAttribute('aria-expanded', isOpen);
    document.body.style.overflow = isOpen ? 'hidden' : '';
  });

  // Cerrar menú móvil
  const closeMobileMenu = () => {
    mobileMenu.classList.remove('open');
    hamburger.classList.remove('open');
    hamburger.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  };
  mobileClose.addEventListener('click', closeMobileMenu);
  mobileLinks.forEach(link => link.addEventListener('click', closeMobileMenu));

  // Cerrar con Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && mobileMenu.classList.contains('open')) {
      closeMobileMenu();
    }
  });

  // ============================================================
  // ANIMACIONES DE ENTRADA (IntersectionObserver)
  // ============================================================
  const animatedEls = document.querySelectorAll('.animate-on-scroll');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        // Delay escalonado para elementos del mismo grupo
        setTimeout(() => {
          entry.target.classList.add('visible');
        }, i * 80);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  animatedEls.forEach(el => observer.observe(el));

  // ============================================================
  // CARRUSEL DE GALERÍA
  // ============================================================
  const track       = document.getElementById('carouselTrack');
  const prevBtn     = document.getElementById('carouselPrev');
  const nextBtn     = document.getElementById('carouselNext');
  const dotsWrap    = document.getElementById('carouselDots');

  if (track && prevBtn && nextBtn) {
    const slides       = Array.from(track.querySelectorAll('.carousel__slide'));
    let current        = 0;
    let autoplayTimer  = null;

    // Calcular cuántos slides caben visibles según viewport
    const getSlidesVisible = () => {
      if (window.innerWidth <= 480) return 1;
      if (window.innerWidth <= 768) return 2;
      return 3;
    };

    // Crear dots
    const buildDots = () => {
      dotsWrap.innerHTML = '';
      const visible  = getSlidesVisible();
      const numDots  = Math.ceil(slides.length / visible);
      for (let i = 0; i < numDots; i++) {
        const dot = document.createElement('button');
        dot.className = 'carousel__dot' + (i === 0 ? ' active' : '');
        dot.setAttribute('aria-label', `Ir al grupo ${i + 1}`);
        dot.addEventListener('click', () => goTo(i * visible));
        dotsWrap.appendChild(dot);
      }
    };

    const updateDots = () => {
      const visible  = getSlidesVisible();
      const dotIndex = Math.floor(current / visible);
      dotsWrap.querySelectorAll('.carousel__dot').forEach((d, i) => {
        d.classList.toggle('active', i === dotIndex);
      });
    };

    const goTo = (index) => {
      const visible = getSlidesVisible();
      const max     = slides.length - visible;
      current       = Math.max(0, Math.min(index, max));

      // Calcular offset: width de un slide + gap (8px = 0.5rem)
      const slideWidth = slides[0].offsetWidth + 8;
      track.style.transform = `translateX(-${current * slideWidth}px)`;
      updateDots();
    };

    prevBtn.addEventListener('click', () => {
      goTo(current - getSlidesVisible());
      resetAutoplay();
    });
    nextBtn.addEventListener('click', () => {
      goTo(current + getSlidesVisible());
      resetAutoplay();
    });

    // Autoplay cada 4s
    const startAutoplay = () => {
      autoplayTimer = setInterval(() => {
        const visible = getSlidesVisible();
        if (current + visible >= slides.length) {
          goTo(0);
        } else {
          goTo(current + visible);
        }
      }, 4000);
    };

    const resetAutoplay = () => {
      clearInterval(autoplayTimer);
      startAutoplay();
    };

    // Swipe táctil
    let touchStartX = 0;
    track.addEventListener('touchstart', (e) => {
      touchStartX = e.touches[0].clientX;
    }, { passive: true });
    track.addEventListener('touchend', (e) => {
      const diff = touchStartX - e.changedTouches[0].clientX;
      if (Math.abs(diff) > 50) {
        diff > 0 ? goTo(current + getSlidesVisible()) : goTo(current - getSlidesVisible());
        resetAutoplay();
      }
    });

    // Pausar autoplay al hover
    track.closest('.carousel').addEventListener('mouseenter', () => clearInterval(autoplayTimer));
    track.closest('.carousel').addEventListener('mouseleave', startAutoplay);

    // Init
    buildDots();
    startAutoplay();
    window.addEventListener('resize', () => {
      buildDots();
      goTo(0);
    });
  }

  // ============================================================
  // FAQ / ACCORDION
  // ============================================================
  const accordions = document.querySelectorAll('.accordion');

  accordions.forEach(acc => {
    const header = acc.querySelector('.accordion__header');
    header.addEventListener('click', () => {
      const isOpen = acc.classList.contains('open');

      // Cerrar todos primero
      accordions.forEach(a => {
        a.classList.remove('open');
        a.querySelector('.accordion__header').setAttribute('aria-expanded', 'false');
      });

      // Abrir el pulsado si estaba cerrado
      if (!isOpen) {
        acc.classList.add('open');
        header.setAttribute('aria-expanded', 'true');
      }
    });
  });

  // ============================================================
  // VÍDEOS DE TESTIMONIOS (play/pause al clicar)
  // ============================================================
  const testimonialWrappers = document.querySelectorAll('.testimonial-video');

  testimonialWrappers.forEach(wrapper => {
    const video   = wrapper.querySelector('video');
    const playBtn = wrapper.querySelector('.testimonial-video__play');

    if (!video || !playBtn) return;

    playBtn.addEventListener('click', () => {
      // Pausar todos los demás vídeos
      testimonialWrappers.forEach(w => {
        const v = w.querySelector('video');
        if (v && v !== video) {
          v.pause();
          w.classList.remove('playing');
        }
      });

      if (video.paused) {
        video.play().catch(() => {});
        wrapper.classList.add('playing');
      } else {
        video.pause();
        wrapper.classList.remove('playing');
      }
    });

    video.addEventListener('pause', () => wrapper.classList.remove('playing'));
    video.addEventListener('ended', () => wrapper.classList.remove('playing'));
  });

  // ============================================================
  // STICKY CTA — ocultar en la sección de registro
  // ============================================================
  const stickyCta    = document.getElementById('stickyCta');
  const registroSec  = document.getElementById('registro');

  if (stickyCta && registroSec) {
    const stickyObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        stickyCta.style.display = entry.isIntersecting ? 'none' : '';
      });
    }, { threshold: 0.1 });
    stickyObserver.observe(registroSec);
  }

  // ============================================================
  // FORMULARIO DE REGISTRO
  // ============================================================
  const form        = document.getElementById('registroForm');
  const formSuccess = document.getElementById('formSuccess');

  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();

      // Validación básica
      const nombre = form.nombre.value.trim();
      const email  = form.email.value.trim();

      if (!nombre || !email) {
        alert('Por favor, rellena al menos el nombre y el correo electrónico.');
        return;
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        alert('Por favor, introduce una dirección de correo válida.');
        return;
      }

      /**
       * INTEGRACIÓN DEL FORMULARIO
       * Opciones:
       * a) Formspree: action="https://formspree.io/f/TU_ID" method="POST"
       * b) Mailchimp: redirigir a URL de suscripción
       * c) HubSpot: integrar con su SDK
       * d) Email directo: enviar con backend Node/PHP
       *
       * Por ahora mostramos el mensaje de éxito (demo):
       */
      const submitBtn = form.querySelector('[type="submit"]');
      submitBtn.textContent = 'Enviando...';
      submitBtn.disabled = true;

      // Simular envío (reemplazar con fetch real)
      setTimeout(() => {
        form.reset();
        formSuccess.style.display = 'block';
        submitBtn.textContent = 'Solicitar información';
        submitBtn.disabled = false;
        formSuccess.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }, 1200);
    });
  }

  // ============================================================
  // SMOOTH SCROLL para todos los enlaces internos
  // ============================================================
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const target = document.querySelector(anchor.getAttribute('href'));
      if (target) {
        e.preventDefault();
        const offset = 80; // altura del nav fijo
        const top = target.getBoundingClientRect().top + window.pageYOffset - offset;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    });
  });

});
