// sidepanel.js - Multi-Country Enabled Engine

document.addEventListener("DOMContentLoaded", () => {
  function createEmptyProfile() {
    return {
      formReturnUrl: "",
      phoneSiteUrl: "",
      formSelectors: {
        emailInput: "",
        next1: "",
        passwordInput: "",
        textInput1: "",
        textInput2: "",
        postalCode: "",
        checkbox: "",
        checkbox2: "",
        submitNext2: ""
      },
      phoneSelectors: {
        addMyPhone: "",
        countryFlag: "",
        otherOption: "",
        phoneNumber: "",
        addSend: "",
        cancelLimit: "",
        cancelSuccess: ""
      },
      stepDelays: {
        emailInput: 0,
        next1: 0,
        passwordInput: 0,
        textInput1: 0,
        textInput2: 0,
        postalCode: 0,
        checkbox: 0,
        checkbox2: 0,
        submitNext2: 0,
        addMyPhone: 0,
        countryFlag: 0,
        otherOption: 0,
        phoneNumber: 0,
        addSend: 0,
        cancelLimit: 0,
        cancelSuccess: 0
      }
    };
  }

  const state = {
    activeCountry: "ph",
    profiles: {
      ph: createEmptyProfile(),
      uk: createEmptyProfile(),
      be: createEmptyProfile(),
      se: createEmptyProfile(),
      fi: createEmptyProfile(),
      sg: createEmptyProfile(),
      cz: createEmptyProfile(),
      ca: createEmptyProfile(),
      de: createEmptyProfile(),
      fr: createEmptyProfile(),
      pl: createEmptyProfile(),
      es: createEmptyProfile(),
      at: createEmptyProfile(),
      au: createEmptyProfile(),
      dk: createEmptyProfile(),
      nl: createEmptyProfile(),
      mx: createEmptyProfile(),
      ch: createEmptyProfile(),
      ae: createEmptyProfile(),
      no: createEmptyProfile(),
      za: createEmptyProfile(),
      ie: createEmptyProfile()
    },
    get formSelectors() { return this.profiles[this.activeCountry].formSelectors; },
    get phoneSelectors() { return this.profiles[this.activeCountry].phoneSelectors; },
    get stepDelays() { return this.profiles[this.activeCountry].stepDelays; },
    get formReturnUrl() { return this.profiles[this.activeCountry].formReturnUrl; },
    set formReturnUrl(val) { this.profiles[this.activeCountry].formReturnUrl = val; },
    get phoneSiteUrl() { return this.profiles[this.activeCountry].phoneSiteUrl; },
    set phoneSiteUrl(val) { this.profiles[this.activeCountry].phoneSiteUrl = val; },
    phoneNumbers: [],
    autoShuffle: false,
    urlLocked: false,
    batchSize: 10,
    maxLoops: 0,
    currentLoopCount: 0,
    currentPhoneIndex: 0,
    currentRound: null,
    isRunning: false,
    skipCurrentCountry: false,
    limitNumbers: [],
    successNumbers: [],
    multiCountryMode: false,
    countryQueue: [],
    selectedQueueSequence: []
  };

  const elements = {
    countryPreset: document.getElementById("countryPreset"),
    btnMultiCountryMode: document.getElementById("btnMultiCountryMode"),
    multiCountryContainer: document.getElementById("multiCountryContainer"),
    queueCountryList: document.getElementById("queueCountryList"),
    rowPostalCode: document.getElementById("row-postalCode"),
    rowCheckbox2: document.getElementById("row-checkbox2"),
    formSelectorCount: document.getElementById("formSelectorCount"),
    phoneSelectorCount: document.getElementById("phoneSelectorCount"),
    formReturnUrl: document.getElementById("formReturnUrl"),
    phoneSiteUrl: document.getElementById("phoneSiteUrl"),
    btnUrlLock: document.getElementById("btnUrlLock"),
    phoneNumbers: document.getElementById("phoneNumbers"),
    phoneCounter: document.getElementById("phoneCounter"),
    btnShuffleNumbers: document.getElementById("btnShuffleNumbers"),
    btnAutoShuffle: document.getElementById("btnAutoShuffle"),
    btnClearNumbers: document.getElementById("btnClearNumbers"),
    batchSize: document.getElementById("batchSize"),
    maxLoops: document.getElementById("maxLoops"),
    btnRun: document.getElementById("btnRun"),
    btnStop: document.getElementById("btnStop"),
    btnSkipCountry: document.getElementById("btnSkipCountry"),
    btnReset: document.getElementById("btnReset"),
    btnExport: document.getElementById("btnExport"),
    btnImport: document.getElementById("btnImport"),
    btnLockdown: document.getElementById("btnLockdown"),
    importFile: document.getElementById("importFile"),
    statusText: document.getElementById("statusText"),
    progressPhone: document.getElementById("progressPhone"),
    progressBatch: document.getElementById("progressBatch"),
    statLimitCount: document.getElementById("statLimitCount"),
    statSuccessCount: document.getElementById("statSuccessCount"),
    btnGetLimitNumbers: document.getElementById("btnGetLimitNumbers"),
    btnGetSuccessNumbers: document.getElementById("btnGetSuccessNumbers"),
    btnClearStats: document.getElementById("btnClearStats")
  };

  init();

  async function init() {
    await loadStateFromStorage();
    bindEvents();
    updateUI();
  }

  function normalizeUrl(url) {
    if (!url) return "";
    let trimmed = url.trim();
    if (!trimmed.startsWith("http://") && !trimmed.startsWith("https://")) {
      return "https://" + trimmed;
    }
    return trimmed;
  }

  async function loadStateFromStorage() {
    const stored = await chrome.storage.local.get([
      "activeCountry",
      "profiles",
      "formSelectors",
      "phoneSelectors",
      "stepDelays",
      "phoneNumbers",
      "autoShuffle",
      "formReturnUrl",
      "phoneSiteUrl",
      "urlLocked",
      "batchSize",
      "maxLoops",
      "currentPhoneIndex",
      "limitNumbers",
      "successNumbers",
      "multiCountryMode",
      "countryQueue",
      "selectedQueueSequence"
    ]);

    const countryCodes = ["ph", "uk", "be", "se", "fi", "sg", "cz", "ca", "de", "fr", "pl", "es", "at", "au", "dk", "nl", "mx", "ch", "ae", "no", "za", "ie"];

    if (stored.activeCountry && countryCodes.includes(stored.activeCountry)) {
      state.activeCountry = stored.activeCountry;
    }

    if (stored.profiles) {
      countryCodes.forEach((c) => {
        if (stored.profiles[c]) {
          state.profiles[c].formReturnUrl = stored.profiles[c].formReturnUrl || "";
          state.profiles[c].phoneSiteUrl = stored.profiles[c].phoneSiteUrl || "";
          state.profiles[c].formSelectors = { ...state.profiles[c].formSelectors, ...stored.profiles[c].formSelectors };
          state.profiles[c].phoneSelectors = { ...state.profiles[c].phoneSelectors, ...stored.profiles[c].phoneSelectors };
          state.profiles[c].stepDelays = { ...state.profiles[c].stepDelays, ...stored.profiles[c].stepDelays };
        }
      });
    } else if (stored.formSelectors) {
      if (stored.formReturnUrl) state.profiles.ph.formReturnUrl = stored.formReturnUrl;
      if (stored.phoneSiteUrl) state.profiles.ph.phoneSiteUrl = stored.phoneSiteUrl;
      state.profiles.ph.formSelectors = { ...state.profiles.ph.formSelectors, ...stored.formSelectors };
      if (stored.phoneSelectors) state.profiles.ph.phoneSelectors = { ...state.profiles.ph.phoneSelectors, ...stored.phoneSelectors };
      if (stored.stepDelays) state.profiles.ph.stepDelays = { ...state.profiles.ph.stepDelays, ...stored.stepDelays };
    }

    if (Array.isArray(stored.phoneNumbers)) state.phoneNumbers = stored.phoneNumbers;
    if (typeof stored.autoShuffle === "boolean") state.autoShuffle = stored.autoShuffle;
    if (typeof stored.urlLocked === "boolean") state.urlLocked = stored.urlLocked;
    if (typeof stored.batchSize === "number") state.batchSize = stored.batchSize;
    if (typeof stored.maxLoops === "number") state.maxLoops = stored.maxLoops;
    if (typeof stored.currentPhoneIndex === "number") state.currentPhoneIndex = stored.currentPhoneIndex;
    if (Array.isArray(stored.limitNumbers)) state.limitNumbers = stored.limitNumbers;
    if (Array.isArray(stored.successNumbers)) state.successNumbers = stored.successNumbers;
    if (typeof stored.multiCountryMode === "boolean") state.multiCountryMode = stored.multiCountryMode;
    if (Array.isArray(stored.countryQueue)) state.countryQueue = stored.countryQueue;
    if (Array.isArray(stored.selectedQueueSequence)) state.selectedQueueSequence = stored.selectedQueueSequence;

    if (!state.selectedQueueSequence) state.selectedQueueSequence = [];

    if (!state.countryQueue || state.countryQueue.length === 0) {
      state.countryQueue = [
        { code: "sg", name: "🇸🇬 Singapore", loops: 0 },
        { code: "de", name: "🇩🇪 Germany", loops: 0 },
        { code: "fi", name: "🇫🇮 Finland", loops: 0 },
        { code: "ca", name: "🇨🇦 Canada", loops: 0 },
        { code: "uk", name: "🇬🇧 United Kingdom", loops: 0 },
        { code: "fr", name: "🇫🇷 France", loops: 0 },
        { code: "es", name: "🇪🇸 Spain", loops: 0 },
        { code: "ph", name: "🇵🇭 Philippines", loops: 0 },
        { code: "be", name: "🇧🇪 Belgium", loops: 0 },
        { code: "se", name: "🇸🇪 Sweden", loops: 0 },
        { code: "cz", name: "🇨🇿 Czech Republic", loops: 0 },
        { code: "pl", name: "🇵🇱 Poland", loops: 0 },
        { code: "at", name: "🇦🇹 Austria", loops: 0 },
        { code: "au", name: "🇦🇺 Australia", loops: 0 },
        { code: "dk", name: "🇩🇰 Denmark", loops: 0 },
        { code: "nl", name: "🇳🇱 Netherlands", loops: 0 },
        { code: "mx", name: "🇲🇽 Mexico", loops: 0 },
        { code: "ch", name: "🇨🇭 Switzerland", loops: 0 },
        { code: "ae", name: "🇦🇪 UAE", loops: 0 },
        { code: "no", name: "🇳🇴 Norway", loops: 0 },
        { code: "za", name: "🇿🇦 South Africa", loops: 0 },
        { code: "ie", name: "🇮🇪 Ireland", loops: 0 }
      ];
    }
  }

  async function saveStateToStorage() {
    await chrome.storage.local.set({
      activeCountry: state.activeCountry,
      profiles: state.profiles,
      phoneNumbers: state.phoneNumbers,
      autoShuffle: state.autoShuffle,
      formReturnUrl: state.formReturnUrl,
      phoneSiteUrl: state.phoneSiteUrl,
      urlLocked: state.urlLocked,
      batchSize: state.batchSize,
      maxLoops: state.maxLoops,
      currentPhoneIndex: state.currentPhoneIndex,
      limitNumbers: state.limitNumbers,
      successNumbers: state.successNumbers,
      multiCountryMode: state.multiCountryMode,
      countryQueue: state.countryQueue,
      selectedQueueSequence: state.selectedQueueSequence
    });
  }

  function bindEvents() {
    elements.countryPreset.addEventListener("change", (e) => {
      state.activeCountry = e.target.value;
      saveStateToStorage();
      updateUI();
      setStatus(`Target profile: ${e.target.value.toUpperCase()}`);
    });

    elements.btnMultiCountryMode.addEventListener("click", () => {
      state.multiCountryMode = !state.multiCountryMode;
      saveStateToStorage();
      updateUI();
      setStatus(`Multi-Country Queue Mode ${state.multiCountryMode ? 'ENABLED' : 'DISABLED'}`);
    });

    if (elements.btnSkipCountry) {
      elements.btnSkipCountry.addEventListener("click", () => {
        if (!state.isRunning) return;
        state.skipCurrentCountry = true;
        setStatus(`⏭️ Skipping current country (${state.activeCountry.toUpperCase()})...`);
      });
    }

    document.querySelectorAll(".selector-input").forEach((input) => {
      input.addEventListener("input", (e) => {
        const key = e.target.getAttribute("data-step-selector");
        const val = e.target.value.trim();
        if (state.formSelectors.hasOwnProperty(key)) {
          state.formSelectors[key] = val;
        } else if (state.phoneSelectors.hasOwnProperty(key)) {
          state.phoneSelectors[key] = val;
        }
        saveStateToStorage();
        updateUI();
      });
    });

    document.querySelectorAll(".delay-input").forEach((input) => {
      input.addEventListener("input", (e) => {
        const stepKey = e.target.getAttribute("data-step-delay");
        const val = parseInt(e.target.value, 10);
        state.stepDelays[stepKey] = isNaN(val) || val < 0 ? 0 : val;
        saveStateToStorage();
      });
    });

    document.querySelectorAll(".btn-pick").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const pickerField = e.target.getAttribute("data-picker");
        startElementPicker(pickerField);
      });
    });

    elements.btnUrlLock.addEventListener("click", () => {
      state.urlLocked = !state.urlLocked;
      saveStateToStorage();
      updateUI();
    });

    elements.btnShuffleNumbers.addEventListener("click", () => {
      shufflePhoneNumbersList();
      setStatus("Phone numbers shuffled manually.");
    });

    elements.btnAutoShuffle.addEventListener("click", () => {
      state.autoShuffle = !state.autoShuffle;
      saveStateToStorage();
      updateUI();
      setStatus(`Auto-Shuffle turned ${state.autoShuffle ? 'ON' : 'OFF'}`);
    });

    elements.btnClearNumbers.addEventListener("click", () => {
      state.phoneNumbers = [];
      elements.phoneNumbers.value = "";
      elements.phoneCounter.textContent = "0 / 300";
      saveStateToStorage();
      updateProgressUI();
      setStatus("Phone numbers cleared.");
    });

    if (elements.batchSize) {
      elements.batchSize.addEventListener("change", () => {
        const val = parseInt(elements.batchSize.value, 10);
        state.batchSize = isNaN(val) || val < 1 ? 10 : val;
        saveStateToStorage();
      });
    }

    elements.maxLoops.addEventListener("change", () => {
      const val = parseInt(elements.maxLoops.value, 10);
      state.maxLoops = isNaN(val) || val < 0 ? 0 : val;
      saveStateToStorage();
    });

    elements.phoneNumbers.addEventListener("input", handlePhoneNumbersInput);
    elements.phoneNumbers.addEventListener("paste", handlePhoneNumbersInput);

    elements.formReturnUrl.addEventListener("input", () => {
      state.formReturnUrl = elements.formReturnUrl.value.trim();
      saveStateToStorage();
    });

    elements.phoneSiteUrl.addEventListener("input", () => {
      state.phoneSiteUrl = elements.phoneSiteUrl.value.trim();
      saveStateToStorage();
    });

    elements.btnRun.addEventListener("click", startWorkflow);
    elements.btnStop.addEventListener("click", stopWorkflow);
    elements.btnReset.addEventListener("click", resetRunData);
    elements.btnExport.addEventListener("click", exportConfiguration);
    elements.btnImport.addEventListener("click", () => elements.importFile.click());
    elements.btnLockdown.addEventListener("click", executeLockdown);
    elements.importFile.addEventListener("change", importConfiguration);
    elements.btnGetLimitNumbers.addEventListener("click", exportLimitNumbers);
    elements.btnGetSuccessNumbers.addEventListener("click", exportSuccessNumbers);
    elements.btnClearStats.addEventListener("click", clearStats);

    chrome.runtime.onMessage.addListener((msg) => {
      if (msg.action === "SELECTOR_PICKED") {
        savePickedSelector(msg.targetField, msg.selector);
      }
    });
  }

  function handlePhoneNumbersInput() {
    setTimeout(() => {
      let rawText = elements.phoneNumbers.value;
      let lines = rawText.split(/\r?\n/).map(l => l.trim()).filter(l => l.length > 0);

      if (lines.length > 300) {
        lines = lines.slice(0, 300);
        elements.phoneNumbers.value = lines.join("\n");
      }

      state.phoneNumbers = lines;
      elements.phoneCounter.textContent = `${lines.length} / 300`;
      saveStateToStorage();
      updateProgressUI();
    }, 10);
  }

  function updateUI() {
    if (elements.countryPreset) {
      elements.countryPreset.value = state.activeCountry;
    }

    const needsPostalCode = !["ph", "sg", "fr", "ae"].includes(state.activeCountry);
    const needsCheckbox2 = state.activeCountry === "ca";

    if (!needsPostalCode) {
      if (elements.rowPostalCode) elements.rowPostalCode.style.display = "none";
    } else {
      if (elements.rowPostalCode) elements.rowPostalCode.style.display = "flex";
    }

    if (!needsCheckbox2) {
      if (elements.rowCheckbox2) elements.rowCheckbox2.style.display = "none";
    } else {
      if (elements.rowCheckbox2) elements.rowCheckbox2.style.display = "flex";
    }

    let requiredKeys = ["emailInput", "next1", "passwordInput", "textInput1", "textInput2"];
    if (needsPostalCode) requiredKeys.push("postalCode");
    requiredKeys.push("checkbox");
    if (needsCheckbox2) requiredKeys.push("checkbox2");
    requiredKeys.push("submitNext2");

    let formCount = 0;
    requiredKeys.forEach((key) => {
      if (state.formSelectors[key]) formCount++;
    });

    Object.keys(state.formSelectors).forEach((key) => {
      const dot = document.getElementById(`dot-${key}`);
      if (state.formSelectors[key]) {
        if (dot) dot.classList.add("picked");
      } else if (dot) {
        dot.classList.remove("picked");
      }
    });
    elements.formSelectorCount.textContent = `Form selectors: ${formCount} / ${requiredKeys.length}`;

    let phoneCount = 0;
    Object.keys(state.phoneSelectors).forEach((key) => {
      const dot = document.getElementById(`dot-${key}`);
      if (state.phoneSelectors[key]) {
        phoneCount++;
        if (dot) dot.classList.add("picked");
      } else if (dot) {
        dot.classList.remove("picked");
      }
    });
    elements.phoneSelectorCount.textContent = `Phone selectors: ${phoneCount} / 7`;

    document.querySelectorAll(".selector-input").forEach((input) => {
      const key = input.getAttribute("data-step-selector");
      if (state.formSelectors.hasOwnProperty(key)) {
        input.value = state.formSelectors[key] || "";
      } else if (state.phoneSelectors.hasOwnProperty(key)) {
        input.value = state.phoneSelectors[key] || "";
      }
    });

    document.querySelectorAll(".delay-input").forEach((input) => {
      const stepKey = input.getAttribute("data-step-delay");
      if (typeof state.stepDelays[stepKey] === "number") {
        input.value = state.stepDelays[stepKey];
      }
    });

    elements.formReturnUrl.value = state.formReturnUrl || "";
    elements.phoneSiteUrl.value = state.phoneSiteUrl || "";
    elements.phoneNumbers.value = state.phoneNumbers.join("\n");
    elements.phoneCounter.textContent = `${state.phoneNumbers.length} / 300`;
    if (elements.batchSize) elements.batchSize.value = state.batchSize || 10;
    elements.maxLoops.value = state.maxLoops || 0;

    if (state.autoShuffle) {
      elements.btnAutoShuffle.innerHTML = "🔀 Auto-Shuffle: ON";
      elements.btnAutoShuffle.style.backgroundColor = "#6366f1";
      elements.btnAutoShuffle.style.color = "#ffffff";
    } else {
      elements.btnAutoShuffle.innerHTML = "🔀 Auto-Shuffle: OFF";
      elements.btnAutoShuffle.style.backgroundColor = "var(--bg-secondary)";
      elements.btnAutoShuffle.style.color = "var(--text-main)";
    }

    if (state.urlLocked) {
      elements.btnUrlLock.innerHTML = "🔒 URL Lock: ON";
      elements.btnUrlLock.style.backgroundColor = "#10b981";
      elements.btnUrlLock.style.color = "#ffffff";
    } else {
      elements.btnUrlLock.innerHTML = "🔓 URL Lock: OFF";
      elements.btnUrlLock.style.backgroundColor = "var(--bg-secondary)";
      elements.btnUrlLock.style.color = "var(--text-main)";
    }

    if (state.multiCountryMode) {
      elements.btnMultiCountryMode.innerHTML = "🌐 Multi-Country Queue Mode: ON";
      elements.btnMultiCountryMode.style.backgroundColor = "#8b5cf6";
      elements.btnMultiCountryMode.style.color = "#ffffff";
      if (elements.multiCountryContainer) elements.multiCountryContainer.style.display = "block";
      renderCountryQueueList();
    } else {
      elements.btnMultiCountryMode.innerHTML = "🌐 Multi-Country Queue Mode: OFF";
      elements.btnMultiCountryMode.style.backgroundColor = "var(--bg-secondary)";
      elements.btnMultiCountryMode.style.color = "var(--text-main)";
      if (elements.multiCountryContainer) elements.multiCountryContainer.style.display = "none";
    }

    updateProgressUI();
  }

  function renderCountryQueueList() {
    if (!elements.queueCountryList) return;
    elements.queueCountryList.innerHTML = "";

    state.countryQueue.forEach((item, index) => {
      const seqIndex = state.selectedQueueSequence.findIndex(s => s.code === item.code);
      const isSelected = seqIndex !== -1;
      const badgeText = isSelected ? `#${seqIndex + 1}` : "";

      const row = document.createElement("div");
      row.style.cssText = `display: flex; align-items: center; justify-content: space-between; background: var(--bg-main); padding: 4px 8px; border-radius: 4px; font-size: 11px; ${isSelected ? 'border-left: 3px solid #6366f1;' : ''}`;

      const savedLoops = isSelected ? state.selectedQueueSequence[seqIndex].loops : (item.loops || 0);

      row.innerHTML = `
        <label style="display: flex; align-items: center; gap: 6px; cursor: pointer; flex: 1;">
          <input type="checkbox" data-country-code="${item.code}" class="chk-queue-country" ${isSelected ? 'checked' : ''}>
          ${isSelected ? `<span style="background: #6366f1; color: #fff; padding: 1px 5px; border-radius: 3px; font-weight: bold; font-size: 10px;">${badgeText}</span>` : ''}
          <span>${item.name}</span>
        </label>
        <div style="display: flex; align-items: center; gap: 4px;">
          <span style="color: var(--text-secondary);" title="0 = 1 Pass, 1 = 2 Passes, etc.">Additional Loops:</span>
          <input type="number" min="0" max="99" data-country-code="${item.code}" class="inp-queue-loops" value="${savedLoops}" style="width: 38px; padding: 2px 4px; font-size: 11px; text-align: center; border: 1px solid var(--border-color); background: var(--bg-secondary); color: var(--text-main); border-radius: 3px;">
        </div>
      `;
      elements.queueCountryList.appendChild(row);
    });

    document.querySelectorAll(".chk-queue-country").forEach(chk => {
      chk.addEventListener("change", (e) => {
        const code = e.target.getAttribute("data-country-code");
        if (e.target.checked) {
          if (!state.selectedQueueSequence.some(s => s.code === code)) {
            const inputEl = document.querySelector(`.inp-queue-loops[data-country-code="${code}"]`);
            const val = inputEl ? parseInt(inputEl.value, 10) : 0;
            state.selectedQueueSequence.push({ code, loops: isNaN(val) ? 0 : val });
          }
        } else {
          state.selectedQueueSequence = state.selectedQueueSequence.filter(s => s.code !== code);
        }
        saveStateToStorage();
        renderCountryQueueList();
      });
    });

    document.querySelectorAll(".inp-queue-loops").forEach(inp => {
      inp.addEventListener("change", (e) => {
        const code = e.target.getAttribute("data-country-code");
        const val = parseInt(e.target.value, 10);
        const loopVal = isNaN(val) || val < 0 ? 0 : val;

        const seqItem = state.selectedQueueSequence.find(s => s.code === code);
        if (seqItem) seqItem.loops = loopVal;

        const qItem = state.countryQueue.find(q => q.code === code);
        if (qItem) qItem.loops = loopVal;

        saveStateToStorage();
      });
    });
  }

  function updateProgressUI() {
    const total = state.phoneNumbers.length;
    const current = state.currentPhoneIndex;
    elements.progressPhone.textContent = `Phone ${current} / ${total}`;
    elements.progressBatch.textContent = `Loop ${state.currentLoopCount}${state.maxLoops > 0 ? ' / ' + state.maxLoops : ''}`;
    if (elements.statLimitCount) elements.statLimitCount.textContent = state.limitNumbers ? state.limitNumbers.length : 0;
    if (elements.statSuccessCount) elements.statSuccessCount.textContent = state.successNumbers ? state.successNumbers.length : 0;
  }

  function setStatus(text, isError = false) {
    elements.statusText.textContent = text;
    elements.statusText.style.color = isError ? "#ef4444" : "#6366f1";
  }

  async function executeLockdown() {
    const confirmed = confirm("Lockdown: Stop workflow, purge cookies + storage for all sites, and reset state?");
    if (!confirmed) return;

    state.isRunning = false;
    setStatus("Executing Lockdown...");

    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    if (state.formReturnUrl) {
      await chrome.runtime.sendMessage({ action: "CLEAR_COOKIES", targetUrl: normalizeUrl(state.formReturnUrl) });
    }
    if (state.phoneSiteUrl) {
      await chrome.runtime.sendMessage({ action: "CLEAR_COOKIES", targetUrl: normalizeUrl(state.phoneSiteUrl) });
    }

    if (tab) {
      await chrome.runtime.sendMessage({ action: "CLEAR_STORAGE", tabId: tab.id });
    }

    state.currentPhoneIndex = 0;
    state.currentLoopCount = 0;
    state.limitNumbers = [];
    state.successNumbers = [];

    await chrome.storage.local.set({
      limitNumbers: [],
      successNumbers: [],
      currentPhoneIndex: 0
    });

    if (elements.statLimitCount) elements.statLimitCount.textContent = "0";
    if (elements.statSuccessCount) elements.statSuccessCount.textContent = "0";

    updateUI();

    if (tab && state.formReturnUrl) {
      const targetUrl = normalizeUrl(state.formReturnUrl);
      await chrome.runtime.sendMessage({ action: "NAVIGATE_TAB", tabId: tab.id, url: targetUrl });
      await chrome.runtime.sendMessage({ action: "CLEAR_STORAGE", tabId: tab.id });
    }

    setStatus("Lockdown Complete! All Data Purged.");
  }

  async function startElementPicker(targetField) {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab) {
      alert("No active browser tab found.");
      return;
    }

    try {
      await chrome.tabs.sendMessage(tab.id, {
        action: "START_PICKING",
        targetField: targetField
      });
      setStatus(`Click element on page for: ${targetField}`);
    } catch (err) {
      await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ["content.js"]
      });
      await chrome.tabs.sendMessage(tab.id, {
        action: "START_PICKING",
        targetField: targetField
      });
      setStatus(`Click element on page for: ${targetField}`);
    }
  }

  function savePickedSelector(targetField, selector) {
    if (state.formSelectors.hasOwnProperty(targetField)) {
      state.formSelectors[targetField] = selector;
    } else if (state.phoneSelectors.hasOwnProperty(targetField)) {
      state.phoneSelectors[targetField] = selector;
    }
    saveStateToStorage();
    updateUI();
    setStatus(`Selector saved for ${targetField}`);
  }

  async function resetRunData() {
    const confirmed = confirm("Are you sure you want to reset run data?");
    if (!confirmed) return;

    state.phoneNumbers = [];
    state.currentPhoneIndex = 0;
    state.currentLoopCount = 0;
    state.limitNumbers = [];
    state.successNumbers = [];
    state.isRunning = false;

    if (!state.urlLocked) {
      state.formReturnUrl = "";
      state.phoneSiteUrl = "";
    }

    await saveStateToStorage();
    updateUI();
    setStatus("Run data reset successfully.");
  }

  function exportConfiguration() {
    const exportData = {
      activeCountry: state.activeCountry,
      profiles: state.profiles,
      phoneNumbers: state.phoneNumbers,
      autoShuffle: state.autoShuffle,
      formReturnUrl: state.formReturnUrl,
      phoneSiteUrl: state.phoneSiteUrl,
      urlLocked: state.urlLocked,
      batchSize: state.batchSize,
      maxLoops: state.maxLoops,
      limitNumbers: state.limitNumbers,
      successNumbers: state.successNumbers
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `workflow-config-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function exportLimitNumbers() {
    if (!state.limitNumbers || state.limitNumbers.length === 0) {
      alert("No confirmed limit numbers recorded yet.");
      return;
    }

    const grouped = {};
    state.limitNumbers.forEach(item => {
      const match = item.match(/^\[(.*?)\]\s*(.*)$/);
      if (match) {
        const country = match[1];
        const num = match[2];
        if (!grouped[country]) grouped[country] = [];
        grouped[country].push(num);
      } else {
        if (!grouped["OTHER"]) grouped["OTHER"] = [];
        grouped["OTHER"].push(item);
      }
    });

    let output = "=== COUNTRY-WISE PHONE LIMIT ERRORS ===\n\n";
    for (const [country, nums] of Object.entries(grouped)) {
      output += `--- ${country} (${nums.length}) ---\n`;
      output += nums.join("\n") + "\n\n";
    }

    const blob = new Blob([output.trim()], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `limit-numbers-countrywise-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function exportSuccessNumbers() {
    if (!state.successNumbers || state.successNumbers.length === 0) {
      alert("No OTP successful numbers recorded yet.");
      return;
    }

    const grouped = {};
    state.successNumbers.forEach(item => {
      const match = item.match(/^\[(.*?)\]\s*(.*)$/);
      if (match) {
        const country = match[1];
        const num = match[2];
        if (!grouped[country]) grouped[country] = [];
        grouped[country].push(num);
      } else {
        if (!grouped["OTHER"]) grouped["OTHER"] = [];
        grouped["OTHER"].push(item);
      }
    });

    let output = "=== COUNTRY-WISE OTP SUCCESSFUL NUMBERS ===\n\n";
    for (const [country, nums] of Object.entries(grouped)) {
      output += `--- ${country} (${nums.length}) ---\n`;
      output += nums.join("\n") + "\n\n";
    }

    const blob = new Blob([output.trim()], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `successful-numbers-countrywise-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }

  async function clearStats() {
    const confirmed = confirm("Are you sure you want to clear Live Statistics?");
    if (!confirmed) return;

    state.limitNumbers = [];
    state.successNumbers = [];

    await chrome.storage.local.set({
      limitNumbers: [],
      successNumbers: []
    });

    if (elements.statLimitCount) elements.statLimitCount.textContent = "0";
    if (elements.statSuccessCount) elements.statSuccessCount.textContent = "0";

    updateProgressUI();
    setStatus("Live statistics cleared.");
  }

  function importConfiguration(e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const json = JSON.parse(evt.target.result);

        if (json.activeCountry && ["ph", "uk", "be", "se", "fi", "sg", "cz", "ca", "de", "fr", "pl", "es", "at"].includes(json.activeCountry)) {
          state.activeCountry = json.activeCountry;
        }
        if (json.profiles) state.profiles = { ...state.profiles, ...json.profiles };
        if (Array.isArray(json.phoneNumbers)) state.phoneNumbers = json.phoneNumbers.slice(0, 300);
        if (typeof json.autoShuffle === "boolean") state.autoShuffle = json.autoShuffle;
        if (json.formReturnUrl) state.formReturnUrl = json.formReturnUrl;
        if (json.phoneSiteUrl) state.phoneSiteUrl = json.phoneSiteUrl;
        if (typeof json.urlLocked === "boolean") state.urlLocked = json.urlLocked;
        if (typeof json.batchSize === "number") state.batchSize = json.batchSize;
        if (typeof json.maxLoops === "number") state.maxLoops = json.maxLoops;

        await saveStateToStorage();
        updateUI();
        setStatus("Configuration imported successfully.");
      } catch (err) {
        alert("Invalid JSON configuration file.");
      }
    };
    reader.readAsText(file);
  }

  async function applyStepDelay(stepKey) {
    const ms = state.stepDelays[stepKey] || 0;
    if (ms > 0 && state.isRunning) {
      setStatus(`Delaying ${ms}ms...`);
      await sleep(ms);
    }
  }

  async function runSingleCountryWorkflow(tabId, targetMaxLoops) {
    const targetReturnUrl = normalizeUrl(state.formReturnUrl);
    let countryLoop = 0;

    while (state.currentPhoneIndex < state.phoneNumbers.length && state.isRunning) {
      if (state.skipCurrentCountry) {
        setStatus(`⏭️ Skipped ${state.activeCountry.toUpperCase()}. Moving to next country...`);
        break;
      }

      // 0 = Infinite / Process All Numbers; > 0 = Max Form Fill Loops
      if (targetMaxLoops > 0 && countryLoop >= targetMaxLoops) {
        setStatus(`Reached set loops limit (${targetMaxLoops}) for ${state.activeCountry.toUpperCase()}`);
        break;
      }

      countryLoop++;
      state.currentLoopCount = countryLoop;
      updateProgressUI();

      // Form Filler Retry Protection: Retries up to 5 times on page loads before giving up
      let formSuccess = false;
      for (let formAttempt = 1; formAttempt <= 5; formAttempt++) {
        if (!state.isRunning || state.skipCurrentCountry) break;
        try {
          await runFormFillerStep(tabId);
          formSuccess = true;
          break;
        } catch (formErr) {
          setStatus(`⚠️ Form fill attempt ${formAttempt}/5 failed (${formErr.message}). Retrying...`);
          const cookieDomain = normalizeUrl(state.phoneSiteUrl || state.formReturnUrl);
          await chrome.runtime.sendMessage({ action: "CLEAR_COOKIES", targetUrl: cookieDomain });
          await chrome.runtime.sendMessage({ action: "CLEAR_COOKIES", targetUrl: targetReturnUrl });
          await chrome.runtime.sendMessage({ action: "CLEAR_STORAGE", tabId: tabId });
          await chrome.runtime.sendMessage({ action: "NAVIGATE_TAB", tabId: tabId, url: targetReturnUrl });
          await sleep(3500);
        }
      }

      if (state.skipCurrentCountry) break;

      if (!formSuccess || !state.isRunning) {
        setStatus(`⚠️ Form Filler failed for ${state.activeCountry.toUpperCase()} after 5 attempts.`);
        break;
      }

      let numbersInBatch = 0;
      const targetBatchLimit = state.batchSize || 10;

      while (numbersInBatch < targetBatchLimit && state.currentPhoneIndex < state.phoneNumbers.length && state.isRunning) {
        if (state.skipCurrentCountry) break;

        const phoneNum = state.phoneNumbers[state.currentPhoneIndex];
        const phoneDisplayIndex = state.currentPhoneIndex + 1;

        setStatus(`[${state.activeCountry.toUpperCase()}] Phone ${phoneDisplayIndex} / ${state.phoneNumbers.length} (Loop ${countryLoop})`);

        let forceResetNeeded = false;
        let resetReason = null;

        try {
          // 1. Add My Phone
          await executeActionInFrames(tabId, state.phoneSelectors.addMyPhone, "CLICK", null, "Add My Phone", 5, ["add my phone", "add phone", "add", "telefonnummer", "hinzufügen"]);
          await applyStepDelay("addMyPhone");
          if (!state.isRunning || state.skipCurrentCountry) break;

          // 2. Country Flag
          await executeActionInFrames(tabId, state.phoneSelectors.countryFlag, "CLICK", null, "Country Flag", 5, ["flag", "country", "dial code", "+1", "+44", "+32", "+63", "selected-flag"]);
          await applyStepDelay("countryFlag");
          if (!state.isRunning || state.skipCurrentCountry) break;

          // 3. Other Option
          await executeActionInFrames(tabId, state.phoneSelectors.otherOption, "CLICK", null, "Other Option", 5, ["other", "more options", "weitere optionen"]);
          await applyStepDelay("otherOption");
          if (!state.isRunning || state.skipCurrentCountry) break;

          // 4. Phone Number
          await executeActionInFrames(tabId, state.phoneSelectors.phoneNumber, "FILL", phoneNum, "Phone Number Input", 5);
          await applyStepDelay("phoneNumber");
          if (!state.isRunning || state.skipCurrentCountry) break;

          // 5. Add / Send
          await executeActionInFrames(tabId, state.phoneSelectors.addSend, "CLICK", null, "Add / Send", 5, ["telefonnummer hinzufügen", "hinzufügen", "send", "add", "submit", "weiter"]);
          await applyStepDelay("addSend");
          if (!state.isRunning || state.skipCurrentCountry) break;

          await sleep(1500);

          // Tag phone number with active country code and current round
          const roundTag = state.currentRound ? ` - Round ${state.currentRound}` : "";
          const taggedPhone = `[${state.activeCountry.toUpperCase()}${roundTag}] ${phoneNum}`;

          // Verification Check for Phone Limit vs Activity Paused
          const isRateLimited = await checkRateLimitInFrames(tabId);
          if (isRateLimited) {
            setStatus(`⚠️ Confirmed phone limit for ${taggedPhone}`);

            if (!state.limitNumbers.includes(taggedPhone)) {
              state.limitNumbers.push(taggedPhone);
              await saveStateToStorage();
              updateProgressUI();
            }

            // Click Cancel Limit Popup if limit happened
            let cancelClicked = false;
            if (state.phoneSelectors.cancelLimit && state.phoneSelectors.cancelLimit.trim() !== "") {
              try {
                await executeActionInFrames(tabId, state.phoneSelectors.cancelLimit, "CLICK", null, "Cancel Limit Popup", 2, ["close", "dismiss", "x", "cancel", "schließen"]);
                cancelClicked = true;
              } catch (cancelErr) {
                setStatus("Cancel Limit Popup skipped or not found");
              }
              await applyStepDelay("cancelLimit");
            }

            // Fallback: If Cancel Limit wasn't set or failed, trigger a session purge to recover
            if (!cancelClicked) {
              setStatus("⚠️ Cancel limit failed or not set. Resetting session as fallback...");
              forceResetNeeded = true;
            }
          } else {
            // Click Cancel Success Popup if OTP succeeded
            if (state.phoneSelectors.cancelSuccess && state.phoneSelectors.cancelSuccess.trim() !== "") {
              try {
                await executeActionInFrames(tabId, state.phoneSelectors.cancelSuccess, "CLICK", null, "Cancel Success Popup", 2, ["close", "dismiss", "x", "ok", "done", "continue"]);
              } catch (cancelErr) {
                setStatus("Cancel Success Popup skipped or not found");
              }
              await applyStepDelay("cancelSuccess");
            }

            // Record OTP success with country + round tag
            if (!state.successNumbers.includes(taggedPhone)) {
              state.successNumbers.push(taggedPhone);
              await saveStateToStorage();
              updateProgressUI();
            }
          }
        } catch (stepError) {
          if (!state.skipCurrentCountry) {
            setStatus(`⚠️ Recoverable error on ${phoneNum}. Retrying same number after session reset...`);
            resetReason = "RECOVERABLE_ERROR";
            forceResetNeeded = true;
          }
        }

        if (state.skipCurrentCountry) break;

        if (forceResetNeeded) {
          await saveStateToStorage();
          updateProgressUI();

          setStatus(`Purging site data and retrying current number (${phoneNum})...`);
          const cookieDomain = normalizeUrl(state.phoneSiteUrl || state.formReturnUrl);
          await chrome.runtime.sendMessage({ action: "CLEAR_COOKIES", targetUrl: cookieDomain });
          if (state.formReturnUrl) {
            await chrome.runtime.sendMessage({ action: "CLEAR_COOKIES", targetUrl: targetReturnUrl });
          }
          await chrome.runtime.sendMessage({ action: "CLEAR_STORAGE", tabId: tabId });

          await chrome.runtime.sendMessage({ action: "NAVIGATE_TAB", tabId: tabId, url: targetReturnUrl });
          await waitForElementInFrames(tabId, state.formSelectors.emailInput, 15000);
          break;
        }

        numbersInBatch++;
        state.currentPhoneIndex++;
        await saveStateToStorage();
        updateProgressUI();
        await sleep(500);
      }

      if (state.skipCurrentCountry) break;

      if (state.currentPhoneIndex < state.phoneNumbers.length && state.isRunning) {
        if (targetMaxLoops > 0 && countryLoop >= targetMaxLoops) {
          setStatus(`Completed set loops (${targetMaxLoops}) for ${state.activeCountry.toUpperCase()}`);
          break;
        }

        setStatus("Clearing cookies & site storage...");
        const cookieDomain = normalizeUrl(state.phoneSiteUrl || state.formReturnUrl);
        await chrome.runtime.sendMessage({ action: "CLEAR_COOKIES", targetUrl: cookieDomain });
        if (state.formReturnUrl) {
          await chrome.runtime.sendMessage({ action: "CLEAR_COOKIES", targetUrl: targetReturnUrl });
        }

        setStatus("Waiting for Form page...");
        await chrome.runtime.sendMessage({ action: "NAVIGATE_TAB", tabId: tabId, url: targetReturnUrl });

        await chrome.runtime.sendMessage({ action: "CLEAR_STORAGE", tabId: tabId });

        setStatus("Starting next loop...");
        await waitForElementInFrames(tabId, state.formSelectors.emailInput, 15000);
      }
    }
  }

  async function startWorkflow() {
    if (state.phoneNumbers.length === 0) {
      setStatus("Error: No phone numbers entered.", true);
      return;
    }

    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab) {
      setStatus("Error: Active tab required.", true);
      return;
    }

    if (state.autoShuffle) {
      shufflePhoneNumbersList();
    }

    state.isRunning = true;

    // Multi-Country Round-Based Interleaved Execution Mode
    if (state.multiCountryMode) {
      const selectedSeq = state.selectedQueueSequence || [];
      if (selectedSeq.length === 0) {
        setStatus("Error: Multi-Country Mode ON but no countries selected in queue!", true);
        state.isRunning = false;
        return;
      }

      // Max passes across all selected countries (0 loop = 1 pass)
      const maxRoundsNeeded = Math.max(...selectedSeq.map(item => (item.loops || 0) + 1));
      setStatus(`Starting Multi-Country Queue (${selectedSeq.length} countries, Max ${maxRoundsNeeded} Rounds)...`);

      for (let round = 1; round <= maxRoundsNeeded; round++) {
        if (!state.isRunning) break;

        setStatus(`🔄 --- STARTING QUEUE ROUND ${round} / ${maxRoundsNeeded} ---`);
        await sleep(1500);

        for (let i = 0; i < selectedSeq.length; i++) {
          if (!state.isRunning) break;

          const qItem = selectedSeq[i];
          const totalPassesForCountry = (qItem.loops || 0) + 1;

          // Skip if this country has already finished its total passes
          if (round > totalPassesForCountry) {
            continue;
          }

          const countryObj = state.countryQueue.find(c => c.code === qItem.code) || { name: qItem.code.toUpperCase() };

          state.activeCountry = qItem.code;
          state.currentRound = round;
          state.currentPhoneIndex = 0; // Always process ALL numbers from start
          state.skipCurrentCountry = false; // Reset skip flag for new country run
          await saveStateToStorage();
          updateUI();
          updateProgressUI();

          const countryNameDisplay = countryObj.name || qItem.code.toUpperCase();

          if (!state.formReturnUrl || state.formReturnUrl.trim() === "") {
            setStatus(`⚠️ Skipping ${countryNameDisplay}: Missing Form Return URL`, true);
            await sleep(2000);
            continue;
          }

          // Validate selectors
          const needsPostalCode = !["ph", "sg", "fr"].includes(state.activeCountry);
          const needsCheckbox2 = state.activeCountry === "ca";
          let requiredKeys = ["emailInput", "next1", "passwordInput", "textInput1", "textInput2"];
          if (needsPostalCode) requiredKeys.push("postalCode");
          requiredKeys.push("checkbox");
          if (needsCheckbox2) requiredKeys.push("checkbox2");
          requiredKeys.push("submitNext2");

          const missingForm = requiredKeys.filter(k => !state.formSelectors[k]);
          if (missingForm.length > 0) {
            setStatus(`⚠️ Skipping ${countryNameDisplay}: Missing ${missingForm.length} form selectors!`, true);
            await sleep(2000);
            continue;
          }

          const targetReturnUrl = normalizeUrl(state.formReturnUrl);
          const cookieDomain = normalizeUrl(state.phoneSiteUrl || state.formReturnUrl);

          setStatus(`🌐 ACTIVE RUN: ${countryNameDisplay} (Round ${round}/${totalPassesForCountry})`);

          // Purge site data before starting country pass
          await chrome.runtime.sendMessage({ action: "CLEAR_COOKIES", targetUrl: cookieDomain });
          if (targetReturnUrl) {
            await chrome.runtime.sendMessage({ action: "CLEAR_COOKIES", targetUrl: targetReturnUrl });
          }
          await chrome.runtime.sendMessage({ action: "CLEAR_STORAGE", tabId: tab.id });

          // Navigate tab to target country return URL
          await chrome.runtime.sendMessage({ action: "NAVIGATE_TAB", tabId: tab.id, url: targetReturnUrl });
          await sleep(3500);

          try {
            // targetMaxLoops = 0 forces full list completion for this pass
            await runSingleCountryWorkflow(tab.id, 0);
          } catch (countryErr) {
            console.error(`Error executing ${countryNameDisplay}:`, countryErr);
            setStatus(`⚠️ Error on ${countryNameDisplay}: ${countryErr.message}. Moving to next...`, true);
          }

          if (!state.isRunning) break;

          // Purge site data after finishing active country pass
          setStatus(`Purging site data after completing ${countryNameDisplay} (Round ${round})...`);
          await chrome.runtime.sendMessage({ action: "CLEAR_COOKIES", targetUrl: cookieDomain });
          if (targetReturnUrl) {
            await chrome.runtime.sendMessage({ action: "CLEAR_COOKIES", targetUrl: targetReturnUrl });
          }
          await chrome.runtime.sendMessage({ action: "CLEAR_STORAGE", tabId: tab.id });
          await sleep(2000);
        }
      }

      state.isRunning = false;
      setStatus("Multi-Country Queue Workflow Completed!");
      return;
    }

    // Single Country Execution Mode
    if (!state.formReturnUrl) {
      setStatus("Error: Form Return URL is required.", true);
      state.isRunning = false;
      return;
    }

    state.currentRound = null;
    state.skipCurrentCountry = false;
    setStatus(`Starting Automation (${state.activeCountry.toUpperCase()})...`);
    try {
      await runSingleCountryWorkflow(tab.id, state.maxLoops);
      state.isRunning = false;
      setStatus("Completed Workflow!");
    } catch (err) {
      console.error("Workflow Execution Error:", err);
      setStatus(`Error: ${err.message}`, true);
      state.isRunning = false;
    }
  }

  function stopWorkflow() {
    state.isRunning = false;
    state.skipCurrentCountry = false;
    setStatus("Stopping...");
  }

  async function checkActivityPausedInFrames(tabId) {
    try {
      const results = await chrome.scripting.executeScript({
        target: { tabId: tabId, allFrames: true },
        func: () => {
          const bodyText = (document.body ? document.body.innerText : "").toLowerCase();
          const pageTitle = (document.title || "").toLowerCase();
          const headings = Array.from(document.querySelectorAll("h1, h2, h3, .title, #challenge-running"))
            .map(el => el.innerText.toLowerCase())
            .join(" ");
          
          const fullDOMContent = bodyText + " " + pageTitle + " " + headings;

          const activityPausedKeywords = [
            // General & English
            "browsing activity has been paused", "unusual behavior", "unusual activity", 
            "pardon our interruption", "are you a human", "activity has been paused",
            // French
            "activité de navigation a été suspendue", "activité inhabituelle",
            // German
            "browser-aktivität wurde pausiert", "browseraktivität wurde pausiert", "ungewöhnliche aktivität",
            // Spanish
            "actividad de navegación se ha pausado", "actividad no habitual",
            // Polish
            "aktywność przeglądania została wstrzymana", "niezwykła aktywność",
            // Dutch
            "browse-activiteit is gepauzeerd", "ongewone aktiviteit",
            // Swedish
            "webbläsningsaktivitet har pausats",
            // Finnish
            "selaustoiminta on keskeytetty",
            // Czech
            "aktivita prohlížení byla pozastavena"
          ];
          return activityPausedKeywords.some(kw => fullDOMContent.includes(kw));
        }
      });
      return results && results.some(r => r.result === true);
    } catch (e) {
      return false;
    }
  }

  async function ensureCleanSignupPageLoad(tabId) {
    const targetReturnUrl = normalizeUrl(state.formReturnUrl);
    const cookieDomain = normalizeUrl(state.phoneSiteUrl || state.formReturnUrl);
    let attempt = 0;

    while (state.isRunning && !state.skipCurrentCountry) {
      const isPaused = await checkActivityPausedInFrames(tabId);

      if (isPaused) {
        attempt++;
        setStatus(`⚠️ "Activity Paused" error active! Clearing data & reloading (Attempt ${attempt})...`);
        
        await chrome.runtime.sendMessage({ action: "CLEAR_COOKIES", targetUrl: cookieDomain });
        if (state.formReturnUrl) {
          await chrome.runtime.sendMessage({ action: "CLEAR_COOKIES", targetUrl: targetReturnUrl });
        }
        await chrome.runtime.sendMessage({ action: "CLEAR_STORAGE", tabId: tabId });
        await chrome.runtime.sendMessage({ action: "NAVIGATE_TAB", tabId: tabId, url: targetReturnUrl });
        await sleep(3000);
        continue;
      }

      // Verify if actual email form element exists on screen
      const emailLoaded = await waitForElementInFrames(tabId, state.formSelectors.emailInput, 4000);
      if (emailLoaded === true) {
        setStatus("Signup form cleanly loaded!");
        break;
      } else if (emailLoaded === "PAUSED_BLOCK") {
        continue;
      } else {
        // Page stuck or didn't render properly; refresh and try again
        setStatus("Form not rendering, refreshing page...");
        await chrome.runtime.sendMessage({ action: "NAVIGATE_TAB", tabId: tabId, url: targetReturnUrl });
        await sleep(2500);
      }
    }
  }

  async function runFormFillerStep(tabId) {
    if (state.skipCurrentCountry) return;
    setStatus("Running Form Filler...");

    // Requirement 5: Continuous purge & reload loop until signup page loads cleanly
    await ensureCleanSignupPageLoad(tabId);
    if (!state.isRunning || state.skipCurrentCountry) return;

    const email = generateRandomEmail();
    setStatus("Form Step 1: Filling Email");
    await executeActionInFrames(tabId, state.formSelectors.emailInput, "FILL", email, "Email Input", 10);
    await applyStepDelay("emailInput");
    if (!state.isRunning || state.skipCurrentCountry) return;

    // Soft catch Next #1 (Skips gracefully on single-page registration forms)
    try {
      setStatus("Form Step 2: Clicking Next #1");
      await executeActionInFrames(tabId, state.formSelectors.next1, "CLICK", null, "Next #1", 3, ["next", "continue"]);
      await applyStepDelay("next1");
    } catch (next1Err) {
      setStatus("Next #1 skipped (single-page form detected)");
    }
    if (!state.isRunning || state.skipCurrentCountry) return;

    setStatus("Form Step 3: Waiting for Password field");
    await waitForElementInFrames(tabId, state.formSelectors.passwordInput, 10000);
    if (!state.isRunning || state.skipCurrentCountry) return;

    const password = generateRandomPassword();
    setStatus("Form Step 4: Filling Password");
    await executeActionInFrames(tabId, state.formSelectors.passwordInput, "FILL", password, "Password Input", 5);
    await applyStepDelay("passwordInput");
    if (!state.isRunning || state.skipCurrentCountry) return;

    const text1 = generateRandomLetters(7, 10);
    setStatus("Form Step 5: Filling Text Input #1");
    await executeActionInFrames(tabId, state.formSelectors.textInput1, "FILL", text1, "Text Input #1", 5);
    await applyStepDelay("textInput1");
    if (!state.isRunning || state.skipCurrentCountry) return;

    const text2 = generateRandomLetters(7, 10);
    setStatus("Form Step 6: Filling Text Input #2");
    await executeActionInFrames(tabId, state.formSelectors.textInput2, "FILL", text2, "Text Input #2", 5);
    await applyStepDelay("textInput2");
    if (!state.isRunning || state.skipCurrentCountry) return;

    if (!["ph", "sg", "fr", "ae"].includes(state.activeCountry)) {
      let postalCodeVal = "";
      if (state.activeCountry === "uk") postalCodeVal = generateUkPostcode();
      else if (state.activeCountry === "be") postalCodeVal = generateBelgiumPostalCode();
      else if (state.activeCountry === "se") postalCodeVal = generateSwedenPostalCode();
      else if (state.activeCountry === "fi") postalCodeVal = generateFinlandPostalCode();
      else if (state.activeCountry === "cz") postalCodeVal = generateCzechPostalCode();
      else if (state.activeCountry === "ca") postalCodeVal = generateCanadaPostalCode();
      else if (state.activeCountry === "de") postalCodeVal = generateGermanyPostalCode();
      else if (state.activeCountry === "pl") postalCodeVal = generatePolandPostalCode();
      else if (state.activeCountry === "es") postalCodeVal = generateSpainPostalCode();
      else if (state.activeCountry === "at") postalCodeVal = generateAustriaPostalCode();
      else if (state.activeCountry === "au") postalCodeVal = generateAustraliaPostalCode();
      else if (state.activeCountry === "dk") postalCodeVal = generateDenmarkPostalCode();
      else if (state.activeCountry === "nl") postalCodeVal = generateNetherlandsPostalCode();
      else if (state.activeCountry === "mx") postalCodeVal = generateMexicoPostalCode();
      else if (state.activeCountry === "ch") postalCodeVal = generateSwitzerlandPostalCode();
      else if (state.activeCountry === "no") postalCodeVal = generateNorwayPostalCode();
      else if (state.activeCountry === "za") postalCodeVal = generateSouthAfricaPostalCode();
      else if (state.activeCountry === "ie") postalCodeVal = generateIrelandPostalCode();

      // Fallback generator if no specific format matched
      if (!postalCodeVal || postalCodeVal.trim() === "") {
        postalCodeVal = Math.floor(10000 + Math.random() * 90000).toString();
      }

      try {
        setStatus(`Form Step 7: Filling Postal Code (${state.activeCountry.toUpperCase()}: ${postalCodeVal})`);
        await executeActionInFrames(tabId, state.formSelectors.postalCode, "FILL", postalCodeVal, "Postal Code Input", 5);
        await applyStepDelay("postalCode");
      } catch (postalErr) {
        setStatus("Postal Code skipped (field not found or optional)");
      }
      if (!state.isRunning || state.skipCurrentCountry) return;
    }

    // Soft catch Checkbox #1 (Skips gracefully if not present on page)
    try {
      setStatus("Form Step 8: Checking Checkbox #1");
      await executeActionInFrames(tabId, state.formSelectors.checkbox, "CHECKBOX", null, "Checkbox #1", 3);
      await applyStepDelay("checkbox");
    } catch (cb1Err) {
      setStatus("Checkbox #1 skipped (not visible or optional)");
    }
    if (!state.isRunning || state.skipCurrentCountry) return;

    // Soft catch Checkbox #2 (Canada layout)
    if (state.activeCountry === "ca") {
      try {
        setStatus("Form Step 8b: Checking Checkbox #2");
        await executeActionInFrames(tabId, state.formSelectors.checkbox2, "CHECKBOX", null, "Checkbox #2", 3);
        await applyStepDelay("checkbox2");
      } catch (cb2Err) {
        setStatus("Checkbox #2 skipped (not visible or optional)");
      }
      if (!state.isRunning || state.skipCurrentCountry) return;
    }

    setStatus("Form Step 9: Submitting Form");
    await executeActionInFrames(tabId, state.formSelectors.submitNext2, "CLICK", null, "Submit / Next #2", 5, ["submit", "next", "continue", "register", "sign up"]);
    await applyStepDelay("submitNext2");
    if (!state.isRunning || state.skipCurrentCountry) return;

    setStatus("Starting Phone Workflow...");
    await sleep(1500);
  }

  async function executeActionInFrames(tabId, selector, subAction, value, stepName, retries = 10, fallbackKeywords = []) {
    for (let attempt = 1; attempt <= retries; attempt++) {
      if (!state.isRunning || state.skipCurrentCountry) return;

      const frameInfo = await chrome.runtime.sendMessage({
        action: "FIND_SELECTOR_FRAME",
        tabId: tabId,
        selector: selector,
        fallbackKeywords: fallbackKeywords
      });

      const frameId = frameInfo && frameInfo.frameId !== null ? frameInfo.frameId : 0;

      try {
        const results = await chrome.scripting.executeScript({
          target: { tabId: tabId, frameIds: [frameId] },
          func: performInteractionInContent,
          args: [selector, subAction, value, fallbackKeywords]
        });

        if (results && results[0] && results[0].result && results[0].result.success) {
          return true;
        }
      } catch (err) {
        setStatus(`Scanning frames for ${stepName}...`);
      }

      await sleep(1000);
    }

    throw new Error(`${stepName}: element not found after ${retries} attempts.`);
  }

  async function waitForElementInFrames(tabId, selector, timeout = 10000) {
    const startTime = Date.now();
    while (Date.now() - startTime < timeout) {
      if (!state.isRunning || state.skipCurrentCountry) return false;

      // Requirement 5: Check if "Browsing Activity Has Been Paused" appears while waiting
      const isPaused = await checkActivityPausedInFrames(tabId);
      if (isPaused) {
        return "PAUSED_BLOCK";
      }

      const frameInfo = await chrome.runtime.sendMessage({
        action: "FIND_SELECTOR_FRAME",
        tabId: tabId,
        selector: selector
      });

      if (frameInfo && frameInfo.frameId !== null) {
        return true;
      }
      await sleep(500);
    }
    return false;
  }

  function performInteractionInContent(selector, subAction, value, fallbackKeywords = []) {
    function isVisible(el) {
      if (!el) return false;
      const rect = el.getBoundingClientRect();
      const style = window.getComputedStyle(el);
      return (rect.width > 0 || rect.height > 0 || el.getClientRects().length > 0) &&
             style.display !== "none" &&
             style.visibility !== "hidden" &&
             style.opacity !== "0";
    }

    function findInShadow(sel, root = document) {
      if (!sel) return null;
      try {
        const direct = root.querySelector(sel);
        if (direct && isVisible(direct)) return direct;
      } catch(e) {}

      const all = root.querySelectorAll("*");
      for (const el of all) {
        if (el.shadowRoot) {
          const res = findInShadow(sel, el.shadowRoot);
          if (res) return res;
        }
      }
      return null;
    }

    function findByAttributeFallback(sel, root = document) {
      const s = sel ? sel.toLowerCase() : "";
      if (s.includes("email")) {
        return root.querySelector('input[type="email"], input[name*="email"], input[autocomplete="username"], [data-testid*="email"]');
      }
      if (s.includes("password")) {
        return root.querySelector('input[type="password"], input[name*="password"], [data-testid*="password"]');
      }
      return null;
    }

    function findByTextFallback(keywords = [], root = document) {
      if (!keywords || keywords.length === 0) return null;

      const clickables = root.querySelectorAll("button, a, input[type='button'], input[type='submit'], [role='button'], .btn, svg, i, div[role='combobox']");
      for (const el of clickables) {
        const text = (el.innerText || el.value || el.getAttribute("aria-label") || el.getAttribute("title") || "").trim().toLowerCase();
        for (const kw of keywords) {
          if (text.includes(kw.toLowerCase()) && isVisible(el)) {
            return el;
          }
        }
      }

      const allNodes = root.querySelectorAll("*");
      for (const node of allNodes) {
        if (node.shadowRoot) {
          const foundInShadow = findByTextFallback(keywords, node.shadowRoot);
          if (foundInShadow) return foundInShadow;
        }
      }

      return null;
    }

    let element = findInShadow(selector);

    if (!element) {
      element = findByAttributeFallback(selector);
    }

    if (!element && fallbackKeywords && fallbackKeywords.length > 0) {
      element = findByTextFallback(fallbackKeywords);
    }

    if (!element) return { success: false, error: "Element not found via selector or text fallback" };

    try {
      element.scrollIntoView({ behavior: "instant", block: "center" });

      if (subAction === "CLICK") {
        element.click();
        return { success: true };
      }

      if (subAction === "FILL") {
        try {
          const isTextArea = element.tagName && element.tagName.toLowerCase() === "textarea";
          const targetProto = isTextArea ? window.HTMLTextAreaElement.prototype : window.HTMLInputElement.prototype;
          const valueSetter = Object.getOwnPropertyDescriptor(targetProto, "value")?.set;

          if (valueSetter) {
            valueSetter.call(element, value);
          } else {
            element.value = value;
          }
        } catch (err) {
          element.value = value;
        }

        element.dispatchEvent(new Event("input", { bubbles: true }));
        element.dispatchEvent(new Event("change", { bubbles: true }));
        element.dispatchEvent(new Event("blur", { bubbles: true }));
        return { success: true };
      }

      if (subAction === "CHECKBOX") {
        function isChecked(el) {
          if (!el) return false;

          // 1. If picked element is a native input
          if (el.tagName === "INPUT" && el.type === "checkbox") {
            return el.checked;
          }

          // 2. Direct ARIA / Data attributes on element
          const ariaChecked = el.getAttribute("aria-checked");
          if (ariaChecked === "true") return true;

          const dataState = el.getAttribute("data-state") || el.getAttribute("data-checked");
          if (dataState === "checked" || dataState === "true") return true;

          // 3. Search surrounding container (label, row, div) for hidden native input
          const container = el.closest("label, div, p, fieldset") || el.parentElement || el;
          const nativeInput = container.querySelector('input[type="checkbox"]');
          if (nativeInput && nativeInput.checked) {
            return true;
          }

          // 4. Linked label via "for" attribute
          if (el.getAttribute("for")) {
            const linkedInput = document.getElementById(el.getAttribute("for"));
            if (linkedInput && linkedInput.type === "checkbox" && linkedInput.checked) return true;
          }

          // 5. Container ARIA check
          const ariaContainer = el.closest('[role="checkbox"], [aria-checked]');
          if (ariaContainer && ariaContainer.getAttribute("aria-checked") === "true") {
            return true;
          }

          // 6. Checkmark SVG icon detection
          const checkIcon = container.querySelector('svg, path, i[class*="check"], span[class*="check"]');
          if (checkIcon && isVisible(checkIcon)) {
            return true;
          }

          // 7. Class name indicators
          const combinedClasses = (el.className || "") + " " + (container.className || "");
          if (typeof combinedClasses === "string") {
            const cls = combinedClasses.toLowerCase();
            if (cls.includes("checked") || cls.includes("is-checked") || cls.includes("active")) {
              return true;
            }
          }

          return false;
        }

        if (!isChecked(element)) {
          element.click();
        }
        return { success: true };
      }

      return { success: false, error: "Invalid subAction" };
    } catch (e) {
      return { success: false, error: e.message };
    }
  }

  function generateRandomEmail() {
    const firstNames = ["alex", "jordan", "taylor", "morgan", "sam", "chris", "pat", "casey", "riley", "avery"];
    const lastNames = ["smith", "johnson", "williams", "brown", "jones", "miller", "davis", "garcia", "wilson", "taylor"];
    const domains = ["gmail.com", "yahoo.com", "outlook.com", "icloud.com", "proton.me"];

    const fn = firstNames[Math.floor(Math.random() * firstNames.length)];
    const ln = lastNames[Math.floor(Math.random() * lastNames.length)];
    const num = Math.floor(100 + Math.random() * 900);
    const domain = domains[Math.floor(Math.random() * domains.length)];

    return `${fn}.${ln}${num}@${domain}`;
  }

  function generateRandomPassword() {
    const upper = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const lower = "abcdefghijklmnopqrstuvwxyz";
    const nums = "0123456789";
    const spec = "!@#$%^&*";

    let pass = [
      upper[Math.floor(Math.random() * upper.length)],
      lower[Math.floor(Math.random() * lower.length)],
      nums[Math.floor(Math.random() * nums.length)],
      spec[Math.floor(Math.random() * spec.length)]
    ];

    const allChars = upper + lower + nums + spec;
    for (let i = 0; i < 8; i++) {
      pass.push(allChars[Math.floor(Math.random() * allChars.length)]);
    }

    return pass.sort(() => 0.5 - Math.random()).join("");
  }

  function generateRandomLetters(minLen, maxLen) {
    const letters = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const len = Math.floor(Math.random() * (maxLen - minLen + 1)) + minLen;
    let res = "";
    for (let i = 0; i < len; i++) {
      res += letters[Math.floor(Math.random() * letters.length)];
    }
    return res;
  }

  function generateUkPostcode() {
    const outAreas = ["SW1A", "W1A", "EC1A", "E1", "NW1", "M1", "B1", "LS1", "G1", "BS1"];
    const outArea = outAreas[Math.floor(Math.random() * outAreas.length)];
    const digit = Math.floor(Math.random() * 9) + 1;
    const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const l1 = letters[Math.floor(Math.random() * letters.length)];
    const l2 = letters[Math.floor(Math.random() * letters.length)];
    return `${outArea} ${digit}${l1}${l2}`;
  }

  function generateBelgiumPostalCode() {
    const beCodes = ["1000", "1050", "2000", "3000", "4000", "5000", "8000", "9000", "1030", "2018"];
    return beCodes[Math.floor(Math.random() * beCodes.length)];
  }

  function generateSwedenPostalCode() {
    const seCodes = ["111 22", "113 51", "411 01", "211 20", "753 10", "582 12", "702 10", "903 26"];
    return seCodes[Math.floor(Math.random() * seCodes.length)];
  }

  function generateFinlandPostalCode() {
    const fiCodes = ["00100", "00200", "00500", "33100", "20100", "90100", "40100", "70100"];
    return fiCodes[Math.floor(Math.random() * fiCodes.length)];
  }

  function generateSingaporePostalCode() {
    const sgCodes = ["018956", "188065", "238881", "307683", "569933", "609601", "730001", "819642"];
    return sgCodes[Math.floor(Math.random() * sgCodes.length)];
  }

  function generateCzechPostalCode() {
    const czCodes = ["110 00", "120 00", "602 00", "702 00", "301 00", "500 02", "779 00", "460 01"];
    return czCodes[Math.floor(Math.random() * czCodes.length)];
  }

  function generateCanadaPostalCode() {
    const caCodes = ["K1A 0B1", "M5V 2T6", "V6B 1A1", "T2P 1J9", "R3C 4T3", "H3B 2Y5", "B3J 3S9"];
    return caCodes[Math.floor(Math.random() * caCodes.length)];
  }

  function generateGermanyPostalCode() {
    const deCodes = ["10115", "80331", "20095", "50667", "60311", "01067", "70173", "90402"];
    return deCodes[Math.floor(Math.random() * deCodes.length)];
  }

  function generateFrancePostalCode() {
    const frCodes = ["75001", "13001", "69001", "31000", "06000", "44000", "33000", "67000"];
    return frCodes[Math.floor(Math.random() * frCodes.length)];
  }

  function generatePolandPostalCode() {
    const plCodes = ["00-001", "30-001", "50-001", "60-001", "80-001", "90-001", "70-001", "20-001"];
    return plCodes[Math.floor(Math.random() * plCodes.length)];
  }

  function generateSpainPostalCode() {
    const esCodes = ["28001", "08001", "41001", "46001", "29001", "48001", "50001", "03001"];
    return esCodes[Math.floor(Math.random() * esCodes.length)];
  }

  function generateAustraliaPostalCode() {
    const auCodes = ["2000", "3000", "4000", "5000", "6000", "7000", "2600", "0800"];
    return auCodes[Math.floor(Math.random() * auCodes.length)];
  }

  function generateDenmarkPostalCode() {
    const dkCodes = ["1000", "2000", "5000", "8000", "9000", "6000", "7000", "4000"];
    return dkCodes[Math.floor(Math.random() * dkCodes.length)];
  }

  function generateNetherlandsPostalCode() {
    const nlCodes = ["1012 JS", "3011 AD", "2511 CV", "3511 EW", "5611 AA", "9711 LV"];
    return nlCodes[Math.floor(Math.random() * nlCodes.length)];
  }

  function generateMexicoPostalCode() {
    const mxCodes = ["06600", "01000", "64000", "44100", "72000", "32000", "97000"];
    return mxCodes[Math.floor(Math.random() * mxCodes.length)];
  }

  function generateSwitzerlandPostalCode() {
    const chCodes = ["8001", "1201", "3000", "4001", "1003", "6003", "9000", "6900"];
    return chCodes[Math.floor(Math.random() * chCodes.length)];
  }

  function generateNorwayPostalCode() {
    const noCodes = ["0150", "5020", "7010", "9000", "4005", "3015", "4610", "2000"];
    return noCodes[Math.floor(Math.random() * noCodes.length)];
  }

  function generateSouthAfricaPostalCode() {
    const zaCodes = ["8001", "2000", "4001", "0002", "9301", "6001", "3201", "1200"];
    return zaCodes[Math.floor(Math.random() * zaCodes.length)];
  }

  function generateIrelandPostalCode() {
    const ieCodes = ["D02 X285", "A65 F4E2", "T12 E294", "H91 V406", "V94 Y2R5", "X91 N203"];
    return ieCodes[Math.floor(Math.random() * ieCodes.length)];
  }

  function shufflePhoneNumbersList() {
    if (state.phoneNumbers.length <= 1) return;
    for (let i = state.phoneNumbers.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [state.phoneNumbers[i], state.phoneNumbers[j]] = [state.phoneNumbers[j], state.phoneNumbers[i]];
    }
    elements.phoneNumbers.value = state.phoneNumbers.join("\n");
    saveStateToStorage();
  }

  async function checkRateLimitInFrames(tabId) {
    try {
      const results = await chrome.scripting.executeScript({
        target: { tabId: tabId, allFrames: true },
        func: () => {
          const bodyText = (document.body ? document.body.innerText : "").toLowerCase();
          const errorKeywords = [
            // English
            "reached the limit", "verification attempts", "limit for verification", "maximum attempts",
            // French
            "limite atteinte", "tentatives de vérification", "nombre maximum de tentatives", "tentatives dépassé",
            // German
            "limit erreicht", "bestätigungsversuche", "verifizierungsversuche", "maximale anzahl",
            // Spanish
            "límite alcanzado", "limite alcanzado", "intentos de verificación", "intentos de verificacion",
            // Polish
            "osiągnięto limit", "osiagnieto limit", "prób weryfikacji", "prob weryfikacji",
            // Dutch/Flemish (Belgium)
            "limiet bereikt", "verificatiepogingen",
            // Swedish
            "gränsen har uppnåtts", "gransen har uppnatts", "verifieringsförsök",
            // Finnish
            "raja on saavutettu", "vahvistusyritystä", "vahvistusyritysta",
            // Czech
            "dosáhli jste limitu", "dosahli jste limitu", "pokusů o ověření",
            // Danish
            "grænse nået", "grænse naet", "bekræftelsesforsøg", "bekraeftelsesforsoeg",
            // Norwegian
            "grense nådd", "grense nadd", "verifiseringsforsøk", "verifiseringsforsoek",
            // Spanish (Extended)
            "demasiados intentos", "máximo de intentos", "maximo de intentos"
          ];
          return errorKeywords.some(kw => bodyText.includes(kw));
        }
      });
      return results && results.some(r => r.result === true);
    } catch (e) {
      return false;
    }
  }

  function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
});