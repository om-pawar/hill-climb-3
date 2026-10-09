/**
 * Authentication & Player Profile Manager
 * Handles Email Login/Signup, Guest Mode, and Persistent Garage State
 */

const STORAGE_KEY = 'hill_climb_racer_save_v1';

class AuthManager {
  constructor() {
    this.currentPlayer = null;
    this.initElements();
    this.bindEvents();
    this.checkExistingSession();
  }

  initElements() {
    this.authScreen = document.getElementById('auth-screen');
    this.menuScreen = document.getElementById('menu-screen');
    this.tabLogin = document.getElementById('tab-login');
    this.tabSignup = document.getElementById('tab-signup');
    this.authForm = document.getElementById('auth-form');
    this.groupName = document.getElementById('group-name');
    this.inputName = document.getElementById('auth-name');
    this.inputEmail = document.getElementById('auth-email');
    this.inputPassword = document.getElementById('auth-password');
    this.btnSubmit = document.getElementById('btn-submit-auth');
    this.btnGuest = document.getElementById('btn-guest-play');
    this.errorMsg = document.getElementById('auth-error-msg');
    this.btnLogout = document.getElementById('btn-logout');

    this.displayPlayerName = document.getElementById('display-player-name');
    this.displayAccountType = document.getElementById('display-account-type');
    this.displayCoins = document.getElementById('display-coins');
    this.displayGems = document.getElementById('display-gems');

    this.isSignUpMode = false;
  }

