use axum::{
    Json,
    extract::{Path, State},
    http::StatusCode,
};
use serde::{Deserialize, Serialize};
use sqlx::SqlitePool;
use std::time::{SystemTime, UNIX_EPOCH};

#[derive(Deserialize)]
pub struct CreateThread {
    thread_id: String,
}

#[derive(Serialize)]
pub struct Message {
    ciphertext: String,
    created_at: i64,
}

#[derive(Deserialize)]
pub struct AppendMessage {
    ciphertext: String,
}

fn get_current_time() -> i64 {
    SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .unwrap()
        .as_secs() as i64
}

pub async fn get_messages(
    State(pool): State<SqlitePool>,
    Path(thread_id): Path<String>,
) -> Json<Vec<Message>> {
    let messages = sqlx::query_as!(
        Message,
        "SELECT ciphertext, created_at FROM messages WHERE thread_id = ? ORDER BY created_at ASC",
        thread_id
    )
    .fetch_all(&pool)
    .await
    .expect("Failed to fetch messages.");

    Json(messages)
}

pub async fn append_message(
    State(pool): State<SqlitePool>,
    Path(thread_id): Path<String>,
    Json(payload): Json<AppendMessage>,
) -> StatusCode {
    let now = get_current_time();

    sqlx::query!(
        "INSERT INTO messages(thread_id, ciphertext, created_at) VALUES (?, ?, ?)",
        thread_id,
        payload.ciphertext,
        now
    )
    .execute(&pool)
    .await
    .expect("Failed to insert messages");

    StatusCode::CREATED
}

pub async fn create_thread(
    State(pool): State<SqlitePool>,
    Json(payload): Json<CreateThread>,
) -> StatusCode {
    let now = get_current_time();

    println!("{} : {}", payload.thread_id, now);

    sqlx::query!(
        "INSERT INTO threads (thread_id, created_at) VALUES (?, ?)",
        payload.thread_id,
        now
    )
    .execute(&pool)
    .await
    .expect("Failed to insert thread.");

    StatusCode::CREATED
}
