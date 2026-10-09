/**
 * Menu & Garage Manager
 * Multi-Vehicle Showcase, Category Filter Tabs (Cars, Bikes, Buses, Trucks),
 * Locked/Unlocked Vehicles with Coins, Workshop Upgrades, Stage Selection
 */

class MenuManager {
  constructor() {
    this.selectedCategory = 'all';
    this.previewingVehicle = null;
    this.initElements();
    this.bindEvents();
    this.initPreviewCanvas();
    this.refreshUI();
  }

  initElements() {
    this.menuScreen = document.getElementById('menu-screen');
    this.gameScreen = document.getElementById('game-screen');
    this.btnStartRace = document.getElementById('btn-start-race');

    // Upgrade buttons & bars
    this.upgrades = ['engine', 'suspension', 'tires', 'fourwd'];
    this.upgradeCosts = {
      engine: 400,
      suspension: 350,
      tires: 380,
      fourwd: 500
    };

    // Stage cards
    this.stageCards = document.querySelectorAll('.stage-card');
    this.currentStageTag = document.getElementById('current-stage-tag');

    // Vehicle Category & Selection elements
    this.vehTabBtns = document.querySelectorAll('.veh-tab-btn');
    this.vehiclesCarousel = document.getElementById('vehicles-carousel');
    this.vehicleName = document.getElementById('vehicle-name');
    this.vehicleDesc = document.getElementById('vehicle-desc');
    this.vehicleCatBadge = document.getElementById('vehicle-cat-badge');
    this.btnVehicleAction = document.getElementById('btn-vehicle-action');

    this.specSpeed = document.getElementById('spec-speed');
    this.specPower = document.getElementById('spec-power');
    this.specSusp = document.getElementById('spec-susp');
    this.specStab = document.getElementById('spec-stab');

    // Challenges Modal
    this.btnChallengesOpen = document.getElementById('btn-challenges-open');
    this.btnChallengesClose = document.getElementById('btn-challenges-close');
    this.btnChallengesOk = document.getElementById('btn-challenges-ok');
    this.challengesModal = document.getElementById('challenges-modal');
    this.challengesListContainer = document.getElementById('challenges-list-container');

    // Settings
    this.btnSettingsOpen = document.getElementById('btn-settings-open');
    this.btnSettingsClose = document.getElementById('btn-settings-close');
    this.settingsModal = document.getElementById('settings-modal');
    this.settingSfx = document.getElementById('setting-sfx');
    this.settingMusic = document.getElementById('setting-music');
    this.btnResetData = document.getElementById('btn-reset-data');

    // Preview Canvas
    this.previewCanvas = document.getElementById('vehicle-preview-canvas');
    if (this.previewCanvas) {
      this.previewCtx = this.previewCanvas.getContext('2d');
    }
  }

