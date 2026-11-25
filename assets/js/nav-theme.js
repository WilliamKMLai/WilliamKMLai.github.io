(function () {
  'use strict';

  var root = document.documentElement;
  var themeToggle = document.getElementById('theme-toggle');
  var navToggle = document.querySelector('.nav-toggle');
  var primaryNav = document.getElementById('primary-nav');

  function getActiveTheme() {
    return root.dataset.theme === 'dark' ? 'dark' : 'light';
  }

  function applyTheme(theme, persist) {
    root.dataset.theme = theme;
    if (themeToggle) {
      var isDark = theme === 'dark';
      themeToggle.setAttribute('aria-pressed', isDark ? 'true' : 'false');
      themeToggle.setAttribute('aria-label', isDark ? 'Switch to light mode' : 'Switch to dark mode');
      themeToggle.setAttribute('title', isDark ? 'Switch to light mode' : 'Switch to dark mode');
    }
    if (persist) {
      try {
        localStorage.setItem('theme', theme);
      } catch (e) {
        // Ignore storage errors in private browsing modes
      }
    }
  }

  applyTheme(getActiveTheme(), false);

  if (themeToggle) {
    themeToggle.addEventListener('click', function () {
      var nextTheme = getActiveTheme() === 'dark' ? 'light' : 'dark';
      applyTheme(nextTheme, true);
    });
  }

  if (window.matchMedia) {
    var mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    var handleSystemChange = function (e) {
      try {
        var stored = localStorage.getItem('theme');
        if (stored !== 'dark' && stored !== 'light') {
          applyTheme(e.matches ? 'dark' : 'light', false);
        }
      } catch (err) {
        applyTheme(e.matches ? 'dark' : 'light', false);
      }
    };
    if (typeof mediaQuery.addEventListener === 'function') {
      mediaQuery.addEventListener('change', handleSystemChange);
    } else if (typeof mediaQuery.addListener === 'function') {
      mediaQuery.addListener(handleSystemChange);
    }
  }

  function closeNav() {
    if (!navToggle || !primaryNav) return;
    navToggle.setAttribute('aria-expanded', 'false');
    primaryNav.classList.remove('is-open');
  }

  if (navToggle && primaryNav) {
    navToggle.addEventListener('click', function () {
      var expanded = navToggle.getAttribute('aria-expanded') === 'true';
      var next = !expanded;
      navToggle.setAttribute('aria-expanded', next ? 'true' : 'false');
      primaryNav.classList.toggle('is-open', next);
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && navToggle.getAttribute('aria-expanded') === 'true') {
        closeNav();
        navToggle.focus();
      }
    });

    document.addEventListener('click', function (e) {
      if (
        navToggle.getAttribute('aria-expanded') === 'true' &&
        !primaryNav.contains(e.target) &&
        !navToggle.contains(e.target)
      ) {
        closeNav();
      }
    });

    window.addEventListener('resize', function () {
      if (window.innerWidth >= 960 && navToggle.getAttribute('aria-expanded') === 'true') {
        closeNav();
      }
    });
  }
})();
