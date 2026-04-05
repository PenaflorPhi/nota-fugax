# nota-fugax

A zero-knowledge, ephemeral sharing platform. It runs two modes -- a shared notepad and an anonymous forum -- but the server cannot tell which is which. There are no user accounts, no cookies, no tracking. The server stores only encrypted blobs it cannot read, indexed by hashes it cannot reverse. If someone dumps the database, they get nothing usable.

## How it works

When you open the app, your browser generates a random UUID. This UUID is placed in the URL fragment (the part after `#`), which browsers never send to the server. The server never sees it.

From that UUID, two things are derived entirely client-side:

1. **Thread ID**: A SHA-256 hash of the UUID. This is the only identifier the server receives. It cannot be reversed back to the UUID.
2. **Encryption key**: The UUID is run through PBKDF2 (200,000 iterations, SHA-256) to derive an AES-256-GCM key.

Every message is encrypted in the browser using the derived key with a randomly generated IV. The IV is prepended to the ciphertext, and the result is base64-encoded before transmission.

What the server stores per thread:

```
(SHA-256 hash, base64-encoded ciphertext)
```

A full database dump reveals nothing. Without the original UUID (carried only in the URL fragment, shared only by whoever has the link), the ciphertext is unreadable and the thread ID is irreversible.

All crypto operations use the [Web Crypto API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Crypto_API). Nothing is implemented by hand.

## Modes

**Notepad** -- a single shared document. On save, the client deletes all existing messages in the thread and inserts one new encrypted blob. The result is a persistent, editable note.

**Forum** -- an append-only thread. Each message is posted as a new encrypted blob. Messages are returned in timestamp order.

The server exposes the same API for both. It does not know which mode a thread is using. Mode selection happens on the landing page and is encoded in the URL fragment alongside the UUID. A planned improvement is to embed the mode inside the encrypted payload itself, preventing URL tampering.

## API

| Method | Route | Description |
|--------|-------|-------------|
| `POST` | `/api` | Create a thread (receives SHA-256 thread ID) |
| `GET` | `/api/{thread_id}` | Fetch all ciphertext blobs, ordered by timestamp |
| `POST` | `/api/{thread_id}/messages` | Append a ciphertext blob |
| `DELETE` | `/api/{thread_id}/messages` | Clear all messages (used by notepad before saving) |

## Stack

- **Backend**: Rust, Axum, sqlx, SQLite, Tokio
- **Frontend**: plain HTML, CSS, JavaScript -- no frameworks, no build step

## Project structure

```
nota-fugax/
├── src/
│   ├── main.rs        # Entrypoint: binds the server, initializes the DB pool
│   ├── db.rs          # SQLite connection and migration runner
│   ├── handlers.rs    # API request handlers
│   └── routes.rs      # Router definition and static file serving
├── static/
│   ├── index.html     # SPA: landing page, notepad, and forum views
│   ├── css/           # Stylesheets (base, landing, forum, notepad)
│   └── js/            # Client-side crypto, thread logic, main entry
├── migrations/
│   └── *.sql          # SQLite schema (embedded at compile time via sqlx)
├── Cross.toml         # Cross-compilation config (aarch64-unknown-linux-gnu)
├── Makefile           # Build and deploy targets
├── Cargo.toml
└── README.md
```

The frontend is a single-page application served as a fallback by Axum. On load, it parses the URL fragment. If a UUID and mode are present, it renders the thread view. Otherwise, it shows the landing page.

## Running locally

**Prerequisites**: Rust toolchain (stable), SQLite.

```bash
git clone https://github.com/PenaflorPhi/nota-fugax.git
cd nota-fugax
cargo run
```

The server starts on `http://localhost:3000`. The SQLite database is created automatically at `data/threads.db` and migrations run on startup via `sqlx::migrate!`. Set `DATABASE_URL` to override the default path.

## Deployment

Cross-compilation to `aarch64-unknown-linux-gnu` is configured via `Cross.toml`. The Makefile provides `build` and `deploy` targets for building with `cross` and deploying over SSH.

## Roadmap

- **Thread expiry**: automatic deletion of threads and messages older than a configurable window (background Tokio task)
- **Dockerization**: containerized deployment option
- **Mode in encrypted payload**: embed the mode (notepad/forum) inside the ciphertext to prevent URL fragment tampering
