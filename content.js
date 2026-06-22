// Create floating button
const button = document.createElement("button");

button.innerText = "🐞 Report Bug";
button.id = "bug-report-btn";

document.body.appendChild(button);

// Click handler
button.addEventListener("click", () => {
  openBugForm();
});

function openBugForm() {
  if (document.getElementById("bug-modal")) return;

  const modal = document.createElement("div");
  modal.id = "bug-modal";

  modal.innerHTML = `
    <div class="bug-container">
      <h3>Report Bug</h3>

      <img id="screenshot" />

      <input placeholder="Bug Summary" id="summary"/>

      <textarea placeholder="Description" id="description"></textarea>

      <textarea placeholder="Steps to Reproduce" id="steps"></textarea>

      <div class="row">
        <input placeholder="Expected" id="expected"/>
        <input placeholder="Actual" id="actual"/>
      </div>

      <div class="row">
        <select id="priority">
          <option>Low</option>
          <option selected>Medium</option>
          <option>High</option>
        </select>

        <select id="severity">
          <option>Minor</option>
          <option selected>Major</option>
          <option>Critical</option>
        </select>
      </div>

      <div class="actions">
        <button id="close">Cancel</button>
        <button id="submit">Submit</button>
      </div>
    </div>
  `;

  document.body.appendChild(modal);

  // Close handler
  document.getElementById("close").onclick = () => modal.remove();

  // Screenshot capture
  captureScreenshot();

  // Submit handler
  document.getElementById("submit").onclick = submitBug;
}

function captureScreenshot() {
  chrome.runtime.sendMessage({ action: "TAKE_SCREENSHOT" }, (response) => {
    if (response && response.image) {
      document.getElementById("screenshot").src = response.image;
    }
  });
}

function submitBug() {
  const bugData = {
    summary: document.getElementById("summary").value,
    description: document.getElementById("description").value,
    steps: document.getElementById("steps").value,
    expected: document.getElementById("expected").value,
    actual: document.getElementById("actual").value,
    priority: document.getElementById("priority").value,
    severity: document.getElementById("severity").value,
    url: window.location.href,
    time: new Date().toISOString()
  };

  console.log("BUG DATA:", bugData);

  alert("Bug captured successfully ✅");

  document.getElementById("bug-modal").remove();
}