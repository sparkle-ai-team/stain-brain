/* ==========================================
   STAIN BRAIN — Full App Logic
   Dashboard, favorites, localStorage,
   two pathways (known + mystery), results.
   ========================================== */

// ==========================================
//  DATA STORE (localStorage)
// ==========================================

const STORAGE_KEY = 'stainbrain_stains';

function loadStains() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch { return []; }
}

function saveStains(stains) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(stains));
}

function addStain(stainRecord) {
  const stains = loadStains();
  stainRecord.id = Date.now().toString();
  stainRecord.favorite = false;
  stainRecord.createdAt = new Date().toISOString();
  stains.unshift(stainRecord);
  saveStains(stains);
  return stainRecord;
}

function toggleFavorite(id) {
  const stains = loadStains();
  const s = stains.find(x => x.id === id);
  if (s) { s.favorite = !s.favorite; saveStains(stains); }
  return s ? s.favorite : false;
}

function getStainById(id) {
  return loadStains().find(x => x.id === id) || null;
}

// Track the current result being viewed
let currentViewId = null;

// ==========================================
//  ELEMENTS
// ==========================================

const screens = {
  splash:   document.getElementById('splash-screen'),
  home:     document.getElementById('home-screen'),
  pathway:  document.getElementById('pathway-screen'),
  mystery:  document.getElementById('mystery-screen'),
  form:     document.getElementById('form-screen'),
  loading:  document.getElementById('loading-screen'),
  results:  document.getElementById('results-screen'),
};

const els = {
  // Splash
  getStartedBtn: document.getElementById('get-started-btn'),
  // Home
  newStainBtn:   document.getElementById('new-stain-btn'),
  recentCards:   document.getElementById('recent-cards'),
  recentEmpty:   document.getElementById('recent-empty'),
  favoritesCards: document.getElementById('favorites-cards'),
  favoritesEmpty: document.getElementById('favorites-empty'),
  // Pathway
  pathwayHomeLink: document.getElementById('pathway-home-link'),
  pathwayCloseBtn: document.getElementById('pathway-close-btn'),
  pathKnownBtn:  document.getElementById('path-known-btn'),
  pathMysteryBtn: document.getElementById('path-mystery-btn'),
  // Mystery
  mysteryHomeLink: document.getElementById('mystery-home-link'),
  mysteryCloseBtn: document.getElementById('mystery-close-btn'),
  mysteryPhotoArea: document.getElementById('mystery-photo-area'),
  mysteryPhotoInput: document.getElementById('mystery-photo-input'),
  mysteryUploadPlaceholder: document.getElementById('mystery-upload-placeholder'),
  mysteryPreviewContainer: document.getElementById('mystery-preview-container'),
  mysteryPhotoPreview: document.getElementById('mystery-photo-preview'),
  mysteryRemovePhoto: document.getElementById('mystery-remove-photo'),
  mysteryAnalyzeBtn: document.getElementById('mystery-analyze-btn'),
  // Form
  formHomeLink:  document.getElementById('form-home-link'),
  formCloseBtn:  document.getElementById('form-close-btn'),
  photoUploadArea: document.getElementById('photo-upload-area'),
  photoInput:    document.getElementById('photo-input'),
  uploadPlaceholder: document.getElementById('upload-placeholder'),
  photoPreviewContainer: document.getElementById('photo-preview-container'),
  photoPreview:  document.getElementById('photo-preview'),
  removePhotoBtn: document.getElementById('remove-photo-btn'),
  fabricSelect:  document.getElementById('fabric-select'),
  stainInput:    document.getElementById('stain-input'),
  otherTagBtn:   document.getElementById('other-tag-btn'),
  otherInputWrap: document.getElementById('other-input-wrap'),
  timeSelect:    document.getElementById('time-select'),
  notesInput:    document.getElementById('notes-input'),
  analyzeBtn:    document.getElementById('analyze-btn'),
  // Results
  resultsHomeLink: document.getElementById('results-home-link'),
  resultsCloseBtn: document.getElementById('results-close-btn'),
  backHomeBtn:   document.getElementById('back-home-btn'),
};

// ==========================================
//  SCREEN NAVIGATION
// ==========================================

