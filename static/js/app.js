/**
 * Portfolio Showcase Studio — Client Application
 * Handles authentication, RBAC role-enforcement, theme toggling,
 * multi-device previews, generation triggers, search filtering,
 * user management, and paginated gallery browsing.
 */

document.addEventListener('DOMContentLoaded', () => {
  let currentUser = null;

  // Theme Toggle Elements & Setup
  const themeToggle = document.getElementById('theme-toggle');

  function getPreferredTheme() {
    const saved = localStorage.getItem('portfolio-showcase-theme');
    if (saved === 'light' || saved === 'dark') return saved;
    return 'light';
  }

  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('portfolio-showcase-theme', theme);
  }

  // Initialize theme
  applyTheme(getPreferredTheme());

  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const current = document.documentElement.getAttribute('data-theme') || 'light';
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

  // Progress UI Elements
  const progressContainer = document.getElementById('progress-container');
  const progressBarFill = document.getElementById('progress-bar-fill');
  const progressText = document.getElementById('progress-text');
  const stepPills = document.querySelectorAll('.step-pill');

  // Result Section Elements
  const resultsCard = document.getElementById('results-card');
  const resultTitle = document.getElementById('result-title');
  const resultUrl = document.getElementById('result-url');
  const resultPreviewImg = document.getElementById('result-preview-img');
  const previewContainer = document.getElementById('preview-container');
  const toggleTransparencyBtn = document.getElementById('toggle-transparency-btn');
  const viewFullResBtn = document.getElementById('view-full-res-btn');
  const viewTabs = document.querySelectorAll('.view-tab');

  // Download Links
  const dlShowcasePng = document.getElementById('dl-showcase-png');
  const dlShowcaseWebp = document.getElementById('dl-showcase-webp');
  const dlShowcaseJpg = document.getElementById('dl-showcase-jpg');
  const dlMobilePng = document.getElementById('dl-mobile-png');
  const dlTabletPng = document.getElementById('dl-tablet-png');
  const dlDesktopPng = document.getElementById('dl-desktop-png');
  const dlMetadataJson = document.getElementById('dl-metadata-json');
  const dlZipAll = document.getElementById('dl-zip-all');

  // History & Pagination Elements
  const historyGrid = document.getElementById('history-grid');
  const historyCount = document.getElementById('history-count');
  const searchInput = document.getElementById('history-search-input');
  const searchClearBtn = document.getElementById('search-clear-btn');
  const paginationBar = document.getElementById('pagination-bar');
  const paginationInfo = document.getElementById('pagination-info');
  const prevPageBtn = document.getElementById('prev-page-btn');
  const nextPageBtn = document.getElementById('next-page-btn');
  const pageNumbers = document.getElementById('page-numbers');

  // User Management & Modal Elements
  const userModal = document.getElementById('user-modal');
  const manageUsersBtn = document.getElementById('manage-users-btn');
  const closeUserModalBtn = document.getElementById('close-user-modal-btn');
  const modalTabBtns = document.querySelectorAll('.modal-tab-btn');
  const modalTabPanes = document.querySelectorAll('.modal-tab-pane');
  const createUserForm = document.getElementById('create-user-form');
  const modalAlert = document.getElementById('modal-alert');
  const usersTableBody = document.getElementById('users-table-body');
  const logoutBtn = document.getElementById('logout-btn');
  const viewerNotice = document.getElementById('viewer-notice-banner');

  let currentResultData = null;
  let allHistory = [];
  let filteredHistory = [];
  let currentPage = 1;
  const ITEMS_PER_PAGE = 8;

  // --------------------------------------------------------------------------
  // Authentication & RBAC Check
  // --------------------------------------------------------------------------
  async function checkAuth() {
    try {
      const res = await fetch('/api/auth/me');
      if (!res.ok) {
        window.location.href = '/login';
        return;
      }
      const data = await res.json();
      currentUser = data.user;
      updateUserUI(currentUser);
    } catch (err) {
      window.location.href = '/login';
    }
  }

  function updateUserUI(user) {
    const nameEl = document.getElementById('user-display-name');
    const avatarEl = document.getElementById('user-avatar');
    const badgeEl = document.getElementById('user-role-badge');

    if (nameEl) nameEl.textContent = user.display_name || user.username;
    if (avatarEl) avatarEl.textContent = (user.display_name || user.username).charAt(0).toUpperCase();
    if (badgeEl) {
      badgeEl.textContent = user.role.toUpperCase();
      badgeEl.className = `role-badge role-${user.role}`;
    }

    if (user.role === 'admin' && manageUsersBtn) {
      manageUsersBtn.classList.remove('hidden');
    }

    if (user.role === 'viewer') {
      if (viewerNotice) viewerNotice.classList.remove('hidden');
      if (urlInput) urlInput.disabled = true;
      if (nameInput) nameInput.disabled = true;
      if (categorySelect) categorySelect.disabled = true;
      if (typeSelect) typeSelect.disabled = true;
      if (mobileFinishSelect) mobileFinishSelect.disabled = true;
      if (tabletFinishSelect) tabletFinishSelect.disabled = true;
      if (bgColorSelect) bgColorSelect.disabled = true;
      if (shadowSelect) shadowSelect.disabled = true;
      if (delaySelect) delaySelect.disabled = true;
      if (generateBtn) {
        generateBtn.disabled = true;
        generateBtn.title = "Viewers cannot generate showcases. Creator or Administrator access required.";
        const btnText = generateBtn.querySelector('.btn-text');
        if (btnText) btnText.textContent = 'Viewing Mode (Disabled)';
      }
    }
  }

  // Logout Handler
  if (logoutBtn) {
    logoutBtn.addEventListener('click', async () => {
      try {
        await fetch('/api/auth/logout', { method: 'POST' });
      } catch (e) {}
      localStorage.removeItem('portfolio_user');
      window.location.href = '/login';
    });
  }

  // --------------------------------------------------------------------------
  // User Management Modal (Admin Only)
  // --------------------------------------------------------------------------
  if (manageUsersBtn) {
    manageUsersBtn.addEventListener('click', () => {
      if (userModal) userModal.classList.remove('hidden');
      loadUsersList();
    });
  }

  if (closeUserModalBtn && userModal) {
    closeUserModalBtn.addEventListener('click', () => {
      userModal.classList.add('hidden');
    });
  }

  if (userModal) {
    userModal.addEventListener('click', (e) => {
      if (e.target === userModal) {
        userModal.classList.add('hidden');
      }
    });
  }

  modalTabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      modalTabBtns.forEach(b => b.classList.remove('active'));
      modalTabPanes.forEach(p => p.classList.remove('active'));
      btn.classList.add('active');
      const targetId = btn.dataset.tab;
      const targetPane = document.getElementById(targetId);
      if (targetPane) targetPane.classList.add('active');
      if (targetId === 'tab-user-list') {
        loadUsersList();
      }
    });
  });

  async function loadUsersList() {
    if (!usersTableBody) return;
    usersTableBody.innerHTML = '<tr><td colspan="5" class="table-loading">Loading accounts...</td></tr>';
    try {
      const res = await fetch('/api/users');
      if (!res.ok) throw new Error('Failed to load users');
      const users = await res.json();
      if (!Array.isArray(users) || users.length === 0) {
        usersTableBody.innerHTML = '<tr><td colspan="5" class="table-loading">No user accounts found.</td></tr>';
        return;
      }
      usersTableBody.innerHTML = users.map(u => {
        const isSelf = currentUser && currentUser.username === u.username;
        const createdStr = u.created_at ? u.created_at.split('T')[0] : '—';
        return `
          <tr>
            <td><strong>${escapeHtml(u.username)}</strong>${isSelf ? ' <span style="font-size: 11px; opacity: 0.7;">(you)</span>' : ''}</td>
            <td>${escapeHtml(u.display_name || '—')}</td>
            <td><span class="role-badge role-${escapeHtml(u.role)}">${escapeHtml(u.role.toUpperCase())}</span></td>
            <td style="font-size: 12px; color: var(--text-muted);">${escapeHtml(createdStr)}</td>
            <td style="text-align: right;">
              ${isSelf ? '<span style="font-size: 11px; color: var(--text-muted);">Active Admin</span>' : `
                <button class="btn-delete-user" data-username="${escapeHtml(u.username)}">Remove</button>
              `}
            </td>
          </tr>
        `;
      }).join('');

      usersTableBody.querySelectorAll('.btn-delete-user').forEach(btn => {
        btn.addEventListener('click', async () => {
          const targetUser = btn.dataset.username;
          if (!confirm(`Are you sure you want to remove user '${targetUser}'?`)) return;
          try {
            const delRes = await fetch(`/api/users/${encodeURIComponent(targetUser)}`, { method: 'DELETE' });
            const data = await delRes.json();
            if (!delRes.ok || !data.success) {
              alert(data.detail || 'Could not delete user.');
              return;
            }
            loadUsersList();
          } catch (err) {
            alert('Network error while deleting user.');
          }
        });
      });
    } catch (err) {
      usersTableBody.innerHTML = '<tr><td colspan="5" class="table-loading" style="color: #ef4444;">Failed to load users.</td></tr>';
    }
  }

  if (createUserForm) {
    createUserForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (modalAlert) {
        modalAlert.className = 'modal-alert hidden';
        modalAlert.textContent = '';
      }
      const username = document.getElementById('new-username').value.trim();
      const displayName = document.getElementById('new-display-name').value.trim();
      const password = document.getElementById('new-password').value;
      const role = document.getElementById('new-role').value;
      const submitBtn = document.getElementById('create-user-btn');

      if (submitBtn) submitBtn.disabled = true;

      try {
        const res = await fetch('/api/users', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            username: username,
            display_name: displayName,
            password: password,
            role: role
          })
        });
        const data = await res.json();
        if (!res.ok || !data.success) {
          throw new Error(data.detail || 'Failed to create user account.');
        }

        createUserForm.reset();
        if (modalAlert) {
          modalAlert.className = 'modal-alert success';
          modalAlert.textContent = `User '${username}' created successfully as ${role.toUpperCase()}.`;
        }

        setTimeout(() => {
          const listTabBtn = document.querySelector('.modal-tab-btn[data-tab="tab-user-list"]');
          if (listTabBtn) listTabBtn.click();
        }, 900);
      } catch (err) {
        if (modalAlert) {
          modalAlert.className = 'modal-alert error';
          modalAlert.textContent = err.message;
        }
      } finally {
        if (submitBtn) submitBtn.disabled = false;
      }
    });
  }

  // --------------------------------------------------------------------------
  // Generator Pipeline Form Submit
  // --------------------------------------------------------------------------
  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      if (currentUser && currentUser.role === 'viewer') {
        alert("Viewers cannot generate showcases. Please contact an administrator or creator.");
        return;
      }

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
        alert(`Generation Failed: ${err.message}`);
        if (progressContainer) progressContainer.classList.add('hidden');
      } finally {
        generateBtn.disabled = false;
        if (btnText) btnText.textContent = 'Generate Portfolio Showcase';
      }
    });
  }

  function updateProgress(percent, msg, activeStepKey) {
    if (progressBarFill) progressBarFill.style.width = `${percent}%`;
    if (progressText) progressText.textContent = msg;

    if (activeStepKey) {
      stepPills.forEach(pill => {
        if (pill.dataset.step === activeStepKey) {
          pill.classList.add('active');
          pill.classList.remove('done');
        } else {
          const steps = ['desk', 'mob', 'tab', 'frame', 'comp', 'exp'];
          const currentIndex = steps.indexOf(activeStepKey);
          const pillIndex = steps.indexOf(pill.dataset.step);
          if (pillIndex < currentIndex) {
            pill.classList.add('done');
            pill.classList.remove('active');
          } else {
            pill.classList.remove('active', 'done');
          }
        }
      });
    }
  }

  function resetStepPills() {
    stepPills.forEach(pill => pill.classList.remove('active', 'done'));
  }

  // --------------------------------------------------------------------------
  // Display Generated Result
  // --------------------------------------------------------------------------
  function displayResult(data) {
    currentResultData = data;
    if (!resultsCard) return;

    resultsCard.classList.remove('hidden');

    if (resultTitle) resultTitle.textContent = data.title || 'Generated Showcase';
    if (resultUrl) {
      resultUrl.textContent = data.url;
      resultUrl.href = data.url;
    }

    // Default to Full Showcase view tab
    setActiveViewTab('showcase');

    // Configure Download Links
    const ex = data.exports || {};
    setupDownloadLink(dlShowcasePng, ex.showcase_png);
    setupDownloadLink(dlShowcaseWebp, ex.showcase_webp);
    setupDownloadLink(dlShowcaseJpg, ex.showcase_jpg);
    setupDownloadLink(dlMobilePng, ex.mobile_png);
    setupDownloadLink(dlTabletPng, ex.tablet_png);
    setupDownloadLink(dlDesktopPng, ex.desktop_png);
    setupDownloadLink(dlMetadataJson, ex.metadata_json);
    setupDownloadLink(dlZipAll, ex.zip);

    // Scroll smoothly to results card
    resultsCard.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function setupDownloadLink(element, path) {
    if (!element) return;
    if (path) {
      element.href = path;
      element.setAttribute('download', path.split('/').pop());
      element.classList.remove('disabled');
    } else {
      element.removeAttribute('href');
      element.classList.add('disabled');
    }
  }

  // --------------------------------------------------------------------------
  // View Switcher (Full Showcase, Mobile, Tablet, Desktop)
  // --------------------------------------------------------------------------
  viewTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const viewType = tab.dataset.view;
      setActiveViewTab(viewType);
    });
  });

  function setActiveViewTab(viewType) {
    viewTabs.forEach(t => t.classList.toggle('active', t.dataset.view === viewType));

    if (!currentResultData || !currentResultData.exports) return;
    const ex = currentResultData.exports;
    let targetSrc = '';

    switch (viewType) {
      case 'showcase':
        targetSrc = ex.showcase_webp || ex.showcase_png;
        break;
      case 'mobile':
        targetSrc = ex.mobile_webp || ex.mobile_png;
        break;
      case 'tablet':
        targetSrc = ex.tablet_webp || ex.tablet_png;
        break;
      case 'desktop':
        targetSrc = ex.desktop_webp || ex.desktop_png;
        break;
      default:
        targetSrc = ex.showcase_webp || ex.showcase_png;
    }

    if (resultPreviewImg && targetSrc) {
      resultPreviewImg.src = targetSrc;
    }
  }

  // Toggle checkerboard background
  if (toggleTransparencyBtn && previewContainer) {
    toggleTransparencyBtn.addEventListener('click', () => {
      previewContainer.classList.toggle('transparent-bg');
    });
  }

  // View full resolution
  if (viewFullResBtn && resultPreviewImg) {
    viewFullResBtn.addEventListener('click', () => {
      if (resultPreviewImg.src) {
        window.open(resultPreviewImg.src, '_blank');
      }
    });
  }

  // --------------------------------------------------------------------------
  // Gallery, Live Search & Pagination
  // --------------------------------------------------------------------------
  function filterHistory() {
    const query = (searchInput ? searchInput.value : '').trim().toLowerCase();

    if (searchClearBtn) {
      searchClearBtn.classList.toggle('hidden', query.length === 0);
    }

    if (!query) {
      filteredHistory = [...allHistory];
    } else {
      filteredHistory = allHistory.filter(item => {
        const title = (item.title || '').toLowerCase();
        const url = (item.url || '').toLowerCase();
        const category = (item.category || '').toLowerCase();
        const type = (item.type || '').toLowerCase();
        const slug = (item.slug || '').toLowerCase();
        return title.includes(query) || url.includes(query) || category.includes(query) || type.includes(query) || slug.includes(query);
      });
    }

    currentPage = 1;
    renderHistory();
  }

  function renderHistory() {
    if (!historyGrid) return;

    const totalItems = filteredHistory.length;
    if (historyCount) {
      historyCount.textContent = `${totalItems} ${totalItems === 1 ? 'project' : 'projects'}`;
    }

    if (totalItems === 0) {
      historyGrid.innerHTML = `
        <div class="empty-history">
          ${searchInput && searchInput.value.trim() ? 'No showcase projects match your search.' : 'No showcases generated yet. Enter a website URL above to create your first portfolio asset.'}
        </div>
      `;
      if (paginationBar) paginationBar.classList.add('hidden');
      return;
    }

    const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
    if (currentPage > totalPages) currentPage = totalPages;
    if (currentPage < 1) currentPage = 1;

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
      if (resp.status === 401) {
        window.location.href = '/login';
        return;
      }
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

  // Initialize Auth & History on Boot
  checkAuth();
  loadHistory();
});
