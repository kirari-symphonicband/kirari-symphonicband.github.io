// ==================================================
// Kirariシンフォニックバンドひろしま
// NEWS JavaScript
// ==================================================

// ==================================================
// NEWS LIST
// ==================================================

const allNewsList = document.querySelector("#news-all-list");

// ==================================================
// LOAD NEWS
// ==================================================

async function loadAllNews() {

  // NEWS一覧ページ以外では何もしない
  if (!allNewsList) {
    return;
  }

  try {

    // ==================================================
    // NEWS設定ファイルを読み込む
    // ==================================================

    const response = await fetch("../data/news.txt");

    if (!response.ok) {
      throw new Error(
        "NEWS設定ファイルを読み込めませんでした。"
      );
    }

    const text = await response.text();

    // ==================================================
    // [ALL] セクションを取得
    // ==================================================

    const allSectionMatch = text.match(
      /\[ALL\]([\s\S]*?)$/
    );

    if (!allSectionMatch) {
      throw new Error(
        "news.txt に [ALL] セクションがありません。"
      );
    }

    const newsFiles = allSectionMatch[1]
      .split(/\r?\n/)
      .map(line => line.trim())
      .filter(line => line !== "");

    // NEWSが0件の場合
    if (newsFiles.length === 0) {
      allNewsList.innerHTML = "";
      return;
    }

    // ==================================================
    // NEWS HTMLを読み込む
    // ==================================================

    const newsItems = await Promise.all(
      newsFiles.map(
        async (file) => {

          const url = `../news/${file}`;

          console.log(
            "ニュース読み込み:",
            url
          );

          const response = await fetch(url);

          if (!response.ok) {
            throw new Error(
              `HTTP ${response.status}: ${url}`
            );
          }

          const html = await response.text();

          return {
            file: file,
            html: html
          };

        }
      )
    );

    // ==================================================
    // HTML生成
    // ==================================================

    allNewsList.innerHTML = newsItems
      .map(item => {

        const parser = new DOMParser();

        const document = parser.parseFromString(
          item.html,
          "text/html"
        );

        const article = document.querySelector(
          ".news-data"
        );

        if (!article) {
          console.error(
            `${item.file} に .news-data がありません。`
          );
          return "";
        }

        const date = article.dataset.date || "";
        const category = article.dataset.category || "";
        const title = article.dataset.title || "";
        const url = article.dataset.url || item.file;

        return `
          <a
            href="./${url}"
            class="news-page-item"
          >
            <time
              datetime="${date.replace(/\./g, "-")}"
            >
              ${date}
            </time>
            <span class="news-page-category">
              ${category}
            </span>
            <span class="news-page-title">
              ${title}
            </span>
            <span class="news-page-arrow">
              ›
            </span>
          </a>
        `;

      })
      .join("");

  } catch (error) {

    console.error(
      "NEWS一覧読み込みエラー:",
      error
    );

    allNewsList.innerHTML = `
      <p class="news-error">
        お知らせを読み込めませんでした。
      </p>
    `;

  }

}

// ==================================================
// START
// ==================================================

loadAllNews();