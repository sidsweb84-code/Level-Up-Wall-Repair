// Level Up Wall Repair — shared site behaviour.
// Each concern below is self-contained and only wires up if its markup is present on the page.

document.addEventListener('DOMContentLoaded', () => {
  // Each feature initializes independently — one failing (e.g. unexpected
  // markup on a given page) must never block scroll-reveal or the others.
  [
    initMobileMenu,
    initScrollReveal,
    initCounters,
    initReviewFilters,
    initTabGroups,
    initBeforeAfterSliders,
    initContactForm,
  ].forEach((init) => {
    try {
      init();
    } catch (err) {
      console.error(`${init.name} failed:`, err);
    }
  });
});

// ---------- Mobile menu ----------
function initMobileMenu() {
  const menuBtn = document.getElementById('menuBtn');
  const mobileNav = document.getElementById('mobileNav');
  const hamburger = document.getElementById('hamburgerIcon');
  if (!menuBtn || !mobileNav) return;

  menuBtn.addEventListener('click', () => {
    const isOpen = mobileNav.classList.toggle('open');
    if (hamburger) hamburger.classList.toggle('open', isOpen);
    menuBtn.setAttribute('aria-expanded', String(isOpen));
  });

  mobileNav.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      mobileNav.classList.remove('open');
      if (hamburger) hamburger.classList.remove('open');
      menuBtn.setAttribute('aria-expanded', 'false');
    });
  });
}