function showScreen(name) {
  Object.values(screens).forEach(s => s.classList.remove('active'));
  screens[name].classList.add('active');
  const scrollable = screens[name].querySelector('.home-container, .form-container, .results-container, .pathway-container, .mystery-container');
  if (scrollable) scrollable.scrollTop = 0;
}

// ==========================================
//  SPLASH
// ==========================================

els.getStartedBtn.addEventListener('click', () => {
  showScreen('home');
  renderDashboard();
});

// ==========================================
//  HOME DASHBOARD
// ==========================================

// Tabs
document.querySelectorAll('.home-tab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.home-tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
    tab.classList.add('active');
    document.getElementById(tab.dataset.tab + '-tab').classList.add('active');
  });
});

// New Stain button → Pathway screen
els.newStainBtn.addEventListener('click', () => {
  showScreen('pathway');
});

function renderDashboard() {
  const stains = loadStains();
  const favs = stains.filter(s => s.favorite);

  // Recent
  if (stains.length === 0) {
    els.recentCards.innerHTML = '';
    els.recentEmpty.style.display = 'block';
  } else {
    els.recentEmpty.style.display = 'none';
    els.recentCards.innerHTML = stains.map(s => buildCard(s)).join('');
    attachCardListeners(els.recentCards);
  }

  // Favorites
  if (favs.length === 0) {
    els.favoritesCards.innerHTML = '';
    els.favoritesEmpty.style.display = 'block';
  } else {
    els.favoritesEmpty.style.display = 'none';
    els.favoritesCards.innerHTML = favs.map(s => buildCard(s)).join('');
    attachCardListeners(els.favoritesCards);
  }
}

function buildCard(s) {
  const diffClass = s.result.difficultyClass || 'moderate';
  const diffLabel = s.result.difficultyLabel || 'Moderate';
  const timeAgo = getRelativeTime(s.createdAt);

  return `
    <div class="stain-card" data-id="${s.id}">
      <div class="card-top">
        <div>
          <div class="card-stain-name">${s.result.stainName}</div>
          <div class="card-meta">${s.result.fabricLabel} &middot; ${timeAgo}</div>
        </div>
        <button class="card-fav-btn ${s.favorite ? 'favorited' : ''}" data-fav-id="${s.id}" title="Toggle favorite">
          <svg width="20" height="20" fill="${s.favorite ? '#e878a4' : 'none'}" stroke="${s.favorite ? '#e878a4' : 'rgba(0,0,0,0.2)'}" stroke-width="2" viewBox="0 0 24 24"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
        </button>
      </div>
      <div class="card-bottom">
        <span class="card-difficulty ${diffClass}">
          <span class="card-diff-dot"></span>
          ${diffLabel}
        </span>
        <span class="card-success">${s.result.success}% success</span>
      </div>
    </div>
  `;
}

function attachCardListeners(container) {
  container.querySelectorAll('.stain-card').forEach(card => {
    card.addEventListener('click', (e) => {
      if (e.target.closest('.card-fav-btn')) return;
      const id = card.dataset.id;
      const stain = getStainById(id);
      if (stain) {
        currentViewId = id;
        renderResult(stain.result);
        showScreen('results');
      }
    });
  });

  container.querySelectorAll('.card-fav-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const id = btn.dataset.favId;
      toggleFavorite(id);
      renderDashboard();
    });
  });
}

