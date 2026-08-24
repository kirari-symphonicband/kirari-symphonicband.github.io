// ==================================================
// Kirariシンフォニックバンドひろしま
// Common JavaScript
// ==================================================

// ==================================================
// SLIDESHOW
// ==================================================

// スライドショーで使用する画像
// 画像を追加・変更する場合はここだけ編集してください。

const SLIDESHOW_IMAGE_PATHS = [
  "images/slideshow/photo1.jpeg",
  "images/slideshow/photo2.jpeg",
  "images/slideshow/photo3.jpeg",
  "images/slideshow/photo4.jpeg",
  "images/slideshow/photo5.jpeg"
];


// 自動スライドの切り替え時間
const SLIDESHOW_INTERVAL = 5000;

// ==================================================
// MOBILE MENU
// ==================================================

const menuButton =
  document.querySelector(".menu-button");

const globalNav =
  document.querySelector(".global-nav");


// ==================================================
// MENU BUTTON
// ==================================================

if (menuButton && globalNav) {

  menuButton.addEventListener(
    "click",
    () => {

      const isOpen =
        globalNav.classList.toggle(
          "is-open"
        );


      menuButton.setAttribute(
        "aria-expanded",
        String(isOpen)
      );

    }
  );

  // ==================================================
  // MENU LINK
  // メニュー内のリンクを押したら自動的に閉じる
  // ==================================================

  globalNav
    .querySelectorAll("a")
    .forEach((link) => {

      link.addEventListener(
        "click",
        () => {

          globalNav.classList.remove(
            "is-open"
          );

          menuButton.setAttribute(
            "aria-expanded",
            "false"
          );

        }
      );

    });
}

// ==================================================
// TOP NEWS
// トップページのNEWSを読み込んで表示
// ==================================================

const topNewsList =
  document.querySelector("#news-list");


