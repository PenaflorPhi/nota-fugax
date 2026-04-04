use crate::handlers::{append_message, clear_messages, create_thread, get_messages};
use axum::{
    Router,
    routing::{delete, get, post},
};
use sqlx::SqlitePool;
use tower_http::services::ServeDir;

pub fn create_router(pool: SqlitePool) -> Router {
    Router::new()
        .route("/", post(create_thread))
        .route("/{thread_id}", get(get_messages))
        .route("/{thread_id}/messages", post(append_message))
        .route("/{thread_id}/messages", delete(clear_messages))
        .nest_service("/static", ServeDir::new("static"))
        .with_state(pool)
}
