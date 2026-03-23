(() => {
  var __async = (__this, __arguments, generator) => {
    return new Promise((resolve, reject) => {
      var fulfilled = (value) => {
        try {
          step(generator.next(value));
        } catch (e) {
          reject(e);
        }
      };
      var rejected = (value) => {
        try {
          step(generator.throw(value));
        } catch (e) {
          reject(e);
        }
      };
      var step = (x) => x.done ? resolve(x.value) : Promise.resolve(x.value).then(fulfilled, rejected);
      step((generator = generator.apply(__this, __arguments)).next());
    });
  };

  // src/state.ts
  var handsState = /* @__PURE__ */ new Map();
  var isDragging = false;
  var dragAction = null;
  var isTouching = false;
  var lastTouchedHand = null;
  var currentEditMode = "raise";
  var loadedPresets = {};
  var currentMode = "edit";
  var currentTrainingMode = "range-recall";
  var trainingRange = null;
  var trainingRangeName = "";
  var trainingRangeDescription = "";
  var currentLoadedPresetKey = "";
  var spotDrillState = null;
  function setIsDragging(value) {
    isDragging = value;
  }
  function setDragAction(value) {
    dragAction = value;
  }
  function setIsTouching(value) {
    isTouching = value;
  }
  function setLastTouchedHand(value) {
    lastTouchedHand = value;
  }
  function setCurrentEditMode(value) {
    currentEditMode = value;
  }
  function setLoadedPresets(value) {
    loadedPresets = value;
  }
  function setCurrentMode(value) {
    currentMode = value;
  }
  function setCurrentTrainingMode(value) {
    currentTrainingMode = value;
  }
  function setTrainingRange(value) {
    trainingRange = value;
  }
  function setTrainingRangeName(value) {
    trainingRangeName = value;
  }
  function setTrainingRangeDescription(value) {
    trainingRangeDescription = value;
  }
  function setCurrentLoadedPresetKey(value) {
    currentLoadedPresetKey = value;
  }
  function setSpotDrillState(value) {
    spotDrillState = value;
  }

  // src/actions.ts
  function setHandAction(hand, action) {
    const handState = handsState.get(hand);
    if (!handState)
      return;
    if (handState.action === action)
      return;
    handState.action = action;
    const cell = document.querySelector(`[data-hand="${hand}"]`);
    if (cell) {
      cell.classList.remove("action-fold", "action-raise", "action-call", "action-mix-rc", "action-mix-rf");
      cell.classList.add(`action-${action}`);
    }
    updateStats();
  }
  function setEditMode(action) {
    setCurrentEditMode(action);
    const buttons = document.querySelectorAll(".edit-mode-btn");
    buttons.forEach((btn) => {
      const button = btn;
      if (button.dataset.action === action) {
        button.classList.add("active");
      } else {
        button.classList.remove("active");
      }
    });
  }
  function updateStats() {
    const raiseCount = Array.from(handsState.values()).filter((h) => h.action === "raise").length;
    const callCount = Array.from(handsState.values()).filter((h) => h.action === "call").length;
    const mixRcCount = Array.from(handsState.values()).filter((h) => h.action === "mix-rc").length;
    const mixRfCount = Array.from(handsState.values()).filter((h) => h.action === "mix-rf").length;
    const totalSelected = raiseCount + callCount + mixRcCount + mixRfCount;
    const totalHands = 169;
    const percentage = (totalSelected / totalHands * 100).toFixed(1);
    const raisePercentage = (raiseCount / totalHands * 100).toFixed(1);
    const callPercentage = (callCount / totalHands * 100).toFixed(1);
    const mixRcPercentage = (mixRcCount / totalHands * 100).toFixed(1);
    const mixRfPercentage = (mixRfCount / totalHands * 100).toFixed(1);
    const countElement = document.getElementById("selected-count");
    if (countElement) {
      countElement.textContent = `${percentage}% (Raise: ${raisePercentage}%, Call: ${callPercentage}%, Mix RC: ${mixRcPercentage}%, Mix RF: ${mixRfPercentage}%) - ${totalSelected} / ${totalHands}`;
    }
  }
  function resetAll() {
    handsState.forEach((handState) => {
      if (handState.action !== "fold") {
        setHandAction(handState.hand, "fold");
      }
      const cell = document.querySelector(`[data-hand="${handState.hand}"]`);
      if (cell) {
        cell.classList.remove("train-correct", "train-incorrect", "train-missed");
      }
    });
  }
  function selectAll() {
    handsState.forEach((handState) => {
      if (handState.action !== "raise") {
        setHandAction(handState.hand, "raise");
      }
    });
  }
  function getCurrentSelection() {
    const selected = {};
    handsState.forEach((handState) => {
      if (handState.action !== "fold") {
        selected[handState.hand] = handState.action;
      }
    });
    return selected;
  }

  // src/constants.ts
  var RANKS = ["A", "K", "Q", "J", "T", "9", "8", "7", "6", "5", "4", "3", "2"];
  var STORAGE_KEY = "poker-trainer-saved-ranges";
  var INITIAL_HANDS_COUNT = 5;

  // src/grid.ts
  function getHandInfo(row, col) {
    const rank1 = RANKS[row];
    const rank2 = RANKS[col];
    if (row === col) {
      return { hand: `${rank1}${rank2}`, type: "pair" };
    } else if (row < col) {
      return { hand: `${rank1}${rank2}s`, type: "suited" };
    } else {
      return { hand: `${rank2}${rank1}o`, type: "offsuit" };
    }
  }
  function handleMouseDown(hand, event) {
    event.preventDefault();
    const handState = handsState.get(hand);
    if (!handState)
      return;
    setIsDragging(true);
    setDragAction(currentEditMode);
    setHandAction(hand, currentEditMode);
  }
  function handleMouseEnter(hand) {
    if (!isDragging || dragAction === null)
      return;
    setHandAction(hand, dragAction);
  }
  function handleTouchStart(hand, event) {
    event.preventDefault();
    setIsTouching(true);
    setLastTouchedHand(hand);
    const handState = handsState.get(hand);
    if (!handState)
      return;
    setIsDragging(true);
    setDragAction(currentEditMode);
    setHandAction(hand, currentEditMode);
  }
  function handleTouchMove(hand, event) {
    if (!isTouching || !isDragging || dragAction === null)
      return;
    event.preventDefault();
    const touch = event.touches[0];
    const element = document.elementFromPoint(touch.clientX, touch.clientY);
    if (element && element.classList.contains("hand-cell")) {
      const touchedHand = element.getAttribute("data-hand");
      if (touchedHand && touchedHand !== lastTouchedHand) {
        setLastTouchedHand(touchedHand);
        setHandAction(touchedHand, dragAction);
      }
    }
  }
  function handleTouchEnd() {
    setIsTouching(false);
    setIsDragging(false);
    setDragAction(null);
    setLastTouchedHand(null);
  }
  function createRangeGrid() {
    const gridContainer = document.getElementById("range-grid");
    if (!gridContainer)
      return;
    for (let row = 0; row < 13; row++) {
      for (let col = 0; col < 13; col++) {
        const { hand, type } = getHandInfo(row, col);
        const cell = document.createElement("div");
        cell.className = "hand-cell";
        cell.textContent = hand;
        cell.dataset.hand = hand;
        cell.addEventListener("mousedown", (e) => handleMouseDown(hand, e));
        cell.addEventListener("mouseenter", () => handleMouseEnter(hand));
        cell.addEventListener("touchstart", (e) => handleTouchStart(hand, e), { passive: false });
        cell.addEventListener("touchmove", (e) => handleTouchMove(hand, e), { passive: false });
        cell.addEventListener("touchend", () => handleTouchEnd());
        cell.addEventListener("dragstart", (e) => e.preventDefault());
        gridContainer.appendChild(cell);
        handsState.set(hand, { hand, type, action: "fold" });
      }
    }
  }

  // src/presets.ts
  function loadPresetsFromFile() {
    return __async(this, null, function* () {
      try {
        const response = yield fetch("presets.json");
        if (!response.ok) {
          console.error("Failed to load presets.json");
          return;
        }
        setLoadedPresets(yield response.json());
        console.log("Presets loaded successfully:", Object.keys(loadedPresets));
        renderPresetButtons();
      } catch (error) {
        console.error("Error loading presets:", error);
      }
    });
  }
  function renderPresetButtons() {
    const container = document.getElementById("presets-container");
    if (!container)
      return;
    container.innerHTML = "";
    const presetKeys = Object.keys(loadedPresets).sort();
    if (presetKeys.length === 0) {
      container.innerHTML = '<p class="empty-message">No presets available</p>';
      return;
    }
    presetKeys.forEach((presetKey) => {
      const preset = loadedPresets[presetKey];
      const button = document.createElement("button");
      button.className = "preset-button";
      button.dataset.preset = presetKey;
      button.textContent = preset.name || presetKey;
      button.title = preset.description || `Load ${preset.name || presetKey}`;
      container.appendChild(button);
    });
  }
  function loadPreset(presetName) {
    const preset = loadedPresets[presetName];
    if (!preset) {
      console.warn(`Preset "${presetName}" not found`);
      return;
    }
    setCurrentLoadedPresetKey(presetName);
    if (Array.isArray(preset.hands)) {
      loadHandsArray(preset.hands);
    } else if (typeof preset.hands === "object") {
      const firstKey = Object.keys(preset.hands)[0];
      const firstValue = preset.hands[firstKey];
      if (Array.isArray(firstValue)) {
        loadHandsGroupedByAction(preset.hands);
      } else {
        loadHandsWithActions(preset.hands);
      }
    }
  }
  function loadHandsGroupedByAction(groupedHands) {
    resetAll();
    Object.keys(groupedHands).forEach((action) => {
      const hands = groupedHands[action];
      if (Array.isArray(hands)) {
        hands.forEach((hand) => {
          const handState = handsState.get(hand);
          const normalizedAction = action === "mix" ? "mix-rc" : action;
          if (handState && (normalizedAction === "raise" || normalizedAction === "call" || normalizedAction === "mix-rc" || normalizedAction === "mix-rf" || normalizedAction === "fold")) {
            setHandAction(hand, normalizedAction);
          }
        });
      }
    });
  }
  function loadHandsArray(hands) {
    resetAll();
    hands.forEach((hand) => {
      const handState = handsState.get(hand);
      if (handState) {
        setHandAction(hand, "raise");
      }
    });
  }
  function loadHandsWithActions(handsMap) {
    resetAll();
    Object.keys(handsMap).forEach((hand) => {
      const action = handsMap[hand];
      const handState = handsState.get(hand);
      if (handState && action !== "fold") {
        setHandAction(hand, action);
      }
    });
  }

  // src/ui.ts
  function showToast(message, type) {
    const container = document.getElementById("toast-container");
    if (!container)
      return;
    const toast = document.createElement("div");
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    container.appendChild(toast);
    setTimeout(() => {
      toast.classList.add("show");
    }, 10);
    setTimeout(() => {
      toast.classList.remove("show");
      setTimeout(() => {
        container.removeChild(toast);
      }, 300);
    }, 2e3);
  }
  function showConfirm(message) {
    return new Promise((resolve) => {
      const overlay = document.createElement("div");
      overlay.className = "confirm-modal-overlay";
      const modal = document.createElement("div");
      modal.className = "confirm-modal";
      const messageDiv = document.createElement("div");
      messageDiv.className = "confirm-message";
      messageDiv.textContent = message;
      const buttonsDiv = document.createElement("div");
      buttonsDiv.className = "confirm-buttons";
      const confirmBtn = document.createElement("button");
      confirmBtn.className = "confirm-btn confirm-btn-ok";
      confirmBtn.textContent = "OK";
      confirmBtn.addEventListener("click", () => {
        document.body.removeChild(overlay);
        resolve(true);
      });
      const cancelBtn = document.createElement("button");
      cancelBtn.className = "confirm-btn confirm-btn-cancel";
      cancelBtn.textContent = "Cancel";
      cancelBtn.addEventListener("click", () => {
        document.body.removeChild(overlay);
        resolve(false);
      });
      buttonsDiv.appendChild(confirmBtn);
      buttonsDiv.appendChild(cancelBtn);
      modal.appendChild(messageDiv);
      modal.appendChild(buttonsDiv);
      overlay.appendChild(modal);
      document.body.appendChild(overlay);
      setTimeout(() => {
        overlay.classList.add("show");
      }, 10);
      const handleEscape = (e) => {
        if (e.key === "Escape") {
          document.body.removeChild(overlay);
          document.removeEventListener("keydown", handleEscape);
          resolve(false);
        }
      };
      document.addEventListener("keydown", handleEscape);
    });
  }
  function setupMobileNavigation() {
    const mobileNavToggle = document.getElementById("mobile-nav-toggle");
    const navBar = document.getElementById("nav-bar");
    const navBackdrop = document.getElementById("nav-backdrop");
    const hamburgerIcon = mobileNavToggle == null ? void 0 : mobileNavToggle.querySelector(".hamburger-icon");
    const closeIcon = mobileNavToggle == null ? void 0 : mobileNavToggle.querySelector(".close-icon");
    if (!mobileNavToggle || !navBar || !navBackdrop)
      return;
    function openNav() {
      navBar.classList.add("mobile-open");
      navBackdrop.classList.add("show");
      if (hamburgerIcon)
        hamburgerIcon.style.display = "none";
      if (closeIcon)
        closeIcon.style.display = "block";
      document.body.style.overflow = "hidden";
    }
    function closeNav() {
      navBar.classList.remove("mobile-open");
      navBackdrop.classList.remove("show");
      if (hamburgerIcon)
        hamburgerIcon.style.display = "block";
      if (closeIcon)
        closeIcon.style.display = "none";
      document.body.style.overflow = "";
    }
    mobileNavToggle.addEventListener("click", () => {
      if (navBar.classList.contains("mobile-open")) {
        closeNav();
      } else {
        openNav();
      }
    });
    navBackdrop.addEventListener("click", () => {
      closeNav();
    });
    const navButtons = navBar.querySelectorAll(".nav-button, .preset-button, .mode-toggle-btn");
    navButtons.forEach((button) => {
      button.addEventListener("click", () => {
        setTimeout(() => {
          closeNav();
        }, 300);
      });
    });
    window.addEventListener("resize", () => {
      if (window.innerWidth > 768) {
        closeNav();
      }
    });
  }

  // src/storage.ts
  function getSavedRanges() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored)
        return [];
      return JSON.parse(stored);
    } catch (error) {
      console.error("Error reading saved ranges:", error);
      return [];
    }
  }
  function saveSavedRanges(ranges) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(ranges));
    } catch (error) {
      console.error("Error saving ranges:", error);
      showToast("Failed to save range. Storage may be full or disabled.", "error");
    }
  }
  function saveCurrentRange(name) {
    if (!name.trim()) {
      showToast("Please enter a name for your range.", "error");
      return;
    }
    const selected = getCurrentSelection();
    if (Object.keys(selected).length === 0) {
      showToast("Please select at least one hand before saving.", "error");
      return;
    }
    const ranges = getSavedRanges();
    const existingIndex = ranges.findIndex((r) => r.name === name.trim());
    const newRange = {
      name: name.trim(),
      hands: selected,
      timestamp: Date.now()
    };
    if (existingIndex >= 0) {
      showConfirm(`A range named "${name.trim()}" already exists. Overwrite it?`).then((confirmed) => {
        if (confirmed) {
          const currentRanges = getSavedRanges();
          const currentIndex = currentRanges.findIndex((r) => r.name === name.trim());
          if (currentIndex >= 0) {
            currentRanges[currentIndex] = newRange;
          } else {
            currentRanges.push(newRange);
          }
          saveSavedRanges(currentRanges);
          renderSavedRanges();
          const input2 = document.getElementById("range-name-input");
          if (input2) {
            input2.value = "";
          }
          showToast(`Range "${name.trim()}" saved successfully!`, "success");
        }
      });
      return;
    } else {
      ranges.push(newRange);
    }
    saveSavedRanges(ranges);
    renderSavedRanges();
    const input = document.getElementById("range-name-input");
    if (input) {
      input.value = "";
    }
    showToast(`Range "${name.trim()}" saved successfully!`, "success");
  }
  function loadSavedRange(name) {
    const ranges = getSavedRanges();
    const range = ranges.find((r) => r.name === name);
    if (range) {
      if (Array.isArray(range.hands)) {
        loadHandsArray(range.hands);
      } else {
        loadHandsWithActions(range.hands);
      }
    }
  }
  function deleteSavedRange(name) {
    showConfirm(`Are you sure you want to delete "${name}"?`).then((confirmed) => {
      if (confirmed) {
        const ranges = getSavedRanges();
        const filtered = ranges.filter((r) => r.name !== name);
        saveSavedRanges(filtered);
        renderSavedRanges();
        showToast(`Range "${name}" deleted successfully.`, "success");
      }
    });
  }
  function formatRangeForPresets(range) {
    const groupedByAction = {
      raise: [],
      call: [],
      "mix-rc": [],
      "mix-rf": []
    };
    if (Array.isArray(range.hands)) {
      groupedByAction.raise = range.hands;
    } else {
      Object.keys(range.hands).forEach((hand) => {
        const action = range.hands[hand];
        if (action !== "fold" && groupedByAction[action]) {
          groupedByAction[action].push(hand);
        }
      });
    }
    const preset = {
      name: range.name,
      description: `Custom range: ${range.name}`,
      hands: groupedByAction
    };
    const key = range.name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
    const presetWithKey = {
      [key]: preset
    };
    return JSON.stringify(presetWithKey, null, 2);
  }
  function copyRangeToClipboard(name) {
    return __async(this, null, function* () {
      const ranges = getSavedRanges();
      const range = ranges.find((r) => r.name === name);
      if (!range) {
        showToast(`Range "${name}" not found.`, "error");
        return;
      }
      try {
        const jsonString = formatRangeForPresets(range);
        yield navigator.clipboard.writeText(jsonString);
        showToast(`Range "${name}" copied to clipboard! You can now paste it into presets.json`, "success");
      } catch (error) {
        console.error("Failed to copy to clipboard:", error);
        const textArea = document.createElement("textarea");
        textArea.value = formatRangeForPresets(range);
        textArea.style.position = "fixed";
        textArea.style.opacity = "0";
        document.body.appendChild(textArea);
        textArea.select();
        try {
          document.execCommand("copy");
          showToast(`Range "${name}" copied to clipboard! You can now paste it into presets.json`, "success");
        } catch (fallbackError) {
          showToast("Failed to copy to clipboard. Please check your browser permissions.", "error");
        }
        document.body.removeChild(textArea);
      }
    });
  }
  function renderSavedRanges() {
    const container = document.getElementById("saved-ranges-list");
    if (!container)
      return;
    const ranges = getSavedRanges();
    if (ranges.length === 0) {
      container.innerHTML = '<p class="empty-message">No saved ranges yet</p>';
      return;
    }
    ranges.sort((a, b) => b.timestamp - a.timestamp);
    container.innerHTML = "";
    ranges.forEach((range) => {
      const item = document.createElement("div");
      item.className = "saved-range-item";
      const nameSpan = document.createElement("span");
      nameSpan.className = "saved-range-name";
      nameSpan.textContent = range.name;
      const handCount = Array.isArray(range.hands) ? range.hands.length : Object.keys(range.hands).length;
      nameSpan.title = `${handCount} hands - Click to load`;
      nameSpan.addEventListener("click", () => loadSavedRange(range.name));
      const buttonContainer = document.createElement("div");
      buttonContainer.className = "range-action-buttons";
      const copyBtn = document.createElement("button");
      copyBtn.className = "copy-range-btn";
      copyBtn.innerHTML = "\u{1F4CB}";
      copyBtn.title = "Copy to clipboard (presets.json format)";
      copyBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        copyRangeToClipboard(range.name);
      });
      const deleteBtn = document.createElement("button");
      deleteBtn.className = "delete-range-btn";
      deleteBtn.innerHTML = "\xD7";
      deleteBtn.title = "Delete range";
      deleteBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        deleteSavedRange(range.name);
      });
      buttonContainer.appendChild(copyBtn);
      buttonContainer.appendChild(deleteBtn);
      item.appendChild(nameSpan);
      item.appendChild(buttonContainer);
      container.appendChild(item);
    });
  }

  // src/training.ts
  function switchMode(mode) {
    setCurrentMode(mode);
    const navBar = document.querySelector(".nav-bar");
    const editElements = document.querySelectorAll(".edit-only");
    const trainElements = document.querySelectorAll(".train-only");
    const modeToggle = document.getElementById("mode-toggle");
    if (mode === "train") {
      if (navBar)
        navBar.style.display = "block";
      const navSections = navBar.querySelectorAll(".nav-section");
      navSections.forEach((section, index) => {
        if (index > 0) {
          section.style.display = "none";
        }
      });
      editElements.forEach((el) => el.style.display = "none");
      trainElements.forEach((el) => el.style.display = "block");
      setTrainingRange(getCurrentSelection());
      if (currentLoadedPresetKey && loadedPresets[currentLoadedPresetKey]) {
        const preset = loadedPresets[currentLoadedPresetKey];
        setTrainingRangeName(preset.name);
        setTrainingRangeDescription(preset.description);
      } else {
        setTrainingRangeName("Custom Range");
        setTrainingRangeDescription("User-created range");
      }
      const rangeInfoDiv = document.getElementById("train-range-info");
      if (rangeInfoDiv) {
        rangeInfoDiv.innerHTML = `
                <h2>${trainingRangeName}</h2>
                <p class="range-description">${trainingRangeDescription}</p>
            `;
      }
      const spotDrillRangeInfoDiv = document.getElementById("spot-drill-range-info");
      if (spotDrillRangeInfoDiv) {
        spotDrillRangeInfoDiv.innerHTML = `
                <h2>${trainingRangeName}</h2>
                <p class="range-description">${trainingRangeDescription}</p>
            `;
      }
      resetAll();
      setEditMode(currentEditMode);
      updateTrainingModeDisplay();
      if (modeToggle)
        modeToggle.textContent = "\u2190 Back to Edit Mode";
    } else {
      if (navBar)
        navBar.style.display = "block";
      const navSections = navBar.querySelectorAll(".nav-section");
      navSections.forEach((section) => {
        section.style.display = "block";
      });
      editElements.forEach((el) => el.style.display = "block");
      trainElements.forEach((el) => el.style.display = "none");
      const rangeGrid = document.getElementById("range-grid");
      if (rangeGrid) {
        rangeGrid.style.display = "grid";
      }
      if (trainingRange) {
        loadHandsWithActions(trainingRange);
      }
      setTrainingRange(null);
      setTrainingRangeName("");
      setTrainingRangeDescription("");
      setSpotDrillState(null);
      setEditMode(currentEditMode);
      if (modeToggle)
        modeToggle.textContent = "Switch to Train Mode \u2192";
    }
  }
  function switchTrainingMode(mode) {
    setCurrentTrainingMode(mode);
    updateTrainingModeDisplay();
    if (mode === "spot-drill") {
      startSpotDrill();
    } else {
      stopSpotDrill();
    }
  }
  function updateTrainingModeDisplay() {
    const rangeRecallMode = document.querySelector(".range-recall-mode");
    const spotDrillMode = document.querySelector(".spot-drill-mode");
    const rangeGrid = document.getElementById("range-grid");
    const trainControls = document.querySelector(".train-controls");
    const trainResult = document.getElementById("train-result");
    const spotDrillResult = document.getElementById("spot-drill-result");
    const rangeRecallBtn = document.getElementById("range-recall-btn");
    const spotDrillBtn = document.getElementById("spot-drill-btn");
    if (currentTrainingMode === "spot-drill") {
      if (rangeRecallMode)
        rangeRecallMode.style.display = "none";
      if (spotDrillMode)
        spotDrillMode.style.display = "block";
      if (rangeGrid)
        rangeGrid.style.display = "none";
      if (trainControls)
        trainControls.style.display = "none";
      if (trainResult)
        trainResult.style.display = "none";
      if (rangeRecallBtn)
        rangeRecallBtn.classList.remove("active");
      if (spotDrillBtn)
        spotDrillBtn.classList.add("active");
    } else {
      if (rangeRecallMode)
        rangeRecallMode.style.display = "block";
      if (spotDrillMode)
        spotDrillMode.style.display = "none";
      if (rangeGrid)
        rangeGrid.style.display = "grid";
      if (trainControls)
        trainControls.style.display = "flex";
      if (spotDrillResult)
        spotDrillResult.style.display = "none";
      if (rangeRecallBtn)
        rangeRecallBtn.classList.add("active");
      if (spotDrillBtn)
        spotDrillBtn.classList.remove("active");
    }
  }
  function generateHandsQueue(count, excludeHands) {
    if (!trainingRange)
      return [];
    let hands = Object.keys(trainingRange);
    if (excludeHands && excludeHands.length > 0) {
      const excludeSet = new Set(excludeHands);
      hands = hands.filter((hand) => !excludeSet.has(hand));
    }
    if (hands.length === 0) {
      hands = Object.keys(trainingRange);
    }
    const shuffled = [...hands].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, Math.min(count, shuffled.length));
  }
  function startSpotDrill() {
    if (!trainingRange)
      return;
    const initialHands = generateHandsQueue(INITIAL_HANDS_COUNT);
    setSpotDrillState({
      handsQueue: initialHands,
      currentHandIndex: 0,
      correctAnswers: 0,
      totalAttempts: 0,
      results: []
    });
    displayNextHand();
    updateSpotDrillProgress();
    const resultDiv = document.getElementById("spot-drill-result");
    if (resultDiv)
      resultDiv.style.display = "none";
  }
  function stopSpotDrill() {
    setSpotDrillState(null);
  }
  function parseHand(hand) {
    const cleanHand = hand.replace(/[so]$/, "");
    const suited = hand.endsWith("s");
    if (cleanHand.length === 2) {
      return {
        rank1: cleanHand[0],
        rank2: cleanHand[1],
        suited
      };
    }
    return { rank1: "?", rank2: "?", suited: false };
  }
  function getCardColor(rank, index, suited) {
    const rankColors = {
      "A": "#dc3545",
      // Red
      "K": "#000000",
      // Black
      "Q": "#007bff",
      // Blue
      "J": "#28a745",
      // Green
      "T": "#dc3545",
      // Red
      "9": "#28a745",
      // Green
      "8": "#007bff",
      // Blue
      "7": "#000000",
      // Black
      "6": "#dc3545",
      // Red
      "5": "#28a745",
      // Green
      "4": "#007bff",
      // Blue
      "3": "#000000",
      // Black
      "2": "#dc3545"
      // Red
    };
    if (rankColors[rank]) {
      return rankColors[rank];
    }
    if (index === 0) {
      return "#dc3545";
    } else {
      if (suited) {
        return "#28a745";
      } else {
        return "#007bff";
      }
    }
  }
  function createCardElement(rank, color) {
    const card = document.createElement("div");
    card.className = "card-square";
    card.textContent = rank;
    card.style.backgroundColor = color;
    return card;
  }
  function displayNextHand() {
    if (!spotDrillState || spotDrillState.currentHandIndex >= spotDrillState.handsQueue.length) {
      showSpotDrillResults();
      return;
    }
    const currentHand = spotDrillState.handsQueue[spotDrillState.currentHandIndex];
    const { rank1, rank2, suited } = parseHand(currentHand);
    const handDisplay = document.getElementById("current-hand-display");
    if (handDisplay) {
      handDisplay.innerHTML = "";
      const card1 = createCardElement(rank1, getCardColor(rank1, 0, suited));
      const card2 = createCardElement(rank2, getCardColor(rank2, 1, suited));
      handDisplay.appendChild(card1);
      handDisplay.appendChild(card2);
    }
  }
  function handleSpotDrillAction(action) {
    if (!spotDrillState || !trainingRange)
      return;
    const currentHand = spotDrillState.handsQueue[spotDrillState.currentHandIndex];
    const correctAction = trainingRange[currentHand];
    const isCorrect = action === correctAction;
    spotDrillState.results.push({
      hand: currentHand,
      correctAction,
      userAction: action,
      correct: isCorrect
    });
    if (isCorrect) {
      spotDrillState.correctAnswers++;
      showToast("\u2713 Correct!", "success");
    } else {
      showToast(`\u2717 Wrong! Correct action: ${correctAction.charAt(0).toUpperCase() + correctAction.slice(1)}`, "error");
    }
    spotDrillState.totalAttempts++;
    spotDrillState.currentHandIndex++;
    updateSpotDrillProgress();
    setTimeout(() => {
      displayNextHand();
    }, 1e3);
  }
  function updateSpotDrillProgress() {
    if (!spotDrillState)
      return;
    const progressText = document.getElementById("spot-drill-progress-text");
    if (progressText) {
      const completed = spotDrillState.currentHandIndex;
      const total = spotDrillState.handsQueue.length;
      progressText.textContent = `${completed} / ${total}`;
    }
  }
  function showSpotDrillResults() {
    var _a, _b;
    if (!spotDrillState)
      return;
    const resultDiv = document.getElementById("spot-drill-result");
    if (!resultDiv)
      return;
    const accuracy = spotDrillState.totalAttempts > 0 ? (spotDrillState.correctAnswers / spotDrillState.totalAttempts * 100).toFixed(1) : "0.0";
    const resultsHtml = `
        <h3>Spot Drill Results</h3>
        <p class="accuracy">Accuracy: ${accuracy}%</p>
        <p>\u2713 Correct: ${spotDrillState.correctAnswers} / ${spotDrillState.totalAttempts}</p>
        <div class="spot-drill-results-actions">
            <button id="continue-drill-btn" class="train-button submit-button">Continue Drilling</button>
            <button id="restart-drill-btn" class="train-button reset-button">Restart</button>
        </div>
    `;
    resultDiv.innerHTML = resultsHtml;
    resultDiv.style.display = "block";
    const continueBtn = document.getElementById("continue-drill-btn");
    const restartBtn = document.getElementById("restart-drill-btn");
    if (continueBtn) {
      const newContinueBtn = continueBtn.cloneNode(true);
      (_a = continueBtn.parentNode) == null ? void 0 : _a.replaceChild(newContinueBtn, continueBtn);
      newContinueBtn.addEventListener("click", () => {
        if (spotDrillState) {
          const shownHands = spotDrillState.results.map((r) => r.hand);
          const additionalHands = generateHandsQueue(INITIAL_HANDS_COUNT, shownHands);
          if (additionalHands.length > 0) {
            spotDrillState.handsQueue = [...spotDrillState.handsQueue, ...additionalHands];
            resultDiv.style.display = "none";
            displayNextHand();
          } else {
            showSpotDrillResults();
          }
        }
      });
    }
    if (restartBtn) {
      const newRestartBtn = restartBtn.cloneNode(true);
      (_b = restartBtn.parentNode) == null ? void 0 : _b.replaceChild(newRestartBtn, restartBtn);
      newRestartBtn.addEventListener("click", () => {
        startSpotDrill();
      });
    }
  }
  function submitTraining() {
    if (!trainingRange)
      return;
    const userAttempt = getCurrentSelection();
    let correct = 0;
    let incorrect = 0;
    let missed = 0;
    const totalHands = Object.keys(trainingRange).length;
    handsState.forEach((handState) => {
      const cell = document.querySelector(`[data-hand="${handState.hand}"]`);
      if (cell) {
        cell.classList.remove("train-correct", "train-incorrect", "train-missed");
      }
    });
    Object.keys(trainingRange).forEach((hand) => {
      const correctAction = trainingRange[hand];
      const userAction = userAttempt[hand];
      const cell = document.querySelector(`[data-hand="${hand}"]`);
      if (userAction === correctAction) {
        correct++;
        if (cell)
          cell.classList.add("train-correct");
      } else if (userAction && userAction !== correctAction) {
        incorrect++;
        if (cell)
          cell.classList.add("train-incorrect");
      } else {
        missed++;
        if (cell)
          cell.classList.add("train-missed");
      }
    });
    Object.keys(userAttempt).forEach((hand) => {
      if (!trainingRange[hand]) {
        incorrect++;
        const cell = document.querySelector(`[data-hand="${hand}"]`);
        if (cell)
          cell.classList.add("train-incorrect");
      }
    });
    const accuracy = totalHands > 0 ? (correct / totalHands * 100).toFixed(1) : "0.0";
    const resultDiv = document.getElementById("train-result");
    if (resultDiv) {
      resultDiv.innerHTML = `
            <h3>Results</h3>
            <p class="accuracy">Accuracy: ${accuracy}%</p>
            <p>\u2713 Correct: ${correct} / ${totalHands}</p>
            <p>\u2717 Incorrect: ${incorrect}</p>
            <p>\u2297 Missed: ${missed}</p>
            <p class="result-legend">Green border = Correct | Red border = Incorrect | Yellow border = Missed</p>
        `;
      resultDiv.style.display = "block";
      resultDiv.classList.remove("pulse-animation");
      void resultDiv.offsetWidth;
      resultDiv.classList.add("pulse-animation");
    }
  }
  function resetTraining() {
    resetAll();
    const resultDiv = document.getElementById("train-result");
    if (resultDiv) {
      resultDiv.style.display = "none";
    }
    handsState.forEach((handState) => {
      const cell = document.querySelector(`[data-hand="${handState.hand}"]`);
      if (cell) {
        cell.classList.remove("train-correct", "train-incorrect", "train-missed");
      }
    });
  }

  // src/app.ts
  function setupNavigation() {
    const editModeButtons = document.querySelectorAll(".edit-mode-btn");
    editModeButtons.forEach((button) => {
      button.addEventListener("click", (e) => {
        const target = e.target;
        const action = target.dataset.action;
        if (action) {
          setEditMode(action);
        }
      });
    });
    setEditMode("raise");
    const resetBtn = document.getElementById("reset-btn");
    if (resetBtn) {
      resetBtn.addEventListener("click", resetAll);
    }
    const selectAllBtn = document.getElementById("select-all-btn");
    if (selectAllBtn) {
      selectAllBtn.addEventListener("click", selectAll);
    }
    const saveRangeBtn = document.getElementById("save-range-btn");
    const rangeNameInput = document.getElementById("range-name-input");
    if (saveRangeBtn && rangeNameInput) {
      saveRangeBtn.addEventListener("click", () => {
        saveCurrentRange(rangeNameInput.value);
      });
      rangeNameInput.addEventListener("keypress", (e) => {
        if (e.key === "Enter") {
          saveCurrentRange(rangeNameInput.value);
        }
      });
    }
    const presetsContainer = document.getElementById("presets-container");
    if (presetsContainer) {
      presetsContainer.addEventListener("click", (e) => {
        const target = e.target;
        if (target.classList.contains("preset-button")) {
          const presetName = target.dataset.preset;
          if (presetName) {
            loadPreset(presetName);
          }
        }
      });
    }
    renderSavedRanges();
    const modeToggle = document.getElementById("mode-toggle");
    if (modeToggle) {
      modeToggle.addEventListener("click", () => {
        if (currentMode === "edit") {
          if (Object.keys(getCurrentSelection()).length === 0) {
            showToast("Please select or load a range first before entering train mode.", "error");
            return;
          }
          switchMode("train");
        } else {
          switchMode("edit");
        }
      });
    }
    const resetTrainBtn = document.getElementById("reset-train-btn");
    if (resetTrainBtn) {
      resetTrainBtn.addEventListener("click", resetTraining);
    }
    const submitTrainBtn = document.getElementById("submit-train-btn");
    if (submitTrainBtn) {
      submitTrainBtn.addEventListener("click", submitTraining);
    }
    const rangeRecallBtn = document.getElementById("range-recall-btn");
    if (rangeRecallBtn) {
      rangeRecallBtn.addEventListener("click", () => {
        switchTrainingMode("range-recall");
      });
    }
    const spotDrillBtn = document.getElementById("spot-drill-btn");
    if (spotDrillBtn) {
      spotDrillBtn.addEventListener("click", () => {
        switchTrainingMode("spot-drill");
      });
    }
    const spotActionButtons = document.querySelectorAll(".spot-action-btn");
    spotActionButtons.forEach((button) => {
      button.addEventListener("click", (e) => {
        const target = e.target;
        const action = target.dataset.action;
        if (action) {
          handleSpotDrillAction(action);
        }
      });
    });
  }
  function init() {
    return __async(this, null, function* () {
      yield loadPresetsFromFile();
      createRangeGrid();
      setupNavigation();
      setupMobileNavigation();
      updateStats();
      document.addEventListener("mouseup", () => {
        setIsDragging(false);
        setDragAction(null);
      });
      document.addEventListener("touchend", () => {
        handleTouchEnd();
      });
      document.addEventListener("touchcancel", () => {
        handleTouchEnd();
      });
      document.addEventListener("selectstart", (e) => {
        if (isDragging) {
          e.preventDefault();
        }
      });
    });
  }
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
