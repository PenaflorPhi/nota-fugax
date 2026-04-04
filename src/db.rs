use sqlx::SqlitePool;

pub async fn connect() -> SqlitePool {
    let pool = SqlitePool::connect("sqlite://data/threads.db")
        .await
        .expect("failed to connect to database");

    sqlx::migrate!("./migrations")
        .run(&pool)
        .await
        .expect("failed to connect to database");

    pool
}
