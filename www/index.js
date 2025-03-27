
const themeToggle = document.getElementById("themeToggle");
const prefersDark = window.matchMedia("(prefers-color-scheme: dark)");
const loadingScreen = document.querySelector(".loading-screen");
let isDark = prefersDark.matches;

function updateTheme() {
  document.body.setAttribute("data-theme", isDark ? "dark" : "light");
  themeToggle.innerHTML = isDark
    ? '<i class="ti ti-sun"></i>'
    : '<i class="ti ti-moon"></i>';

  document.querySelector(".stars").style.display = isDark ? "block" : "none";
}

themeToggle.addEventListener("click", () => {
  isDark = !isDark;
  updateTheme();
});

loadingScreen.classList.add("hidden");

updateTheme();
