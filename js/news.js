// ==================================================
// Kirariシンフォニックバンドひろしま
// NEWS JavaScript
// ==================================================

// ==================================================
// SETTINGS
// ==================================================

// ------------------------------
// NEWS
// ------------------------------

// NEWS一覧に表示するファイル
// 新しいニュースを追加したら、ここに追加してください。
// 上から新しい順に記載します。

const NEWS_FILES = [
  "2026-08-20.html"
];


// ==================================================
// NEWS LIST
// ==================================================

const newsList =
  document.querySelector("#news-all-list");


// ==================================================
// LOAD NEWS
// ==================================================

async function loadAllNews() {

  // NEWS一覧ページ以外では何もしない
  if (!newsList) {

    return;

  }


  // NEWSが0件の場合
  if (NEWS_FILES.length === 0) {

    newsList.innerHTML = "";

    return;

  }


  try {

    const newsItems =
      await Promise.all(

        NEWS_FILES.map(
          async (file) => {

            // /news/index.html から
            // 同じ /news/ 内のHTMLを読み込む
            const url =
              new URL(
                file,
                window.location.href
              ).href;


            console.log(
              "ニュース読み込み:",
              url
            );


            const response =
              await fetch(url);


            if (!response.ok) {

              throw new Error(
                `HTTP ${response.status}: ${url}`
              );

            }


            const html =
              await response.text();


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

    newsList.innerHTML =

      newsItems

        .map(item => {

          const parser =
            new DOMParser();


          const document =
            parser.parseFromString(
              item.html,
              "text/html"
            );


          const article =
            document.querySelector(
              ".news-data"
            );


          if (!article) {

            console.error(
              `${item.file} に .news-data がありません。`
            );

            return "";

          }


          const date =
            article.dataset.date || "";


          const category =
            article.dataset.category || "";


          const title =
            article.dataset.title || "";


          // ニュースHTML側に
          // data-url があればそれを使用
          const url =
            article.dataset.url ||
            item.file;


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
      "NEWS読み込みエラー:",
      error
    );


    newsList.innerHTML = `

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