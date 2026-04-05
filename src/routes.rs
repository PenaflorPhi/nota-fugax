use crate::handlers::{append_message, clear_messages, create_thread, get_messages};
use axum::{
    Router,
    routing::{delete, get, post},
};
use sqlx::SqlitePool;
use tower_http::services::ServeDir;

pub fn create_router(pool: SqlitePool) -> Router {
    let static_files = ServeDir::new("static");

    Router::new()
        .route("/api", post(create_thread))
        .route("/api/{thread_id}", get(get_messages))
        .route(
            "/api/{thread_id}/messages",
            post(append_message).delete(clear_messages),
        )
        .with_state(pool)
        .fallback_service(static_files)
}
