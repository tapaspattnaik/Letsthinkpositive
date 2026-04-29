/* =============================================
   letsthinkpositive.com — Main JavaScript
   ============================================= */

(function () {
  "use strict";

  /* ── Rotating Daily Quotes ─────────────────────
     Cycles through quotes on each page load.
     Replace / extend the quotes array freely.
  ─────────────────────────────────────────────── */
  var quotes = [
    {
      text: "The root of every action is a thought. Tend to your roots.",
      author: "Tapas Pattanaik"
    },
    {
      text: "You don't need a cape to change the world. You just need to change one thought.",
      author: "Tapas Pattanaik"
    },
    {
      text: "You cannot control the storm. But you can control how you stand in it.",
      author: "Tapas Pattanaik"
    },
    {
      text: "Positivity is not pretending everything is fine. It is deciding that you are strong enough to face what is not.",
      author: "Tapas Pattanaik"
    },
    {
      text: "The first step to a better day is not a new plan. It is a new thought.",
      author: "Tapas Pattanaik"
    },
    {
      text: "Be the ear someone needs today. You have no idea how long they have been waiting.",
      author: "Tapas Pattanaik"
    },
    {
      text: "What you feed your mind every morning shapes everything that happens by evening.",
      author: "Tapas Pattanaik"
    },
    {
      text: "Hope is not naive. It is the most courageous act available to a human being.",
      author: "Tapas Pattanaik"
    },
    {
      text: "Today is a fresh page. What is the first thought you will write on it?",
      author: "Tapas Pattanaik"
    },
    {
      text: "Every ripple starts somewhere. Let your positive thought be the stone that begins it.",
      author: "Tapas Pattanaik"
    }
  ];

  function rotateDailyQuote() {
    var textEl   = document.querySelector(".quote-text");
    var authorEl = document.querySelector(".quote-author");
    if (!textEl || !authorEl) return;

    /* Pick a quote based on the day of year so it feels "daily" */
    var dayOfYear = getDayOfYear();
    var q = quotes[dayOfYear % quotes.length];

    textEl.textContent   = "\u201C" + q.text + "\u201D";
    authorEl.textContent = "\u2014 " + q.author;
  }

  function getDayOfYear() {
    var now   = new Date();
    var start = new Date(now.getFullYear(), 0, 0);
    var diff  = now - start;
    var oneDay = 1000 * 60 * 60 * 24;
    return Math.floor(diff / oneDay);
  }

  /* ── Email Notify Form ──────────────────────────
     Validates the email input and shows a warm
     thank-you message. Wire up to your real
     backend / Brevo API as needed.
  ─────────────────────────────────────────────── */
  function initNotifyForm() {
    var formRow     = document.querySelector(".form-row");
    var input       = document.querySelector(".form-row input[type='email']");
    var btn         = document.querySelector(".btn");
    var noteEl      = document.querySelector(".form-note");
    var successEl   = document.querySelector(".form-success");

    if (!btn || !input) return;

    btn.addEventListener("click", function (e) {
      e.preventDefault();
      var email = input.value.trim();

      if (!isValidEmail(email)) {
        shakeEl(input);
        input.focus();
        return;
      }

      /* ── SUCCESS STATE ── */
      if (formRow)   formRow.style.display   = "none";
      if (noteEl)    noteEl.style.display    = "none";
      if (successEl) {
        successEl.style.display = "block";
        successEl.textContent   =
          "✓ You're on the list. One good thought is on its way to you soon.";
      }

      /* TODO: replace with your real API call, e.g.:
         fetch("https://api.brevo.com/v3/contacts", { ... })
      */
      console.log("Email captured:", email);
    });
  }

  function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  function shakeEl(el) {
    el.style.transition = "transform 0.1s";
    el.style.transform  = "translateX(-6px)";
    setTimeout(function () { el.style.transform = "translateX(6px)"; }, 100);
    setTimeout(function () { el.style.transform = "translateX(-4px)"; }, 200);
    setTimeout(function () { el.style.transform = "translateX(0)";    }, 300);
    el.style.borderColor = "#E8A020";
    setTimeout(function () { el.style.borderColor = ""; }, 800);
  }

  /* ── Pillar Stagger on Scroll ───────────────────
     Adds a subtle entrance animation when pillars
     scroll into view on smaller screens.
  ─────────────────────────────────────────────── */
  function initPillarObserver() {
    var pillars = document.querySelectorAll(".pillar");
    if (!pillars.length || !("IntersectionObserver" in window)) return;

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry, i) {
        if (entry.isIntersecting) {
          setTimeout(function () {
            entry.target.style.opacity   = "1";
            entry.target.style.transform = "translateY(0)";
          }, i * 80);
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.2 });

    pillars.forEach(function (p) {
      p.style.opacity    = "0";
      p.style.transform  = "translateY(16px)";
      p.style.transition = "opacity 0.5s ease, transform 0.5s ease";
      observer.observe(p);
    });
  }

  /* ── Allow Enter key in email input ── */
  function initEnterKey() {
    var input = document.querySelector(".form-row input[type='email']");
    var btn   = document.querySelector(".btn");
    if (!input || !btn) return;
    input.addEventListener("keydown", function (e) {
      if (e.key === "Enter") btn.click();
    });
  }

  /* ── Init ── */
  document.addEventListener("DOMContentLoaded", function () {
    rotateDailyQuote();
    initNotifyForm();
    initPillarObserver();
    initEnterKey();
  });

})();
