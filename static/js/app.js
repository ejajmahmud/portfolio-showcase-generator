document.addEventListener('DOMContentLoaded', () => {
  // Elements
  const form = document.getElementById('generator-form');
  const urlInput = document.getElementById('site-url');
  const nameInput = document.getElementById('project-name');
  const mobileFinishSelect = document.getElementById('mobile-finish');
  const tabletFinishSelect = document.getElementById('tablet-finish');
  const bgColorSelect = document.getElementById('bg-color');
  const shadowSelect = document.getElementById('shadow-intensity');
  const delaySelect = document.getElementById('capture-delay');
  const browserModeSelect = document.getElementById('browser-mode');
  const generateBtn = document.getElementById('generate-btn');

  // Accordion
  const optionsToggle = document.getElementById('options-toggle');
  const optionsAccordion = optionsToggle.closest('.options-accordion');

  // Progress
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

  // Results
  const resultsCard = document.getElementById('results-card');
  const resultTitle = document.getElementById('result-title');
  const resultUrl = document.getElementById('result-url');
  const previewStage = document.getElementById('preview-stage');
  const previewImage = document.getElementById('preview-image');
  const toggleBgBtn = document.getElementById('toggle-bg-btn');
  const openFullBtn = document.getElementById('open-full-btn');

  // Download buttons
  const btnDlWebp = document.getElementById('btn-dl-webp');
  const btnDlPng = document.getElementById('btn-dl-png');
  const btnDlJpg = document.getElementById('btn-dl-jpg');
  const btnDlZip = document.getElementById('btn-dl-zip');

  // Tabs
  const tabBtns = document.querySelectorAll('.tab-btn');

  // History
  const historyGrid = document.getElementById('history-grid');
  const historyCount = document.getElementById('history-count');

  let currentExports = null;
  let activeView = 'showcase';

  // Toggle Accordion
  optionsToggle.addEventListener('click', () => {
    optionsAccordion.classList.toggle('open');
  });

  // Toggle Preview Background (White vs Transparent Checkerboard)
  toggleBgBtn.addEventListener('click', () => {
    previewStage.classList.toggle('checkerboard');
  });

  // Switch Preview Tabs (Showcase vs iPhone vs Tablet vs Desktop)
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

    if (src) {
      previewImage.src = src;
      openFullBtn.href = src;
    }
  }

  // Handle Form Submission
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    let rawUrl = urlInput.value.trim();
    if (!rawUrl) return;

    if (!rawUrl.startsWith('http://') && !rawUrl.startsWith('https://')) {
      rawUrl = 'https://' + rawUrl;
      urlInput.value = rawUrl;
    }

    // Disable button & show progress
    generateBtn.disabled = true;
    generateBtn.querySelector('.btn-text').textContent = 'Generating Showcase...';
    progressContainer.classList.remove('hidden');
    resultsCard.classList.add('hidden');

    resetStepPills();
    updateProgress(15, 'Navigating & capturing desktop view...', 'desk');

    // Simulated progress steps while background task runs
    const stepInterval = setInterval(() => {
      const currentWidth = parseInt(progressBarFill.style.width || '15');
      if (currentWidth < 35) {
        updateProgress(35, 'Capturing mobile iPhone 17 Pro Max view...', 'mob');
      } else if (currentWidth < 55) {
        updateProgress(55, 'Capturing tablet iPad view...', 'tab');
      } else if (currentWidth < 75) {
        updateProgress(75, 'Framing with bezel.fit iPhone 17 Pro Max (Deep Blue)...', 'frame');
      } else if (currentWidth < 90) {
        updateProgress(90, 'Compositing 3D shadows and layout...', 'comp');
      }
    }, 4000);

    try {
      const payload = {
        url: rawUrl,
        name: nameInput.value.trim() || null,
        mobile_finish: mobileFinishSelect.value,
        tablet_finish: tabletFinishSelect.value,
        bg_color: bgColorSelect.value,
        shadow_intensity: shadowSelect.value,
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
        const errorData = await response.json().catch(() => ({ detail: 'Unknown error occurred' }));
        throw new Error(errorData.detail || 'Generation failed');
      }

      const data = await response.json();
      updateProgress(100, 'Showcase completed!', 'exp');

      // Populate Results
      setTimeout(() => {
        progressContainer.classList.add('hidden');
        displayResult(data);
        loadHistory();
      }, 500);

    } catch (err) {
      clearInterval(stepInterval);
      progressMessage.textContent = `Error: ${err.message}`;
      progressBarFill.style.background = '#ef4444';
      alert(`Generation failed: ${err.message}`);
    } finally {
      generateBtn.disabled = false;
      generateBtn.querySelector('.btn-text').textContent = 'Generate Portfolio Showcase';
    }
  });

  function resetStepPills() {
    Object.values(stepPills).forEach(pill => {
      pill.className = 'step-pill';
    });
  }

  function updateProgress(percent, msg, activeStep) {
    progressBarFill.style.width = `${percent}%`;
    progressBarFill.style.background = 'linear-gradient(90deg, #2563eb, #10b981)';
    progressMessage.textContent = msg;

    const stepOrder = ['desk', 'mob', 'tab', 'frame', 'comp', 'exp'];
    const activeIdx = stepOrder.indexOf(activeStep);

    stepOrder.forEach((step, idx) => {
      const pill = stepPills[step];
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
    resultTitle.textContent = data.title;
    resultUrl.textContent = data.url;

    // Reset tabs to showcase
    tabBtns.forEach(b => b.classList.remove('active'));
    document.querySelector('.tab-btn[data-view="showcase"]').classList.add('active');
    activeView = 'showcase';

    updatePreviewView();

    // Set download links
    btnDlWebp.href = data.exports.showcase_webp;
    btnDlPng.href = data.exports.showcase_png;
    btnDlJpg.href = data.exports.showcase_jpg;
    btnDlZip.href = data.exports.zip;

    resultsCard.classList.remove('hidden');
    resultsCard.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  // History Loader
  async function loadHistory() {
    try {
      const resp = await fetch('/api/history');
      if (!resp.ok) return;
      const history = await resp.json();

      historyCount.textContent = `${history.length} items`;

      if (history.length === 0) {
        historyGrid.innerHTML = `
          <div class="empty-history">No showcases generated yet. Enter a link above to create your first portfolio asset!</div>
        `;
        return;
      }

      historyGrid.innerHTML = history.map(item => `
        <div class="history-card-item" data-slug="${item.slug}">
          <div class="history-thumb">
            <img src="${item.exports.showcase_webp || item.exports.showcase_png}" alt="${item.title}" loading="lazy" />
          </div>
          <div class="history-meta">
            <div class="history-title">${item.title}</div>
            <div class="history-url">${item.url}</div>
          </div>
        </div>
      `).join('');

      // Add click listeners to history items
      document.querySelectorAll('.history-card-item').forEach(el => {
        el.addEventListener('click', () => {
          const slug = el.dataset.slug;
          const found = history.find(h => h.slug === slug);
          if (found) {
            displayResult(found);
          }
        });
      });

      // If results are not showing, auto-display the most recent item as a preview
      if (history.length > 0 && resultsCard.classList.contains('hidden')) {
        displayResult(history[0]);
      }
    } catch (e) {
      console.error('Failed to load history:', e);
    }
  }

  // Load history on boot
  loadHistory();
});
