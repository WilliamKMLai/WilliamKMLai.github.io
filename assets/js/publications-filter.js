(function () {
  'use strict';

  if (window.__laiPubsFilterInitialized) return;
  window.__laiPubsFilterInitialized = true;

  function copyTextToClipboard(text) {
    if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
      return navigator.clipboard.writeText(text);
    }
    return new Promise(function (resolve, reject) {
      try {
        var ta = document.createElement('textarea');
        ta.value = text;
        ta.setAttribute('readonly', '');
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
        resolve();
      } catch (err) {
        reject(err);
      }
    });
  }

  document.addEventListener('click', function (event) {
    var toggleBtn = event.target.closest('.bibtex-toggle');
    if (toggleBtn) {
      var drawerId = toggleBtn.getAttribute('aria-controls');
      var drawer = drawerId ? document.getElementById(drawerId) : null;
      if (!drawer) {
        var parentItem = toggleBtn.closest('.pub-item');
        drawer = parentItem ? parentItem.querySelector('.bibtex-drawer') : null;
      }
      if (drawer) {
        var willOpen = drawer.hasAttribute('hidden');
        if (willOpen) {
          drawer.removeAttribute('hidden');
        } else {
          drawer.setAttribute('hidden', '');
        }
        toggleBtn.setAttribute('aria-expanded', willOpen ? 'true' : 'false');
      }
      return;
    }

    var copyBtn = event.target.closest('.bibtex-copy-btn');
    if (copyBtn) {
      var bibDrawer = copyBtn.closest('.bibtex-drawer');
      var codeEl = bibDrawer ? bibDrawer.querySelector('code') : null;
      if (!codeEl) return;

      var originalLabel = copyBtn.getAttribute('data-original-label') || copyBtn.textContent;
      copyBtn.setAttribute('data-original-label', originalLabel);

      copyTextToClipboard(codeEl.textContent.trim()).then(function () {
        copyBtn.textContent = 'Copied!';
        window.setTimeout(function () {
          copyBtn.textContent = originalLabel;
        }, 1800);
      }).catch(function () {
        copyBtn.textContent = 'Copy failed';
        window.setTimeout(function () {
          copyBtn.textContent = originalLabel;
        }, 1800);
      });
    }
  });

  function initPublicationsFilter() {
    var resultsRoot = document.getElementById('pub-results');
    if (!resultsRoot) return;

    var searchInput = document.getElementById('pub-search');
    var typeSelect = document.getElementById('pub-type');
    var thrustSelect = document.getElementById('pub-thrust');
    var roleCheckbox = document.getElementById('pub-role-only');
    var resetBtn = document.getElementById('pub-reset');
    var emptyResetBtn = document.getElementById('pub-empty-reset');
    var countEl = document.getElementById('pub-count');
    var emptyState = document.getElementById('pub-empty-state');

    var yearGroups = Array.prototype.slice.call(resultsRoot.querySelectorAll('.pub-year-group'));
    var items = Array.prototype.slice.call(resultsRoot.querySelectorAll('.pub-item'));
    var totalCount = items.length;
    var activeToolFilter = '';

    var itemRecords = items.map(function (el) {
      var titleText = (el.querySelector('.pub-title') || {}).textContent || '';
      var authorsText = (el.querySelector('.pub-authors') || {}).textContent || '';
      var venueText = (el.querySelector('.pub-venue-line') || {}).textContent || '';
      var badgesText = (el.querySelector('.pub-badges') || {}).textContent || '';
      var bibs = el.querySelector('.bibtex-drawer code');
      var doiMatch = bibs ? bibs.textContent : '';
      var year = el.getAttribute('data-year') || '';
      var type = (el.getAttribute('data-type') || '').toLowerCase();
      var role = (el.getAttribute('data-role') || '').toLowerCase();
      var thrustsRaw = el.getAttribute('data-thrusts') || '';
      var toolsRaw = el.getAttribute('data-tools') || '';

      var thrusts = thrustsRaw ? thrustsRaw.toLowerCase().split(',').filter(Boolean) : [];
      var tools = toolsRaw ? toolsRaw.toLowerCase().split(',').filter(Boolean) : [];

      var searchBlob = [
        titleText,
        authorsText,
        venueText,
        badgesText,
        doiMatch,
        year,
        type,
        thrusts.join(' '),
        tools.join(' ')
      ].join(' ').toLowerCase();

      return {
        el: el,
        year: year,
        type: type,
        role: role,
        thrusts: thrusts,
        tools: tools,
        searchBlob: searchBlob
      };
    });

    function syncUrlParams(q, typeVal, thrustVal, leadOnly, toolVal) {
      if (!window.history || typeof window.history.replaceState !== 'function') return;
      var params = new URLSearchParams();
      if (q) params.set('q', q);
      if (typeVal && typeVal !== 'all') params.set('type', typeVal);
      if (thrustVal && thrustVal !== 'all') params.set('thrust', thrustVal);
      if (leadOnly) params.set('role', 'lead');
      if (toolVal) params.set('tool', toolVal);

      var queryString = params.toString();
      var newUrl = window.location.pathname + (queryString ? '?' + queryString : '') + window.location.hash;
      window.history.replaceState(null, '', newUrl);
    }

    function applyFilters(updateUrl) {
      var rawQuery = searchInput ? searchInput.value.trim() : '';
      var tokens = rawQuery ? rawQuery.toLowerCase().split(/\s+/).filter(Boolean) : [];
      var typeVal = typeSelect ? typeSelect.value.toLowerCase() : 'all';
      var thrustVal = thrustSelect ? thrustSelect.value.toLowerCase() : 'all';
      var leadOnly = roleCheckbox ? roleCheckbox.checked : false;

      var visibleCount = 0;

      itemRecords.forEach(function (rec) {
        var matchesType = (typeVal === 'all') || (rec.type === typeVal);
        var matchesThrust = (thrustVal === 'all') || (rec.thrusts.indexOf(thrustVal) !== -1);
        var matchesRole = !leadOnly || (rec.role === 'first' || rec.role === 'co-first' || rec.role === 'senior' || rec.role === 'co-senior');
        var matchesTool = !activeToolFilter || (rec.tools.indexOf(activeToolFilter) !== -1);
        var matchesQuery = tokens.length === 0 || tokens.every(function (tok) {
          return rec.searchBlob.indexOf(tok) !== -1;
        });

        var isVisible = matchesType && matchesThrust && matchesRole && matchesTool && matchesQuery;
        if (isVisible) {
          rec.el.removeAttribute('hidden');
          visibleCount += 1;
        } else {
          rec.el.setAttribute('hidden', '');
        }
      });

      yearGroups.forEach(function (group) {
        var hasVisibleItem = group.querySelector('.pub-item:not([hidden])') !== null;
        if (hasVisibleItem) {
          group.removeAttribute('hidden');
        } else {
          group.setAttribute('hidden', '');
        }
      });

      if (countEl) {
        countEl.textContent = 'Showing ' + visibleCount + ' of ' + totalCount + ' works';
      }

      if (emptyState) {
        if (visibleCount === 0) {
          emptyState.removeAttribute('hidden');
        } else {
          emptyState.setAttribute('hidden', '');
        }
      }

      if (updateUrl) {
        syncUrlParams(rawQuery, typeVal, thrustVal, leadOnly, activeToolFilter);
      }
    }

    function hydrateFromUrl() {
      var params = new URLSearchParams(window.location.search);
      var qParam = params.get('q');
      var typeParam = (params.get('type') || '').toLowerCase();
      var thrustParam = (params.get('thrust') || '').toLowerCase();
      var roleParam = (params.get('role') || '').toLowerCase();
      var toolParam = (params.get('tool') || '').toLowerCase();

      if (qParam && searchInput) {
        searchInput.value = qParam;
      }

      if (typeParam && typeSelect) {
        var validTypes = ['all', 'journal', 'preprint', 'conference'];
        if (validTypes.indexOf(typeParam) !== -1) {
          typeSelect.value = typeParam;
        }
      }

      if (thrustParam && thrustSelect) {
        if (thrustParam === 'xai-grn') {
          thrustParam = 'bioinformatics';
        }
        var validThrusts = ['all', 'chromatin', 'bioinformatics', 'structural-ai', 'fair-gateways'];
        if (validThrusts.indexOf(thrustParam) !== -1) {
          thrustSelect.value = thrustParam;
        }
      }

      if (roleCheckbox && (roleParam === 'lead' || roleParam === 'first-senior' || roleParam === 'true' || roleParam === '1')) {
        roleCheckbox.checked = true;
      }

      if (toolParam) {
        activeToolFilter = toolParam;
      }

      applyFilters(false);
    }

    function resetFilters() {
      if (searchInput) searchInput.value = '';
      if (typeSelect) typeSelect.value = 'all';
      if (thrustSelect) thrustSelect.value = 'all';
      if (roleCheckbox) roleCheckbox.checked = false;
      activeToolFilter = '';
      applyFilters(true);
    }

    if (searchInput) {
      searchInput.addEventListener('input', function () {
        applyFilters(true);
      });
    }
    if (typeSelect) {
      typeSelect.addEventListener('change', function () {
        applyFilters(true);
      });
    }
    if (thrustSelect) {
      thrustSelect.addEventListener('change', function () {
        applyFilters(true);
      });
    }
    if (roleCheckbox) {
      roleCheckbox.addEventListener('change', function () {
        applyFilters(true);
      });
    }
    if (resetBtn) {
      resetBtn.addEventListener('click', resetFilters);
    }
    if (emptyResetBtn) {
      emptyResetBtn.addEventListener('click', resetFilters);
    }

    hydrateFromUrl();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initPublicationsFilter);
  } else {
    initPublicationsFilter();
  }
})();
