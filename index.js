const libs = [
    {
        name: "telethon",
        repo: "https://github.com/LonamiWebs/Telethon"
    },
    {
        name: "pyrogram",
        repo: "https://github.com/pyrogram/pyrogram",
    },
    {
        name: "gogram",
        repo: "https://github.com/amarnathcjd/gogram",
    },
    {
        name: "hydrogram",
        repo: "https://github.com/hydrogram/hydrogram",
    },
    {
        name: "pyrotgfork",
        repo: "https://github.com/TelegramPlayGround/pyrogram",
    },
    {
        name: "kurigram",
        repo: "https://github.com/KurimuzonAkuma/pyrogram",
    },
    {
        name: "pyrofork",
        repo: "https://github.com/Mayuri-Chan/pyrofork",
    },
    {
        name: "pyroblack",
        repo: "https://github.com/eyMarv/pyroblack/",
    },
];

function formatSpeed(bytes, seconds) {
    const mbps = (bytes / 1024 / 1024 / seconds).toFixed(2);
    return `${mbps} MB/s`;
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

    return `
<div class="card" style="animation-delay: ${index * 0.1}s">
${positionBadge}
<div class="card-header">
<i class="ti ti-brand-telegram"></i>
<div class="client-info">
  <div class="client-title">
    <h3>${lib.name}</h3>
    <a href="${lib.repo}" target="_blank" class="github-link" title="View on GitHub">
      <i class="ti ti-brand-github"></i>
    </a>
  </div>
  <div class="client-meta">v${data.version.replace("v", "")} • Layer ${data.layer}</div>
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

    try {
        const results = await Promise.all(
            libs.map(lib =>
                fetch(`https://github.com/TelegramPlayGround/bmt/raw/master/outputs/${lib.name}.json`)
                    .then(res => res.json())
                    .then(data => ({ lib, data }))
            )
        );

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
    } catch (error) {
        app.innerHTML = `
<div class="error" style="grid-column: 1 / -1; text-align: center; padding: 2rem; color: var(--error);">
<i class="ti ti-alert-triangle" style="font-size: 2rem; margin-bottom: 1rem;"></i>
<p>Failed to load benchmark data. Please try again later.</p>
</div>
`;
        loadingScreen.classList.add("hidden");
        console.error("Error fetching client data:", error);
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
