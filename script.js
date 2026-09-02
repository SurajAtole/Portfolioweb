/* ==========================================================================
   Suraj Atole — Portfolio
   Vanilla JavaScript only — no dependencies
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {

  /* ------------------------------------------------------------------
     1. Mobile hamburger menu
  ------------------------------------------------------------------ */
  const hamburger = document.getElementById('hamburger');
  const navMenu = document.getElementById('nav-menu');

  function closeMenu() {
    hamburger.classList.remove('open');
    navMenu.classList.remove('open');
    hamburger.setAttribute('aria-expanded', 'false');
  }

  function toggleMenu() {
    const isOpen = navMenu.classList.toggle('open');
    hamburger.classList.toggle('open', isOpen);
    hamburger.setAttribute('aria-expanded', String(isOpen));
  }

  hamburger.addEventListener('click', toggleMenu);

  /* ------------------------------------------------------------------
     2. Smooth scrolling for nav links (+ close mobile menu on click)
  ------------------------------------------------------------------ */
  const navLinks = document.querySelectorAll('.nav-link');

  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      const targetId = link.getAttribute('href');
      const target = document.querySelector(targetId);
      if (target) {
        e.preventDefault();
        const navHeight = document.getElementById('navbar').offsetHeight;
        const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - navHeight + 1;
        window.scrollTo({ top: targetPosition, behavior: 'smooth' });
      }
      closeMenu();
    });
  });

  /* ------------------------------------------------------------------
     3. Active navigation link while scrolling
  ------------------------------------------------------------------ */
  const sections = document.querySelectorAll('section[id]');

  function updateActiveLink() {
    const navHeight = document.getElementById('navbar').offsetHeight;
    const scrollPos = window.scrollY + navHeight + 40;

    let currentId = sections.length ? sections[0].id : '';
    sections.forEach(section => {
      if (scrollPos >= section.offsetTop) {
        currentId = section.id;
      }
    });

    navLinks.forEach(link => {
      link.classList.toggle('active-link', link.getAttribute('href') === `#${currentId}`);
    });
  }

  /* ------------------------------------------------------------------
     5. Navbar background change on scroll
  ------------------------------------------------------------------ */
  const navbar = document.getElementById('navbar');

  function updateNavbarBackground() {
    navbar.classList.toggle('scrolled', window.scrollY > 20);
  }

  /* ------------------------------------------------------------------
     8. Back-to-top button
  ------------------------------------------------------------------ */
  const backToTop = document.getElementById('back-to-top');

  function updateBackToTop() {
    backToTop.classList.toggle('visible', window.scrollY > 500);
  }

  backToTop.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  /* Combine scroll-driven updates into one listener for performance */
  let scrollTicking = false;
  function onScroll() {
    if (!scrollTicking) {
      window.requestAnimationFrame(() => {
        updateActiveLink();
        updateNavbarBackground();
        updateBackToTop();
        scrollTicking = false;
      });
      scrollTicking = true;
    }
  }
  window.addEventListener('scroll', onScroll);
  onScroll(); // run once on load

  /* ------------------------------------------------------------------
     4. Scroll reveal animations (+ animate skill bars when revealed)
  ------------------------------------------------------------------ */
  const revealEls = document.querySelectorAll('.reveal');

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -60px 0px' });

  revealEls.forEach(el => revealObserver.observe(el));

  /* ------------------------------------------------------------------
     6. Contact form validation + EmailJS send logic
  ------------------------------------------------------------------ */
  const EMAILJS_CONFIG = {
    publicKey: 'k4nmSBQS6e4x2uLxZ',
    serviceId: 'service_71rmrja',
    templateId: 'template_xv5gdjg'
  };

  const form = document.getElementById('contact-form');
  const formStatus = document.getElementById('form-status');

  function setFieldError(fieldName, message) {
    const input = form?.querySelector(`[name="${fieldName}"]`);
    const group = input?.closest('.form-group');
    const errorNode = document.getElementById(`error-${fieldName}`);

    if (group) group.classList.toggle('has-error', Boolean(message));
    if (errorNode) errorNode.textContent = message || '';
  }

  function validateForm() {
    const values = {
      name: form.querySelector('[name="name"]').value.trim(),
      email: form.querySelector('[name="email"]').value.trim(),
      phone: form.querySelector('[name="phone"]').value.trim(),
      message: form.querySelector('[name="message"]').value.trim()
    };

    let isValid = true;

    if (!values.name) {
      setFieldError('name', 'Please enter your name.');
      isValid = false;
    } else {
      setFieldError('name', '');
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!values.email) {
      setFieldError('email', 'Please enter your email.');
      isValid = false;
    } else if (!emailPattern.test(values.email)) {
      setFieldError('email', 'Please enter a valid email address.');
      isValid = false;
    } else {
      setFieldError('email', '');
    }

    if (!values.phone) {
      setFieldError('phone', 'Please enter your phone number.');
      isValid = false;
    } else {
      setFieldError('phone', '');
    }

    if (!values.message) {
      setFieldError('message', 'Please write your message.');
      isValid = false;
    } else {
      setFieldError('message', '');
    }

    return { isValid, values };
  }

  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const submitBtn = form.querySelector('.f-submit');
      const validation = validateForm();

      if (!validation.isValid) {
        formStatus.textContent = 'Please fix the highlighted fields.';
        formStatus.style.color = 'var(--danger)';
        return;
      }

      submitBtn.textContent = 'Sending...';
      submitBtn.disabled = true;
      submitBtn.classList.add('btn-disabled');

      try {
        await emailjs.send(
          EMAILJS_CONFIG.serviceId,
          EMAILJS_CONFIG.templateId,
          {
            from_name: validation.values.name,
            from_email: validation.values.email,
            phone: validation.values.phone,
            message: validation.values.message,
            reply_to: validation.values.email,
            to_name: 'Suraj Atole'
          },
          { publicKey: EMAILJS_CONFIG.publicKey }
        );

        formStatus.textContent = '✓ Message sent! I\'ll get back to you soon.';
        formStatus.style.color = 'var(--teal)';
        form.reset();
      } catch (error) {
        console.error('EmailJS send error:', error);
        formStatus.textContent = '✗ Failed to send. Please try again.';
        formStatus.style.color = 'var(--danger)';
      } finally {
        submitBtn.textContent = 'Send Message';
        submitBtn.disabled = false;
        submitBtn.classList.remove('btn-disabled');
        window.setTimeout(() => {
          if (formStatus.textContent.includes('sent') || formStatus.textContent.includes('Failed')) {
            formStatus.textContent = '';
          }
        }, 5000);
      }
    });
  }
  /* ------------------------------------------------------------------
     7. Current year in footer
  ------------------------------------------------------------------ */
  document.getElementById('year').textContent = new Date().getFullYear();

  /* ------------------------------------------------------------------
     9. Project filtering by technology
  ------------------------------------------------------------------ */
  const filterButtons = document.querySelectorAll('.filter-btn');
  const projectCards = document.querySelectorAll('.project-card');
  const filterEmpty = document.getElementById('filter-empty');

  filterButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      filterButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filter = btn.dataset.filter;
      let visibleCount = 0;

      projectCards.forEach(card => {
        const techs = card.dataset.tech.split(',');
        const matches = filter === 'all' || techs.includes(filter);
        card.style.display = matches ? '' : 'none';
        if (matches) visibleCount++;
      });

      filterEmpty.hidden = visibleCount !== 0;
    });
  });

});