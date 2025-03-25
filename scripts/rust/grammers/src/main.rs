use grammers_client::grammers_tl_types::LAYER;
use grammers_client::types;
use grammers_client::{Client, Config, InitParams, session};
use std::env;
use std::time::SystemTime;

fn now() -> f64 {
    SystemTime::now()
        .duration_since(SystemTime::UNIX_EPOCH)
        .unwrap()
        .as_secs_f64()
}

#[tokio::main]
async fn main() {
    let version = InitParams::default().app_version;

    let api_id = env::var("API_ID")
        .map(|var| var.parse::<i32>().unwrap())
        .unwrap_or(6);
    let api_hash = env::var("API_HASH").unwrap_or(String::new());
    let bot_token = env::var("BOT_TOKEN").unwrap();
    let flood_wait_threshold = env::var("FLOOD_WAIT_THRESHOLD")
        .map(|var| var.parse::<u32>().unwrap())
        .unwrap_or(10);
    let message_link = env::var("MESSAGE_LINK").unwrap();

    let app = Client::connect(Config {
        api_id: api_id,
        api_hash: api_hash,
        session: session::Session::new(),
        params: InitParams {
            flood_sleep_threshold: flood_wait_threshold,
            ..InitParams::default()
        },
    })
    .await
    .unwrap();

    app.bot_sign_in(&bot_token).await.unwrap();

    let mut link = message_link.split("/").skip(3);
    let chat_id = link.next().unwrap();
    let s_message_id = link.next().unwrap().parse::<i32>().unwrap();

    let chat = app.resolve_username(chat_id).await.unwrap().unwrap().pack();

    let _t1 = now();
    let message = app
        .get_messages_by_id(chat, &[s_message_id])
        .await
        .unwrap()
        .pop()
        .unwrap()
        .unwrap();

    let media = message.media().unwrap();
    let file_size = match media.clone() {
        types::Media::Document(document) => document.size(),
        _ => panic!(),
    };

    let t2 = now();
    let filename = "g1.tmp";
    app.download_media(&types::Downloadable::Media(media), filename)
        .await
        .unwrap();
    let t3 = now();
    let download_start_time = t2;
    let download_end_time = t2;
    let download_time_taken = t3 - t2;

    let t4 = now();
    let uploaded = app.upload_file(filename).await.unwrap();
    app.send_message(
        chat,
        types::InputMessage::text("Grammers")
            .file(uploaded)
            .reply_to(Some(s_message_id)),
    )
    .await
    .unwrap();
    let t5 = now();
    let upload_start_time = t4;
    let upload_end_time = t5;
    let upload_time_taken = t5 - t4;

    drop(app);

    println!(
        r#"{{
  "version": "{version}",
  "layer": {LAYER},
  "file_size": {file_size},
  "download": {{
    "start_time": {download_start_time},
    "end_time": {download_end_time},
    "time_taken": {download_time_taken}
  }},
  "upload": {{
    "start_time": {upload_start_time},
    "end_time": {upload_end_time},
    "time_taken": {upload_time_taken}
  }}
}}"#,
    );
}