  bindEvents() {
    // Start Race
    if (this.btnStartRace) {
      this.btnStartRace.addEventListener('click', () => {
        this.launchRace();
      });
    }

    // Upgrades
    this.upgrades.forEach((stat) => {
      const btn = document.getElementById(`btn-upgrade-${stat}`);
      if (btn) {
        btn.addEventListener('click', () => {
          this.purchaseUpgrade(stat);
        });
      }
    });

    // Stages
    this.stageCards.forEach((card) => {
      card.addEventListener('click', () => {
        const stage = card.getAttribute('data-stage');
        this.selectStage(stage);
      });
    });

    // Vehicle Category Filter Tabs
    this.vehTabBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        this.vehTabBtns.forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        this.selectedCategory = btn.getAttribute('data-category');
        this.renderVehiclesList();
      });
    });

    // Settings Modal
    if (this.btnSettingsOpen) {
      this.btnSettingsOpen.addEventListener('click', () => {
        this.settingsModal.classList.add('active');
      });
    }

    if (this.btnSettingsClose) {
      this.btnSettingsClose.addEventListener('click', () => {
        this.settingsModal.classList.remove('active');
      });
    }

    if (this.settingSfx) {
      this.settingSfx.addEventListener('change', (e) => {
        soundEngine.setSfxEnabled(e.target.checked);
      });
    }

    if (this.settingMusic) {
      this.settingMusic.addEventListener('change', (e) => {
        soundEngine.setMusicEnabled(e.target.checked);
      });
    }

    if (this.btnResetData) {
      this.btnResetData.addEventListener('click', () => {
        if (confirm('Are you sure you want to reset all game progress?')) {
          localStorage.removeItem('hill_climb_racer_save_v1');
          location.reload();
        }
      });
    }

    // Challenges Modal
    if (this.btnChallengesOpen) {
      this.btnChallengesOpen.addEventListener('click', () => {
        this.openChallengesModal();
      });
    }
    if (this.btnChallengesClose) {
      this.btnChallengesClose.addEventListener('click', () => {
        this.challengesModal.classList.remove('active');
      });
    }
    if (this.btnChallengesOk) {
      this.btnChallengesOk.addEventListener('click', () => {
        this.challengesModal.classList.remove('active');
      });
    }
  }

  getUpgradeCost(stat, currentLevel) {
    if (currentLevel >= 10) return 0;
    const base = this.upgradeCosts[stat] || 400;
    return Math.floor(base * Math.pow(1.35, currentLevel - 1));
  }

  purchaseUpgrade(stat) {
    if (!authManager.currentPlayer) return;

    const currentLvl = authManager.currentPlayer.upgrades[stat] || 1;
    if (currentLvl >= 10) return;

    const cost = this.getUpgradeCost(stat, currentLvl);
    if (authManager.spendCoins(cost)) {
      authManager.currentPlayer.upgrades[stat] = currentLvl + 1;
      authManager.saveData(authManager.currentPlayer);
      soundEngine.playCoin();
      this.refreshUI();
    } else {
      soundEngine.playCrash();
      alert('Not enough coins! Race to collect more coins or complete challenges.');
    }
  }

  selectStage(stage) {
    if (!authManager.currentPlayer) return;
    authManager.currentPlayer.selectedStage = stage;
    authManager.saveData(authManager.currentPlayer);

    this.stageCards.forEach((c) => {
      if (c.getAttribute('data-stage') === stage) {
        c.classList.add('active');
      } else {
        c.classList.remove('active');
      }
    });

    if (this.currentStageTag) {
      this.currentStageTag.textContent = `STAGE: ${stage.toUpperCase()}`;
    }
  }

  renderVehiclesList() {
    if (!this.vehiclesCarousel || !authManager.currentPlayer) return;
    const p = authManager.currentPlayer;
    const unlocked = p.unlockedVehicles || ['buggy'];
    const activeVeh = p.selectedVehicle || 'buggy';

    this.vehiclesCarousel.innerHTML = '';
    const allDefs = Object.values(VEHICLE_DEFS);

    const filtered = allDefs.filter((def) => {
      if (this.selectedCategory === 'all') return true;
      return def.category === this.selectedCategory;
    });

    filtered.forEach((def) => {
      const isUnlocked = unlocked.includes(def.id);
      const isCardActive = (this.previewingVehicle || activeVeh) === def.id;
      const isEquipped = activeVeh === def.id;

      const card = document.createElement('div');
      card.className = `veh-card ${isCardActive ? 'active' : ''} ${isUnlocked ? 'unlocked' : 'locked'}`;

      const iconEmoji = def.category === 'bike' ? '🏍️' : (def.category === 'bus' ? '🚌' : (def.category === 'truck' ? '🚚' : '🚗'));

      card.innerHTML = `
        <div class="veh-card-badge">${def.category.toUpperCase()}</div>
        <div class="veh-card-icon">${iconEmoji}</div>
        <div class="veh-card-name">${def.name}</div>
        <div class="veh-card-status">
          ${isUnlocked ? (isEquipped ? '✓ EQUIPPED' : 'UNLOCKED') : `🔒 🪙 ${def.cost.toLocaleString()}`}
        </div>
      `;

      card.addEventListener('click', () => {
        this.selectOrPreviewVehicle(def.id);
      });

      this.vehiclesCarousel.appendChild(card);
    });

    // Refresh active vehicle showcase card
    this.updateVehicleShowcase(this.previewingVehicle || activeVeh);
  }

  selectOrPreviewVehicle(id) {
    const p = authManager.currentPlayer;
    if (!p) return;
    const unlocked = p.unlockedVehicles || ['buggy'];

    if (unlocked.includes(id)) {
      authManager.selectVehicle(id);
      this.previewingVehicle = id;
      soundEngine.playCoin();
    } else {
      this.previewingVehicle = id;
    }
    this.refreshUI();
  }

  updateVehicleShowcase(vehicleId) {
    const def = VEHICLE_DEFS[vehicleId] || VEHICLE_DEFS.buggy;
    const p = authManager.currentPlayer;
    if (!p) return;

    const unlocked = p.unlockedVehicles || ['buggy'];
    const isUnlocked = unlocked.includes(def.id);
    const isSelected = p.selectedVehicle === def.id;

    if (this.vehicleName) this.vehicleName.textContent = def.name.toUpperCase();
    if (this.vehicleDesc) this.vehicleDesc.textContent = def.description;
    if (this.vehicleCatBadge) {
      this.vehicleCatBadge.textContent = def.category.toUpperCase();
      this.vehicleCatBadge.className = `vehicle-category-badge cat-${def.category}`;
    }

    // Stats
    const stats = def.stats || { speed: 65, power: 70, suspension: 75, stability: 65 };
    if (this.specSpeed) this.specSpeed.style.width = `${stats.speed}%`;
    if (this.specPower) this.specPower.style.width = `${stats.power}%`;
    if (this.specSusp) this.specSusp.style.width = `${stats.suspension}%`;
    if (this.specStab) this.specStab.style.width = `${stats.stability}%`;

    // Action button
    if (this.btnVehicleAction) {
      if (isSelected) {
        this.btnVehicleAction.textContent = '✓ SELECTED';
        this.btnVehicleAction.className = 'btn btn-action-veh selected';
        this.btnVehicleAction.disabled = true;
      } else if (isUnlocked) {
        this.btnVehicleAction.textContent = 'SELECT VEHICLE';
        this.btnVehicleAction.className = 'btn btn-action-veh select';
        this.btnVehicleAction.disabled = false;
        this.btnVehicleAction.onclick = () => {
          authManager.selectVehicle(def.id);
          this.previewingVehicle = def.id;
          soundEngine.playCoin();
          this.refreshUI();
        };
      } else {
        this.btnVehicleAction.innerHTML = `<span>🪙 UNLOCK FOR ${def.cost.toLocaleString()}</span>`;
        this.btnVehicleAction.className = 'btn btn-action-veh unlock';
        this.btnVehicleAction.disabled = false;
        this.btnVehicleAction.onclick = () => {
          if (authManager.unlockVehicle(def.id, def.cost)) {
            soundEngine.playFanfare();
            alert(`🎉 Unlocked ${def.name}! Ready to race!`);
            this.previewingVehicle = def.id;
            this.refreshUI();
          } else {
            soundEngine.playCrash();
            const needed = def.cost - (p.coins || 0);
            alert(`Not enough coins! You need ${needed.toLocaleString()} more coins to unlock ${def.name}. Race to earn coins!`);
          }
        };
      }
    }
  }

  refreshUI() {
    if (!authManager.currentPlayer) return;
    authManager.updateHUD();

    const p = authManager.currentPlayer;

    // Upgrades UI
    this.upgrades.forEach((stat) => {
      const lvl = p.upgrades[stat] || 1;
      const lvlText = document.getElementById(`level-${stat}`);
      const barFill = document.getElementById(`bar-${stat}`);
      const btn = document.getElementById(`btn-upgrade-${stat}`);

      if (lvlText) lvlText.textContent = lvl >= 10 ? 'LVL MAX' : `LVL ${lvl}/10`;
      if (barFill) barFill.style.width = `${lvl * 10}%`;

      if (btn) {
        if (lvl >= 10) {
          btn.classList.add('maxed');
          btn.innerHTML = '<span>MAXED</span>';
          btn.disabled = true;
        } else {
          btn.classList.remove('maxed');
          btn.disabled = false;
          const cost = this.getUpgradeCost(stat, lvl);
          btn.innerHTML = `<span>🪙 ${cost.toLocaleString()}</span>`;
        }
      }
    });

    // Stage selection UI
    const selStage = p.selectedStage || 'countryside';
    this.selectStage(selStage);

    // Records
    ['countryside', 'desert', 'arctic', 'moon', 'mars', 'volcano'].forEach((stg) => {
      const recEl = document.getElementById(`record-${stg}`);
      if (recEl) {
        recEl.textContent = `Record: ${(p.records && p.records[stg]) || 0}m`;
      }
    });

    // Vehicle Carousel & Showcase UI
    this.renderVehiclesList();
  }

  launchRace() {
    soundEngine.ensureContext();
    const p = authManager.currentPlayer;
    if (!p) return;

    this.menuScreen.classList.remove('active');
    this.gameScreen.classList.add('active');

    // Trigger canvas resize and launch
    window.gameInstance.resizeCanvas();
    const veh = p.selectedVehicle || 'buggy';
    window.gameInstance.start(p.selectedStage, p.upgrades, veh);
  }

  initPreviewCanvas() {
    if (!this.previewCanvas) return;
    const ctx = this.previewCtx;

    let time = 0;
    const renderPreview = () => {
      if (!this.menuScreen.classList.contains('active')) {
        requestAnimationFrame(renderPreview);
        return;
      }

      time += 0.03;
      ctx.clearRect(0, 0, this.previewCanvas.width, this.previewCanvas.height);

      const cx = this.previewCanvas.width / 2;
      const cy = this.previewCanvas.height / 2 + 15;

      const p = authManager.currentPlayer;
      const vehId = (this.previewingVehicle || (p && p.selectedVehicle)) || 'buggy';

      if (window.gameInstance && window.gameInstance.renderVehicleShowcase) {
        window.gameInstance.renderVehicleShowcase(ctx, cx, cy, vehId, time);
      }

      requestAnimationFrame(renderPreview);
    };

    requestAnimationFrame(renderPreview);
  }

  openChallengesModal() {
    this.refreshChallengesUI();
    if (this.challengesModal) {
      this.challengesModal.classList.add('active');
    }
  }

  refreshChallengesUI() {
    if (!this.challengesListContainer || !authManager.currentPlayer) return;
    const chs = authManager.currentPlayer.challenges || authManager.getDefaultChallenges();

    this.challengesListContainer.innerHTML = '';
    Object.keys(chs).forEach((key) => {
      const c = chs[key];
      const div = document.createElement('div');
      div.className = `challenge-item ${c.done ? 'done' : ''}`;
      div.innerHTML = `
        <div class="ch-info">
          <span class="ch-badge">${c.done ? '✓ COMPLETED' : 'IN PROGRESS'}</span>
          <span class="ch-title">${c.title}</span>
        </div>
        <div class="ch-reward">🪙 +${c.reward}</div>
      `;
      this.challengesListContainer.appendChild(div);
    });
  }
}

// Instantiate Menu Manager on DOM Load
window.addEventListener('DOMContentLoaded', () => {
  window.menuManager = new MenuManager();
});
