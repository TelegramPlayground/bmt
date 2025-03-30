## eXperiment: Testing Telegram Download Upload Speed using Different Client Libraries

## How ?

- Login using Telegram `APP_ID`, `API_HASH`, `BOT_TOKEN`.
- Configure the client library.
    - `TG_SESSION` is only used by the gogram and pyrogram libraries at the moment. [**Why**](https://t.me/TG_Lore/22)
    - `FLOOD_WAIT_SLEEP_TIME`: to automatically sleep for longer time to avoid `FLOOD_*_WAIT_` from Telegram. This is only used by the pyrogram, telethon, grammers and mtkruto libraries.
    - Rewrite [abandoned fork import](https://github.com/TelegramPlayGround/bmt/blob/dacbca3/.github/workflows/hydrogram.yml#L31) names, if required.
    - Add [boost capability](https://github.com/TelegramPlayGround/bmt/blob/ed7f6ae/scripts/python/p2.py#L40) if required by the library.
- Get a 2GB Telegram Message using `MESSAGE_LINK`.
- Download the message.
- Calculate time.
- Upload the saved file to the same chat.
- Calculate time.
- Logout from Telegram. (ideally, but currently this is not done by the scripts.)
- Write to the appropriate file in the `outputs` directory.

## Motivation

- [This Telegram Chat](https://t.me/gogrammers/703819)

## Actions Secrets used in this Repository

![](https://is.gd/IkAgCs)

## Credits

- [GoGram](https://github.com/AmarnathCJD)
- [Pyrogram](https://github.com/delivrance)
- [Telethon](https://github.com/Lonami)
- [PyTDBot](https://github.com/AYMENJD/tdjson)
- [MadeLineProto](https://github.com/danog)
- [grammers](https://github.com/Lonami)
- [MTKruto](https://github.com/rojvv)
- [mtcute](https://github.com/teidesu)
- [WTelegramClient](https://github.com/wiz0u/WTelegramClient)