function getRelativeTime(isoString) {
  const diff = Date.now() - new Date(isoString).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return mins + 'm ago';
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return hrs + 'h ago';
  const days = Math.floor(hrs / 24);
  if (days < 7) return days + 'd ago';
  return new Date(isoString).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

// ==========================================
//  PATHWAY SCREEN
// ==========================================

els.pathwayHomeLink.addEventListener('click', () => { showScreen('home'); renderDashboard(); });
els.pathwayCloseBtn.addEventListener('click', () => { showScreen('home'); renderDashboard(); });

els.pathKnownBtn.addEventListener('click', () => {
  resetForm();
  showScreen('form');
});

els.pathMysteryBtn.addEventListener('click', () => {
  resetMysteryForm();
  showScreen('mystery');
});

// ==========================================
//  MYSTERY STAIN SCREEN
// ==========================================

els.mysteryHomeLink.addEventListener('click', () => { showScreen('home'); renderDashboard(); });
els.mysteryCloseBtn.addEventListener('click', () => { showScreen('home'); renderDashboard(); });

// Photo upload for mystery
els.mysteryPhotoArea.addEventListener('click', () => {
  if (els.mysteryPreviewContainer.classList.contains('hidden')) els.mysteryPhotoInput.click();
});
els.mysteryPhotoInput.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (file) showMysteryPreview(file);
});
els.mysteryPhotoArea.addEventListener('dragover', (e) => { e.preventDefault(); els.mysteryPhotoArea.classList.add('dragover'); });
els.mysteryPhotoArea.addEventListener('dragleave', () => { els.mysteryPhotoArea.classList.remove('dragover'); });
els.mysteryPhotoArea.addEventListener('drop', (e) => {
  e.preventDefault();
  els.mysteryPhotoArea.classList.remove('dragover');
  const file = e.dataTransfer.files[0];
  if (file && file.type.startsWith('image/')) showMysteryPreview(file);
});

function showMysteryPreview(file) {
  const reader = new FileReader();
  reader.onload = (e) => {
    els.mysteryPhotoPreview.src = e.target.result;
    els.mysteryUploadPlaceholder.style.display = 'none';
    els.mysteryPreviewContainer.classList.remove('hidden');
    els.mysteryAnalyzeBtn.disabled = false;
  };
  reader.readAsDataURL(file);
}

els.mysteryRemovePhoto.addEventListener('click', (e) => {
  e.stopPropagation();
  resetMysteryForm();
});

function resetMysteryForm() {
  els.mysteryPhotoInput.value = '';
  els.mysteryPhotoPreview.src = '';
  els.mysteryUploadPlaceholder.style.display = 'block';
  els.mysteryPreviewContainer.classList.add('hidden');
  els.mysteryAnalyzeBtn.disabled = true;
}

// Analyze mystery stain
els.mysteryAnalyzeBtn.addEventListener('click', () => {
  showScreen('loading');
  runLoadingAnimation(() => {
    const result = generateMysteryResult();
    const record = { formData: { mystery: true }, result: result };
    const saved = addStain(record);
    currentViewId = saved.id;
    renderResult(result);
    showScreen('results');
  });
});

function generateMysteryResult() {
  // Pick a random stain from the database for a fun demo
  const stainKeys = Object.keys(STAIN_DATABASE);
  const randomKey = stainKeys[Math.floor(Math.random() * stainKeys.length)];
  const stainData = STAIN_DATABASE[randomKey];
  const stainName = randomKey.charAt(0).toUpperCase() + randomKey.slice(1);

  const success = Math.min(95, Math.max(40, stainData.successBase - 5));
  let difficultyLabel = 'Moderate', difficultyClass = 'moderate';
  if (stainData.difficulty === 'easy') { difficultyLabel = 'Easy'; difficultyClass = 'easy'; }
  if (stainData.difficulty === 'hard') { difficultyLabel = 'Tough'; difficultyClass = 'hard'; }

  return {
    stainName: stainName + ' (AI Detected)',
    fabricLabel: 'Unknown Fabric',
    timeLabel: 'Unknown',
    difficultyLabel, difficultyClass,
    success,
    supplies: stainData.supplies,
    steps: stainData.steps,
    tips: stainData.tips,
    timeNote: 'Since we don\'t know how old this stain is, treat it as a set-in stain for best results.',
    warning: 'AI identification may not be 100% accurate. Always test any cleaning solution on a small, hidden area first.',
  };
}

// ==========================================
//  FORM (Known Stain)
// ==========================================

// Home links
els.formHomeLink.addEventListener('click', () => { showScreen('home'); renderDashboard(); });
els.formCloseBtn.addEventListener('click', () => { showScreen('home'); renderDashboard(); });

// Photo upload
els.photoUploadArea.addEventListener('click', () => {
  if (els.photoPreviewContainer.classList.contains('hidden')) els.photoInput.click();
});
els.photoInput.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (file) showPhotoPreview(file);
});
els.photoUploadArea.addEventListener('dragover', (e) => { e.preventDefault(); els.photoUploadArea.classList.add('dragover'); });
els.photoUploadArea.addEventListener('dragleave', () => { els.photoUploadArea.classList.remove('dragover'); });
els.photoUploadArea.addEventListener('drop', (e) => {
  e.preventDefault();
  els.photoUploadArea.classList.remove('dragover');
  const file = e.dataTransfer.files[0];
  if (file && file.type.startsWith('image/')) showPhotoPreview(file);
});

