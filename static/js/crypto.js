// ─── UUID Generation ──────────────────────────────────────────────────────────
async function generateUUID() {
  return crypto.randomUUID();
}

// ─── Thread ID Derivation ─────────────────────────────────────────────────────

// Computes SHA-256 of the UUID to use as the server-side thread identifier.
async function hashUUID(uuid) {
  const encoder = new TextEncoder();
  const data = encoder.encode(uuid);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

// ─── Key Derivation ───────────────────────────────────────────────────────────

// Derives an AES-256-GCM key from the UUID using PBKDF2.
async function deriveKey(uuid) {
  const encoder = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    encoder.encode(uuid),
    "PBKDF2",
    false,
    ["deriveKey"],
  );

  return crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: encoder.encode("nota-fugax-salt"),
      iterations: 200000,
      hash: "SHA-256",
    },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"],
  );
}

// ─── Encryption ───────────────────────────────────────────────────────────────

// Encrypts a plaintext string and returns a base64 string.
// A random 12-byte IV is generated per encryption and prepended to the ciphertext.
async function encrypt(uuid, plaintext) {
  const key = await deriveKey(uuid);
  const encoder = new TextEncoder();
  const iv = crypto.getRandomValues(new Uint8Array(12));

  const ciphertext = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    encoder.encode(plaintext),
  );

  const combined = new Uint8Array(iv.byteLength + ciphertext.byteLength);
  combined.set(iv, 0);
  combined.set(new Uint8Array(ciphertext), iv.byteLength);

  return btoa(String.fromCharCode(...combined));
}

// ─── Decryption ───────────────────────────────────────────────────────────────

// Decrypts a base64 string produced by encrypt() and returns the plaintext.
// Extracts the IV from the first 12 bytes, then decrypts the remainder.
async function decrypt(uuid, base64) {
  const key = await deriveKey(uuid);
  const combined = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));
  const iv = combined.slice(0, 12);
  const ciphertext = combined.slice(12);

  const plaintext = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv },
    key,
    ciphertext,
  );

  return new TextDecoder().decode(plaintext);
}
