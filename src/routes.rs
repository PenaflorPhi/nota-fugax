use crate::handlers::{append_message, create_thread, get_messages};
use axum::{
    Router,
    routing::{get, post},
};
use sqlx::SqlitePool;
use tower_http::services::ServeDir;

pub fn create_router(pool: SqlitePool) -> Router {
    Router::new()
        .route("/", post(create_thread))
        .route("/{thread_id}", get(get_messages))
        .route("/{thread_id}/messages", post(append_message))
        .nest_service("/static", ServeDir::new("static"))
        .with_state(pool)
}
