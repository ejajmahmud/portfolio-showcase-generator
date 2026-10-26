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

    // Update Mobile Drawer Theme status & badge
    const drawerThemeStatus = document.getElementById('drawer-theme-status');
    const drawerThemeBadge = document.getElementById('drawer-theme-badge');
    if (drawerThemeStatus) {
      drawerThemeStatus.textContent = theme === 'dark' ? 'Dark Appearance' : 'Light Appearance';
    }
    if (drawerThemeBadge) {
      drawerThemeBadge.textContent = theme === 'dark' ? 'Dark' : 'Light';
    }
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

  const drawerThemeBtn = document.getElementById('drawer-theme-toggle-btn');
  if (drawerThemeBtn) {
    drawerThemeBtn.addEventListener('click', () => {
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

  // Generation Mode Elements
  const modeBtnSingle = document.getElementById('mode-btn-single');
  const modeBtnBatch = document.getElementById('mode-btn-batch');
  const singleInputMode = document.getElementById('single-input-mode');
  const batchInputMode = document.getElementById('batch-input-mode');
  const batchUrlsInput = document.getElementById('batch-urls-input');
  const batchDetectedBadge = document.getElementById('batch-detected-badge');
  const btnSampleSites = document.getElementById('btn-sample-sites');
  const batchClearBtn = document.getElementById('batch-clear-btn');
  let currentGenerationMode = 'single';

  // Progress UI & Apple 3D Device Stage Elements
  const progressContainer = document.getElementById('progress-container');
  const progressBarFill = document.getElementById('progress-bar-fill');
  const progressText = document.getElementById('progress-text') || document.getElementById('progress-message');
  const progressPct = document.getElementById('progress-pct');
  const stepPills = document.querySelectorAll('.step-pill');
  const deckIphone = document.getElementById('deck-iphone');
  const deckMacbook = document.getElementById('deck-macbook');
  const deckIpad = document.getElementById('deck-ipad');
  const batchProgressDeck = document.getElementById('batch-progress-deck');
  const batchDeckCounter = document.getElementById('batch-deck-counter');
  const batchQueueList = document.getElementById('batch-queue-list');

  // Result Section Elements
  const resultsCard = document.getElementById('results-card');
  const resultTitle = document.getElementById('result-title');
  const resultUrl = document.getElementById('result-url');
  const resultPreviewImg = document.getElementById('result-preview-img') || document.getElementById('preview-image');
  const previewContainer = document.getElementById('preview-container') || document.getElementById('preview-stage');
  const toggleTransparencyBtn = document.getElementById('toggle-transparency-btn') || document.getElementById('toggle-bg-btn');
  const viewFullResBtn = document.getElementById('view-full-res-btn') || document.getElementById('open-full-btn');
  const viewTabs = document.querySelectorAll('.view-tab, .tab-btn');

  // Download Links
  const dlShowcasePng = document.getElementById('dl-showcase-png') || document.getElementById('btn-dl-png');
  const dlShowcaseWebp = document.getElementById('dl-showcase-webp') || document.getElementById('btn-dl-webp');
  const dlShowcaseJpg = document.getElementById('dl-showcase-jpg') || document.getElementById('btn-dl-jpg');
  const dlMobilePng = document.getElementById('dl-mobile-png');
  const dlTabletPng = document.getElementById('dl-tablet-png');
  const dlDesktopPng = document.getElementById('dl-desktop-png');
  const dlMetadataJson = document.getElementById('dl-metadata-json');
  const dlZipAll = document.getElementById('dl-zip-all') || document.getElementById('btn-dl-zip');

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

  // Edit Showcase Modal Elements
  const editShowcaseModal = document.getElementById('edit-showcase-modal');
  const editShowcaseForm = document.getElementById('edit-showcase-form');
  const editSlugInput = document.getElementById('edit-showcase-slug');
  const editTitleInput = document.getElementById('edit-showcase-title');
  const editUrlInput = document.getElementById('edit-showcase-url');
  const editCategoryInput = document.getElementById('edit-showcase-category');
  const editTypeInput = document.getElementById('edit-showcase-type');
  const closeEditModalBtn = document.getElementById('close-edit-modal-btn');
  const cancelEditBtn = document.getElementById('cancel-edit-btn');
  const saveEditBtn = document.getElementById('save-edit-btn');

  // Delete Confirmation Alert Elements
  const confirmDeleteModal = document.getElementById('confirm-delete-modal');
  const deleteProjectName = document.getElementById('delete-project-name');
  const cancelDeleteBtn = document.getElementById('cancel-delete-btn');
  const confirmDeleteBtn = document.getElementById('confirm-delete-btn');
  let showcaseToDelete = null;

  // Shinjiru Portfolio Live Sync Elements (Header quick actions & Download card)
  const resultSyncStatusBadge = document.getElementById('result-sync-status-badge');
  const resultHeaderSyncActions = document.getElementById('result-header-sync-actions');
  const btnHeaderApproveSync = document.getElementById('btn-header-approve-sync');
  const btnHeaderViewLive = document.getElementById('btn-header-view-live');
  const btnHeaderRollbackSync = document.getElementById('btn-header-rollback-sync');

  const dlSyncCard = document.getElementById('dl-sync-card');
  const dlSyncCardStatus = document.getElementById('dl-sync-card-status');
  const dlSyncCardDesc = document.getElementById('dl-sync-card-desc');
  const btnCardApproveSync = document.getElementById('btn-card-approve-sync');
  const btnCardViewLive = document.getElementById('btn-card-view-live');
  const btnCardRollbackSync = document.getElementById('btn-card-rollback-sync');

  // Approve & Deploy Sheet Modal Elements
  const approveSyncModal = document.getElementById('approve-sync-modal');
  const closeSyncModalBtn = document.getElementById('close-sync-modal-btn');
  const cancelSyncModalBtn = document.getElementById('cancel-sync-modal-btn');
  const approveSyncForm = document.getElementById('approve-sync-form');
  const syncModalAlert = document.getElementById('sync-modal-alert');
  const syncShowcaseSlug = document.getElementById('sync-showcase-slug');
  const syncPreviewThumb = document.getElementById('sync-preview-thumb');
  const syncPreviewTitle = document.getElementById('sync-preview-title');
  const syncPreviewUrl = document.getElementById('sync-preview-url');
  const syncInputTitle = document.getElementById('sync-input-title');
  const syncInputUrl = document.getElementById('sync-input-url');
  const syncInputIndustry = document.getElementById('sync-input-industry');
  const syncInputType = document.getElementById('sync-input-type');
  const submitApproveSyncBtn = document.getElementById('submit-approve-sync-btn');

  // Rollback Confirmation Alert Elements
  const confirmRollbackModal = document.getElementById('confirm-rollback-modal');
  const rollbackProjectName = document.getElementById('rollback-project-name');
  const cancelRollbackBtn = document.getElementById('cancel-rollback-btn');
  const confirmRollbackBtn = document.getElementById('confirm-rollback-btn');
  let showcaseToRollback = null;

  // Sync Settings Tab Elements (Inside User Management Modal)
  const syncSettingsAlert = document.getElementById('sync-settings-alert');
  const syncSettingsForm = document.getElementById('sync-settings-form');
  const syncSettingTargetSite = document.getElementById('sync-setting-target-site');
  const syncSettingPortfolioUrl = document.getElementById('sync-setting-portfolio-url');
  const syncSettingEndpoint = document.getElementById('sync-setting-endpoint');
  const syncSettingToken = document.getElementById('sync-setting-token');
  const toggleSyncTokenBtn = document.getElementById('toggle-sync-token-btn');
  const btnTestSyncHealth = document.getElementById('btn-test-sync-health');
  const syncConnectionIndicator = document.getElementById('sync-connection-indicator');
  const syncConnectionStatusText = document.getElementById('sync-connection-status-text');
  const syncConnectionDetails = document.getElementById('sync-connection-details');
  const saveSyncSettingsBtn = document.getElementById('save-sync-settings-btn');

  const SHINJIRU_INDUSTRIES = [
    "Argiculture & Animals",
    "Automotive & Transportation",
    "Business & Services",
    "Creative & Design",
    "Consultancy",
    "Community",
    "Education",
    "Engineering",
    "Events & Entertainment",
    "Factory & Machinery",
    "Fashion & Beauty",
    "Film & TV",
    "Finance & Law",
    "Food & Drinks",
    "Health & Medical",
    "Logistics",
    "Music & Bands",
    "Oils & Gas & Marine",
    "Printing",
    "Real Estate & Construction",
    "Sport & Fitness",
    "Technology & Apps"
  ];

  // Toast Container & Quick New Button
  const toastContainer = document.getElementById('toast-container');
  const quickNewShowcaseBtn = document.getElementById('btn-quick-new-showcase');

  let currentResultData = null;
  let allHistory = [];
  let filteredHistory = [];
  let currentPage = 1;
  const ITEMS_PER_PAGE = 8;

  // --------------------------------------------------------------------------
  // Floating Liquid Glass Toast Notification System
  // --------------------------------------------------------------------------
  function showToast(message, type = 'info', duration = 3200) {
    if (!toastContainer) return;
    const toast = document.createElement('div');
    toast.className = `apple-toast toast-${type}`;

    let iconSvg = '';
    if (type === 'success') {
      iconSvg = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="14" height="14"><polyline points="20 6 9 17 4 12"></polyline></svg>`;
    } else if (type === 'error') {
      iconSvg = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="14" height="14"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>`;
    } else {
      iconSvg = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="14" height="14"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>`;
    }

    toast.innerHTML = `
      <span class="toast-icon">${iconSvg}</span>
      <span class="toast-text">${escapeHtml(message)}</span>
    `;

    toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.classList.add('toast-hiding');
      toast.addEventListener('transitionend', () => toast.remove(), { once: true });
      setTimeout(() => toast.remove(), 400);
    }, duration);
  }

  // --------------------------------------------------------------------------
  // Edit Showcase Modal Logic (Apple Sheet)
  // --------------------------------------------------------------------------
  function openEditModal(item) {
    if (!editShowcaseModal || !item) return;
    if (editSlugInput) editSlugInput.value = item.slug || '';
    if (editTitleInput) editTitleInput.value = item.title || '';
    if (editUrlInput) editUrlInput.value = item.url || '';
    if (editCategoryInput) editCategoryInput.value = item.category || '';
    if (editTypeInput) editTypeInput.value = item.type || '';
    editShowcaseModal.classList.remove('hidden');
    if (editTitleInput) editTitleInput.focus();
  }

  function closeEditModal() {
    if (editShowcaseModal) editShowcaseModal.classList.add('hidden');
  }

  if (closeEditModalBtn) closeEditModalBtn.addEventListener('click', closeEditModal);
  if (cancelEditBtn) cancelEditBtn.addEventListener('click', closeEditModal);
  if (editShowcaseModal) {
    editShowcaseModal.addEventListener('click', (e) => {
      if (e.target === editShowcaseModal) closeEditModal();
    });
  }

  if (editShowcaseForm) {
    editShowcaseForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const slug = editSlugInput ? editSlugInput.value : '';
      if (!slug) return;

      const payload = {
        title: editTitleInput.value.trim(),
        url: editUrlInput.value.trim(),
        category: editCategoryInput.value.trim(),
        type: editTypeInput.value.trim()
      };

      if (saveEditBtn) {
        saveEditBtn.disabled = true;
        saveEditBtn.textContent = 'Saving...';
      }

      try {
        const res = await fetch(`/api/history/${encodeURIComponent(slug)}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        const data = await res.json();
        if (!res.ok) {
          showToast(data.detail || 'Could not update showcase.', 'error');
          return;
        }

        const updated = data.showcase;
        const idx = allHistory.findIndex(h => h.slug === slug);
        if (idx !== -1) {
          allHistory[idx] = { ...allHistory[idx], ...updated };
        }
        const fIdx = filteredHistory.findIndex(h => h.slug === slug);
        if (fIdx !== -1) {
          filteredHistory[fIdx] = { ...filteredHistory[fIdx], ...updated };
        }

        if (currentResultData && currentResultData.slug === slug) {
          currentResultData = { ...currentResultData, ...updated };
          if (resultTitle) resultTitle.textContent = updated.title || slug;
          if (resultUrl) {
            resultUrl.textContent = updated.url || '';
            resultUrl.href = updated.url || '#';
          }
        }

        closeEditModal();
        renderHistory();
        showToast(`Showcase "${updated.title}" updated successfully`, 'success');
      } catch (err) {
        showToast(err.message || 'Error updating showcase', 'error');
      } finally {
        if (saveEditBtn) {
          saveEditBtn.disabled = false;
          saveEditBtn.textContent = 'Save Changes';
        }
      }
    });
  }

  // --------------------------------------------------------------------------
  // Delete Showcase Alert Sheet (Apple HIG Destructive Confirmation)
  // --------------------------------------------------------------------------
  function openDeleteModal(item) {
    if (!confirmDeleteModal || !item) return;
    showcaseToDelete = item;
    if (deleteProjectName) {
      deleteProjectName.textContent = `"${item.title || item.slug}"`;
    }
    confirmDeleteModal.classList.remove('hidden');
  }

  function closeDeleteModal() {
    if (confirmDeleteModal) confirmDeleteModal.classList.add('hidden');
    showcaseToDelete = null;
  }

  if (cancelDeleteBtn) cancelDeleteBtn.addEventListener('click', closeDeleteModal);
  if (confirmDeleteModal) {
    confirmDeleteModal.addEventListener('click', (e) => {
      if (e.target === confirmDeleteModal) closeDeleteModal();
    });
  }

  if (confirmDeleteBtn) {
    confirmDeleteBtn.addEventListener('click', async () => {
      if (!showcaseToDelete) return;
      if (currentUser && currentUser.role === 'guest') {
        showToast('Guest accounts cannot delete project showcases. Please sign in with an Administrator account.', 'error');
        closeDeleteModal();
        return;
      }
      const slug = showcaseToDelete.slug;
      const title = showcaseToDelete.title || slug;
      const originalText = confirmDeleteBtn.textContent;
      confirmDeleteBtn.disabled = true;
      confirmDeleteBtn.textContent = 'Deleting...';

      try {
        const res = await fetch(`/api/history/${encodeURIComponent(slug)}`, {
          method: 'DELETE'
        });
        const data = await res.json();
        if (!res.ok) {
          showToast(data.detail || 'Could not delete showcase', 'error');
          return;
        }

        allHistory = allHistory.filter(h => h.slug !== slug);
        filteredHistory = filteredHistory.filter(h => h.slug !== slug);

        closeDeleteModal();
        renderHistory();
        showToast(`Showcase "${title}" deleted`, 'success');

        if (currentResultData && currentResultData.slug === slug) {
          if (allHistory.length > 0) {
            displayResult(allHistory[0]);
          } else if (resultsCard) {
            resultsCard.classList.add('hidden');
            currentResultData = null;
          }
        }
      } catch (err) {
        showToast(err.message || 'Error deleting showcase', 'error');
      } finally {
        confirmDeleteBtn.disabled = false;
        confirmDeleteBtn.textContent = originalText;
      }
    });
  }

  // --------------------------------------------------------------------------
  // Shinjiru Portfolio Live Sync & Approval Modal Logic
  // --------------------------------------------------------------------------
  function populateIndustryDropdown(selectedVal = '') {
    if (!syncInputIndustry) return;
    syncInputIndustry.innerHTML = SHINJIRU_INDUSTRIES.map(ind => `
      <option value="${escapeHtml(ind)}" ${ind === selectedVal ? 'selected' : ''}>${escapeHtml(ind)}</option>
    `).join('');
  }

  function openApproveSyncModal(item) {
    if (!approveSyncModal || !item) return;
    if (syncModalAlert) {
      syncModalAlert.className = 'modal-alert hidden';
      syncModalAlert.textContent = '';
    }
    if (syncShowcaseSlug) syncShowcaseSlug.value = item.slug || '';
    if (syncInputTitle) syncInputTitle.value = item.title || item.slug || '';
    if (syncInputUrl) syncInputUrl.value = item.url || '';
    if (syncPreviewTitle) syncPreviewTitle.textContent = item.title || item.slug || '';
    if (syncPreviewUrl) syncPreviewUrl.textContent = item.url || '';

    // Thumbnail preview
    const thumbSrc = (item.exports && (item.exports.showcase_webp || item.exports.showcase_png || item.exports.showcase_jpg)) || '';
    if (syncPreviewThumb) {
      syncPreviewThumb.src = thumbSrc;
    }

    populateIndustryDropdown(item.synced_industry || item.category || 'Business & Services');

    if (syncInputType) {
      syncInputType.value = item.synced_type || item.type || 'Business';
    }

    approveSyncModal.classList.remove('hidden');
    if (syncInputTitle) syncInputTitle.focus();
  }

  function closeApproveSyncModal() {
    if (approveSyncModal) approveSyncModal.classList.add('hidden');
  }

  if (closeSyncModalBtn) closeSyncModalBtn.addEventListener('click', closeApproveSyncModal);
  if (cancelSyncModalBtn) cancelSyncModalBtn.addEventListener('click', closeApproveSyncModal);
  if (approveSyncModal) {
    approveSyncModal.addEventListener('click', (e) => {
      if (e.target === approveSyncModal) closeApproveSyncModal();
    });
  }

  if (approveSyncForm) {
    approveSyncForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const slug = syncShowcaseSlug ? syncShowcaseSlug.value : '';
      if (!slug) return;

      const payload = {
        slug: slug,
        title: syncInputTitle.value.trim(),
        url: syncInputUrl.value.trim(),
        industry: syncInputIndustry.value.trim(),
        website_type: syncInputType.value.trim()
      };

      if (submitApproveSyncBtn) {
        submitApproveSyncBtn.disabled = true;
        submitApproveSyncBtn.innerHTML = `
          <svg class="spin-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
            <line x1="12" y1="2" x2="12" y2="6"></line>
            <line x1="12" y1="18" x2="12" y2="22"></line>
            <line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line>
            <line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line>
            <line x1="2" y1="12" x2="6" y2="12"></line>
            <line x1="18" y1="12" x2="22" y2="12"></line>
            <line x1="4.93" y1="19.07" x2="7.76" y2="16.24"></line>
            <line x1="16.24" y1="7.76" x2="19.07" y2="4.93"></line>
          </svg>
          <span>Uploading & Syncing...</span>
        `;
      }

      try {
        const res = await fetch('/api/sync/approve-and-publish', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.detail || data.message || 'Sync to Shinjiru WordPress failed.');
        }

        let updated = data.showcase;

        // Dual-Path Resilient Architecture: If server-side was blocked by firewall, client browser executes direct sync
        if (data.needs_client_sync) {
          const wpPayload = Object.assign({}, data.payload, { sync_token: data.secret_token });
          const wpRes = await fetch(data.sync_endpoint, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': 'Bearer ' + data.secret_token,
              'X-Shinjiru-Sync-Token': data.secret_token
            },
            body: JSON.stringify(wpPayload)
          });
          const wpData = await wpRes.json();
          if (!wpRes.ok || !wpData.success) {
            throw new Error(wpData.message || 'WordPress sync rejected by remote site.');
          }

          // Confirm publication status to Studio backend
          const confirmRes = await fetch('/api/sync/confirm-published', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              slug: slug,
              title: payload.title,
              industry: payload.industry,
              website_type: payload.website_type,
              remote_image_url: wpData.item ? wpData.item.image_url : '',
              portfolio_page_url: data.portfolio_page_url
            })
          });
          const confirmData = await confirmRes.json();
          updated = confirmData.showcase || updated;
        }

        const idx = allHistory.findIndex(h => h.slug === slug);
        if (idx !== -1) {
          allHistory[idx] = { ...allHistory[idx], ...updated };
        }
        const fIdx = filteredHistory.findIndex(h => h.slug === slug);
        if (fIdx !== -1) {
          filteredHistory[fIdx] = { ...filteredHistory[fIdx], ...updated };
        }

        if (currentResultData && currentResultData.slug === slug) {
          currentResultData = { ...currentResultData, ...updated };
          updateResultSyncUI(currentResultData);
        }

        closeApproveSyncModal();
        renderHistory();
        showToast(`"${payload.title}" successfully approved and deployed live to Shinjiru Portfolio!`, 'success', 5000);
      } catch (err) {
        if (syncModalAlert) {
          syncModalAlert.className = 'modal-alert error';
          syncModalAlert.textContent = err.message;
        }
        showToast(err.message, 'error', 4500);
      } finally {
        if (submitApproveSyncBtn) {
          submitApproveSyncBtn.disabled = false;
          submitApproveSyncBtn.innerHTML = `
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="17 8 12 3 7 8"></polyline>
              <line x1="12" y1="3" x2="12" y2="15"></line>
            </svg>
            <span>Approve & Deploy to Shinjiru</span>
          `;
        }
      }
    });
  }

  // --------------------------------------------------------------------------
  // Shinjiru Portfolio Rollback Alert Modal
  // --------------------------------------------------------------------------
  function openRollbackModal(item) {
    if (!confirmRollbackModal || !item) return;
    showcaseToRollback = item;
    if (rollbackProjectName) {
      rollbackProjectName.textContent = `"${item.title || item.slug}"`;
    }
    confirmRollbackModal.classList.remove('hidden');
  }

  function closeRollbackModal() {
    if (confirmRollbackModal) confirmRollbackModal.classList.add('hidden');
    showcaseToRollback = null;
  }

  if (cancelRollbackBtn) cancelRollbackBtn.addEventListener('click', closeRollbackModal);
  if (confirmRollbackModal) {
    confirmRollbackModal.addEventListener('click', (e) => {
      if (e.target === confirmRollbackModal) closeRollbackModal();
    });
  }

  if (confirmRollbackBtn) {
    confirmRollbackBtn.addEventListener('click', async () => {
      if (!showcaseToRollback) return;
      const item = showcaseToRollback;
      const slug = item.slug;

      confirmRollbackBtn.disabled = true;
      confirmRollbackBtn.textContent = 'Rolling back...';

      try {
        const res = await fetch('/api/sync/rollback', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ slug: slug })
        });
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.detail || data.message || 'Rollback failed.');
        }

        let updated = data.showcase;

        // Dual-Path Resilient Architecture: If server-side was blocked by firewall, client browser executes direct rollback
        if (data.needs_client_rollback) {
          const wpPayload = Object.assign({}, data.payload, { sync_token: data.secret_token });
          const wpRes = await fetch(data.rollback_endpoint, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': 'Bearer ' + data.secret_token,
              'X-Shinjiru-Sync-Token': data.secret_token
            },
            body: JSON.stringify(wpPayload)
          });
          const wpData = await wpRes.json();
          if (!wpRes.ok || !wpData.success) {
            throw new Error(wpData.message || 'WordPress rollback rejected by remote site.');
          }

          // Confirm rollback status to Studio backend
          const confirmRes = await fetch('/api/sync/confirm-rollback', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ slug: slug })
          });
          const confirmData = await confirmRes.json();
          updated = confirmData.showcase || updated;
        }

        const idx = allHistory.findIndex(h => h.slug === slug);
        if (idx !== -1) {
          allHistory[idx] = { ...allHistory[idx], ...updated };
        }
        const fIdx = filteredHistory.findIndex(h => h.slug === slug);
        if (fIdx !== -1) {
          filteredHistory[fIdx] = { ...filteredHistory[fIdx], ...updated };
        }

        if (currentResultData && currentResultData.slug === slug) {
          currentResultData = { ...currentResultData, ...updated };
          updateResultSyncUI(currentResultData);
        }

        closeRollbackModal();
        renderHistory();
        showToast(`Showcase "${item.title || slug}" was rolled back and removed from Shinjiru Portfolio.`, 'info', 4000);
      } catch (err) {
        showToast(err.message, 'error', 4500);
      } finally {
        if (confirmRollbackBtn) {
          confirmRollbackBtn.disabled = false;
          confirmRollbackBtn.textContent = 'Rollback Card';
        }
      }
    });
  }

  // Result Stage Sync UI Updater (Header quick action + Download card)
  function updateResultSyncUI(data) {
    if (!data) return;
    const isSynced = data.sync_status === 'synced';
    const isAdmin = currentUser && currentUser.role === 'admin';
    const liveUrl = data.synced_portfolio_page || 'https://wwwdev.shinjiru.com.my/web-design/web-design-portfolios/';
    const industryName = data.synced_industry || data.category || 'Business & Services';

    // 1. Title Status Badge
    if (resultSyncStatusBadge) {
      if (isSynced) {
        resultSyncStatusBadge.className = 'badge-tag sync-live';
        resultSyncStatusBadge.textContent = '● Live on Shinjiru';
      } else {
        resultSyncStatusBadge.className = 'badge-tag sync-draft';
        resultSyncStatusBadge.textContent = 'Draft';
      }
    }

    // 2. Header Quick Actions
    if (resultHeaderSyncActions) {
      if (isAdmin) {
        resultHeaderSyncActions.classList.remove('hidden');
        if (isSynced) {
          if (btnHeaderApproveSync) btnHeaderApproveSync.classList.add('hidden');
          if (btnHeaderViewLive) {
            btnHeaderViewLive.classList.remove('hidden');
            btnHeaderViewLive.href = liveUrl;
          }
          if (btnHeaderRollbackSync) btnHeaderRollbackSync.classList.remove('hidden');
        } else {
          if (btnHeaderApproveSync) {
            btnHeaderApproveSync.classList.remove('hidden');
            btnHeaderApproveSync.disabled = false;
          }
          if (btnHeaderViewLive) btnHeaderViewLive.classList.add('hidden');
          if (btnHeaderRollbackSync) btnHeaderRollbackSync.classList.add('hidden');
        }
      } else {
        // Non-admin (Guest/Viewer)
        if (isSynced && btnHeaderViewLive) {
          resultHeaderSyncActions.classList.remove('hidden');
          if (btnHeaderApproveSync) btnHeaderApproveSync.classList.add('hidden');
          btnHeaderViewLive.classList.remove('hidden');
          btnHeaderViewLive.href = liveUrl;
          if (btnHeaderRollbackSync) btnHeaderRollbackSync.classList.add('hidden');
        } else {
          resultHeaderSyncActions.classList.add('hidden');
        }
      }
    }

    // 3. Download Section Deployment Card
    if (dlSyncCard) {
      if (isSynced) {
        if (dlSyncCardStatus) {
          dlSyncCardStatus.className = 'sync-card-status live';
          dlSyncCardStatus.textContent = 'Live';
        }
        if (dlSyncCardDesc) {
          dlSyncCardDesc.textContent = `Live on Shinjiru Portfolio • ${escapeHtml(industryName)}`;
        }
        if (btnCardApproveSync) btnCardApproveSync.classList.add('hidden');
        if (btnCardViewLive) {
          btnCardViewLive.classList.remove('hidden');
          btnCardViewLive.href = liveUrl;
        }
        if (btnCardRollbackSync) {
          if (isAdmin) {
            btnCardRollbackSync.classList.remove('hidden');
          } else {
            btnCardRollbackSync.classList.add('hidden');
          }
        }
      } else {
        // Draft
        if (dlSyncCardStatus) {
          dlSyncCardStatus.className = 'sync-card-status draft';
          dlSyncCardStatus.textContent = 'Draft';
        }
        if (dlSyncCardDesc) {
          dlSyncCardDesc.textContent = 'Publish this showcase directly to Shinjiru Portfolio';
        }
        if (isAdmin) {
          if (btnCardApproveSync) {
            btnCardApproveSync.classList.remove('hidden');
            btnCardApproveSync.disabled = false;
          }
        } else {
          if (btnCardApproveSync) btnCardApproveSync.classList.add('hidden');
        }
        if (btnCardViewLive) btnCardViewLive.classList.add('hidden');
        if (btnCardRollbackSync) btnCardRollbackSync.classList.add('hidden');
      }
    }
  }

  // Header quick sync actions
  if (btnHeaderApproveSync) {
    btnHeaderApproveSync.addEventListener('click', () => {
      if (currentResultData) {
        openApproveSyncModal(currentResultData);
      }
    });
  }

  if (btnHeaderRollbackSync) {
    btnHeaderRollbackSync.addEventListener('click', () => {
      if (currentResultData) {
        openRollbackModal(currentResultData);
      }
    });
  }

  // Card sync actions
  if (btnCardApproveSync) {
    btnCardApproveSync.addEventListener('click', () => {
      if (currentResultData) {
        openApproveSyncModal(currentResultData);
      }
    });
  }

  if (btnCardRollbackSync) {
    btnCardRollbackSync.addEventListener('click', () => {
      if (currentResultData) {
        openRollbackModal(currentResultData);
      }
    });
  }

  // --------------------------------------------------------------------------
  // Shinjiru Portfolio Sync Settings Management (Inside RBAC User Modal)
  // --------------------------------------------------------------------------
  async function loadSyncSettings() {
    if (!syncSettingTargetSite) return;
    try {
      const res = await fetch('/api/sync/settings');
      if (!res.ok) throw new Error('Failed to load sync settings');
      const data = await res.json();
      const s = data.settings || {};
      syncSettingTargetSite.value = s.target_site || 'https://wwwdev.shinjiru.com.my';
      if (syncSettingPortfolioUrl) syncSettingPortfolioUrl.value = s.portfolio_page_url || 'https://wwwdev.shinjiru.com.my/web-design/web-design-portfolios/';
      if (syncSettingEndpoint) syncSettingEndpoint.value = s.sync_endpoint || 'https://wwwdev.shinjiru.com.my/wp-json/shinjiru-portfolio/v1/sync';
      if (syncSettingToken) syncSettingToken.value = s.secret_token || '';

      if (Array.isArray(data.industries) && data.industries.length > 0) {
        SHINJIRU_INDUSTRIES.length = 0;
        SHINJIRU_INDUSTRIES.push(...data.industries);
      }
    } catch (err) {
      console.error('Error loading sync settings:', err);
    }
  }

  if (btnTestSyncHealth) {
    btnTestSyncHealth.addEventListener('click', async () => {
      btnTestSyncHealth.disabled = true;
      if (syncConnectionStatusText) syncConnectionStatusText.textContent = 'Testing connection...';
      if (syncConnectionIndicator) {
        const dot = syncConnectionIndicator.querySelector('.status-dot');
        if (dot) dot.className = 'status-dot unknown';
      }

      try {
        let res = await fetch('/api/sync/health');
        let data = await res.json();
        const dot = syncConnectionIndicator ? syncConnectionIndicator.querySelector('.status-dot') : null;

        // If server-side was blocked by firewall, fallback to direct client connection check
        if (!data.success && syncSettingEndpoint && syncSettingToken) {
          const healthUrl = syncSettingEndpoint.value.replace(/\/sync\/?$/, '/health');
          try {
            const clientRes = await fetch(healthUrl, {
              headers: { 'X-Shinjiru-Sync-Token': syncSettingToken.value }
            });
            if (clientRes.ok) {
              const clientData = await clientRes.json();
              data = {
                success: true,
                target_site: syncSettingTargetSite.value,
                data: clientData,
                note: '(Client Direct Mode)'
              };
            }
          } catch (e) {
            // Keep original server error
          }
        }

        if (data.success) {
          if (dot) dot.className = 'status-dot online';
          if (syncConnectionStatusText) syncConnectionStatusText.textContent = `Connected (REST API 200 OK ${data.note || ''})`.trim();
          if (syncConnectionDetails) {
            const itemCount = data.data && data.data.total_cards ? `${data.data.total_cards} live showcases registered.` : 'Plugin active.';
            syncConnectionDetails.textContent = `Connected to ${data.target_site}. ${itemCount}`;
          }
          showToast('Shinjiru WordPress REST API connected successfully', 'success');
        } else {
          if (dot) dot.className = 'status-dot offline';
          if (syncConnectionStatusText) syncConnectionStatusText.textContent = 'Connection Failed';
          if (syncConnectionDetails) syncConnectionDetails.textContent = `Error: ${data.error || 'Server returned non-200'}`;
          showToast(`Health check error: ${data.error || 'Check endpoint'}`, 'error');
        }
      } catch (err) {
        const dot = syncConnectionIndicator ? syncConnectionIndicator.querySelector('.status-dot') : null;
        if (dot) dot.className = 'status-dot offline';
        if (syncConnectionStatusText) syncConnectionStatusText.textContent = 'Network Error';
        if (syncConnectionDetails) syncConnectionDetails.textContent = err.message;
        showToast('Failed to reach sync health endpoint', 'error');
      } finally {
        btnTestSyncHealth.disabled = false;
      }
    });
  }

  if (syncSettingsForm) {
    syncSettingsForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (syncSettingsAlert) {
        syncSettingsAlert.className = 'modal-alert hidden';
        syncSettingsAlert.textContent = '';
      }
      const payload = {
        target_site: syncSettingTargetSite.value.trim(),
        portfolio_page_url: syncSettingPortfolioUrl.value.trim(),
        sync_endpoint: syncSettingEndpoint.value.trim(),
        secret_token: syncSettingToken.value.trim()
      };

      if (saveSyncSettingsBtn) saveSyncSettingsBtn.disabled = true;

      try {
        const res = await fetch('/api/sync/settings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        const data = await res.json();
        if (!res.ok || !data.success) {
          throw new Error(data.detail || 'Failed to save sync settings.');
        }

        if (syncSettingsAlert) {
          syncSettingsAlert.className = 'modal-alert success';
          syncSettingsAlert.textContent = 'Portfolio sync settings updated successfully.';
        }
        showToast('Sync settings saved', 'success');
      } catch (err) {
        if (syncSettingsAlert) {
          syncSettingsAlert.className = 'modal-alert error';
          syncSettingsAlert.textContent = err.message;
        }
        showToast(err.message, 'error');
      } finally {
        if (saveSyncSettingsBtn) saveSyncSettingsBtn.disabled = false;
      }
    });
  }

  if (toggleSyncTokenBtn && syncSettingToken) {
    toggleSyncTokenBtn.addEventListener('click', () => {
      syncSettingToken.type = syncSettingToken.type === 'password' ? 'text' : 'password';
    });
  }

  // Universal Escape Key Handler for All Sheets & Modals
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (userModal && !userModal.classList.contains('hidden')) userModal.classList.add('hidden');
      if (editShowcaseModal && !editShowcaseModal.classList.contains('hidden')) closeEditModal();
      if (confirmDeleteModal && !confirmDeleteModal.classList.contains('hidden')) closeDeleteModal();
      if (approveSyncModal && !approveSyncModal.classList.contains('hidden')) closeApproveSyncModal();
      if (confirmRollbackModal && !confirmRollbackModal.classList.contains('hidden')) closeRollbackModal();
    }
  });

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

    // Mobile Drawer elements
    const drawerAvatar = document.getElementById('drawer-user-avatar');
    const drawerName = document.getElementById('drawer-user-display-name');
    const drawerBadge = document.getElementById('drawer-user-role-badge');
    const drawerManageBtn = document.getElementById('drawer-manage-users-btn');

    const displayName = user.display_name || user.username;
    const initial = (user.username || 'U').charAt(0).toUpperCase();
    const roleUpper = (user.role || 'viewer').toUpperCase();

    if (nameEl) nameEl.textContent = displayName;
    if (avatarEl) avatarEl.textContent = initial;
    if (badgeEl) {
      badgeEl.textContent = roleUpper;
      badgeEl.className = `role-badge role-${user.role}`;
    }

    if (drawerName) drawerName.textContent = displayName;
    if (drawerAvatar) drawerAvatar.textContent = initial;
    if (drawerBadge) {
      drawerBadge.textContent = roleUpper;
      drawerBadge.className = `drawer-user-role role-badge role-${user.role}`;
    }

    if (user.role === 'admin') {
      if (manageUsersBtn) manageUsersBtn.classList.remove('hidden');
      if (drawerManageBtn) drawerManageBtn.classList.remove('hidden');
    } else {
      if (manageUsersBtn) manageUsersBtn.classList.add('hidden');
      if (drawerManageBtn) drawerManageBtn.classList.add('hidden');
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

    if (currentResultData) {
      updateResultSyncUI(currentResultData);
    }

    // Re-render gallery cards with current user RBAC permissions (showing/hiding edit/delete actions)
    renderHistory();
  }

  // Mobile Hamburger & Side Drawer Handlers
  const mobileHamburgerBtn = document.getElementById('mobile-hamburger-btn');
  const mobileDrawerOverlay = document.getElementById('mobile-drawer-overlay');
  const drawerCloseBtn = document.getElementById('drawer-close-btn');
  const drawerLogoutBtn = document.getElementById('drawer-logout-btn');
  const drawerManageUsersBtn = document.getElementById('drawer-manage-users-btn');

  function openMobileDrawer() {
    if (!mobileDrawerOverlay) return;
    mobileDrawerOverlay.classList.remove('hidden');
    mobileDrawerOverlay.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function closeMobileDrawer() {
    if (!mobileDrawerOverlay) return;
    mobileDrawerOverlay.classList.add('hidden');
    mobileDrawerOverlay.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  if (mobileHamburgerBtn) {
    mobileHamburgerBtn.addEventListener('click', openMobileDrawer);
  }

  if (drawerCloseBtn) {
    drawerCloseBtn.addEventListener('click', closeMobileDrawer);
  }

  if (mobileDrawerOverlay) {
    mobileDrawerOverlay.addEventListener('click', (e) => {
      if (e.target === mobileDrawerOverlay) {
        closeMobileDrawer();
      }
    });
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && mobileDrawerOverlay && !mobileDrawerOverlay.classList.contains('hidden')) {
      closeMobileDrawer();
    }
  });

  if (drawerManageUsersBtn) {
    drawerManageUsersBtn.addEventListener('click', () => {
      closeMobileDrawer();
      if (userModal) {
        userModal.classList.remove('hidden');
        loadUsers();
      }
    });
  }

  // Logout Handlers
  async function performLogout() {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (e) {}
    localStorage.removeItem('portfolio_user');
    window.location.href = '/login';
  }

  if (logoutBtn) {
    logoutBtn.addEventListener('click', performLogout);
  }

  if (drawerLogoutBtn) {
    drawerLogoutBtn.addEventListener('click', performLogout);
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

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && !userModal.classList.contains('hidden')) {
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
      } else if (targetId === 'tab-sync-settings') {
        loadSyncSettings();
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
              showToast(data.detail || 'Could not delete user.', 'error');
              return;
            }
            loadUsersList();
            showToast(`User '${targetUser}' deleted successfully`, 'success');
          } catch (err) {
            showToast('Network error while deleting user.', 'error');
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
  // Mode Switcher & Batch Queue Logic
  // --------------------------------------------------------------------------
  function setGenerationMode(mode) {
    currentGenerationMode = mode;
    if (mode === 'single') {
      if (modeBtnSingle) {
        modeBtnSingle.classList.add('active');
        modeBtnSingle.setAttribute('aria-selected', 'true');
      }
      if (modeBtnBatch) {
        modeBtnBatch.classList.remove('active');
        modeBtnBatch.setAttribute('aria-selected', 'false');
      }
      if (singleInputMode) singleInputMode.classList.remove('hidden');
      if (batchInputMode) batchInputMode.classList.add('hidden');
      if (urlInput) urlInput.required = true;
      updateSubmitButtonText();
    } else {
      if (modeBtnBatch) {
        modeBtnBatch.classList.add('active');
        modeBtnBatch.setAttribute('aria-selected', 'true');
      }
      if (modeBtnSingle) {
        modeBtnSingle.classList.remove('active');
        modeBtnSingle.setAttribute('aria-selected', 'false');
      }
      if (singleInputMode) singleInputMode.classList.add('hidden');
      if (batchInputMode) batchInputMode.classList.remove('hidden');
      if (urlInput) urlInput.required = false;
      updateBatchBadge();
      updateSubmitButtonText();
    }
  }

  if (modeBtnSingle) modeBtnSingle.addEventListener('click', () => setGenerationMode('single'));
  if (modeBtnBatch) modeBtnBatch.addEventListener('click', () => setGenerationMode('batch'));

  function getBatchUrls() {
    if (!batchUrlsInput) return [];
    const lines = batchUrlsInput.value.split('\n');
    const urls = [];
    const seen = new Set();
    for (let line of lines) {
      let u = line.trim();
      if (!u) continue;
      if (!u.startsWith('http://') && !u.startsWith('https://')) {
        u = 'https://' + u;
      }
      if (!seen.has(u)) {
        seen.add(u);
        urls.push(u);
      }
    }
    return urls;
  }

  function updateBatchBadge() {
    const count = getBatchUrls().length;
    if (batchDetectedBadge) {
      batchDetectedBadge.textContent = `${count} ${count === 1 ? 'website' : 'websites'}`;
    }
    updateSubmitButtonText();
  }

  function updateSubmitButtonText() {
    const btnText = generateBtn ? generateBtn.querySelector('.btn-text') : null;
    if (!btnText) return;
    if (currentUser && currentUser.role === 'viewer') {
      btnText.textContent = 'Viewing Mode (Disabled)';
      return;
    }
    if (currentGenerationMode === 'single') {
      btnText.textContent = 'Generate Portfolio Showcase';
    } else {
      const count = getBatchUrls().length;
      btnText.textContent = count > 0 ? `Generate Batch Showcase (${count} ${count === 1 ? 'Site' : 'Sites'})` : 'Generate Batch Showcases';
    }
  }

  if (batchUrlsInput) {
    batchUrlsInput.addEventListener('input', updateBatchBadge);
  }

  if (btnSampleSites && batchUrlsInput) {
    btnSampleSites.addEventListener('click', () => {
      batchUrlsInput.value = 'https://apple.com\nhttps://stripe.com\nhttps://linear.app\nhttps://framer.com';
      updateBatchBadge();
      showToast('Loaded 4 sample design websites into batch queue', 'info');
    });
  }

  if (batchClearBtn && batchUrlsInput) {
    batchClearBtn.addEventListener('click', () => {
      batchUrlsInput.value = '';
      updateBatchBadge();
    });
  }

  // --------------------------------------------------------------------------
  // Interactive Apple 3D Device Stage & Capsule Progress Controller
  // --------------------------------------------------------------------------
  let progressTextAnimTimer = null;
  function updateProgress(percent, msg, activeStepKey) {
    if (progressBarFill) {
      progressBarFill.style.width = `${percent}%`;
    }
    if (progressPct) {
      progressPct.textContent = `${Math.round(percent)}%`;
      // Subtle pulse on badge update
      progressPct.style.transform = 'scale(1.08)';
      setTimeout(() => { if (progressPct) progressPct.style.transform = 'scale(1)'; }, 180);
    }
    if (progressText && msg) {
      if (progressText.textContent !== msg) {
        progressText.classList.add('anim-fade-out');
        clearTimeout(progressTextAnimTimer);
        progressTextAnimTimer = setTimeout(() => {
          progressText.textContent = msg;
          progressText.classList.remove('anim-fade-out');
          progressText.classList.add('anim-fade-in');
          setTimeout(() => { if (progressText) progressText.classList.remove('anim-fade-in'); }, 300);
        }, 130);
      }
    }

    // 3D Apple Vector Device Deck Illuminations
    if (activeStepKey === 'desk') {
      if (deckMacbook) deckMacbook.className = 'deck-device deck-macbook capturing-active';
      if (deckIphone) deckIphone.className = 'deck-device deck-iphone';
      if (deckIpad) deckIpad.className = 'deck-device deck-ipad';
    } else if (activeStepKey === 'mob') {
      if (deckMacbook) deckMacbook.className = 'deck-device deck-macbook captured-done';
      if (deckIphone) deckIphone.className = 'deck-device deck-iphone capturing-active';
      if (deckIpad) deckIpad.className = 'deck-device deck-ipad';
    } else if (activeStepKey === 'tab') {
      if (deckMacbook) deckMacbook.className = 'deck-device deck-macbook captured-done';
      if (deckIphone) deckIphone.className = 'deck-device deck-iphone captured-done';
      if (deckIpad) deckIpad.className = 'deck-device deck-ipad capturing-active';
    } else if (activeStepKey === 'frame' || activeStepKey === 'comp') {
      if (deckMacbook) deckMacbook.className = 'deck-device deck-macbook capturing-active';
      if (deckIphone) deckIphone.className = 'deck-device deck-iphone capturing-active';
      if (deckIpad) deckIpad.className = 'deck-device deck-ipad capturing-active';
    } else if (activeStepKey === 'exp') {
      if (deckMacbook) deckMacbook.className = 'deck-device deck-macbook captured-done';
      if (deckIphone) deckIphone.className = 'deck-device deck-iphone captured-done';
      if (deckIpad) deckIpad.className = 'deck-device deck-ipad captured-done';
    }

    // Update Step Pills
    if (activeStepKey) {
      const steps = ['desk', 'mob', 'tab', 'frame', 'comp', 'exp'];
      const currentIndex = steps.indexOf(activeStepKey);
      stepPills.forEach(pill => {
        const pillIndex = steps.indexOf(pill.dataset.step);
        if (pillIndex === currentIndex) {
          pill.classList.add('active');
          pill.classList.remove('done');
        } else if (pillIndex < currentIndex) {
          pill.classList.add('done');
          pill.classList.remove('active');
        } else {
          pill.classList.remove('active', 'done');
        }
      });
    }
  }

  function resetStepPills() {
    stepPills.forEach(pill => pill.classList.remove('active', 'done'));
    if (deckMacbook) deckMacbook.className = 'deck-device deck-macbook';
    if (deckIphone) deckIphone.className = 'deck-device deck-iphone';
    if (deckIpad) deckIpad.className = 'deck-device deck-ipad';
    if (progressBarFill) progressBarFill.style.width = '0%';
    if (progressPct) progressPct.textContent = '0%';
  }

  // Batch Queue Item Renderer
  function renderBatchQueue(urls) {
    if (!batchQueueList) return;
    batchQueueList.innerHTML = urls.map((u, i) => `
      <div class="batch-queue-item" id="batch-item-${i}">
        <div class="batch-item-left">
          <span class="batch-item-index">${i + 1}</span>
          <span class="batch-item-url" title="${escapeHtml(u)}">${escapeHtml(u)}</span>
        </div>
        <div class="batch-item-status" id="batch-item-status-${i}">
          <span class="batch-item-status-chip status-waiting">Waiting in Queue</span>
        </div>
      </div>
    `).join('');
  }

  function updateBatchQueueItems(urls, completed, errors, currentIndex, overallStatus) {
    urls.forEach((u, i) => {
      const statusContainer = document.getElementById(`batch-item-status-${i}`);
      if (!statusContainer) return;

      const foundComp = completed.find(c => c.url === u);
      if (foundComp) {
        statusContainer.innerHTML = `
          <span class="batch-item-status-chip status-done">✓ Completed</span>
          <button type="button" class="batch-preview-link" data-slug="${escapeHtml(foundComp.slug)}">Preview</button>
        `;
        const btn = statusContainer.querySelector('.batch-preview-link');
        if (btn) {
          btn.addEventListener('click', () => {
            displayResult(foundComp);
            if (resultsCard) resultsCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
          });
        }
        return;
      }

      const foundErr = errors.find(e => e.url === u);
      if (foundErr) {
        statusContainer.innerHTML = `
          <span class="batch-item-status-chip status-error" title="${escapeHtml(foundErr.error)}">✕ Failed</span>
        `;
        return;
      }

      if (i === currentIndex && overallStatus === 'processing') {
        statusContainer.innerHTML = `
          <span class="batch-item-status-chip status-capturing">Capturing...</span>
        `;
      } else if (i > currentIndex) {
        statusContainer.innerHTML = `
          <span class="batch-item-status-chip status-waiting">Waiting</span>
        `;
      }
    });
  }

  function listenToBatchEvents(batchId, urls) {
    let finished = false;
    const evtSource = new EventSource(`/api/batch/${encodeURIComponent(batchId)}/events`);

    function handleBatchState(job) {
      const completed = job.completed || [];
      const errors = job.errors || [];
      const total = job.total || urls.length;
      const progress = job.progress || 0;
      const currentStep = job.current_step || 'Processing queue...';
      const currentIndex = job.current_index || 0;

      if (batchDeckCounter) {
        batchDeckCounter.textContent = `${completed.length} of ${total} Completed`;
      }

      const stepsCycle = ['desk', 'mob', 'tab', 'frame', 'comp', 'exp'];
      const activeStep = stepsCycle[(currentIndex + completed.length) % stepsCycle.length];
      updateProgress(progress, `[${currentIndex + 1}/${total}] ${currentStep}`, activeStep);

      updateBatchQueueItems(urls, completed, errors, currentIndex, job.status);

      if (job.status === 'completed') {
        finished = true;
        evtSource.close();
        updateProgress(100, `Batch completed! ${completed.length} showcases generated.`, 'exp');
        loadHistory();
        showToast(`Batch generation complete: ${completed.length} showcases generated!`, 'success');

        if (completed.length > 0) {
          displayResult(completed[completed.length - 1]);
        }
        generateBtn.disabled = false;
        updateSubmitButtonText();
      }
    }

    evtSource.onmessage = (event) => {
      try {
        const job = JSON.parse(event.data);
        handleBatchState(job);
      } catch (e) {}
    };

    evtSource.onerror = () => {
      evtSource.close();
      if (!finished) {
        pollBatchStatus(batchId, urls);
      }
    };
  }

  async function pollBatchStatus(batchId, urls) {
    const pollInterval = setInterval(async () => {
      try {
        const res = await fetch(`/api/batch/${encodeURIComponent(batchId)}`);
        if (!res.ok) return;
        const job = await res.json();
        
        const completed = job.completed || [];
        const errors = job.errors || [];
        const total = job.total || urls.length;
        const progress = job.progress || 0;
        const currentStep = job.current_step || 'Processing queue...';
        const currentIndex = job.current_index || 0;

        if (batchDeckCounter) {
          batchDeckCounter.textContent = `${completed.length} of ${total} Completed`;
        }

        const stepsCycle = ['desk', 'mob', 'tab', 'frame', 'comp', 'exp'];
        const activeStep = stepsCycle[(currentIndex + completed.length) % stepsCycle.length];
        updateProgress(progress, `[${currentIndex + 1}/${total}] ${currentStep}`, activeStep);

        updateBatchQueueItems(urls, completed, errors, currentIndex, job.status);

        if (job.status === 'completed') {
          clearInterval(pollInterval);
          updateProgress(100, `Batch completed! ${completed.length} showcases generated.`, 'exp');
          loadHistory();
          showToast(`Batch generation complete: ${completed.length} showcases generated!`, 'success');
          if (completed.length > 0) {
            displayResult(completed[completed.length - 1]);
          }
          generateBtn.disabled = false;
          updateSubmitButtonText();
        }
      } catch (e) {}
    }, 2000);
  }

  // --------------------------------------------------------------------------
  // Generator Pipeline Form Submit (Single & Batch Modes)
  // --------------------------------------------------------------------------
  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      if (currentUser && currentUser.role === 'viewer') {
        showToast("Viewers cannot generate showcases. Please contact an administrator or creator.", "error");
        return;
      }

      // --- BATCH MODE EXECUTION ---
      if (currentGenerationMode === 'batch') {
        const urls = getBatchUrls();
        if (urls.length === 0) {
          showToast('Please enter at least one website URL in the batch queue.', 'error');
          return;
        }
        if (urls.length > 15) {
          showToast('Maximum 15 websites allowed per batch run to maintain server stability.', 'error');
          return;
        }

        generateBtn.disabled = true;
        const btnText = generateBtn.querySelector('.btn-text');
        if (btnText) btnText.textContent = `Processing Batch (${urls.length} sites)...`;

        if (progressContainer) progressContainer.classList.remove('hidden');
        if (batchProgressDeck) batchProgressDeck.classList.remove('hidden');
        if (resultsCard) resultsCard.classList.add('hidden');

        resetStepPills();
        updateProgress(5, `Starting batch execution for ${urls.length} websites...`, 'desk');
        renderBatchQueue(urls);

        const payload = {
          urls: urls,
          category: categorySelect ? categorySelect.value : null,
          type: typeSelect ? typeSelect.value : null,
          mobile_finish: mobileFinishSelect ? mobileFinishSelect.value : 'deep-blue',
          tablet_finish: tabletFinishSelect ? tabletFinishSelect.value : 'space-black',
          bg_color: bgColorSelect ? bgColorSelect.value : '#E5E5E5',
          shadow_intensity: shadowSelect ? shadowSelect.value : 'normal',
          delay: delaySelect ? parseFloat(delaySelect.value) : 2.5,
          headless: browserModeSelect ? (browserModeSelect.value === 'headless') : true
        };

        try {
          const res = await fetch('/api/generate-batch', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          });
          const batchData = await res.json();
          if (!res.ok) {
            throw new Error(batchData.detail || 'Failed to start batch generation');
          }

          listenToBatchEvents(batchData.batch_id, urls);
        } catch (err) {
          showToast(`Batch Error: ${err.message}`, 'error');
          generateBtn.disabled = false;
          updateSubmitButtonText();
          if (progressContainer) progressContainer.classList.add('hidden');
        }
        return;
      }

      // --- SINGLE WEBSITE MODE EXECUTION ---
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
      if (batchProgressDeck) batchProgressDeck.classList.add('hidden');
      if (resultsCard) resultsCard.classList.add('hidden');

      resetStepPills();

      const pipelineStages = [
        { pct: 10, msg: 'Connecting to target website & resolving DNS...', key: 'desk' },
        { pct: 24, msg: 'Launching Chromium browser & establishing secure handshake...', key: 'desk' },
        { pct: 40, msg: 'Capturing ultra-HD desktop viewport (1920×1080)...', key: 'desk' },
        { pct: 55, msg: 'Emulating iPhone 15 Pro Max Safari viewport...', key: 'mob' },
        { pct: 70, msg: 'Emulating iPad Pro 12.9″ Retina viewport...', key: 'tab' },
        { pct: 82, msg: 'Framing devices with precision titanium bezels & reflections...', key: 'frame' },
        { pct: 92, msg: 'Compositing multi-device 3D studio shadows & lighting...', key: 'comp' },
        { pct: 96, msg: 'Optimizing WebP, lossless PNG & building ZIP bundle...', key: 'exp' }
      ];

      let currentStageIdx = 0;
      updateProgress(pipelineStages[0].pct, pipelineStages[0].msg, pipelineStages[0].key);

      const stageDelays = [900, 1300, 1500, 1700, 1700, 1500, 1400];
      let stepTimeout = null;

      function advancePipeline() {
        currentStageIdx++;
        if (currentStageIdx < pipelineStages.length) {
          const st = pipelineStages[currentStageIdx];
          updateProgress(st.pct, st.msg, st.key);
          const nextDelay = stageDelays[currentStageIdx - 1] || 1500;
          stepTimeout = setTimeout(advancePipeline, nextDelay);
        } else {
          updateProgress(97, 'Finalizing asset packaging & metadata verification...', 'exp');
        }
      }
      stepTimeout = setTimeout(advancePipeline, stageDelays[0]);

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

        clearTimeout(stepTimeout);

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ detail: 'Generation failed' }));
          throw new Error(errorData.detail || 'An unexpected error occurred during generation');
        }

        const data = await response.json();
        updateProgress(100, 'Showcase completed!', 'exp');

        setTimeout(() => {
          if (progressContainer) progressContainer.classList.add('hidden');
          displayResult(data);
          loadHistory();
          showToast(`Showcase "${data.title || 'Project'}" created successfully!`, 'success');
        }, 500);

      } catch (err) {
        clearTimeout(stepTimeout);
        showToast(`Generation Failed: ${err.message}`, 'error');
        if (progressContainer) progressContainer.classList.add('hidden');
      } finally {
        clearTimeout(stepTimeout);
        generateBtn.disabled = false;
        updateSubmitButtonText();
      }
    });
  }

  // --------------------------------------------------------------------------
  // Display Generated Result
  // --------------------------------------------------------------------------
  function displayResult(data, shouldScroll = true) {
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

    // Update Shinjiru Live Sync Status & Actions
    updateResultSyncUI(data);

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

    // Scroll smoothly to results card only if explicitly requested
    if (shouldScroll) {
      resultsCard.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
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
    let fallbackSrc = '';

    switch (viewType) {
      case 'showcase':
        targetSrc = ex.showcase_webp || ex.showcase_png;
        fallbackSrc = ex.showcase_png || ex.showcase_jpg || '';
        break;
      case 'mobile':
        targetSrc = ex.mobile_webp || ex.mobile_png;
        fallbackSrc = ex.mobile_png || ex.mobile_jpg || '';
        break;
      case 'tablet':
        targetSrc = ex.tablet_webp || ex.tablet_png;
        fallbackSrc = ex.tablet_png || ex.tablet_jpg || '';
        break;
      case 'desktop':
        targetSrc = ex.desktop_webp || ex.desktop_png;
        fallbackSrc = ex.desktop_png || ex.desktop_jpg || '';
        break;
      default:
        targetSrc = ex.showcase_webp || ex.showcase_png;
        fallbackSrc = ex.showcase_png || ex.showcase_jpg || '';
    }

    if (resultPreviewImg && targetSrc) {
      resultPreviewImg.dataset.fallback = fallbackSrc;
      resultPreviewImg.onerror = function() {
        if (this.dataset.fallback && this.src !== this.dataset.fallback) {
          console.warn('Preview fallback triggered:', this.dataset.fallback);
          this.src = this.dataset.fallback;
        }
      };
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

    const canModify = currentUser && (currentUser.role === 'admin' || currentUser.role === 'creator');
    const isAdmin = currentUser && currentUser.role === 'admin';
    const isGuest = currentUser && currentUser.role === 'guest';

    // Render cards with Apple Liquid Glass Action Menus & Tooltips
    historyGrid.innerHTML = pageItems.map(item => {
      const primaryThumb = (item.exports && (item.exports.showcase_webp || item.exports.showcase_png)) || '';
      const fallbackThumb = (item.exports && (item.exports.showcase_png || item.exports.showcase_jpg)) || '';
      const isSynced = item.sync_status === 'synced';
      return `
      <div class="history-card-item" data-slug="${escapeHtml(item.slug)}">
        <div class="history-thumb">
          ${primaryThumb 
            ? `<img src="${escapeHtml(primaryThumb)}" data-fallback="${escapeHtml(fallbackThumb)}" alt="${escapeHtml(item.title)}" loading="lazy" onerror="if(this.dataset.fallback && this.src !== this.dataset.fallback){ this.src=this.dataset.fallback; } else { this.style.opacity='0'; }" />` 
            : `<div class="empty-thumb-placeholder">
                 <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="36" height="36" style="opacity:0.35">
                   <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                   <circle cx="8.5" cy="8.5" r="1.5"></circle>
                   <polyline points="21 15 16 10 5 21"></polyline>
                 </svg>
               </div>`
          }
          <div class="card-actions-bar" onclick="event.stopPropagation()">
            <button type="button" class="card-action-btn btn-preview" data-slug="${escapeHtml(item.slug)}" data-tooltip="Preview in Studio" aria-label="Preview in Studio">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                <circle cx="12" cy="12" r="3"></circle>
              </svg>
            </button>
            <button type="button" class="card-action-btn btn-copy-url" data-url="${escapeHtml(item.url)}" data-tooltip="Copy URL" aria-label="Copy Website URL">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
                <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
              </svg>
            </button>
            ${isAdmin ? `
              ${isSynced ? `
                <button type="button" class="card-action-btn btn-sync-rollback" data-slug="${escapeHtml(item.slug)}" data-tooltip="Rollback from Shinjiru" aria-label="Rollback from Shinjiru">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="1 4 1 10 7 10"></polyline>
                    <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"></path>
                  </svg>
                </button>
                <a href="${escapeHtml(item.synced_portfolio_page || 'https://wwwdev.shinjiru.com.my/web-design/web-design-portfolios/')}" target="_blank" rel="noopener noreferrer" class="card-action-btn btn-sync-live" data-tooltip="View Live on Shinjiru" aria-label="View Live on Shinjiru" onclick="event.stopPropagation()">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                    <polyline points="15 3 21 3 21 9"></polyline>
                    <line x1="10" y1="14" x2="21" y2="3"></line>
                  </svg>
                </a>
              ` : `
                <button type="button" class="card-action-btn btn-sync-publish" data-slug="${escapeHtml(item.slug)}" data-tooltip="Approve & Upload to Shinjiru" aria-label="Approve & Upload to Shinjiru">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                    <polyline points="17 8 12 3 7 8"></polyline>
                    <line x1="12" y1="3" x2="12" y2="15"></line>
                  </svg>
                </button>
              `}
            ` : ''}
            ${canModify ? `
              <button type="button" class="card-action-btn btn-edit" data-slug="${escapeHtml(item.slug)}" data-tooltip="Edit Details" aria-label="Edit Showcase Details">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                </svg>
              </button>
              <button type="button" class="card-action-btn btn-delete" data-slug="${escapeHtml(item.slug)}" data-tooltip="Delete Showcase" aria-label="Delete Showcase">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="3 6 5 6 21 6"></polyline>
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                  <line x1="10" y1="11" x2="10" y2="17"></line>
                  <line x1="14" y1="11" x2="14" y2="17"></line>
                </svg>
              </button>
            ` : (isGuest ? `
              <button type="button" class="card-action-btn btn-delete guest-restricted" data-slug="${escapeHtml(item.slug)}" data-tooltip="Delete Showcase (Protected)" aria-label="Delete Showcase">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="3 6 5 6 21 6"></polyline>
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                  <line x1="10" y1="11" x2="10" y2="17"></line>
                  <line x1="14" y1="11" x2="14" y2="17"></line>
                </svg>
              </button>
            ` : '')}
          </div>
        </div>
        <div class="history-meta">
          <div class="history-title" title="${escapeHtml(item.title)}">${escapeHtml(item.title)}</div>
          <div class="history-url" title="${escapeHtml(item.url)}">${escapeHtml(item.url)}</div>
          <div class="history-tags">
            ${isSynced 
              ? `<span class="badge-tag sync-live" title="Live on Shinjiru Web Design Portfolio">● Live on Shinjiru</span>` 
              : `<span class="badge-tag sync-draft" title="Draft (Not uploaded to Shinjiru)">Draft</span>`}
            ${item.category ? `<span class="badge-tag">${escapeHtml(item.category)}</span>` : ''}
            ${item.type ? `<span class="badge-tag accent">${escapeHtml(item.type)}</span>` : ''}
          </div>
        </div>
      </div>
      `;
    }).join('');

    // Attach click events on card body -> preview
    historyGrid.querySelectorAll('.history-card-item').forEach(el => {
      el.addEventListener('click', () => {
        const slug = el.dataset.slug;
        const found = allHistory.find(h => h.slug === slug);
        if (found) {
          displayResult(found);
          if (resultsCard) {
            resultsCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
          }
        }
      });
    });

    // Preview button
    historyGrid.querySelectorAll('.btn-preview').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const slug = btn.dataset.slug;
        const found = allHistory.find(h => h.slug === slug);
        if (found) {
          displayResult(found);
          if (resultsCard) {
            resultsCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
          }
          showToast(`Viewing "${found.title || slug}"`, 'info');
        }
      });
    });

    // Copy URL button
    historyGrid.querySelectorAll('.btn-copy-url').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        e.stopPropagation();
        const url = btn.dataset.url;
        if (!url) return;
        try {
          await navigator.clipboard.writeText(url);
          showToast('Link copied to clipboard', 'success');
        } catch (err) {
          const ta = document.createElement('textarea');
          ta.value = url;
          document.body.appendChild(ta);
          ta.select();
          document.execCommand('copy');
          ta.remove();
          showToast('Link copied to clipboard', 'success');
        }
      });
    });

    // Edit button (Sheet Modal)
    historyGrid.querySelectorAll('.btn-edit').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const slug = btn.dataset.slug;
        const found = allHistory.find(h => h.slug === slug);
        if (found) openEditModal(found);
      });
    });

    // Delete button (Confirmation Dialog or Guest Protection Alert)
    historyGrid.querySelectorAll('.btn-delete').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (currentUser && currentUser.role === 'guest') {
          showToast('Guest accounts cannot delete project showcases. Please sign in with an Administrator or Creator account.', 'error');
          return;
        }
        const slug = btn.dataset.slug;
        const found = allHistory.find(h => h.slug === slug);
        if (found) openDeleteModal(found);
      });
    });

    // Approve & Upload button on card (Admin only)
    historyGrid.querySelectorAll('.btn-sync-publish').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const slug = btn.dataset.slug;
        const found = allHistory.find(h => h.slug === slug);
        if (found) openApproveSyncModal(found);
      });
    });

    // Rollback button on card (Admin only)
    historyGrid.querySelectorAll('.btn-sync-rollback').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const slug = btn.dataset.slug;
        const found = allHistory.find(h => h.slug === slug);
        if (found) openRollbackModal(found);
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

      // Maintain initial view on generator deck; clicking any showcase in gallery opens results
    } catch (e) {
      console.error('Failed to load project history:', e);
    }
  }

  // Initialize Auth & History on Boot
  checkAuth();
  loadHistory();
});
