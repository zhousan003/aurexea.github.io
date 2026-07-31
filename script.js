const viewLinks = document.querySelectorAll("[data-view-link]");
const views = document.querySelectorAll("[data-view]");
const goButtons = document.querySelectorAll("[data-goto]");
const donateDialog = document.querySelector("[data-donate-dialog]");
const downloadButtons = document.querySelectorAll("[data-start-download]");
const downloadCountNode = document.querySelector("[data-download-count]");
const visitTodayNode = document.querySelector("[data-visit-today]");
const downloadTodayNode = document.querySelector("[data-download-today]");

const state = {
  visitsToday: 2418,
  downloadsToday: 326,
  productDownloads: 1286,
};

function formatNumber(value) {
  return new Intl.NumberFormat("en-US").format(value);
}

function showView(name) {
  views.forEach((view) => {
    view.classList.toggle("is-visible", view.dataset.view === name);
  });

  viewLinks.forEach((link) => {
    link.classList.toggle("is-active", link.dataset.viewLink === name);
  });

  history.replaceState(null, "", `#${name}`);
  window.scrollTo({ top: 0, behavior: "smooth" });
  trackPageView(name);
}

function trackPageView(name) {
  state.visitsToday += 1;
  if (visitTodayNode) {
    visitTodayNode.textContent = formatNumber(state.visitsToday);
  }
  console.info("[AurexEA analytics prototype] page_view", {
    page: name,
    date: new Date().toISOString().slice(0, 10),
  });
}

function trackDownload(product) {
  state.downloadsToday += 1;
  state.productDownloads += 1;
  if (downloadTodayNode) {
    downloadTodayNode.textContent = formatNumber(state.downloadsToday);
  }
  if (downloadCountNode) {
    downloadCountNode.textContent = formatNumber(state.productDownloads);
  }
  console.info("[AurexEA analytics prototype] download", {
    product,
    date: new Date().toISOString().slice(0, 10),
  });
}

viewLinks.forEach((link) => {
  link.addEventListener("click", (event) => {
    event.preventDefault();
    showView(link.dataset.viewLink);
  });
});

goButtons.forEach((button) => {
  button.addEventListener("click", () => {
    showView(button.dataset.goto);
  });
});

document.querySelectorAll("[data-open-donate]").forEach((button) => {
  button.addEventListener("click", () => {
    if (donateDialog && typeof donateDialog.showModal === "function") {
      donateDialog.showModal();
    }
  });
});

downloadButtons.forEach((downloadButton) => {
  const downloadResult = downloadButton.parentElement.querySelector("[data-download-result]");
  const countdownNode = downloadResult?.querySelector("[data-countdown]");

  if (!downloadButton || !downloadResult || !countdownNode) return;

  downloadButton.addEventListener("click", () => {
    let seconds = 5;
    downloadButton.disabled = true;
    downloadButton.textContent = "广告展示中...";
    downloadResult.classList.add("is-visible");
    countdownNode.textContent = String(seconds);
    downloadResult.querySelector("p").textContent = "秒后显示下载链接";

    const timer = window.setInterval(() => {
      seconds -= 1;
      countdownNode.textContent = String(seconds);
      if (seconds <= 0) {
        window.clearInterval(timer);
        downloadButton.disabled = false;
        downloadButton.textContent = "重新展示广告";
        downloadResult.innerHTML =
          '<a href="#" aria-label="Download Gold Quant Scalper MT5">下载黄金量化剥头皮 EA MT5</a>';
        trackDownload("Gold Quantum Scalper MT5");
      }
    }, 1000);
  });
});

const initialView = window.location.hash.replace("#", "") || "home";
showView(document.querySelector(`[data-view="${initialView}"]`) ? initialView : "home");
