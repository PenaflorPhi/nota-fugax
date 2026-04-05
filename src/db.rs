use sqlx::SqlitePool;

pub async fn connect() -> SqlitePool {
    let database_url =
        std::env::var("DATABASE_URL").unwrap_or_else(|_| "sqlite://data/threads.db".to_string());

    let pool = SqlitePool::connect(&database_url)
        .await
        .expect("failed to connect to database");

    sqlx::migrate!("./migrations")
        .run(&pool)
        .await
        .expect("failed to connect to database");

    pool
}
