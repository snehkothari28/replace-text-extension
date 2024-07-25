// Function to replace ::key:: with values
function replaceText(node, keyValues) {
  if (node.nodeType === Node.TEXT_NODE) {
    let text = node.textContent;
    console.log("text", text);
    for (const [key, value] of Object.entries(keyValues)) {
      const regex = new RegExp(`::${key}::`, "g");
      text = text.replace(regex, value);
    }
    node.textContent = text;
  } else if (node.nodeType === Node.ELEMENT_NODE) {
    for (const child of node.childNodes) {
      replaceText(child, keyValues);
    }
  }
}

// Function to update text in the current active element
function updateActiveElement(keyValues) {
  const activeElement = document.activeElement;
  if (
    activeElement &&
    (activeElement.tagName === "TEXTAREA" ||
      (activeElement.tagName === "INPUT" && activeElement.type === "text"))
  ) {
    const selectionStart = activeElement.selectionStart;
    const selectionEnd = activeElement.selectionEnd;

    // Replace text in the active element
    activeElement.value = activeElement.value.replace(
      /::(\w+)::/g,
      (match, key) => keyValues[key] || match
    );

    // Restore the selection
    activeElement.setSelectionRange(selectionStart, selectionEnd);
  } else {
    // Update the entire document if no active input is focused
    replaceText(document.body, keyValues);
  }
}

// Fetch key-values from storage and update the active element
function fetchKeyValuesAndUpdate() {
  chrome.storage.sync.get(["keyValues"], (result) => {
    const keyValues = result.keyValues || {};
    updateActiveElement(keyValues);
  });
}

// Observe the DOM for changes and replace text dynamically
const mutationObserver = new MutationObserver(() => {
  fetchKeyValuesAndUpdate();
});

mutationObserver.observe(document.body, { childList: true, subtree: true });

// Event listener for text input fields to handle keystrokes
function handleInput() {
  fetchKeyValuesAndUpdate();
}

// Add event listeners to input fields and textareas
function addInputListeners() {
  const inputs = document.querySelectorAll('input[type="text"], textarea');
  inputs.forEach((input) => {
    input.addEventListener("input", handleInput);
  });
}

// Initialize input listeners and reattach them on DOM changes
function initInputListeners() {
  addInputListeners();

  const observer = new MutationObserver(() => {
    addInputListeners();
  });

  observer.observe(document.body, { childList: true, subtree: true });
}

// Initialize input listeners on page load
initInputListeners();