  bindEvents() {
    if (this.tabLogin && this.tabSignup) {
      this.tabLogin.addEventListener('click', () => this.setMode(false));
      this.tabSignup.addEventListener('click', () => this.setMode(true));
    }

    if (this.authForm) {
      this.authForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleEmailAuth();
      });
    }

    if (this.btnGuest) {
      this.btnGuest.addEventListener('click', () => {
        this.handleGuestLogin();
      });
    }

    if (this.btnLogout) {
      this.btnLogout.addEventListener('click', () => {
        this.logout();
      });
    }
  }

  setMode(isSignUp) {
    this.isSignUpMode = isSignUp;
    this.clearError();
    if (isSignUp) {
      this.tabSignup.classList.add('active');
      this.tabLogin.classList.remove('active');
      this.groupName.style.display = 'block';
      this.btnSubmit.querySelector('.btn-text').textContent = 'CREATE ACCOUNT';
    } else {
      this.tabLogin.classList.add('active');
      this.tabSignup.classList.remove('active');
      this.groupName.style.display = 'none';
      this.btnSubmit.querySelector('.btn-text').textContent = 'START ENGINE';
    }
  }

  showError(msg) {
    if (this.errorMsg) {
      this.errorMsg.textContent = msg;
      this.errorMsg.style.display = 'block';
    }
  }

  clearError() {
    if (this.errorMsg) {
      this.errorMsg.textContent = '';
      this.errorMsg.style.display = 'none';
    }
  }

  getDefaultChallenges() {
    return {
      dist500: { title: 'Distance Champ: Reach 500m', reward: 1500, done: false },
      flips2: { title: 'Daredevil: Land 2 Backflips', reward: 1200, done: false },
      speed75: { title: 'Speed Demon: Hit 75 KM/H', reward: 1000, done: false },
      coins25: { title: 'Treasure Hunter: 25 Coins in 1 Run', reward: 1000, done: false },
      bridge1: { title: 'Brave Crossing: Conquer the Chasm Bridge', reward: 1500, done: false }
    };
  }

  getDefaultProfile(type, email = '', name = '') {
    const randomGuestId = Math.floor(100 + Math.random() * 900);
    return {
      type: type, // 'guest' or 'email'
      email: email,
      name: name || (type === 'guest' ? `Driver #${randomGuestId}` : email.split('@')[0]),
      coins: 2000, // Starter coins for immediate fun
      gems: 25,
      upgrades: {
        engine: 1,
        suspension: 1,
        tires: 1,
        fourwd: 1
      },
      records: {
        countryside: 0,
        desert: 0,
        arctic: 0,
        moon: 0,
        mars: 0,
        volcano: 0
      },
      challenges: this.getDefaultChallenges(),
      selectedStage: 'countryside',
      selectedVehicle: 'buggy',
      unlockedVehicles: ['buggy']
    };
  }

  completeChallenge(id) {
    if (!this.currentPlayer) return;
    if (!this.currentPlayer.challenges) {
      this.currentPlayer.challenges = this.getDefaultChallenges();
    }
    const ch = this.currentPlayer.challenges[id];
    if (ch && !ch.done) {
      ch.done = true;
      this.addCoins(ch.reward);
      this.saveData(this.currentPlayer);
      soundEngine.playChallengeSuccess();
      if (window.gameInstance) {
        window.gameInstance.showChallengeCompleted(ch.title, ch.reward);
      }
      if (window.menuManager) {
        window.menuManager.refreshChallengesUI();
      }
    }
  }

  loadSavedData() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        return JSON.parse(raw);
      }
    } catch (e) {
      console.warn('Failed to load profile:', e);
    }
    return null;
  }

  saveData(player) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(player));
    } catch (e) {
      console.warn('Failed to save profile:', e);
    }
  }

  checkExistingSession() {
    const saved = this.loadSavedData();
    if (saved && saved.name) {
      if (!saved.challenges) {
        saved.challenges = this.getDefaultChallenges();
      }
      if (!saved.unlockedVehicles) {
        saved.unlockedVehicles = ['buggy'];
      }
      if (!saved.selectedVehicle) {
        saved.selectedVehicle = 'buggy';
      }
      this.saveData(saved);
      this.currentPlayer = saved;
      this.transitionToGarage();
    } else {
      // Show auth screen by default
      this.authScreen.classList.add('active');
      this.menuScreen.classList.remove('active');
    }
  }

  handleGuestLogin() {
    // Check if we already had a guest profile saved
    let saved = this.loadSavedData();
    if (!saved) {
      saved = this.getDefaultProfile('guest');
      this.saveData(saved);
    }
    this.currentPlayer = saved;
    this.transitionToGarage();
  }

  handleEmailAuth() {
    const email = this.inputEmail.value.trim().toLowerCase();
    const pass = this.inputPassword.value.trim();
    const name = this.inputName.value.trim();

    if (!email || !email.includes('@')) {
      this.showError('Please enter a valid email address.');
      return;
    }
    if (pass.length < 4) {
      this.showError('Password must be at least 4 characters long.');
      return;
    }

    let saved = this.loadSavedData();
    if (!saved) {
      saved = this.getDefaultProfile('email', email, name);
    } else {
      saved.type = 'email';
      saved.email = email;
      if (name) saved.name = name;
    }

    this.saveData(saved);
    this.currentPlayer = saved;
    this.transitionToGarage();
  }

  logout() {
    soundEngine.ensureContext();
    this.currentPlayer = null;
    this.authScreen.classList.add('active');
    this.menuScreen.classList.remove('active');
    const gameScreen = document.getElementById('game-screen');
    if (gameScreen) gameScreen.classList.remove('active');
  }

  transitionToGarage() {
    this.updateHUD();
    this.authScreen.classList.remove('active');
    this.menuScreen.classList.add('active');
    
    // Notify menu manager if initialized
    if (window.menuManager) {
      window.menuManager.refreshUI();
    }
  }

  updateHUD() {
    if (!this.currentPlayer) return;

    if (this.displayPlayerName) {
      this.displayPlayerName.textContent = this.currentPlayer.name;
    }
    if (this.displayAccountType) {
      this.displayAccountType.textContent = this.currentPlayer.type.toUpperCase();
      this.displayAccountType.style.color = this.currentPlayer.type === 'guest' ? 'var(--accent-cyan)' : 'var(--accent-orange)';
    }
    if (this.displayCoins) {
      this.displayCoins.textContent = Number(this.currentPlayer.coins).toLocaleString();
    }
    if (this.displayGems) {
      this.displayGems.textContent = Number(this.currentPlayer.gems).toLocaleString();
    }
  }

  addCoins(amount) {
    if (!this.currentPlayer) return;
    this.currentPlayer.coins = Math.max(0, this.currentPlayer.coins + amount);
    this.saveData(this.currentPlayer);
    this.updateHUD();
  }

  spendCoins(amount) {
    if (!this.currentPlayer || this.currentPlayer.coins < amount) return false;
    this.currentPlayer.coins -= amount;
    this.saveData(this.currentPlayer);
    this.updateHUD();
    return true;
  }

  updateRecord(stage, distance) {
    if (!this.currentPlayer) return;
    if (!this.currentPlayer.records) this.currentPlayer.records = {};
    const current = this.currentPlayer.records[stage] || 0;
    if (distance > current) {
      this.currentPlayer.records[stage] = Math.floor(distance);
      this.saveData(this.currentPlayer);
      this.updateHUD();
      return true; // new high score
    }
    return false;
  }

  unlockVehicle(vehicleId, cost) {
    if (!this.currentPlayer) return false;
    if (this.currentPlayer.coins < cost) return false;
    if (!this.currentPlayer.unlockedVehicles) this.currentPlayer.unlockedVehicles = ['buggy'];
    if (!this.currentPlayer.unlockedVehicles.includes(vehicleId)) {
      this.currentPlayer.coins -= cost;
      this.currentPlayer.unlockedVehicles.push(vehicleId);
    }
    this.currentPlayer.selectedVehicle = vehicleId;
    this.saveData(this.currentPlayer);
    this.updateHUD();
    return true;
  }

  selectVehicle(vehicleId) {
    if (!this.currentPlayer) return;
    if (!this.currentPlayer.unlockedVehicles) this.currentPlayer.unlockedVehicles = ['buggy'];
    if (this.currentPlayer.unlockedVehicles.includes(vehicleId)) {
      this.currentPlayer.selectedVehicle = vehicleId;
      this.saveData(this.currentPlayer);
    }
  }
}

// Global Auth Instance
const authManager = new AuthManager();
