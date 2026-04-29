/* =============================================
   letsthinkpositive.com — Main JavaScript
   Full Site | 10 Pages | All interactions
   ============================================= */
(function () {
  "use strict";

  /* ══════════════════════════════════════════
     DATA — QUOTES
  ══════════════════════════════════════════ */
  var QUOTES = [
    { text: "The root of every action is a thought. Tend to your roots.", author: "Tapas Pattanaik", cat: "Mindset" },
    { text: "You don't need a cape to change the world. You just need to change one thought.", author: "Tapas Pattanaik", cat: "Motivation" },
    { text: "You cannot control the storm. But you can control how you stand in it.", author: "Tapas Pattanaik", cat: "Mindset" },
    { text: "Positivity is not pretending everything is fine. It is deciding that you are strong enough to face what is not.", author: "Tapas Pattanaik", cat: "Motivation" },
    { text: "Be the ear someone needs today. You have no idea how long they have been waiting.", author: "Tapas Pattanaik", cat: "Wellness" },
    { text: "What you feed your mind every morning shapes everything that happens by evening.", author: "Tapas Pattanaik", cat: "Habits" },
    { text: "Hope is not naive. It is the most courageous act available to a human being.", author: "Tapas Pattanaik", cat: "Motivation" },
    { text: "A SuperbMan does not pretend the hard days aren't hard. They just refuse to stay down.", author: "Tapas Pattanaik", cat: "Mindset" },
    { text: "The greatest gift you can give someone is to make them feel heard. It costs nothing. It changes everything.", author: "Tapas Pattanaik", cat: "Wellness" },
    { text: "Your mindset at work is your most important qualification.", author: "Tapas Pattanaik", cat: "Career" },
    { text: "You are not behind. You are on your timeline. And it is unfolding exactly as it should.", author: "Tapas Pattanaik", cat: "Student" },
    { text: "Small, consistent, deliberate thoughts. That is where transformation actually lives.", author: "Tapas Pattanaik", cat: "Habits" },
    { text: "Let your mind be the one thing in this world that you choose to treat well.", author: "Tapas Pattanaik", cat: "Wellness" },
    { text: "Every ripple starts somewhere. Let your positive thought be the stone that begins it.", author: "Tapas Pattanaik", cat: "Motivation" },
    { text: "Today is a fresh page. What is the first thought you will write on it?", author: "Tapas Pattanaik", cat: "Mindset" },
    { text: "Change does not announce itself. It arrives quietly, in the small thoughts you choose to keep.", author: "Tapas Pattanaik", cat: "Habits" },
    { text: "Be the person in the room who makes others feel like they matter. That is true leadership.", author: "Tapas Pattanaik", cat: "Career" },
    { text: "The world does not need more superheroes. It needs more people willing to be genuinely, imperfectly human.", author: "Tapas Pattanaik", cat: "Wellness" },
    { text: "Gandhi taught us three monkeys. I will add one more — think no evil. It is the hardest one. It is also the most important.", author: "Tapas Pattanaik", cat: "Mindset" },
    { text: "Let this be contagious — not the doubt, not the fear, but this: the quiet decision to keep going.", author: "Tapas Pattanaik", cat: "Motivation" }
  ];

  /* Current displayed quote index */
  var currentQuoteIdx = getDayOfYear() % QUOTES.length;

  /* ══════════════════════════════════════════
     NAVIGATION
  ══════════════════════════════════════════ */
  function initNav() {
    var nav    = document.querySelector('.nav');
    var burger = document.querySelector('.nav-burger');
    var mobile = document.querySelector('.nav-mobile');

    /* Scroll shadow */
    window.addEventListener('scroll', function () {
      nav.classList.toggle('scrolled', window.scrollY > 20);
    }, { passive: true });

    /* Burger toggle */
    if (burger && mobile) {
      burger.addEventListener('click', function () {
        burger.classList.toggle('open');
        mobile.classList.toggle('open');
      });
    }

    /* Nav link clicks (SPA routing) */
    document.querySelectorAll('[data-page]').forEach(function (el) {
      el.addEventListener('click', function () {
        showPage(el.getAttribute('data-page'));
        if (mobile && mobile.classList.contains('open')) {
          mobile.classList.remove('open');
          burger && burger.classList.remove('open');
        }
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    });
  }

  /* ══════════════════════════════════════════
     SPA PAGE ROUTING
  ══════════════════════════════════════════ */
  function showPage(id) {
    document.querySelectorAll('.page').forEach(function (p) { p.classList.remove('active'); });
    var target = document.getElementById('page-' + id);
    if (target) target.classList.add('active');

    /* Update active nav link */
    document.querySelectorAll('.nav-links a[data-page], .nav-mobile a[data-page]').forEach(function (a) {
      a.classList.toggle('active', a.getAttribute('data-page') === id);
    });

    /* Trigger quote rotation when daily-inspiration shown */
    if (id === 'daily') setFeaturedQuote(currentQuoteIdx);
    if (id === 'home')  setHeroQuote(currentQuoteIdx);
  }

  /* ══════════════════════════════════════════
     QUOTES
  ══════════════════════════════════════════ */
  function getDayOfYear() {
    var now = new Date();
    return Math.floor((now - new Date(now.getFullYear(), 0, 0)) / 86400000);
  }

  function setHeroQuote(idx) {
    var q   = QUOTES[idx];
    var txt = document.getElementById('hero-q-text');
    var aut = document.getElementById('hero-q-author');
    var cat = document.getElementById('hero-q-cat');
    if (txt) txt.textContent = '\u201C' + q.text + '\u201D';
    if (aut) aut.textContent = '\u2014 ' + q.author;
    if (cat) cat.textContent = q.cat;
  }

  function setFeaturedQuote(idx) {
    var q   = QUOTES[idx];
    var txt = document.getElementById('fq-text');
    var aut = document.getElementById('fq-author');
    var cat = document.getElementById('fq-cat');
    if (txt) txt.textContent = '\u201C' + q.text + '\u201D';
    if (aut) aut.textContent = '\u2014 ' + q.author;
    if (cat) cat.textContent = q.cat;
  }

  function nextQuote() {
    currentQuoteIdx = (currentQuoteIdx + 1) % QUOTES.length;
    setHeroQuote(currentQuoteIdx);
    var card = document.querySelector('.hero-card');
    if (card) { card.style.opacity = '0'; card.style.transform = 'translateY(8px)'; setTimeout(function () { card.style.transition = 'opacity 0.4s, transform 0.4s'; card.style.opacity = '1'; card.style.transform = 'translateY(0)'; }, 50); }
  }

  /* ══════════════════════════════════════════
     NEWSLETTER / FORMS
  ══════════════════════════════════════════ */
  function initForms() {
    /* All newsletter forms */
    document.querySelectorAll('.nl-form').forEach(function (form) {
      var input   = form.querySelector('input[type="email"]');
      var btn     = form.querySelector('.btn');
      var success = form.closest('.newsletter-band, .sidebar-widget, .submit-story, section')
                    && form.parentElement.querySelector('.nl-success');

      if (!btn || !input) return;

      btn.addEventListener('click', function () {
        if (!isValidEmail(input.value.trim())) { shakeEl(input); return; }
        form.style.display = 'none';
        var note = form.parentElement.querySelector('.nl-note');
        if (note) note.style.display = 'none';
        var succ = form.parentElement.querySelector('.nl-success');
        if (succ) { succ.style.display = 'block'; }
        console.log('Email:', input.value.trim()); /* TODO: wire to Brevo API */
      });

      input.addEventListener('keydown', function (e) { if (e.key === 'Enter') btn.click(); });
    });

    /* Contact form */
    var contactBtn = document.getElementById('contact-submit');
    if (contactBtn) {
      contactBtn.addEventListener('click', function () {
        var name  = document.getElementById('cf-name');
        var email = document.getElementById('cf-email');
        var msg   = document.getElementById('cf-message');
        if (!name.value.trim() || !isValidEmail(email.value.trim()) || !msg.value.trim()) {
          if (!name.value.trim())  shakeEl(name);
          if (!isValidEmail(email.value.trim())) shakeEl(email);
          if (!msg.value.trim())   shakeEl(msg);
          return;
        }
        var form = document.getElementById('contact-form-inner');
        var succ = document.getElementById('contact-success');
        if (form) form.style.display = 'none';
        if (succ) succ.style.display = 'block';
        console.log('Contact:', name.value.trim(), email.value.trim());
      });
    }
  }

  function isValidEmail(e) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e); }

  function shakeEl(el) {
    if (!el) return;
    el.style.transition = 'transform 0.08s';
    el.style.transform = 'translateX(-6px)';
    setTimeout(function () { el.style.transform = 'translateX(6px)'; },  80);
    setTimeout(function () { el.style.transform = 'translateX(-4px)'; }, 160);
    setTimeout(function () { el.style.transform = 'translateX(0)'; },    240);
    var oldBorder = el.style.borderColor;
    el.style.borderColor = '#E8A020';
    setTimeout(function () { el.style.borderColor = oldBorder; }, 1000);
  }

  /* ══════════════════════════════════════════
     SCROLL ANIMATIONS
  ══════════════════════════════════════════ */
  function initScrollAnimations() {
    if (!('IntersectionObserver' in window)) return;
    var els = document.querySelectorAll('.card, .pillar-card, .value-card, .spiritual-card, .affirmation-card, .resource-card, .contribution-card, .story-card, .video-card, .pt-card, .gita-card, .blog-post-card');
    var obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry, i) {
        if (entry.isIntersecting) {
          setTimeout(function () {
            entry.target.style.opacity   = '1';
            entry.target.style.transform = 'translateY(0)';
          }, (i % 4) * 80);
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });

    els.forEach(function (el) {
      el.style.opacity   = '0';
      el.style.transform = 'translateY(20px)';
      el.style.transition = 'opacity 0.55s ease, transform 0.55s ease';
      obs.observe(el);
    });
  }

  /* ══════════════════════════════════════════
     CATEGORY FILTER (Positive Thinking)
  ══════════════════════════════════════════ */
  function initCategoryFilter() {
    document.querySelectorAll('.category-nav .tag').forEach(function (tag) {
      tag.addEventListener('click', function () {
        document.querySelectorAll('.category-nav .tag').forEach(function (t) { t.classList.remove('active'); });
        tag.classList.add('active');
        var filter = tag.getAttribute('data-cat');
        document.querySelectorAll('.pt-card').forEach(function (card) {
          if (filter === 'all' || card.getAttribute('data-cat') === filter) {
            card.style.display = '';
          } else {
            card.style.display = 'none';
          }
        });
      });
    });
  }

  /* ══════════════════════════════════════════
     PHILOSOPHY TABS (Spiritual)
  ══════════════════════════════════════════ */
  function initPhilTabs() {
    document.querySelectorAll('.phil-tab').forEach(function (tab) {
      tab.addEventListener('click', function () {
        document.querySelectorAll('.phil-tab').forEach(function (t) { t.classList.remove('active'); });
        tab.classList.add('active');
        var show = tab.getAttribute('data-phil');
        document.querySelectorAll('.spiritual-card').forEach(function (card) {
          if (show === 'all' || card.getAttribute('data-phil') === show) {
            card.style.display = '';
          } else {
            card.style.display = 'none';
          }
        });
      });
    });
  }

  /* ══════════════════════════════════════════
     INIT
  ══════════════════════════════════════════ */
  document.addEventListener('DOMContentLoaded', function () {
    initNav();
    showPage('home');
    setHeroQuote(currentQuoteIdx);

    /* Expose nextQuote globally for button onclick */
    window.nextQuote = nextQuote;

    initForms();
    initScrollAnimations();
    initCategoryFilter();
    initPhilTabs();

    /* Ripple background animation already CSS-driven */
  });

})();
