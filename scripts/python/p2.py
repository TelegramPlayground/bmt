import asyncio
import logging
import os
from datetime import datetime
from json import dumps
from pyrogram import Client, __version__
from pyrogram.raw.all import layer


logging.basicConfig(
    level=logging.INFO,
    format="[%(asctime)s - %(levelname)s] - %(name)s - %(message)s",
    datefmt="%d-%b-%y %H:%M:%S",
    handlers=[
        logging.StreamHandler()
    ]
)


API_ID = int(os.environ.get("API_ID", "6"))
API_HASH = os.environ.get("API_HASH", "")
BOT_TOKEN = os.environ.get("BOT_TOKEN")
FLOOD_WAIT_THRESHOLD = int(os.environ.get("FLOOD_WAIT_THRESHOLD", "10"))
TG_SESSION = os.environ.get("TG_SESSION", "")
MESSAGE_LINK = os.environ.get("MESSAGE_LINK", "")


async def main():
    d = {}
    async with Client(
        name="my_account",
        session_string=TG_SESSION,
        in_memory=True,
        api_id=API_ID,
        api_hash=API_HASH,
        sleep_threshold=FLOOD_WAIT_THRESHOLD,
        no_updates=True,
        bot_token=BOT_TOKEN
    ) as app:
        app.upload_boost = True

        d["version"] = __version__
        d["layer"] = layer

        _, _, _, chat_id, s_message_id = MESSAGE_LINK.split("/")

        t1 = datetime.now()
        message = await app.get_messages(chat_id=chat_id, message_ids=int(s_message_id))
        d["file_size"] = message.document.file_size
        t2 = datetime.now()
        filename = await message.download()
        t3 = datetime.now()
        d["download"] = {
            "start_time": t2.timestamp(),
            "end_time": t3.timestamp(),
            "time_taken": (t3 - t2).seconds
        }
        t4 = datetime.now()
        await app.send_document(
            chat_id=message.chat.id,
            document=filename,
            caption="Pyrogram",
            reply_to_message_id=message.id
        )
        t5 = datetime.now()
        d["upload"] = {
            "start_time": t4.timestamp(),
            "end_time": t5.timestamp(),
            "time_taken": (t5 - t4).seconds
        }
        os.remove(filename)
    print(dumps(d, indent=2))


# We need a loop to work with
loop = asyncio.get_event_loop()
# Then, we need to run the loop with a task
loop.run_until_complete(main())
