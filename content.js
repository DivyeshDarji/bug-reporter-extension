// Create floating button
const button = document.createElement("button");

button.innerText = "🐞 Report Bug";
button.id = "bug-report-btn";

document.body.appendChild(button);

// Drag functionality
let isDragging = false;
let offsetX = 0;
let offsetY = 0;

button.addEventListener("mousedown", (e) => {
  isDragging = true;

  // calculate offset from cursor to button corner
  offsetX = e.clientX - button.getBoundingClientRect().left;
  offsetY = e.clientY - button.getBoundingClientRect().top;

  button.style.cursor = "grabbing";
});

document.addEventListener("mousemove", (e) => {
  if (!isDragging) return;

  let x = e.clientX - offsetX;
  let y = e.clientY - offsetY;

  // Keep inside viewport
  const maxX = window.innerWidth - button.offsetWidth;
  const maxY = window.innerHeight - button.offsetHeight;

  x = Math.max(0, Math.min(x, maxX));
  y = Math.max(0, Math.min(y, maxY));

  button.style.left = x + "px";
  button.style.top = y + "px";
  button.style.right = "auto";
  button.style.bottom = "auto";
});

document.addEventListener("mouseup", () => {
  isDragging = false;
  button.style.cursor = "grab";
});

// Prevent click if it was a drag
let moved = false;

document.addEventListener("mousemove", () => {
  if (isDragging) moved = true;
});

button.addEventListener("click", (e) => {
  if (moved) {
    moved = false;
    return;
  }

  // ✅ Step 1: Capture screenshot FIRST
  chrome.runtime.sendMessage({ action: "TAKE_SCREENSHOT" }, (response) => {
    // ✅ Step 2: Then open modal and pass image
    openBugForm(response?.image);
  });
});


function openBugForm(imageData) {
  if (document.getElementById("bug-modal")) return;

  const modal = document.createElement("div");
  modal.id = "bug-modal";

  modal.innerHTML = `
  <div class="bug-container">

    <div class="bug-header">
      <span>Report Bug</span>
      <button id="close">✕</button>
    </div>

    <div class="bug-body">

      <div class="screenshot">
        <img id="screenshot-img" />
      </div>

      <div style="margin-bottom:10px;">
        <label>Bug Summary</label>
        <input id="summary" placeholder="Checkout button not working" />
      </div>

      <div style="margin-bottom:10px;">
        <label>Steps to Reproduce</label>
        <textarea id="steps">1. Navigate to page\n2. Click button</textarea>
      </div>

      <div style="display:flex; gap:10px; margin-bottom:10px;">
        <div style="flex:1;">
          <label>Expected</label>
          <textarea id="expected"></textarea>
        </div>

        <div style="flex:1;">
          <label>Actual</label>
          <textarea id="actual"></textarea>
        </div>
      </div>

      <div style="margin-bottom:10px;">
        <label>Priority</label>
        <select id="priority">
          <option>Low</option>
          <option selected>Medium</option>
          <option>High</option>
        </select>
      </div>

      <div style="margin-bottom:10px;">
        <label>Severity</label>
        <select id="severity">
          <option>Critical</option>
          <option selected>High</option>
          <option>Medium</option>
          <option>Low</option>
        </select>
      </div>

      <div style="margin-top:16px; border-top:1px solid #374151; padding-top:10px;">
        <label>Jira Project (Coming Soon)</label>
        <select disabled>
          <option>Select Project</option>
        </select>
      </div>

    </div>

    <div class="bug-footer">
      <div style="font-size:11px; color:#9ca3af; margin-bottom:8px;">
        Ticket will be routed to BA/SM verification queue.
      </div>
      <button class="submit-btn" id="submit">Approve & Send</button>
    </div>

  </div>
`;

  document.body.appendChild(modal);

  // Close handler
  document.getElementById("close").onclick = () => modal.remove();

  // Screenshot capture
  //captureScreenshot();
  document.getElementById("screenshot-img").src = imageData;

  // Submit handler
  document.querySelector(".submit-btn").onclick = submitBug;
}

// Capture screenshot and display in modal - currently handled in the click event of the button, so this function is not used anymore.
/* function captureScreenshot() {
  chrome.runtime.sendMessage({ action: "TAKE_SCREENSHOT" }, (response) => {
    if (response && response.image) {
      document.getElementById("screenshot-img").src = imageData;
    }
  });
}*/

/*function submitBug() {
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
}*/

function submitBug() {
  const bugData = {
    summary: document.getElementById("summary").value,
    steps: document.getElementById("steps").value,
    expected: document.getElementById("expected").value,
    actual: document.getElementById("actual").value,
    priority: document.getElementById("priority").value,
    severity: document.getElementById("severity").value
  };

  const description = `
Steps to Reproduce:
${bugData.steps}

Expected Result:
${bugData.expected}

Actual Result:
${bugData.actual}
`;

  // Map severity to Jira severity values
  const severityMap = {
    Medium: "Medium",
    High: "High",
    Low: "Low",
    Critical: "Critical"
  };

  // Get the screenshot data from the modal
  const screenshot = document.getElementById("screenshot-img").src;

  // Send data to backend for Jira ticket creation
  const payload = {
    fields: {
      project: { key: "BRT" },
      summary: bugData.summary,
      description: {
        type: "doc",
        version: 1,
        content: [
          {
            type: "paragraph",
            content: [{ type: "text", text: description }]
          }
        ]
      },
      issuetype: { name: "Bug" },
      priority: { name: bugData.priority },
      customfield_10166: {
        value: severityMap[bugData.severity]
      }


    }
  };

  // Send the payload to the backend server
  fetch("http://localhost:3000/create-jira", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ payload, screenshot })
  })
    .then(res => {
      if (!res.ok) throw new Error("Jira API failed");
      return res.json();
    })
    .then(data => {
      alert(`✅ Bug created: ${data.issueKey}`);
    })
    .catch(() => {
      alert("❌ Failed to create Jira bug");
    });


}