function showPhotoPreview(file) {
  const reader = new FileReader();
  reader.onload = (e) => {
    els.photoPreview.src = e.target.result;
    els.uploadPlaceholder.style.display = 'none';
    els.photoPreviewContainer.classList.remove('hidden');
  };
  reader.readAsDataURL(file);
}

els.removePhotoBtn.addEventListener('click', (e) => { e.stopPropagation(); removePhoto(); });

function removePhoto() {
  els.photoInput.value = '';
  els.photoPreview.src = '';
  els.uploadPlaceholder.style.display = 'block';
  els.photoPreviewContainer.classList.add('hidden');
}

// ---- Stain Quick Tags + Other ----
let selectedStainValue = '';

document.querySelectorAll('.tag-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.tag-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    if (btn.dataset.value === '__other__') {
      els.otherInputWrap.classList.remove('hidden');
      els.stainInput.value = '';
      els.stainInput.focus();
      selectedStainValue = '';
    } else {
      els.otherInputWrap.classList.add('hidden');
      selectedStainValue = btn.dataset.value;
      els.stainInput.value = btn.dataset.value;
    }
    updateAnalyzeBtn();
  });
});

if (els.stainInput) {
  els.stainInput.addEventListener('input', () => {
    selectedStainValue = els.stainInput.value.trim();
    updateAnalyzeBtn();
  });
}

[els.fabricSelect, els.timeSelect].forEach(el => {
  el.addEventListener('change', updateAnalyzeBtn);
});

function getStainValue() {
  if (els.otherTagBtn.classList.contains('active')) {
    return els.stainInput.value.trim();
  }
  return selectedStainValue;
}

function updateAnalyzeBtn() {
  const valid =
    els.fabricSelect.value &&
    getStainValue() &&
    els.timeSelect.value;
  els.analyzeBtn.disabled = !valid;
}

function resetForm() {
  els.fabricSelect.selectedIndex = 0;
  selectedStainValue = '';
  if (els.stainInput) els.stainInput.value = '';
  els.otherInputWrap.classList.add('hidden');
  els.timeSelect.selectedIndex = 0;
  els.notesInput.value = '';
  removePhoto();
  document.querySelectorAll('.tag-btn').forEach(b => b.classList.remove('active'));
  updateAnalyzeBtn();
}

// ---- Analyze / Submit ----
els.analyzeBtn.addEventListener('click', () => {
  showScreen('loading');
  const data = getFormData();
  runLoadingAnimation(() => {
    const result = generateResult(data);
    const record = { formData: data, result: result };
    const saved = addStain(record);
    currentViewId = saved.id;
    renderResult(result);
    showScreen('results');
  });
});

function getFormData() {
  return {
    fabric: els.fabricSelect.value,
    fabricLabel: els.fabricSelect.options[els.fabricSelect.selectedIndex].text,
    stain: getStainValue(),
    time: els.timeSelect.value,
    timeLabel: els.timeSelect.options[els.timeSelect.selectedIndex].text,
    notes: els.notesInput.value.trim(),
    hasPhoto: !els.photoPreviewContainer.classList.contains('hidden'),
  };
}

// ==========================================
//  LOADING ANIMATION
// ==========================================

function runLoadingAnimation(callback) {
  const steps = ['step-1', 'step-2', 'step-3', 'step-4'];
  steps.forEach(id => {
    const el = document.getElementById(id);
    el.classList.remove('active', 'done');
  });
  let i = 0;
  function next() {
    if (i > 0) document.getElementById(steps[i - 1]).classList.replace('active', 'done');
    if (i < steps.length) {
      document.getElementById(steps[i]).classList.add('active');
      i++;
      setTimeout(next, 700 + Math.random() * 400);
    } else {
      setTimeout(callback, 500);
    }
  }
  setTimeout(next, 300);
}

// ==========================================
//  RESULTS SCREEN
// ==========================================

