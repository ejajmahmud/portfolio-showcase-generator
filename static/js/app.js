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

  // Quick New Showcase Button (Smooth scroll to generator form with focus pulse)
  if (quickNewShowcaseBtn) {
    quickNewShowcaseBtn.addEventListener('click', () => {
      if (currentUser && currentUser.role === 'viewer') {
        showToast('Viewers cannot create showcases. Creator role required.', 'error');
        return;
      }
      const genCard = document.querySelector('.generator-card') || form;
      if (genCard) {
        genCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      if (urlInput) {
        setTimeout(() => {
          urlInput.focus();
          urlInput.classList.add('input-pulse-highlight');
          setTimeout(() => urlInput.classList.remove('input-pulse-highlight'), 1200);
        }, 300);
      }
    });
  }

  // Universal Escape Key Handler for All Sheets & Modals
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (userModal && !userModal.classList.contains('hidden')) userModal.classList.add('hidden');
      if (editShowcaseModal && !editShowcaseModal.classList.contains('hidden')) closeEditModal();
      if (confirmDeleteModal && !confirmDeleteModal.classList.contains('hidden')) closeDeleteModal();
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

    // Re-render gallery cards with current user RBAC permissions (showing/hiding edit/delete actions)
    renderHistory();
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
  function updateProgress(percent, msg, activeStepKey) {
    if (progressBarFill) {
      progressBarFill.style.width = `${percent}%`;
    }
    if (progressPct) {
      progressPct.textContent = `${Math.round(percent)}%`;
    }
    if (progressText) {
      progressText.textContent = msg;
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
      updateProgress(15, 'Accessing website and capturing desktop view...', 'desk');

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

        setTimeout(() => {
          if (progressContainer) progressContainer.classList.add('hidden');
          displayResult(data);
          loadHistory();
          showToast(`Showcase "${data.title || 'Project'}" created successfully!`, 'success');
        }, 500);

      } catch (err) {
        clearInterval(stepInterval);
        showToast(`Generation Failed: ${err.message}`, 'error');
        if (progressContainer) progressContainer.classList.add('hidden');
      } finally {
        generateBtn.disabled = false;
        updateSubmitButtonText();
      }
    });
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

    const canModify = currentUser && (currentUser.role === 'admin' || currentUser.role === 'creator');

    // Render cards with Apple Liquid Glass Action Menus & Tooltips
    historyGrid.innerHTML = pageItems.map(item => {
      const thumbUrl = (item.exports && (item.exports.showcase_webp || item.exports.showcase_png)) || '';
      return `
      <div class="history-card-item" data-slug="${escapeHtml(item.slug)}">
        <div class="history-thumb">
          ${thumbUrl 
            ? `<img src="${thumbUrl}" alt="${escapeHtml(item.title)}" loading="lazy" />` 
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
            ` : ''}
          </div>
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

    // Delete button (Confirmation Dialog)
    historyGrid.querySelectorAll('.btn-delete').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const slug = btn.dataset.slug;
        const found = allHistory.find(h => h.slug === slug);
        if (found) openDeleteModal(found);
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
