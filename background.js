// background.js - Service Worker for Form + Phone Workflow Automation

chrome.runtime.onInstalled.addListener(() => {
  if (chrome.sidePanel && chrome.sidePanel.setPanelBehavior) {
    chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true }).catch((err) => {
      console.warn("Side panel behavior setup warning:", err);
    });
  }
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "CLEAR_COOKIES") {
    handleClearCookies(message.targetUrl)
      .then((result) => sendResponse({ success: true, count: result }))
      .catch((err) => sendResponse({ success: false, error: err.message }));
    return true;
  }
  if (message.action === "CLEAR_STORAGE") {
    handleClearStorage(message.tabId)
      .then(() => sendResponse({ success: true }))
      .catch((err) => sendResponse({ success: false, error: err.message }));
    return true;
  }
  if (message.action === "NAVIGATE_TAB") {
    handleNavigateTab(message.tabId, message.url)
      .then(() => sendResponse({ success: true }))
      .catch((err) => sendResponse({ success: false, error: err.message }));
    return true;
  }
  if (message.action === "FIND_SELECTOR_FRAME") {
    findFrameWithSelector(message.tabId, message.selector)
      .then((result) => sendResponse({ success: true, frameId: result ? result.frameId : null }))
      .catch((err) => sendResponse({ success: false, error: err.message }));
    return true;
  }
});

async function handleClearCookies(targetUrl) {
  if (!targetUrl) return 0;
  
  let hostname = "";
  try {
    const parsed = new URL(targetUrl.startsWith("http") ? targetUrl : `https://${targetUrl}`);
    hostname = parsed.hostname;
  } catch (e) {
    hostname = targetUrl;
  }

  const cleanHost = hostname.replace(/^www\./, "").toLowerCase();
  const hostParts = cleanHost.split(".");
  const rootDomain = hostParts.length >= 2 ? hostParts.slice(-2).join(".") : cleanHost;

  const cookies = await chrome.cookies.getAll({});
  let removedCount = 0;

  for (const cookie of cookies) {
    const cDomain = cookie.domain.replace(/^\./, "").toLowerCase();
    
    if (cDomain.includes(cleanHost) || cleanHost.includes(cDomain) || cDomain.includes(rootDomain)) {
      const protocols = cookie.secure ? ["https://", "http://"] : ["http://", "https://"];
      
      for (const protocol of protocols) {
        const cookieUrl = `${protocol}${cDomain}${cookie.path}`;
        try {
          await chrome.cookies.remove({
            url: cookieUrl,
            name: cookie.name,
            storeId: cookie.storeId
          });
          removedCount++;
          break;
        } catch (err) {
          console.warn(`Cookie remove warning [${cookie.name}]:`, err);
        }
      }
    }
  }
  return removedCount;
}

async function handleClearStorage(tabId) {
  if (!tabId) return false;
  try {
    await chrome.scripting.executeScript({
      target: { tabId },
      func: () => {
        try { localStorage.clear(); } catch (e) {}
        try { sessionStorage.clear(); } catch (e) {}
        try {
          if (window.indexedDB && indexedDB.databases) {
            indexedDB.databases().then((dbs) => {
              dbs.forEach((db) => {
                if (db.name) indexedDB.deleteDatabase(db.name);
              });
            });
          }
        } catch (e) {}
      }
    });
    return true;
  } catch (err) {
    console.warn("Storage clear script warning:", err);
    return false;
  }
}

function handleNavigateTab(tabId, rawUrl) {
  return new Promise((resolve, reject) => {
    let url = rawUrl ? rawUrl.trim() : "";
    if (!url.startsWith("http://") && !url.startsWith("https://")) {
      url = "https://" + url;
    }

    chrome.tabs.update(tabId, { url }, (tab) => {
      if (chrome.runtime.lastError) {
        return reject(chrome.runtime.lastError);
      }

      const listener = (updatedTabId, changeInfo) => {
        if (updatedTabId === tabId && changeInfo.status === "complete") {
          chrome.tabs.onUpdated.removeListener(listener);
          resolve();
        }
      };

      chrome.tabs.onUpdated.addListener(listener);
      setTimeout(() => {
        chrome.tabs.onUpdated.removeListener(listener);
        resolve();
      }, 30000);
    });
  });
}

async function findFrameWithSelector(tabId, selector) {
  if (!tabId || !selector) return null;

  let frames;
  try {
    frames = await chrome.webNavigation.getAllFrames({ tabId });
  } catch (err) {
    console.warn("Error fetching tab frames:", err);
    return null;
  }

  if (!frames || frames.length === 0) return null;

  for (const frame of frames) {
    try {
      const results = await chrome.scripting.executeScript({
        target: { tabId, frameIds: [frame.frameId] },
        func: checkSelectorInFrame,
        args: [selector]
      });

      if (results && results.length > 0 && results[0] && results[0].result === true) {
        return { frameId: frame.frameId };
      }
    } catch (err) {
      console.warn(`Frame ${frame.frameId} scan skipped:`, err.message);
    }
  }

  return null;
}

function checkSelectorInFrame(selector) {
  function findInShadow(sel, root = document) {
    const found = root.querySelector(sel);
    if (found) return found;

    const allNodes = root.querySelectorAll("*");
    for (const node of allNodes) {
      if (node.shadowRoot) {
        const shadowFound = findInShadow(sel, node.shadowRoot);
        if (shadowFound) return shadowFound;
      }
    }
    return null;
  }

  const el = findInShadow(selector);
  if (!el) return false;

  const rect = el.getBoundingClientRect();
  const style = window.getComputedStyle(el);
  return !!(rect.width || rect.height || el.getClientRects().length) &&
         style.display !== "none" &&
         style.visibility !== "hidden" &&
         style.opacity !== "0";
}