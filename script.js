/* ============================================================
   MATRIX AI PORTFOLIO — JavaScript
   Matrix Rain + Typewriter + Scroll Reveal + Navigation
   ============================================================ */

(function () {
  'use strict';

  // ===================== MATRIX RAIN =====================
  const canvas = document.getElementById('matrix-rain');
  const ctx = canvas.getContext('2d');

  // Characters: Katakana + Latin + Numbers + Symbols
  const matrixChars =
    'アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン' +
    'ABCDEFGHIJKLMNOPQRSTUVWXYZ' +
    '0123456789' +
    '@#$%^&*()_+-=[]{}|;:<>?';

  let columns;
  let drops;
  let fontSize = 14;

  function initMatrix() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    columns = Math.floor(canvas.width / fontSize);
    drops = new Array(columns).fill(1);

    // Randomize starting positions
    for (let i = 0; i < drops.length; i++) {
      drops[i] = Math.random() * -100;
    }
  }

  function drawMatrix() {
    // Semi-transparent black for trail effect
    ctx.fillStyle = 'rgba(5, 5, 5, 0.06)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.font = fontSize + 'px monospace';

    for (let i = 0; i < drops.length; i++) {
      // Random character
      const char = matrixChars[Math.floor(Math.random() * matrixChars.length)];
      const x = i * fontSize;
      const y = drops[i] * fontSize;

      // Brightest character at the head
      if (Math.random() > 0.96) {
        ctx.fillStyle = '#ffffff';
        ctx.shadowColor = '#00ff41';
        ctx.shadowBlur = 15;
      } else {
        // Varying green intensity
        const brightness = Math.random();
        if (brightness > 0.8) {
          ctx.fillStyle = '#00ff41';
        } else if (brightness > 0.4) {
          ctx.fillStyle = '#00cc33';
        } else {
          ctx.fillStyle = '#005500';
        }
        ctx.shadowBlur = 0;
      }

      ctx.fillText(char, x, y);
      ctx.shadowBlur = 0;

      // Reset drop to top randomly
      if (y > canvas.height && Math.random() > 0.975) {
        drops[i] = 0;
      }

      drops[i]++;
    }
  }

  initMatrix();

  // Throttle resize
  let resizeTimeout;
  window.addEventListener('resize', function () {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(initMatrix, 200);
  });

  // Animation loop with reduced framerate for performance
  let lastFrame = 0;
  const frameInterval = 45; // ~22fps — smooth enough, saves CPU

  function matrixLoop(timestamp) {
    if (timestamp - lastFrame >= frameInterval) {
      drawMatrix();
      lastFrame = timestamp;
    }
    requestAnimationFrame(matrixLoop);
  }

  // Check for reduced motion preference
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (!prefersReducedMotion.matches) {
    requestAnimationFrame(matrixLoop);
  } else {
    // Static single frame for reduced motion
    drawMatrix();
  }


  // ===================== TYPEWRITER EFFECT =====================
  function typeWriter(element) {
    const text = element.getAttribute('data-text');
    const delay = parseInt(element.getAttribute('data-delay')) || 60;
    const startDelay = parseInt(element.getAttribute('data-start')) || 0;
    let index = 0;

    element.textContent = '';

    setTimeout(function () {
      function type() {
        if (index < text.length) {
          element.textContent += text[index];
          index++;
          setTimeout(type, delay + Math.random() * 30); // Slight randomness for realism
        }
      }
      type();
    }, startDelay);
  }

  // Initialize typewriters
  if (!prefersReducedMotion.matches) {
    document.querySelectorAll('.typewriter').forEach(typeWriter);
  } else {
    // Show text immediately for reduced motion
    document.querySelectorAll('.typewriter').forEach(function (el) {
      el.textContent = el.getAttribute('data-text');
    });
  }


  // ===================== SCROLL REVEAL =====================
  const revealElements = document.querySelectorAll('.scroll-reveal');

  const revealObserver = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');

          // Animate counters if present
          const counter = entry.target.querySelector('[data-count]');
          if (counter) {
            animateCounter(counter);
          }

          revealObserver.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.15,
      rootMargin: '0px 0px -60px 0px',
    }
  );

  revealElements.forEach(function (el) {
    revealObserver.observe(el);
  });


  // ===================== COUNTER ANIMATION =====================
  function animateCounter(element) {
    const target = parseInt(element.getAttribute('data-count'));
    const duration = 1500;
    const startTime = performance.now();

    function update(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(eased * target);

      element.textContent = current + '+';

      if (progress < 1) {
        requestAnimationFrame(update);
      }
    }

    requestAnimationFrame(update);
  }


  // ===================== NAVIGATION =====================
  const nav = document.getElementById('nav');
  const navToggle = document.getElementById('nav-toggle');
  const navLinks = document.getElementById('nav-links');
  const allNavLinks = document.querySelectorAll('.nav__link');

  // Scroll state
  let lastScroll = 0;

  window.addEventListener(
    'scroll',
    function () {
      const currentScroll = window.pageYOffset;

      // Compact nav on scroll
      if (currentScroll > 50) {
        nav.classList.add('nav--scrolled');
      } else {
        nav.classList.remove('nav--scrolled');
      }

      lastScroll = currentScroll;
    },
    { passive: true }
  );

  // Mobile menu toggle
  navToggle.addEventListener('click', function () {
    const isOpen = navLinks.classList.toggle('open');
    navToggle.classList.toggle('active');
    navToggle.setAttribute('aria-expanded', isOpen);
    document.body.style.overflow = isOpen ? 'hidden' : '';
  });

  // Close mobile menu on link click
  allNavLinks.forEach(function (link) {
    link.addEventListener('click', function () {
      navLinks.classList.remove('open');
      navToggle.classList.remove('active');
      navToggle.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    });
  });

  // Active link on scroll
  const sections = document.querySelectorAll('section[id]');

  const sectionObserver = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          const id = entry.target.getAttribute('id');
          allNavLinks.forEach(function (link) {
            link.classList.remove('active');
            if (link.getAttribute('href') === '#' + id) {
              link.classList.add('active');
            }
          });
        }
      });
    },
    {
      threshold: 0.3,
      rootMargin: '-80px 0px -50% 0px',
    }
  );

  sections.forEach(function (section) {
    sectionObserver.observe(section);
  });

  // Close mobile menu on Escape key
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && navLinks.classList.contains('open')) {
      navLinks.classList.remove('open');
      navToggle.classList.remove('active');
      navToggle.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
      navToggle.focus();
    }
  });
})();