els.resultsHomeLink.addEventListener('click', () => { showScreen('home'); renderDashboard(); });
els.resultsCloseBtn.addEventListener('click', () => { showScreen('home'); renderDashboard(); });
els.backHomeBtn.addEventListener('click', () => { showScreen('home'); renderDashboard(); });

function renderResult(result) {
  document.getElementById('result-stain-type').textContent = result.stainName;
  document.getElementById('result-fabric').textContent = result.fabricLabel;
  document.getElementById('result-time').textContent = result.timeLabel;

  const diffBadge = document.getElementById('result-difficulty');
  diffBadge.className = 'difficulty-badge ' + result.difficultyClass;
  document.getElementById('difficulty-text').textContent = result.difficultyLabel;

  const successBar = document.getElementById('success-bar');
  const successText = document.getElementById('success-text');
  successBar.style.width = '0%';
  successText.textContent = result.success + '% success rate';
  setTimeout(() => { successBar.style.width = result.success + '%'; }, 200);

  const suppliesList = document.getElementById('supplies-list');
  suppliesList.innerHTML = result.supplies
    .map(s => `<div class="supply-chip"><span style="color:var(--teal);font-size:15px">&#10003;</span> ${s}</div>`)
    .join('');

  const stepsList = document.getElementById('steps-list');
  stepsList.innerHTML = result.steps
    .map((s, i) => `
      <div class="step-item">
        <div class="step-number">${i + 1}</div>
        <div class="step-content">
          <h4>${s.title}</h4>
          <p>${s.desc}</p>
        </div>
      </div>
    `).join('');

  const tipsList = document.getElementById('tips-list');
  let allTips = [...result.tips];
  if (result.timeNote) allTips.unshift(result.timeNote);
  tipsList.innerHTML = allTips
    .map(t => `<div class="tip-item"><span class="tip-bullet">&bull;</span><span>${t}</span></div>`)
    .join('');

  document.getElementById('warning-text').textContent = result.warning;
}

// ==========================================
//  AI RESULT GENERATION (Simulated)
// ==========================================

