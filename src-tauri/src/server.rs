use mongodb::{Client, Database};

pub async fn server() -> mongodb::error::Result<Database> {
    let db_url = "mongodb+srv://imilay11:yiiWyudxZU2RIy0n@wisp-app.j5ndz0i.mongodb.net/?retryWrites=true&w=majority&appName=Wisp-App";
    let client = Client::with_uri_str(db_url).await?;
    
    let database = client.database("WISP-APP");
    Ok(database)
}
