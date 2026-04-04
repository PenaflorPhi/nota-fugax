mod db;
mod handlers;
mod routes;

#[tokio::main]
async fn main() {
    let pool = db::connect().await;
    let app = routes::create_router(pool);

    let listener = tokio::net::TcpListener::bind("0.0.0.0:3000").await.unwrap();

    println!("Listening on http://0.0.0.0:3000");
    axum::serve(listener, app).await.unwrap();
}
