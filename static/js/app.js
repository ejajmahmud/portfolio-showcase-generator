/**
 * Portfolio Showcase Studio — Client Application
 * Handles theme toggling, multi-device preview, generation triggers,
 * search filtering, and paginated gallery browsing.
 */

document.addEventListener('DOMContentLoaded', () => {
  // Theme Toggle Elements & Setup
  const themeToggle = document.getElementById('theme-toggle');

  function getPreferredTheme() {
    const saved = localStorage.getItem('portfolio-showcase-theme');
    if (saved === 'light' || saved === 'dark') return saved;
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
  }

  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('portfolio-showcase-theme', theme);
  }

  // Initialize theme
  applyTheme(getPreferredTheme());

  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const current = document.documentElement.getAttribute('data-theme') || 'dark';
      const next = current === 'dark' ? 'light' : 'dark';
      applyTheme(next);
    });
  }

  // Form & Inputs
  const form = document.getElementById('generator-form');
  const urlInput = document.getElementById('site-url');
  const nameInput = document.getElementById('project-name');
  const categorySelect = document.getElementById('project-category');
  const typeSelect = document.getElementById('project-type');
  const mobileFinishSelect = document.getElementById('mobile-finish');
  const tabletFinishSelect = document.getElementById('tablet-finish');
  const bgColorSelect = document.getElementById('bg-color');
  const shadowSelect = document.getElementById('shadow-intensity');
  const delaySelect = document.getElementById('capture-delay');
  const browserModeSelect = document.getElementById('browser-mode');
  const generateBtn = document.getElementById('generate-btn');

  // Options Accordion
  const optionsToggle = document.getElementById('options-toggle');
  const optionsAccordion = optionsToggle ? optionsToggle.closest('.options-accordion') : null;

  if (optionsToggle && optionsAccordion) {
    optionsToggle.addEventListener('click', () => {
      optionsAccordion.classList.toggle('open');
    });
  }

  // Progress Tracking Elements
  const progressContainer = document.getElementById('progress-container');
  const progressBarFill = document.getElementById('progress-bar-fill');
  const progressMessage = document.getElementById('progress-message');
  const stepPills = {
    desk: document.getElementById('step-desk'),
    mob: document.getElementById('step-mob'),
    tab: document.getElementById('step-tab'),
    frame: document.getElementById('step-frame'),
    comp: document.getElementById('step-comp'),
    exp: document.getElementById('step-exp')
  };

  // Results Elements
  const resultsCard = document.getElementById('results-card');
  const resultTitle = document.getElementById('result-title');
  const resultUrl = document.getElementById('result-url');
  const resultCategoryBadge = document.getElementById('result-category-badge');
  const resultTypeBadge = document.getElementById('result-type-badge');
  const previewStage = document.getElementById('preview-stage');
  const previewImage = document.getElementById('preview-image');
  const toggleBgBtn = document.getElementById('toggle-bg-btn');
  const openFullBtn = document.getElementById('open-full-btn');

  // Download Elements
  const btnDlWebp = document.getElementById('btn-dl-webp');
  const btnDlPng = document.getElementById('btn-dl-png');
  const btnDlJpg = document.getElementById('btn-dl-jpg');
  const btnDlZip = document.getElementById('btn-dl-zip');

  // View Switcher Tabs
  const tabBtns = document.querySelectorAll('.tab-btn');

  // History, Search & Pagination Elements
  const historyGrid = document.getElementById('history-grid');
  const historyCount = document.getElementById('history-count');
  const searchInput = document.getElementById('history-search-input');
  const searchClearBtn = document.getElementById('search-clear-btn');
  const paginationBar = document.getElementById('pagination-bar');
  const paginationInfo = document.getElementById('pagination-info');
  const prevPageBtn = document.getElementById('prev-page-btn');
  const nextPageBtn = document.getElementById('next-page-btn');
  const pageNumbers = document.getElementById('page-numbers');

  // State
  let currentExports = null;
  let activeView = 'showcase';
  let allHistory = [];
  let filteredHistory = [];
  let currentPage = 1;
  const ITEMS_PER_PAGE = 8;

  // Toggle Preview Checkerboard (Transparency)
  if (toggleBgBtn && previewStage) {
    toggleBgBtn.addEventListener('click', () => {
      previewStage.classList.toggle('checkerboard');
    });
  }

  // Switch Preview Tabs (Showcase vs Mobile vs Tablet vs Desktop)
  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      tabBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeView = btn.dataset.view;
      updatePreviewView();
    });
  });

  function updatePreviewView() {
    if (!currentExports) return;

    let src = '';
    if (activeView === 'showcase') {
      src = currentExports.showcase_png || currentExports.showcase_webp;
    } else if (activeView === 'mobile') {
      src = currentExports.mobile_png || currentExports.mobile_webp;
    } else if (activeView === 'tablet') {
      src = currentExports.tablet_png || currentExports.tablet_webp;
    } else if (activeView === 'desktop') {
      src = currentExports.desktop_png || currentExports.desktop_webp;
    }

    if (src && previewImage) {
      previewImage.src = src;
      if (openFullBtn) openFullBtn.href = src;
    }
  }

  // Handle Form Submission
  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      let rawUrl = urlInput.value.trim();
      if (!rawUrl) return;

      if (!rawUrl.startsWith('http://') && !rawUrl.startsWith('https://')) {
        rawUrl = 'https://' + rawUrl;
        urlInput.value = rawUrl;
      }

      // Disable button & show progress tracker
      generateBtn.disabled = true;
      const btnText = generateBtn.querySelector('.btn-text');
      if (btnText) btnText.textContent = 'Generating Showcase...';
      if (progressContainer) progressContainer.classList.remove('hidden');
      if (resultsCard) resultsCard.classList.add('hidden');

      resetStepPills();
      updateProgress(15, 'Accessing website and capturing desktop view...', 'desk');

      // Periodic progress status updates while automated pipeline runs
      const stepInterval = setInterval(() => {
        const currentWidth = parseInt(progressBarFill.style.width || '15', 10);
        if (currentWidth < 35) {
          updateProgress(35, 'Capturing responsive smartphone viewport...', 'mob');
        } else if (currentWidth < 55) {
          updateProgress(55, 'Capturing tablet viewport...', 'tab');
        } else if (currentWidth < 75) {
          updateProgress(75, 'Framing high-resolution device models...', 'frame');
        } else if (currentWidth < 90) {
          updateProgress(90, 'Compositing multi-device layout & elevation shadows...', 'comp');
        }
      }, 3500);

      try {
        const payload = {
          url: rawUrl,
          name: nameInput.value.trim() || null,
          category: categorySelect ? categorySelect.value : null,
          type: typeSelect ? typeSelect.value : null,
          mobile_finish: mobileFinishSelect ? mobileFinishSelect.value : 'deep-blue',
          tablet_finish: tabletFinishSelect ? tabletFinishSelect.value : 'space-black',
          bg_color: bgColorSelect ? bgColorSelect.value : '#E5E5E5',
          shadow_intensity: shadowSelect ? shadowSelect.value : 'normal',
          delay: delaySelect ? parseFloat(delaySelect.value) : 2.0,
          headless: browserModeSelect ? (browserModeSelect.value === 'headless') : true
        };

        const response = await fetch('/api/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        clearInterval(stepInterval);

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ detail: 'Generation failed' }));
          throw new Error(errorData.detail || 'An unexpected error occurred during generation');
        }

        const data = await response.json();
        updateProgress(100, 'Showcase completed!', 'exp');

        // Populate and display result
        setTimeout(() => {
          if (progressContainer) progressContainer.classList.add('hidden');
          displayResult(data);
          loadHistory();
        }, 500);

      } catch (err) {
        clearInterval(stepInterval);
        if (progressMessage) progressMessage.textContent = `Error: ${err.message}`;
        if (progressBarFill) progressBarFill.style.background = '#ef4444';
        alert(`Generation failed: ${err.message}`);
      } finally {
        generateBtn.disabled = false;
        if (btnText) btnText.textContent = 'Generate Portfolio Showcase';
      }
    });
  }

  function resetStepPills() {
    Object.values(stepPills).forEach(pill => {
      if (pill) pill.className = 'step-pill';
    });
  }

  function updateProgress(percent, msg, activeStep) {
    if (progressBarFill) {
      progressBarFill.style.width = `${percent}%`;
      progressBarFill.style.background = 'linear-gradient(90deg, #2563eb, #10b981)';
    }
    if (progressMessage) progressMessage.textContent = msg;

    const stepOrder = ['desk', 'mob', 'tab', 'frame', 'comp', 'exp'];
    const activeIdx = stepOrder.indexOf(activeStep);

    stepOrder.forEach((step, idx) => {
      const pill = stepPills[step];
      if (!pill) return;
      if (idx < activeIdx) {
        pill.className = 'step-pill done';
      } else if (idx === activeIdx) {
        pill.className = 'step-pill active';
      } else {
        pill.className = 'step-pill';
      }
    });
  }

  function displayResult(data) {
    currentExports = data.exports;
    if (resultTitle) resultTitle.textContent = data.title;
    if (resultUrl) resultUrl.textContent = data.url;

    // Optional Category & Type Badges
    if (data.category && resultCategoryBadge) {
      resultCategoryBadge.textContent = data.category;
      resultCategoryBadge.classList.remove('hidden');
    } else if (resultCategoryBadge) {
      resultCategoryBadge.classList.add('hidden');
    }

    if (data.type && resultTypeBadge) {
      resultTypeBadge.textContent = data.type;
      resultTypeBadge.classList.remove('hidden');
    } else if (resultTypeBadge) {
      resultTypeBadge.classList.add('hidden');
    }

    // Reset tabs to showcase
    tabBtns.forEach(b => b.classList.remove('active'));
    const defaultTab = document.querySelector('.tab-btn[data-view="showcase"]');
    if (defaultTab) defaultTab.classList.add('active');
    activeView = 'showcase';

    updatePreviewView();

    // Set download URLs
    if (btnDlWebp) btnDlWebp.href = data.exports.showcase_webp;
    if (btnDlPng) btnDlPng.href = data.exports.showcase_png;
    if (btnDlJpg) btnDlJpg.href = data.exports.showcase_jpg;
    if (btnDlZip) btnDlZip.href = data.exports.zip;

    if (resultsCard) {
      resultsCard.classList.remove('hidden');
      resultsCard.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  // -------------------------------------------------------------------------
  // Search & Pagination Logic
  // -------------------------------------------------------------------------
  function filterHistory() {
    const query = (searchInput ? searchInput.value : '').trim().toLowerCase();

    if (searchClearBtn) {
      if (query.length > 0) {
        searchClearBtn.classList.remove('hidden');
      } else {
        searchClearBtn.classList.add('hidden');
      }
    }

    if (!query) {
      filteredHistory = [...allHistory];
    } else {
      filteredHistory = allHistory.filter(item => {
        const title = (item.title || '').toLowerCase();
        const url = (item.url || '').toLowerCase();
        const cat = (item.category || '').toLowerCase();
        const type = (item.type || '').toLowerCase();
        const slug = (item.slug || '').toLowerCase();
        return title.includes(query) || url.includes(query) || cat.includes(query) || type.includes(query) || slug.includes(query);
      });
    }

    currentPage = 1;
    renderHistory();
  }

  function renderHistory() {
    if (!historyGrid) return;

    const totalItems = filteredHistory.length;
    const totalPages = Math.max(1, Math.ceil(totalItems / ITEMS_PER_PAGE));

    if (currentPage > totalPages) currentPage = totalPages;
    if (currentPage < 1) currentPage = 1;

    if (historyCount) {
      historyCount.textContent = `${totalItems} item${totalItems === 1 ? '' : 's'}`;
    }

    if (totalItems === 0) {
      if (paginationBar) paginationBar.classList.add('hidden');
      const query = (searchInput ? searchInput.value : '').trim();
      if (query) {
        historyGrid.innerHTML = `
          <div class="empty-history">
            No showcases found matching "<strong>${escapeHtml(query)}</strong>". Try another keyword or clear search.
          </div>
        `;
      } else {
        historyGrid.innerHTML = `
          <div class="empty-history">No showcases generated yet. Enter a website URL above to create your first portfolio asset.</div>
        `;
      }
      return;
    }

    // Determine slice for current page
    const startIdx = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIdx = Math.min(startIdx + ITEMS_PER_PAGE, totalItems);
    const pageItems = filteredHistory.slice(startIdx, endIdx);

    // Render cards
    historyGrid.innerHTML = pageItems.map(item => `
      <div class="history-card-item" data-slug="${escapeHtml(item.slug)}">
        <div class="history-thumb">
          <img src="${item.exports.showcase_webp || item.exports.showcase_png}" alt="${escapeHtml(item.title)}" loading="lazy" />
        </div>
        <div class="history-meta">
          <div class="history-title" title="${escapeHtml(item.title)}">${escapeHtml(item.title)}</div>
          <div class="history-url" title="${escapeHtml(item.url)}">${escapeHtml(item.url)}</div>
          ${(item.category || item.type) ? `
            <div class="history-tags">
              ${item.category ? `<span class="badge-tag">${escapeHtml(item.category)}</span>` : ''}
              ${item.type ? `<span class="badge-tag accent">${escapeHtml(item.type)}</span>` : ''}
            </div>
          ` : ''}
        </div>
      </div>
    `).join('');

    // Attach click events
    historyGrid.querySelectorAll('.history-card-item').forEach(el => {
      el.addEventListener('click', () => {
        const slug = el.dataset.slug;
        const found = allHistory.find(h => h.slug === slug);
        if (found) {
          displayResult(found);
        }
      });
    });

    // Render Pagination Controls
    if (totalItems > ITEMS_PER_PAGE) {
      if (paginationBar) paginationBar.classList.remove('hidden');
      if (paginationInfo) paginationInfo.textContent = `Showing ${startIdx + 1}–${endIdx} of ${totalItems} projects`;

      if (prevPageBtn) prevPageBtn.disabled = (currentPage === 1);
      if (nextPageBtn) nextPageBtn.disabled = (currentPage === totalPages);

      if (pageNumbers) {
        let pagesHtml = '';
        for (let p = 1; p <= totalPages; p++) {
          pagesHtml += `<button class="page-num-btn ${p === currentPage ? 'active' : ''}" data-page="${p}">${p}</button>`;
        }
        pageNumbers.innerHTML = pagesHtml;

        pageNumbers.querySelectorAll('.page-num-btn').forEach(btn => {
          btn.addEventListener('click', () => {
            const p = parseInt(btn.dataset.page, 10);
            if (p !== currentPage) {
              currentPage = p;
              renderHistory();
              const historyCard = document.querySelector('.history-card');
              if (historyCard) {
                historyCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
              }
            }
          });
        });
      }
    } else {
      if (paginationBar) paginationBar.classList.add('hidden');
    }
  }

  // Prev / Next Page Listeners
  if (prevPageBtn) {
    prevPageBtn.addEventListener('click', () => {
      if (currentPage > 1) {
        currentPage--;
        renderHistory();
      }
    });
  }

  if (nextPageBtn) {
    nextPageBtn.addEventListener('click', () => {
      const totalPages = Math.ceil(filteredHistory.length / ITEMS_PER_PAGE);
      if (currentPage < totalPages) {
        currentPage++;
        renderHistory();
      }
    });
  }

  // Live Search Listener
  if (searchInput) {
    searchInput.addEventListener('input', () => {
      filterHistory();
    });
  }

  // Clear Search Listener
  if (searchClearBtn) {
    searchClearBtn.addEventListener('click', () => {
      searchInput.value = '';
      filterHistory();
      searchInput.focus();
    });
  }

  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  // History Loader
  async function loadHistory() {
    try {
      const resp = await fetch('/api/history');
      if (!resp.ok) return;
      const history = await resp.json();
      allHistory = Array.isArray(history) ? history : [];
      filteredHistory = [...allHistory];
      currentPage = 1;
      renderHistory();

      // If results are not showing, auto-display the most recent item as a preview
      if (allHistory.length > 0 && resultsCard && resultsCard.classList.contains('hidden')) {
        displayResult(allHistory[0]);
      }
    } catch (e) {
      console.error('Failed to load project history:', e);
    }
  }

  // Load history on boot
  loadHistory();
});
