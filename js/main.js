// ===== Mobile menu =====
const menuButton = document.querySelector(".menu-button");
const globalNav = document.querySelector(".global-nav");

if (menuButton && globalNav) {
  menuButton.addEventListener("click", () => {
    const isOpen = globalNav.classList.toggle("is-open");
    menuButton.setAttribute("aria-expanded", String(isOpen));
  });
}

// ===== News =====
// 新しいニュースを上に追加してください。
// 将来的にJSON/Markdown/CMSへ変更することもできます。
const news = [
  {
    date: "2026.08.17",
    category: "お知らせ",
    title: "ホームページを開設しました。",
    url: "#"
  },
  {
    date: "2026.08.10",
    category: "演奏会",
    title: "第○回定期演奏会のお知らせ",
    url: "#"
  },
  {
    date: "2026.07.30",
    category: "活動",
    title: "○○イベントに出演しました。",
    url: "#"
  }
];

const newsList = document.querySelector("#news-list");

if (newsList) {
  newsList.innerHTML = news.map(item => `
    <article class="news-item">
      <div class="news-date">${item.date}</div>
      <div>
        <span class="news-category">${item.category}</span>
        <a class="news-title" href="${item.url}">${item.title}</a>
      </div>
    </article>
  `).join("");
}
