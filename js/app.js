/**
 * =========================================================================
 * SONU FF STORE - APPLICATION CONTROLLER & REUSABLE GALLERY ENGINE
 * =========================================================================
 * Unified reactive rendering, modal manager, swipe gallery, and filters
 * =========================================================================
 */

document.addEventListener('DOMContentLoaded', () => {
  // Helper to ensure paths work under both web server and direct file viewing
  function resolveImgPath(src) {
    if (!src) return '';
    if (window.location.protocol === 'file:' && src.startsWith('/accounts/')) {
      return 'public' + src;
    }
    return src;
  }

  // Application State
  const state = {
    accounts: [...ACCOUNTS_DATA],
    filteredAccounts: [...ACCOUNTS_DATA],
    activeAccount: null,
    activeImageIndex: 0,
    filters: {
      search: '',
      server: 'ALL',
      primeLevel: 'ALL',
      priceRange: 'ALL',
      evoGuns: 'ALL',
      sortBy: 'featured'
    }
  };

  // DOM Elements
  const accountsGrid = document.getElementById('accountsGrid');
  const resultsCount = document.getElementById('resultsCount');
  const searchInput = document.getElementById('searchInput');
  const serverFilter = document.getElementById('serverFilter');
  const primeFilter = document.getElementById('primeFilter');
  const priceFilter = document.getElementById('priceFilter');
  const evoFilter = document.getElementById('evoFilter');
  const sortSelect = document.getElementById('sortSelect');
  const resetFiltersBtn = document.getElementById('resetFiltersBtn');

  // Modal Elements
  const detailsModal = document.getElementById('detailsModal');
  const modalBackdrop = document.getElementById('modalBackdrop');
  const modalCloseBtn = document.getElementById('modalCloseBtn');
  const modalTitle = document.getElementById('modalTitle');
  const modalGalleryMain = document.getElementById('modalGalleryMain');
  const modalGalleryCounter = document.getElementById('modalGalleryCounter');
  const modalThumbsTrack = document.getElementById('modalThumbsTrack');
  const modalPrevBtn = document.getElementById('modalPrevBtn');
  const modalNextBtn = document.getElementById('modalNextBtn');
  const modalDetailsContainer = document.getElementById('modalDetailsContainer');
  const modalWhatsAppBtn = document.getElementById('modalWhatsAppBtn');

  // Toast Element
  const toastNotification = document.getElementById('toastNotification');

  // Mobile Menu Elements
  const mobileMenuToggle = document.getElementById('mobileMenuToggle');
  const navLinks = document.getElementById('navLinks');

  /**
   * Show Toast Notification
   */
  function showToast(message) {
    if (!toastNotification) return;
    toastNotification.textContent = message;
    toastNotification.classList.add('show');
    clearTimeout(toastNotification._timer);
    toastNotification._timer = setTimeout(() => {
      toastNotification.classList.remove('show');
    }, 2800);
  }

  /**
   * Copy Text to Clipboard
   */
  window.copyToClipboard = function(text, label = 'UID') {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(() => {
        showToast(`✓ ${label} (${text}) copied to clipboard!`);
      }).catch(() => {
        fallbackCopy(text, label);
      });
    } else {
      fallbackCopy(text, label);
    }
  };

  function fallbackCopy(text, label) {
    const input = document.createElement('input');
    input.value = text;
    document.body.appendChild(input);
    input.select();
    try {
      document.execCommand('copy');
      showToast(`✓ ${label} (${text}) copied!`);
    } catch (err) {
      showToast(`UID: ${text}`);
    }
    document.body.removeChild(input);
  }

  /**
   * Format account price based on active language
   */
  function formatAccountPrice(account, lang = state.currentLang) {
    if (!account) return '';
    if (lang === 'id') {
      return account.priceIDR || ('Rp ' + Math.round((account.priceNum || 0) * 190).toLocaleString('id-ID'));
    }
    return account.price || ('₹' + (account.priceNum ? account.priceNum.toLocaleString('en-IN') : '0'));
  }

  /**
   * Render Account Cards (ONE REUSABLE COMPONENT)
   */
  function renderAccounts() {
    if (!accountsGrid) return;

    if (state.filteredAccounts.length === 0) {
      accountsGrid.innerHTML = `
        <div class="no-results-card">
          <div class="no-results-icon">🔍</div>
          <h3 class="no-results-title">No Accounts Match Your Filters</h3>
          <p class="no-results-text">Try adjusting your search criteria, server selection, or price range.</p>
          <button id="clearFiltersBtn" class="btn btn-gold-outline" style="margin-top: 15px;">Reset All Filters</button>
        </div>
      `;
      const clearBtn = document.getElementById('clearFiltersBtn');
      if (clearBtn) {
        clearBtn.addEventListener('click', resetFilters);
      }
      if (resultsCount) resultsCount.textContent = '0';
      return;
    }

    if (resultsCount) {
      resultsCount.textContent = `${state.filteredAccounts.length} of ${state.accounts.length}`;
    }

    accountsGrid.innerHTML = state.filteredAccounts.map(account => {
      const mainThumbnail = account.images && account.images.length > 0 
        ? account.images[0] 
        : 'images/accounts/placeholder.svg';

      const imageCount = account.images ? account.images.length : 0;
      const waUrl = STORE_CONFIG.getWhatsAppUrl(account.code);

      return `
        <div class="account-card" data-code="${account.code}">
          <!-- Thumbnail & Badges -->
          <div class="card-media-wrapper" onclick="openAccountDetails('${account.code}')">
            <img src="${resolveImgPath(mainThumbnail)}" 
                 alt="Sonu FF Store Account #${account.code}" 
                 class="card-thumbnail" 
                 loading="lazy"
                 onerror="this.src='data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%22400%22 height=%22240%22 viewBox=%220 0 400 240%22 fill=%22%23121216%22><rect width=%22400%22 height=%22240%22 stroke=%22%23D4AF37%22 stroke-width=%222%22/><text x=%22200%22 y=%22120%22 fill=%22%23D4AF37%22 text-anchor=%22middle%22 font-family=%22sans-serif%22 font-weight=%22bold%22>ACCOUNT %23${account.code}</text></svg>'">
            
            <div class="card-media-overlay">
              <span class="view-gallery-hint">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M4 4h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2zm0 2v12h16V6H4zm14 10l-4.5-6-3.5 4.5-2-2.5L5 16h13z"/>
                </svg>
                ${t('viewScreenshotsHint', 'View Screenshots')} (${imageCount})
              </span>
            </div>

            <!-- Server Badge -->
            <div class="card-server-pill">
              ${account.server}
            </div>

            <!-- Verified Badge -->
            <div class="card-verified-pill">
              ${t('cardVerifiedBadge', 'VERIFIED')}
            </div>

            <!-- Photo Counter Pill -->
            <div class="card-photos-count">
              📷 ${imageCount}
            </div>
          </div>

          <!-- Card Body -->
          <div class="card-body">
            <div class="card-header-row">
              <div class="account-code-wrap">
                <span class="account-code-label">${t('cardCodeLabel', 'CODE')}</span>
                <span class="account-code-number">ACCOUNT #${account.code}</span>
              </div>
              <div class="account-price-tag">
                ${formatAccountPrice(account, state.currentLang)}
              </div>
            </div>

            <!-- UID row with Copy -->
            <div class="uid-row">
              <div class="uid-info">
                <span class="uid-label">UID:</span>
                <span class="uid-val" title="Click to copy" onclick="copyToClipboard('${account.uid}', 'UID')">${account.uid}</span>
              </div>
              <button type="button" class="uid-copy-btn" title="Copy UID" onclick="copyToClipboard('${account.uid}', 'UID')">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                </svg>
              </button>
            </div>

            <!-- Account Specifications Grid -->
            <div class="specs-grid">
              <div class="spec-cell">
                <span class="spec-label">${t('cardPrimeLevel', 'Prime Level')}</span>
                <span class="spec-value highlight-gold">Level ${account.primeLevel}</span>
              </div>
              <div class="spec-cell">
                <span class="spec-label">${t('cardAccountLevel', 'Account Level')}</span>
                <span class="spec-value">Level ${account.level}</span>
              </div>
              <div class="spec-cell">
                <span class="spec-label">${t('cardAccountAge', 'Account Age')}</span>
                <span class="spec-value">${account.accountAge}</span>
              </div>
              <div class="spec-cell">
                <span class="spec-label">${t('cardEvoGuns', 'Evo Guns')}</span>
                <span class="spec-value highlight-gold">${account.evoGuns} Guns</span>
              </div>
            </div>

            <!-- Badges -->
            <div class="card-tags-row">
              <span class="badge-tag badge-serious">${t('cardSeriousBadge', '⚡ Serious Buyers Only')}</span>
              <span class="badge-tag badge-verified">${t('cardDeliveryBadge', '✅ Instant Delivery')}</span>
            </div>

            <!-- Action Buttons -->
            <div class="card-actions">
              <button class="btn btn-details" onclick="openAccountDetails('${account.code}')">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                  <circle cx="12" cy="12" r="3"></circle>
                </svg>
                ${t('btnViewDetails', 'View Details')}
              </button>
              
              <a href="${waUrl}" target="_blank" rel="noopener noreferrer" class="btn btn-whatsapp" aria-label="WhatsApp us" title="Contact on WhatsApp">
                <svg class="icon-wa" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981z"/>
                </svg>
                <span>WhatsApp</span>
              </a>
            </div>
          </div>
        </div>
      `;
    }).join('');
  }

  /**
   * Filter and Sort Accounts
   */
  function applyFiltersAndSort() {
    let list = [...state.accounts];

    // Search query (by UID or Account Code)
    const query = state.filters.search.trim().toLowerCase();
    if (query) {
      list = list.filter(acc => {
        const matchCode = acc.code.toLowerCase().includes(query) || `account #${acc.code}`.toLowerCase().includes(query);
        const matchUid = acc.uid.toLowerCase().includes(query);
        return matchCode || matchUid;
      });
    }

    // Filter by Server
    if (state.filters.server !== 'ALL') {
      list = list.filter(acc => acc.serverRegion.toUpperCase() === state.filters.server);
    }

    // Filter by Prime Level
    if (state.filters.primeLevel !== 'ALL') {
      const minPrime = parseInt(state.filters.primeLevel, 10);
      list = list.filter(acc => acc.primeLevel >= minPrime);
    }

    // Filter by Price Range
    if (state.filters.priceRange !== 'ALL') {
      if (state.filters.priceRange === 'UNDER_3K') {
        list = list.filter(acc => acc.priceNum < 3000);
      } else if (state.filters.priceRange === '3K_TO_5K') {
        list = list.filter(acc => acc.priceNum >= 3000 && acc.priceNum <= 5000);
      } else if (state.filters.priceRange === 'ABOVE_5K') {
        list = list.filter(acc => acc.priceNum > 5000);
      }
    }

    // Filter by Evo Guns
    if (state.filters.evoGuns !== 'ALL') {
      const minEvo = parseInt(state.filters.evoGuns, 10);
      list = list.filter(acc => acc.evoGuns >= minEvo);
    }

    // Sorting
    switch (state.filters.sortBy) {
      case 'priceAsc':
        list.sort((a, b) => a.priceNum - b.priceNum);
        break;
      case 'priceDesc':
        list.sort((a, b) => b.priceNum - a.priceNum);
        break;
      case 'evoDesc':
        list.sort((a, b) => b.evoGuns - a.evoGuns);
        break;
      case 'levelDesc':
        list.sort((a, b) => b.level - a.level);
        break;
      default:
        // Featured / code default
        list.sort((a, b) => a.code.localeCompare(b.code));
        break;
    }

    state.filteredAccounts = list;
    renderAccounts();
  }

  function resetFilters() {
    state.filters = {
      search: '',
      server: 'ALL',
      primeLevel: 'ALL',
      priceRange: 'ALL',
      evoGuns: 'ALL',
      sortBy: 'featured'
    };

    if (searchInput) searchInput.value = '';
    if (serverFilter) serverFilter.value = 'ALL';
    if (primeFilter) primeFilter.value = 'ALL';
    if (priceFilter) priceFilter.value = 'ALL';
    if (evoFilter) evoFilter.value = 'ALL';
    if (sortSelect) sortSelect.value = 'featured';

    applyFiltersAndSort();
    showToast('Filters have been reset.');
  }

  /**
   * REUSABLE ACCOUNT DETAILS MODAL & GALLERY
   */
  window.openAccountDetails = function(accountCode) {
    const account = state.accounts.find(a => a.code === accountCode);
    if (!account) return;

    state.activeAccount = account;
    state.activeImageIndex = 0;

    // Update Modal Header
    if (modalTitle) {
      modalTitle.innerHTML = `ACCOUNT #${account.code}`;
    }

    // Render Specs Section
    if (modalDetailsContainer) {
      modalDetailsContainer.innerHTML = `
        <div class="modal-specs-wrapper">
          <div class="modal-section-title">
            <span>${t('modalSpecsTitle', 'SPECIFICATIONS')}</span>
            <span class="badge-tag badge-verified">${t("cardVerifiedBadge", "VERIFIED")}</span>
          </div>
          
          <div class="modal-specs-grid">
            <div class="spec-card">
              <div class="spec-card-icon">🌐</div>
              <div class="spec-card-content">
                <span class="spec-card-label">${t('filterServerLabel', 'Server')}</span>
                <span class="spec-card-value highlight-gold">${account.server}</span>
              </div>
            </div>

            <div class="spec-card uid-card" onclick="copyToClipboard('${account.uid}', 'UID')" title="Click to copy UID">
              <div class="spec-card-icon">🆔</div>
              <div class="spec-card-content">
                <span class="spec-card-label">UID <span class="copy-subhint">(Tap to Copy)</span></span>
                <span class="spec-card-value uid-interactive">
                  ${account.uid}
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                  </svg>
                </span>
              </div>
            </div>

            <div class="spec-card">
              <div class="spec-card-icon">⭐</div>
              <div class="spec-card-content">
                <span class="spec-card-label">${t('cardPrimeLevel', 'Prime Level')}</span>
                <span class="spec-card-value highlight-gold">Level ${account.primeLevel}</span>
              </div>
            </div>

            <div class="spec-card">
              <div class="spec-card-icon">🔫</div>
              <div class="spec-card-content">
                <span class="spec-card-label">${t('cardEvoGuns', 'Evo Guns')}</span>
                <span class="spec-card-value highlight-gold">${account.evoGuns} Max</span>
              </div>
            </div>

            <div class="spec-card">
              <div class="spec-card-icon">🏆</div>
              <div class="spec-card-content">
                <span class="spec-card-label">${t('cardAccountLevel', 'Account Level')}</span>
                <span class="spec-card-value">Level ${account.level}</span>
              </div>
            </div>

            <div class="spec-card">
              <div class="spec-card-icon">📅</div>
              <div class="spec-card-content">
                <span class="spec-card-label">${t('cardAccountAge', 'Account Age')}</span>
                <span class="spec-card-value">${account.accountAge}</span>
              </div>
            </div>
          </div>

          <!-- Prominent Price Banner Card -->
          <div class="modal-price-card">
            <div class="modal-price-info">
              <span class="modal-price-label">${t("filterPriceLabel", "Price")}</span>
              <span class="modal-price-value">${formatAccountPrice(account, state.currentLang)}</span>
            </div>
            <div class="modal-price-badge">
              <span class="badge-tag badge-verified">⚡ ${t('cardDeliveryBadge', 'Instant Delivery')}</span>
            </div>
          </div>

          <!-- Badges & Verification Notice -->
          <div class="modal-badges-group">
            <span class="badge-tag badge-serious">${t('cardSeriousBadge', '⚡ Serious Buyers Only')}</span>
            <span class="badge-tag badge-info">📸 ${account.images.length} ${t('screenshotsAvailable', 'Screenshots Available')}</span>
          </div>

          <div class="modal-safety-notice">
            🛡️ <strong>100% Safe &amp; Verified:</strong> Every listed account is verified before handover. Contact us on WhatsApp to proceed with purchase.
          </div>
        </div>
      `;
    }

    // Set Dynamic WhatsApp URL for this specific account
    if (modalWhatsAppBtn) {
      const dynamicWaUrl = STORE_CONFIG.getWhatsAppUrl(account.code);
      modalWhatsAppBtn.href = dynamicWaUrl;
      modalWhatsAppBtn.setAttribute('aria-label', 'WhatsApp us');
      modalWhatsAppBtn.innerHTML = `
        <svg class="icon-wa" width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
          <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981z"/>
        </svg>
        <span>${t('btnContactModal', 'Contact on WhatsApp')} (Account #${account.code})</span>
      `;
    }

    // Populate Thumbnail Strip
    renderThumbnails();

    // Display first image
    updateActiveGalleryImage();

    // Open Modal
    detailsModal.classList.add('active');
    document.body.classList.add('modal-open');
  };

  /**
   * Render Thumbnails Strip in Modal
   */
  function renderThumbnails() {
    if (!modalThumbsTrack || !state.activeAccount) return;
    const images = state.activeAccount.images || [];

    modalThumbsTrack.innerHTML = images.map((imgSrc, idx) => `
      <button type="button" 
              class="thumb-item ${idx === state.activeImageIndex ? 'active' : ''}" 
              data-index="${idx}"
              onclick="selectGalleryImage(${idx})"
              aria-label="Thumbnail ${idx + 1}">
        <img src="${resolveImgPath(imgSrc)}" alt="Thumbnail ${idx + 1}" loading="lazy" onerror="this.closest('.thumb-item').style.display='none';">
        <span class="thumb-number">${idx + 1}</span>
      </button>
    `).join('');
  }

  /**
   * Update Current Active Gallery Image
   */
  function updateActiveGalleryImage() {
    if (!modalGalleryMain || !state.activeAccount) return;
    const images = state.activeAccount.images || [];
    if (images.length === 0) return;

    const currentImgSrc = images[state.activeImageIndex];

    modalGalleryMain.innerHTML = `
      <img src="${resolveImgPath(currentImgSrc)}" 
           alt="Sonu FF Store Account #${state.activeAccount.code} Screenshot ${state.activeImageIndex + 1}"
           class="gallery-main-img" 
           loading="lazy"
           onerror="this.src='data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%22800%22 height=%22500%22 fill=%22%23111116%22><text x=%22400%22 y=%22250%22 fill=%22%23D4AF37%22 text-anchor=%22middle%22 font-family=%22sans-serif%22 font-weight=%22bold%22>PREVIEW UNAVAILABLE</text></svg>'">
    `;

    // Update Counter (e.g. 1 / 6)
    if (modalGalleryCounter) {
      modalGalleryCounter.textContent = `${state.activeImageIndex + 1} / ${images.length}`;
    }

    // Update Thumbnail Active State
    if (modalThumbsTrack) {
      const thumbs = modalThumbsTrack.querySelectorAll('.thumb-item');
      thumbs.forEach((thumb, idx) => {
        if (idx === state.activeImageIndex) {
          thumb.classList.add('active');
          thumb.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
        } else {
          thumb.classList.remove('active');
        }
      });
    }
  }

  window.selectGalleryImage = function(idx) {
    if (!state.activeAccount || !state.activeAccount.images) return;
    if (idx >= 0 && idx < state.activeAccount.images.length) {
      state.activeImageIndex = idx;
      updateActiveGalleryImage();
    }
  };

  window.prevGalleryImage = function() {
    if (!state.activeAccount || !state.activeAccount.images) return;
    const total = state.activeAccount.images.length;
    state.activeImageIndex = (state.activeImageIndex - 1 + total) % total;
    updateActiveGalleryImage();
  };

  window.nextGalleryImage = function() {
    if (!state.activeAccount || !state.activeAccount.images) return;
    const total = state.activeAccount.images.length;
    state.activeImageIndex = (state.activeImageIndex + 1) % total;
    updateActiveGalleryImage();
  };

  window.closeModal = function() {
    if (!detailsModal) return;
    detailsModal.classList.remove('active');
    document.body.classList.remove('modal-open');
    state.activeAccount = null;
    state.activeImageIndex = 0;
  };

  // Gallery Navigation Buttons
  if (modalPrevBtn) modalPrevBtn.addEventListener('click', window.prevGalleryImage);
  if (modalNextBtn) modalNextBtn.addEventListener('click', window.nextGalleryImage);
  if (modalCloseBtn) modalCloseBtn.addEventListener('click', window.closeModal);
  if (modalBackdrop) modalBackdrop.addEventListener('click', window.closeModal);

  // Keyboard navigation for modal gallery
  document.addEventListener('keydown', (e) => {
    if (!detailsModal.classList.contains('active')) return;
    if (e.key === 'Escape') {
      window.closeModal();
    } else if (e.key === 'ArrowLeft') {
      window.prevGalleryImage();
    } else if (e.key === 'ArrowRight') {
      window.nextGalleryImage();
    }
  });

  // Mobile Touch Swipe Navigation for Gallery
  let touchStartX = 0;
  let touchEndX = 0;
  if (modalGalleryMain) {
    modalGalleryMain.addEventListener('touchstart', (e) => {
      touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    modalGalleryMain.addEventListener('touchend', (e) => {
      touchEndX = e.changedTouches[0].screenX;
      handleGesture();
    }, { passive: true });
  }

  function handleGesture() {
    const swipeThreshold = 45;
    const diff = touchEndX - touchStartX;
    if (Math.abs(diff) > swipeThreshold) {
      if (diff < 0) {
        // Swipe Left -> Next Image
        window.nextGalleryImage();
      } else {
        // Swipe Right -> Prev Image
        window.prevGalleryImage();
      }
    }
  }

  // Filter Event Listeners
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      state.filters.search = e.target.value;
      applyFiltersAndSort();
    });
  }

  if (serverFilter) {
    serverFilter.addEventListener('change', (e) => {
      state.filters.server = e.target.value;
      applyFiltersAndSort();
    });
  }

  if (primeFilter) {
    primeFilter.addEventListener('change', (e) => {
      state.filters.primeLevel = e.target.value;
      applyFiltersAndSort();
    });
  }

  if (priceFilter) {
    priceFilter.addEventListener('change', (e) => {
      state.filters.priceRange = e.target.value;
      applyFiltersAndSort();
    });
  }

  if (evoFilter) {
    evoFilter.addEventListener('change', (e) => {
      state.filters.evoGuns = e.target.value;
      applyFiltersAndSort();
    });
  }

  if (sortSelect) {
    sortSelect.addEventListener('change', (e) => {
      state.filters.sortBy = e.target.value;
      applyFiltersAndSort();
    });
  }

  if (resetFiltersBtn) {
    resetFiltersBtn.addEventListener('click', resetFilters);
  }

  // Mobile Hamburger Toggle
  if (mobileMenuToggle && navLinks) {
    function closeMobileMenu() {
      navLinks.classList.remove('active');
      mobileMenuToggle.classList.remove('open');
      mobileMenuToggle.setAttribute('aria-expanded', 'false');
      mobileMenuToggle.setAttribute('aria-label', 'Open navigation');
      document.body.classList.remove('menu-open');
    }

    mobileMenuToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = navLinks.classList.toggle('active');
      mobileMenuToggle.classList.toggle('open', isOpen);
      mobileMenuToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
      mobileMenuToggle.setAttribute('aria-label', isOpen ? 'Close navigation' : 'Open navigation');
      document.body.classList.toggle('menu-open', isOpen);
    });

    // Close mobile menu when a nav link or mobile action is clicked
    navLinks.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        closeMobileMenu();
      });
    });

    // Close mobile menu when clicking outside
    document.addEventListener('click', (e) => {
      if (navLinks.classList.contains('active') && !navLinks.contains(e.target) && !mobileMenuToggle.contains(e.target)) {
        closeMobileMenu();
      }
    });

    // Close on Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && navLinks.classList.contains('active')) {
        closeMobileMenu();
      }
    });
  }

  // Smooth Scrolling for In-Page Anchor Links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const targetId = this.getAttribute('href');
      if (targetId && targetId !== '#') {
        const targetElement = document.querySelector(targetId);
        if (targetElement) {
          e.preventDefault();
          const navHeight = 70;
          const elementPosition = targetElement.getBoundingClientRect().top;
          const offsetPosition = elementPosition + window.pageYOffset - navHeight;

          window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
          });
        }
      }
    });
  });

  // Sticky Navigation Bar Shadow Effect on Scroll
  const navbar = document.querySelector('.navbar');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 20) {
      navbar?.classList.add('scrolled');
    } else {
      navbar?.classList.remove('scrolled');
    }
  }, { passive: true });

  
  // =========================================================================
  // i18n (INTERNATIONALIZATION) ENGINE
  // =========================================================================
  const currentLang = localStorage.getItem('sonu_store_lang') || 'en';
  state.currentLang = currentLang;

  function t(key, fallback = '') {
    if (typeof TRANSLATIONS !== 'undefined' && TRANSLATIONS[state.currentLang] && TRANSLATIONS[state.currentLang][key]) {
      return TRANSLATIONS[state.currentLang][key];
    }
    return fallback;
  }

  function applyLanguage(lang) {
    state.currentLang = lang;
    localStorage.setItem('sonu_store_lang', lang);

    // Update switcher buttons UI (supports all desktop and mobile instances)
    document.querySelectorAll('.lang-btn[data-lang]').forEach(btn => {
      if (btn.getAttribute('data-lang') === lang) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    // Update HTML lang attribute
    document.documentElement.lang = lang;

    // Update all elements with data-i18n attribute
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      const val = t(key);
      if (val) {
        if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
          el.placeholder = val;
        } else {
          el.innerHTML = val;
        }
      }
    });

    // Update search input placeholder
    if (searchInput) {
      searchInput.placeholder = t('searchPlaceholder', searchInput.placeholder);
    }

    // Update Select Dropdowns options
    updateFilterSelectLabels();

    // Re-render account cards with active language
    renderAccounts();

    // If modal is open, re-render modal specifications
    if (state.activeAccount) {
      window.openAccountDetails(state.activeAccount.code);
    }
  }

  function updateFilterSelectLabels() {
    if (serverFilter) {
      serverFilter.options[0].text = t('filterServerAll', 'All Servers');
      serverFilter.options[1].text = t('filterServerIn', 'India 🇮🇳');
      serverFilter.options[2].text = t('filterServerId', 'Indonesia 🇮🇩');
    }
    if (primeFilter) {
      primeFilter.options[0].text = t('filterPrimeAll', 'All Levels');
      primeFilter.options[1].text = t('filterPrime3', 'Level 3+');
      primeFilter.options[2].text = t('filterPrime5', 'Level 5+');
      primeFilter.options[3].text = t('filterPrime6', 'Level 6+');
      primeFilter.options[4].text = t('filterPrime7', 'Level 7 (Max)');
    }
    if (priceFilter) {
      priceFilter.options[0].text = t('filterPriceAll', 'All Prices');
      priceFilter.options[1].text = t('filterPriceUnder3k', 'Under ₹3,000');
      priceFilter.options[2].text = t('filterPrice3k5k', '₹3,000 - ₹5,000');
      priceFilter.options[3].text = t('filterPriceAbove5k', 'Above ₹5,000');
    }
    if (evoFilter) {
      evoFilter.options[0].text = t('filterEvoAll', 'All Evo Guns');
      evoFilter.options[1].text = t('filterEvo2', '2+ Evo Guns');
      evoFilter.options[2].text = t('filterEvo5', '5+ Evo Guns');
      evoFilter.options[3].text = t('filterEvo7', '7+ Evo Guns');
      evoFilter.options[4].text = t('filterEvo9', '9+ Evo Guns');
    }
    if (sortSelect) {
      sortSelect.options[0].text = t('sortFeatured', 'Account Code');
      sortSelect.options[1].text = t('sortPriceAsc', 'Price: Low to High');
      sortSelect.options[2].text = t('sortPriceDesc', 'Price: High to Low');
      sortSelect.options[3].text = t('sortEvoDesc', 'Evo Guns: High to Low');
      sortSelect.options[4].text = t('sortLevelDesc', 'Account Level: High to Low');
    }
  }

  // Language button event listeners (all desktop and mobile instances)
  document.querySelectorAll('.lang-btn[data-lang]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const lang = btn.getAttribute('data-lang');
      if (lang) applyLanguage(lang);
    });
  });

  // Initial render with saved or default language
  applyLanguage(currentLang);

});
