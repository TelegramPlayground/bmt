import { minify } from "@minify-html/deno";

interface Library {
  name: string;
  repo: string;
  display: string;
  language: string;
}

const libs: Array<Library> = [
  {
    name: "telethon",
    repo: "https://github.com/LonamiWebs/Telethon",
    display: "Telethon",
    language: "python",
  },
  {
    name: "pyrogram",
    repo: "https://github.com/pyrogram/pyrogram",
    display: "Pyrogram",
    language: "python",
  },
  {
    name: "gogram",
    repo: "https://github.com/amarnathcjd/gogram",
    display: "GoGram",
    language: "golang",
  },
  {
    name: "hydrogram",
    repo: "https://github.com/hydrogram/hydrogram",
    display: "Hydrogram",
    language: "python",
  },
  {
    name: "pyrotgfork",
    repo: "https://github.com/TelegramPlayGround/pyrogram",
    display: "PyroTGFork",
    language: "python",
  },
  {
    name: "kurigram",
    repo: "https://github.com/KurimuzonAkuma/pyrogram",
    display: "kurigram",
    language: "python",
  },
  {
    name: "pyrofork",
    repo: "https://github.com/Mayuri-Chan/pyrofork",
    display: "pyrofork",
    language: "python",
  },
  {
    name: "pyroblack",
    repo: "https://github.com/eyMarv/pyroblack/",
    display: "pyroblack",
    language: "python",
  },
  {
    name: "pytdbot",
    repo: "https://github.com/pytdbot/client",
    display: "PyTDBot",
    language: "cpp",
  },
  {
    name: "madelineproto",
    repo: "https://github.com/danog/MadelineProto",
    display: "MadeLineProto",
    language: "php",
  },
  {
    name: "grammers",
    repo: "https://github.com/Lonami/grammers",
    display: "grammers",
    language: "rust",
  },
  {
    name: "pyrogrammod",
    repo: "https://github.com/PyrogramMod/PyrogramMod",
    display: "PyrogramMod",
    language: "python",
  },
  {
    name: "mtkruto",
    repo: "https://github.com/MTKruto/MTKruto",
    display: "MTKruto",
    language: "deno",
  },
  {
    name: "mtcute",
    repo: "https://github.com/mtcute/mtcute",
    display: "mtcute",
    language: "typescript",
  },
  {
    name: "wtelegramclient",
    repo: "https://github.com/mtcute/mtcute",
    display: "WTelegramClient",
    language: "c-sharp",
  },
];

interface ActionData {
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
};

/**
 * Format bytes as human-readable text.
 *
 * @param bytes Number of bytes.
 * @param si True to use metric (SI) units, aka powers of 1000. False to use
 *           binary (IEC), aka powers of 1024.
 * @param dp Number of decimal places to display.
 *
 * @return Formatted string.
 *
 * https://stackoverflow.com/a/14919494/4723940
 */
