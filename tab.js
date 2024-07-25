document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("kv-form");
  const keyInput = document.getElementById("key");
  const valueInput = document.getElementById("value");
  const keyValueTable = document
    .getElementById("key-value-table")
    .getElementsByTagName("tbody")[0];

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const key = keyInput.value;
    const value = valueInput.value;
    addKeyValue(key, value);
    keyInput.value = "";
    valueInput.value = "";
  });

  chrome.storage.sync.get(["keyValues"], (result) => {
    const keyValues = result.keyValues || {};
    for (const [key, value] of Object.entries(keyValues)) {
      displayKeyValue(key, value);
    }
  });

  function addKeyValue(key, value) {
    chrome.storage.sync.get(["keyValues"], (result) => {
      const keyValues = result.keyValues || {};
      keyValues[key] = value;
      chrome.storage.sync.set({ keyValues }, () => {
        displayKeyValue(key, value);
      });
    });
  }

  function displayKeyValue(key, value) {
    const row = document.createElement("tr");
    const keyCell = document.createElement("td");
    const valueCell = document.createElement("td");
    const actionsCell = document.createElement("td");
    const deleteButton = document.createElement("button");

    keyCell.textContent = key;
    valueCell.textContent = value;
    valueCell.style.whiteSpace = "pre-wrap"; // Allows multiline text
    deleteButton.textContent = "Delete";
    deleteButton.addEventListener("click", () => {
      deleteKeyValue(key, row);
    });

    actionsCell.appendChild(deleteButton);
    row.appendChild(keyCell);
    row.appendChild(valueCell);
    row.appendChild(actionsCell);

    keyValueTable.appendChild(row);
  }

  function deleteKeyValue(key, row) {
    chrome.storage.sync.get(["keyValues"], (result) => {
      const keyValues = result.keyValues || {};
      delete keyValues[key];
      chrome.storage.sync.set({ keyValues }, () => {
        keyValueTable.removeChild(row);
      });
    });
  }
});
