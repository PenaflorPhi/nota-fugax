CREATE TABLE threads (
    thread_id  TEXT    PRIMARY KEY,
    created_at INTEGER NOT NULL
);

CREATE TABLE messages (
    message_id INTEGER PRIMARY KEY AUTOINCREMENT,
    thread_id  TEXT    NOT NULL REFERENCES threads(thread_id) ON DELETE CASCADE,
    ciphertext TEXT    NOT NULL,
    created_at INTEGER NOT NULL
);