const STAIN_DATABASE = {
  coffee: {
    difficulty: 'moderate', successBase: 80,
    supplies: ['White vinegar', 'Dish soap', 'Cold water', 'Clean cloth', 'Baking soda'],
    steps: [
      { title: 'Blot the stain', desc: 'Use a clean white cloth to blot up as much coffee as possible. Don\'t rub \u2014 that pushes it deeper into the fibers.' },
      { title: 'Mix cleaning solution', desc: 'Combine 1 tablespoon white vinegar, 1 tablespoon dish soap, and 2 cups of cold water in a bowl.' },
      { title: 'Apply and dab', desc: 'Dip a clean cloth into the solution and gently dab the stain from the outside in. This prevents spreading.' },
      { title: 'Let it sit', desc: 'Leave the solution on the stain for 5\u201310 minutes to break down the coffee oils.' },
      { title: 'Rinse and repeat', desc: 'Blot with cold water to rinse. Repeat steps 3\u20134 if the stain is still visible.' },
      { title: 'Baking soda finish', desc: 'For stubborn remnants, make a paste of baking soda and water, apply to the area, wait 15 min, then brush off.' },
    ],
    tips: [
      'Cold water only! Hot water can set coffee stains permanently.',
      'If the item is machine-washable, run it through a cold cycle after treating.',
      'For old, dried coffee stains, try soaking in vinegar for 30 minutes before treating.',
    ],
  },
  'red wine': {
    difficulty: 'hard', successBase: 70,
    supplies: ['Salt', 'Club soda', 'Hydrogen peroxide (3%)', 'Dish soap', 'Clean cloth'],
    steps: [
      { title: 'Act fast \u2014 blot it', desc: 'Immediately blot (don\'t rub!) with a clean cloth to absorb as much wine as possible.' },
      { title: 'Salt mountain', desc: 'Pour a generous mound of table salt over the entire stain. The salt absorbs the wine. Wait 5 minutes.' },
      { title: 'Club soda flush', desc: 'Brush off the salt and pour club soda directly onto the stain. The carbonation helps lift the pigment.' },
      { title: 'Peroxide power mix', desc: 'Mix equal parts hydrogen peroxide and dish soap. Apply directly to the stain with a cloth.' },
      { title: 'Wait and watch', desc: 'Let the peroxide mixture sit for 20\u201330 minutes. You should see the stain lightening.' },
      { title: 'Rinse thoroughly', desc: 'Rinse with cold water. Check the stain before drying \u2014 heat will set any remaining color.' },
    ],
    tips: [
      'Never use hot water or a dryer until the stain is fully gone.',
      'White wine does NOT help remove red wine \u2014 that\'s a myth!',
      'Hydrogen peroxide can bleach dark fabrics. Always test on a hidden spot first.',
    ],
  },
  grass: {
    difficulty: 'moderate', successBase: 85,
    supplies: ['Rubbing alcohol', 'White vinegar', 'Laundry detergent', 'Old toothbrush', 'Cold water'],
    steps: [
      { title: 'Pre-treat with alcohol', desc: 'Apply rubbing alcohol directly to the grass stain using a cotton ball. Let it sit for 10 minutes.' },
      { title: 'Scrub gently', desc: 'Using an old toothbrush, gently scrub the stain in small circular motions. You\'ll see the green start to lift.' },
      { title: 'Vinegar soak', desc: 'Mix 1 part white vinegar with 2 parts cold water. Soak the stained area for 30 minutes.' },
      { title: 'Detergent rub', desc: 'Apply a small amount of liquid laundry detergent directly onto the stain and work it in with your fingers.' },
      { title: 'Cold water rinse', desc: 'Rinse thoroughly with cold water. Check if the stain has lifted before proceeding to any heat.' },
    ],
    tips: [
      'Grass stains are basically plant dye \u2014 rubbing alcohol is the best first attack.',
      'Enzyme-based detergents (like OxiClean) work especially well on grass.',
      'Avoid hot water at all costs \u2014 it cooks the proteins and sets the stain.',
    ],
  },
  grease: {
    difficulty: 'moderate', successBase: 82,
    supplies: ['Dish soap (Dawn works best)', 'Baking soda', 'Cardboard', 'Hot water', 'Old toothbrush'],
    steps: [
      { title: 'Absorb excess grease', desc: 'Sprinkle baking soda generously over the grease stain. Press gently and let it absorb for 15 minutes.' },
      { title: 'Brush off powder', desc: 'Use a soft brush or cloth to remove the baking soda. It should have absorbed a lot of the grease.' },
      { title: 'Apply dish soap', desc: 'Squeeze a few drops of dish soap (Dawn is ideal) directly onto the stain. Dish soap is literally designed to cut grease!' },
      { title: 'Work it in', desc: 'Use an old toothbrush to gently work the soap into the fabric in circular motions for 2\u20133 minutes.' },
      { title: 'Hot water rinse', desc: 'Unlike most stains, grease responds to hot water. Rinse with the hottest water safe for your fabric.' },
      { title: 'Check and repeat', desc: 'If the grease mark is still visible, repeat the soap treatment. It often takes 2 rounds.' },
    ],
    tips: [
      'Grease is one of the few stains where hot water actually helps!',
      'Place cardboard behind the stain to stop grease from transferring to the other side.',
      'Baby powder or cornstarch can substitute for baking soda in step 1.',
    ],
  },
  blood: {
    difficulty: 'hard', successBase: 75,
    supplies: ['Hydrogen peroxide (3%)', 'Cold water', 'Salt', 'Dish soap', 'Clean cloth'],
    steps: [
      { title: 'Cold water immediately', desc: 'Run cold water through the back of the fabric to push the blood out, not in. Never use warm or hot water!' },
      { title: 'Salt paste', desc: 'Make a thick paste with salt and cold water. Apply it to the stain and let it sit for 15\u201320 minutes.' },
      { title: 'Rinse and check', desc: 'Rinse with cold water. If the stain remains, proceed to the next step.' },
      { title: 'Hydrogen peroxide (test first!)', desc: 'For white or light fabrics, apply hydrogen peroxide directly. It will fizz on contact \u2014 that\'s the blood breaking down.' },
      { title: 'Soap and scrub', desc: 'Apply dish soap to the area and gently scrub with your fingers or a soft brush.' },
      { title: 'Final cold rinse', desc: 'Rinse thoroughly with cold water until all soap and residue is gone.' },
    ],
    tips: [
      'COLD water only \u2014 hot water cooks the proteins in blood and makes it permanent.',
      'Your own saliva actually contains enzymes that break down your own blood. Weird but true for small spots!',
      'For dried blood on sheets, soak in cold salt water overnight before treating.',
    ],
  },
  ink: {
    difficulty: 'hard', successBase: 65,
    supplies: ['Rubbing alcohol (90%)', 'Hairspray (alcohol-based)', 'Paper towels', 'Cotton balls', 'Dish soap'],
    steps: [
      { title: 'Place stain face-down', desc: 'Put the stained area face-down on a stack of paper towels. You\'ll push the ink out the back.' },
      { title: 'Apply rubbing alcohol', desc: 'Saturate the back of the stain with rubbing alcohol. The higher the percentage, the better (90%+ is ideal).' },
      { title: 'Blot and replace', desc: 'Press with cotton balls from behind. As the paper towels under the stain absorb ink, replace them with fresh ones.' },
      { title: 'Repeat the process', desc: 'Continue applying alcohol and blotting. Ink stains take patience \u2014 this can take 10\u201315 rounds.' },
      { title: 'Soap wash', desc: 'Once most ink is transferred out, rub dish soap into the remaining stain and let it sit for 10 minutes.' },
      { title: 'Cold rinse', desc: 'Rinse with cold water. Air dry only \u2014 check the stain is gone before using any heat.' },
    ],
    tips: [
      'Alcohol-based hairspray is the old-school trick, and it still works great.',
      'Ballpoint ink is easier to remove than permanent marker \u2014 but this method helps with both.',
      'For leather, use a dedicated leather cleaner instead of alcohol.',
    ],
  },
  mud: {
    difficulty: 'easy', successBase: 92,
    supplies: ['Butter knife or spoon', 'Liquid laundry detergent', 'White vinegar', 'Cold water', 'Clean cloth'],
    steps: [
      { title: 'Let it dry completely', desc: 'This sounds counterintuitive, but let the mud dry fully. Wet mud smears; dry mud flakes off.' },
      { title: 'Scrape off dried mud', desc: 'Use a butter knife, spoon, or stiff brush to scrape/flake off as much dried mud as possible.' },
      { title: 'Apply detergent', desc: 'Rub liquid laundry detergent directly into the remaining stain. Work it in with your fingers.' },
      { title: 'Soak in vinegar water', desc: 'Mix 1 tablespoon vinegar with 2 cups cold water. Soak the stained area for 15 minutes.' },
      { title: 'Rinse and inspect', desc: 'Rinse with cold water. The mud stain should be completely gone or nearly invisible.' },
    ],
    tips: [
      'The #1 mistake is trying to clean mud while it\'s still wet. Let it dry first!',
      'Vacuum up dried mud flakes for an easier cleanup.',
      'For white fabrics, a little lemon juice in the soak adds extra brightening power.',
    ],
  },
  'tomato sauce': {
    difficulty: 'moderate', successBase: 78,
    supplies: ['Cold water', 'Dish soap', 'White vinegar', 'Ice cube', 'Hydrogen peroxide', 'Clean cloth'],
    steps: [
      { title: 'Scrape off excess', desc: 'Use a spoon or knife to gently remove any solid sauce. Scoop away from the fabric, don\'t push it in.' },
      { title: 'Cold water flush', desc: 'Run cold water through the back of the stain to push the tomato pigment forward and out.' },
      { title: 'Dish soap treatment', desc: 'Apply a drop of dish soap directly to the stain. Gently rub it in with your fingertips for 2 minutes.' },
      { title: 'Vinegar boost', desc: 'Dab white vinegar onto the stain. The acid helps break down the tomato\'s natural red dye.' },
      { title: 'Ice trick for old stains', desc: 'Rub an ice cube on the stain to keep the area cold while the cleaning agents work.' },
      { title: 'Rinse and sun-dry', desc: 'Rinse with cold water. If possible, lay the item in direct sunlight \u2014 UV light naturally bleaches tomato stains!' },
    ],
    tips: [
      'Sunlight is your secret weapon \u2014 it naturally breaks down the red lycopene pigment in tomatoes.',
      'For set-in stains, try a hydrogen peroxide soak for 30 min (light fabrics only).',
      'Avoid hot water \u2014 it permanently sets tomato stains.',
    ],
  },
};

