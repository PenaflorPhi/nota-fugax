use crate::handlers::{append_message, create_thread, get_messages};
use axum::{
    Router,
    routing::{get, post},
};
use sqlx::SqlitePool;

pub fn create_router(pool: SqlitePool) -> Router {
    Router::new()
        .route("/", post(create_thread))
        .route("/{thread_id}", get(get_messages))
        .route("/{thread_id}/messages", post(append_message))
        .with_state(pool)
}