async function loadTopNews() {

  // トップページ以外では何もしない
  if (!topNewsList) {
    return;
  }


  try {

    // ==================================================
    // NEWS設定ファイルを読み込む
    // ==================================================

    const response =
      await fetch("data/news.txt");



    if (!response.ok) {

      throw new Error(
        "NEWS設定ファイルを読み込めませんでした。"
      );

    }

    const text =
      await response.text();


    // ==================================================
    // [TOP] セクションを取得
    // ==================================================

    const topSectionMatch =
      text.match(
        /\[TOP\]([\s\S]*?)(?=\[ALL\]|$)/
      );

    if (!topSectionMatch) {

      throw new Error(
        "news.txt に [TOP] セクションがありません。"
      );

    }

    const newsFiles =
      topSectionMatch[1]

        .split(/\r?\n/)

        .map(line => line.trim())

        .filter(line => line !== "");



    // NEWSが0件の場合
    if (newsFiles.length === 0) {

      topNewsList.innerHTML = "";

      return;

    }



    // ==================================================
    // NEWS HTMLを読み込む
    // ==================================================

    const newsItems =
      await Promise.all(

        newsFiles.map(
          async (file) => {

            const response =
              await fetch(
                `news/${file}`
              );


            if (!response.ok) {

              throw new Error(
                `ニュースを読み込めませんでした: ${file}`
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
    // NEWS HTML生成
    // ==================================================

    topNewsList.innerHTML =

      newsItems

        .map(
          (item) => {

            const parser =
              new DOMParser();


            const newsDocument =
              parser.parseFromString(
                item.html,
                "text/html"
              );


            const article =
              newsDocument.querySelector(
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


            // NEWS記事ページへのリンク
            const url =
              `news/${item.file}`;


            return `

              <a
                href="${url}"
                class="news-item"
              >

                <time
                  datetime="${date.replace(
              /\./g,
              "-"
            )}"
                >
                  ${date}
                </time>

                <span
                  class="news-category"
                >
                  ${category}
                </span>

                <span
                  class="news-title"
                >
                  ${title}
                </span>

                <span
                  class="news-arrow"
                >
                  ›
                </span>

              </a>

            `;

          }
        )

        .join("");


  } catch (error) {

    console.error(
      "トップページNEWS読み込みエラー:",
      error
    );


    topNewsList.innerHTML = `

      <p class="news-error">
        お知らせを読み込めませんでした。
      </p>

    `;

  }

}


// ==================================================
// TOP NEWS START
// ==================================================

loadTopNews();


// ==================================================
// SLIDESHOW
// ==================================================

const slideshow =
  document.querySelector("#slideshow");


const slideshowImage =
  document.querySelector(
    "#slideshow-image"
  );


const slideshowPlaceholder =
  document.querySelector(
    "#slideshow-placeholder"
  );


const slideshowPrev =
  document.querySelector(
    ".slideshow-prev"
  );


const slideshowNext =
  document.querySelector(
    ".slideshow-next"
  );


// 実際に存在する画像だけを格納
let slideshowImages = [];


// 現在表示している画像番号
let currentSlide = 0;


// 自動スライド用タイマー
let slideshowTimer = null;


// ==================================================
// IMAGE CHECK
// 画像の存在確認
// ==================================================

function checkImageExists(src) {

  return new Promise(
    (resolve) => {

      const image =
        new Image();


      image.onload = () => {

        resolve(true);

      };


      image.onerror = () => {

        resolve(false);

      };


      image.src = src;

    }
  );

}


// ==================================================
// SLIDESHOW INITIALIZE
// ==================================================

async function initializeSlideshow() {

  // スライドショーが存在しないページでは終了
  if (
    !slideshow ||
    !slideshowImage ||
    !slideshowPlaceholder
  ) {

    return;

  }


  // ==================================================
  // 存在する画像を確認
  // ==================================================

  const results =
    await Promise.all(

      SLIDESHOW_IMAGE_PATHS.map(
        async (src) => {

          const exists =
            await checkImageExists(
              src
            );


          return {
            src: src,
            exists: exists
          };

        }
      )

    );


  slideshowImages =
    results

      .filter(
        (item) => item.exists
      )

      .map(
        (item) => item.src
      );


  // ==================================================
  // 画像が1枚もない場合
  // ==================================================

  if (
    slideshowImages.length === 0
  ) {

    slideshowImage.style.display =
      "none";


    slideshowPlaceholder.style.display =
      "flex";


    if (slideshowPrev) {

      slideshowPrev.disabled =
        true;

    }


    if (slideshowNext) {

      slideshowNext.disabled =
        true;

    }


    return;

  }


  // ==================================================
  // 画像がある場合
  // ==================================================

  slideshowPlaceholder.style.display =
    "none";


  slideshowImage.style.display =
    "block";


  // 最初の画像を表示
  slideshowImage.src =
    slideshowImages[0];


  slideshowImage.classList.remove(
    "is-changing"
  );


  // ==================================================
  // 画像が2枚以上ある場合
  // ==================================================

  if (
    slideshowImages.length > 1
  ) {

    if (slideshowPrev) {

      slideshowPrev.disabled =
        false;

    }


    if (slideshowNext) {

      slideshowNext.disabled =
        false;

    }


    startSlideshowTimer();

  } else {

    if (slideshowPrev) {

      slideshowPrev.disabled =
        true;

    }


    if (slideshowNext) {

      slideshowNext.disabled =
        true;

    }

  }

}


// ==================================================
// SHOW SLIDE
// スライド表示
// ==================================================

function showSlide(index) {

  if (
    !slideshowImage ||
    slideshowImages.length === 0
  ) {

    return;

  }


  // ==================================================
  // 次の画像番号を決定
  // ==================================================

  if (
    index >= slideshowImages.length
  ) {

    currentSlide = 0;

  } else if (
    index < 0
  ) {

    currentSlide =
      slideshowImages.length - 1;

  } else {

    currentSlide = index;

  }


  // ==================================================
  // フェードアウト
  // ==================================================

  slideshowImage.classList.add(
    "is-changing"
  );


  // ==================================================
  // 画像変更
  // ==================================================

  setTimeout(
    () => {

      slideshowImage.src =
        slideshowImages[
        currentSlide
        ];


      // 新しい画像の読み込み完了後
      // フェードイン
      slideshowImage.onload =
        () => {

          slideshowImage.classList.remove(
            "is-changing"
          );

        };

    },
    300
  );

}


// ==================================================
// PREVIOUS SLIDE
// 前の写真
// ==================================================

if (slideshowPrev) {

  slideshowPrev.addEventListener(
    "click",
    () => {

      if (
        slideshowImages.length <= 1
      ) {

        return;

      }


      showSlide(
        currentSlide - 1
      );


      resetSlideshowTimer();

    }
  );

}


// ==================================================
// NEXT SLIDE
// 次の写真
// ==================================================

if (slideshowNext) {

  slideshowNext.addEventListener(
    "click",
    () => {

      if (
        slideshowImages.length <= 1
      ) {

        return;

      }


      showSlide(
        currentSlide + 1
      );


      resetSlideshowTimer();

    }
  );

}


// ==================================================
// START SLIDESHOW TIMER
// ==================================================

function startSlideshowTimer() {

  clearInterval(
    slideshowTimer
  );


  slideshowTimer =
    setInterval(
      () => {

        if (
          slideshowImages.length > 1
        ) {

          showSlide(
            currentSlide + 1
          );

        }

      },
      SLIDESHOW_INTERVAL
    );

}


// ==================================================
// RESET SLIDESHOW TIMER
// ==================================================

function resetSlideshowTimer() {

  if (
    slideshowImages.length <= 1
  ) {

    return;

  }


  startSlideshowTimer();

}


// ==================================================
// SLIDESHOW START
// ==================================================

initializeSlideshow();


// ==================================================
// INSTAGRAM
// 画像が存在しない場合、投稿枠を非表示
// ==================================================

document
  .querySelectorAll(
    ".instagram-item img"
  )
  .forEach(
    (img) => {

      img.addEventListener(
        "error",
        () => {

          const item =
            img.closest(
              ".instagram-item"
            );


          if (item) {

            item.remove();

          }

        }
      );

    }
  );


// ==================================================
// MEMBER
// 募集パートを外部ファイルから読み込み
// ==================================================

const memberParts =
  document.querySelector("#member-parts");


async function loadMemberParts() {

  if (!memberParts) {
    return;
  }


  try {

    const response =
      await fetch("data/member.txt");


    if (!response.ok) {

      throw new Error(
        "member.txt を読み込めませんでした。"
      );

    }


    const text =
      await response.text();


    const match =
      text.match(
        /\[PARTS\]([\s\S]*?)(?=\[|$)/
      );


    if (!match) {

      console.error(
        "member.txt に [PARTS] がありません。"
      );

      return;

    }


    const parts =
      match[1]
        .split(/\r?\n/)
        .map(line => line.trim())
        .filter(line => line !== "");


    memberParts.innerHTML =
      parts.join("<br>");


  } catch (error) {

    console.error(
      "募集パート読み込みエラー:",
      error
    );

  }

}


loadMemberParts();


// ==================================================
// CONCERT
// 演奏会情報を concert.txt から読み込んで表示
// ==================================================

const concertList =
  document.querySelector("#concert-list");


// ==================================================
// CONCERT SETTINGS
// 今後変更する場合はここを編集
// ==================================================

const CONCERT_DATA_PATH =
  "data/concert.txt";


// ==================================================
// LOAD CONCERT
// ==================================================

async function loadConcert() {

  // 演奏会情報がないページでは何もしない
  if (!concertList) {

    return;

  }


  try {

    // ==================================================
    // concert.txt 読み込み
    // ==================================================

    const response =
      await fetch(CONCERT_DATA_PATH);


    if (!response.ok) {

      throw new Error(
        `演奏会設定ファイルを読み込めませんでした: ${response.status}`
      );

    }


    const text =
      await response.text();


    // ==================================================
    // CONCERT DATA PARSE
    // ==================================================

    const concerts =
      parseConcertData(text);


    // ==================================================
    // 演奏会が0件の場合
    // ==================================================

    if (concerts.length === 0) {

      concertList.innerHTML = "";

      return;

    }


    // ==================================================
    // HTML生成
    // ==================================================

    concertList.innerHTML =
      concerts
        .map(
          (concert) =>
            createConcertHTML(concert)
        )
        .join("");


  } catch (error) {

    console.error(
      "演奏会情報読み込みエラー:",
      error
    );


    concertList.innerHTML = `

      <p class="concert-error">
        演奏会情報を読み込めませんでした。
      </p>

    `;

  }

}


// ==================================================
// PARSE CONCERT DATA
// concert.txt をデータ化
// ==================================================

function parseConcertData(text) {

  const concerts = [];


  // ==================================================
  // [CONCERT] セクション取得
  // ==================================================

  const concertSectionMatch =
    text.match(
      /\[CONCERT\]([\s\S]*)/
    );


  if (!concertSectionMatch) {

    console.error(
      "concert.txt に [CONCERT] セクションがありません。"
    );

    return concerts;

  }


  const concertText =
    concertSectionMatch[1];


  // ==================================================
  // 「---」で演奏会を分割
  // ==================================================

  const blocks =
    concertText
      .split(/\r?\n---\r?\n/)
      .map(
        block => block.trim()
      )
      .filter(
        block => block !== ""
      );


  // ==================================================
  // 各演奏会を解析
  // ==================================================

  blocks.forEach(
    (block) => {

      const lines =
        block.split(/\r?\n/);


      const concert = {

        year: "",
        date: "",
        label: "",
        title: "",
        details: []

      };


      let detailMode = false;


      lines.forEach(
        (line) => {

          const trimmed =
            line.trim();


          // 空行
          if (!trimmed) {

            return;

          }


          // [DETAIL]
          if (
            trimmed === "[DETAIL]"
          ) {

            detailMode = true;

            return;

          }


          // ==================================================
          // 基本情報
          // ==================================================

          if (!detailMode) {

            const match =
              trimmed.match(
                /^([^=]+)=(.*)$/
              );


            if (!match) {

              return;

            }


            const key =
              match[1].trim();


            const value =
              match[2].trim();


            if (
              key === "year"
            ) {

              concert.year =
                value;

            }


            else if (
              key === "date"
            ) {

              concert.date =
                value;

            }


            else if (
              key === "label"
            ) {

              concert.label =
                value;

            }


            else if (
              key === "title"
            ) {

              concert.title =
                value;

            }


            return;

          }


          // ==================================================
          // 詳細情報
          // ==================================================

          const detailMatch =
            trimmed.match(
              /^([^=]+)=(.*)$/
            );


          if (!detailMatch) {

            return;

          }


          concert.details.push({

            label:
              detailMatch[1].trim(),

            value:
              detailMatch[2].trim()

          });

        }
      );


      concerts.push(
        concert
      );

    }
  );


  return concerts;

}


// ==================================================
// CREATE CONCERT HTML
// ==================================================

function createConcertHTML(
  concert
) {

  // ==================================================
  // 詳細項目
  // ==================================================

  const detailsHTML =
    concert.details
      .map(
        (detail) => {

          return `

            <p>

              <span>
                ${escapeHTML(
                  detail.label
                )}
              </span>

              ${formatConcertValue(
                detail.value
              )}

            </p>

          `;

        }
      )
      .join("");


  // ==================================================
  // 演奏会HTML
  // ==================================================

  return `

    <article class="concert-card">

      <div class="concert-date">

        <span>
          ${escapeHTML(
            concert.year
          )}
        </span>

        <strong>
          ${escapeHTML(
            concert.date
          )}
        </strong>

      </div>


      <div class="concert-content">

        ${
          concert.label
            ? `
              <p class="concert-label">
                ${escapeHTML(
                  concert.label
                )}
              </p>
            `
            : ""
        }


        ${
          concert.title
            ? `
              <h3>
                ${escapeHTML(
                  concert.title
                )}
              </h3>
            `
            : ""
        }


        ${
          concert.details.length > 0
            ? `
              <div class="concert-details">

                ${detailsHTML}

              </div>
            `
            : ""
        }

      </div>

    </article>

  `;

}


// ==================================================
// CONCERT VALUE
// 改行を含む場合にも対応
// ==================================================

function formatConcertValue(
  value
) {

  return escapeHTML(
    value
  ).replace(
    /\r?\n/g,
    "<br>"
  );

}


// ==================================================
// HTML ESCAPE
// concert.txt の内容を安全に表示
// ==================================================

function escapeHTML(
  value
) {

  return String(value)
    .replace(
      /&/g,
      "&amp;"
    )
    .replace(
      /</g,
      "&lt;"
    )
    .replace(
      />/g,
      "&gt;"
    )
    .replace(
      /"/g,
      "&quot;"
    )
    .replace(
      /'/g,
      "&#039;"
    );

}


// ==================================================
// CONCERT START
// ==================================================

loadConcert();