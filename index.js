const libs = [
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
];

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
function formatSpeed(bytes, seconds, si = false, dp = 2) {
    if (!bytes) {
        return "";
    }
    const thresh = si ? 1000 : 1024;

    if (Math.abs(bytes) < thresh) {
        return (bytes / seconds).toFixed(dp) + " B/s";
    }

    bytes = bytes / seconds;

    const units = si
        ? ['KiB', 'MiB', 'GiB', 'TiB', 'PiB', 'EiB', 'ZiB', 'YiB']
        : ['KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    let u = -1;
    const r = 10 ** dp;

    do {
        bytes /= thresh;
        ++u;
    } while (
        Math.round(Math.abs(bytes) * r) / r >= thresh && u < units.length - 1
    );

    return "" + (bytes).toFixed(dp) + " " + units[u] + "/s";
}

function calculateScore(data) {
    const downloadSpeed = data.file_size / data.download.time_taken;
    const uploadSpeed = data.file_size / data.upload.time_taken;
    return (downloadSpeed + uploadSpeed) / 2;
}

function createClientCard(data, lib, index, position) {
    const downloadSpeed = formatSpeed(data.file_size, data.download.time_taken);
    const uploadSpeed = formatSpeed(data.file_size, data.upload.time_taken);
    const positionBadge = `<div class="position-badge">#${position}</div>`;

    let clientMeta = `<div class="client-meta">v${data.version.replace("v", "")} • Layer ${data.layer}</div>`;
    if (lib.name === "pytdbot") {
        clientMeta = `<div class="client-meta">v${data.version} • TDLib ${data.layer}</div>`;
    }

    return `
<div class="card" style="animation-delay: ${index * 0.1}s">
${positionBadge}
<div class="card-header">
<i class="ti ti-brand-${lib.language}"></i>
<div class="client-info">
  <div class="client-title">
    <h3>${lib.display}</h3>
    <a href="${lib.repo}" target="_blank" class="github-link" title="View on GitHub">
      <i class="ti ti-brand-github"></i>
    </a>
  </div>
  ${clientMeta}
</div>
</div>
<div class="stats">
<div class="stat stat-download">
  <div class="stat-header">
    <i class="ti ti-download"></i>
    <span>Download</span>
  </div>
  <span class="stat-value">${downloadSpeed}</span>
</div>
<div class="stat stat-upload">
  <div class="stat-header">
    <i class="ti ti-upload"></i>
    <span>Upload</span>
  </div>
  <span class="stat-value">${uploadSpeed}</span>
</div>
</div>
</div>
`;
}

async function fetchClientData() {
    const app = document.getElementById("app");
    const loadingScreen = document.querySelector(".loading-screen");

    const invalidResults = await Promise.all(
        libs.map(async lib => {
            try {
                const res = await fetch(`https://raw.githubusercontent.com/TelegramPlayGround/bmt/master/outputs/${lib.name}.json`);
                const data = await res.json();
                return { lib, data, error: null };
            }
            catch (error) {
                console.error(`Error processing ${lib.name}:`, error);
                return { lib, data: null, error: error.message };
            }
        })
    );

    const results = invalidResults.filter(result => result.data !== null);

    if (results.length !== 0) {
        const sortedResults = results
            .map(result => ({
                ...result,
                score: calculateScore(result.data)
            }))
            .sort((a, b) => b.score - a.score);

        app.innerHTML = sortedResults
            .map(({ lib, data }, index) => createClientCard(data, lib, index, index + 1))
            .join("");

        setTimeout(() => {
            loadingScreen.classList.add("hidden");
        }, 500);
    }
    else {
        app.innerHTML = `
            <div class="error" style="grid-column: 1 / -1; text-align: center; padding: 2rem; color: var(--error);">
            <i class="ti ti-alert-triangle" style="font-size: 2rem; margin-bottom: 1rem;"></i>
            <p>Failed to load benchmark data. Please try again later.</p>
            </div>
            `;
        loadingScreen.classList.add("hidden");
    }
}

const themeToggle = document.getElementById("themeToggle");
const prefersDark = window.matchMedia("(prefers-color-scheme: dark)");
let isDark = prefersDark.matches;

function updateTheme() {
    document.body.setAttribute("data-theme", isDark ? "dark" : "light");
    themeToggle.innerHTML = isDark ?
        '<i class="ti ti-sun"></i>' :
        '<i class="ti ti-moon"></i>';

    document.querySelector(".stars").style.display = isDark ? "block" : "none";
}

themeToggle.addEventListener("click", () => {
    isDark = !isDark;
    updateTheme();
});

updateTheme();
fetchClientData();
