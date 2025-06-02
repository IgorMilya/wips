use futures::TryStreamExt;
use serde::{Serialize, Deserialize};
use mongodb::{bson::doc, Collection};
use mongodb::bson::oid::ObjectId;
use crate::server::server;

#[derive(Debug, Serialize, Deserialize)]
pub struct BlacklistedNetwork {
    pub _id: ObjectId,
    pub ssid: String,
    pub bssid: String,
}

#[tauri::command]
pub async fn get_blacklist() -> Result<Vec<BlacklistedNetwork>, String> {
    let database = server().await.map_err(|e| e.to_string())?;
    let my_coll: Collection<BlacklistedNetwork> = database.collection("Blacklist");

    let mut cursor = my_coll.find(doc! { "ssid": "Telia-25A6C" })
        .await
        .map_err(|e| e.to_string())?;

    let mut results = Vec::new();
    while let Some(doc) = cursor.try_next().await.map_err(|e| e.to_string())? {
        results.push(doc);
    }

    Ok(results)
}

