const btnNotepad = document.getElementById("btn-notepad");
const btnForum = document.getElementById("btn-forum");

btnNotepad.addEventListener("click", () => createThread("notepad"));
btnForum.addEventListener("click", () => createThread("forum"));

async function createThread(mode) {
  const uuid = await generateUUID();
  const threadId = await hashUUID(uuid);

  await fetch("/", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ thread_id: threadId }),
  });

  window.location.hash = `uuid=${uuid}&mode=${mode}`;
}
