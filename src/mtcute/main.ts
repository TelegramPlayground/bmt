import { readFileSync, writeFileSync } from "node:fs";
import { ok } from "node:assert";
import { cleanEnv, num, str, url } from "envalid";
import { InputMedia, TelegramClient } from "@mtcute/node";

const env = cleanEnv(process.env, {
  APP_ID: num(),
  API_HASH: str(),
  BOT_TOKEN: str(),
  MESSAGE_LINK: url(),
});

const tg = new TelegramClient({
  apiId: env.APP_ID,
  apiHash: env.API_HASH,
});
await tg.start({
    botToken: env.BOT_TOKEN
});

const msg = await tg.getMessageByLink(env.MESSAGE_LINK);
ok(msg != null);
ok(msg.media != null);
ok(msg.media.type === "document");

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
} = {
    version: JSON.parse(readFileSync("package.json"))
        .dependencies["@mtcute/node"]
        .split("@")
        .slice(-1)[0]
        .replaceAll("^", ""),
    layer: JSON.parse(readFileSync("package.json"))
      .dependencies["@mtcute/tl"]
      .split("@")
      .slice(-1)[0]
      .replaceAll("^", "")
      .split(".")[0],
    file_size: 0,
    download: { start_time: 0, end_time: 0, time_taken: 0 },
    upload: { start_time: 0, end_time: 0, time_taken: 0 },
};

d.file_size = msg.media.fileSize;

const chunks = new Array<Uint8Array>();

d.download.start_time = Date.now() / 1_000;
for await (const chunk of tg.downloadAsIterable(msg.media)) {
  chunks.push(chunk);
}
d.download.end_time = Date.now() / 1_000;
d.download.time_taken = d.download.end_time - d.download.start_time;

const document = new Uint8Array(await new Blob(chunks).arrayBuffer());

d.upload.start_time = Date.now() / 1_000;
await tg.sendMedia(msg.chat.id, InputMedia.document(document));
d.upload.end_time = Date.now() / 1_000;
d.upload.time_taken = d.upload.end_time - d.upload.start_time;

await tg.close();
writeFileSync("../../out/mtcute.json", JSON.stringify(d, null, 2));