function formatSpeed(bytes: number, seconds: number, si: boolean = false, dp: number = 2) {
  if (!bytes) {
    return "";
  }
  const thresh = si ? 1000 : 1024;

  if (Math.abs(bytes) < thresh) {
    return `${(bytes / seconds).toFixed(dp)} B/s`;
  }

  bytes = bytes / seconds;

  const units = si
    ? ["KiB", "MiB", "GiB", "TiB", "PiB", "EiB", "ZiB", "YiB"]
    : ["KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];
  let u = -1;
  const r = 10 ** dp;

  do {
    const tmpbytes = bytes / thresh;
    if (Math.round(tmpbytes) <= 0) {
      break;
    }
    bytes = tmpbytes;
    ++u;
  } while (
    Math.round(Math.abs(bytes) * r) / r >= thresh &&
    u < units.length - 1
  );
  if (u === -1) {
    return `${bytes.toFixed(dp)} Bytes/s`;
  }
  return `${bytes.toFixed(dp)} ${units[u]}/s`;
}

function calculateScore(data: ActionData) {
  const downloadSpeed = data.file_size / data.download.time_taken;
  const uploadSpeed = data.file_size / data.upload.time_taken;
  return (downloadSpeed + uploadSpeed) / 2;
}

function createClientCard(data: ActionData, lib: Library, index: number, position: number) {
  const downloadSpeed = formatSpeed(data.file_size, data.download.time_taken);
  const uploadSpeed = formatSpeed(data.file_size, data.upload.time_taken);
  const positionBadge = `<div class="position-badge">#${position}</div>`;

  let clientMeta = `<div class="client-meta">v${data.version} • Layer ${data.layer}</div>`;
  if (lib.name === "pytdbot") {
    clientMeta = `<div class="client-meta">v${data.version} • TDLib ${data.layer}</div>`;
  }
  else if (lib.name === "gogram") {
    clientMeta = `<div class="client-meta">${data.version} • Layer ${data.layer}</div>`;
  }

  return `<br style="display:none;"/>
  <div class="card" style="animation-delay: ${index * 0.1}s">
  ${positionBadge}
  <div class="card-header">
  <i class="ti ti-brand-${lib.language}"></i>
  <div class="client-info">
    <div class="client-title">
      <h3>${lib.display}</h3>
      <a href="${lib.repo}" target="_blank" class="github-link" title="View on GitHub">
        <i class="ti ti-brand-github"></i>
        <p style="display:none;">&nbsp; View on GitHub &nbsp; </p>
      </a>
    </div>
    ${clientMeta}
  </div>
  </div>
  <div class="stats">
  <div class="stat stat-download">
    <p style="display:none;"> &nbsp; </p>
    <div class="stat-header">
      <i class="ti ti-download"></i>
      <span>Download</span>
    </div>
    <span class="stat-value">&nbsp; ${downloadSpeed}</span>
    <p style="display:none;"> &nbsp; </p>
  </div>
  <div class="stat stat-upload">
    <p style="display:none;"> &nbsp; </p>
    <div class="stat-header">
      <i class="ti ti-upload"></i>
      <span>Upload</span>
    </div>
    <span class="stat-value">&nbsp; ${uploadSpeed}</span>
    <p style="display:none;"> &nbsp; </p>
  </div>
  </div>
  </div>
  `;
}

async function fetchClientData() {
  const invalidResults = await Promise.all(
    libs.map(async (lib) => {
      try {
        const res = await Deno.readTextFile(
          `../out/${lib.name}.json`,
        );
        const data = JSON.parse(res.trim());
        return { lib, data, error: null };
      } catch (error) {
        console.error(`Error processing ${lib.name}:`, error);
        Deno.exit(1);
      }
    }),
  );

  const results = invalidResults.filter((result) => result.data !== null);

  if (results.length !== 0) {
    const sortedResults = results
      .map((result) => ({
        ...result,
        score: calculateScore(result.data),
      }))
      .sort((a, b) => b.score - a.score);

    const TemplateHTMLOut = sortedResults
      .map(({ lib, data }, index) =>
        createClientCard(data, lib, index, index + 1)
      )
      .join("");
    const hop = `Compare Down <i class="ti ti-download"></i> / Up <i class="ti ti-upload"></i> Load metrics across different Telegram Client libraries`;
    const luo = `Data updated at ${new Date().toString()} • <a href="https://github.com/TelegramPlayGround/bmt">View Source</a> • <a href="https://github.com/amarnathcjd">@AmarnathCJD</a>`;
    const misc = [
      `<!DOCTYPE html>`,
      `<html lang="en">`,
      `<head>`,
      `<meta charset="UTF-8" />
            <meta http-equiv="X-UA-Compatible" content="IE=edge" />
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            <!-- The above 3 meta tags *must* come first in the head; any other head content must come *after* these tags-->
            <meta name="apple-mobile-web-app-capable" content="yes" />`,
      `<title>Telegram Clients Down/Up Load Benchmark</title>`,
      `<link
            href="//fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap"
            rel="stylesheet"
            type="text/css"
          />
          <link
            href="//cdn.jsdelivr.net/npm/@tabler/icons-webfont@2.47.0/tabler-icons.min.css"
            rel="stylesheet"
            type="text/css"
          />
          <link href="./index.css" rel="stylesheet" type="text/css" />`,
      `<!-- if each site makes their own METAs, then ...?-->
          <!-- OpenGraph-->
          <meta property="og:title" content="Telegram Clients Speed Test" />
          <meta property="og:type" content="article" />
          <meta property="og:description" content="Compare Down / Up Load metrics across different Telegram Client libraries" />
      
          <!--site_verification property must be present, but could be empty (no IVBot-side verification for now?)-->
          <meta property="tg:site_verification" content="g7j8/rPFXfhyrq5q0QQV7EsYWv4=" />
          <!--published_time property must be present, but you could leave content empty if no $published_date is wanted-->
          <meta property="article:published_time" content="" />
          <meta property="article:author" content="https://t.me/DownLoadPlayGround/802" />
          <meta property="telegram:channel" content="@DownLoadPlayGround" />`,
      `</head>`,
      `<body>`,
      `<div class="loading-screen">
          <div class="loading-content">
            <div class="loading-logo">
              <i class="ti ti-loader"></i>
            </div>
            <div class="loading-progress">
              <div class="loading-progress-bar"></div>
            </div>
            <div class="loading-text"></div>
          </div>
        </div>`,
      `<div class="stars"></div>`,
      `<div class="noise"></div>`,
      `<div class="article">`,
      `<nav class="navbar">
            <div class="logo">
              <i class="ti ti-bolt"></i>
              <span>TGBench</span>
            </div>
            <button class="theme-toggle" id="themeToggle">
              <i class="ti ti-sun"></i>
            </button>
          </nav>`,
      `<header class="hero">
            <h1>Telegram Clients <span>Speed Test</span></h1>`,
      `<p>`,
      hop,
      `</p>`,
      `</header>`,
      `<article id="app" class="article__content">`,
      `<p style="display:none;">`,
      hop,
      `</p>`,
      TemplateHTMLOut,
      `<p style="display:none;">`,
      luo,
      `</p>`,
      `</article>`,
      `<footer class="footer">`,
      `<b><p>`,
      luo,
      `</p></b>`,
      `</footer>`,
      `</div>`,
      `<script type="text/javascript" src="./index.js"></script>`,
      `</body>`,
      `</html>`,
    ];
    const output = misc.join("\n");

    const encoder = new TextEncoder();
    const decoder = new TextDecoder();

    const minified = decoder.decode(minify(encoder.encode(output), { keep_spaces_between_attributes: true, keep_comments: true }));
    Deno.writeTextFileSync("./index.html", minified);
  }
  else {
    console.error("Failed to load benchmark data. Please try again later.");
    Deno.exit(1);
  }
}

fetchClientData();
