const landing = document.getElementById("landing");
const thread = document.getElementById("thread");
const forumView = document.getElementById("forum-view");
const notepadView = document.getElementById("notepad-view");

// ─── URL Fragment Parsing ─────────────────────────────────────────────────────

// Parses the URL fragment into a key/value object.
// e.g. #uuid=abc123&mode=forum -> { uuid: "abc123", mode: "forum" }
// The fragment is never sent to the server — it stays in the browser only.
function parseFragment() {
  const fragment = window.location.hash.slice(1); // remove the leading #
  const params = {};
  if (!fragment) return params;
  for (const part of fragment.split("&")) {
    const idx = part.indexOf("=");
    if (idx === -1) continue; // skip malformed parts
    const key = part.slice(0, idx);
    const value = part.slice(idx + 1);
    if (key) params[key] = value;
  }
  return params;
}

// ─── View Routing ─────────────────────────────────────────────────────────────
function init() {
  const params = parseFragment();
  if (params.uuid && params.mode) {
    showThread(params.uuid, params.mode);
  } else {
    showLanding();
  }
}

function showLanding() {
  landing.removeAttribute("hidden");
  thread.setAttribute("hidden", "");
}

function showThread(uuid, mode) {
  landing.setAttribute("hidden", "");
  thread.removeAttribute("hidden");

  if (mode === "forum") {
    forumView.removeAttribute("hidden");
    notepadView.setAttribute("hidden", "");
  } else if (mode === "notepad") {
    notepadView.removeAttribute("hidden");
    forumView.setAttribute("hidden", "");
  }

  loadMessages(uuid, mode);
}

window.addEventListener("hashchange", init);
init();

document.querySelectorAll("#btn-copy-link").forEach((btn) => {
  btn.addEventListener("click", () => {
    navigator.clipboard.writeText(window.location.href);
    btn.textContent = "copied!";
    setTimeout(() => (btn.textContent = "copy link"), 2000);
  });
});
