// ==================================================
// News List
// /news/ 内のHTMLファイルを読み込んで表示
// ==================================================

const newsList = document.querySelector("#news-all-list");


// 新しい順にファイル名を記載
const newsFiles = [
  "2026-08-20.html"
];


async function loadAllNews() {

  if (!newsList) {
    return;
  }

  if (newsFiles.length === 0) {
    newsList.innerHTML = "";
    return;
  }


  try {

    const newsItems = await Promise.all(

      newsFiles.map(async (file) => {

        const response = await fetch(
          `./${file}`
        );

        if (!response.ok) {
          throw new Error(
            `ニュースを読み込めませんでした: ${file}`
          );
        }

        const html = await response.text();

        return {
          file: file,
          html: html
        };

      })

    );


    newsList.innerHTML = newsItems

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
          return "";
        }


        const date =
          article.dataset.date || "";

        const category =
          article.dataset.category || "";

        const title =
          article.dataset.title || "";

        const url =
          article.dataset.url || item.file;


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

    console.error(error);

    newsList.innerHTML = `

      <p class="news-error">
        お知らせを読み込めませんでした。
      </p>

    `;

  }

}


loadAllNews();