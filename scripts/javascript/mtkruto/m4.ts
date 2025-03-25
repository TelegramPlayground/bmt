import { Client, errors, setLogVerbosity, Api } from "jsr:@mtkruto/mtkruto";

const APP_ID = +(Deno.env.get("APP_ID") || "");
const API_HASH = Deno.env.get("API_HASH") || "";
const BOT_TOKEN = Deno.env.get("BOT_TOKEN") || "";
const SLEEP_THRESHOLD = +(Deno.env.get("FLOOD_WAIT_SLEEP_TIME") || "") || 10;
const MESSAGE_LINK = Deno.env.get("MESSAGE_LINK") || "";

setLogVerbosity(5);
const client = new Client({ apiId: APP_ID, apiHash: API_HASH });

const d: {
  version: string;
  layer: number;
  file_size: number;
  download: {
    start_time: number;
    end_time: number;
    time_taken: number;
  };
  upload: {
    start_time: number;
    end_time: number;
    time_taken: number;
  };
} = { version: "N / A", layer: Api.LAYER, file_size: 0, download: { start_time: 0, end_time: 0, time_taken: 0 }, upload: { start_time: 0, end_time: 0, time_taken: 0 } };

client.invoke.use(async ({ error }, next) => {
  if (error instanceof errors.FloodWait && error.seconds <= SLEEP_THRESHOLD) {
    await new Promise((r) => setTimeout(r, 1_000 * error.seconds));
    return true;
  } else {
    return next();
  }
});

await client.start({ botToken: BOT_TOKEN });

const message = await client.resolveMessageLink(MESSAGE_LINK);

if (!message || !("document" in message)) {
  console.log("Invalid message.");
  Deno.exit(1);
}
d.file_size = message.document.fileSize;
d.download.start_time = Date.now() / 1_000;
const chunks = new Array<Uint8Array>();
for await (const chunk of client.download(message.document.fileId)) {
  chunks.push(chunk);
}
d.download.end_time = Date.now() / 1_000;
d.download.time_taken = d.download.end_time - d.download.start_time;

d.upload.start_time = Date.now() / 1_000;
await client.sendDocument(message.chat.id, new Uint8Array(await new Blob(chunks).arrayBuffer()), { fileName: "MTKruto", replyTo: { messageId: message.id } });
d.upload.end_time = Date.now() / 1_000;
d.upload.time_taken = d.upload.end_time;

client.disconnect();

const encoder = new TextEncoder();
const data = encoder.encode(JSON.stringify(d, null, 2));
await Deno.writeFile("../../../outputs/mtkruto.json", data);
