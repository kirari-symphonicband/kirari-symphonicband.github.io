// ==================================================
// News List
// /news/ 内のHTMLファイルを読み込んで表示
// ==================================================

const newsList =
  document.querySelector("#news-all-list");


const newsFiles = [
  "2026-08-20.html"
];


async function loadAllNews() {

  if (!newsList) {

    console.error(
      "#news-all-list が見つかりません。"
    );

    return;

  }


  try {

    const newsItems = await Promise.all(

      newsFiles.map(async (file) => {

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

      })

    );


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


loadAllNews();