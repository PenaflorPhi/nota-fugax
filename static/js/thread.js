// ─── Thread Creation ─────────────────────────────────────────────────────────

const btnNotepad = document.getElementById("btn-notepad");
const btnForum = document.getElementById("btn-forum");

btnNotepad.addEventListener("click", () => createThread("notepad"));
btnForum.addEventListener("click", () => createThread("forum"));

// Generates a new thread: creates a UUID, hashes it for the server,
// registers the thread, then redirects to the thread URL.
async function createThread(mode) {
  const uuid = await generateUUID();
  const threadId = await hashUUID(uuid);

  await fetch("/api", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ thread_id: threadId }),
  });

  window.location.hash = `uuid=${uuid}&mode=${mode}`;
}

// ─── Message Loading ──────────────────────────────────────────────────────────

// Fetches all messages for a thread and renders them based on mode.
async function loadMessages(uuid, mode) {
  const threadId = await hashUUID(uuid);
  const response = await fetch(`/api/${threadId}`);
  const messages = await response.json();

  if (mode === "forum") {
    await renderForumMessages(messages, uuid);
  } else if (mode === "notepad") {
    await renderNotepad(messages, uuid);
  }
}

// Renders all messages in the forum chat view.
async function renderForumMessages(messages, uuid) {
  const container = document.getElementById("messages");
  container.innerHTML = "";
  for (const msg of messages) {
    const plaintext = await decrypt(uuid, msg.ciphertext);
    const div = document.createElement("div");
    div.className = "message";
    div.textContent = plaintext;
    container.appendChild(div);
  }
}

// Renders the latest message in the notepad text area.
async function renderNotepad(messages, uuid) {
  const textarea = document.getElementById("notepad-text");
  if (messages.length === 0) return;
  const latest = messages[messages.length - 1];
  textarea.value = await decrypt(uuid, latest.ciphertext);
}

// ─── Notepad ──────────────────────────────────────────────────────────────────

// Saves the current notepad content to the server.
document.getElementById("btn-save").addEventListener("click", async () => {
  const params = parseFragment();
  const threadId = await hashUUID(params.uuid);
  const content = document.getElementById("notepad-text").value;

  const encrypted = await encrypt(params.uuid, content);

  await fetch(`/api/${threadId}/messages`, {
    method: "DELETE",
  });

  await fetch(`/api/${threadId}/messages`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ciphertext: encrypted }),
  });
});

// ─── Forum ────────────────────────────────────────────────────────────────────

// Sends a new message in the forum and reloads the message list.
document.getElementById("btn-send").addEventListener("click", async () => {
  const params = parseFragment();
  const threadId = await hashUUID(params.uuid);
  const content = document.getElementById("forum-text").value;

  if (!content.trim()) return;

  const encrypted = await encrypt(params.uuid, content);

  await fetch(`/api/${threadId}/messages`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ciphertext: encrypted }),
  });

  document.getElementById("forum-text").value = "";
  await loadMessages(params.uuid, "forum");
});
