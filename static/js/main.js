const landing = document.getElementById("landing");
const thread = document.getElementById("thread");
const forumView = document.getElementById("forum-view");
const notepadView = document.getElementById("notepad-view");

function parseFragment() {
  const fragment = window.location.hash.slice(1);
  const params = {};
  if (!fragment) return params;
  for (const part of fragment.split("&")) {
    const idx = part.indexOf("=");
    if (idx === -1) continue;
    const key = part.slice(0, idx);
    const value = part.slice(idx + 1);
    if (key) params[key] = value;
  }
  return params;
}

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
}

window.addEventListener("hashchange", init);
init();