// ---------- Scroll reveal ----------
function initScrollReveal() {
  const targets = document.querySelectorAll('.reveal, .reveal-group');
  if (!targets.length) return;

  if (!('IntersectionObserver' in window) || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    targets.forEach((el) => el.classList.add('is-visible'));
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -60px 0px' });

  targets.forEach((el) => observer.observe(el));

  // Safety net: guarantee nothing stays hidden if an element never intersects
  // (e.g. zero-height at observe time). Long enough to never race a real scroll.
  window.setTimeout(() => {
    targets.forEach((el) => el.classList.add('is-visible'));
  }, 4000);
}

// ---------- Animated counters ----------
// Add data-counter-target="4.9" (and optionally data-counter-decimals="1") to any element.
function initCounters() {
  const counters = document.querySelectorAll('[data-counter-target]');
  if (!counters.length) return;

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const animate = (el) => {
    const target = parseFloat(el.getAttribute('data-counter-target'));
    const decimals = parseInt(el.getAttribute('data-counter-decimals') || '0', 10);
    if (reduceMotion) {
      el.textContent = target.toFixed(decimals);
      return;
    }
    const duration = 1100;
    const start = performance.now();
    function tick(now) {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = (target * eased).toFixed(decimals);
      if (progress < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  };

  if (!('IntersectionObserver' in window)) {
    counters.forEach(animate);
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        animate(entry.target);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.6 });

  counters.forEach((el) => observer.observe(el));
}

// ---------- Review category filters ----------
function initReviewFilters() {
  document.querySelectorAll('[data-filtergroup]').forEach((group) => {
    const pills = group.querySelectorAll('.filter-pill');
    const container = document.querySelector(group.getAttribute('data-filtertarget'));
    if (!container) return;
    const noResults = document.getElementById('noResults');

    pills.forEach((pill) => {
      pill.addEventListener('click', () => {
        pills.forEach((p) => p.classList.remove('active'));
        pill.classList.add('active');
        const cat = pill.getAttribute('data-filter');
        let visibleCount = 0;

        container.querySelectorAll('[data-category]').forEach((item) => {
          const categories = item.getAttribute('data-category').split(' ');
          const show = cat === 'all' || categories.includes(cat);
          item.classList.toggle('is-hidden', !show);
          if (show) visibleCount += 1;
        });

        if (noResults) noResults.classList.toggle('hidden', visibleCount !== 0);
      });
    });
  });
}

// ---------- Before/mid/final tab groups (gallery cards) ----------
function initTabGroups() {
  document.querySelectorAll('[data-tabgroup]').forEach((group) => {
    const buttons = group.querySelectorAll('.tab-btn');
    const panels = group.parentElement.querySelectorAll('[data-tabpanel]');
    buttons.forEach((btn) => {
      btn.addEventListener('click', () => {
        buttons.forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        const target = btn.getAttribute('data-tab');
        panels.forEach((p) => {
          p.classList.toggle('hidden', p.getAttribute('data-tabpanel') !== target);
        });
      });
    });
  });
}

// ---------- Before/after drag sliders ----------
function initBeforeAfterSliders() {
  document.querySelectorAll('.ba-slider').forEach((slider) => {
    const before = slider.querySelector('.ba-before');
    const handle = slider.querySelector('.ba-handle');
    if (!before || !handle) return;
    let dragging = false;

    const setPos = (clientX) => {
      const rect = slider.getBoundingClientRect();
      let pct = ((clientX - rect.left) / rect.width) * 100;
      pct = Math.max(0, Math.min(100, pct));
      before.style.width = pct + '%';
      handle.style.left = pct + '%';
    };

    const start = (clientX) => { dragging = true; setPos(clientX); };
    const move = (clientX) => { if (dragging) setPos(clientX); };
    const end = () => { dragging = false; };

    slider.addEventListener('mousedown', (e) => start(e.clientX));
    window.addEventListener('mousemove', (e) => move(e.clientX));
    window.addEventListener('mouseup', end);

    slider.addEventListener('touchstart', (e) => start(e.touches[0].clientX), { passive: true });
    window.addEventListener('touchmove', (e) => { if (dragging) move(e.touches[0].clientX); }, { passive: true });
    window.addEventListener('touchend', end);

    // Keyboard support
    slider.setAttribute('tabindex', '0');
    slider.addEventListener('keydown', (e) => {
      const rect = slider.getBoundingClientRect();
      const currentPct = parseFloat(before.style.width) || 50;
      if (e.key === 'ArrowLeft') { setPos(rect.left + (rect.width * (currentPct - 5)) / 100); e.preventDefault(); }
      if (e.key === 'ArrowRight') { setPos(rect.left + (rect.width * (currentPct + 5)) / 100); e.preventDefault(); }
    });
  });
}

// ---------- Contact form ----------
function initContactForm() {
  const form = document.getElementById('enquiryForm');
  if (!form) return;

  const submitBtn = document.getElementById('formSubmitBtn');
  const submitLabel = document.getElementById('formSubmitLabel');
  const formSpinner = document.getElementById('formSpinner');
  const idleState = document.getElementById('formIdleState');
  const successState = document.getElementById('formSuccessState');
  const errorBanner = document.getElementById('formErrorBanner');

  // Preselect repair type from a ?repair= query param (used by service page CTAs).
  const params = new URLSearchParams(window.location.search);
  const repairParam = params.get('repair');
  const repairSelect = document.getElementById('repairType');
  if (repairParam && repairSelect && repairSelect.querySelector(`option[value="${repairParam}"]`)) {
    repairSelect.value = repairParam;
  }

  // ----- Photo upload (drag & drop + file picker) -----
  const dropzone = document.getElementById('dropzone');
  const fileInput = document.getElementById('photoInput');
  const thumbList = document.getElementById('thumbList');
  let files = [];

  function renderThumbs() {
    if (!thumbList) return;
    thumbList.innerHTML = '';
    files.forEach((file, index) => {
      const thumb = document.createElement('div');
      thumb.className = 'thumb';
      const img = document.createElement('img');
      img.src = URL.createObjectURL(file);
      img.alt = `Uploaded photo ${index + 1}: ${file.name}`;
      const remove = document.createElement('button');
      remove.type = 'button';
      remove.className = 'thumb-remove';
      remove.setAttribute('aria-label', `Remove photo ${index + 1}`);
      remove.innerHTML = '<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>';
      remove.addEventListener('click', () => {
        files.splice(index, 1);
        renderThumbs();
      });
      thumb.appendChild(img);
      thumb.appendChild(remove);
      thumbList.appendChild(thumb);
    });
  }

  function addFiles(fileList) {
    const incoming = Array.from(fileList).filter((f) => f.type.startsWith('image/'));
    files = files.concat(incoming).slice(0, 6);
    renderThumbs();
  }

  if (dropzone && fileInput) {
    dropzone.addEventListener('click', () => fileInput.click());
    dropzone.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); fileInput.click(); }
    });
    fileInput.addEventListener('change', () => addFiles(fileInput.files));
    ['dragenter', 'dragover'].forEach((evt) => {
      dropzone.addEventListener(evt, (e) => { e.preventDefault(); dropzone.classList.add('drag-over'); });
    });
    ['dragleave', 'drop'].forEach((evt) => {
      dropzone.addEventListener(evt, (e) => { e.preventDefault(); dropzone.classList.remove('drag-over'); });
    });
    dropzone.addEventListener('drop', (e) => {
      if (e.dataTransfer && e.dataTransfer.files) addFiles(e.dataTransfer.files);
    });
  }

  // ----- Validation -----
  const rules = {
    fullName: (v) => v.trim().length >= 2,
    phone: (v) => /^[0-9+()\s-]{8,}$/.test(v.trim()),
    email: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()),
    repairType: (v) => v.trim().length > 0,
    description: (v) => v.trim().length >= 10,
  };

  function setFieldError(name, hasError) {
    const input = form.elements[name];
    const errorEl = document.getElementById(`${name}Error`);
    if (input) input.classList.toggle('has-error', hasError);
    if (input) input.setAttribute('aria-invalid', hasError ? 'true' : 'false');
    if (errorEl) errorEl.classList.toggle('show', hasError);
  }

  function validate() {
    let valid = true;
    Object.entries(rules).forEach(([name, test]) => {
      const input = form.elements[name];
      if (!input) return;
      const ok = test(input.value || '');
      setFieldError(name, !ok);
      if (!ok) valid = false;
    });
    return valid;
  }

  Object.keys(rules).forEach((name) => {
    const input = form.elements[name];
    if (!input) return;
    input.addEventListener('blur', () => setFieldError(name, !rules[name](input.value || '')));
    input.addEventListener('input', () => {
      if (input.classList.contains('has-error')) setFieldError(name, !rules[name](input.value || ''));
    });
  });

  // ----- Submit -----
  // submitEnquiry() is a placeholder: no email/backend service is configured yet.
  // Swap the body of this function for a real API call (e.g. POST to your own
  // endpoint, Formspree, Netlify Forms, or an email-sending function) — the
  // rest of the form (validation, loading state, success state) will keep working.
  function submitEnquiry(payload) {
    return new Promise((resolve) => {
      console.info('Enquiry ready to send (no backend connected yet):', payload);
      setTimeout(resolve, 700);
    });
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (errorBanner) errorBanner.classList.add('hidden');
    if (!validate()) {
      const firstError = form.querySelector('.has-error');
      if (firstError) firstError.focus();
      return;
    }

    submitBtn.disabled = true;
    if (submitLabel) submitLabel.textContent = 'Sending…';
    if (formSpinner) formSpinner.classList.remove('hidden');

    const formData = new FormData(form);
    const payload = Object.fromEntries(formData.entries());
    payload.photoCount = files.length;

    try {
      await submitEnquiry(payload);
      if (idleState) idleState.classList.remove('show');
      if (successState) successState.classList.add('show');
      successState.setAttribute('tabindex', '-1');
      successState.focus();
    } catch (err) {
      if (errorBanner) errorBanner.classList.remove('hidden');
      submitBtn.disabled = false;
      if (submitLabel) submitLabel.textContent = 'Send Enquiry';
      if (formSpinner) formSpinner.classList.add('hidden');
    }
  });
}