const GENERIC_RESULT = {
  difficulty: 'moderate', successBase: 70,
  supplies: ['Dish soap', 'White vinegar', 'Baking soda', 'Cold water', 'Clean white cloth', 'Old toothbrush'],
  steps: [
    { title: 'Blot the stain', desc: 'Use a clean white cloth to blot up as much of the spill as possible. Always blot \u2014 never rub.' },
    { title: 'Cold water rinse', desc: 'Run cold water through the back of the stain to push it out of the fabric fibers.' },
    { title: 'Make a cleaning paste', desc: 'Mix 1 tablespoon each of dish soap, white vinegar, and baking soda into a paste.' },
    { title: 'Apply and scrub gently', desc: 'Spread the paste on the stain and gently work it in with an old toothbrush using small circular motions.' },
    { title: 'Let it sit', desc: 'Allow the paste to work on the stain for 15\u201330 minutes.' },
    { title: 'Rinse and check', desc: 'Rinse with cold water. If the stain persists, repeat the treatment. Don\'t apply heat until the stain is gone.' },
  ],
  tips: [
    'Cold water is almost always safer than hot for unknown stains.',
    'White vinegar + dish soap + baking soda is the universal stain-fighting combo.',
    'Always test cleaning solutions on a hidden area of the fabric first.',
  ],
};

