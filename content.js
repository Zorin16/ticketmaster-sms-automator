// content.js - Content Script for Element Picking & Interaction

(function() {
  let pickingActive = false;
  let activeTargetField = null;
  let highlightOverlay = null;

  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "START_PICKING") {
      startPicker(message.targetField);
      sendResponse({ status: "PICKER_STARTED" });
      return true;
    }

    if (message.action === "STOP_PICKING") {
      stopPicker();
      sendResponse({ status: "PICKER_STOPPED" });
      return true;
    }
  });

  function startPicker(targetField) {
    if (pickingActive) stopPicker();

    pickingActive = true;
    activeTargetField = targetField;
    createOverlay();

    document.addEventListener("mouseover", handleMouseOver, true);
    document.addEventListener("click", handleClick, true);
    document.addEventListener("keydown", handleKeyDown, true);
  }

  function stopPicker() {
    pickingActive = false;
    activeTargetField = null;

    if (highlightOverlay && highlightOverlay.parentNode) {
      highlightOverlay.parentNode.removeChild(highlightOverlay);
    }
    highlightOverlay = null;

    document.removeEventListener("mouseover", handleMouseOver, true);
    document.removeEventListener("click", handleClick, true);
    document.removeEventListener("keydown", handleKeyDown, true);
  }

  function createOverlay() {
    highlightOverlay = document.createElement("div");
    highlightOverlay.id = "workflow-automation-picker-overlay";
    Object.assign(highlightOverlay.style, {
      position: "absolute",
      pointerEvents: "none",
      border: "2px solid #6366f1",
      backgroundColor: "rgba(99, 102, 241, 0.2)",
      zIndex: "2147483647",
      transition: "all 0.05s ease-out",
      boxSizing: "border-box"
    });
    document.documentElement.appendChild(highlightOverlay);
  }

  function handleMouseOver(e) {
    if (!pickingActive || !highlightOverlay) return;
    const target = e.target;
    if (target === highlightOverlay || target.id === "workflow-automation-picker-overlay") return;

    const rect = target.getBoundingClientRect();
    Object.assign(highlightOverlay.style, {
      top: `${rect.top + window.scrollY}px`,
      left: `${rect.left + window.scrollX}px`,
      width: `${rect.width}px`,
      height: `${rect.height}px`
    });
  }

  function handleClick(e) {
    if (!pickingActive) return;

    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation();

    const target = e.target;
    const selector = generateOptimalSelector(target);

    if (highlightOverlay) {
      highlightOverlay.style.borderColor = "#22c55e";
      highlightOverlay.style.backgroundColor = "rgba(34, 197, 94, 0.25)";
    }

    setTimeout(() => {
      const fieldId = activeTargetField;
      stopPicker();

      chrome.runtime.sendMessage({
        action: "SELECTOR_PICKED",
        targetField: fieldId,
        selector: selector
      });
    }, 200);
  }

  function handleKeyDown(e) {
    if (e.key === "Escape" && pickingActive) {
      stopPicker();
    }
  }

  function generateOptimalSelector(element) {
    if (!element || element.nodeType !== Node.ELEMENT_NODE) return "";

    const tagName = element.tagName.toLowerCase();

    if (element.id && !/\d{4,}/.test(element.id) && !/^(:r|react|ember|ng-)/i.test(element.id)) {
      return `#${CSS.escape(element.id)}`;
    }

    if (element.getAttribute("name")) {
      return `${tagName}[name="${CSS.escape(element.getAttribute("name"))}"]`;
    }

    const dataAttrs = ["data-testid", "data-test", "data-qa", "data-cy", "data-id"];
    for (const attr of dataAttrs) {
      if (element.hasAttribute(attr)) {
        return `[${attr}="${CSS.escape(element.getAttribute(attr))}"]`;
      }
    }

    if (element.getAttribute("aria-label")) {
      return `${tagName}[aria-label="${CSS.escape(element.getAttribute("aria-label"))}"]`;
    }

    if (element.getAttribute("placeholder")) {
      return `${tagName}[placeholder="${CSS.escape(element.getAttribute("placeholder"))}"]`;
    }

    const path = [];
    let current = element;

    while (current && current.nodeType === Node.ELEMENT_NODE && current !== document.body) {
      let selector = current.tagName.toLowerCase();

      if (current.id && !/\d{4,}/.test(current.id) && !/^(:r|react|ember|ng-)/i.test(current.id)) {
        selector = `#${CSS.escape(current.id)}`;
        path.unshift(selector);
        break;
      } else {
        let sibling = current;
        let nth = 1;
        while (sibling.previousElementSibling) {
          sibling = sibling.previousElementSibling;
          if (sibling.tagName === current.tagName) nth++;
        }
        if (nth > 1) selector += `:nth-of-type(${nth})`;
      }

      path.unshift(selector);
      current = current.parentElement;
    }

    return path.join(" > ");
  }
})();