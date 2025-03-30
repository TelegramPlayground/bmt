using System.Reflection;
using System.Text.Json;
using TL;

// NOTE: For reliable measurements, the session file WTelegram.session should be conserved between runs.

using var client = new WTelegram.Client(Environment.GetEnvironmentVariable);
await client.LoginBotIfNeeded();
var mcm = await client.GetMessageByLink(Environment.GetEnvironmentVariable("MESSAGE_LINK"));
if (mcm.messages[0] is not Message { media: MessageMediaDocument { document: Document document } } msg)
	return 1; // failed to find document to download
WTelegram.Helpers.Log = (l, s) => { };
var peer = mcm.UserOrChat(msg.peer_id).ToInputPeer();
var ms = new MemoryStream((int)document.size);

var dstart = DateTimeOffset.UtcNow;
await client.DownloadFileAsync(document, ms);
var dend = DateTimeOffset.UtcNow;

ms.Position = 0;

var ustart = DateTimeOffset.UtcNow;
var uploadedFile = await client.UploadFileAsync(ms, "WTelegramClient.bin");
_ = client.SendMediaAsync(peer, "", uploadedFile, reply_to_msg_id: msg.id);
var uend = DateTimeOffset.UtcNow;

var data = new
{
	version = typeof(WTelegram.Client).Assembly.GetCustomAttribute<AssemblyInformationalVersionAttribute>()?.InformationalVersion?.Split('+')[0],
	layer = Layer.Version,
	file_size = document.size,
	download = new {
		start_time = dstart.ToUnixTimeMilliseconds() / 1000.0,
		end_time = dend.ToUnixTimeMilliseconds() / 1000.0,
		time_taken = (dend - dstart).TotalSeconds,
		avg_speed = $"{document.size / (dend - dstart).TotalSeconds / 1024 / 1024:N2} MB/s",
	},
	upload = new {
		start_time = ustart.ToUnixTimeMilliseconds() / 1000.0,
		end_time = uend.ToUnixTimeMilliseconds() / 1000.0,
		time_taken = (uend - ustart).TotalSeconds,
		avg_speed = $"{document.size / (uend - ustart).TotalSeconds / 1024 / 1024:N2} MB/s",
	}
};
File.WriteAllText("../../out/wtelegramclient.json", JsonSerializer.Serialize(data, new JsonSerializerOptions { WriteIndented = true }));
return 0;