const TIME_MODIFIERS = {
  'just-now':  { successMod: 10, note: 'Fresh stains are much easier to remove.' },
  'under-1hr': { successMod: 5,  note: 'The stain hasn\'t fully set yet \u2014 good timing!' },
  'few-hours': { successMod: 0,  note: '' },
  'overnight': { successMod: -5, note: 'The stain has had time to set. You may need to repeat steps.' },
  '1-3-days':  { successMod: -10, note: 'This stain has set in. Plan for multiple treatment rounds.' },
  'week-plus': { successMod: -20, note: 'Old stains are tough. You may need to soak overnight before treating.' },
  'unknown':   { successMod: -10, note: 'Since we\'re not sure how old this is, treat it as a set-in stain.' },
};

const FABRIC_WARNINGS = {
  silk:    'Silk is extremely delicate. Use only cold water and gentle dabbing. Avoid vinegar and peroxide. Consider professional dry cleaning for valuable items.',
  wool:    'Wool can shrink and felt with agitation or heat. Use cold water only and avoid rubbing. Lay flat to dry.',
  leather: 'Leather requires special care. Avoid water-based soaking. Use a dedicated leather cleaner when possible, and always condition after cleaning.',
  suede:   'Suede is very sensitive to water and can stain further if wet. For valuable suede items, professional cleaning is strongly recommended.',
  default: 'Always test any cleaning solution on a small, hidden area of the fabric first to make sure it won\'t cause discoloration or damage.',
};

function generateResult(data) {
  const stainKey = data.stain.toLowerCase();
  let stainData = GENERIC_RESULT;
  for (const [key, val] of Object.entries(STAIN_DATABASE)) {
    if (stainKey.includes(key) || key.includes(stainKey)) { stainData = val; break; }
  }

  const timeMod = TIME_MODIFIERS[data.time] || { successMod: 0, note: '' };
  const success = Math.min(98, Math.max(30, stainData.successBase + timeMod.successMod));
  const warning = FABRIC_WARNINGS[data.fabric] || FABRIC_WARNINGS.default;

  let difficultyLabel = 'Moderate', difficultyClass = 'moderate';
  if (stainData.difficulty === 'easy') { difficultyLabel = 'Easy'; difficultyClass = 'easy'; }
  if (stainData.difficulty === 'hard') { difficultyLabel = 'Tough'; difficultyClass = 'hard'; }

  return {
    stainName: data.stain,
    fabricLabel: data.fabricLabel,
    timeLabel: data.timeLabel,
    difficultyLabel, difficultyClass,
    success,
    supplies: stainData.supplies,
    steps: stainData.steps,
    tips: stainData.tips,
    timeNote: timeMod.note,
    warning,
  };
}
